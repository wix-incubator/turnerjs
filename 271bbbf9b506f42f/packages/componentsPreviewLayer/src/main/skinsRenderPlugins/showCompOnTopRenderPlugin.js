define(['lodash', 'utils'], function(_, utils){
    'use strict';

    var MAX_Z_INDEX = utils.style.MAX_Z_INDEX;

    return function showCompOnTop(refData, skinTree, structure, props){
        var compsToShowOnTop = _.get(props, ['renderRealtimeConfig', 'compsToShowOnTop']);
        if (_.includes(compsToShowOnTop, props.id)){
            refData[""].style.zIndex = MAX_Z_INDEX;
        }
    };
});
