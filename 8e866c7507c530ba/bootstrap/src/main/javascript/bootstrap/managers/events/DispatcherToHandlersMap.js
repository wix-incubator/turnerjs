/**
 * @class bootstrap.managers.events.DispatcherToHandlersMap
 */
define.Class("bootstrap.managers.events.DispatcherToHandlersMap", function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.fields({

    });

        /**
     * @lends bootstrap.managers.events.DispatcherToHandlersMap
     */
    def.methods({
        initialize: function() {
            /**
         * dispatcherId: {
         *      eventType: [
         *          {listenerId:"", handler:"", nativeHandler (optional)} - HandlerObject,
         *          {listenerId:"", handler:"", nativeHandler (optional)} - HandlerObject
         *      ]
         * }
         */
            this._map = {} ;
        },

        /**
         * will add handler even if it's already registered
         * @param dispatcherId
         * @param eventType
         * @param listenerId
         * @param handlingFunction
         * @param {Boolean} [isOnce]
         */
        addHandler: function (dispatcherId, eventType, listenerId, handlingFunction, nativeHandlerFunction, isOnce) {
            var eventHandlerObjects = this._getWithInitHandlerObjectsForEventType(dispatcherId, eventType);
            var handlerObject = new this.HandlerObject(listenerId, handlingFunction, nativeHandlerFunction, isOnce);
            eventHandlerObjects.push(handlerObject);
            return handlerObject;
        },

        isHandlerRegistered: function (dispatcherId, eventType, listenerId, handlingFunction) {
            var eventHandlerObjects = this._getWithInitHandlerObjectsForEventType(dispatcherId, eventType);
            return eventHandlerObjects.some(function (obj) {
                return obj.listenerId == listenerId && obj.handler == handlingFunction;
            });
        },

        HandlerObject: function (listenerId, handlingFunction, nativeHandlerFunction, isOnce) {
            this.listenerId = listenerId;
            this.handler = handlingFunction;
            if (nativeHandlerFunction) {
                this.nativeHandler = nativeHandlerFunction;
            }
            this.isOnce = !!isOnce;
        },

        removeHandler: function (dispatcherId, eventType, listenerId, handlingFunction) {
            var dispatcherEvents = this._map[dispatcherId];
            if (!dispatcherEvents || !dispatcherEvents[eventType]) {
                return null; //TODO: throw a warning
            }
            var handlerObjects = dispatcherEvents[eventType];
            var removedHandlerObject = null;
            handlerObjects.eraseWithPredicate(function (item) {
                if (item.listenerId === listenerId && item.handler === handlingFunction) {
                    removedHandlerObject = item;
                    return true;
                }
                return false;
            });
            if (handlerObjects.length === 0) {
                delete dispatcherEvents[eventType];
            }
            if (Object.keys(dispatcherEvents).length === 0) {
                delete this._map[dispatcherId];
            }
            return removedHandlerObject;
        },

        removeListenerHandlers: function (dispatcherId, listenerId) {
            var dispatcherEvents = this._map[dispatcherId];
            var removedHandlers = {};
            for (var eventType in dispatcherEvents) {
                removedHandlers[eventType] = [];
                var eventHandlerObjects = dispatcherEvents[eventType];
                eventHandlerObjects.eraseWithPredicate(function (item) {
                    if (item.listenerId === listenerId) {
                        removedHandlers[eventType].push(item);
                        return true;
                    }
                    return false;
                });
                if (eventHandlerObjects.length === 0) {
                    delete dispatcherEvents[eventType];
                }
            }
            return removedHandlers;
        },

        deleteEntry: function (dispatcherId) {
            var removedHandlers = this._map[dispatcherId];
            delete this._map[dispatcherId];
            return removedHandlers;
        },

        /**
         * @param dispatcherId
         * @param eventType
         * @returns {Array<HandlerObject>} handlerObjects
         */
        getHandlerObjects: function (dispatcherId, eventType) {
            var dispatcherEvents = this._map[dispatcherId];
            if (!dispatcherEvents || !dispatcherEvents[eventType]) {
                return [];
            }
            return _.clone(dispatcherEvents[eventType]);
        },

        /**
         * @param dispatcherId
         * @returns {Array<HandlerObject>} handlerObjects
         */
        getAllHandlerObjectsForDispatcher: function (dispatcherId) {
            var dispatcherEvents = this._map[dispatcherId];
            if (!dispatcherEvents) {
                return [];
            }
            var listenersArrays = Object.values(dispatcherEvents);
            return listenersArrays.flatten();
        },

        getAllDispatcherIds: function () {
            return Object.keys(this._map);
        },

        _getWithInitHandlerObjectsForEventType: function (dispatcherId, eventType) {
            if (!this._map[dispatcherId]) {
                this._map[dispatcherId] = {};
            }
            if (!this._map[dispatcherId][eventType]) {
                this._map[dispatcherId][eventType] = [];
            }
            return this._map[dispatcherId][eventType];
        }
    });

});