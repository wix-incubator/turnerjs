define(['lodash', 'core', 'utils'], function (_, core, utils) {
    'use strict';

    var data = {};
    var logger = utils.logger;

    function getSiteData(dsSiteAPI) {
        return data[dsSiteAPI._siteId].sd;
    }

    function getSiteDataAPI(dsSiteAPI) {
        return data[dsSiteAPI._siteId].sdAPI;
    }

    /**
     * @ignore
     * @typedef {DSSiteAPIBase} ds.DSSiteAPIBase
     */


    /**
     * @ignore
     * @constructor
     * @param siteData
     * @param siteDataAPI
     */
    function DSSiteAPIBase(siteData, siteDataAPI) {
        this._siteId = siteData.siteId;

        data[this._siteId] = {
            sd: siteData,
            sdAPI: siteDataAPI
        };
    }


    DSSiteAPIBase.prototype = {
        getSiteId: function () {
            return this._siteId;
        },

        getEditorSessionId: function () {
            return getSiteData(this).documentServicesModel.editorSessionId;
        },

        getReLayoutedCompsMap: function () {
            return getSiteData(this).reLayoutedCompsMap;
        },

        isMobileView:  function () {
            return getSiteData(this).isMobileView();
        },

        getMainPageId: function () {
            return getSiteData(this).getMainPageId();
        },

        getCurrentUrlPageId: function () {
            return getSiteData(this).getCurrentUrlPageId();
        },

        collectUsedStylesFromAllPages: function (pagesData) {
            var collectedStyles = {};
            var siteData = getSiteData(this);
            var themeData = siteData.getAllTheme();
            var masterPageId = 'masterPage';
            _.forEach(pagesData, function (page, pageId) {
                core.styleCollector.collectStyleIdsFromFullStructure(page.structure, themeData, siteData, collectedStyles, pageId);
            });
            //collect from mobile masterPage (for mobile only components)
            core.styleCollector.collectStyleIdsFromFullStructure(pagesData[masterPageId].structure, themeData, siteData, collectedStyles, masterPageId, true);


            return collectedStyles;
        },

        getAllCompsUnderRoot: function(rootId) {
            return getSiteDataAPI(this).document.getAllCompsUnderRoot(rootId, rootId);
        },

        reportBI: function () {
            var args = _.toArray(arguments);
            args.unshift(getSiteData(this));
            return logger.reportBI.apply(utils.logger, args);
        },

        getShapeOriginalAspectRatio: function (compPtr) {
            var siteData = getSiteData(this);
            return siteData && siteData.shapesOriginalAspectRatio && siteData.shapesOriginalAspectRatio[compPtr.id] || null;
        },

        getScreenSize: function () {
            return getSiteData(this).getScreenSize();
        },

        getSiteWidth: function () {
            return getSiteData(this).getSiteWidth();
        },

        getScreenWidth: function () {
            return getSiteData(this).getScreenWidth();
        },

        getScreenHeight: function () {
            return getSiteData(this).getScreenHeight();
        },

        getPageBottomMargin: function () {
            return getSiteData(this).getPageBottomMargin();
        },

        getSiteX: function () {
            return getSiteData(this).getSiteX();
        },

        //this probably shouldn't be that accessible
        getSiteMeasureMap: function () {
            var siteData = getSiteData(this);
            return siteData.measureMap;
        },

        setMobileView: function (mobileView) {
            var siteData = getSiteData(this);
            siteData.setMobileView(mobileView);
        },

        isDebugMode: function () {
            var siteData = getSiteData(this);
            return siteData.isDebugMode();
        },

        hasDebugQueryParam: function () {
            var siteData = getSiteData(this);
            return siteData.hasDebugQueryParam();
        },

        getPageUrl: function (navigationInfo, urlFormat, baseUrl) {
            var siteData = getSiteData(this);
            return siteData.getPageUrl(navigationInfo, urlFormat, baseUrl);
        },

        // This shouldn't be here, but we don't want to clone the descriptors just now (they are static files)
        getWixappsPackageDescriptor: function (packageName) {
            return getSiteData(this).wixapps[packageName].descriptor;
        },

        setPreviewTooltipCallback: function (callback) {
            var siteData = getSiteData(this);
            siteData.renderRealtimeConfig.previewTooltipCallback = callback;
        },

        getClientSpecMap: function () {
            var siteData = getSiteData(this);
            return siteData.getClientSpecMap();
        },

        getPrimaryPageId: function () {
            var siteData = getSiteData(this);
            return siteData.getPrimaryPageId();
        },

        getFocusedRootId: function () {
            var siteData = getSiteData(this);
            return siteData.getFocusedRootId();
        },

        loadBatch: function (requestDescriptors, doneCallback) {
            var siteData = getSiteData(this);
            return siteData.store.loadBatch(requestDescriptors, doneCallback);
        },

        getExternalBaseUrl: function () {
            var siteData = getSiteData(this);
            return siteData.getExternalBaseUrl();
        },

        isPageLandingPage: function(pageId){
            return getSiteData(this).isPageLandingPage(pageId);
        },

        getCurrentPopupId: function(){
            return getSiteData(this).getCurrentPopupId();
        },

        getRootNavigationInfo: function() {
            return getSiteData(this).getRootNavigationInfo();
        },

        getRuntimeDal: function () {
            return getSiteDataAPI(this).runtime;
        },

        isPopupOpened: function () {
            var siteData = getSiteData(this);
            return siteData.isPopupOpened();
        },

        getAnchorsMap: function(rootId){
            var siteData = getSiteData(this);
            return _.get(siteData, ['anchorsMap', rootId, siteData.getViewMode()]);
        },

        createPageAnchors: function(rootId, forceMobileStructure){
            var siteDataAPI = getSiteDataAPI(this);
            siteDataAPI.createPageAnchors(rootId, forceMobileStructure);
        },

        createPageOriginalValuesMap: function(rootId, forceMobileStructure){
            var siteDataAPI = getSiteDataAPI(this);
            siteDataAPI.createPageOriginalValuesMap(rootId, forceMobileStructure);
        },

        removePageOriginalValues: function(rootId, forceMobileStructure){
            var siteDataAPI = getSiteDataAPI(this);
            siteDataAPI.removePageOriginalValues(rootId, forceMobileStructure);
        },

        createChildrenAnchors: function (parentStructure, parentPageId) {
            var siteDataAPI = getSiteDataAPI(this);
            siteDataAPI.createChildrenAnchors(parentStructure, parentPageId);
        },

        getQueryParam: function(paramName){
            var siteData = getSiteData(this);
            return _.get(siteData, ['currentUrl', 'query', paramName]);
        },

        getActiveModes: function() {
            return getSiteDataAPI(this).getActiveModes();
        },

        activateModeById: function(compId, rootId, modeId) {
            getSiteDataAPI(this).activateModeById(compId, rootId, modeId);
        },

        activateMode: function(pointer, modeId) {
            getSiteDataAPI(this).activateMode(pointer, modeId);
        },

        deactivateModeById: function(compId, rootId, modeId) {
            getSiteDataAPI(this).deactivateModeById(compId, rootId, modeId);
        },

        deactivateMode: function(pointer, modeId) {
            getSiteDataAPI(this).deactivateMode(pointer, modeId);
        },

        deactivateModesInPage: function(rootId) {
            getSiteDataAPI(this).deactivateModesInPage(rootId);
        },

        switchModesByIds: function(compPointer, rootId, modeIdToDeactivate, modeIdToActivate){
            getSiteDataAPI(this).switchModesByIds(compPointer, rootId, modeIdToDeactivate, modeIdToActivate);
        },

        resetAllActiveModes: function() {
            getSiteDataAPI(this).resetAllActiveModes();
        },

        createDisplayedNode: function(pointer) {
            this.getSiteDataAPI().createDisplayedNode(pointer);
        },

        disableAction: _.noop,
        bgVideo: {
            play: _.noop,
            stop: _.noop,
            isPlaying: function(){ return false; },
            getReadyState: _.noop,
            registerToPlayingChange: _.noop,
            unregisterToPlayingChange: _.noop,
            enableVideoPlayback: _.noop,
            disableVideoPlayback: _.noop
        }
    };


    return DSSiteAPIBase;
});
