define(['lodash'], function(_) {
    'use strict';

    var behaviorIdentiferFields = ['type', 'name', 'targetId'];

    function handle(behaviors, siteAPI, event) {
        var widgetAspect = siteAPI.getSiteAspect('WidgetAspect');
        var handler = widgetAspect.getWidgetHandler();
        _.forEach(behaviors, function (behavior) {
            handler.handleEvent(behavior.targetId, behavior.name, behavior.params, event);
        });
    }

    function getUniqueIdentifier(behavior) {
        var identifiers = _.at(behavior, behaviorIdentiferFields);
        identifiers.push(behavior.params.callbackId);
        return identifiers.join(',');
    }

    return {
        handle: handle,
        getUniqueIdentifier: getUniqueIdentifier
    };
});
