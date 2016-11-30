define(['lodash', 'coreUtils/core/requestsUtil'], function (_, requestsUtil) {
    'use strict';

    function resolvePath(dataContainer, path) {
        return _.get(dataContainer, path) || null;
    }

    function ensurePath(dataContainer, path) {
        if (_.isArray(path) && _.size(path) > 0) {
            var nestedValueInDataContainer = _.get(dataContainer, path) || {};
            _.set(dataContainer, path, nestedValueInDataContainer);
        }
    }

    /**
     * here we transform the response and stick it in the right place in the fullPagesData
     * @param {utils.Store.requestDescriptor} request
     * @param {object} response
     * @param {object} dataContainer
     */
    function requestDoneCallback(request, response, dataContainer) {
        var transform = request.transformFunc || _.identity;
        ensurePath(dataContainer, request.destination);
        var currentValue = resolvePath(dataContainer, request.destination);

        var newValue = transform(response, currentValue);
        _.set(dataContainer, request.destination, newValue);
    }

    /**
     * request the store to load a resource (resource details are in requestObject) and place that resource
     * in its data container under the given path after it was transformed by the transformationFunction (_.identity by default)
     * @param {utils.Store.requestDescriptor} request
     * @param {object} dataContainer
     * @param {object} pendingRequests
     * @param {function} fetchFunc
     * @param dataLoadedCallbacks
     */
    function loadRequestDescriptor(request, dataContainer, pendingRequests, fetchFunc, dataLoadedCallbacks) {
        // look for the requested data in the fullPagesData (might have been requested before)
        var targetData = resolvePath(dataContainer, request.destination);
        if (targetData && !request.force) {
            // data was already fetched - call the complete callback
            request.callback(targetData);
            request.done();
        } else if (pendingRequests[request.key] && !request.force) {
            pendingRequests[request.key].push(request);
        } else {
            // when request.force is true we should always get here
            pendingRequests[request.key] = pendingRequests[request.key] || [];

            // this callback will be called only once as the callback of the actual request
            // doesn't matter if the request was successful or failed we need to cleanup the pendingRequest map
            // to make sure future request will get through
            var updatePendingAndCallRequestDone = function (response, err) {
                var isWixServiceError = _.has(response, 'errorCode') && response.errorCode !== 0;
                if (!err && !isWixServiceError) {
                    requestDoneCallback(request, response, dataContainer);
                    var currentValue = resolvePath(dataContainer, request.destination);
                    // first call the request callback
                    request.callback(currentValue, response);
                    // then all the rest
                    _.forEach(pendingRequests[request.key], function (req) {
                        req.callback(currentValue, response);
                    });
                    _.forEach(dataLoadedCallbacks, function(dataLoadedCallback) {
                        dataLoadedCallback(request.destination, resolvePath(dataContainer, request.destination));
                    });
                } else {
                    // first call the request error callback
                    request.error(err, response);
                    // then all the rest
                    _.forEach(pendingRequests[request.key], function (req) {
                        req.error(err, response);
                    });
                }
                // first call the request callback
                request.done();
                // then all the rest
                _.forEach(pendingRequests[request.key], function (req) {
                    req.done();
                });
                delete pendingRequests[request.key];
            };

            requestsUtil.createAndSendRequest(request, updatePendingAndCallRequestDone, fetchFunc);
        }
    }

    /**
     * @typedef {Store} utils.Store
     *
     * @property {object} dataContainer
     * @property {function} fetchFunc
     * @property {object} pendingRequests
     */

    /**
     * @typedef {object} utils.Store.requestDescriptor
     *
     * @property {string[]} destination         	- array of strings representing the path to where we need the response to be.
     * @property {string} url                   	- where to get the data from
     * @property {?boolean} force               	- when true, will disregard the already existing data in the destination and a request will go to the server
     * @property {?string[]} urls               	- fallback urls for the request
     * @property {?object} data                 	- json object of the data to be serialized and sent with the request
     * @property {?string} dataType             	- request data type, default to JSON
     * @property {?function} onUrlRequestFailure	- a callback that will be invoked for each failed url request
	 * @property {?function} callback          	 	- callback for the request, will be called for cache hits and real requests
     * @property {?function} error              	- error callback for the request, will be called for real requests that had and error
     * @property {?function} transformFunc      	- transformation function on the response data, will be called only on real requests. transformFunc will receive the response data and the current value in the destination.
     */

    /**
     * @constructor
     */
    function Store(dataContainer, fetchFunc) {
        this.dataContainer = dataContainer;
        this.fetchFunc = fetchFunc;
        this.pendingRequests = {};
        this.requestsTimeouts = {};
        this.isClientSideRender = (typeof window !== 'undefined') && window.clientSideRender;
        this.dataLoadedCallbacks = [];
    }

    Store.prototype = {
        /**
         * load a batch of requests and call doneCallback when they all arrived.
         * @param {utils.Store.requestDescriptor[]} requestDescriptors
         * @param {function} doneCallback
         */
        loadBatch: function (requestDescriptors, doneCallback) {
            if (!requestDescriptors || requestDescriptors.length === 0) {
                _.defer(doneCallback);
            }

            var numOfDone = 0;
            var numOfTimedOut = 0;
            var requestDone = function (reqDesc, timedOut) {
                var hasTimer = _.has(reqDesc, 'timerId');
                if (hasTimer && !this.requestsTimeouts[reqDesc.fullKey + reqDesc.timerId]) {
                    // success after timeout
                    numOfDone++;
                    numOfTimedOut--;
                } else {
                    if (hasTimer) {
                        var fullKey = (reqDesc.fullKey + reqDesc.timerId);
                        clearTimeout(this.requestsTimeouts[fullKey]);
                        delete this.requestsTimeouts[fullKey];
                        if (timedOut) {
                            numOfTimedOut++;
                            return;
                        }
                    }

                    numOfDone++;
                }
                if ((numOfDone + numOfTimedOut) === requestDescriptors.length) {
                    if (doneCallback) {
                        doneCallback(numOfTimedOut > 0);
                    }
                }
            };
            _.forEach(requestDescriptors, function (reqDesc) {
                reqDesc.force = reqDesc.force === true;
                reqDesc.callback = reqDesc.callback || _.noop;
                reqDesc.error = reqDesc.error || _.noop;
                reqDesc.done = requestDone.bind(this, reqDesc);
                var data = reqDesc.data ? JSON.stringify(reqDesc.data) : "";
                reqDesc.key = reqDesc.destination.join(".");
                var mainUrl = reqDesc.url;
                if (!mainUrl) {
                    mainUrl = reqDesc.urls ? reqDesc.urls[0] : '';
                }
                reqDesc.fullKey = reqDesc.key + "|" + mainUrl + "|" + data;
                if (this.isClientSideRender && _.isNumber(reqDesc.timeout)) {
                    // NOTE: node setTimeout returns an object so we cannot use it a part of the key in this.requestsTimeouts
                    var timerObject = setTimeout(requestDone.bind(this, reqDesc, true), reqDesc.timeout);
                    reqDesc.timerId = _.uniqueId();
                    this.requestsTimeouts[reqDesc.fullKey + reqDesc.timerId] = timerObject;
                }
                reqDesc.start = _.now();
                loadRequestDescriptor(reqDesc, this.dataContainer, this.pendingRequests, this.fetchFunc, this.dataLoadedCallbacks);
            }, this);
        },

        registerDataLoadedCallback: function (dataLoadedFn) {
            this.dataLoadedCallbacks.push(dataLoadedFn);
        },

        /**
         * @returns {object}
         */
        getData: function () {
            return this.dataContainer;
        }
    };

    return Store;
});
