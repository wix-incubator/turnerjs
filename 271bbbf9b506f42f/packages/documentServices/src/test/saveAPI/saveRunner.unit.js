define(['bluebird', 'lodash', 'documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/jsonConfig/jsonConfig', 'definition!documentServices/saveAPI/lib/saveRunner', 'experiment', 'utils'], function (Promise, _, privateServicesHelper, jsonConfig, SaveRunnerDef, experiment, utils) {
    'use strict';

    describe("saveRunner", function () {

        var saveRunner, DAL, onSaveSuccess, onSaveError, fakeBiCallbacks, taskRegistry, resolveData, rejectData;

        function initializeCallbacks(complete) {
            onSaveSuccess = jasmine.createSpy('onSuccess').and.callFake(function () {
                if (complete) {
                    complete();
                }
            });
            onSaveError = jasmine.createSpy('onError').and.callFake(function () {
                if (complete) {
                    complete();
                }
            });
            fakeBiCallbacks = {
                error: jasmine.createSpy('bi.error'),
                event: jasmine.createSpy('bi.event')
            };
        }

        function getSecondaryTask(registry, taskName) {
            return _.find(registry.secondaryTasks, function (task) {
                return task.getTaskName() === taskName;
            });
        }

        /**
         *
         * @param {object} config
         * @param {string[]} config.failServices
         * @param {boolean} config.failPrimary
         * @param {object[]} config.mockFail
         * @param {object[]} config.mockPass
         * @param {function} config.onComplete
         */
        function prepareTest(config) {
            config = config || {};
            //check if primary save should fail
            if (config.failPrimary) {
                this.willFail(taskRegistry.primaryTask);
            } else {
                this.willSucceed(taskRegistry.primaryTask);
            }
            _.forEach(taskRegistry.secondaryTasks, function (task) {
                if (_.includes(config.failServices, task.getTaskName())) {
                    this.willFail(task);
                } else {
                    this.willSucceed(task);
                }
            }, this);
            //add mocks for fail
            _.forEach(config.mockFail, function (taskName) {
                taskRegistry.secondaryTasks.push(this.willFail(getFakeTask(taskName)));
            }, this);

            //add mocks for pass
            _.forEach(config.mockPass, function (taskName) {
                taskRegistry.secondaryTasks.push(this.willSucceed(getFakeTask(taskName)));
            }, this);

            saveRunner = _.mapValues(new SaveRunnerDef(_, Promise, utils, experiment), function (method) {
                return _.partial(method, taskRegistry);
            });
            initializeCallbacks(config.onComplete);
        }

        function getFakeTask(taskName) {
            return {
                partialSave: function () {
                },
                fullSave: function () {
                },
                firstSave: function () {
                },
                publish: function () {
                },
                getTaskName: function () {
                    return taskName;
                }
            };
        }


        beforeEach(function () {
            taskRegistry = {
                primaryTask: getFakeTask('saveDocument'),
                secondaryTasks: [getFakeTask('wixApps')]
            };
            var paths = jsonConfig.getPathsInJsonData();
            paths.siteData.push({path: ['metaSiteData'], optional: true});
            DAL = privateServicesHelper.mockPrivateServicesWithRealDAL(null, paths).dal;

            resolveData = {'metaSiteData': 4};
            rejectData = {description: 'testDecription', errorCode: 123};
            this.prepareTest = prepareTest;
        });
        afterEach(function () {
            saveRunner = null; //to force new initialization in tests with succeeding/failing tasks
        });
        describe("For all types of save tasks", function () {
            beforeEach(function () {
                this.willSucceed = function willSucceed(task) {
                    task.partialSave = function (oldData, newData, resolve) {
                        resolve(resolveData);
                    };
                    spyOn(task, 'partialSave').and.callThrough();
                    return task;
                };
                this.willFail = function willFail(task) {
                    task.partialSave = function (oldData, newData, resolve, reject) {
                        reject(rejectData);
                    };
                    spyOn(task, 'partialSave').and.callThrough();
                    return task;
                };
            });
            describe("the last saved state (through DAL history) should work properly", function () {
                it("should call takeSnapshot before saving for all tasks regardless of what the result will be", function (done) {
                    spyOn(utils.log, 'error');
                    function onComplete() {
                        expect(utils.log.error).toHaveBeenCalledWith('Save has failed - please see the failure details below:', jasmine.any(Object));
                        expect(DAL.takeSnapshot).toHaveBeenCalled();
                        expect(DAL.takeSnapshot.calls.argsFor(0)).toEqual(['saveDocument']);
                        expect(DAL.takeSnapshot.calls.argsFor(1)).toEqual(['saveDocumentAutosave']);
                        expect(DAL.takeSnapshot.calls.argsFor(2)).toEqual(['wixApps']);
                        expect(DAL.takeSnapshot.calls.argsFor(3)).toEqual(['wixAppsAutosave']);
                        done();
                    }

                    spyOn(DAL, 'takeSnapshot').and.callThrough();
                    this.prepareTest({onComplete: onComplete, failServices: ['wixApps']});
                    saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                });
                it("should call DAL.removeLastSnapshot for ALL save tasks when the primary task fails", function (done) {
                    spyOn(utils.log, 'error');

                    function onComplete() {
                        expect(utils.log.error).toHaveBeenCalledWith('Save has failed - please see the failure details below:', jasmine.any(Object));
                        expect(DAL.removeLastSnapshot).toHaveBeenCalled();

                        expect(DAL.removeLastSnapshot.calls.argsFor(0)[0]).toEqual('saveDocument');
                        expect(DAL.removeLastSnapshot.calls.argsFor(1)[0]).toEqual('saveDocumentAutosave');
                        expect(DAL.removeLastSnapshot.calls.argsFor(2)[0]).toEqual('wixApps');
                        expect(DAL.removeLastSnapshot.calls.argsFor(3)[0]).toEqual('wixAppsAutosave');
                        done();
                    }

                    spyOn(DAL, 'removeLastSnapshot');
                    this.prepareTest({onComplete: onComplete, failPrimary: true});
                    saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                });
                it("should call DAL.removeLastSnapshot for secondary save tasks when they fail", function (done) {
                    spyOn(utils.log, 'error');
                    function onComplete() {
                        expect(utils.log.error).toHaveBeenCalledWith('Save has failed - please see the failure details below:', jasmine.any(Object));
                        expect(DAL.removeLastSnapshot).toHaveBeenCalled();
                        expect(DAL.removeLastSnapshot.calls.argsFor(0)[0]).toEqual('wixApps');
                        expect(DAL.removeLastSnapshot.calls.argsFor(1)[0]).toEqual('wixAppsAutosave');
                        done();
                    }

                    spyOn(DAL, 'removeLastSnapshot');
                    this.prepareTest({onComplete: onComplete, failServices: ['wixApps']});
                    saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                });
                it("should NOT call DAL.removeLastSnapshot for save tasks which succeed", function (done) {
                    function onComplete() {
                        expect(DAL.removeLastSnapshot).not.toHaveBeenCalled();
                        done();
                    }

                    spyOn(DAL, 'removeLastSnapshot');
                    this.prepareTest({onComplete: onComplete});
                    saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                });
            });
            describe("When the primary task succeeds", function () {
                it("The documentServicesModel should be updated in the data sent to the secondary tasks", function (done) {
                    function onComplete() {
                        var wixAppsSaveArgs = getSecondaryTask(taskRegistry, 'wixApps').partialSave.calls.mostRecent().args;
                        var currentData = wixAppsSaveArgs[1];
                        expect(currentData.get('documentServicesModel').toJS()).toEqual(resolveData.documentServicesModel);
                        done();
                    }

                    resolveData = {'documentServicesModel': {someKey: 'newDocumentServicesModelProperty'}};
                    this.prepareTest({onComplete: onComplete});
                    saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                });
                it("The rendererModel should be updated in the data sent to the secondary tasks", function (done) {
                    function onComplete() {
                        var wixAppsSaveArgs = getSecondaryTask(taskRegistry, 'wixApps').partialSave.calls.mostRecent().args;
                        var currentData = wixAppsSaveArgs[1];
                        expect(currentData.get('rendererModel').toJS()).toEqual(resolveData.rendererModel);
                        done();
                    }

                    resolveData = {'rendererModel': {someKey: 'newRendererModelProperty'}};
                    this.prepareTest({onComplete: onComplete});
                    saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                });
            });

        });
        describe("runPartialSaveTasks", function () {
            beforeEach(function () {
                this.willSucceed = function willSucceed(task) {
                    task.partialSave = function (oldData, newData, resolve) {
                        resolve(resolveData);
                    };
                    spyOn(task, 'partialSave').and.callThrough();
                    return task;
                };
                this.willFail = function willFail(task) {
                    task.partialSave = function (oldData, newData, resolve, reject) {
                        reject(rejectData);
                    };
                    spyOn(task, 'partialSave').and.callThrough();
                    return task;
                };
            });
            it("should be defined", function () {
                this.prepareTest({});
                expect(saveRunner.runPartialSaveTasks).toBeDefined();
                expect(typeof saveRunner.runPartialSaveTasks).toBe('function');
            });
            it("should run the saveDocument when running the save tasks", function () {
                this.prepareTest({});
                saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                expect(taskRegistry.primaryTask.partialSave).toHaveBeenCalled();
            });
            it("should get the old data from the DAL for each save task, using the task name as the tag", function (done) {
                function onComplete() {
                    expect(DAL.full.immutable.getLastSnapshotByTagName).toHaveBeenCalled();
                    expect(DAL.full.immutable.getLastSnapshotByTagName.calls.first().args).toEqual(['saveDocument']);
                    expect(DAL.full.immutable.getLastSnapshotByTagName.calls.mostRecent().args).toEqual(['wixApps']);
                    done();
                }

                spyOn(DAL.full.immutable, 'getLastSnapshotByTagName').and.callThrough();
                this.prepareTest({onComplete: onComplete});

                saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });
            it("should use the initial snapshot if no last snapshot exists", function (done) {
                function onComplete() {
                    expect(DAL.full.immutable.getInitialSnapshot).toHaveBeenCalled();
                    done();
                }

                spyOn(DAL.full.immutable, 'getLastSnapshotByTagName').and.returnValue(undefined); //there should be no last snapshot
                spyOn(DAL.full.immutable, 'getInitialSnapshot').and.callThrough();

                this.prepareTest({onComplete: onComplete});
                saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });
            describe("When save tasks succeed", function () {
                it("should set the data in the DAL according to the {dataPathString: val} that the save was resolved with", function (done) {
                    spyOn(utils.log, 'error');
                    function onComplete() {
                        expect(utils.log.error).toHaveBeenCalledWith('Save has failed - please see the failure details below:', jasmine.any(Object));
                        expect(DAL.full.setByPath).toHaveBeenCalled();
                        var expectedPaths = _.map(resolveData, function (val, key) {
                            return [key.split('.'), val];
                        });
                        expect(DAL.full.setByPath.calls.allArgs()).toContain(expectedPaths);
                        done();
                    }

                    spyOn(DAL.full, 'setByPath').and.callThrough();
                    this.prepareTest({onComplete: onComplete, failServices: ['wixApps']});
                    saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                });
                it("should call the onSuccess function when the save succeeds (all tasks)", function (done) {
                    function onComplete() {
                        expect(onSaveSuccess).toHaveBeenCalled();
                        done();
                    }

                    this.prepareTest({onComplete: onComplete});
                    saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                });
            });
            describe("When save tasks fail", function () {
                it("should call the onError function when the document save fails", function (done) {
                    spyOn(utils.log, 'error');
                    function onComplete() {
                        expect(utils.log.error).toHaveBeenCalledWith('Save has failed - please see the failure details below:', jasmine.any(Object));
                        expect(onSaveError).toHaveBeenCalled();
                        expect(onSaveError.calls.mostRecent().args[0]).toEqual({
                            document: {
                                description: 'testDecription',
                                errorCode: 123
                            }
                        });
                        done();
                    }

                    this.prepareTest({failPrimary: true, onComplete: onComplete});
                    saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                });
                it("should call the onError function when a secondary save fails", function (done) {
                    spyOn(utils.log, 'error');
                    function onComplete() {
                        expect(utils.log.error).toHaveBeenCalledWith('Save has failed - please see the failure details below:', jasmine.any(Object));
                        expect(onSaveError.calls.mostRecent().args[0]).toEqual({
                            wixApps: {
                                description: 'testDecription',
                                errorCode: 123
                            }
                        });
                        done();
                    }

                    this.prepareTest({failServices: ['wixApps'], onComplete: onComplete});
                    saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                });
                it("should provide a detailed report", function (done) {
                    spyOn(utils.log, 'error');
                    function onComplete() {
                        expect(utils.log.error).toHaveBeenCalledWith('Save has failed - please see the failure details below:', jasmine.any(Object));
                        expect(onSaveError.calls.mostRecent().args[0]).toEqual({
                            fakeTask: {
                                description: 'testDecription',
                                errorCode: 123
                            }, wixApps: {description: 'testDecription', errorCode: 123}
                        });
                        done();
                    }

                    this.prepareTest({failServices: ['wixApps'], onComplete: onComplete, mockFail: ['fakeTask']});
                    saveRunner.runPartialSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
                });
            });
        });

        describe("runPublishTasks", function () {
            beforeEach(function () {
                this.willSucceed = function willSucceed(task) {
                    task.publish = function (dataObj, resolve) {
                        resolve(resolveData);
                    };
                    spyOn(task, 'publish').and.callThrough();
                    return task;
                };
                this.willFail = function willFail(task) {
                    task.publish = function (dataObj, resolve, reject) {
                        reject(rejectData);
                    };
                    spyOn(task, 'publish').and.callThrough();
                    return task;
                };
            });
            it("should be defined", function () {
                this.prepareTest();
                expect(saveRunner.runPublishTasks).toBeDefined();
                expect(typeof saveRunner.runPublishTasks).toBe('function');
            });
            it("should run the publish functions, if they were defined", function (done) {
                function onComplete() {
                    expect(taskRegistry.primaryTask.publish).toHaveBeenCalled();
                    expect(getSecondaryTask(taskRegistry, 'fakeService').publish).toHaveBeenCalled();
                    done();
                }

                this.prepareTest({onComplete: onComplete, mockPass: ['fakeService']});
                saveRunner.runPublishTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });
            it('should get the last saved snapshot to publish from', function (done) {
                var primaryTaskName = taskRegistry.primaryTask.getTaskName();
                var secondaryTaskName = 'fakeService';

                function onComplete() {
                    var lastPrimarySnapshot = jasmine.any(Object); //the snapshot is altered for the publish, with the updated rendererModel and DSmodel - so this scenario is checked more specifically in the next test
                    var lastSecondarySnapshot = DAL.full.immutable.getLastSnapshotByTagName(secondaryTaskName);
                    expect(taskRegistry.primaryTask.publish).toHaveBeenCalledWith(lastPrimarySnapshot, jasmine.any(Function), jasmine.any(Function), fakeBiCallbacks);
                    expect(getSecondaryTask(taskRegistry, secondaryTaskName).publish).toHaveBeenCalledWith(lastSecondarySnapshot, jasmine.any(Function), jasmine.any(Function), fakeBiCallbacks);
                    done();
                }

                this.prepareTest({onComplete: onComplete, mockPass: [secondaryTaskName]});
                DAL.takeSnapshot(primaryTaskName);
                DAL.takeSnapshot(secondaryTaskName);
                saveRunner.runPublishTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });
            it('should receive the current metasiteId and siteId in the snapshot (after firstSave, it is not updated properly.. this test is here to ensure it stays fixed, although the fix is hacky)', function (done) {
                //the reason the fix (in saverunner) is hacky, is because we can't take a new snapshot, since between the first save and the publish the user may have changed something.
                //also, the DAL doesn't let us 'edit' an old snapshot, so we need to somehow ensure that the 'snapshot' the tasks receive has the correct data
                function onComplete() {
                    var snapshotSentToPublish = taskRegistry.primaryTask.publish.calls.mostRecent().args[0];
                    expect(snapshotSentToPublish.getIn(['rendererModel', 'metaSiteId'])).toEqual('newMetaSiteId');
                    expect(snapshotSentToPublish.getIn(['rendererModel', 'siteInfo', 'siteId'])).toEqual('newSiteId');
                    done();
                }

                this.prepareTest({onComplete: onComplete});
                var primaryTaskName = taskRegistry.primaryTask.getTaskName();
                DAL.takeSnapshot(primaryTaskName);
                DAL.full.setByPath(['rendererModel', 'metaSiteId'], 'newMetaSiteId');
                DAL.full.setByPath(['rendererModel', 'siteInfo', 'siteId'], 'newSiteId');
                saveRunner.runPublishTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });
            it('should get the inital snapshot to publish from, if there was no last snapshot', function (done) {
                function onComplete() {
                    expect(DAL.full.immutable.getInitialSnapshot).toHaveBeenCalled();
                    done();
                }

                spyOn(DAL.full.immutable, 'getLastSnapshotByTagName').and.returnValue(undefined); //there should be no last snapshot
                spyOn(DAL.full.immutable, 'getInitialSnapshot').and.callThrough();

                this.prepareTest({onComplete: onComplete, mockPass: ['fakeService']});
                saveRunner.runPublishTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });
            it("should set the data in the DAL according to the {dataPathString: val} that the publish was resolved with", function (done) {
                function onComplete() {
                    expect(DAL.full.setByPath).toHaveBeenCalled();
                    var expectedArgsForSet = _.map(resolveData, function (val, key) {
                        return [key.split('.'), val];
                    });
                    expect(DAL.full.setByPath.calls.allArgs()).toContain(expectedArgsForSet);
                    done();
                }

                spyOn(DAL.full, 'setByPath').and.callThrough();
                this.prepareTest({onComplete: onComplete});
                saveRunner.runPublishTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });

        });
        describe("runFullSaveTasks", function () {
            beforeEach(function () {
                this.willSucceed = function willSucceed(task) {
                    task.fullSave = function (lastSavedData, currentData, resolve) {
                        resolve(resolveData);
                    };
                    spyOn(task, 'fullSave').and.callThrough();
                    return task;
                };
                this.willFail = function willFail(task) {
                    task.fullSave = function (lastSavedData, currentData, resolve, reject) {
                        reject(rejectData);
                    };
                    spyOn(task, 'fullSave').and.callThrough();
                    return task;
                };
            });
            it("should be defined", function () {
                this.prepareTest();
                expect(saveRunner.runFullSaveTasks).toBeDefined();
                expect(typeof saveRunner.runFullSaveTasks).toBe('function');
            });
            it("should run the fullSave functions, if they were defined", function (done) {
                function onComplete() {
                    expect(taskRegistry.primaryTask.fullSave).toHaveBeenCalled();
                    expect(getSecondaryTask(taskRegistry, 'fakeService').fullSave).toHaveBeenCalled();
                    done();
                }

                this.prepareTest({onComplete: onComplete, mockPass: ['fakeService']});
                saveRunner.runFullSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });
        });
        describe("runFirstSaveTasks", function () {
            beforeEach(function () {
                this.willSucceed = function willSucceed(task) {
                    task.firstSave = function (lastSavedData, currentData, resolve) {
                        resolve(resolveData);
                    };
                    spyOn(task, 'firstSave').and.callThrough();
                    return task;
                };
                this.willFail = function willFail(task) {
                    task.firstSave = function (lastSavedData, currentData, resolve, reject) {
                        reject(rejectData);
                    };
                    spyOn(task, 'firstSave').and.callThrough();
                    return task;
                };
            });
            it("should be defined", function () {
                this.prepareTest();
                expect(saveRunner.runFirstSaveTasks).toBeDefined();
                expect(typeof saveRunner.runFirstSaveTasks).toBe('function');
            });
            it("should run the firstSave functions, if they were defined", function (done) {
                function onComplete() {
                    expect(taskRegistry.primaryTask.firstSave).toHaveBeenCalled();
                    expect(getSecondaryTask(taskRegistry, 'fakeService').firstSave).toHaveBeenCalled();
                    done();
                }

                this.prepareTest({onComplete: onComplete, mockPass: ['fakeService']});
                saveRunner.runFirstSaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });
        });
        describe("runAutosaveTasks", function () {
            beforeEach(function () {
                this.willSucceed = function willSucceed(task) {
                    task.autosave = function (lastSavedData, currentData, resolve) {
                        resolve(resolveData);
                    };
                    spyOn(task, 'autosave').and.callThrough();
                    return task;
                };
                this.willFail = function willFail(task) {
                    task.autosave = function (lastSavedData, currentData, resolve, reject) {
                        reject(rejectData);
                    };
                    spyOn(task, 'autosave').and.callThrough();
                    return task;
                };
            });
            it('should be defined', function () {
                this.prepareTest();
                expect(saveRunner.runAutosaveTasks).toBeDefined();
                expect(typeof saveRunner.runAutosaveTasks).toBe('function');
            });

            it('should run the autosave functions, if they were defined', function (done) {
                function onComplete() {
                    expect(taskRegistry.primaryTask.autosave).toHaveBeenCalled();
                    expect(getSecondaryTask(taskRegistry, 'fakeService').autosave).toHaveBeenCalled();
                    done();
                }

                this.prepareTest({onComplete: onComplete, mockPass: ['fakeService']});
                saveRunner.runAutosaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });

            it('should NOT update documentServicesModel.autoSaveInfo.previousDiffId if version has changed', function (done) {
                function onComplete() {
                    expect(taskRegistry.primaryTask.autosave).toHaveBeenCalled();
                    expect(DAL.full.getByPath(['documentServicesModel', 'autoSaveInfo', 'previousDiffId'])).toEqual(null);
                    done();
                }

                delete taskRegistry.secondaryTasks;  // Don't need it for this test
                DAL.full.setByPath(['documentServicesModel', 'autoSaveInfo'], {previousDiffId: null});
                DAL.full.setByPath(['documentServicesModel', 'version'], 1);
                resolveData = {'metaSiteData': 4, 'documentServicesModel.autoSaveInfo.previousDiffId': 123};

                this.willSucceed = function willSucceed(task) {
                    task.autosave = function (lastSavedData, currentData, resolve) {
                        DAL.full.setByPath(['documentServicesModel', 'version'], 2);  // Update the site version in DAL (as if there was a partial update during the auto-save)
                        resolve(resolveData);
                    };
                    spyOn(task, 'autosave').and.callThrough();
                    return task;
                };

                this.prepareTest({onComplete: onComplete});
                saveRunner.runAutosaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });

            it('should rollback autosave snapshot if failed', function (done) {
                spyOn(utils.log, 'error');

                function onComplete() {
                    expect(utils.log.error).toHaveBeenCalledWith('Save has failed - please see the failure details below:', jasmine.any(Object));
                    expect(DAL.removeLastSnapshot).toHaveBeenCalled();
                    expect(DAL.removeLastSnapshot.calls.argsFor(0)[0]).toEqual('saveDocumentAutosave');
                    done();
                }

                spyOn(DAL, 'removeLastSnapshot');
                this.prepareTest({onComplete: onComplete, failPrimary: true});
                saveRunner.runAutosaveTasks(DAL, onSaveSuccess, onSaveError, fakeBiCallbacks);
            });
        });
    });
});
