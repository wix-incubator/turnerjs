/**
 * please do not inherit on this, if you live in the wix html editor
 * @class bootstrap.managers.events.EventDispatcherBase
 */
define.Class("bootstrap.managers.events.EventDispatcherBase", function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Events']) ;

    def.statics({
        _timerTypes: {
            timeout: 1,
            interval: 2
        }
    });

    def.traits([
        "bootstrap.managers.events.TimersHandler"
    ]);

    def.fields({
        $alive: true
    });

    /**
     * @lends bootstrap.managers.events.EventDispatcherBase
     */
    def.methods({
        initialize: function(){},

        getEventsSysId: function(){
            return this._getObjectId(this, false);
        },

        _setEventSysId: function(id){
            this.resources.W.Events._objectsByIds.registerObjectId(this, id);
        },

        _getObjectId: function(obj, addObjectToIdsMap, reportIfDead, operationName){
            if(obj.$alive !== undefined && !obj.$alive){
                this._reportErrorIfDead(reportIfDead, operationName);
                return null;
            }
            //accessing a private method cause I really don't want to make it public..
            return  this.resources.W.Events._objectsByIds.getObjectId(obj, addObjectToIdsMap);
        },

        _getObjectIdIfInMap: function(obj, reportIfDead, operationName){
            if(obj.$alive !== undefined && !obj.$alive){
                this._reportErrorIfDead(reportIfDead, operationName);
                return null;
            }
            return  this.resources.W.Events._getObjectIdIfInMap_(obj);
        },

        _reportErrorIfDead: function(reportIfDead, operationName){
            if(!reportIfDead){
                return;
            }
            console.error("you tried to " + operationName + " an event on a dead object ");
        },

        /**
         *
         * @param {String} eventType
         * @param {Object} listener - handler scope
         * @param {Function} handler
         * @returns {Object} the dispatching object
         */
        on: function(eventType, listener,  handler){
           return this._addEventHandler(eventType, listener,  handler);
        },

        /**
         *  will remove the event listener after the event is dispatched for the 1st time
         * @param {String} eventType
         * @param {Object} listener - handler scope
         * @param {Function} handler
         * @returns {Object} the dispatching object
         */
        once: function(eventType, listener,  handler){
            return this._addEventHandler(eventType, listener,  handler, true);
        },

        _addEventHandler: function(eventType, listener,  handler, isOnce){
            var listenerId = this._getObjectId(listener, true, true, 'register ' + eventType);
            var dispatcherId = this._getObjectId(this, true, true, 'register ' + eventType);
            if(!listenerId || !dispatcherId){
                return this;
            }
            this.resources.W.Events.addEventHandler(dispatcherId, eventType, listenerId, handler, undefined, isOnce);
            return this;
        },

        /**
         *
         * @param {String} eventType
         * @param {Object} listener - handler scope
         * @param {Function} handler
         * @returns {Object} the dispatching object
         */
        off: function(eventType, listener, handler){
            var listenerId = this._getObjectIdIfInMap(listener);
            var dispatcherId = this._getObjectIdIfInMap(this);
            if(!dispatcherId || !listenerId){
                return this;
            }
            this.resources.W.Events.removeEventHandler(dispatcherId, eventType, listenerId, handler);
            return this;
        },

        /**
         * removes all the listening handlers from the dispatcher
         * @param {Object} listener
         * @returns {Object} - the dispatching object
         */
        offByListener: function(listener){
            var listenerId = this._getObjectIdIfInMap(listener);
            var dispatcherId = this._getObjectIdIfInMap(this);
            if(!dispatcherId || !listenerId){
                return this;
            }
            this.resources.W.Events.removeEventsForListener(dispatcherId, listenerId);
            return this;
        },

        /**
         *
         * @param {String} eventType
         * @param {Object} [args] - the args passed to the handler functions
         * @param collectReturnedValues
         * @returns {Object} - [eventInfo] after execution
         */
        trigger: function(eventType, args, collectReturnedValues){
            //if the object doesn't have an id it means that there is no one listening.. no reason to trigger or add to ids map
            var dispatcherId = this._getObjectIdIfInMap(this, true, 'trigger ' + eventType);
            if(!dispatcherId){
                return this;
            }
            return this.resources.W.Events.dispatchEvent(dispatcherId, eventType, args, collectReturnedValues);
        },

        exterminate: function(){
            this.trigger(Constants.EventDispatcher.Events.EXTERMINATING);
            var dispatcherId = this._getObjectIdIfInMap(this);
            if(dispatcherId){
                this.resources.W.Events.deleteObjectFromMaps(dispatcherId);
            }
            this.$alive = false;
            return dispatcherId;
        },

        //debug methods
        getAllListenerObjects: function(eventType){
            return _.map(this._getAllHandlerRawObjects(eventType), function(obj){
                return W.Events.getObjectById(obj.listenerId);
            });
        },

        getAllHandlers: function(eventType){
            return _.map(this._getAllHandlerRawObjects(eventType), function(obj){
                return {
                    'listener': W.Events.getObjectById(obj.listenerId),
                    'handlerFunction': obj.handler
                };
            });
        },

        _getAllHandlerRawObjects: function(eventType){
            var dispatcherId = this._getObjectId(this);
            if(!dispatcherId){
                return;
            }
            var handlerObjects;
            if(eventType){
                handlerObjects = W.Events._dispatchersMapping.getHandlerObjects(dispatcherId, eventType);
            } else{
                handlerObjects = W.Events._dispatchersMapping.getAllHandlerObjectsForDispatcher(dispatcherId);
            }
            return handlerObjects;
        },

        /**
         * override if needed
         */
        isHandlingEventsWhenNotDisplayed: function(){
            return false;
        },

        isRemovingFromObjectsMapOnlyUponDeath: function(){
            return false;
        }
    });

});