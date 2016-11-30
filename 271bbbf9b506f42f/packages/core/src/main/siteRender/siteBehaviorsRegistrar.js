define([
    'core/components/behaviorHandlers/behaviorHandlersFactory',
    'core/components/behaviorHandlers/siteBehaviorHandler'
], function (
    behaviorHandlersFactory,
    siteBehaviorHandler
) {
    'use strict';

    behaviorHandlersFactory.registerHandler('site', siteBehaviorHandler);
});
