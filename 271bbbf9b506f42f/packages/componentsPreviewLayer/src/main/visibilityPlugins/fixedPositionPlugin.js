define(['lodash'], function(_){
    'use strict';

    var compsToAlwaysShow = ['SITE_HEADER', 'SITE_FOOTER'];

    return function shouldShowFixedPositionComp(argsObj){
        if (_.includes(compsToAlwaysShow, argsObj.compId)) {
            return true;
        }

        var isFixedPosition = _.get(argsObj.compLayout, 'fixedPosition');
        var showFixedComponents = argsObj.renderFlags.allowShowingFixedComponents;
        return showFixedComponents || !isFixedPosition;
    };
});
