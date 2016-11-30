define(['lodash', 'bluebird', 'utils', 'documentServices/wixCode/utils/errors'], function (_, Promise, utils, errors) {
    'use strict';

    var requestTypes = {
        POST: 'POST',
        GET: 'GET',
        PUT: 'PUT',
        DELETE: 'DELETE'
    };

    function _validateArgument(argName, methodName, argValue, expected) {
        if (!argValue) {
            throw new errors.ArgumentError(argName, methodName, argValue, expected);
        }
    }

    function sendRequest(url, type, data) {
        return new Promise(function (resolve, reject) {
            var params = {
                type: type,
                url: url,
                dataType: 'json',
                contentType: 'application/json',
                success: resolve,
                error: reject
            };

            if (data) {
                params.data = JSON.stringify(data);
            }

            utils.ajaxLibrary.ajax(params);
        });
    }

    function sendRequestObj(request){
         return new Promise(function (resolve, reject) {
            request.success = resolve;
            request.error = reject;

            utils.ajaxLibrary.ajax(request);
        });
    }

    /***
     * @description Creates a codeAppInfo object from the given parameters
     * @param {string} baseUrl The base URL for the app, usually taken from service topology
     * @param {string} appId The app ID
     * @param {string} signedInstance The signed instance, usually taken from the client spec entry
     * @param {string} scari The signed code app render info
     * @returns {{baseUrl: string, signedInstance: string, appId: string, scari: string}}
     */
    function createCodeAppInfo(baseUrl, appId, signedInstance, scari) {
        _validateArgument('baseUrl', 'createCodeAppInfo', baseUrl, 'string');
        _validateArgument('appId', 'createCodeAppInfo', appId, 'string');
        _validateArgument('signedInstance', 'createCodeAppInfo', signedInstance, 'string');
        _validateArgument('scari', 'createCodeAppInfo', scari, 'string');

        return {
            baseUrl: baseUrl,
            signedInstance: signedInstance,
            appId: appId,
            scari: scari
        };
    }

    /***
     * @description Extracts data from the snapshot in the given path.
     * @param {object} snapshot The snapshot- ImmutableJS object
     * @param {array} pathArray The path elements to traverse in order to get to the requested data
     * @param {boolean} isCompound true if the expected data is not a simple type (this will call toJS() before returning the result)
     * @returns {any}
     */
    function extractFromSnapshot(snapshot, pathArray, isCompound) {
        var ret = snapshot.getIn(pathArray);
        if (isCompound) {
            ret = ret.toJS();
        }
        return ret;
    }

    return {
        sendRequest: sendRequest,
        sendRequestObj: sendRequestObj,
        createCodeAppInfo: createCodeAppInfo,
        extractFromSnapshot: extractFromSnapshot,
        requestTypes: requestTypes
    };
});
