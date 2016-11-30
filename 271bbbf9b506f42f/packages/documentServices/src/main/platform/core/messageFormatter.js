define([
    'lodash', 'documentServices/platform/common/constants'
], function (_, constants) {
    'use strict';

    function viewerInfoChangedEvent(payload) {
        return {
            eventType: constants.MessageTypes.VIEWER_INFO_CHANGED,
            eventPayload: payload
        };
    }

    function triggerEvent(applicationId, options) {
        return {
            intent: constants.Intents.PLATFORM_WORKER,
            type: constants.MessageTypes.TRIGGER_EVENT,
            applicationId: applicationId,
            args: options
        };
    }

    function addApps (apps) {
        return {
            intent: constants.Intents.PLATFORM_WORKER,
            type: constants.MessageTypes.ADD_APPS,
            apps: _.map(apps, function (app) {
                return _.pick(app, ['applicationId', 'editorUrl', 'appDefinitionId']);
            })
        };
    }

    function addApp (app) {
        return addApps([app]);
    }

    return {
        viewerInfoChangedEvent: viewerInfoChangedEvent,
        triggerEvent: triggerEvent,
        addApp: addApp,
        addApps: addApps
    };
});
