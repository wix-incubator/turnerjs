define([
    'core',
    'components/behaviors/compBehaviorHandler'
], function (core, compBehaviorHandler) {
    'use strict';

    core.behaviorHandlersFactory.registerHandler('comp', compBehaviorHandler);
});
