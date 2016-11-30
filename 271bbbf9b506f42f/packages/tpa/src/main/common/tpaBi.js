define(['lodash',
        'tpa/utils/tpaUtils',
        'tpa/bi/events',
        'utils'
    ], function(_, tpaUtils, events, utils) {

    'use strict';

    var getEventDescriptor = function(appId) {
        return appId ? events.JS_SDK_FUNCTION_CALL : events.GALLERY_FUNCTION_CALL;
    };

    var getPublished = function(appData, comp) {
        var widgets = appData.widgets;
        var widget = widgets[comp.props.compData.widgetId];
        var isPublished = widget ? (widget.published || widget.santaEditorPublished) : appData.sectionPublished;
        return isPublished ? 1 : 0;
    };

    var getAppParams = function(siteAPI, msg) {
        var appsData = tpaUtils.getClientSpecMap(siteAPI);
        var instance = tpaUtils.getInstance(siteAPI, msg.appId);
        if (!appsData[msg.appId]) {
            throw 'app definition could not be found by the given appId';
        }
        var comp = siteAPI.getComponentById(msg.compId);
        return {
            appId: appsData[msg.appId].appDefinitionId,
            instanceId: instance.instanceId,
            isPublished: getPublished(appsData[msg.appId], comp)
        };
    };

    var extendMsg = function(siteAPI, msg) {
        msg.component = siteAPI.getComponentById(msg.compId);
        msg.appId = _.get(msg, 'component.props.compData.applicationId');
        return msg;
    };

    var shouldSendBIEvent = function(msg) {
        return msg.component && msg.component.props.compData &&
            msg.version && msg.type && msg.namespace;
    };

    var sendBIEvent = function(msg, siteAPI, origin) {

        var extendedMsg = extendMsg(siteAPI, msg);
        if (!shouldSendBIEvent(extendedMsg)) {
            return;
        }

        var eventParams = {
            visitorUuid: tpaUtils.getVisitorUuid(utils),
            sdkVersion: extendedMsg.version,
            origin: origin,
            fnName: extendedMsg.type,
            namespace: extendedMsg.namespace
        };

        if (extendedMsg.appId) {
            var appParams = getAppParams(siteAPI, extendedMsg);
            _.merge(eventParams, appParams);
        }

        var eventDescriptor = getEventDescriptor(extendedMsg.appId);
        siteAPI.reportBI(eventDescriptor, eventParams);
    };

    return {
        sendBIEvent: sendBIEvent
    };
});
