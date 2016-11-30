define(['core'], function (core) {
    'use strict';

    var callbacks = [];
    var callId = 1;

    var siteAPI;
    var siteAspectsRegistry = core.siteAspectsRegistry;

    var tpaPreviewEditorAspect = function (aspectSiteAPI) {
        siteAPI = aspectSiteAPI;
        init();
    };

    siteAspectsRegistry.registerSiteAspect('tpaPreviewEditorAspect', tpaPreviewEditorAspect);

    var init = function () {
        siteAPI.registerToMessage(receiver.bind(this));
    };

    var doPostMessage = function (msgType, params, compId, callback) {
        var blob = getBlob(msgType, params, compId, callback);

        var target;
        if (window.parent.postMessage) {
            target = window.parent;
        } else if (window.parent.document.postMessage) {
            target = window.parent.document;
        }

        if (target && typeof target !== "undefined") {
            target.postMessage(JSON.stringify(blob), "*");
        }
    };

    var getBlob = function (msgType, params, compId, onResponseCallback) {
        var blob = {
            intent: 'TPA_PREVIEW',
            callId: callId++,
            type: msgType,
            compId: compId,
            data: params
        };

        if (onResponseCallback) {
            callbacks[blob.callId] = onResponseCallback;
        }

        return blob;
    };

    var receiver = function (event) {
        if (!event || !event.data) {
            return;
        }

        var data = {};
        try {
            data = JSON.parse(event.data);
        } catch (e) {
            return;
        }

        switch (data.intent) {
            case 'TPA_PREVIEW':
                if (data.callId && callbacks[data.callId]) {
                    callbacks[data.callId](data.res);
                    delete callbacks[data.callId];
                }
                break;

        }
    };

    return {
        doPostMessage: doPostMessage
    };
});
