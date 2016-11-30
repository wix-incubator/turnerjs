define([
    'lodash',
    'dataFixer',
    'coreUtils',
    'siteUtils/core/MobileDeviceAnalyzer',
    'siteUtils/core/menuUtils',
    'siteUtils/core/browserDetection',
    'wixUrlParser',
    'siteUtils/core/dataResolver',
    'siteUtils/core/pagesUrlUtils',
    'siteUtils/core/constants',
    'siteUtils/core/browserFlags',
    'experiment'
], function (_, dataFixer, coreUtils, MobileDeviceAnalyzer, menuUtils, browserDetection, wixUrlParser, DataResolver, pagesUrlUtils, constants, browserFlags, experiment) {
    'use strict';

    var MASTER_PAGE_ID = 'masterPage';

    function getSessionInfoProp(key) {
        return _.get(this, ['publicModel', 'sessionInfo', key]);
    }

    function setSessionInfoProp(key, value) {
        if (this.publicModel) {
            _.set(this.publicModel, ['sessionInfo', key], value);
        }
    }

    /**
     * this is the API to the data, structure and configurations of the site
     *  @typedef {SiteData} core.SiteData
     */

    /**
     * this is the API to the data, structure and configurations of the site
     * @constructor
     * @property {site.rendererModel} rendererModel
     * @property {site.publicModel} publicModel
     * @property {site.serviceTopology} serviceTopology
     * @property {string} viewMode
     * @property {Object.<string, string>} configUrls same as service topology.....?
     * @property {string} siteId
     * @property {object} currentUrl
     * @property {site.requestModel} requestModel
     * @property {utils.Store} store
     * @property {string} googleAnalytics
     * @property {object} browser
     * @property {object} os
     * @property {string} santaBase
     * @property {string} santaBaseFallbackUrl
     *
     * @param siteModel
     */
    function SiteData(siteModel) {
        if (!siteModel) {
            return;
        }
        if (siteModel.wixData) {
            dataFixer.deprecatedSiteModelMigrater(siteModel);
        }

        /*TODO : REMOVE ONCE SERVER CHANGE THWE ROUTER TABLE SCHEMA*/
        if (siteModel.routers) {
            dataFixer.routerTableTempMigration(siteModel);
        }
        pagesUrlUtils.ensureUrlFormatModel(siteModel);

        this.currentUrl = {};

        /** @private */
        this._currentRootInfos = {};
        /** @private */
        this._currentPageIds = {
            primaryPage: null,
            popupPage: null
        };

        this.customUrlMapping = {};
        _.assign(this, siteModel);
        this.siteId = this.siteId || (this.rendererModel && this.rendererModel.siteInfo.siteId);
        var userAgent = this.requestModel && this.requestModel.userAgent;
        var detected = browserDetection(userAgent);
        var requestModel = _.assign({}, this.requestModel, siteModel.publicModel && siteModel.publicModel.deviceInfo);
        this._isMobileView = siteModel.forceMobileView;
        this._isTabletDevice = undefined;
        this.pagesData = this.pagesData || {};
        this.editorData = {generated: {}, generatedVersion: {}};
        this.textRuntimeLayout = {overallBorders: {}};
        this.mapFromPageUriSeoToPageId = pagesUrlUtils.getMapFromPageUriSeoToPageId(siteModel);

        this.dockedRuntimeLayout = {};
        this.deletedPagesMap = {};
        this.dataResolver = new DataResolver();
        this.orphanPermanentDataNodes = [];
        this.mobile = new MobileDeviceAnalyzer(requestModel);
        this.browser = detected.browser;
        this.os = detected.os;
        this.wixBiSession = siteModel.wixBiSession || {};
        this.svgShapes = siteModel.svgShapes || {};
        this.activeModes = {};
        this.prefetchPages = [];
        if (experiment.isOpen('sv_dpages')) {
            this.routersRendererIndex = 0;
        }
        this.reLayoutedCompsMap = {};
        this.saveInvalidationCount = 0;

        this.renderFlags = this.renderFlags || {};
        _.defaults(this.renderFlags, {
            isPlayingAllowed: true, //default state
            isZoomAllowed: true, //default state
            isSocialInteractionAllowed: true, //default state
            siteTransformScale: 1,
            isExternalNavigationAllowed: true, //default state
            isBackToTopButtonAllowed: true, //default true
            isWixAdsAllowed: true, //default true
            isSlideShowGalleryClickAllowed: true, //default true
            isTinyMenuOpenAllowed: true, //default true
            renderFixedPositionContainers: true,
            // Don't lock a password-protected page in editor on start.
            // Editor takes control over the flag later on (enables it in preview mode).
            isPageProtectionEnabled: this.isViewerMode(),
            isSiteMembersDialogsOpenAllowed: true,
            allowSiteOverflow: true,
            shouldResetGalleryToOriginalState: false,
            shouldResetComponent: true,
            extraSiteHeight: 0,
            siteScale: 1,
            shouldUpdateJsonFromMeasureMap: true,
            componentViewMode: 'preview',
            allowShowingFixedComponents: true,
            componentPreviewStates: {},
            renderMobileActionMenu: !(coreUtils.urlUtils.isQueryParamOn(this.currentUrl, 'hideMobileActionBar')),
            initWixCode: this.isViewerMode()
        });

        this.failedRequests = [];

        this.renderRealtimeConfig = {};

        this._svQueue = [];
        this.compStates = {};
        this.widgetsStore = {};
        this.imageCssCache = {};

        this.onImageUnmount = this.onImageUnmount.bind(this);  // Should be bound because it's passed as SantaType
        this.getMediaFullStaticUrl = this.getMediaFullStaticUrl.bind(this);  // Should be bound because it's passed as SantaType
    }

    SiteData.prototype = {
        setStore: function (store) {
            this.store = store;
            if (this.dataResolver) {
                this.store.registerDataLoadedCallback(this.dataResolver.clearCache.bind(this.dataResolver));
            }
        },
        /**
         * @enum {string}
         */
        dataTypes: {
            PROPERTIES: 'component_properties',
            DATA: 'document_data',
            THEME: 'theme_data',
            DESIGN: 'design_data',
            BEHAVIORS: 'behaviors_data',
            CONNECTIONS: 'connections_data'
        },

        WIX_ADS_ID: 'WIX_ADS',
        MASTER_PAGE_ID: MASTER_PAGE_ID,

        /**
         *
         * @param {site.rootNavigationInfo} info
         * @param {boolean?} isOverridingAllRoots - you can pass false if you don't want to unmount other roots (close popup)
         */
        setRootNavigationInfo: function (info, isOverridingAllRoots) {
            var pageId = info.pageId;
            var loadingDifferentPage = pageId !== this._currentPageIds.primaryPage && pageId !== this._currentPageIds.popupPage;
            var isPopup = this.isPopupPage(pageId);
            var isDynamicPage = !!info.routerDefinition;

            if (isOverridingAllRoots) {
                if (!isPopup) {
                    this._currentPageIds.primaryPage = null;
                }
                this._currentPageIds.popupPage = null;
            }

            //if popups will have urls we'll have to do more here
            this._currentRootInfos[pageId] = info;
            if (experiment.isOpen('sv_dpages') && isDynamicPage) {
                this._currentRootInfos[pageId].routersRendererIndex = (info.pageAdditionalData + this.routersRendererIndex);
                this.routersRendererIndex++;
            }
            if (!isPopup) {
                this._currentRootInfos[MASTER_PAGE_ID] = info;
                this._currentPageIds.primaryPage = info.pageId;
            } else {
                this._currentPageIds.popupPage = info.pageId;
            }

            if (loadingDifferentPage) {
                this.dataResolver.clearCache();
            }
        },

        addPrefetchPages: function (pageIds) {
            this.prefetchPages = _.union(this.prefetchPages, pageIds);
        },

        getPrefetchPages: function () {
            return this.prefetchPages;
        },

        getExistingRootNavigationInfo: function (rootId) {
            return this._currentRootInfos[rootId] ? _.omit(this._currentRootInfos[rootId], 'transition') : undefined;
        },

        getExistingRootNavigationInfoWithTransitionInfo: function (rootId) {
            return this._currentRootInfos[rootId];
        },

        /**
         *
         * @returns {string} the underlying page, the one that sits in the master page
         */
        getPrimaryPageId: function () {
            return this._currentPageIds.primaryPage;
        },

        /**
         *
         * @returns {string} the page that is the actual physical url
         */
        getCurrentUrlPageId: function () {
            return this.getPrimaryPageId();
        },

        /**
         *
         * @returns {string} the top most rendered page popup/page
         */
        getFocusedRootId: function () {
            return this._currentPageIds.popupPage || this._currentPageIds.primaryPage;
        },

        getAllPossiblyRenderedRoots: function () {
            var roots = [this.MASTER_PAGE_ID, this.getPrimaryPageId()];

            if (this.isPopupOpened()) {
                roots.push(this.getCurrentPopupId());
            }
            return roots;
        },

        getRenderedRootsUnderMasterPage: function () {
            return _.reject(this.getAllPossiblyRenderedRoots(), this.isPopupPage, this);
        },

        getDataForCopy: function () {
            var data = _.clone(this);
            delete data.store;
            return data;
        },
        /**
         *  returns true for mobile structure rendering (can be rendered on desktop as well!)
         * @returns {undefined|boolean} undefined if there is no page data yet, so we can't tell
         */
        isMobileView: function () {
            if (_.isUndefined(this._isMobileView) && this.getMasterPageData()) {
                if (coreUtils.dataUtils.isMobileStructureExist(this.getMasterPageData())) {
                    var showMobileViewQueryParam = _(this.currentUrl.query).keys().find(function (key) {
                        return key.toLowerCase() === 'showmobileview';
                    });
                    if (showMobileViewQueryParam) {
                        this._isMobileView = (this.currentUrl.query[showMobileViewQueryParam] === "true");
                    } else {
                        this._isMobileView = this.mobile.isMobileDevice() &&
                            (this.rendererModel.siteMetaData && this.rendererModel.siteMetaData.adaptiveMobileOn);
                    }
                } else {
                    this._isMobileView = false;
                }
            }

            return this._isMobileView;
        },


        isMobileDevice: function () {
            if (_.isUndefined(this._isMobileDevice)) {
                this._isMobileDevice = this.mobile.isMobileDevice();
            }
            return this._isMobileDevice;
        },

        browserFlags: function () {
            if (!this._browserFlags) {
                this._browserFlags = browserFlags.create(_.pick(this, ['os', 'browser']));
            }
            return this._browserFlags;
        },

        forceLandingPage: function (urlObj) {
            return urlObj.query && urlObj.query.forceLandingPage;
        },

        isTabletDevice: function () {
            if (_.isUndefined(this._isTabletDevice)) {
                this._isTabletDevice = (this.os && this.os.tablet && !this.browser.ie) || this.mobile.isTabletDevice();
            }
            return this._isTabletDevice;
        },

        isTouchDevice: function () {
            return this.isTabletDevice() || this.isMobileDevice();
        },

        /**
         * @param {boolean} isMobile
         */
        setMobileView: function (isMobile) {
            this._isMobileView = isMobile;
        },

        /**
         * @returns {data.themeData} a map between the comp style id to the theme item
         */
        getAllTheme: function () {
            return this.getMasterPageData().data.theme_data;
        },

        /**
         * @returns {data.generalTheme} a map of theme styles (fonts and colors)
         */
        getGeneralTheme: function () {
            return this.getMasterPageData().data.theme_data.THEME_DATA;
        },

        getFontsMap: function() {
            return this.getGeneralTheme().font;
        },

        getFont: function (fontClassName) {
            var fontNumber = fontClassName.split('_')[1];
            return this.getGeneralTheme().font[fontNumber];
        },

        /** @deprecated
         * Please use utils.colorParser.getColorValue*/
        getColor: function (colorClassName) {
            var colorNumber = colorClassName.split('_')[1];
            return this.getGeneralTheme().color[colorNumber] || colorClassName;
        },

        getColorsMap: function() {
            return this.getGeneralTheme().color;
        },


        /**
         *
         * @return {data.pageData}
         */
        getMasterPageData: function () {
            return this.pagesData.masterPage;
        },

        getPageData: function (pageId) {
            return this.pagesData[pageId];
        },

        /**
         * retrieve a property from the service topology
         * @param prop
         */
        getServiceTopologyProperty: function (prop) {
            return this.serviceTopology[prop];
        },

        /**
         *
         * @return {string}
         */
        getStaticMediaUrl: function () {
            return this.serviceTopology.staticMediaUrl;
        },

        /**
         *
         * @return {string}
         */
        getStaticHTMLComponentUrl: function () {
            return this.serviceTopology.staticHTMLComponentUrl;
        },

        /**
         *
         * @return {string}
         */
        getStaticVideoUrl: function () {
            return this.serviceTopology.staticVideoUrl;
        },

        /**
         *
         * @return {string}
         */
        getStaticVideoHeadRequestUrl: function () {
            return this.serviceTopology.staticVideoHeadRequestUrl;
        },

        getMetaSiteId: function () {
            return this.rendererModel.metaSiteId;
        },


        getMediaFullStaticUrl: function (imgRelativeUrl) {
            return coreUtils.urlUtils.getMediaUrlByContext(imgRelativeUrl, this.getStaticMediaUrl(), this.serviceTopology.mediaRootUrl);
        },

        /**
         *
         * @returns {*|string}
         */
        getStaticThemeUrlWeb: function () {
            var scriptsLoc = this.serviceTopology.scriptsLocationMap;
            return scriptsLoc && scriptsLoc.skins && scriptsLoc.skins + '/images/wysiwyg/core/themes';
        },

        /**
         * is the domain premium
         * @returns {boolean}
         */
        isPremiumDomain: function () {
            return _.includes(this.rendererModel.premiumFeatures, 'HasDomain');
        },

        /**
         * is the user a premium user
         * @returns {boolean}
         */
        isPremiumUser: function () {
            return !_.isEmpty(this.rendererModel.premiumFeatures);
        },

        /**
         * is the user a premium user
         * @returns {boolean}
         */
        isAdFreePremiumUser: function () {
            return _.includes(this.rendererModel.premiumFeatures || [], "AdsFree");
        },

        /**
         * please add type for this
         * @return {Object.<string, *>|*}
         */
        getClientSpecMap: function () {
            return this.rendererModel.clientSpecMap;
        },

        /**
         * please add type for this
         * @param {string} applicationId
         * @return {*}
         */
        getClientSpecMapEntry: function (applicationId) {
            return this.rendererModel.clientSpecMap[applicationId];
        },

        getClientSpecMapEntriesByType: function (type) {
            return _.where(this.rendererModel.clientSpecMap, {'type': type});
        },

        getClientSpecMapEntryByAppDefinitionId: function (appDefId) {
            return _.find(this.rendererModel.clientSpecMap, {appDefinitionId: appDefId});
        },

        getSMToken: function () {
            var siteMembersData = this.getClientSpecMapEntriesByType('sitemembers')[0] || {};
            return siteMembersData.smtoken;
        },

        getSvSession: function () {
            return getSessionInfoProp.call(this, 'svSession');
        },

        getCTToken: function () {
            return getSessionInfoProp.call(this, 'ctToken');
        },

        setCTToken: function (ctToken) {
            setSessionInfoProp.call(this, 'ctToken', ctToken);
        },

        subSvSession: function (cb, force) {
            var svSession = this.getSvSession();
            if (svSession || force) {
                cb(svSession);
            } else {
                this._svQueue.push(cb);
            }
        },
        pubSvSession: function (svSession) {
            setSessionInfoProp.call(this, 'svSession', svSession);
            this._svQueue.forEach(function (cb) {
                cb(svSession);
            });
            this._svQueue.length = 0;
        },

        getUserId: function () {
            return this.siteHeader.userId;
        },
        /**
         * @return {site.siteMetaData}
         */
        getSiteMetaData: function () {
            return this.rendererModel.siteMetaData;
        },

        getSiteStructure: function () {
            return this.getDataByQuery(this.getStructureCompId());
        },

        getLanguageCode: function () {
            return this.rendererModel.languageCode;
        },

        isPageLandingPage: function (pageId) {
            var pageData = this.getDataByQuery(pageId);
            if (this.forceLandingPage(this.currentUrl)) {
                return true;
            }
            return pageData && pageData.isLandingPage;
        },

        getStructureCompId: function () {
            return 'masterPage';
        },
        getBodyClientWidth: function () {
            return window.document.body.clientWidth;
        },
        getBodyClientHeight: function () {
            return window.document.body.clientHeight;
        },
        getScreenWidth: function () {
            if (!this.screenSize) {
                this.updateScreenSize();
            }
            return this.screenSize.width;
        },
        getScreenHeight: function () {
            if (!this.screenSize) {
                this.updateScreenSize();
            }
            return this.screenSize.height;
        },
        getScreenSize: function () {
            if (!this.screenSize) {
                this.updateScreenSize();
            }
            return this.screenSize;
        },
        /**
         * NOTE: currently this is called from layout.js during measure, and is a hack to store this value only from measure, in case components use it during render
         * This will eventually be moved (for component modes, screen width) to be updated in such away that it is always correct during render (and that render happens when screen width changes, and not just relayout)
         * - Etai
         */
        updateScreenSize: function (screenSize) {
            this.screenSize = screenSize || {
                width: this.isMobileView() ? 320 : this.getBodyClientWidth(),
                height: this.getBodyClientHeight()
            };
        },

        getSiteX: function () {
            if (this.isMobileView() || this.isMobileDevice()) {
                return 0;
            }

            return Math.min(parseInt(Math.floor((this.getSiteWidth() - this.getScreenWidth()) / 2), 10), 0);
        },
        getSiteWidth: function () {
            if (this.isMobileView()) {
                return 320;
            } else if (this.isFacebookSite()) {
                return 520;
            }

            var siteStructure = this.getSiteStructure();
            return _.get(siteStructure, 'renderModifiers.siteWidth', 980);
        },

        isFacebookSite: function () {
            return this.rendererModel.siteInfo.applicationType === "HtmlFacebook";
        },

        clearCache: function () {
            this.dataResolver.clearCache();
        },

        onImageUnmount: function (id) {
            if (this.imageResizeHandlers) {
                delete this.imageResizeHandlers[id];
            }

            if (this.imageCssCache) {
                delete this.imageCssCache[id];
            }
        },

        /**
         *
         * @param {string} query
         * @param {string=} rootId default is masterPage
         * @param {SiteData.dataTypes=} dataType default is document_data
         * @returns {(data.compThemeItem|data.compDataItem|data.compPropertiesItem)} the data/theme/property item
         */
        getDataByQuery: function (query, rootId, dataType) {
            rootId = rootId || 'masterPage';
            dataType = dataType || this.dataTypes.DATA;

            var currentRootIds = [this.getPrimaryPageId()];
            if (this.isPopupOpened()) {
                currentRootIds.push(this.getCurrentPopupId());
            }
            return this.dataResolver.getDataByQuery(this.pagesData, currentRootIds, rootId, dataType, query);
        },

        isRootIgnoreBottomBottom: function(rootId){
            return rootId && _.get(this.pagesData, ['masterPage', 'data', 'document_data', rootId, 'ignoreBottomBottomAnchors']);
        },

        resolveData: function (dataToResolve, rootId, dataType) {
            return this.getDataByQuery(dataToResolve, rootId, dataType);
        },

        findDataOnMasterPageByPredicate: function (predicate) {
            return _.find(this.getMasterPageData().data.document_data, predicate);
        },

        getPageMinHeight: function () {
            return this.isMobileView() ? 200 : 500;
        },

        getDynamicPageTitle: function (pageId){
            return _.chain(this.pageResponseForUrl)
                         .find({pageId: pageId})
                         .get('title')
                         .value();
        },
        getCurrentUrlPageTitle: function () {
            var title = this.rendererModel.siteInfo.siteTitleSEO || "";
            var urlPageId = this.getCurrentUrlPageId();
            var pageData = this.getDataByQuery(urlPageId);
            var pageName = pageData.title || "";
            var pageTitleSEO = pageData.pageTitleSEO || "";
            var isHomePage = this.isHomePage(urlPageId);
            var dynamicTitle = this.getDynamicPageTitle(urlPageId);

            if (dynamicTitle) {
                title = dynamicTitle;
            } else if (pageTitleSEO) {
                title = pageTitleSEO;
            } else if (!isHomePage) {
                title = title + ' | ' + pageName;
            }

            return title;
        },

        isHomePage: function (pageId) {
            return pageId && pageId === this.getMainPageId();
        },

        /**
         * Returns a list of pages data items from the site data
         * @returns {*}
         */
        getPagesDataItems: function () {
            var pageIds = this.getAllPageIds();
            var dataItems = _.map(pageIds, function (pageId) {
                return this.getDataByQuery(pageId);
            }, this);

            return dataItems;
        },

        /**
         * Returns true if 'debug=all' is present in URL, false otherwise.
         *
         * @returns {boolean}
         */
        isDebugMode: function () {
            return _.get(this, ['currentUrl', 'query', 'debug']) === 'all';
        },

        hasDebugQueryParam: function () {
            return _.has(this, ['currentUrl', 'query', 'debug']);
        },

        getFavicon: function () {
            return this.publicModel && this.publicModel.favicon;
        },

        getDocumentLocation: function () {
            return window.document.location;
        },

        /**
         * Gets the external base url from the publicModel or return the current base location
         * @returns {*}
         */
        getExternalBaseUrl: function () {
            // optimization: calculate only once
            var self = this;
            this.getExternalBaseUrl = this.isViewerMode() ?
                function () {
                    return this.publicModel.externalBaseUrl;
                } :
                (function () {
                    var relevantPathParts = 7;//http://editor.wix.com/html/editor/web/renderer/render/document/{meta-site-id}
                    var externalBaseUrl = coreUtils.urlUtils.getBaseUrlWithPath(self.getDocumentLocation(), relevantPathParts);
                    return function () {
                        return externalBaseUrl;
                    };
                }());
            return this.getExternalBaseUrl();
        },

        getUnicodeExternalBaseUrl: function () {
            return this.publicModel && this.publicModel.unicodeExternalBaseUrl;
        },

        getMainPageId: function () {
            if (this.publicModel) {
                return this.publicModel.pageList.mainPageId;
            }
            var siteStructureData = this.getDataByQuery('masterPage', 'masterPage');
            return siteStructureData.mainPage.id || siteStructureData.mainPageId || "mainPage";
        },

        getAllPageIds: function () {
            if (this.publicModel) {
                return _.map(this.publicModel.pageList.pages, 'pageId');
            }
            return _.keys(_.omit(this.pagesData, ['masterPage']));
        },

        getPageTitle: function(pageId) {
            if (this.publicModel) {
                var pages = _.get(this.publicModel, ['pageList', 'pages']);
                return _.get(_.find(pages, {pageId: pageId}), 'title');
            }
            return _.get(this.getDataByQuery(pageId), 'title');
        },

        getPageSEOMetaData: function (pageId) {
            var pageSEOMetaTags = {};
            pageId = this.getCurrentUrlPageId() || pageId;
            if (!pageId || pageId === "masterPage") {
                pageId = this.getMainPageId();
            }
            var pageData = this.getDataByQuery(pageId);
            if (pageData) {
                pageSEOMetaTags.description = pageData.descriptionSEO;
                pageSEOMetaTags.keywords = pageData.metaKeywordsSEO;
                pageSEOMetaTags.ogTags = pageData.metaOgTags;

                if (experiment.isOpen('sv_addRobotsIndexingMetaTag')) {
                    var isIndexable = _.get(pageData, 'indexable', true);
                    pageSEOMetaTags.robotIndex = isIndexable ? 'index' : 'noindex';
                }
            }

            if (experiment.isOpen('sv_updatePageOgTags')) {
                pageSEOMetaTags.ogTags = pageSEOMetaTags.ogTags || [];

                if (!_.find(pageSEOMetaTags.ogTags, {property: 'og:title'})) {
                    pageSEOMetaTags.ogTags.push({
                        property: 'og:title',
                        content: this.getCurrentUrlPageTitle()
                    });
                }

                if (!_.find(pageSEOMetaTags.ogTags, {property: 'og:url'})) {
                    pageSEOMetaTags.ogTags.push({
                        property: 'og:url',
                        content: this.getCurrentUrl()
                    });
                }
            }

            return pageSEOMetaTags;
        },

        getPageJsonld: function (pageId) {
            var jsonld = {};

            pageId = this.getCurrentUrlPageId() || pageId;
            if (!pageId || pageId === "masterPage") {
                pageId = this.getMainPageId();
            }
            var pageData = this.getDataByQuery(pageId);

            if (pageData) {
                jsonld = pageData.jsonld || {};
            }

            return jsonld;
        },

        getBrowser: function () {
            return this.browser;
        },

        getOs: function () {
            return this.os;
        },

        getHubSecurityToken: function () {
            return getSessionInfoProp.call(this, 'hs') || 'NO_HS'; //note that this is set in the dynamicModel.
        },

        setHubSecurityToken: function (hubSecurityToken) {
            setSessionInfoProp.call(this, 'hs', hubSecurityToken);
        },

        getPageUsedFonts: function (pageId) {
            var pageData = this.getDataByQuery(pageId);
            return pageData.usedFonts;
        },

        setPageUsedFonts: function (pageId, usedFontsList) {
            var pageData = this.getDataByQuery(pageId);
            pageData.usedFonts = usedFontsList;
        },

        getPremiumFeatures: function () {
            return this.rendererModel.premiumFeatures;
        },

        isViewerMode: function () {
            return !_.isUndefined(this.publicModel);
        },

        isTemplate: function () {
            return this.rendererModel.siteInfo.documentType === "Template";
        },

        shouldShowWixAds: function () {
            var siteDocumentType = this.rendererModel.siteInfo.documentType;

            var isTemplateView = siteDocumentType === "Template" && !this.rendererModel.previewMode;
            var hasPremiumNoWixAdsForSocial = _.includes(this.rendererModel.premiumFeatures, 'NoAdsInSocialSites');

            return this.renderFlags.isWixAdsAllowed && !this.isAdFreePremiumUser() && siteDocumentType !== "WixSite" && !isTemplateView && (!this.isFacebookSite() || !hasPremiumNoWixAdsForSocial);
        },

        getMobileWixAdsHeight: function () {
            if (this.isMobileView() && this.shouldShowWixAds()) {
                return 30;
            }

            return 0;
        },

        getPageBottomMargin: function () {
            return (this.isMobileView() || !this.shouldShowWixAds()) ? 0 : 40;
        },

        /**
         *
         * @returns {boolean}
         */
        isWixSite: function () {
            return this.rendererModel.siteInfo.documentType === 'WixSite';
        },

        isUsingUrlFormat: function (format) {
            return this.getUrlFormat() === format;
        },

        getUrlFormat: function () {
            if (this.urlFormatModel && this.urlFormatModel.format) {
                return this.urlFormatModel.format;
            }

            return coreUtils.siteConstants.URL_FORMATS.HASH_BANG;
        },

        isImageZoom: function (navigationInfo) {
            return navigationInfo.imageZoom;
        },

        getPageUrl: function (pageInfo, urlFormat, baseUrl, cleanQuery, urlMapping) {
            var actualUrlFormat = this.isUsingUrlFormat(coreUtils.siteConstants.URL_FORMATS.HASH_BANG) ? coreUtils.siteConstants.URL_FORMATS.HASH_BANG : urlFormat;

            return wixUrlParser.getUrl(this, _.assign({}, pageInfo, {format: actualUrlFormat}), false, _.isUndefined(cleanQuery) ? true : cleanQuery, baseUrl, urlMapping);
        },

        getCurrentUrl: function (urlFormat, baseUrl, isDifferentUrlFormat) {
            var rootNavigationInfo = this.getExistingRootNavigationInfo(this.getCurrentUrlPageId());
            return this.getPageUrl(rootNavigationInfo, urlFormat, baseUrl, undefined, isDifferentUrlFormat ? this.customUrlMapping : undefined);
        },

        getMainPageUrl: function (urlFormat, baseUrl) {
            return this.getPageUrl({pageId: this.getMainPageId()}, urlFormat, baseUrl);
        },

        getMainPagePath: function () {
            var mainPageUrl = this.getMainPageUrl(this.getUrlFormat());
            var remove = this.currentUrl.protocol + '//' + this.currentUrl.host;
            return mainPageUrl.replace(remove, '');
        },

        getForbiddenPageUriSEOs: function () {
            if (this.urlFormatModel && this.urlFormatModel.forbiddenPageUriSEOs) {
                return this.urlFormatModel.forbiddenPageUriSEOs;
            }

            return {};
        },

        getPageIdFromPageUriSeo: function (pageUriSeo) {
            return _.get(this.mapFromPageUriSeoToPageId, pageUriSeo);
        },

        /**
         * gets a global image quality values
         */
        getGlobalImageQuality: function () {
            return _.pick(this.getDataByQuery(coreUtils.siteConstants.GLOBAL_IMAGE_QUALITY), coreUtils.siteConstants.GLOBAL_IMAGE_QUALITY_PROPERTIES);
        },

        getCurrentPopupId: function () {
            return this._currentPageIds.popupPage;
        },

        getRootNavigationInfo: function () {
            var pageId = this.getPrimaryPageId();
            return this.getExistingRootNavigationInfo(pageId);
        },

        isPopupPage: function (pageId) {
            var pageData;

            if (pageId === 'masterPage') {
                return false;
            }

            pageData = this.getDataByQuery(pageId);

            return Boolean(pageData && pageData.isPopup);
        },

        isPopupOpened: function () {
            return Boolean(this.getCurrentPopupId());
        },

        getViewMode: function () {
            return this.isMobileView() ? constants.VIEW_MODES.MOBILE : constants.VIEW_MODES.DESKTOP;
        },

        isFeedbackEndpoint: function () {
            return !this.isViewerMode() && _.startsWith(this.currentUrl.path, '/html/editor/review');
        },
        getPublicBaseUrl : function (){
            var isPreviewMode = !!this.documentServicesModel;
            var isSiteWasPublished = isPreviewMode ? this.documentServicesModel.isPublished : true;
            if (isPreviewMode){
                return isSiteWasPublished ? this.documentServicesModel.publicUrl : "";
            }
            return this.getExternalBaseUrl();
        },
        getPagesDataForRmi: function () {
            var isPreviewMode = !!this.documentServicesModel;
            var isSiteWasPublished = isPreviewMode ? this.documentServicesModel.isPublished : true;

            var _getPageInfo = function (pageData, baseUrl) {
                return {
                    title: pageData.label || '',
                    fullUrl: isSiteWasPublished ? this.getPageUrl({
                        pageId: pageData.link.pageId.id,
                        title: pageData.label
                    }, null, baseUrl, false) : "",
                    url: '/' + pageData.link.pageId.pageUriSEO,
                    visible: pageData.isVisible,
                    id: pageData.link.pageId.id
                };
            };

            var pages = {
                pagesData: {},
                currentPageId: this.getPrimaryPageId(),
                baseUrl: ""
            };


            pages.baseUrl = this.getPublicBaseUrl();
            var sitePages = menuUtils.getSiteMenuWithoutRenderedLinks(this, true);

            pages.pagesData = _.map(sitePages, function (pageData) {
                var pageInfo = _getPageInfo.call(this, pageData, pages.baseUrl);
                var subPages = pageData.items;
                _.forEach(subPages, function (subItem) {
                    var subPageInfo = _getPageInfo.call(this, subItem, pages.baseUrl);
                    if (!pageInfo.childPages) {
                        pageInfo.childPages = [];
                    }
                    pageInfo.childPages.push(subPageInfo);
                }, this);
                return pageInfo;
            }, this);


            return pages;
        },

        setCustomUrlMapping: function (permalink, data) {
            this.customUrlMapping[permalink] = data;
        },
        addDynamicPageData: function (pageId, dynamicPageData, routerDefinition) {
            if (!this.dynamicPageData) {
                this.dynamicPageData = {};
            }
            if (!this.dynamicPageData[pageId]) {
                this.dynamicPageData[pageId] = {};
            }
            this.dynamicPageData[pageId] = {
                routerData: dynamicPageData,
                routerDefinition: routerDefinition
            };
        },
        getDynamicPageData: function (pageId) {
            if (this.dynamicPageData) {
                return this.dynamicPageData[pageId || this.getPrimaryPageId()];
            }
            return null;
        },
        addDynamicResponseForUrl: function (url, data){
            _.set(this, 'pageResponseForUrl[' + url + ']', data);
        },
        getDynamicResponseForUrl: function (url){
            return _.get(this, 'pageResponseForUrl[' + url + ']');
        },
        getRouters:function (){
            return _.get(this, 'routers.configMap');
        },
        isPlatformAppOnPage: function (pageId, appId) {
            return _.get(this, ['pagesPlatformApplications', appId, pageId], false);
        },
        isQaMode: function(){
            return coreUtils.urlUtils.isQueryParamOn(this.currentUrl, 'isqa');
        }

    };

    return SiteData;
});

