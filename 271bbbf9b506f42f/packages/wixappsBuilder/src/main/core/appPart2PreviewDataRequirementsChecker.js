define(["lodash", "core", "wixappsCore", 'wixappsBuilder/core/builderDataHandler', 'wixappsBuilder/core/appPart2DataFetchingStateManager', 'wixappsBuilder/core/appRepo'], function (_, /** core */ core, /** wixappsCore */ wixapps, builderDataHandler, dataFetchingStateManager, appRepo) {
    "use strict";

    /**
     * @type {core.core.dataRequirementsChecker}
     */
    var dataRequirementsChecker = core.dataRequirementsChecker;
    var wixappsDataHandler = wixapps.wixappsDataHandler;


    function repoRequestGetter(siteData, appService) {
        // viewer should not use this API
        if (siteData.isViewerMode()) {
            return [];
        }
        var metadata = wixappsDataHandler.getPackageMetadata(siteData, appService.type);
        if (metadata.wasRepoRequested) {
            return [];
        }
        wixappsDataHandler.setPackageMetadata({wasRepoRequested: true, requestedPartNames: []}, siteData, appService.type);

        return builderDataHandler.getApplicationRepoRequest(siteData, appService);
    }

    function partRequestGetter(siteData, compInfo) {
            // viewer should not use this API
            if (siteData.isViewerMode()) {
                return [];
            }

            var appInnerId = compInfo.data.appInnerID;
            var appService = siteData.getClientSpecMapEntry(appInnerId);
            var partName = compInfo.data.appPartName;

            // no repo and no error - we wait
            var repo = wixappsDataHandler.getDescriptor(siteData, appService.type);
            if (!repo && !dataFetchingStateManager.isPackageErroneous(siteData, appService)) {
                dataFetchingStateManager.setPartLoadingState(siteData, appService, partName);
                return [];
            }
            // else repo was loaded or had error loading

            var metadata = wixappsDataHandler.getPackageMetadata(siteData, appService.type);

            metadata.requestedPartNames = metadata.requestedPartNames || [];
            if (_.includes(metadata.requestedPartNames, partName)) {
                return [];
            }
            metadata.requestedPartNames.push(partName);

            var partDef = appRepo.getAppPartDefinition(repo, partName);
            if (!partDef) {
                dataFetchingStateManager.setPartAsErroneous(siteData, appService, partName);
                return [];
            }

            var typeId = partDef.type;
            metadata.requestedTypes = metadata.requestedTypes || [];
            if (_.includes(metadata.requestedTypes, typeId)) {
                return [];
            }
            metadata.requestedTypes.push(typeId);

            wixappsDataHandler.setPackageMetadata(metadata, siteData, appService.type);

            return builderDataHandler.getAllItemsOfTypeRequest(siteData, appService, typeId) || [];
        }

    /**
     * This will make sure we always have the repo in the preview
     */
    dataRequirementsChecker.registerCheckerForAppDefId('3d590cbc-4907-4cc4-b0b1-ddf2c5edf297', repoRequestGetter);

    /**
     * This will get the items for parts on current page in the preview
     */
    dataRequirementsChecker.registerCheckerForCompType("wixapps.integration.components.AppPart2", partRequestGetter);

    return {
        partRequestGetter: partRequestGetter,
        repoRequestGetter: repoRequestGetter
    };
});

