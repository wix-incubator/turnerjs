define(['lodash', 'animations', 'core'], function (_, animations, core) {
    'use strict';

    function handlePreCondition(behavior, siteAPI) {
        core.animationsService.hideElementsByAnimationType(siteAPI, [behavior]);
    }

    function cancelPreCondition(behavior, siteAPI) {
        core.animationsService.revertHideElementsByAnimations(siteAPI, [behavior]);
    }

    function handle(behaviors, siteAPI, event) {
        var animationGroup = event.group || event.action;

        var runtimeDal = siteAPI.getRuntimeDal();

        behaviors = _(behaviors)
            .filter(function (behavior) {
                var compProps = runtimeDal.getCompProps(behavior.targetId) || {};
                return !compProps.isHidden && !compProps.isCollapsed;
            })
            .map(function (behavior) {
                return _.omit(_.defaultsDeep({}, behavior, _.find(animations.viewerDefaults, {name: behavior.name})), 'action');
            })
            .value();

        if (siteAPI.getSiteData().isMobileView()) {
            _.defer(function(){
                _.get(event, 'callback', _.noop)();
            });
            return;
        }
        core.animationsService.playAnimations(siteAPI, animationGroup, behaviors, true, event.callback || _.noop);
    }

    function isEnabled(behavior, siteAPI) {
        return !(siteAPI.getSiteData().isMobileDevice() || siteAPI.getSiteData().isMobileView());
    }

    return {
        handle: handle,
        handlePreCondition: handlePreCondition,
        cancelPreCondition: cancelPreCondition,
        isEnabled: isEnabled
    };
});
