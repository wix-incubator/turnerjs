/**
 * @class wysiwyg.viewer.managers.WViewManager
 */
define.Class("wysiwyg.viewer.managers.WViewManager", function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('bootstrap.managers.BaseManager');

    def.utilize([
        'wysiwyg.managers.appdata.AppDataHandler',
        'wysiwyg.viewer.managers.viewer.SiteView',
        'wysiwyg.viewer.managers.viewer.HashChangeHandler',
        'wysiwyg.viewer.managers.viewer.ViewerZoomHandler',
        'wysiwyg.viewer.managers.viewer.SiteMembersHandler',
        'wysiwyg.viewer.managers.pages.data.DataResolverFactory',
        'wysiwyg.common.managers.viewer.MobileViewHandler',
        'wysiwyg.viewer.utils.PageConfigurationRepository',
        'wysiwyg.viewer.managers.viewer.ViewerStaticLoadingHandler',
        'wysiwyg.common.utils.AnchorManager',
        'wysiwyg.viewer.managers.viewer.SiteDataHandler'
    ]);

    def.traits([
        'wysiwyg.viewer.managers.viewer.ViewerProxy'
    ]);


    def.resources(['W.Utils', 'W.Commands', "W.Data", "W.Config", "W.Classes"]);

    def.fields({
        _appDataHandler: null,
        _currentViewerName: null,
        _siteDataHandlerPromise: null
    });

    def.binds(['_onPageNavigation', '_setPageToCurrent', '_setPageOnSiteLoad']);

    def.statics({
        'FIXED_CONTAINER_ID': 'FIXED_CONTAINER'
    });

    /** @lends wysiwyg.viewer.managers.WViewManager */
    def.methods({
        initialize: function(){
            this._initMembers();
            this._registerPageConfiguration();
            this.parent();

            this._isReady = true;

            /** @THINK */
            this.addHeightChangeCallback(function(){
                return this.getSiteNode().getLogic().getSiteStructureHeightWithMenu();
            }.bind(this));
            this.addEvent('pageTransitionEnded', this._onPageNavigation);
            this._initAdData();
            this._pageDataWaitingList = [];

            this.resources.W.Commands.registerCommandAndListener('WViewerCommands.PageChangeStart', this, this._onPageChangeStart);
            this.resources.W.Commands.registerCommandAndListener('WViewerCommands.PageChangeComplete', this, this._onPageChangeComplete);

            /**@type wysiwyg.common.utils.AnchorManager*/
            this._anchorManager = new this.imports.AnchorManager(this);
        },

        _initMembers: function(){
            this._siteDataHandlerPromise = Q.defer();
            this._fixedContainer = this._addFixedItemsContainer(this.FIXED_CONTAINER_ID);
            this._zoomHandler = new this.imports.ViewerZoomHandler(this, this._fixedContainer);
            this._siteMembersHandler = new this.imports.SiteMembersHandler(this, this._fixedContainer);
            /** @type wysiwyg.common.managers.viewer.MobileViewHandler */
            this._mobileHandler = new this.imports.MobileViewHandler();
            this._hashChangeHandler = new this.imports.HashChangeHandler(this, this._zoomHandler, this._siteMembersHandler);
            /** @type wysiwyg.viewer.managers.pages.data.LocalDataResolver */
            this._dataResolver = new this.imports.DataResolverFactory().getDataResolver();
            this._pageConfigurationRepository = new this.imports.PageConfigurationRepository();
            this._loadedViewers = {};
            this._activeViewer_ = null;
            this._currentPageExtData = null;
            this._initCurrentPageFromHash();
            this._staticLoadingHandler_ = new this.imports.ViewerStaticLoadingHandler(this);
        },

        _initAdData: function(){
            var adData = {};
            var wixAdsNodeData = {};
            adData[Constants.ViewerTypesParams.TYPES.DESKTOP] = window.adData;
            adData[Constants.ViewerTypesParams.TYPES.MOBILE] = window.mobileAdData;
            this._adData = adData;

            var wixAds = document.getElementById('wixFooter');
            if (wixAds){
                _.forEach(wixAds.attributes, function(atr){
                    wixAdsNodeData[atr.name] = atr.value;
                });
            } else {
                wixAdsNodeData = null;
            }
            this._wixAdsNodeData = wixAdsNodeData;
        },

        getNodeAdData: function(){
            return this._wixAdsNodeData;
        },

        captureMobile: function(){
            var self = this;
            this.resources.W.Classes.getClass('wysiwyg.viewer.managers.viewer.ViewerCaptureHandler', function(ViewerCaptureHandlerClass){
                self._captureHandler_ = new ViewerCaptureHandlerClass(self);
                self._captureHandler_.captureMobile();
            });
        },

        _initCurrentPageFromHash: function(){
            var hash = this.resources.W.Utils.hash.getHash();
            var hashData = W.Data.isDataAvailable('#' + hash) && W.Data.getDataByQuery('#' + hash);
            if(this._hashChangeHandler.isPageDataType(hashData.getType)){
                this._currentPageId = hash;
            }
        },

        //changed "Page" type getter to support also pages (section pages).
        _registerPageConfiguration: function() {
            this._pageConfigurationRepository.registerPageType("Page", function (data) {
                if (data.tpaApplicationId) {
                    if (data.tpaPageId) {
                        return "TpaHiddenPage";
                    }
                    else {
                        return "TpaPage";
                    }
                }
                return data.type;
            });
            this._pageConfigurationRepository.registerConfig("Page", {});
        },

        _addFixedItemsContainer: function(id){
            var div = new Element('div', {'id': id});
            document.body.appendChild(div);
            return div;
        },

        /**
         * called only on first load (viewer deploy)
         */
        initiateSite: function() {
            var self = this;
            var initiateSiteView = function(isMobileStructureExist){
                var loadMobileStructure = isMobileStructureExist && (W.Config.isMobileOptimizedViewOn() || W.Config.forceMobileOptimizedViewOn());
                var viewerName = loadMobileStructure ? Constants.ViewerTypesParams.TYPES.MOBILE : Constants.ViewerTypesParams.TYPES.DESKTOP;
                self._firstActiveViewerLoad(viewerName);
                if(W.Config.mobileConfig.isMobile()){
                    //done for all mobile devices.
                    self._mobileHandler.setMobileSite(viewerName);
                }
                self._activeViewer_.initiateSite();
            };

            if(W.Config.env.$isPublicViewerFrame && (W.Config.mobileConfig.isMobile() || W.Config.forceMobileOptimizedViewOn())) {
                this._dataResolver.isStructureExists(Constants.ViewerTypesParams.TYPES.MOBILE).then(initiateSiteView);
            } else {
                initiateSiteView(false);
            }
        },

        switchViewer: function(viewerName, disposeAndCreate, viewerWidth){
            this.resources.W.Commands.executeCommand('WViewerCommands.MediaZoom.Close');
            if(this._activeViewer_){
                this._activeViewer_.getSiteNode().$logic.collapse();
            }

            var targetViewer = this._loadedViewers[viewerName];
            if(targetViewer && disposeAndCreate){
                targetViewer.dispose();
            }
            if(!targetViewer || disposeAndCreate) {
                this._initSiteView(viewerName, viewerWidth, this._setPageToCurrent);
            }
            if (this._activeViewer_){
                this.removeEventPropagation();
            }
            this._setSiteViewToBeActive(viewerName);

            if(this._activeViewer_.getSiteNode()) {
                this._activeViewer_.getSiteNode().$logic.uncollapse();
                if(this._activeViewer_.isSiteReady()) {
                    this._setPageToCurrent();
                }
            }
        },

        _firstActiveViewerLoad: function(viewerName){
            var isDesktop = viewerName === Constants.ViewerTypesParams.TYPES.DESKTOP;
            var width = !isDesktop ? Constants.ViewerTypesParams.DOC_WIDTH[viewerName] : undefined;
            this._initSiteView(viewerName, width, this._setPageOnSiteLoad);
            this._setSiteViewToBeActive(viewerName);

        },

        _initSiteView: function(viewerName, viewerWidth, readyCallback){
            this._loadedViewers[viewerName] = new this.imports.SiteView(this, this._dataResolver, viewerName);
            this._loadedViewers[viewerName].addEvent('SiteReady', readyCallback);
            if(viewerWidth){
                this._loadedViewers[viewerName]._updateDocWidth(viewerWidth);
            }
        },

        _setSiteViewToBeActive: function(viewerName){
            var previousViewerName = this._currentViewerName;
            this._activeViewer_ = this._loadedViewers[viewerName];
            this._currentViewerName = viewerName;
            this.propagateEvents();
            if (this._currentViewerName !== previousViewerName){
                this.resources.W.Commands.executeCommand('WPreviewCommands.ViewerStateChanged', {viewerMode: viewerName});
            }
        },

        _setPageToCurrent: function(){
            this._activeViewer_.removeEvent('SiteReady', this._setPageToCurrent);
            this._currentPageId = this._currentPageId || this.getHomePageId();
            var extData = this.resources.W.Utils.hash.getHashParts().extData;
            this._activeViewer_.changePageWithTransition(this._currentPageId);
            this._activeViewer_._onPageExtraDataChange_(extData, this._currentPageId, false);
        },

        _setPageOnSiteLoad: function(){
            if (this.resources.W.Config.env.$isEditorViewerFrame) {
                var pageManager = this.getSiteView('DESKTOP').getPageManager();
                this.siteDataHandler = new this.imports.SiteDataHandler(pageManager, this._dataResolver);
                this._siteDataHandlerPromise.resolve(this.siteDataHandler);
            }

            this._activeViewer_.removeEvent('SiteReady', this._setPageOnSiteLoad);
            this.resources.W.Utils.hash.fireHashChangeEvent(true);
            W.Commands.executeCommand("WViewerCommands.SelectedPageChanged", this._currentPageId);
        },

        getSiteDataHandlerPromise: function () {
            if (!this.resources.W.Config.env.$isEditorViewerFrame) {
                throw "SiteData should be used only in the Editor";
            }
            return this._siteDataHandlerPromise.promise;
        },

        getSiteDataHandler: function() {
            if (!this.resources.W.Config.env.$isEditorViewerFrame) {
                throw "SiteData should be used only in the Editor";
            }
            return this.siteDataHandler;
        },
        /**
         * on the way to die, use Config.env instead
         * @returns {*}
         */
        getViewerMode: function(){
            return this._currentViewerName;
        },

        getSiteView: function(viewName){
            return this._loadedViewers[viewName];
        },

        getCurrentPageId: function(){
            return this._currentPageId;
        },

        _setCurrentPageId_: function(pageId){
            this._currentPageId = pageId;
        },

        /**
         * @returns {wysiwyg.viewer.utils.PageConfigurationRepository}
         */
        getPageConfigurationRepository: function(){
            return this._pageConfigurationRepository;
        },

        isPageComponent: function(componentClassName){
            return componentClassName === 'mobile.core.components.Page' ||
                componentClassName === 'core.components.Page' ||
                componentClassName === 'wixapps.integration.components.AppPage';
        },

        _onPageChangeStart: function(page) {
            if (window.viewMode === "site") {
                // don't send beat event during initial site load
                if (page.fromPageId) {
                    LOG.reportBeatStartEvent({
                        pageId: page.pageId,
                        isFromReset: page.isFromReset
                    });
                }
            }
        },

        _onPageChangeComplete: function(page){
            if (window.viewMode === "site") {
                LOG.reportBeatFinishEvent({
                    pageId: page.pageId
                });
            }
        },

        _onPageNavigation: function(nextPage){
            this._setDocumentTitle(nextPage);
            this.resources.W.Commands.executeCommand('WViewerCommands.MediaZoom.Close');
        },

        _getCustomPageTitlePromise: function () {
            var ret = Q.defer();

            var pageLogic = null;

            try {
                pageLogic = this.getCurrentPageNode().getLogic();
            }
            catch (e) {}

            if (pageLogic && pageLogic.getCustomPageTitle) {
                pageLogic.getCustomPageTitle(function (title) {
                    ret.resolve(title);
                });
            }
            else {
                ret.resolve(null);
            }

            return ret.promise;
        },

        /**
         * set document title according to spec:
         * http://kb.wixpress.com/display/html/Metadata#Metadata-UserDefinedDataFieldsfulllistings
         *
         * @param page page to be shown
         */
        _setDocumentTitle: function(page){
            var docTitle = "";
            var pageData = this.getPagesData()[page];
            var pageTitleSEO = pageData.get('pageTitleSEO') || '';
            var pageName = pageData.get('title') || '';
            var siteTitle = W.Config.getSiteTitleSEO();
            var isHomePage = this.isHomePage(page);

            this._getCustomPageTitlePromise().then(function (customPageTitle) {
                // custom page title is top priority
                if (customPageTitle) {
                    if (siteTitle) {
                        docTitle = siteTitle + " | " + customPageTitle;
                    }
                    else {
                        docTitle = customPageTitle;
                    }
                }
                // user defined is second priority
                else if (pageTitleSEO) {
                    docTitle = pageTitleSEO;
                }
                // last priority
                else {
                    docTitle = siteTitle;
                    if (!isHomePage) { // only if it's an inner page, we also add the page name
                        docTitle += (docTitle) ? ' | ' : '';
                        docTitle += pageName;
                    }
                }

                if(docTitle) {
                    document.title = docTitle;
                }
            });
        },

        //TODO - export this as a plugin
        getAppPages: function () {
            var appPages = {};
            var self = this;
            Object.each(this.getPages(), function (element, key) {
                var pageDataQuery= element.getAttribute('dataQuery');
                var pageData = self.resources.W.Data.getDataByQuery(pageDataQuery);
                var page = pageData.getData();
                if (page.type === "AppPage" || page.type === "AppBuilderPage") {
                    var appPageId = pageData.get("appPageId");
                    appPages[appPageId] = {
                        'data': pageData,
                        'node': element
                    };
                }
            });

            return appPages;
        },

        getAppDataHandler: function(){
            if(!this._appDataHandler) {
                this._appDataHandler = new this.imports.AppDataHandler();
            }
            return this._appDataHandler;
        },

        //a stub for fixViewport
        setSite: function (siteNode, siteStructureData, isLazyPageCreation) { },


        getAdData: function(){
            return this._adData;
        },

        addHeightChangeCallback: function (callback) {
            this._heightChangeCallbacks = this._heightChangeCallbacks || [];
            this._heightChangeCallbacks.push(callback);
        },

        enterFullScreenMode: function(){
            if(!this._isFullScreen) {

                if(W.Config.env.$isEditorViewerFrame && this._isParentSameOrigin()){
                    // Setting fullscreen on editor for backwards compatibility
                    window.parent.document.body.addClass('fullScreenMode');
                }

                document.body.addClass('fullScreenMode');
                this._isFullScreen = true;
                this._currentPageExtData = this.resources.W.Utils.hash.getHashParts().extData;
            }
        },

        exitFullScreenMode: function(){
            if(this._isFullScreen) {
                var id;
                var extData = '';
                if(this.getCurrentPageId()) {
                    id = this.getCurrentPageId();
                    extData = this._currentPageExtData;
                }
                else {
                    id = this.getHomePageId();
                }

                // Get current scroll position
                var scrollY = this.getScrollTop();

                this._hashChangeHandler._setUrlHashToPage(id, extData);

                // Scroll back to old position after setting hash
                _.defer(function() {
                    window.scrollTo(0, scrollY);
                });

                if(W.Config.env.$isEditorViewerFrame){
                    // Setting fullscreen on editor for backwards compatibility
                    window.parent.document.body.removeClass('fullScreenMode');
                }
                document.body.removeClass('fullScreenMode');

                this._isFullScreen = false;
            }
        },

        getActiveViewerHeightFromCallback: function(){
            if(!this._heightChangeCallbacks) {
                return 0;
            }
            var height = 0;
            var i;
            for (i = 0; i < this._heightChangeCallbacks.length; i++) {
                height += this._heightChangeCallbacks[i]();
            }
            return height;
        },

        getScrollTop: function(){
            return document.body.scrollTop || window.pageYOffset;
        },

        goToPage: function(pageId, extData){
            var newPageData = W.Data.getDataByQuery('#' + pageId);
            if(!newPageData) {
                return;
            }

            this._siteMembersHandler.checkRequireLogin(newPageData, this.setUrlHashToPage.bind(this, pageId, extData),false);
            this.fireEvent('pageChanging');
        },

        setUrlHashToPage: function(pageId, extData, silentChangeEvent) {
            this._hashChangeHandler._setUrlHashToPage(pageId, extData, silentChangeEvent);
        },

        handleQuickActions: function () {
            if (this.resources.W.Config.mobileConfig.isMobile()) {
                var mobileQuickActionsHandler = new this.imports.MobileQuickActionsHandler();
                mobileQuickActionsHandler.handleMobileQuickActions();
            }
        },


        /********** PROXY METHODS *************************************/

        getDefaultGetZoomDisplayerFunction: function(dataType){
            return this._zoomHandler.getDefaultGetZoomDisplayerFunction(dataType);
        },

        getDefaultGetHashPartsFunction: function(dataType){
            return this._zoomHandler.getDefaultGetHashPartsFunction(dataType);
        },

        removeZoomElement: function(){
            return this._zoomHandler.removeZoomElement();
        },

        getZoomHandler: function(){
            return this._zoomHandler;
        },

        setPageAsNotValidated: function(pageId){
            return this._siteMembersHandler.setPageAsNotValidated(pageId);
        },

        /**
         * @returns {wysiwyg.viewer.managers.pages.data.LocalDataResolver}
         */
        _getDataResolver_: function(){
            return this._dataResolver;
        },

        setViewportAttribute: function (attribute, value) {
            this._mobileHandler.setViewportAttribute(attribute, value);
        },

        setViewportTag:function(width, viewportScale){
            this._mobileHandler.setViewportTag(width, viewportScale);
        },

        resetViewportTag:function(){
            this._mobileHandler._handleMobileRotation();
        },

        addViewerRotationListener:function(){
            this._mobileHandler.addRotationEventListener();
        },

        removeViewerRotationListener:function(){
            this._mobileHandler.removeRotationEventListener();
        },

        /** Function createElement
         * creates an element using moo-tools new Element
         * used to create elements in the preview-scope
         * @param conf - the configuration object supplied by the server
         *
         */
        createElement: function(tag, props){
            return new Element(tag, props);
        },

        addPage: function(serializedPage, pageNode){
            this._dataResolver.addPage(serializedPage);
            this._activeViewer_.getPageManager().addLoadedPage(serializedPage.id, pageNode);

            var pageData = this.resources.W.Data.getDataByQuery("#" + serializedPage.id);
            this._notifyPageDataLoaded(pageData);
        },

        removePage: function(pageData){
            this._dataResolver.removePage(pageData);
            this._activeViewer_.getPageManager().removePage(pageData.getComponentId());
        },

        _notifyPageDataLoaded: function (pageData) {
            this._pageDataWaitingList = _.filter(this._pageDataWaitingList, function (waiter) {
                if (waiter.predicate(pageData)) {
                    waiter.q.resolve(pageData);
                    return false;
                }
                return true;
            });
        },

        _waitForPageData: function (predicate, q) {
            this._pageDataWaitingList.push({ predicate: predicate, q: q });
        },

        getPageDataPromise: function (predicate) {
            var q = Q.defer();

            var pagesData = this.getPagesData();
            var data = _.find(pagesData, predicate);
            if (data) {
                q.resolve(data);
            }
            else {
                this._waitForPageData(predicate, q);
            }

            return q.promise;
        },

        getHomePageId: function() {
            return this._dataResolver.getMainPageId();
        },


        /** Function clone
         * Clone ViewManager and return a new instance
         */
        clone: function(newDefine){
            return this.parent(newDefine);
        },


        /** Function isReady
         * Check to see if viewer got site ready
         */
        isReady: function(){
            return this._isReady;
        },

        /**
         *  Function: setLinkTipFunc
         *      sets a function in the preview-viewer for showing link tip popups.
         *
         *  Parameters:
         *      cb.
         */
        setLinkTipFunc: function(cb){
            this._linkTipFunc = cb;
        },

        /**
         *  Function: getLinkTipFunc
         *      returns a function from the preview-viewer for showing link tip popups.
         *
         *
         */
        getLinkTipFunc: function(){
            return this._linkTipFunc;
        },

        getSiteName: function () {
            return window.rendererModel.siteName || "";
        },

        getAnchorManager: function(){
            return this._anchorManager;
        },

        getSiteDataHandlerSync: function() {
            return this.siteDataHandler;
        },
        _isParentSameOrigin: function() {
          var sameOrigin;
            try {
                sameOrigin = (window.parent.location.host === window.location.host);
            } catch(e) {
                sameOrigin = false;
            }
            return sameOrigin;
        }
    });
});
