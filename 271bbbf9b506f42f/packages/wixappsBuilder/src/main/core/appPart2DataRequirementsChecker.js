define(["lodash", "core", "wixappsCore", 'wixappsBuilder/core/builderDataHandler'], function (_, /** core */ core, /** wixappsCore */ wixapps, builderDataHandler) {
    "use strict";

    /**
     * @type {core.core.dataRequirementsChecker}
     */
    var dataRequirementsChecker = core.dataRequirementsChecker;
    var wixappsDataHandler = wixapps.wixappsDataHandler;

    /**
     * This will get the items and repo data for parts on the current page
     */
    dataRequirementsChecker.registerCheckerForAllCompsOfType("wixapps.integration.components.AppPart2", function (siteData, compInfoArr, urlData) {
        // preview cannot use this API
        if (!siteData.isViewerMode()) {
            return [];
        }
        // all have the same appInnerID
        var appInnerId = compInfoArr[0].data.appInnerID;
        var appService = siteData.getClientSpecMapEntry(appInnerId);

        var allPartNames = _.map(compInfoArr, 'data.appPartName');

        var metadata = wixappsDataHandler.getPackageMetadata(siteData, appService.type);
        metadata.requestedPartNames = metadata.requestedPartNames || [];
        var partNames = _.difference(allPartNames, metadata.requestedPartNames);

        metadata.requestedPartNames = _.union(metadata.requestedPartNames, allPartNames);
        wixappsDataHandler.setPackageMetadata(metadata, siteData, appService.type);

        if (partNames.length) {
            return builderDataHandler.getBundledPartsDataRequest(siteData, appService, partNames, urlData);
        }

        return [];
    });
});

