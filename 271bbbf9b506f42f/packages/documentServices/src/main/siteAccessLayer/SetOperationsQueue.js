define(['lodash', 'documentServices/siteAccessLayer/SiteUpdatesHandler', 'utils'], function(_, SiteUpdatesHandler, utils){
    "use strict";

    var privateScopes = {};

    function getMaybeFunctionParamValue(queueItem, functionFieldName, defaultValue){
        var value = _.get(queueItem, functionFieldName, defaultValue);
        if (_.isFunction(value)){
            value = value.apply(null, queueItem.args);
        }
        return value;
    }

    function PrivateScope(privateServices){
        this.updateHandlesCounter = 1;
        this.queue = [];
        this.doneCallbacks = {};
        this.itemCurrentlyRunning = null;
        this.lastUpdateFinished = null;
        this.failed = {};
        this.siteUpdatesHandler = new SiteUpdatesHandler(privateServices, this.onSiteUpdated.bind(this));
        this.onErrorCallbacks = [];
        this.siteUpdatedCallbacks = [];
        this.isDebug = privateServices.siteAPI.isDebugMode();
    }

    PrivateScope.prototype = {

        runSetOperationNow: function(queueItem){
            queueItem.isRealAsyncOperation = getMaybeFunctionParamValue(queueItem, 'isAsyncOperation');
            queueItem.params.waitingForTransition = getMaybeFunctionParamValue(queueItem, 'params.waitingForTransition');

            this.itemCurrentlyRunning = queueItem;
            var isFirstInBatch = this.siteUpdatesHandler.addItemToUpdateBatch(queueItem.handle, queueItem.params);
            if (isFirstInBatch){
                utils.animationFrame.request(this._runOperation.bind(this, queueItem));
            } else {
                this._runOperation(queueItem);
            }
        },

        _runOperation: function(queueItem){
            if (getMaybeFunctionParamValue(queueItem, 'params.shouldExecOp', true)) {
                try {
                    queueItem.operation.apply(null, queueItem.args);
                } catch (e) {
                    this.handleFailure(queueItem, e);
                    return;
                }
            } else {
                this.siteUpdatesHandler.removeItemFromUpdateBatch(queueItem.handle);
            }
            //if it is an async operation it should call asyncSetOperationComplete which will run next step
            if (!queueItem.isRealAsyncOperation){
                this.runNextStepInQueue();
            }
        },

        //TODO: set snapshot!!
        handleFailure: function(queueItem, exception){
            this.failed[queueItem.handle] = exception;
            this.siteUpdatesHandler.removeItemFromUpdateBatch(queueItem.handle);
            this.itemCurrentlyRunning = null;
//            var snapshot = this.ps.dal.getSnapshotByTagAndIndex('setOperationsQueue', queueItem.snapshot);
            utils.log.error(exception);
            _.forEach(this.onErrorCallbacks, function(callback){
                callback({error: exception, methodName: queueItem.params.methodName, handle: queueItem.handle});
            });

            if (this.isDebug && !window.karmaIntegration && !window.__karma__){
                /*eslint block-scoped-var:0*/
                /*eslint no-undef:0*/
                /*eslint no-alert:0*/
                window.alert("you have error (in DS) !!! look at the console");
            }
            this.runNextStepInQueue();
        },

        runDoneCallbacks: function(handle){
            var maybeFailed = this.failed[handle];
            _.forEach(this.doneCallbacks[handle], function(callback){
                callback(maybeFailed);
            });
            delete this.doneCallbacks[handle];
        },

        runNextStepInQueue: function(){
            if (this.disposed){
                return;
            }
            var nextItem = this.queue[0];
            if (nextItem && this.siteUpdatesHandler.canAddItemToUpdateBatch(nextItem.params)) {
                this.queue.shift();
                this.runSetOperationNow(nextItem);
            } else {
                this.siteUpdatesHandler.closeBatchAndUpdate();
            }
        },

        onSiteUpdated: function(handles){
            if (this.disposed){
                return;
            }
            if (handles && !_.isEmpty(handles)){
                this.itemCurrentlyRunning = null;
                this.lastUpdateFinished = _.last(handles);
                _.forEach(handles, this.runDoneCallbacks, this);
            }
            //we need this because during the done callbacks someone might run a set operation
            if (!this.itemCurrentlyRunning){
                this.runNextStepInQueue();
            }


            _.forEach(this.siteUpdatedCallbacks, function (callback) {
                callback();
            });
        },

        getNextUpdateHandle: function(){
            return ++this.updateHandlesCounter;
        },

        getLastQueueItem: function(){
            if (!this.itemCurrentlyRunning && !this.queue.length){
                return null;
            }

            var lastQueueItem = this.itemCurrentlyRunning;
            if (this.queue.length){
                lastQueueItem = _.last(this.queue);
            }
            return lastQueueItem;
        },

        closeBatchingNow: function(){
            var lastQueueItem = this.getLastQueueItem();
            if (lastQueueItem){
                if (lastQueueItem === this.itemCurrentlyRunning){
                    this.siteUpdatesHandler.closeBatch();
                } else {
                    lastQueueItem.params.noBatchingAfter = true;
                }
            }
        }
    };

    function SetOperationsQueue(privateServices){
        this.siteId = privateServices.siteAPI.getSiteId();
        privateScopes[this.siteId] = new PrivateScope(privateServices);
    }

    SetOperationsQueue.prototype = {
        dispose: function(){
            var privates = privateScopes[this.siteId];
            privates.siteUpdatesHandler.dispose();
            privates.queue = [];
            privates.doneCallbacks = {};
            privates.onErrorCallbacks = [];
            privates.disposed = true;
            this.siteId = null;
        },

        runSetOperation: function(setOperation, args, operationParams){
            var privates = privateScopes[this.siteId];
            var params = operationParams || {};
            if (params.noBatching){
                params.noBatchingAfter = true;
                privates.closeBatchingNow();
            }

            var handle = privates.getNextUpdateHandle();
            var queueItem = {
                handle: handle,
                operation: setOperation,
                args: args,
                params: params,
                snapshot: null,
                isAsyncOperation: params.isAsyncOperation
            };

            privates.queue.push(queueItem);
            if (!this.isRunningSetOperation()){
                privates.runNextStepInQueue();
            }

            return queueItem.handle;
        },

        isRunningSetOperation: function(){
            var privates = privateScopes[this.siteId];
            return !!privates.itemCurrentlyRunning;
        },

        executeAfterCurrentOperationDone: function(callback){
            var privates = privateScopes[this.siteId];
            if (privates.itemCurrentlyRunning) {
                privates.siteUpdatesHandler.addItemPostUpdateOperation(callback, privates.itemCurrentlyRunning.handle);
            }
        },

        asyncSetOperationComplete: function(error){
            var privates = privateScopes[this.siteId];
            if (!privates.itemCurrentlyRunning || !privates.itemCurrentlyRunning.isRealAsyncOperation){
                //utils.log.warn('did not expect to reach asyncSetOperationComplete');
                return;
            }

            if (error){
                privates.handleFailure(privates.itemCurrentlyRunning, error);
            } else {
                _.defer(privates.runNextStepInQueue.bind(privates));
            }
        },

        registerToSiteChanged: function(callback){
            var privates = privateScopes[this.siteId];
            privates.siteUpdatedCallbacks.push(callback);
        },

        registerToErrorThrown: function(callback){
            var privates = privateScopes[this.siteId];
            privates.onErrorCallbacks.push(callback);
        },

        unRegisterFromErrorThrown: function(callback){
            var privates = privateScopes[this.siteId];
            privates.onErrorCallbacks = _.without(privates.onErrorCallbacks, callback);
        },

        /**
         * the callback will be executed when ALL (maybe some others as well) the operations registered until now are done
         * can be used for opening panels after added the component, BI and such
         * @param callback
         */
        waitForChangesApplied: function(callback){
            var privates = privateScopes[this.siteId];
            var lastQueueItem = privates.getLastQueueItem();
            if (lastQueueItem){
                this.registerToSetOperationDone(lastQueueItem.handle, callback);
            } else {
                callback();
            }
        },

        registerToSetOperationDone: function(handle, callback){
            var privates = privateScopes[this.siteId];
            if (privates.lastUpdateFinished && handle <= privates.lastUpdateFinished){
                callback(privates.failed[handle]);
            } else {
                privates.doneCallbacks[handle] = privates.doneCallbacks[handle] || [];
                privates.doneCallbacks[handle].push(callback);
            }
        },

        /**
         * the callback will be executed when ALL AND ONLY the operations registered until now are done
         * needed for take snapshot, save and mobile conversion
         * @param callback
         */
        flushQueueAndExecute: function(callback){
            var privates = privateScopes[this.siteId];
            privates.closeBatchingNow();
            //for now is the same since there is no batching
            this.waitForChangesApplied(callback);
        }
    };

    return SetOperationsQueue;

});
