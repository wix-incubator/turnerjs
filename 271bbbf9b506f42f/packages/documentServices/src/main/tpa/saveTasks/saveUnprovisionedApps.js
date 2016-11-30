define(['lodash', 'documentServices/tpa/services/provisionService', 'documentServices/saveTaskWithConcurrency/saveTaskWithConcurrency'], function(_, provisionService, retryOnConcurrencyError) {
    'use strict';

    var completeProvisionAppsAfterSiteSave = function(currentImmutableSnapshot, resolve, reject) {
        var metaSiteId = currentImmutableSnapshot.getIn(['rendererModel', 'metaSiteId']);
        var sessionId = currentImmutableSnapshot.getIn(['documentServicesModel', 'editorSessionId']);
        var clientSpecMap = currentImmutableSnapshot.getIn(['rendererModel', 'clientSpecMap']).toJS();
        var provisionBaseUrl = currentImmutableSnapshot.getIn(['serviceTopology', 'appStoreUrl']);
        provisionService.completeProvisionAppsAfterSave(provisionBaseUrl, metaSiteId, sessionId, clientSpecMap, resolve, reject);
    };

    return {
        partialSave: function (lastSavedData, currentData, resolve) {
            resolve();
        },
        fullSave: function (lastSavedData, currentData, resolve) {
            resolve();
        },
        firstSave: retryOnConcurrencyError(function (lastSavedData, currentData, resolve, reject) {
            completeProvisionAppsAfterSiteSave(currentData, resolve, reject);
        }),
        saveAsTemplate: function(lastSavedData, currentData, resolve) {
            resolve();
        },
        autosave: function(lastSavedData, currentData, resolve) {
            resolve();
        },
        publish: function (currentData, resolve) {
            resolve();
        },
        getTaskName: function () {
          return 'unProvisionedApps';
        }
    };
});
