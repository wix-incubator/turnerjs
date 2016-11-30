/**
 * @class bootstrap.managers.events.EventsManager
 */
define.Class("bootstrap.managers.events.EventsManager", function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits("bootstrap.managers.BaseManager");

    def.utilize([
        'bootstrap.managers.events.DispatcherToHandlersMap',
        'bootstrap.managers.events.ListenerToDispatchersMap',
        'bootstrap.managers.events.ObjectsByIds'
    ]);

    /**
     * @lends bootstrap.managers.events.EventsManager
     */
    def.methods({

        initialize: function(){
            this._listenersMapping = new this.imports.ListenerToDispatchersMap();
            this._dispatchersMapping = new this.imports.DispatcherToHandlersMap();
            this._objectsByIds = new this.imports.ObjectsByIds();
        },
        isReady: function() {
            return true;
        },

        addEventHandler: function(dispatcherId, eventType, listenerId, handlingFunction, nativeHandlerFunction, isOnce){
            if(!this._isValidObjectId(dispatcherId) || !this._isValidObjectId(listenerId)){
                return; //TODO: error
            }
            if(this.isHandlerRegistered(dispatcherId, eventType, listenerId, handlingFunction)){
                return;
            }
            var handlerObject = this._dispatchersMapping.addHandler(dispatcherId, eventType, listenerId, handlingFunction, nativeHandlerFunction, isOnce);
            this._addNativeEvent(dispatcherId, eventType, nativeHandlerFunction);
            this._listenersMapping.addHandler(listenerId, dispatcherId);
            return handlerObject;
        },

        removeEventHandler: function(dispatcherId, eventType, listenerId, handlingFunction){
            var handlerObject = this._dispatchersMapping.removeHandler(dispatcherId, eventType, listenerId, handlingFunction);
            if (!handlerObject) {
                return;
            }
            this._listenersMapping.removeHandler(listenerId, dispatcherId);
            this._removeNativeEvent(dispatcherId, eventType, handlerObject.nativeHandler);
            this._deleteObjectIfPossible(listenerId);
            this._deleteObjectIfPossible(dispatcherId);
            return handlerObject;
        },

        removeEventsForListener: function(dispatcherId, listenerId){
            var removedHandlerObjects = this._dispatchersMapping.removeListenerHandlers(dispatcherId, listenerId);
            if(removedHandlerObjects){
                this._removeNativeEvents({dispatcherId: removedHandlerObjects});
            }
            this._listenersMapping.removeListenerHandlers(listenerId, dispatcherId);
            this._deleteObjectIfPossible(listenerId);
            this._deleteObjectIfPossible(dispatcherId);

        },

        isHandlerRegistered: function(dispatcherId, eventType, listenerId, handlingFunction){
            return this._dispatchersMapping.isHandlerRegistered(dispatcherId, eventType, listenerId, handlingFunction);
        },

        dispatchEvent: function(dispatcherId, eventType, data, collectReturnedValues){
            var handlerObjects = this._dispatchersMapping.getHandlerObjects(dispatcherId, eventType);
            var eventObject = {
                type: eventType,
                data: data || {},
                returnedValues: collectReturnedValues ? [] : undefined,
                target: this.getObjectById(dispatcherId),
                isCustomEvent: true
            };

            var thisArg = {
                'self': this,
                'dispatcherId': dispatcherId,
                'eventType': eventType,
                'eventObject': eventObject,
                'collectReturnedValues': collectReturnedValues,
                'dispatcherObject': this.getObjectById(dispatcherId)
            };

            _.forEach(handlerObjects, this._callSingleHandlerAndRemoveIfOnce, thisArg);

            return eventObject;
        },

        _callSingleHandlerAndRemoveIfOnce: function(handlerObject){
            var self = this.self;
            var eventParams = this;
            var listener = self.getObjectById(handlerObject.listenerId);

            if(!eventParams.dispatcherObject.$alive){
                return false;
            }
            //the listener doesn't have to be an event dispatcher
            if(!listener || listener.$alive === false){
                return;
            }

            //we prefer to remove the handler before the execution so that id the event id triggered again it won't call the handler again
            // and we need to call getObjectById before since the remove might delete it from the map
            if(handlerObject.isOnce) {
                self.removeEventHandler(eventParams.dispatcherId, eventParams.eventType, handlerObject.listenerId, handlerObject.handler);
            }
            var returnVal = handlerObject.handler.call(listener, eventParams.eventObject);
            if(eventParams.collectReturnedValues && returnVal !== undefined){ // ToDo: add test
                eventParams.eventObject.returnedValues.push(returnVal);
            }
        },

        _filterInactiveHandlers: function(handlers){
            //TODO: filter out objects who aren't visible unless isHandlingEventsWhenNotDisplayed() == true
            return handlers;
        },

        deleteObjectFromMaps: function(objectId){
            var listeningTo = this._listenersMapping.getAllDispatcherIdsForListener(objectId);
            var removedHandlers = {};
            listeningTo.forEach(function(dispatcherId){
                removedHandlers[dispatcherId] = this._dispatchersMapping.removeListenerHandlers(dispatcherId, objectId);
                this._deleteObjectIfPossible(dispatcherId);
            }, this);

            var dispatchesTo = this._dispatchersMapping.getAllHandlerObjectsForDispatcher(objectId);
            dispatchesTo.forEach(function(handlerObject){
                this._listenersMapping.removeHandler(handlerObject.listenerId, objectId);
                this._deleteObjectIfPossible(handlerObject.listenerId);
            }, this);
            removedHandlers[objectId] = this._dispatchersMapping.deleteEntry(objectId);
            this._listenersMapping.deleteEntry(objectId);
            if(removedHandlers){
                this._removeNativeEvents(removedHandlers);
            }
            this._deleteObjectIfPossible(objectId, true);
        },

        isObjectListensOrDispatchesAnyEvents: function(objectId){
            var listensTo = this._listenersMapping.getAllDispatcherIdsForListener(objectId);
            if(listensTo && listensTo.length > 0){
                return true;
            }
            var dispatches = this._dispatchersMapping.getAllHandlerObjectsForDispatcher(objectId);
            return dispatches && dispatches.length > 0;
        },

        getAllDispatchingObjectIds: function(){
            return this._dispatchersMapping.getAllDispatcherIds();
        },

        _deleteObjectIfPossible: function(objectId, isExterminating){
            var object = this.getObjectById(objectId);
            if(!object){
                return;
            }
            var isRemovingObjectAllowed = isExterminating || !object.isRemovingFromObjectsMapOnlyUponDeath ||
                !object.isRemovingFromObjectsMapOnlyUponDeath();

            if( isRemovingObjectAllowed && !this.isObjectListensOrDispatchesAnyEvents(objectId)){
                this._listenersMapping.deleteEntry(objectId);
                this._dispatchersMapping.deleteEntry(objectId);
                this._deleteObjectFromMap(objectId);
            }
        },

        _deleteObjectFromMap: function(objectId){
            this._objectsByIds.removeObjectById(objectId);
        },

        getObjectById: function(objectId){
            return this._objectsByIds.getObjectById(objectId, true);
        },

        getObjectId: function(object){
            return  this._objectsByIds.getObjectId(object, false);
        },

        _getObjectIdIfInMap_: function(object){
            return  this._objectsByIds.getObjectIdIfInMap(object);
        },

        _isValidObjectId: function(objectId){
            return true;
        },

        _addNativeEvent: function(dispatcherId, eventType, nativeEventHandler){
            if(!nativeEventHandler){
                return;
            }
            var dispatcher = this.getObjectById(dispatcherId);
            if(!dispatcher || !dispatcher.addNativeListener){
                //TODO: warning
                return;
            }
            dispatcher.addNativeListener(eventType, nativeEventHandler);
        },
        _removeNativeEvent: function(dispatcherId, eventType, nativeEventHandler){
            if(!nativeEventHandler){
                return;
            }
            var dispatcher = this.getObjectById(dispatcherId);
            if(!dispatcher || !dispatcher.removeNativeListener){
                //TODO: warning
                return;
            }
            dispatcher.removeNativeListener(eventType, nativeEventHandler);
        },

        _removeNativeEvents: function(handlersToRemove){
            for(var dispatcherId in handlersToRemove){
                for(var eventType in handlersToRemove[dispatcherId]){
                    var handlers = handlersToRemove[dispatcherId][eventType];
                    handlers.each(function(handlerObject){
                        this._removeNativeEvent(dispatcherId, eventType, handlerObject.nativeHandler);
                    }, this);
                }
            }
        }
    });

});