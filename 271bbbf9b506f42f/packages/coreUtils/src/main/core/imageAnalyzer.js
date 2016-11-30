define(['lodash'], function (_) {
    'use strict';

    var REQUEST_TYPES = {
        BRIGHTNESS: 'brightness'
    };
    var REQUEST_STATUS = {
        INIT: 'init',
        PENDING: 'pending',
        COMPLETE: 'complete'
    };

    /***** Helper Classes *****/
    function RequestsCache() {
        _.forEach(REQUEST_TYPES, function(type) {
            this[type] = {};
        }, this);
    }

    RequestsCache.prototype = {
        getReqResult: function(requestType, imageUrl) {
            var req = this[requestType][imageUrl];
            if (req && req.status === REQUEST_STATUS.COMPLETE) {
                return req.result;
            }
            return null;
        },
        setReqResult: function(requestType, imageUrl, result) {
            this[requestType][imageUrl] = this[requestType][imageUrl] || {};
            this[requestType][imageUrl].result = result;
        },
        getReqStatus: function(requestType, imageUrl) {
            var req = this[requestType][imageUrl];
            return (req && req.status) || null;
        },
        setReqStatus: function(requestType, imageUrl, status) {
            this[requestType][imageUrl] = this[requestType][imageUrl] || {};
            this[requestType][imageUrl].status = status;
        },
        remove: function(requestType, imageUrl) {
            delete this[requestType][imageUrl];
        },
        registerCallbacksForResult: function(requestType, imageUrl, onSuccess, onError) {
            this[requestType][imageUrl] = this[requestType][imageUrl] || {};
            var req = this[requestType][imageUrl];
            req.callbacks = req.callbacks || {onSuccess: [], onError: []};
            req.callbacks.onSuccess.push(onSuccess);
            req.callbacks.onError.push(onError);
        },
        clearResultCallbacks: function(requestType, imageUrl) {
            delete this[requestType][imageUrl].callbacks;
        },
        getResultSuccessCallbacks: function(requestType, imageUrl) {
            var req = this[requestType][imageUrl];
            return (req && req.callbacks && req.callbacks.onSuccess) || [];
        },
        getResultErrorCallbacks: function(requestType, imageUrl) {
            var req = this[requestType][imageUrl];
            return (req && req.callbacks && req.callbacks.onError) || [];
        }
    };

    /***** Global Variables *****/
    var requestsCache = new RequestsCache();

    /***** Util Methods *****/
    function computeImageBrightness(imageData) {
        var meanBrightness = 0;
        var PIXELS = imageData.length / 4;

        for (var p = 0; p < imageData.length; p += 4) {
            var normalizedR = imageData[p] / 255;
            var normalizedG = imageData[p + 1] / 255;
            var normalizedB = imageData[p + 2] / 255;

            var maxNormalizedComponent = Math.max(normalizedR, normalizedG, normalizedB);
            var brightness = maxNormalizedComponent * 100;

            meanBrightness += (brightness / PIXELS);
        }

        return meanBrightness;
    }

    function workerOnMessage(e) {
        var imageData = e.data;
        var imageBrightnessResult = computeImageBrightness(imageData);
        /*global postMessage:false*/
        postMessage(JSON.stringify(imageBrightnessResult));
    }

    function getWorkerCodeAsString() {
        var computeImageBrightnessDef = String(computeImageBrightness);
        var onMessage = "onmessage = " + String(workerOnMessage) + ";";

        return computeImageBrightnessDef + onMessage;
    }

    function loadImageOntoTempNode(imageUrl, onSuccess, onError) {
        var tempImageNode = new window.Image();
        tempImageNode.crossOrigin = "Anonymous";
        tempImageNode.onload = function() {
            onSuccess(tempImageNode);
        };
        tempImageNode.onerror = onError;
        tempImageNode.src = imageUrl;
    }

    function getImageDataFromCanvas(imageNode, imageDimensions) {
        var canvas = window.document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.drawImage(imageNode, 0, 0);

        return context.getImageData(0, 0, imageDimensions.width, imageDimensions.height).data;
    }

    function runAnalyzerWorker(imageData, onSuccess, onError) {
        if (!window.Worker) {
            onError('Browser does not support Web Workers');
        }

        var blob = new window.Blob([getWorkerCodeAsString()]);
        var blobUrl = window.URL.createObjectURL(blob);
        var worker = new window.Worker(blobUrl);

        worker.onmessage = function (e) {
            worker.terminate();
            var data = JSON.parse(e.data);
            if (_.isFinite(data)) {
                onSuccess(data);
            } else {
                onError();
            }
        };
        worker.onerror = onError;
        worker.postMessage(imageData);
    }

    function analyzeImage(imageUrl, imageDimensions, onSuccess, onError) {
        loadImageOntoTempNode(imageUrl, function imageLoadedCallback(imageNode) {
            requestsCache.setReqStatus(REQUEST_TYPES.BRIGHTNESS, imageUrl, REQUEST_STATUS.PENDING);
            var imageData = getImageDataFromCanvas(imageNode, imageDimensions);
            runAnalyzerWorker(imageData, onSuccess, onError);
        }, onError);
    }

    function isCanvasSupported(){
        var elem = window.document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }

    function analysisError(imageUrl) {
        var errorCallbacks = requestsCache.getResultErrorCallbacks(REQUEST_TYPES.BRIGHTNESS, imageUrl);
        requestsCache.remove(REQUEST_TYPES.BRIGHTNESS, imageUrl);

        _.forEach(errorCallbacks, function(callback) {
            callback();
        });
    }

    function analysisSuccess(imageUrl, result) {
        var successCallbacks = requestsCache.getResultSuccessCallbacks(REQUEST_TYPES.BRIGHTNESS, imageUrl);
        requestsCache.setReqStatus(REQUEST_TYPES.BRIGHTNESS, imageUrl, REQUEST_STATUS.COMPLETE);
        requestsCache.setReqResult(REQUEST_TYPES.BRIGHTNESS, imageUrl, result);

        _.forEach(successCallbacks, function(callback) {
            callback(result);
        });

        requestsCache.clearResultCallbacks(REQUEST_TYPES.BRIGHTNESS, imageUrl);
    }

    function getImageMeanBrightness(imageUrl, imageDimensions, onSuccess, onError) {
        onError = onError || _.noop;
        onSuccess = onSuccess || _.noop;
        if (!isCanvasSupported()) {
            onError('HTML5 <canvas> is not supported in this browser');
        }

        var reqStatus = requestsCache.getReqStatus(REQUEST_TYPES.BRIGHTNESS, imageUrl);
        switch (reqStatus) {
            case REQUEST_STATUS.COMPLETE:
                var resultFromCache = requestsCache.getReqResult(REQUEST_TYPES.BRIGHTNESS, imageUrl);
                onSuccess(resultFromCache);
                break;
            case null:
                requestsCache.setReqStatus(REQUEST_TYPES.BRIGHTNESS, imageUrl, REQUEST_STATUS.INIT);
                requestsCache.registerCallbacksForResult(REQUEST_TYPES.BRIGHTNESS, imageUrl, onSuccess, onError);
                analyzeImage(imageUrl, imageDimensions, _.partial(analysisSuccess, imageUrl), _.partial(analysisError, imageUrl));
                break;
            default:
                requestsCache.registerCallbacksForResult(REQUEST_TYPES.BRIGHTNESS, imageUrl, onSuccess, onError);
                break;
        }
    }

    return {
        getImageMeanBrightness: getImageMeanBrightness
    };
});
