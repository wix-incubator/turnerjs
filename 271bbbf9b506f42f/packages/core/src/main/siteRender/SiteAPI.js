define(['utils', 'zepto', 'lodash', 'core/bi/errors'], function (utils, $, _, errors) {
    'use strict';
    var logger = utils.logger;

    /**
     * @typedef {SiteAPI} core.SiteAPI
     */

    /**
     *
     * @param site
     * @constructor
     */
    function SiteAPI(site, from) {
        if (!site && arguments.length && typeof window !== 'undefined') {
            from = from || "unknown";
            if (window.wixBiSession) {
                window.wixBiSession.sendError(errors.NULL_SITE_ERROR, from);
            } else {
                //console.error('Null site', from);
            }
        }
        this._site = site;

        _.bindAll(this);
    }

    /**
     *
     * @param {ps.pointers} pointers
     * @param compId
     * @param rootId
     * @param animatingCompsIds
     */
    function isAnimating(pointers, compPointer, compsInRoot) {
        while (compPointer) {
            if (_.get(compsInRoot, [compPointer.id, 'isAnimating'])) {
                return true;
            }
            compPointer = pointers.components.getParent(compPointer);
        }

        return false;
    }

    SiteAPI.prototype = {
        reLayout: function () {
            //TODO: probably should control this
            this._site.reLayout();
        },

        registerReLayoutPending: function (compId) {
            this._site.registerReLayoutPending(compId);
        },

        reLayoutIfPending: function () {
            this._site.reLayoutIfPending();
        },

        /**
         * @param  siteAspectName
         * @return {*}
         */
        getSiteAspect: function (siteAspectName) {
            return this._site && this._site.siteAspects && this._site.siteAspects[siteAspectName];
        },

        /**
         *
         * @return {core.SiteData}
         */
        getSiteData: function () {
            return this._site.props.siteData;
        },

        /**
         *
         * @return {core.SiteData}
         */
        getLoadedStyles: function () {
            return this._site.loadedStyles;
        },

        /**
         *
         * @param {string} key
         * @param {*} value
         */
        setBiParam: function (key, value) {
            var siteData = this.getSiteData();
            if (siteData && siteData.wixBiSession && siteData.wixBiSession[key] === undefined) {
                siteData.wixBiSession[key] = value;
            }
        },

        /**
         *
         * @param {string} name
         */
        setBiMarker: function (name) {
            this.setBiParam(name, _.now());
        },

        onSiteUnmount: function () {
            setTimeout(function () {
                delete this._site;
            }.bind(this));
        },
        /**
         *
         * @return {boolean}
         */
        isZoomOpened: function () {
            var siteData = this._site.props.siteData;
            return !!(siteData.getExistingRootNavigationInfo(siteData.getFocusedRootId()).pageItemId || utils.nonPageItemZoom.getZoomedImageData());
        },
        /**
         *
         * @param {string} url
         * @param {string} target - one of: _blank, _top, _parent, _self
         * @param {string=} params
         */
        openPopup: function (url, target, params) {
            window.open(url, target, params);
        },

        /**
         * returns whether the page is a landing page
         * @param pageId
         * @returns {boolean}
         */
        isPageLandingPage: function (pageId) {
            return this.getSiteData().isPageLandingPage(pageId);
        },

        /**
         * @return {string}
         */
        scrollToAnchor: function (anchorData, progressCallback) {
            var scroll = utils.scrollAnchors.calcAnchorScrollToPosition(anchorData, this);
            return this._site.scrollToAnchor(scroll, progressCallback);
        },

        /**
         *
         * @returns {Array<string>} will return the rendered ids
         */
        getAllRenderedRootIds: function () {
            return this._site.getAllRenderedRootIds();
        },

        /**
         * Will return the ids which are supposed to be rendered according to the site data.. but may not have actually rendered yet. Useful for componentWillUpdate, componentWillMount etc. type of lifecycle events
         * @returns {Array<string>}
         */
        getRootIdsWhichShouldBeRendered: function () {
            return this._site.getRootIdsWhichShouldBeRendered();
        },

        navigateToPage: function (navigationInfo, skipHistory, shouldReplaceHistory) {
            var leaveOtherRootsAsIs = false;
            this._site.tryToNavigate(navigationInfo, skipHistory, leaveOtherRootsAsIs, shouldReplaceHistory);
        },
        updateUrlIfNeeded: function(navigationInfo) {
            this._site.updateUrlIfNeeded(navigationInfo);
        },
        handleNavigation: function (navInfo, linkUrl, changeUrl) {
            this._site.handleNavigation(navInfo, linkUrl, changeUrl);
        },
        updatePageNavInfo: function (navigationInfo, skipHistory, shouldReplaceHistory) {
            var siteData = this.getSiteData();
            var leaveOtherRootsAsIs = false;
            if (navigationInfo.pageId !== siteData.getPrimaryPageId() && navigationInfo.pageId !== siteData.getCurrentPopupId()) {
                throw "you need to navigate to page if it's a different page";
            }
            this._site.tryToNavigate(navigationInfo, skipHistory, leaveOtherRootsAsIs, shouldReplaceHistory);
        },

        /**
         * call this method if you need to render the site on event handler (add components to it)
         */
        forceUpdate: function (callback) {
            this._site.forceUpdate(callback);
        },

        getComponentsByPageId: function (rootId) {
            return this._site.getComponentsByPageId(rootId);
        },

        /**
         * @param {bool} forceAddHash - force add to the url the string after the #
         * @returns {string}
         */
        getPageUrl: function (forceAddHash) {
            return this.getPageUrlFor(this.getSiteData().getCurrentUrlPageId(), forceAddHash);
        },

        getPageData: function () {
            return this.getSiteData().getDataByQuery(this.getSiteData().getCurrentUrlPageId());
        },

        setPageTitle: function (title, descriptionSEO, pageTitleSEO) {
            var pageData = this.getPageData();
            pageData.title = title;
            pageData.descriptionSEO = descriptionSEO;
            pageData.pageTitleSEO = pageTitleSEO;
        },

        setRunTimePageTitle: function (title, descriptionSEO) {
            var pageData = this.getRuntimeDal()._siteData.getDataByQuery(this.getSiteData().getCurrentUrlPageId());
            pageData.title = title;
            pageData.descriptionSEO = descriptionSEO;

            this._site.updateTitleAndMetaTags();
        },

        setPageMetaKeywords: function (keywords) {
            var pageData = this.getPageData();
            pageData.metaKeywordsSEO = keywords;
        },

        setPageMetaOgTags: function (ogTags) {
            var pageData = this.getPageData();
            pageData.metaOgTags = ogTags;
        },

        setPageJsonld: function (jsonld) {
            var pageData = this.getPageData();
            pageData.jsonld = jsonld;
        },

        getPageUrlFor: function (pageId, forceAddHash) {
            var pageData = this.getSiteData().getDataByQuery(pageId);
            if (!pageData) {
                return "";
            }

            var pageUrl = utils.wixUrlParser.getUrl(this.getSiteData(), {
                pageId: pageId,
                title: pageData.pageUriSEO
            }, forceAddHash);

            return pageUrl;
        },

        initFacebookRemarketing: function () {
            logger.initFacebookRemarketingPixel(this.getSiteData());
        },

        initGoogleRemarketing: function () {
            logger.initGoogleRemarketingPixel(this.getSiteData());
        },

        fireGoogleRemarketing: function () {
            logger.fireGoogleRemarketingPixel();
        },

        initYandexMetrika: function () {
            logger.initYandexMetrika(this.getSiteData());
        },

        reportYandexPageHit: function (url) {
            logger.reportYandexPageHit(url);
        },

        /**
         * Reports to BI
         * @param reportDef - either event/error/beat object
         * @param params
         */
        reportBI: function (reportDef, params) {
            logger.reportBI(this._site.props.siteData, reportDef, params);
        },

        /**
         * Reports current page event
         */
        reportCurrentPageEvent: function (currentUrl) {
            var siteData = this._site.props.siteData;
            if (!currentUrl) {
                currentUrl = _.isString(siteData.currentUrl) ? siteData.currentUrl : siteData.currentUrl.full;
            }
            var baseUrl = siteData.getExternalBaseUrl().replace(/\/$/, '');
            var path = currentUrl.replace(baseUrl, '');
            logger.reportPageEvent(siteData, path);
        },

        /**
         * Reports page event
         * @param {string} pageUrl
         */
        reportPageEvent: function (pageUrl) {
            logger.reportPageEvent(this._site.props.siteData, pageUrl);
        },

        /**
         * Reports Beat event
         * @param evid (number greater than 3, or 'start', 'reset', 'finish'
         * @param {string} pageId
         */
        reportBeatEvent: function (evid, pageId) {
            logger.reportBeatEvent(this._site.props.siteData, evid, pageId);
        },

        /**
         *
         * @param {string} pageId
         */
        reportBeatStart: function (pageId) {
            this.reportBeatEvent('start', pageId);
        },

        /**
         *
         * @param {string} pageId
         */
        reportBeatFinish: function (pageId) {
            this.reportBeatEvent('finish', pageId);
        },

        reportPageBI: function () {
            logger.reportBI(this._site.props.siteData);
        },

        getUserSession: function () {
            return this._site.props.siteData.getSvSession();
        },

        setUserSession: function (userSessionToken) {
            if (userSessionToken !== this.getUserSession()) {
                var siteData = this.getSiteData();
                siteData.pubSvSession(userSessionToken);
                utils.cookieUtils.deleteCookie('svSession', siteData.currentUrl.hostname, siteData.getMainPagePath());
                utils.cookieUtils.setCookie('svSession', userSessionToken, null, siteData.currentUrl.hostname, siteData.getMainPagePath());

                this._site.notifyAspects(this._site.supportedEvents.svSessionChange, userSessionToken);
            }
        },

        isSiteBusy: function () {
            return this._site.isBusy;
        },

        isSiteBusyIncludingTransition: function () {
            return this.isSiteBusy() || this._site.isDuringTransition;
        },

        startingPageTransition: function (pageInfo) {
            if (this.getSiteData().getFocusedRootId() !== pageInfo.pageId) {
                this._site.isDuringTransition = true;
            }
        },

        endingPageTransition: function () {
            this._site.isDuringTransition = false;
        },

        setSiteScrollingEnabled: function (enabled) {
            if (enabled) {
                $('html').removeClass('disableSiteScroll');

            } else {
                $('html').addClass('disableSiteScroll');
            }
        },

        enterFullScreenMode: function (options) {
            if (typeof window === 'undefined') {
                utils.log.warn('SiteAPI.enterFullScreenMode should only be called from client specific code!');
                return;
            }
            $('body').addClass('fullScreenMode');
            if (!options || options.scrollable) {
                $('body').addClass('fullScreenMode-scrollable');
            }
        },

        exitFullScreenMode: function () {
            if (typeof window === 'undefined') {
                utils.log.warn('SiteAPI.exitFullScreenMode should only be called from client specific code!');
                return;
            }
            $('body').removeClass('fullScreenMode');
            $('body').removeClass('fullScreenMode-scrollable');
        },

        forceBackground: function (background) {
            window.document.body.style.background = background;
        },

        disableForcedBackground: function () {
            window.document.body.style.background = "";
        },

        /**
         * this is needed in the cases when you cannot let the click just go the all the dom tree until it reaches the site (like in mediaZoom)
         * @param event the click event
         */
        passClickEvent: function (event) {
            this._site.clickHandler(event);
        },

        getRuntimeDal: function () {
            return this.getSiteDataAPI().runtime;
        },

        hasPendingFonts: function () {
            return this._site.refs.theme.refs.fontsLoader.hasPendingFonts();
        },
        getCurrentPopupId: function () {
            return this.getSiteData().getCurrentPopupId();
        },

        openPopupPage: function (popupId) {
            this.navigateToPage({pageId: popupId}, true);
        },

        closePopupPage: function () {
            this.navigateToPage(this.getSiteData().getRootNavigationInfo(), true);
        },

        isPopupOpened: function () {
            return this.getSiteData().isPopupOpened();
        },

        getSiteDataAPI: function () {
            return this._site.props.viewerPrivateServices.siteDataAPI;
        },

        getPointers: function () {
            return this._site.props.viewerPrivateServices.pointers;
        },

        getActiveModes: function () {
            return this.getSiteDataAPI().getActiveModes();
        },

        getPrevRenderActiveModes: function () {
            return this._site.prevActiveModes;
        },

        activateModeById: function (compId, rootId, modeId) {
            var pointers = this.getPointers();
            var rootPointer = pointers.components.getPage(rootId, this.getSiteData().getViewMode());
            var compPointer = pointers.components.getComponent(compId, rootPointer);
            this.activateMode(compPointer, modeId);
        },

        activateMode: function (compPointer, modeId) {
            var pointers = this.getPointers();
            var pagePointer = pointers.components.getPageOfComponent(compPointer);
            if (isAnimating(pointers, compPointer, this._site.getComponentsByPageId(pagePointer.id))) {
                return;
            }

            var shouldUpdate = this.getSiteDataAPI().activateMode(compPointer, modeId);

            if (shouldUpdate) {
                this.forceUpdate();
            }
        },

        deactivateModeById: function (compId, rootId, modeId) {
            var shouldUpdate = this.getSiteDataAPI().deactivateModeById(compId, rootId, modeId);

            if (shouldUpdate) {
                this.forceUpdate();
            }
        },

        deactivateMode: function (pointer, modeId) {
            var shouldUpdate = this.getSiteDataAPI().deactivateMode(pointer, modeId);

            if (shouldUpdate) {
                this.forceUpdate();
            }
        },

        deactivateModesInPage: function (rootId) {
            var shouldUpdate = this.getSiteDataAPI().deactivateModesInPage(rootId);

            if (shouldUpdate) {
                this.forceUpdate();
            }
        },

        switchModesByIds: function (compPointer, rootId, modeIdToDeactivate, modeIdToActivate) {
            var shouldUpdate = this.getSiteDataAPI().switchModesByIds(compPointer, rootId, modeIdToDeactivate, modeIdToActivate);

            if (shouldUpdate) {
                this.forceUpdate();
            }
        },

        resetAllActiveModes: function () {
            this.getSiteDataAPI().resetAllActiveModes();

            this.forceUpdate();
        },

        setMobileView: function (isMobile) {
            var siteData = this.getSiteData();
            if (siteData.isMobileView() !== isMobile) {
                siteData.setMobileView(isMobile);
                this.getSiteAspect('WidgetAspect').restartApps();
            }
        },

        showSelectionSharer: function (position, shareInfo) {
            this._site.refs.selectionSharer.show(position, shareInfo);
        },

        hideSelectionSharer: function () {
            if (this._site.refs.selectionSharer.isVisible()) {
                this._site.refs.selectionSharer.hide();
            }
        },

        isSelectionSharerVisible: function () {
            return _.get(this._site, 'refs.selectionSharer') && this._site.refs.selectionSharer.isVisible();
        },

        getWixCodeAppApi: function () {
            return this._site.props.wixCodeAppApi;
        },

        getControllerStageData: function (appId, controllerType, controllerState) {
            var siteData = this.getSiteData();
            return _.get(siteData, ['platform', 'appManifest', appId, 'controllersStageData', controllerType, controllerState]);
        },
        getControllerState: function (controllerId) {
            var siteData = this.getSiteData();
            return _.get(siteData, ['platform', 'appState', controllerId], 'default');
        }
    };

    return SiteAPI;
});