/**
 * @typedef {Object} site.rootNavigationInfo
 * @property {string} pageId
 * @property {string} title
 * @property {?string} pageAdditionalData
 * @property {?string} pageItemId the id of the data item to be used for the page item usually zoom
 * @property {?string} pageItemAdditionalData additional data for the page item comp (like gallery id for image zoom)
 * @property {?string} anchorData
 */

/**
 * @typedef site.requestModel
 * @property {string} userAgent
 * @property {string} cookie
 */

/**
 * @typedef site.serviceTopology
 * @property {string} appRepoUrl
 * @property {string} baseDomain
 * @property {string} basePublicUrl
 * @property {string} biServerUrl
 * @property {string} billingServerUrl: "http://premium.wix.com/"
 * @property {string} blobUrl
 * @property {string} cacheKillerVersion
 * @property {boolean} developerMode
 * @property {string} ecommerceCheckoutUrl
 * @property {string} emailServer
 * @property {string} htmlEditorUrl
 * @property {string} logServerUrl
 * @property {string} mediaRootUrl
 * @property {string} monitoringServerUrl
 * @property {string} postLoginUrl
 * @property {string} postSignUpUrl
 * @property {string} premiumServerUrl
 * @property {string} publicStaticBaseUri
 * @property {string} publicStaticsUrl
 * @property {Object.<string, string>} scriptsLocationMap a map to the source code
 * @property {boolean} secured
 * @property {string} serverName
 * @property {string} siteMembersUrl
 * @property {string} staticAudioUrl
 * @property {string} staticDocsUrl
 * @property {string} staticHTMLComponentUrl
 * @property {string} staticMediaUrl
 * @property {string} staticServerUrl
 * @property {string} userFilesUrl
 * @property {string} userServerUrl
 * @property {string} usersClientApiUrl
 * @property {string} usersScriptsRoot
 */

