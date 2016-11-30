define(['lodash', 'wixCodeInit', 'coreUtils'], function (_, wixCodeInit, coreUtils) {
    "use strict";

    /**
     *
     * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
     * @implements {core.SiteAspectInterface}
     * @constructor
     */
    function WixCodeWidgetAspect(aspectSiteAPI) {
        this._aspectSiteAPI = aspectSiteAPI;
    }

    WixCodeWidgetAspect.prototype = {
        initApp: function () { // TODO: move to document services
            var siteData = this._aspectSiteAPI.getSiteData();
            var wixCodeAppApi = this._aspectSiteAPI.getWixCodeAppApi();
            var viewerPlatformAppSources = _.get(siteData, ['currentUrl', 'query', 'viewerPlatformAppSources']);
            var applications = wixCodeInit.appsUtils.getAppsBaseInfo(siteData.getClientSpecMap(), siteData.serviceTopology, viewerPlatformAppSources);
            var sdkUrl = coreUtils.urlUtils.joinURL(siteData.serviceTopology.scriptsLocationMap['wix-code-sdk'], 'lib/wix.min.js');
            wixCodeAppApi.init(siteData, siteData.getClientSpecMap(), {
                isMobileView: siteData.isMobileView(),
                debug: siteData.isDebugMode(),
                sdkSource: _.get(siteData, ['currentUrl', 'query', 'sdkSource']) || sdkUrl,
                runtimeSource: _.get(siteData, ['currentUrl', 'query', 'WixCodeRuntimeSource']),
                applications: applications
            });
        }
    };

    return WixCodeWidgetAspect;
});
