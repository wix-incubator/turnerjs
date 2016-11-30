define(['lodash'], function(_){
    'use strict';

    return function shouldShowHiddenComp(argsObj){
        var ignoreHiddenProperty = _.includes(argsObj.renderFlags.ignoreComponentsHiddenProperty, argsObj.compId);
        var showHiddenComponents = argsObj.renderFlags.showHiddenComponents;
        var isHidden = _.get(argsObj.compProperties, 'isHidden');
        return !isHidden || ignoreHiddenProperty || (isHidden && showHiddenComponents);
    };
});
