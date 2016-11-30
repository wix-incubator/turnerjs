define(['experiment', 'core/core/site'], function(experiment, site){
    'use strict';

    site.hooks.registerHook(site.hooks.types.PAGE_LOADED_FIRST_RENDER, function(siteData, wixCodeAppApi){
        if (experiment.isOpen('sv_platform1') && !siteData.rendererModel.previewMode) {
            wixCodeAppApi.preInitWidgets(siteData, siteData.currentUrl.full);
        }
    });

    site.hooks.registerHook(site.hooks.types.PAGE_LOADED, function(siteAPI, rootNavigationInfo){
        var siteData = siteAPI.getSiteData();
        var didFocusedPageChanged = siteData.getFocusedRootId() !== rootNavigationInfo.pageId;
        var isFocusedPageAPopup = siteData.getFocusedRootId() !== siteAPI.getCurrentPopupId();
        var isDynamicPage = experiment.isOpen('sv_dpages') && rootNavigationInfo.routerDefinition;
        if (experiment.isOpen('sv_platform1') && (didFocusedPageChanged || !didFocusedPageChanged && isDynamicPage) && isFocusedPageAPopup ) {
            siteAPI.getSiteAspect('WidgetAspect').initApps([rootNavigationInfo.pageId]);
        }
    });
});
