define(['lodash'], function (_) {
    'use strict';

    function OriginalValuesManager(originalValuesMap, flatDataMap){
        _.merge(this, {
            getOriginalTop: function (componentId){
                var originalTop = _.get(originalValuesMap, [componentId, 'top']);

                return originalTop || flatDataMap[componentId].layout.y; //TODO: once we know what to do with originalValues (product), remove this (||flatDataMap...)
            },
            getOriginalHeight: function(componentId){
                var originalHeight = _.get(originalValuesMap, [componentId, 'height']);

                return originalHeight || flatDataMap[componentId].layout.height; //TODO: once we know what to do with originalValues (product), remove this (||flatDataMap...)
            }
        });
    }

    return function createOriginalValuesManager(originalValuesMap, flatDataMap){
        return new OriginalValuesManager(originalValuesMap, flatDataMap);
    };
});
