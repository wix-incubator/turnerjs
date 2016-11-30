define([
    'lodash',
    'documentServices/saveAPI/lib/saveRunner',
    'documentServices/wixapps/utils/pathUtils',
    'documentServices/wixapps/services/savePublish',
    'documentServices/bi/bi'
], function (
    _,
    taskRunner,
    pathUtils,
    savePublish,
    bi) {
    'use strict';

    var saveOnlyWixappsRegistry = {
        primaryTask: savePublish,
        secondaryTasks: []
    };

    function getBiCallbacks(privateServices) {
        return {
            event: _.partial(bi.event, privateServices),
            error: _.partial(bi.error, privateServices)
        };
    }

    function reload(ps) {
        ps.dal.full.removeByPath(pathUtils.getAppbuilderPath());
        var acc = [];
        _.forEach(pathUtils.getAppbuilderMetadataPath('requestedPartNames'), function (pathPart) {
            var newVal = pathPart !== 'requestedPartNames' ? {} : [];
            acc = acc.concat(pathPart);
            ps.dal.full.setByPath(acc, newVal);
        }, []);
        ps.dal.takeSnapshot(savePublish.getTaskName());
    }

    function save(privateServices, onSuccess, onError, isFullSave) {
        privateServices.setOperationsQueue.flushQueueAndExecute(function () {
            var args = [saveOnlyWixappsRegistry, privateServices.dal, onSuccess, onError, getBiCallbacks(privateServices)];

            if (isFullSave) {
                taskRunner.runFullSaveTasks.apply(taskRunner, args);
            } else {
                taskRunner.runPartialSaveTasks.apply(taskRunner, args);
            }
        });
    }

    return {
        reload: reload,
        save: save
    };
});
