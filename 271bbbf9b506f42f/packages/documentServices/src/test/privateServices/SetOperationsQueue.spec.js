define(['lodash', 'testUtils',
    'documentServices/anchors/anchors',
    'definition!documentServices/siteAccessLayer/SetOperationsQueue',
    'definition!documentServices/siteAccessLayer/SiteUpdatesHandler',
    'fake!documentServices/siteAccessLayer/postUpdateOperations',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/utils/utils',
    'experiment',
    'utils'
], function (_, testUtils, anchors, setOperationsQueueDef, siteUpdatesHandlerDef, fakePostUpdateOperations, privateServicesHelper, dsUtils, experiment, utils) {
    "use strict";

   describe("SetOperationsQueue", function () {
        var setOperationsQueue;
        var SiteUpdatesHandler = siteUpdatesHandlerDef(_, anchors, fakePostUpdateOperations, dsUtils, {isOpen: _.noop});
        var SetOperationsQueue = setOperationsQueueDef(_, SiteUpdatesHandler, {animationFrame: {request: _.delay}, log: utils.log}, experiment);
        var privateServices;

        function initTest() {
            privateServices = privateServicesHelper.mockPrivateServices();
            setOperationsQueue = new SetOperationsQueue(privateServices);
        }

        afterEach(function () {
            setOperationsQueue.dispose();
        });
        describe("execution of single queue item", function () {
            it("should call the data operation with the passed args", function (done) {
                initTest();
                var dataOperation = jasmine.createSpy('dataOp');
                var args = [1, 2];

                setOperationsQueue.runSetOperation(dataOperation, args);

                setOperationsQueue.waitForChangesApplied(function () {
                    expect(dataOperation).toHaveBeenCalled();
                    expect(_.pick(dataOperation.calls.mostRecent(), 'args', 'object')).toEqual({
                        object: window,
                        args: args
                    });
                    done();
                });
            });

            it("should call the registered callback of the operation", function (done) {
                initTest();
                var dataOperation = jasmine.createSpy('dataOp');
                var handle = setOperationsQueue.runSetOperation(dataOperation);
                setOperationsQueue.registerToSetOperationDone(handle, function () {
                    expect(dataOperation).toHaveBeenCalled();
                    done();
                });
            });

            it("should call the data operation with the passed args of queued item", function (done) {
                initTest();
                var dataOperation = jasmine.createSpy('dataOp');
                var args = [1, 2];

                setOperationsQueue.runSetOperation(_.noop);
                var handle = setOperationsQueue.runSetOperation(dataOperation, args);

                setOperationsQueue.registerToSetOperationDone(handle, function () {
                    expect(dataOperation).toHaveBeenCalled();
                    expect(_.pick(dataOperation.calls.mostRecent(), 'args', 'object')).toEqual({
                        object: window,
                        args: args
                    });
                    done();
                });
            });

            it("should update anchors registered during the set operation", function () {
                initTest();
            });

            it("should update site after operation done", function (done) {
                initTest();
                var forceUpdate = spyOn(privateServices.siteAPI, 'forceUpdate').and.callThrough();
                setOperationsQueue.runSetOperation(_.noop);
                setOperationsQueue.waitForChangesApplied(function () {
                    expect(forceUpdate).toHaveBeenCalled();
                    done();
                });
            });

            it("should treat operation as async if isAsyncOperation is a function returning true", function(done){
                initTest();
                var operation = jasmine.createSpy('otherOp').and.callFake(function(){
                    expect(otherOperation).not.toHaveBeenCalled();
                    setOperationsQueue.asyncSetOperationComplete();
                });
                var otherOperation = jasmine.createSpy('otherOp');
                var asyncOp = function(){
                    _.defer(operation);
                };

                setOperationsQueue.runSetOperation(asyncOp, null, {isAsyncOperation: function(){
                    return true;
                }});
                setOperationsQueue.runSetOperation(otherOperation);

                setOperationsQueue.waitForChangesApplied(function () {
                    expect(operation).toHaveBeenCalled();
                    expect(otherOperation).toHaveBeenCalled();
                    done();
                });
            });

            it("should treat operation as sync if isAsyncOperation is a function returning false", function(done){
                initTest();
                var operation = jasmine.createSpy('otherOp').and.callFake(function(){
                    expect(otherOperation).toHaveBeenCalled();
                    done();
                });

                var otherOperation = jasmine.createSpy('otherOp');
                var asyncOp = function(){
                    _.defer(operation);
                };

                setOperationsQueue.runSetOperation(asyncOp, null, {isAsyncOperation: function(){
                    return false;
                }});
                setOperationsQueue.runSetOperation(otherOperation);
                setOperationsQueue.waitForChangesApplied(function () {
                    expect(operation).not.toHaveBeenCalled();
                    expect(otherOperation).toHaveBeenCalled();
                });
            });


            it("should update site after async operation is done", function (done) {
                initTest();
                var forceUpdate = spyOn(privateServices.siteAPI, 'forceUpdate').and.callThrough();
                var operation = function () {
                    setTimeout(function () {
                        expect(forceUpdate).not.toHaveBeenCalled();
                        setOperationsQueue.asyncSetOperationComplete();
                    }, 5);
                };
                setOperationsQueue.runSetOperation(operation, null, {isAsyncOperation: true});
                setOperationsQueue.waitForChangesApplied(function () {
                    expect(forceUpdate).toHaveBeenCalled();
                    done();
                });
            });

            it("should register error if thrown during an async operation", function (done) {
                initTest();
                spyOn(utils.log, 'error');

                var errorThrown = function (errorInfo) {
                    expect(errorInfo.error).toBe("ERROR");
                    expect(errorInfo.methodName).toBe('method');
                    expect(utils.log.error).toHaveBeenCalledWith('ERROR');
                    setOperationsQueue.unRegisterFromErrorThrown(errorThrown);
                    _.defer(done);
                };
                setOperationsQueue.registerToErrorThrown(errorThrown);
                var operation = function () {
                    setTimeout(function () {
                        setOperationsQueue.asyncSetOperationComplete("ERROR");
                    }, 5);
                };
                setOperationsQueue.runSetOperation(operation, null, {
                    methodName: 'method',
                    isAsyncOperation: true
                });
            });

            it("should not update site if operation failed", function (done) {
                initTest();
                var forceUpdate = spyOn(privateServices.siteAPI, 'forceUpdate');
                spyOn(utils.log, 'error');
                setOperationsQueue.runSetOperation(function () {
                    throw "error";
                });
                setOperationsQueue.waitForChangesApplied(function () {
                    expect(forceUpdate).not.toHaveBeenCalled();
                    expect(utils.log.error).toHaveBeenCalledWith('error');
                    done();
                });
            });

            it("should run done callbacks if operation failed", function (done) {
                initTest();
                spyOn(utils.log, 'error');
                var error = new Error("Error");

                function operation() {
                    throw error;
                }

                var errorHandler = jasmine.createSpy('errorHandler');
                setOperationsQueue.registerToErrorThrown(errorHandler);
                setOperationsQueue.runSetOperation(operation);
                setOperationsQueue.waitForChangesApplied(function () {
                    expect(errorHandler).toHaveBeenCalled();
                    done();
                });
            });

            it("should skip operation if shouldRender method returns false", function (done) {
                initTest();
                var dataOperation = jasmine.createSpy('dataOp');
                var args = [1, 2];
                var params = {
                    shouldExecOp: jasmine.createSpy('dataOp').and.returnValue(false)
                };

                setOperationsQueue.runSetOperation(dataOperation, args, params);

                setOperationsQueue.waitForChangesApplied(function () {
                    expect(params.shouldExecOp).toHaveBeenCalled();
                    expect(params.shouldExecOp.calls.mostRecent().args).toEqual(args);
                    expect(dataOperation).not.toHaveBeenCalled();
                    done();
                });
            });

            it("should execute operation if shouldRender method returns true", function (done) {
                initTest();
                var dataOperation = jasmine.createSpy('dataOp');
                var args = [1, 2];
                var params = {
                    shouldExecOp: jasmine.createSpy('dataOp').and.returnValue(true)
                };

                setOperationsQueue.runSetOperation(dataOperation, args, params);
                setOperationsQueue.runSetOperation(dataOperation, args, params);

                setOperationsQueue.waitForChangesApplied(function () {
                    expect(params.shouldExecOp).toHaveBeenCalled();
                    expect(params.shouldExecOp.calls.mostRecent().args).toEqual(args);
                    expect(dataOperation).toHaveBeenCalled();
                    done();
                });
            });

            it("should execute operation if value is changed before condition is checked", function (done) {
                initTest();
                var flag = false;
                var dataOperation = jasmine.createSpy('dataOp');
                var args = [1, 2];
                var params = {
                    shouldExecOp: function () {
                        return flag;
                    }
                };

                setOperationsQueue.runSetOperation(function () { flag = true; }, args, {});
                setOperationsQueue.runSetOperation(dataOperation, args, params);

                setOperationsQueue.waitForChangesApplied(function () {
                    expect(dataOperation).toHaveBeenCalled();
                    done();
                });
            });

            it("should register failure", function () {
                initTest();
            });

            it("should reverse all data changes on failure", function () {
                initTest();
            });
        });

        describe("queue behavior", function () {
            it("should perform the set operation after an anim frame if no update in process and queue empty", function (done) {
                initTest();
                var dataOperation = jasmine.createSpy('dataOp');
                setOperationsQueue.runSetOperation(dataOperation);
                setOperationsQueue.waitForChangesApplied(function () {
                    expect(dataOperation).toHaveBeenCalled();
                    done();
                });
            });

            it("should add to queue if site is busy for other reasons", function () {
                initTest();
            });

            it("should batch set operations called one after the other", function (done) {
                initTest();
                var dataOperation1 = jasmine.createSpy('dataOp1');
                var dataOperation2 = jasmine.createSpy('dataOp2');

                var handle1 = setOperationsQueue.runSetOperation(dataOperation2);
                setOperationsQueue.runSetOperation(dataOperation1);

                setOperationsQueue.registerToSetOperationDone(handle1, function () {
                    expect(dataOperation1).toHaveBeenCalled();
                    expect(dataOperation2).toHaveBeenCalled();
                    done();
                });

            });

            //changed the mocked forceUpdate to be sync so this is a problem..
            it("should add the set operation as new item to queue if update in process and queue empty", function (done) {
                initTest();
                privateServices.siteAPI.makeForceUpdateAsync();
                var dataOperation = jasmine.createSpy('dataOp');

                var handle1 = setOperationsQueue.runSetOperation(_.noop);

                _.delay(function () {
                    var handle2 = setOperationsQueue.runSetOperation(dataOperation);
                    expect(dataOperation).not.toHaveBeenCalled();
                    setOperationsQueue.registerToSetOperationDone(handle2, function () {
                        expect(dataOperation).toHaveBeenCalled();
                        done();
                    });
                });

                setOperationsQueue.registerToSetOperationDone(handle1, function () {
                    expect(dataOperation).not.toHaveBeenCalled();
                });
            });

            it("should add the data operation as new item to queue if queue not empty", function (done) {
                initTest();
                var dataOperation = jasmine.createSpy('dataOp');

                setOperationsQueue.runSetOperation(_.noop);
                var handle1 = setOperationsQueue.runSetOperation(_.noop);
                var handle2 = setOperationsQueue.runSetOperation(dataOperation, [], {isUpdatingAnchors: dsUtils.YES});

                setOperationsQueue.registerToSetOperationDone(handle1, function () {
                    expect(dataOperation).not.toHaveBeenCalled();
                });
                setOperationsQueue.registerToSetOperationDone(handle2, function () {
                    expect(dataOperation).toHaveBeenCalled();
                    done();
                });
            });

            it("should add the data operation as existing item to queue if queue compatible", function (done) {
                initTest();
                var dataOperation = jasmine.createSpy('dataOp');

                setOperationsQueue.runSetOperation(_.noop);
                var handle = setOperationsQueue.runSetOperation(_.noop);
                setOperationsQueue.runSetOperation(dataOperation, [], {isUpdatingAnchors: dsUtils.DONT_CARE});

                setOperationsQueue.registerToSetOperationDone(handle, function () {
                    expect(dataOperation).toHaveBeenCalled();
                    done();
                });
            });

            it("should execute all together if Q is empty, and of same type", function (done) {
                initTest();
                var dataOperation1 = jasmine.createSpy('dataOp1');
                var dataOperation2 = jasmine.createSpy('dataOp2');
                var dataOperation3 = jasmine.createSpy('dataOp3');

                var handle = setOperationsQueue.runSetOperation(dataOperation1);
                setOperationsQueue.runSetOperation(dataOperation2);
                setOperationsQueue.runSetOperation(dataOperation3);

                setOperationsQueue.registerToSetOperationDone(handle, function () {
                    expect(dataOperation1).toHaveBeenCalled();
                    expect(dataOperation2).toHaveBeenCalled();
                    expect(dataOperation3).toHaveBeenCalled();
                    done();
                });
            });

            it("should add operations to Q and then execute in single batch if different type", function (done) {
                initTest();
                var dataOperation1 = jasmine.createSpy('dataOp1');
                var dataOperation2 = jasmine.createSpy('dataOp2');

                var dataOperation3 = jasmine.createSpy('dataOp3');
                var dataOperation4 = jasmine.createSpy('dataOp4');

                setOperationsQueue.runSetOperation(dataOperation1);
                var handle1 = setOperationsQueue.runSetOperation(dataOperation2);

                var handle2 = setOperationsQueue.runSetOperation(dataOperation3, [], {isUpdatingAnchors: dsUtils.YES});
                setOperationsQueue.runSetOperation(dataOperation4, [], {isUpdatingAnchors: dsUtils.YES});

                setOperationsQueue.registerToSetOperationDone(handle1, function () {
                    expect(dataOperation2).toHaveBeenCalled();
                    expect(dataOperation3).not.toHaveBeenCalled();
                });

                setOperationsQueue.registerToSetOperationDone(handle2, function () {
                    expect(dataOperation3).toHaveBeenCalled();
                    expect(dataOperation4).toHaveBeenCalled();
                    done();
                });
            });

            it("should work correctly if items added inside done callback", function (done) {
                initTest();
                var dataOperation1 = jasmine.createSpy('dataOp1');
                var dataOperation2 = jasmine.createSpy('dataOp2');
                var dataOperation3 = jasmine.createSpy('dataOp3');

                setOperationsQueue.runSetOperation(dataOperation1);
                setOperationsQueue.waitForChangesApplied(function () {
                    setOperationsQueue.runSetOperation(dataOperation2);
                    setOperationsQueue.runSetOperation(dataOperation3);
                    setOperationsQueue.waitForChangesApplied(function () {
                        expect(dataOperation2).toHaveBeenCalled();
                        expect(dataOperation3).toHaveBeenCalled();
                        done();
                    });
                });
            });
        });

        describe("order of things after operation done", function () {
            function registerCall(name) {
                this.calls.push(name);
            }

            function runDataOperation(scope, dataOperation, params, done) {
                var nextOperation = jasmine.createSpy('nextOperation').and.callFake(registerCall.bind(scope, 'nextOperation'));

                setOperationsQueue.runSetOperation(dataOperation, [], params);
                scope.calls.push('editorCode');
                setOperationsQueue.waitForChangesApplied(scope.waitFor);

                setOperationsQueue.runSetOperation(nextOperation, [], {isUpdatingAnchors: dsUtils.YES});
                setOperationsQueue.waitForChangesApplied(done);
            }

            beforeEach(function () {
                initTest();
                this.calls = [];

                this.onError = jasmine.createSpy('error').and.callFake(registerCall.bind(this, 'error'));
                this.onSiteChanged = jasmine.createSpy('siteChanged').and.callFake(registerCall.bind(this, 'siteChanged'));
                this.waitFor = jasmine.createSpy('waitFor').and.callFake(registerCall.bind(this, 'waitFor'));

                setOperationsQueue.registerToSiteChanged(this.onSiteChanged);
                setOperationsQueue.registerToErrorThrown(this.onError);

            });

            var expectedOrderWithSingleOpInBatch = ['editorCode', 'dataOp1', 'waitFor', 'siteChanged', 'nextOperation'];

            it("should keep order when no error and sync operation", function (done) {
                var dataOperation = jasmine.createSpy('dataOp1').and.callFake(registerCall.bind(this, 'dataOp1'));
                //var dataOperation1 = jasmine.createSpy('dataOp1');
                runDataOperation(this, dataOperation, {}, function () {
                    expect(this.calls).toEqual(expectedOrderWithSingleOpInBatch);
                    done();
                }.bind(this));
            });

            it("should keep order when operation is real async", function (done) {
                var self = this;
                var dataOperation1 = jasmine.createSpy('dataOp1').and.callFake(function () {
                    _.defer(function () {
                        registerCall.call(self, 'dataOp1');
                        setOperationsQueue.asyncSetOperationComplete();
                    });
                });

                runDataOperation(this, dataOperation1, {isAsyncOperation: true}, function () {
                    expect(this.calls).toEqual(expectedOrderWithSingleOpInBatch);
                    done();
                }.bind(this));
            });

            it("should keep order when operation is fake async", function (done) {
                var dataOperation1 = jasmine.createSpy('dataOp1').and.callFake(function () {
                    registerCall.call(this, 'dataOp1');
                    setOperationsQueue.asyncSetOperationComplete();
                }.bind(this));

                runDataOperation(this, dataOperation1, {isAsyncOperation: true}, function () {
                    expect(this.calls).toEqual(expectedOrderWithSingleOpInBatch);
                    done();
                }.bind(this));
            });

            it("should keep order if operation throws error", function (done) {
                var dataOperation1 = jasmine.createSpy('dataOp1').and.callFake(function () {
                    registerCall.call(this, 'dataOp1');
                    throw new Error('err');
                }.bind(this));

                //we want the error callback called before the wait for changes
                var expectedOrder = _.clone(expectedOrderWithSingleOpInBatch);
                expectedOrder.splice(2, 0, 'error');
                runDataOperation(this, dataOperation1, {}, function () {
                    expect(this.calls).toEqual(expectedOrder);
                    done();
                }.bind(this));
            });

            it("should run all batched operation syncly, if the operations themselves are sync", function (done) {
                var firstDataOp = jasmine.createSpy('firstDataOp').and.callFake(registerCall.bind(this, 'firstDataOp'));
                var secondDataOp = jasmine.createSpy('secondDataOp').and.callFake(registerCall.bind(this, 'secondDataOp'));

                setOperationsQueue.runSetOperation(firstDataOp);
                setOperationsQueue.runSetOperation(secondDataOp);
                this.calls.push('editorCode');
                _.defer(function () {
                    this.calls.push('deferredEditorCode');
                }.bind(this));

                setOperationsQueue.waitForChangesApplied(function () {
                    expect(this.calls).toEqual(['editorCode', 'firstDataOp', 'secondDataOp']);
                    done();
                }.bind(this));
            });

            it("should call the wait for and callbacks in the order registered", function () {
                this.someCallback = jasmine.createSpy('someCallback').and.callFake(registerCall.bind(this, 'someCallback'));
            });

            it("should call execute after current operation done before all else", function (done) {
                this.executeAfterCurrent = jasmine.createSpy('executeAfterCurrent').and.callFake(registerCall.bind(this, 'executeAfterCurrent'));
                var dataOperation1 = jasmine.createSpy('dataOp1').and.callFake(function () {
                    setOperationsQueue.executeAfterCurrentOperationDone(this.executeAfterCurrent);
                    registerCall.call(this, 'dataOp1');
                }.bind(this));

                //should be called after the data operation but before the wait for
                var expectedOrder = _.clone(expectedOrderWithSingleOpInBatch);
                expectedOrder.splice(2, 0, 'executeAfterCurrent');
                runDataOperation(this, dataOperation1, {}, function () {
                    expect(this.calls).toEqual(expectedOrder);
                    done();
                }.bind(this));
            });
        });

        describe("the set operation done callbacks", function () {
            beforeEach(function() {
                initTest();
            });
            it("should call the callbacks registered to different operations in the correct order", function (done) {
                var handle1 = setOperationsQueue.runSetOperation(_.noop);
                var handle2 = setOperationsQueue.runSetOperation(_.noop);
                var handle3 = setOperationsQueue.runSetOperation(_.noop);

                var update1Done = false;
                var update2Done = false;
                setOperationsQueue.registerToSetOperationDone(handle1, function () {
                    update1Done = true;
                });
                setOperationsQueue.registerToSetOperationDone(handle2, function () {
                    expect(update1Done).toBeTruthy();
                    update2Done = true;
                });
                setOperationsQueue.registerToSetOperationDone(handle3, function () {
                    expect(update1Done).toBeTruthy();
                    expect(update2Done).toBeTruthy();
                    done();
                });
            });

            it("should call the callbacks before running the next queue item, if not batched", function (done) {
                var dataOperation = jasmine.createSpy('dataOp');
                var handle = setOperationsQueue.runSetOperation(_.noop, [], {noBatchingAfter: true});
                setOperationsQueue.runSetOperation(dataOperation);
                setOperationsQueue.registerToSetOperationDone(handle, function () {
                    expect(dataOperation).not.toHaveBeenCalled();
                    done();
                });
            });

            it("should call multiple callbacks registered with the same handle", function (done) {
                var handle = setOperationsQueue.runSetOperation(_.noop);
                var callback1 = jasmine.createSpy('callback');
                setOperationsQueue.registerToSetOperationDone(handle, callback1);
                setOperationsQueue.registerToSetOperationDone(handle, function () {
                    expect(callback1).toHaveBeenCalled();
                    done();
                });
            });

            it("should call the callback even if it was registered after the operation finished", function (done) {
                var handle = setOperationsQueue.runSetOperation(_.noop);
                setOperationsQueue.registerToSetOperationDone(handle, function () {
                    setTimeout(function () {
                        setOperationsQueue.registerToSetOperationDone(handle, function () {
                            done();
                        });
                    }, 5);
                });
            });

            it("should call the callback registered to a specific update only once", function (done) {
                var callback = jasmine.createSpy('callback');
                var handle = setOperationsQueue.runSetOperation(_.noop);
                setOperationsQueue.registerToSetOperationDone(handle, callback);
                setOperationsQueue.runSetOperation(_.noop);
                var handle2 = setOperationsQueue.runSetOperation(_.noop);
                setOperationsQueue.registerToSetOperationDone(handle2, function () {
                    expect(callback.calls.count()).toBe(1);
                    done();
                });
            });
        });

        describe("flushUpdatesUpToHereAndExecute - run code after all operations are done", function () {
            beforeEach(function() {
                initTest();
            });

            it("should execute immediately if queue is empty and and not busy", function () {
                var callback = jasmine.createSpy('callback');
                setOperationsQueue.flushQueueAndExecute(callback);
                expect(callback).toHaveBeenCalled();
            });

            it("should execute after the running operation is done if queue is empty but is busy", function (done) {
                setOperationsQueue.runSetOperation(_.noop);
                var dataOperation = jasmine.createSpy('dataOp');

                var callback = jasmine.createSpy('callback').and.callFake(function () {
                    expect(dataOperation).not.toHaveBeenCalled();
                    done();
                });
                setOperationsQueue.flushQueueAndExecute(callback);

                expect(callback).not.toHaveBeenCalled();
                setOperationsQueue.runSetOperation(dataOperation);
            });

            it("should execute after all currently present items in the queue", function (done) {
                setOperationsQueue.runSetOperation(_.noop);
                var handle = setOperationsQueue.runSetOperation(_.noop);
                var updateCallback = jasmine.createSpy('updateCallback');
                setOperationsQueue.registerToSetOperationDone(handle, updateCallback);

                setOperationsQueue.flushQueueAndExecute(function () {
                    expect(updateCallback).toHaveBeenCalled();
                    done();
                });

            });

            //TODO: batching
            it("should stop the batching progress", function () {

            });
        });

    });
});
