define(['lodash',
    'experiment',
    'tpa/common/tpaPostMessageCommon',
    'tpa/handlers/tpaHandlers',
    'tpa/handlers/tpaPubSubHandlers',
    'tpa/utils/tpaUtils',
    'tpa/common/tpaBi',
    'tpa/services/clientSpecMapService',
    'utils'
], function(_, experiment, tpaPostMessageCommon, messageHandlers, tpaPubSubHandlers, tpaUtils, tpaBi, clientSpecMapService, utils){
    'use strict';

    var superAppsOnlyHandlers = {
        getCtToken: true
    };

    var isPubSubMessage = function (msg) {
        if (_.has(msg, 'data') && !_.isNull(msg.data)) {
            return msg.data.eventKey && utils.stringUtils.startsWith(msg.data.eventKey, tpaUtils.Constants.TPA_PUB_SUB_PREFIX);
        }
    };

    var getHandlers = function (msg) {
        if (isPubSubMessage(msg)) {
            return tpaPubSubHandlers;
        } else if (isTPAWorkerId(msg.compId)) {
            return messageHandlers.tpaWorker;
        }

        return messageHandlers;
    };

    var callHandler = function (siteAPI, msg, response) {
        if (shouldHandleMessage(siteAPI, msg.compId, msg.type)) {
            var msgType = tpaPostMessageCommon.fixOldPingPongMessageType(msg.type);
            var handlers = getHandlers(msg);
            if (handlers[msgType]) {
                handlers[msgType].apply(this, [siteAPI, msg, response]);
                if (experiment.isOpen('sv_SendSdkMethodBI')) {
                    tpaBi.sendBIEvent(msg, siteAPI, msg.origin || 'viewer');
                }
            }
        }
    };

    var isTPAWorkerId = function (id) {
        return id && utils.stringUtils.startsWith(id, 'tpaWorker_');
    };


    var shouldHandleMessage = function (siteAPI, compId, msgType) {
        var comp = compId && siteAPI.getComponentById(compId);

        return (msgType !== 'appStateChanged' || (comp && _.includes(siteAPI.getAllRenderedRootIds(), comp.props.rootId))) && isHandlerAllowedForApp(siteAPI, compId, msgType);
    };

    var isHandlerAllowedForApp = function (siteAPI, compId, msgType) {
        return !superAppsOnlyHandlers[msgType] || clientSpecMapService.isSuperAppByCompId(siteAPI, compId);
    };

    /**
     *
     * @constructor
     * @param {core.SiteAspectsSiteAPI} siteAPI
     */
    var Aspect = function (siteAPI) {
        siteAPI.registerToMessage(this.handleTPAMessage.bind(this));
        this._siteAPI = siteAPI;
    };

    Aspect.prototype = {
        handleTPAMessage: function (event) {
            tpaPostMessageCommon.handleTPAMessage.call(this, undefined, this._siteAPI, callHandler, event);
        },

        sendPostMessage: function (comp, data) {
            var iframe = comp.getIframe();

            if (iframe) {
                tpaPostMessageCommon.callPostMessage(iframe, data);
            } else {
                throw new Error('No iframe found in TPA component', comp);
            }
        },

        callHandler: callHandler
    };

    return Aspect;
});
