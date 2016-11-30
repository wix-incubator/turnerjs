define(['lodash'], function(_) {

    'use strict';

    var marketDataCache = {};
    var marketDataRequests = {};

    var get = function(appDefinitionId) {
        return marketDataCache[appDefinitionId];
    };

    var set = function(appDefinitionId, data) {
        var cached = get(appDefinitionId);
        if (cached) {
            marketDataCache[appDefinitionId] = _.merge({}, cached, data);
        } else {
            marketDataCache[appDefinitionId] = data;
        }
        return marketDataCache[appDefinitionId];
    };

    var lock = function(appDefinitionId) {
        marketDataRequests[appDefinitionId] = 1;
    };

    var isLocked = function(appDefinitionId) {
        return marketDataRequests[appDefinitionId];
    };

    var unlock = function(appDefinitionId) {
        delete marketDataRequests[appDefinitionId];
    };

    var keys = function() {
        return marketDataCache && _.keys(marketDataCache) || [];
    };

    var clear = function() {
        marketDataCache = {};
        marketDataRequests = {};
    };

    return {
        get: get,
        set: set,
        lock: lock,
        unlock: unlock,
        isLocked: isLocked,
        keys: keys,
        clear: clear
    };
});