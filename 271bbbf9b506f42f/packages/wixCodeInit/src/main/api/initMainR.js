define(['lodash', 'wixCodeInit/utils/specMapUtils', 'wixCodeInit/utils/appsUtils'], function (_, specMapUtils, appsUtils) {
    'use strict';

    /**
     * This is just as an helper function that helps keep main-r cleaner.
     * It calls appApi.init after extracting required information from basic main-r utils
     * and ensuring the dynamic model has been fetched.
     *
     * @param appApi
     * @param siteModel
     * @param isMobileView
     * @param queryUtil
     */
    function initMainR(appApi, siteModel, isMobileView, queryUtil) {
        var sdkUrl = _.trimRight(siteModel.serviceTopology.scriptsLocationMap['wix-code-sdk'], '/') + '/lib/wix.min.js';
        var initOptions = {
            isMobileView: isMobileView,
            debug: queryUtil.getParameterByName('debug'),
            sdkSource: queryUtil.getParameterByName('sdkSource') || sdkUrl,
            runtimeSource: queryUtil.getParameterByName('WixCodeRuntimeSource')
        };
        var viewerPlatformAppSources = queryUtil.getParameterByName('viewerPlatformAppSources');
        initOptions.applications = appsUtils.getAppsBaseInfo(siteModel.rendererModel.clientSpecMap, siteModel.serviceTopology, viewerPlatformAppSources);

        var isViewerMode = !!siteModel.publicModel;

        function initApi(clientSpecMap) {
            appApi.init(siteModel, clientSpecMap, initOptions);
            if (isViewerMode && specMapUtils.getAppSpec(clientSpecMap)) {
                appApi.preLoadWidgets(siteModel, window.document.location.href);
            }
        }

        initApi(siteModel.rendererModel.clientSpecMap);
    }

    return initMainR;
});
