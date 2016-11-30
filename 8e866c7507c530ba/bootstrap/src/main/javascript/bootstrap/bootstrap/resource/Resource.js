/**
 * @class bootstrap.bootstrap.resource.Resource
 */
define.bootstrapClass('bootstrap.bootstrap.resource.Resource', function () {
    'use strict';
    /** @constructor */
    function Resource() {
    }

    /** @lends bootstrap.bootstrap.resource.Resource */
    Resource.extendPrototype({
        init:function () {
            this._validateResource();
            this.define.resource._instance_ = this;
            this.define.resource.definitionModifier = this._handleNewResourceDefinition.bind(this);
            this.pendingResourceLoadRequests = [];
            this.RESOURCE_LOAD_REQUEST_TIMEOUT = 10000;
            this.MIN_INTERVAL_FOR_CHECKING_RESOURCE_LOAD_REQUESTS = 2500;
            return this;
        },

        checkForTimedOutResourceLoadRequests: function() {
            var now = (new Date()).getTime();

            while(this.pendingResourceLoadRequests.length > 0) {
                var p = this.pendingResourceLoadRequests[0];
                var timeoutTime = p.time + this.RESOURCE_LOAD_REQUEST_TIMEOUT;
                if (now < timeoutTime) {
                    // array is ordered by request time, so all elements from this one on will not be timed out yet
                    break;
                }

                if (!p.loaded) {
                    // timed out
                    console.error('Resource ' + p.name + ' Not found/loaded after ' + this.RESOURCE_LOAD_REQUEST_TIMEOUT + ' ms');
                    LOG.reportError(wixErrors.RESOURCE_NOT_LOADED,'Resource','checkForTimedOutResourceLoadRequests', {p1: p.name});
                }

                // remove processed element - either timed out or loaded
                this.pendingResourceLoadRequests.splice(0, 1);
            }

            // schedule next run iff there are still pending requests
            if (this.pendingResourceLoadRequests.length > 0) {
                this.scheduleNextCheckForTimedOutResourceLoadRequests(now);
            }
        },

        scheduleNextCheckForTimedOutResourceLoadRequests: function(now) {
            var nextRunTime = this.pendingResourceLoadRequests[0].time + this.RESOURCE_LOAD_REQUEST_TIMEOUT;
            var nextRunIn = nextRunTime - now;

            // don't run too soon - truncate with minimum interval
            nextRunIn = Math.max(nextRunIn, this.MIN_INTERVAL_FOR_CHECKING_RESOURCE_LOAD_REQUESTS);

            setTimeout(this.checkForTimedOutResourceLoadRequests.bind(this), nextRunIn);
        },

        /**
         * Gets a resource defined by define.resource
         *
         * @param {String} name Resource name (example: 'a.b.c')
         * @param {Function} callback Will be when the resource is available (and not undefined): <code>callback(resourceValue, name)</code>.
         * @returns {*} The resource if it's available
         */
        getResourceValue:function (name, callback, onError) {
            var now = (new Date()).getTime();
            deployStatus('getResourceValue', name, now);
            var resourceWrapper = this.define.getDefinition('resource', name);

            var pendingResourceLoadRequest = {
                name: name,
                time: now,
                loaded: false
            };

            var callbackWrapper = function() {
                pendingResourceLoadRequest.loaded = true;
                return callback.apply(resourceWrapper, arguments);
            };

            if (!resourceWrapper) {
                resourceWrapper = this.define.createBootstrapClassInstance('bootstrap.bootstrap.resource.ResourceWrapper').init(name);
                this.define.resource(name, resourceWrapper);
                resourceWrapper.addPendingCallback(callbackWrapper, onError);
            } else if (resourceWrapper.getResourceValue) {
                resourceWrapper.getResourceValue(callbackWrapper, onError);
            }

            // if this is the first resource load request - schedule a check for timeouts
            this.pendingResourceLoadRequests.push(pendingResourceLoadRequest);
            if (this.pendingResourceLoadRequests.length === 1) {
                this.scheduleNextCheckForTimedOutResourceLoadRequests(now);
            }
        },

        /**
         * Gets multiple resources defined by define.resource.*
         *
         * @param {Array<String>} requiredResources
         * @param {function(Object)} callback called when all the resources are ready,
         *      with an object containing the requested resources (as a tree)
         *      e.g., if calling with ['W.SomeClass.Something1', 'W.SomeClass.Something2'], you'll get
         *      {W : {SomeClass: {Something1: [resource1 value], Something2: [resource2 value]}}}
         */
        getResources:function (requiredResources, callback) {
            var result = {};
            var loaded = [];

            requiredResources.forEach(function (resourceName) {
                this.getResourceValue(resourceName, singleResourceCallback);
            }, this);

            function singleResourceCallback(resourceContent, resourceName) {
                nsUtil.setNameSpace(result, resourceName, resourceContent);

                loaded.push(resourceName);
                if (loaded.length === requiredResources.length) {
                    callback(result);
                }
            }
        },

        /**
         * Track new resource definitions
         * @param {String} resourceName
         * @param {*} resourceContent
         */
        _handleNewResourceDefinition:function (resourceName, resourceContent, url) {
            var ResourceWrapper = this.define.getBootstrapClass('bootstrap.bootstrap.resource.ResourceWrapper');
            if ((resourceContent instanceof ResourceWrapper)) {
                return resourceContent;
            }

            var resourceWrapper = this.define.getDefinition('resource', resourceName);
            if (!(resourceWrapper && resourceWrapper instanceof ResourceWrapper)) {
                // replace raw content with resourceWrapper
                resourceWrapper = this.define.createBootstrapClassInstance('bootstrap.bootstrap.resource.ResourceWrapper').init(resourceName);
            }else if(url && resourceWrapper.url !== url){
                resourceWrapper.setContent(resourceContent, url);
                resourceWrapper.loadContentFromUrl();
            }

            return resourceWrapper.setContent(resourceContent, url);
        },
        _validateResource:function(){
            if (this.define.resource._instance_) {
                window.deployStatus('definedResourcesError', this.define.resource);
                throw new Error('Resource is already defined');
            }
            if (this.define.resource.definitionModifier) {
                window.deployStatus('definitionModifierError', this.define.resource);
                throw new Error('define.resource already has some other definitionModifier');
            }
        },
        url:function(url, method, once){
            url = url || '';
            method = method || 'cors';
            once = !!once;
            return {
                url: url,
                method: method,
                once:once
            };
        }
    });

    return Resource;
});
