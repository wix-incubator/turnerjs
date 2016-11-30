define(['core/components/behaviorHandlers/behaviorHandlersFactory'], function (behaviorHandlersFactory) {
    "use strict";

    function handleBehaviors(siteAPI, behaviors, event, type) {
        event = event || {};
        behaviorHandlersFactory.getHandler(type).handle(behaviors, siteAPI, event);
    }

    return {
        handleBehaviors: handleBehaviors
    };
});
