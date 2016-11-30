define([
    'lodash',
    'documentServices/saveTaskWithConcurrency/saveTaskWithConcurrency',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'documentServices/wixCode/utils/traceUtils',
    'wixCode'
], function (_, taskWithConcurrencyResolver, wixCodeLifecycleService, traceUtils, wixCode) {
    'use strict';


    var saveWixCode = taskWithConcurrencyResolver(function (lastSnapshot, currentSnapshot, concurrencyResolver, reject) {
        var traceEnd = wixCode.log.trace(traceUtils.getParams(currentSnapshot, 'saveWixCodeAppsSaveTask'), traceUtils.getBaseDomain(currentSnapshot));

        function resolveFunc(serverResponse) {
            concurrencyResolver(serverResponse);
            traceEnd({message: serverResponse});
        }

        wixCodeLifecycleService.save(currentSnapshot, resolveFunc, reject);
    });

    return {
        partialSave: saveWixCode,
        fullSave: saveWixCode,
        firstSave: saveWixCode,
        saveAsTemplate: saveWixCode,
        publish: function (currentData, resolve) {
            resolve();
        },
        autosave: function(lastSnapshot, currentSnapshot, resolve) {
            resolve();
        },
        getTaskName: function () {
          return 'saveWixCodeTask';
        }
    };
});
