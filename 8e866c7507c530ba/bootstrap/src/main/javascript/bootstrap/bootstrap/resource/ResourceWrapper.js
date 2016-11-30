/**
 * @class bootstrap.bootstrap.resource.ResourceWrapper
 */
define.bootstrapClass('bootstrap.bootstrap.resource.ResourceWrapper', function () {
    'use strict';
    /** @constructor */
    function ResourceWrapper() {
    }

    /** @lends bootstrap.bootstrap.resource.ResourceWrapper */
    ResourceWrapper.extendPrototype({
        /**
         * Setup method for ResourceWrapper
         * @param {String} id resource definition id
         * @param {*?} value
         * @param {String?} url
         * @return {bootstrap.bootstrap.resource.ResourceWrapper} self
         */
        init:function (id, value, url) {
            this.id = id;
            this.trials = 1;
            this.timeBetween = 0;
            this._successPendingCallbacks = [];
            this._errorPendingCallbacks = [];
            this.setContent(value, url);
            this._loading = false;
            return this;
        },

        /**
         * Sets content of an initialized ResourceWrapper instance
         * @param {*} value
         * @param {String?} url
         */
        setContent:function (value, url) {
            this.value = value;
            this.url = url || this.url;
            this.callPendingCallbacksIfReady();
            return this;
        },

        /**
         * Retrieve the value of this resource and passes it to <i>callback</i>
         * If this.value is undefined, attempts to load it from this.url
         * @param {Function} callback
         */
        getResourceValue:function (callback, onError) {
            if (this.value !== undefined) {
                callback(this.value, this.id);
            } else {
                this.addPendingCallback(callback, onError);
                this.loadContentFromUrl();
            }
        },

        /**
         *
         * @param {String} src
         * @param {*} content
         * @param {*} event
         */
        onLoad:function (content, src, event) {
            this.setContent(content);
        },

        onFailed:function () {
         //   debugger;
            this._loading = false;
            this.callErrorPendingCallbacks();
            //throw new Error('Failed to load resource "' + this.id + '" from URL: ' + this.url, this);
        },

        /**
         * Loads content of this.url (if defined)
         */
        loadContentFromUrl:function () {
            if (this.url && !this._loading && this.value === undefined) {
                var self = this;
                this._loading = true;

                this.resource.getResourceValue('scriptLoader', function (scriptLoader) {
                    if(self.url && typeof self.url !== 'string'){
                        scriptLoader.loadResourceWithRetryPolicy(self);
                    }else{
                        scriptLoader.loadResource(self, self);
                    }
                });
            }
        },

        /**
         * Adds a callback for a pending resource
         * @param {Function} callback
         */
        addPendingCallback:function (onSuccess, onError) {
            if (typeof onSuccess === 'function') {
                this._successPendingCallbacks.push(onSuccess);
            }
            if (typeof onError === 'function') {
                this._errorPendingCallbacks.push(onError);
            }
        },

        /**
         * If the resource has a defined value, runs all the callbacks and passes the value and id
         */
        callPendingCallbacksIfReady:function () {
            if (this.value !== undefined) {
                this._successPendingCallbacks.forEach(function (callback) {
                    callback(this.value, this.id);
                }, this);
                this.clearPendingCallbacks();
            }
        },
        callErrorPendingCallbacks:function () {
            this._errorPendingCallbacks.forEach(function (callback) {
                setTimeout(callback.bind(this, this.value, this.id), 0);
            }, this);
            this.clearPendingCallbacks();
        },

        clearPendingCallbacks: function(){
            this._errorPendingCallbacks = [];
            this._successPendingCallbacks = [];
        },
        withUrls:function(urls){
            this.url = urls;
            return this;
        },
        withTrials:function(val){
            this.trials = val > 0 ? val : 1;
            return this;
        },
        withTrialFailNotification:function(notifyCb){
            this.trialFailNotification = notifyCb;
            return this;
        },
        withTimeBetween:function(time){
            this.timeBetween = time > -1 ? time : 0;
            return this;
        },
        clone: function(newDeploy) {
            var value = this.value;
            if(value && value.clone && typeof value.clone === 'function') {
                value = value.clone(newDeploy);
            }
            return new ResourceWrapper().init(this.id, value, this.url);
        },

        value:undefined,
        /** @type {String} */
        url:undefined,

        /** @type {String} */
        id:undefined,
        /** @type {Number} */
        timeout:30000
    });

    return ResourceWrapper;
});