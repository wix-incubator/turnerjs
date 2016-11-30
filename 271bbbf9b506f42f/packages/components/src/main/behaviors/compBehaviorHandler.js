define(['lodash'], function (_) {
    'use strict';

    function handle(behaviors, siteAPI, event) {
        var behaviorsAspect = siteAPI.getSiteAspect('behaviorsAspect');
        _.forEach(behaviors, function (behavior) {
            behaviorsAspect.registerBehavior(behavior, event.callback);
        });
        siteAPI.forceUpdate();
    }

    return {
        handle: handle
    };
});
