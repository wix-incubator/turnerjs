define([
    'lodash',
    'documentServices/wixCode/saveTasks/saveCode',
    'documentServices/wixCode/saveTasks/markAppImmutable'
], function(_, saveCodeTask, markAppImmutableTask) {
    'use strict';

    function saveCodeAndMarkImmutable(lastSnapshot, currentSnapshot, resolve, reject) {
        saveCodeTask.fullSave(lastSnapshot, currentSnapshot, onSaveCodeSuccess, reject);

        function onSaveCodeSuccess(saveCodeTaskResult) {
            markAppImmutableTask.fullSave(lastSnapshot, currentSnapshot, onMarkAppImmutableSuccess, reject);

            function onMarkAppImmutableSuccess(markAppImmutableTaskResult) {
                var taskResult = _.assign({}, saveCodeTaskResult, markAppImmutableTaskResult);
                resolve(taskResult);
            }
        }
    }

    return {
        partialSave: saveCodeAndMarkImmutable,
        fullSave: saveCodeAndMarkImmutable,
        firstSave: saveCodeAndMarkImmutable,
        saveAsTemplate: saveCodeAndMarkImmutable,
        autosave: function(lastSnapshot, currentSnapshot, resolve) {
            resolve();
        },
        publish: function(snapshot, resolve) {
            resolve();
        },
        getTaskName: function () {
          return 'saveCode';
        }
    };
});
