define(['lodash', 'tpa/utils/tpaUtils', 'tpa/classes/PubSubHub'], function(_, tpaUtils, PubSubHub){
    'use strict';

    /**
     * @constructor
     * @param {core.SiteAspectsSiteAPI} siteAPI
     */
    var PubSubAspect = function (aspectSiteAPI){
        this.aspectSiteAPI = aspectSiteAPI;
        this.hub = new PubSubHub();
    };

    PubSubAspect.prototype = {
        publish: function (appDefId, compId, msgData) {
            var event = msgData.eventKey;
            var isPersistent = msgData.isPersistent;
            var eventListeners = this.hub.getEventListeners(appDefId, event);
            var dataToPublish = {
                eventType: tpaUtils.addPubSubEventPrefix(event),
                intent: 'addEventListener',
                params: {
                    data: msgData.eventData,
                    name: event,
                    origin: compId
                }
            };

            _.forEach(eventListeners, function (componentId) {
                this._sendDataToComp(componentId, dataToPublish);
            }, this);

            if (isPersistent) {
                var dataToPersist = msgData.eventData;
                this.hub.persistData(appDefId, event, compId, dataToPersist);
            }
        },
        subscribe: function (props) {
            var compId = props.compId;
            var propsData = props.data;
            var event = tpaUtils.stripPubSubPrefix(propsData.eventKey);
            var receivePastEvents = propsData.receivePastEvents;
            var appDefId = tpaUtils.getAppDefId(this.aspectSiteAPI, compId);

            this.hub.addEventListener(appDefId, event, compId);

            if (receivePastEvents) {
                var persistedData = this.hub.getPersistedData(appDefId, event);

                if (!_.isEmpty(persistedData)) {
                    var responseMsg = {
                        intent: 'TPA_RESPONSE',
                        compId: compId,
                        callId: props.callId,
                        type: props.type,
                        status: true,
                        res: {
                            drain: true,
                            data: persistedData
                        }
                    };

                    this._sendDataToComp(compId, responseMsg);
                }
            }
        },
        unsubscribe: function (appDefId, compId, event) {
            var listeners = this.hub.getEventListeners(appDefId, event);

            if (listeners) {
                this.hub.removeEventListener(appDefId, event, compId);
            }
        },
        deleteCompListeners: function(appDefId, compId){
            this.hub.deleteCompListeners(appDefId, compId);
        },
        /**
         * @private
         */
        _sendDataToComp: function (compId, data) {
            var comp = this.aspectSiteAPI.getComponentById(compId);

            if (comp) {
                comp.sendPostMessage(data);
            }
        }
    };

    return PubSubAspect;
});
