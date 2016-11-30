define([], function(){
    'use strict';

    function getAnimationsAspect(siteAPI) {
        return siteAPI.getSiteAspect('animationsAspect');
    }

    function playAnimations(siteAPI, animationGroup, animations, clear, callback) {
        var animationsAspect = getAnimationsAspect(siteAPI);

        if (animationsAspect) {
            return animationsAspect.playAnimations(animationGroup, animations, clear, callback);
        }

        return callback && callback();
    }

    function hideElementsByAnimationType(siteAPI, animations) {
        var animationsAspect = getAnimationsAspect(siteAPI);

        if (animationsAspect) {
            animationsAspect.hideElementsByAnimationType(animations);
        }
    }

    function revertHideElementsByAnimations(siteAPI, animations) {
        var animationsAspect = getAnimationsAspect(siteAPI);

        if (animationsAspect) {
            animationsAspect.revertHideElementsByAnimations(animations);
        }
    }

    function stopAndClearAnimations(siteAPI, animationGroup, seek) {
        var animationsAspect = getAnimationsAspect(siteAPI);

        if (animationsAspect) {
            animationsAspect.stopAndClearAnimations(animationGroup, seek);
        }
    }

    return {
        playAnimations: playAnimations,
        hideElementsByAnimationType: hideElementsByAnimationType,
        revertHideElementsByAnimations: revertHideElementsByAnimations,
        stopAndClearAnimations: stopAndClearAnimations
    };
});
