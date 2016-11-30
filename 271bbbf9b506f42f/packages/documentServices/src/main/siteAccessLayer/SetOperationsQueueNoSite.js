define(['lodash'], function(_){
    "use strict";

    function SetOperationsQueue(){
        this._siteDataChangedCallbacks = [];
    }

    function isRealAsyncOperation(itemArgs, isAsyncOperation){
        if (_.isFunction(isAsyncOperation)){
            return isAsyncOperation.apply(null, itemArgs);
        }
        return isAsyncOperation;
    }

    SetOperationsQueue.prototype = {
        dispose: function(){

        },

        runSetOperation: function(setOperation, args, params){
            if (isRealAsyncOperation(args, _.get(params, 'isAsyncOperation'))) {
                throw new Error("you are in read only mode, so you cannot perform async operations - not implemented, if you need this, we can add this");
            }

            setOperation.apply(null, args);
            _.forEach(this._siteDataChangedCallbacks, function(callback){
                callback();
            });
        },

        isRunningSetOperation: function(){
           return false;
        },

        executeAfterCurrentOperationDone: function(callback){
            callback();
        },

        registerToSetOperationDone: function(){
            throw "not supported, there are no handles here";
        },

        asyncSetOperationComplete: function(){
            //throw "no support yet, talk to alissa if you really need this";
        },

        registerToSiteDataChanged: function(callback){
            this._siteDataChangedCallbacks.push(callback);
        },

        registerToSiteChanged: function(){
            throw "there is no site";
        },

        registerToErrorThrown: function(){
            throw "errors are sync";
        },

        unRegisterFromErrorThrown: function(){
            throw "errors are sync";
        },

        /**
         * the callback will be executed when ALL (maybe some others as well) the operations registered until now are done
         * can be used for opening panels after added the component, BI and such
         * @param callback
         */
        waitForChangesApplied: function(callback){
            callback();
        },

        /**
         * the callback will be executed when ALL AND ONLY the operations registered until now are done
         * needed for take snapshot, save and mobile conversion
         * @param callback
         */
        flushQueueAndExecute: function(callback){
            //for now is the same since there is no batching
            this.waitForChangesApplied(callback);
        }
    };

    return SetOperationsQueue;
});
