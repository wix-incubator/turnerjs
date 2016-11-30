W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').factory('configManager', function ($rootScope) {
        var configManager = W.Config,
            configParams = {
                webThemeDir: configManager.getServiceTopologyProperty('staticThemeUrlWeb') + '/editor_web/'
            };
        $rootScope.topology = {webThemeDir: configParams.webThemeDir};
        return configParams;
    });

});
