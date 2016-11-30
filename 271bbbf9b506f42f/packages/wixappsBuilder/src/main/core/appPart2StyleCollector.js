define(["lodash", "core", "wixappsCore", "wixappsBuilder/core/appRepo", 'wixappsBuilder/core/appPart2DataFetchingStateManager'], function (_, /** core */ core, /** wixappsCore */ wixapps, /** appRepo */appRepo, dataFetchingStateManager) {
    'use strict';

    var wixappsDataHandler = wixapps.wixappsDataHandler;

    core.styleCollector.registerClassBasedStyleCollector("wixapps.integration.components.AppPart2", function (structureInfo, themeData, siteData, loadedStyles) {
        var compData = structureInfo.dataItem;
        var appService = siteData.getClientSpecMapEntry(compData.appInnerID);

        if (dataFetchingStateManager.isPartErroneous(siteData, appService)) {
            return;
        }

        var descriptor = wixappsDataHandler.getDescriptor(siteData, appService.type);
        var partDef = descriptor && appRepo.getAppPartDefinition(descriptor, compData.appPartName);

        if (!partDef) {
            return;
        }

        var viewName = partDef.viewName;
        var views = _.filter(descriptor.views, {name: viewName});
        _.forEach(views, function (viewDef) {
            wixapps.styleCollector.collectViewStyles(viewDef, themeData, loadedStyles);
        });

        wixapps.styleCollector.addDefaultStyles(themeData, loadedStyles);
    });
});
