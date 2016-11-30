define(["lodash", "core", "wixappsCore"], function (_, /** core */ core, /** wixappsCore */ wixapps) {
    'use strict';

    var addStyleIfNeeded = wixapps.styleCollector.addStyleIfNeeded;
    var wixappsDataHandler = wixapps.wixappsDataHandler;

    function addAppPartStyles(compData, themeData, siteData, loadedStyles){
        var appService = siteData.getClientSpecMapEntry(compData.appInnerID);
        if (!appService) {
            return;
        }

        var descriptor = wixappsDataHandler.getDescriptor(siteData, appService.packageName);

        if (descriptor) {
            _.forEach(descriptor.views, function (viewDef) {
                wixapps.styleCollector.collectViewStyles(viewDef, themeData, loadedStyles);
            });

            _.forEach(descriptor.customizations, function (rule) {
                var styleId = rule.key === "comp.style" && rule.value;
                var skinName = rule.key === "comp.skin" && rule.value;
                addStyleIfNeeded(styleId, skinName, themeData, loadedStyles);
            });
        }

        _.forEach(compData.appLogicCustomizations, function (rule) {
            var styleId = rule.key === "comp.style" && rule.value;
            var skinName = rule.key === "comp.skin" && rule.value;
            addStyleIfNeeded(styleId, skinName, themeData, loadedStyles);
        });

        wixapps.styleCollector.addDefaultStyles(themeData, loadedStyles);

        addStyleIfNeeded(null, "wixapps.integration.skins.ecommerce.options.TextOptionSkin", themeData, loadedStyles);
        addStyleIfNeeded(null, "wixapps.integration.skins.ecommerce.options.ColorOptionSkin", themeData, loadedStyles);
        addStyleIfNeeded(null, "wixapps.integration.skins.ecommerce.options.OptionsListInputSkin", themeData, loadedStyles);
        addStyleIfNeeded(null, "wixapps.integration.skins.ecommerce.options.InfoTipSkin", themeData, loadedStyles);
        addStyleIfNeeded(null, "ecommerce.skins.mcom.MobileSelectOptionsListSkin", themeData, loadedStyles);
        addStyleIfNeeded(null, "ecommerce.skins.mcom.MobileTextOptionSkin", themeData, loadedStyles);
        addStyleIfNeeded(null, "ecommerce.skins.mcom.MobileColorOptionSkin", themeData, loadedStyles);
        addStyleIfNeeded(null, "ecommerce.integration.components.MobileTextOption", themeData, loadedStyles);
        addStyleIfNeeded(null, "wysiwyg.viewer.skins.gallerymatrix.BlogMatrixGallery", themeData, loadedStyles);
        addStyleIfNeeded(null, "skins.viewer.gallery.BlogSlideShow", themeData, loadedStyles);
    }

    core.styleCollector.registerClassBasedStyleCollector("wixapps.integration.components.AppPart", function (structureInfo, themeData, siteData, loadedStyles, pageId) {
        addAppPartStyles(structureInfo.dataItem, themeData, siteData, loadedStyles, pageId);
    });

    core.styleCollector.registerClassBasedStyleCollector("wixapps.integration.components.AppPartZoom", function (structureInfo, themeData, siteData, loadedStyles, pageId) {
        var compData = structureInfo.dataItem;
        var partData = compData.appPartName ? compData : compData.dataItemRef;
        addAppPartStyles(partData, themeData, siteData, loadedStyles, pageId);
    });
});
