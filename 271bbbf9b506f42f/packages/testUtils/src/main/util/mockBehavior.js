define(['lodash'], function (_) {
    "use strict";

    function assignTargetId(behavior, targetId) {
        if (targetId) {
            behavior.targetId = targetId;
        }

        return behavior;
    }

    /**
     * @lends SiteDataMockData
     */
    var behaviorMocks = {
        widget: {
            runCode: function (compId, func, targetId) {
                return assignTargetId({
                    type: 'widget',
                    name: 'runCode',
                    params: {
                        callbackId: func,
                        compId: compId
                    }
                }, targetId);
            }
        },
        site: function (name, targetId, params) {
            return assignTargetId({
                type: 'site',
                name: name,
                params: params
            }, targetId);
        },
        animation: function(name, targetId, params) {
            return {
                type: 'animation',
                name: name,
                targetId: targetId,
                duration: 1.5,
                delay: 0,
                params: params
            };
        },
        comp: function(compId, behaviorName, params) {
            return {
                type: 'comp',
                name: behaviorName,
                targetId: compId,
                params: params
            };
        },
        behaviorsList: function(items, id) {
            return {
                type: 'ObsoleteBehaviorsList',
                items: items,
                id: id || _.uniqueId('mock_behaviors')
            };
        }
    };

    return behaviorMocks;
});
