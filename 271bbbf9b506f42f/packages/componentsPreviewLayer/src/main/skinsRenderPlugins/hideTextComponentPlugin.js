define(['lodash'], function(_){
    'use strict';

    return function hideTextComponent(refData, skinTree, structure, props){
        var hideTextComponentVal = _.get(props, 'renderRealtimeConfig.hideTextComponent');
        if (hideTextComponentVal && props.id === hideTextComponentVal){
            refData[""].style.visibility = 'hidden';
        }
    };
});
