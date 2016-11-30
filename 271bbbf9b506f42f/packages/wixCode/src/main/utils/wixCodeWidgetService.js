define([
    'lodash',
    'wixCodeInit'
], function(_, wixCodeInit){
    'use strict';

    function getWidgetSpec(clientSpecMap) {
        return wixCodeInit.specMapUtils.getAppSpec(clientSpecMap);
    }

    function hasWixCodeWidgetSpecs(clientSpecMap) {
        return !!getWidgetSpec(clientSpecMap);
    }

    return {
        hasWixCodeWidgetSpecs: hasWixCodeWidgetSpecs,
        getWixCodeSpec: getWidgetSpec
    };
});
