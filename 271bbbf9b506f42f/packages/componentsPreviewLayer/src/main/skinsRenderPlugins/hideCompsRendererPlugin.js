define(['lodash'], function(_){
    'use strict';

    return function setCompsToHide(refData, skinTree, structure, props){
        var compsToHide = _.get(props, 'renderRealtimeConfig.compsToHide');
        if (compsToHide && _.includes(compsToHide, props.id)){
            refData[""].style.visibility = 'hidden';
        }
    };
});
