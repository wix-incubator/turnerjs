define([
    'core',
    'widgets/utils/wixCodeRemoteModelService',
    'widgets/core/WidgetAspect',
    'widgets/core/widgetDataHelper',
    'widgets/core/modelBuilder',
    'widgets/behaviors/widgetBehaviorHandler',
    'widgets/behaviors/widgetBehaviorPreprocessor',
    'widgets/messages/messageBuilder',
    'widgets/core/widgetService'
], function(core, wixCodeRemoteModelService, WidgetAspect, widgetDataHelper, modelBuilder, widgetBehaviorHandler, widgetBehaviorPreprocessor, messageBuilder, widgetService) {
    'use strict';

    core.behaviorHandlersFactory.registerHandler('widget', widgetBehaviorHandler);
    core.behaviorHandlersFactory.registerBehaviorPreprocessor('widget', widgetBehaviorPreprocessor);
    core.siteAspectsRegistry.registerSiteAspect('WidgetAspect', WidgetAspect);

    return {
        wixCodeRemoteModelService: wixCodeRemoteModelService,
        widgetDataHelper: widgetDataHelper,
        messageBuilder: messageBuilder,
        modelBuilder: modelBuilder,
        widgetService: widgetService
    };
});