/**
 * @typedef site.publicModel
 * @property {string} domain
 * @property {string} externalBaseUrl
 * @property {Object} pageList the main page id and the list of the page urls (add docs)
 * @property {number} timeSincePublish
 */

/**
 * @typedef site.siteMetaData
 * @property {{
 *      address: string
 *      companyName: string
 *      email: string
 *      fax: string
 *      phone: string
 * }} contactInfo
 * @property {boolean} adaptiveMobileOn
 * @property {{
 *      enabled: boolean
 *      [uri]: string
 * }} preloader
 * @property {{
 *      colorScheme: string,
 *      configuration: Object.<string, boolean>,
 *      socialLinks: Array
 * }} quickActions
 */

/**
 * @typedef {Object} site.rendererModel
 * @property {string} metaSiteId
 * @property {site.siteInfo} siteInfo
 * @property {Object.<string, *>} clientSpecMap please write docs for this type
 * @property {boolean} wixCodeModel
 * @property {string[]} premiumFeatures  a list of features like "HasDomain" or "AdsFree"
 * @property {string} geo
 * @property {string} languageCode
 * @property {boolean} previewMode
 * @property {string} userId
 * @property {site.siteMetaData} siteMetaData
 */

/**
 * @typedef {Object} site.siteInfo
 * @property {string} applicationType
 * @property {string} documentType
 * @property {string} siteId
 * @property {string} siteTitleSEO
 */

