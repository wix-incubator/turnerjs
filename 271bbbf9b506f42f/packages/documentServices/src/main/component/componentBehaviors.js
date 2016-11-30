define([], function() {
    'use strict';

    var BEHAVIOR_TYPE = 'comp';
    function executeBehavior(privateServices, compPointer, behaviorName, params, callback) {
        var behavior = {
            type: BEHAVIOR_TYPE,
            targetId: compPointer.id,
            name: behaviorName,
            params: params
        };

        privateServices.siteAPI.getSiteAspect('behaviorsAspect').handleBehavior(behavior, {group: BEHAVIOR_TYPE, callback: callback});
    }

    function getRuntimeState(privateServices, compPointer){
        var runtimePointer = privateServices.pointers.general.getRuntimePointer();
        return privateServices.dal.get(privateServices.pointers.getInnerPointer(runtimePointer, 'components.' + compPointer.id + '.state'));
    }

    return {
        executeBehavior: executeBehavior,
        getRuntimeState: getRuntimeState
    };
});
