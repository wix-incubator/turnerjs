define([
    'core',
    'loggingUtils',
    'coreUtils',
    'siteUtils',
    'wixUrlParser',
    'wixCodeSeo/renderer/siteRenderer',
    'wixCodeSeo/dataHelper/siteDataHelper'
], function (core, loggingUtils, coreUtils, siteUtils, wixUrlParser, siteRenderer, siteDataHelper) {
    'use strict';

    function renderSeo(ajaxHandler, siteModel, siteProps) {
        var fullSiteData = new siteUtils.SiteData(siteModel);
        var siteDataWrapper = core.SiteDataAPI.createSiteDataAPIAndDal(fullSiteData, ajaxHandler);
        var displayedSiteData = siteDataWrapper.siteData;
        var siteDataAPI = siteDataWrapper.siteDataAPI;
        var viewerPrivateServices = {
            pointers: siteDataWrapper.pointers,
            displayedDAL: siteDataWrapper.displayedDal,
            siteDataAPI: siteDataAPI
        };

        var pageInfo = wixUrlParser.parseUrl(displayedSiteData, displayedSiteData.currentUrl.full);
        displayedSiteData.setRootNavigationInfo(pageInfo);
        var masterPageId = coreUtils.siteConstants.MASTER_PAGE_ID;
        var currentPageId = fullSiteData.getCurrentUrlPageId();
        var RENDERED_ROOTS = [masterPageId, currentPageId];

        var onReadyCallback = function () {
            var extractedSiteData = siteDataHelper.extractSiteData(viewerPrivateServices, displayedSiteData, fullSiteData.getViewMode(), RENDERED_ROOTS);

            loggingUtils.log.info('masterPage:' + JSON.stringify(extractedSiteData[masterPageId]));
            loggingUtils.log.info('currentPage:' + JSON.stringify(extractedSiteData[currentPageId]));
        };
        var pageLoadedCallback = function () {
            //TODO: talk to Shahar do we need the line below.
            siteProps.wixCodeAppApi.preInitWidgets(fullSiteData, fullSiteData.currentUrl.full);
            siteRenderer.render(displayedSiteData, viewerPrivateServices, siteProps, RENDERED_ROOTS, onReadyCallback);
        };
        viewerPrivateServices.siteDataAPI.loadPage(pageInfo, pageLoadedCallback);
    }

    return {
        renderSeo: renderSeo
    };
});
