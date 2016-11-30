define(['lodash',
    'documentServices/tpa/services/provisionService',
    'documentServices/tpa/services/pendingAppsService',
    'documentServices/tpa/services/appStoreService',
    'documentServices/saveTaskWithConcurrency/saveTaskWithConcurrency',
    'experiment'], function(_, provisionService, pendingAppsService, appStoreService, retryOnConcurrencyError, experiment) {
    'use strict';

    var settleAfterSiteSave = function (lastImmutableSnapshot, currentImmutableSnapshot, firstSave, concurrentResolver, reject) {
        var onComplete = function(msg) {
            concurrentResolver(msg);
            pendingAppsService.onSave();
        };

        setTimeout(function() {
            appStoreService.settleOnSave(lastImmutableSnapshot, currentImmutableSnapshot, firstSave, onComplete, reject);
        }, 200);
    };

    return {
        partialSave: retryOnConcurrencyError(function (lastImmutableSnapshot, currentImmutableSnapshot, resolve, reject) {
            settleAfterSiteSave(lastImmutableSnapshot, currentImmutableSnapshot, false, resolve, reject);
        }),
        fullSave: retryOnConcurrencyError(function (lastImmutableSnapshot, currentImmutableSnapshot, resolve, reject) {
            settleAfterSiteSave(lastImmutableSnapshot, currentImmutableSnapshot, false, resolve, reject);
        }),
        firstSave: retryOnConcurrencyError(function (lastImmutableSnapshot, currentImmutableSnapshot, resolve, reject) {
            settleAfterSiteSave(lastImmutableSnapshot, currentImmutableSnapshot, true, resolve, reject);
        }),
        saveAsTemplate: function(lastImmutableSnapshot, currentImmutableSnapshot, resolve) {
            resolve();
        },
        autosave: retryOnConcurrencyError(function(lastImmutableSnapshot, currentImmutableSnapshot, resolve, reject) {
            if (experiment.isOpen('autosaveTpaSettle')) {
                settleAfterSiteSave(lastImmutableSnapshot, currentImmutableSnapshot, false, resolve, reject);
            } else {
                resolve();
            }
        }),
        publish: function (currentImmutableSnapshot, resolve) {
            resolve();
        },
        getTaskName: function () {
          return 'unProvisionedAppsAppFlows';
        }
    };
});
