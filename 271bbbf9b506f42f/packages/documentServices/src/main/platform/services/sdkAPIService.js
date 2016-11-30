define(['lodash'], function (_) {
    'use strict';

    var getFunctionsForObj = function (path, api) {
        return _.reduce(_.get(api, path), function (result, value, key) {
            var newPath = path.concat([key]);
            if (_.isFunction(value) || !_.isObject(value)) {
                result[newPath.join('.')] = value;
                return result;
            }

            return _.merge(result, getFunctionsForObj(newPath, api));
        }, {});
    };

    var getAPIForSDK = function (api) {
        return _.reduce(api, function(result, value, key) {
            return _.merge(result, getFunctionsForObj([key], api));
        }, {});
    };

    return {
        getAPIForSDK: getAPIForSDK
    };
});
