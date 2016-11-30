define([
    'core',
    'components/behaviors/animationBehaviorHandler'
], function (core, animationBehaviorHandler) {
    'use strict';

    core.behaviorHandlersFactory.registerHandler('animation', animationBehaviorHandler);
});
