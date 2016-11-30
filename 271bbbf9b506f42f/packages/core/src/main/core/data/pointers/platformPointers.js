define(['lodash', 'core/core/data/pointers/pointerGeneratorsRegistry', 'core/core/data/pointers/DataAccessPointers'], function (_, pointerGeneratorsRegistry, DataAccessPointers) {
    "use strict";

    var type = 'platform';
    var pointers = new DataAccessPointers();

    pointerGeneratorsRegistry.registerPointerType(type, _.constant(null), _.constant(true));

    function getPlatformPointer(getItemAt, cache) {
        return cache.getPointer('platform', type, ['platform']);
    }

    function getAppStatePointer(getItemAt, cache) {
        var platformPointer = getPlatformPointer(getItemAt, cache);
        return pointers.getInnerPointer(platformPointer, 'appState');
    }

    function getControllerStatePointer(getItemAt, cache, controllerId) {
        return cache.getPointer(controllerId + ' state', type, ['platform', 'appState', controllerId]);
    }

    function getAppManifestPointer(getItemAt, cache, appId) {
        return cache.getPointer('appManifest ' + appId, type, ['platform', 'appManifest', appId]);
    }

    function getControllerStageDataPointer(getItemAt, cache, appId, controllerType, controllerState) {
        return cache.getPointer('controllerStageData ' + appId + controllerType, type, ['platform', 'appManifest', appId, 'controllersStageData', controllerType, controllerState]);
    }


    function getPagesPlatformApplicationsPointer(getItemAt, cache) {
        return cache.getPointer('pagesPlatformApplications', type, ['pagesPlatformApplications']);
    }

    function getPagesPlatformApplicationPointer(getItemAt, cache, appId) {
        return cache.getPointer(appId + ' pages', type, ['pagesPlatformApplications', appId]);
    }

    var getterFunctions = {
        getPlatformPointer: getPlatformPointer,
        getAppStatePointer: getAppStatePointer,
        getControllerStatePointer: getControllerStatePointer,
        getControllerStageDataPointer: getControllerStageDataPointer,
        getAppManifestPointer: getAppManifestPointer,
        getPagesPlatformApplicationsPointer: getPagesPlatformApplicationsPointer,
        getPagesPlatformApplicationPointer: getPagesPlatformApplicationPointer
    };

    pointerGeneratorsRegistry.registerDataAccessPointersGenerator(type, getterFunctions);

});