/**
 * @typedef {Object} data.compStructure.layout
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {?string} position    we don't get this from server, used only for dynamically created comps
 * @property {?boolean} fixedPosition  this is what we get from server.. stupid :)
 * @property {number} rotationInDegrees default 0
 * @property {number} scale default 1
 * @property {?object[]} anchors
 */
/**
 * @typedef {Object} data.compStructure
 * @property {string} styleId
 * @property {string} skin
 * @property {?string} dataQuery
 * @property {?string} propertyQuery
 * @property {string} type
 * @property {string} id
 * @property {string} componentType
 * @property {?data.compStructure.layout} layout
 * @property {?data.compStructure[]} components   it can be either components or children
 * @property {?data.compStructure[]} mobileComponents
 * @property {?data.compStructure[]} children
 */


/**
 * @typedef {Object} data.compThemeItem
 * @property {string} skin
 * @property {?string} compId  present only on custom style
 * @property {?string} componentClassName the comp type only on custom style
 * @property {string} id
 * @property {string} styleType can be system|custom
 * @property {Object} metaData
 * @property {{
 *      properties: Object.<string, string>
 * }} style the collection of the skin param values.
 */

/**
 * @typedef {Object.<string, (string|number|boolean)>} data.compDataItem
 * @property {string} id
 * @property {string} type
 * @property {Object} metaData
 */

/**
 * @typedef {Object.<string, (string|number|boolean)>} data.compPropertiesItem
 * @property {string} type
 * @property {{
 *      schemaVersion: string
 * }} metaData
 */

/**
 *  @typedef {Object<string, string>} data.generalTheme
 *  @property {string[]} border for example 0.15em solid [color_1]
 *  @property {string[]} color  for example #FFFFFF or 153,153,153,1
 *  @property {string[]} font  for example normal normal bold 72px/1.1em Play {color_14}
 */

/**
 * @typedef {Object.<string, data.compThemeItem>} data.themeData
 * @property {data.generalTheme} THEME_DATA get it from  {@link core.SiteData#getGeneralTheme}
 */

/**
 * @typedef {Object} data.pageData
 * @property {{
 *       document_data: Object.<string, comp.compDataItem>,
 *       theme_data: data.themeData,
 *       component_properties: Object.<string, comp.compPropertiesItem>
 * }} data
 * @property {data.compStructure} structure
 */
