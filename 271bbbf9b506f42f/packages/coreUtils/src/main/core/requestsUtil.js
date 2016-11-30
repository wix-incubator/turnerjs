define(['lodash'], function (_) {
    'use strict';


    /**
     * @param {utils.Store.requestDescriptor} request
     * @param {function} doneCallback
     * @param {function} fetchFunc
     */
    function createAndSendRequest(request, doneCallback, fetchFunc) {
        var fallbackUrls = [];
        if (request.url) {
            fallbackUrls.push(request.url);
        }
        if (request.urls && _.isArray(request.urls)) {
            fallbackUrls = fallbackUrls.concat(request.urls);
        }

        if (_.isUndefined(request.maxTimeouts)) {
            request.maxTimeouts = 1;
        }

        if (_.isUndefined(request.current)) {
            request.current = 0;
        } else {
            request.current++;
        }
        var url = fallbackUrls[request.current];
        if (!url) {
            doneCallback(null, 'mising URL');
        }

        var requestToSend = {
            url: url,
            dataType: request.dataType || "json",
            type: "GET",
            cache: request.cache,
            syncCache: request.syncCache
        };
        if (request.data) {
            requestToSend.type = "POST";
            requestToSend.contentType = "application/json; charset=UTF-8";
            requestToSend.data = JSON.stringify(request.data);
        }

        if (requestToSend.dataType === 'jsonp' && request.jsonpCallback) {
            requestToSend.jsonpCallback = request.jsonpCallback;
        }

        if (request.requestTimeout && request.current < request.maxTimeouts) {
            requestToSend.timeout = request.requestTimeout;
        }

        // If this request returns with an error, request the next fallback url
        requestToSend.error = function (xhrRequest, errName, err) {
            if (errName === 'timeout' && _.isFunction(request.ontimeout)) {
                request.ontimeout();
            }
            if (_.isFunction(request.onUrlRequestFailure)) {
                request.onUrlRequestFailure(requestToSend.url, xhrRequest && xhrRequest.status);
            }
            if (fallbackUrls.length) {
                if (request.current < fallbackUrls.length) {
                    createAndSendRequest(request, doneCallback, fetchFunc);
                }
            } else {
                // TODO - consider collecting all errors for debug purposes.
                doneCallback(xhrRequest.status, err || errName);
            }
        };
        requestToSend.success = function (resData) {
            if (_.isFunction(request.isValidResponse) && !request.isValidResponse(resData)) {
                //420 = our made up xhr status code for invalid responses. The content returned from the server/statics wasn't real/valid
                requestToSend.error({status: 420}, 'error');
                return;
            }
            doneCallback(resData);
        };
        fetchFunc(requestToSend);
    }

    return {
        createAndSendRequest: createAndSendRequest
    };
});
