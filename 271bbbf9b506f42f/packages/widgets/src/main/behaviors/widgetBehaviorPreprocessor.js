define(['lodash'], function(_){
    'use strict';

    function calculateTargetId(siteAPI, behaviorSourceId) {
        var sourceRootId = siteAPI.getRuntimeDal().getPageId(behaviorSourceId);
        if (!sourceRootId) {
            return null;
        }
        if (sourceRootId === 'masterPage') {
            return siteAPI.getSiteData().getFocusedRootId();
        }
        return sourceRootId;
    }

    function fixWidgetBehaviorTarget(behavior, action, siteAPI) {
        return _.assign({}, behavior, {targetId: calculateTargetId(siteAPI, action.sourceId)});
    }

    return fixWidgetBehaviorTarget;
});
