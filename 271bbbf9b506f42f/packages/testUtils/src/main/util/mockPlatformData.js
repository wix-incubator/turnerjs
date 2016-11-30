define(['lodash'], function(_){
    'use strict';

    function controllerStageData(controllerType, controllerState, overrides) {
        var stageData = {};
        stageData[controllerType] = {};
        stageData[controllerType][controllerState] = _.assign({
            //icon: 'http://cursors0.totallyfreecursors.com/thumbnails/monkey-ani.gif'
            //enableShowOnAllPages: true,
            //duplicate: true,
            //remove: true
        }, overrides);
        return stageData;
    }

    return {
        controllerStageData: controllerStageData
    };
});
