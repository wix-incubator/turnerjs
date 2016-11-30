/**
 * holds a mapping form listeners to dispatchers with a reference count,
 * the number of function references the listener have, that handle dispatcher's events.
 */
define.Class('bootstrap.managers.events.ListenerToDispatchersMap', function (classDefinition) {
    /*@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        initialize: function(){
            /**
             * listenerId{
             * dispatcherId: #handlerFunctions
             * }
            */
            this._map = {} ;
        },
        addHandler: function (listenerId, dispatcherId) {
            if (!this._map[listenerId]) {
                this._map[listenerId] = {};
            }
            var listenerDispatchers = this._map[listenerId];
            if (!listenerDispatchers[dispatcherId]) {
                listenerDispatchers[dispatcherId] = 1;
            }
            else {
                listenerDispatchers[dispatcherId]++;
            }
        },

        /**
         * reduces the handlers counter for this dispatcher in the listener.
         * and removes the dispatcher entry or even the listener entry if possible ( no more handlers ).
         * @param listenerId
         * @param dispatcherId
         */
        removeHandler: function (listenerId, dispatcherId) {
            var listenerDispatchers = this._map[listenerId];
            if (!listenerDispatchers || !listenerDispatchers[dispatcherId]) {
                return; //TODO: throw a warning
            }
            listenerDispatchers[dispatcherId]--;
            if (listenerDispatchers[dispatcherId] === 0) {
                delete listenerDispatchers[dispatcherId];
            }
            if (Object.keys(listenerDispatchers).length === 0) {
                delete this._map[listenerId];
            }
        },

        removeListenerHandlers: function (listenerId, dispatcherId) {
            if (!this._map[listenerId]) {
                return;
            }
            delete this._map[listenerId][dispatcherId];
        },

        deleteEntry: function (listenerId) {
            if (this._map[listenerId]) {
                delete this._map[listenerId];
            }
        },

        /**
         *
         * @param listenerId
         * @returns {Array<Number>}
         */
        getAllDispatcherIdsForListener: function (listenerId) {
            if (!this._map[listenerId]) {
                return [];
            }
            return Object.keys(this._map[listenerId]);
        }
    });
});