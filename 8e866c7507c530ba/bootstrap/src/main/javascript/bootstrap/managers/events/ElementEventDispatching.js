define.Class('bootstrap.managers.events.ElementEventDispatching', function (classDefinition) {
    /**type@ bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    function getConditionedHandler(dispatcher, handler, mooEventsEntry) {
        var conditionedHandler = handler;
        if (mooEventsEntry.condition) {
            conditionedHandler = function (event) {
                if (mooEventsEntry.condition.call(dispatcher, event)) {
                    //the browser does call the event handler on the dispatcher scope, we want to call it on the listener..
                    return handler(event);
                }
                return true;
            };
        }
        return conditionedHandler;
    }
    function getNativeEventHandler(dispatcher, handlerFunction, mooNativeEventsEntry) {
        var nativeHandler = null;
        if (mooNativeEventsEntry) {
            if (mooNativeEventsEntry === 2) {
                nativeHandler = function (event) {
                    event = new Event(event, dispatcher.getWindow());
                    if (handlerFunction(event) === false) {
                        event.stop();
                    }
                };
            } else {
                nativeHandler = handlerFunction;
            }
        }
        return nativeHandler;
    }
    function getAllDispatchingElements() {
        var dispatchers = W.Events.getAllDispatchingObjectIds().map(function (objectId) {
            return elementFunctions.getObjectId.call(this, objectId);
        }, this);
        return dispatchers.filter(function (object) {
            return typeOf(object) == 'element';
        });

    }
	
	var elementFunctions = {
		getObjectId: function(obj, addObjectToIdsMap) {
			if (obj.$alive !== undefined && !obj.$alive) {
				//TODO: warning. access to a dead object
				return null;
			}
			return  W.Events._objectsByIds.getObjectId(obj, addObjectToIdsMap);
		},

        removeElementFromEventsMap: function(element){
            var dispatcherId = this.getObjectId(element, true);
            //will remove the native events as well
            W.Events.deleteObjectFromMaps(dispatcherId);
        }
	};
	
    def.methods({
        initialize:function () {
            [Element, Window, Document].invoke('implement', {
                $alive:true,

                getEventsSysId:function () {
                    return this._getObjectId(this, false);
                },
                _getObjectId: elementFunctions.getObjectId,

                once: function (eventType, listener, handler) {
                    this.on(eventType, listener, handler, true);
                },

                /**
                 *
                 * @param eventType
                 * @param listener
                 * @param handler
                 * @param [isOnce] call once instead.
                 * @returns {*}
                 */
                on:function (eventType, listener, handler, isOnce) {
                    var listenerId = this._getObjectId(listener, true);
                    var dispatcherId = this._getObjectId(this, true);
                    if(!listenerId || !dispatcherId){
                        console.error("you tried to register to a dead object");
                        return this;
                    }
                    var custom = Element.Events[eventType];
                    var realType = (custom && custom.base) || eventType;
                    if (W.Events.isHandlerRegistered(dispatcherId, realType, listenerId, handler)) {
                        return this;
                    }
                    var nativeHandler = function (event) {
                        handler.call(listener, event);
                    };
                    if (custom) {
                        if (custom.onAdd) {
                            custom.onAdd.call(this, handler);
                        }
                        nativeHandler = getConditionedHandler(this, nativeHandler, custom);
                    }

                    var nativeEvent = Element.NativeEvents[realType];
                    nativeHandler = getNativeEventHandler(this, nativeHandler, nativeEvent);
                    W.Events.addEventHandler(dispatcherId, realType, listenerId, handler, nativeHandler, isOnce);
                    return this;
                },

                off:function (eventType, listener, handler) {
                    var listenerId = this._getObjectId(listener, true);
                    var dispatcherId = this._getObjectId(this, true);
                    var custom = Element.Events[eventType];
                    var realType = (custom && custom.base) || eventType;
                    if (!W.Events.isHandlerRegistered(dispatcherId, realType, listenerId, handler)) {
                        return this;
                    }
                    if (custom) {
                        if (custom.onRemove) {
                            custom.onRemove.call(this, handler);
                        }
                    }
                    W.Events.removeEventHandler(dispatcherId, realType, listenerId, handler);
                    return this;
                },

                trigger:function (eventType, args) {
                    if(this.$alive !== undefined && !this.$alive){
                        console.error("you tried to trigger an event on a dead node element");
                        return;
                    }
                    var custom = Element.Events[eventType];
                    var realType = (custom && custom.base) || eventType;

                    var nativeEventEntry = Element.NativeEvents[realType];
                    if (nativeEventEntry) {
                        this._triggerNativeEvent(realType);
                    } else {
                        var dispatcherId = this._getObjectId(this, true);
                        W.Events.dispatchEvent(dispatcherId, eventType, args);
                    }
                },

                exterminate:function () {
                    var children = this.getElementsByTagName('*');
                    _.forEach(children, elementFunctions.removeElementFromEventsMap, elementFunctions);

                    elementFunctions.removeElementFromEventsMap(this);
                    this.cleanup();
                    this.destroy();
                    this.$alive = false;
                },

                /**
                 * override if needed
                 */
                isHandlingEventsWhenNotDisplayed:function () {
                    return false;
                },

                //we override this method as well so that elements won't be added to the collected map in mootools
                addNativeListener:function (type, fn) {
                    if (type == 'unload') {
                        var old = fn, self = this;
                        fn = function () {
                            self.removeNativeListener('unload', fn);
                            old();
                        };
                    }
                    if (this.addEventListener) {
                        this.addEventListener(type, fn, false);
                    }
                    else {
                        this.attachEvent('on' + type, fn);
                    }
                    return this;
                },

                removeNativeListener:function (type, fn) {
                    if (this.removeEventListener) {
                        this.removeEventListener(type, fn, false);
                    }
                    else {
                        this.detachEvent('on' + type, fn);
                    }
                    return this;
                },

                _triggerNativeEvent:function (event) {
                    var evt;
                    if (document.createEvent) {
                        // dispatch for firefox + others
                        evt = document.createEvent("HTMLEvents");
                        evt.initEvent(event, true, true); // event type,bubbling,cancelable
                        return !this.dispatchEvent(evt);
                    } else {
                        // dispatch for IE
                        //TODO: this won't work fireEvent is overriden by mootools.
                        evt = document.createEventObject();
                        return this.fireEvent('on' + event, evt);
                    }
                }
            });
            // IE purge
            if (window.attachEvent && !window.addEventListener) {
                window.addNativeListener('unload', function () {
                    getAllDispatchingElements().each(function (element) {
                        element.exterminate();
                    });
                    //Object.each(collected, clean);
                    if (window.CollectGarbage) {
                        window.CollectGarbage();
                    }
                });
            }
        }


    });
});