define(['lodash'], function (_) {
    'use strict';

    var Intents = {
        TPA_MESSAGE: "TPA",
        TPA_MESSAGE_PREVIEW: "TPA_PREVIEW",
        TPA_MESSAGE2: "TPA2",
        TPA_RESPONSE: "TPA_RESPONSE",
        TPA_PREVIEW_RESPONSE: "TPA_PREVIEW_RESPONSE",
        PINGPONG_PREFIX: "pingpong:"
    };

    var shouldCallViewerHandler = function(viewMode, msg){
        var ignoreViewerHandlers = {
            getSectionUrl: true,
            siteInfo: true,
            navigateToPage: true,
            getExternalId: true,
            smRequestLogin: true,
            getValue: true,
            getValues: true,
            getCurrentPageAnchors: true,
            getComponentInfo: true,
            navigateToSectionPage: true,
            getStateUrl: true,
            getSitePages: true
        };

        return !(viewMode === 'preview' && ignoreViewerHandlers[msg.type]);
    };

    var isDocumentServicesHandlersInitialized = function(siteAPI) {
        return siteAPI.getSiteData().viewMode === 'preview' &&
            _.get(window, 'documentServices.tpa.__privates.areDocumentServicesHandlersReady') && window.documentServices.tpa.__privates.areDocumentServicesHandlersReady();
    };

    var callPostMessage = function (source, data, targetOrigin) {
        var msgStr = '';
        try {
            msgStr = JSON.stringify(data);
        } catch (e) {
            return;
        }

        if (!source.postMessage) {
            source = source.contentWindow;
        }
        source.postMessage(msgStr, targetOrigin || '*');
    };

    var generateResponseFunction = function(source, msg, intent) {
        return function (data) {
            try {
                callPostMessage(source, {
                    intent: intent || Intents.TPA_RESPONSE,
                    callId: msg.callId,
                    type: msg.type,
                    res: data,
                    status: true
                });
            } catch (e) {
                // empty
            }
        };
    };

    var isTPAMessage = function isTPAMessage (msgIntent) {
        return msgIntent === Intents.TPA_MESSAGE || msgIntent === Intents.TPA_MESSAGE2;
    };

    var isTPAPreviewMessage = function isTPAPreviewMessage (msgIntent) {
        return msgIntent === Intents.TPA_MESSAGE_PREVIEW;
    };

    var fixOldPingPongMessageType = function(msgType) {
        return msgType.replace(Intents.PINGPONG_PREFIX, '');
    };

    var getSiteViewMode = function (siteAPI) {
        return siteAPI.getSiteData().viewMode;
    };

    var handleTPAMessage = function (ps, siteAPI, callHandler, event) {
        var msg;
        try {
            if (event.data) {
                msg = JSON.parse(event.data);
            } else if (event.originalEvent && event.originalEvent.data) {
                event = event.originalEvent;
                msg = JSON.parse(event.data);
            }
        } catch (e) {
            return;
        }

        if (msg && isTPAMessage(msg.intent)) {
            var viewMode = getSiteViewMode(siteAPI);
            if (ps) {
                callHandler(ps, siteAPI, msg, generateResponseFunction(event.source, msg));
            } else if (shouldCallViewerHandler(viewMode, msg) || !isDocumentServicesHandlersInitialized(siteAPI)) {
                msg.origin = viewMode === 'site' ? 'viewer' : viewMode;
                callHandler(siteAPI, msg, generateResponseFunction(event.source, msg));
            }
        } else if (msg && isTPAPreviewMessage(msg.intent)) {
            if (ps) {
                callHandler(ps, siteAPI, msg, generateResponseFunction(event.source, msg, Intents.TPA_PREVIEW_RESPONSE));
            } else {
                callHandler(siteAPI, msg, generateResponseFunction(event.source, msg, Intents.TPA_PREVIEW_RESPONSE));
            }
        }
    };

    return {
        Intents: Intents,
        callPostMessage: callPostMessage,
        generateResponseFunction: generateResponseFunction,
        isTPAMessage: isTPAMessage,
        fixOldPingPongMessageType: fixOldPingPongMessageType,
        handleTPAMessage: handleTPAMessage
    };
});
