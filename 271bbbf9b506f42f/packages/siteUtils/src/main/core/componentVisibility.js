define(['lodash'], function (_) {
    'use strict';

    var visibilityPlugins = [];

    function registerVisibilityPlugin(plugin) {
        visibilityPlugins.push(plugin);
    }

    function isComponentVisible(argsObj) {
        return _.every(visibilityPlugins, function(plugin) {
            return plugin(argsObj);
        });
    }

    return {
        isComponentVisible: isComponentVisible,
        registerPlugin: registerVisibilityPlugin
    };
});
