define(['lodash', 'bluebird', 'utils'], function (_, Promise, utils) {
    'use strict';

    function PrimaryTaskError(reason) {
        this.name = 'PrimaryTaskError';
        this.message = 'Document save has failed';
        this.reason = {"document": reason};
        this.stack = (new Error()).stack;
    }

    function SecondaryTasksError(errorMap) {
        this.name = 'SecondarySaveError';
        this.message = 'One or more Secondary save tasks have failed';
        this.reason = errorMap;
        this.stack = (new Error()).stack;
    }

    PrimaryTaskError.prototype = Object.create(Error.prototype);
    SecondaryTasksError.prototype = Object.create(Error.prototype);


    /**
     * @description executes the save task and returns a promise
     * @param task
     * @param {Object} biCallbacks
     * @returns {Promise} a Promise that the task will be executed. Rejects on save failure.
     */
    function executeTask(task, biCallbacks) {
        var promise = new Promise(function (resolve, reject) {
            var args = task.args().concat([resolve, reject, biCallbacks]);
            task.execute.apply(null, args);
        });
        if (task.onTaskFailure) {
            promise.catch(task.onTaskFailure);
        }
        return task.onTaskSuccess ? promise.then(task.onTaskSuccess) : promise;
    }

    /**
     * @param tasks - a map of save tasks
     * @param {Object} biCallbacks
     * @returns {Promise} a promise that all the tasks in the map will be executed. If the promise is rejected, it is rejected with a map of the rejection reasons of the task map.
     */
    function executeTaskMap(tasks, biCallbacks) {
        var promiseMap = _.transform(tasks, function (acc, task) {
            acc[task.name] = executeTask(task, biCallbacks);
        }, {});
        var promisesAsArray = _.values(promiseMap);

        return Promise.settle(promisesAsArray).then(function () {
            var failuresDescriptionMap = getFailuresDescriptionMap(promiseMap);
            if (_.size(failuresDescriptionMap)) {
                throw new SecondaryTasksError(failuresDescriptionMap);
            }
            return promiseMap;
        });
    }

    /**
     *
     * @param promiseMap
     * @returns {*} a map of the rejection reasons for the promise map
     */
    function getFailuresDescriptionMap(promiseMap) {
        var pickOnlyRejectedPromises = function (promise) {
            return promise.isRejected();
        };
        var mapToRejectionReason = function (promise) {
            return promise.reason();
        };

        return _(promiseMap)
            .pick(pickOnlyRejectedPromises)
            .mapValues(mapToRejectionReason)
            .value();
    }

    /**
     * @ignore
     * @param DAL
     * @param taskName
     * @param method
     * @constructor
     */
    function BaseTask(DAL, taskName, method) {
        this.name = taskName;
        this.execute = method;
        this.onTaskSuccess = function (result) {
            updateDALbyTaskResult(DAL, result);
        };
    }

    /**
     * @ignore
     * @param DAL
     * @param taskName
     * @param {function} method
     * @constructor
     */
    function TaskWithHistory(DAL, taskName, method) {
        BaseTask.call(this, DAL, taskName, method);
        this.lastSavedState = DAL.full.immutable.getLastSnapshotByTagName(taskName) || DAL.full.immutable.getInitialSnapshot(); //VERY important to keep this first!
        DAL.takeSnapshot(taskName);
        DAL.takeSnapshot(taskName + 'Autosave');
        this.currentState = DAL.full.immutable.getLastSnapshotByTagName(taskName);
        this.args = function(){
            return [this.lastSavedState, this.currentState];
        };
        var rollBackSnapshot = function (result) {
            DAL.removeLastSnapshot(taskName);
            DAL.removeLastSnapshot(taskName + 'Autosave');
            if (result && !_.isEmpty(result.changes)) {
                DAL.duplicateLastSnapshot(taskName, result.changes);
                updateDALbyTaskResult(DAL, result.changes);
            }
        };
        this.onTaskFailure = rollBackSnapshot;
        this.cancel = rollBackSnapshot;
    }

    /**
     * @ignore
     * @param DAL
     * @param taskName
     * @param {function} method
     * @constructor
     */
    function AutosaveTask(DAL, taskName, method) {
        BaseTask.call(this, DAL, taskName, method);
        var snapshotName = taskName + 'Autosave';
        this.lastSavedState = DAL.full.immutable.getLastSnapshotByTagName(snapshotName) || DAL.full.immutable.getInitialSnapshot();
        DAL.takeSnapshot(snapshotName);
        this.currentState = DAL.full.immutable.getLastSnapshotByTagName(snapshotName);
        this.args = function(){
            return [this.lastSavedState, this.currentState];
        };
        var rollBackSnapshot = function (result) {
            DAL.removeLastSnapshot(snapshotName);
            if (result && !_.isEmpty(result.changes)) {
                DAL.duplicateLastSnapshot(snapshotName, result.changes);
                updateDALbyTaskResult(DAL, result.changes);
            }
        };
        this.onTaskFailure = rollBackSnapshot;
        this.cancel = rollBackSnapshot;

        this.onTaskSuccess = function (result) {
            if (result) {
                var versionBeforeAutoSave = this.currentState.getIn(['documentServicesModel', 'version']);
                var currentVersion = DAL.full.getByPath(['documentServicesModel', 'version']);

                if (versionBeforeAutoSave === currentVersion) {  // If there was a save (version updated) during the auto-save - don't update the previousDiffId (otherwise the next auto-save will fail)
                    // TODO: KADURI - maybe we should manually set previousDiffId to null?
                    updateDALbyTaskResult(DAL, result);
                }
            }
        }.bind(this);
    }


    //see #SE-4087
    function updateSiteAndMetasiteIdsInSnapshot(DAL, snapshot) {
        var currentRendererModel = DAL.getByPath(['rendererModel']);
        return snapshot.mergeIn(['rendererModel'], {
            metaSiteId: currentRendererModel.metaSiteId,
            siteInfo: {
                siteId: currentRendererModel.siteInfo.siteId
            }
        });
    }

    /**
     * @ignore
     * @param DAL
     * @param taskName
     * @param method
     * @constructor
     */
    function PublishTask(DAL, taskName, method) {
        BaseTask.call(this, DAL, taskName, method);
        var currentState = DAL.full.immutable.getLastSnapshotByTagName(taskName) || DAL.full.immutable.getInitialSnapshot();
        this.currentState = updateSiteAndMetasiteIdsInSnapshot(DAL, currentState);
        this.args = function(){
            return [this.currentState];
        };
    }

    /**
     * Updates the DAL according to the result parameter.
     * @param DAL
     * @param {{string: Object?}} result Object of the changes needed in the DAL the key is the path and the value is the new value,
     *                                   undefined value will remove the path from DAL.
     */
    function updateDALbyTaskResult(DAL, result) {
        _.forOwn(result, function (val, key) {
            if (_.isUndefined(val)) {
                DAL.full.removeByPath(key.split('.'));
                return;
            }
            DAL.full.setByPath(key.split('.'), val);
        });
    }

    function updateModelsForSecondaryTasks(DAL, secondaryTasksMap) {
        _.forOwn(secondaryTasksMap, function (task) {
            if (task.currentState) {
                task.currentState = task.currentState.withMutations(function(snapshot){
                    return snapshot.set('documentServicesModel', DAL.full.immutable.getByPath(['documentServicesModel'])).set('rendererModel', DAL.full.immutable.getByPath(['rendererModel']));
                });
            }
        });
    }

    /**
     *
     * @param DAL
     * @param primaryTask
     * @param secondaryTasksMap
     * @param onSuccess
     * @param onError
     * @param biCallbacks an object with "event" and "error" callback for sending bi events & errors
     * @returns {*}
     */
    function runTasks(DAL, primaryTask, secondaryTasksMap, onSuccess, onError, biCallbacks) {
        var taskExecutionPromise = executeTask(primaryTask, biCallbacks)
            .catch(function (reason) {
                _.invoke(secondaryTasksMap, 'cancel');
                throw new PrimaryTaskError(reason);
            })
            .then(updateModelsForSecondaryTasks.bind(null, DAL, secondaryTasksMap))
            .then(function () {
                return executeTaskMap(secondaryTasksMap, biCallbacks);
            });

        taskExecutionPromise
            .then(function onAllTasksSuccess() {
                if (onSuccess) {
                    onSuccess();
                }
            })
            .catch(PrimaryTaskError, SecondaryTasksError, function onTaskFailure(err) {
                utils.log.error('Save has failed - please see the failure details below:', err);
                if (onError) {
                    onError(err.reason);
                }
            });

        return taskExecutionPromise;
    }

    /**
     * Actually runs the save tasks.
     * @param {string} methodName
     * @param {function} TaskCtor
     * @param {Object} tasksRegistry
     * @param {Object} DAL
     * @param {function} onSuccess
     * @param {function} onError
     * @param {Object} biCallbacks an object with "event" and "error" callback for sending bi events & errors
     * @return {Promise} a promise that the save tasks will be executed. Will resolve when all have resolved.
     *         If the documentSave is rejected, the promise will be rejected immediately. If it succeeds and a secondary task rejects, then it will be rejected once all the tasks have been settled.
     */
    function buildAndRunTasks(methodName, TaskCtor, tasksRegistry, DAL, onSuccess, onError, biCallbacks) {
        var documentSaveTask = new TaskCtor(DAL, tasksRegistry.primaryTask.getTaskName(), tasksRegistry.primaryTask[methodName]);
        var secondaryTasks = _.map(tasksRegistry.secondaryTasks, function (taskDefinition) {
            return new TaskCtor(DAL, taskDefinition.getTaskName(), taskDefinition[methodName]);
        });

        return runTasks(DAL, documentSaveTask, secondaryTasks, onSuccess, onError, biCallbacks);
    }

    return {
        runPartialSaveTasks: buildAndRunTasks.bind(null, 'partialSave', TaskWithHistory),
        runFullSaveTasks: buildAndRunTasks.bind(null, 'fullSave', TaskWithHistory),
        runFirstSaveTasks: buildAndRunTasks.bind(null, 'firstSave', TaskWithHistory),
        runPublishTasks: buildAndRunTasks.bind(null, 'publish', PublishTask),
        runSaveAsTemplate: buildAndRunTasks.bind(null, 'saveAsTemplate', TaskWithHistory),
        runAutosaveTasks: buildAndRunTasks.bind(null, 'autosave', AutosaveTask)
    };
});
