define(['documentServices/saveAPI/saveTasks/saveDocument',
    'documentServices/wixapps/services/savePublish',
    'documentServices/wixCode/saveTasks/saveWixCodeApps',
    'documentServices/wixCode/saveTasks/saveCodeAndMarkImmutable',
    'documentServices/tpa/saveTasks/saveUnprovisionedApps',
    'documentServices/tpa/saveTasks/saveUnprovisionedAppsForAppFlows',
    'documentServices/tpa/saveTasks/saveEventDispatcher'], function (saveDocument, saveWixapps, saveWixCodeApps, saveCodeAndMarkImmutable, saveUnprovisionedApps,
                                                             saveUnprovisionedAppsForAppFlows, saveEventDispatcher) {
    'use strict';

    function getSaveTasksConfig(){
        return {
            primaryTask: saveDocument,
            secondaryTasks: [
                saveWixCodeApps,
                saveCodeAndMarkImmutable,
                saveWixapps,
                saveUnprovisionedApps,
                saveUnprovisionedAppsForAppFlows,
                saveEventDispatcher
            ]
        };
    }

    return {
        getSaveTasksConfig: getSaveTasksConfig
    };
});
