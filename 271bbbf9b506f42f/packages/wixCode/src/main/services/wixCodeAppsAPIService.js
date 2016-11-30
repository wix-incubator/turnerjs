define(['lodash'], function (_) {
    'use strict';

    var appsAPI = {};

    var invokeAppFunctionFor = function (compId, fn, args, callback) {
        if (_.get(appsAPI, compId)) {
            appsAPI[compId][fn].apply(null, args).then(function (data) {
                callback(data);
            });
        }
    };

    var setAppAPI = function (compId, api) {
        appsAPI[compId] = api;
    };

    return {
        invokeAppFunctionFor: invokeAppFunctionFor,
        setAppAPI: setAppAPI
    };
});
