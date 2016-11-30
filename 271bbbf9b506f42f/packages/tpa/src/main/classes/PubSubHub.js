define(['lodash', 'utils'], function(_, utils) {
    'use strict';

    var MAX_DATA_COUNT = 1000;

    var PubSubHub = function (hub) {
        this.hub = hub || {};
    };

    PubSubHub.prototype = {
        persistData: function (appDefId, eventKey, compId, data) {
            var dataToPersist = {
                data: data,
                name: eventKey,
                origin: compId
            };
            var event = this._addEvent(appDefId, eventKey);

            if (event.data.length >= MAX_DATA_COUNT){
                utils.log.warn('You have exceeded the data limit, and some of the data will be lost! Please make sure you are not persisting unneeded data.');
                event.data.shift();
            }
            event.data.push(dataToPersist);
        },
        addEventListener: function (appDefId, eventKey, compId) {
            var event = this._addEvent(appDefId, eventKey);

            if (!_.includes(event.listeners, compId)) {
                event.listeners.push(compId);
            }
        },
        removeEventListener: function (appDefId, eventKey, compId) {
            var event = this._getEvent(appDefId, eventKey);

            if (event) {
                event.listeners = _.without(event.listeners, compId);
            }
        },
        getPersistedData: function (appDefId, eventKey) {
            var event = this._getEvent(appDefId, eventKey);

            return event && event.data;
        },
        getEventListeners: function (appDefId, event) {
            var eventObj = this._getEvent(appDefId, event);

            return eventObj && eventObj.listeners;
        },
        deleteCompListeners: function(appDefId, compId){
            var self = this;
            var events = this._getAppEvents(appDefId);
            _.forOwn(events, function(event, eventKey){
                self.removeEventListener(appDefId, eventKey, compId);
            });
        },
        /**
         * @private
         */
        _addEvent: function (appDefId, event) {
            var events = this.hub[appDefId];

            if (!events) {
                events = this.hub[appDefId] = {};
            }

            var eventObj = events[event];

            if (!eventObj) {
                eventObj = events[event] = {
                    data: [],
                    listeners: []
                };
            }

            return eventObj;
        },
        /**
         * @private
         */
        _getEvent: function (appDefId, event) {
            var events = this.hub[appDefId];

            if (events) {
                return events[event];
            }
        },
        /**
         * @private
         */
        _getAppEvents: function(appDefId){
            return this.hub[appDefId];
        }
    };

    return PubSubHub;
});
