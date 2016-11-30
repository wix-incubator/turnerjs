define(['lodash'], function (
    _
    ) {

    'use strict';

    var deleteAppCallbacks = {};
    var addAppCallbacks = {};

    var registerOnAppDeleted = function (appDefId, callback) {
        if (_.isUndefined(deleteAppCallbacks[appDefId])) {
            deleteAppCallbacks[appDefId] = [];
        }
        deleteAppCallbacks[appDefId].push(callback);
    };

    var registerOnAppInstalled = function (appDefId, callback) {
        if (_.isUndefined(addAppCallbacks[appDefId])) {
            addAppCallbacks[appDefId] = [];
        }
        addAppCallbacks[appDefId].push(callback);
    };


    var invokeDeleteAppCallbacks = function (appDefinitionId) {
        if (deleteAppCallbacks[appDefinitionId]) {
            _.forEach(deleteAppCallbacks[appDefinitionId], function(cb) {
                cb();
            });
        }
    };

    var invokeAddAppCallbacks = function (appDefinitionId) {
        if (addAppCallbacks[appDefinitionId]) {
            _.forEach(addAppCallbacks[appDefinitionId], function(cb) {
                cb();
            });
        }
    };

    return {
        registerOnAppDeleted: registerOnAppDeleted,
        registerOnAppInstalled: registerOnAppInstalled,
        invokeDeleteAppCallbacks: invokeDeleteAppCallbacks,
        invokeAddAppCallbacks: invokeAddAppCallbacks
    };
});