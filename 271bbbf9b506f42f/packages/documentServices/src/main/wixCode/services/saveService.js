define([
    'lodash',
    'bluebird',
    'documentServices/saveAPI/lib/saveRunner',
    'documentServices/wixCode/saveTasks/saveCode',
    'documentServices/bi/bi'
], function (_, Promise, taskRunner, saveCode, bi) {
    'use strict';

    var onlyWixCodeTasksRegistry = {
        primaryTask: saveCode,
        secondaryTasks: []
    };

    function getBiCallbacks(privateServices) {
        return {
            event: _.partial(bi.event, privateServices),
            error: _.partial(bi.error, privateServices)
        };
    }

    function save(privateServices, isFullSave) {
        return new Promise(function(resolve, reject) {
            privateServices.setOperationsQueue.flushQueueAndExecute(function () {
                var args = [onlyWixCodeTasksRegistry, privateServices.dal, resolve, reject, getBiCallbacks(privateServices)];

                if (isFullSave) {
                    taskRunner.runFullSaveTasks.apply(taskRunner, args);
                } else {
                    taskRunner.runPartialSaveTasks.apply(taskRunner, args);
                }
            });
        });
    }

    return {
        save: save
    };
});
