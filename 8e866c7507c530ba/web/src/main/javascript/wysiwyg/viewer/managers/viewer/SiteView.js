/**
 * @class wysiwyg.viewer.managers.viewer.SiteView
 */
define.Class('wysiwyg.viewer.managers.viewer.SiteView', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('bootstrap.utils.Events');

    def.utilize([
        'wysiwyg.viewer.managers.PageManager'
    ]);

    def.traits([
        'wysiwyg.viewer.managers.viewer.PageManagementTemp'
    ]);

    def.binds(['_fireScreenResizeEvent', '_onSiteReady', '_notifySiteReadyForThumbnail', 'AfterSiteRendered', '_setSiteNode', '_afterSiteReplacedStaticHtml']);

    def.resources(['W.Utils', 'W.Commands', 'W.Config', 'W.Data', 'fnvHash', 'BrowserUtils']);

    /** @lends wysiwyg.viewer.managers.viewer.SiteView*/
    def.statics({
        SCREEN_RESIZE_EVENT: "ScreenResize"
    });

    /** @lends wysiwyg.viewer.managers.viewer.SiteView*/
    def.methods({
        initialize: function (viewer, dataResolver, viewerName) {
            this._viewer = viewer;
            this._viewerName =  viewerName;
            this._dataResolver = dataResolver;
            this._prefix = Constants.ViewerTypesParams.DOM_ID_PREFIX[this._viewerName] || '';
            this._pageManager = new this.imports.PageManager(this._viewerName, dataResolver);
            this._pageManager.addEvent('siteNodeCreated', this._setSiteNode);

            this._initState();

            this.initScreenResizeEventPropagation();
        },

        initScreenResizeEventPropagation: function () {
            $(window).addEvent("resize", this._fireScreenResizeEvent);
        },

        _initState: function(){
            this._isSiteReady = false;
            this._pagesData = null;
            this._mainPageData = null;
            this._siteStructureData = null;
            this._isFullScreen = null;
            this._isStaticHtmlCleared = false;
        },

        /** Function isSiteReady
         * Check to see if all initial components in page are ready and site is configured
         */
        isSiteReady: function() {
            return this._isSiteReady;
        },
        getPageManager: function(){
            return this._pageManager;
        },

        initiateSite: function(){
            this._pageManager.addEvent(this._pageManager.EVENTS.SITE_LOADED, this.AfterSiteRendered);
            var keepStaticParam = this.resources.BrowserUtils.getQueryParams()["keepstatic"];
            this._keepStatic = keepStaticParam && keepStaticParam[0] && keepStaticParam[0] === 'true';

            if (!this._keepStatic){
                this._logViewerRender('site starting to load');
                return this._loadSite();
            }
        },

        _loadSite: function() {
            var that = this;
            return this._dataResolver.isStructureExists(Constants.ViewerTypesParams.TYPES.MOBILE)
                .then(function(hasMobileStructure){
                    var shouldWixifyAllPages = that._getShouldWixifyAllPages(hasMobileStructure);
                    that._pageManager.loadSite(shouldWixifyAllPages);
                });
        },

        _getShouldWixifyAllPages: function(hasMobileStructure) {
			var shouldWixifyAllPages = false; //default

			if (this.resources.W.Config.env.$isEditorViewerFrame) {
				var isFirstSiteLoad = this.resources.W.Config.siteNeverSavedBefore();
				var doesntHaveMobileStructure = !hasMobileStructure;
				var wixifyAllPagesInQuery = this.resources.W.Utils.getQueryParam('WixifyAllPages') === 'true';  //The url query is for debugging purposes (internal use only)
				shouldWixifyAllPages = wixifyAllPagesInQuery || isFirstSiteLoad || doesntHaveMobileStructure;
			}

			return shouldWixifyAllPages;
        },

        AfterSiteRendered: function(siteNode){
            this._setSiteNode(siteNode);
            this.getAndInitSiteStructureData();

            // Validate params
            if (!siteNode){
                LOG.reportError(wixErrors.VM_INVALID_SITE_NODE,this.className,"setSite","");
            }

            if (!this._siteStructureData){
                LOG.reportError(wixErrors.VM_INVALID_SITE_DATA,this.className,"setSite","");
            }

            // Index pages by html
            this.indexPages();
            this.updatePagesData();

            this._siteStructureData.addComponentWithInterest(this._siteNode.getLogic());

            var pageGroupComp = this._viewer.getPageGroupElement();
            if (pageGroupComp && pageGroupComp.getProperty('comp')) {
                this._pageGroupComp = pageGroupComp;
                var self = this;
                this._pageGroupComp.addEvent('pageTransitionEnded', function(page){
                    self.fireEvent('pageTransitionEnded', page);
                });
            }

            this._onSiteReady();
        },

        _setSiteNode: function(siteNode){
            this._siteNode = $(siteNode);
        },

        dispose: function(){
            $(window).removeEvent("resize", this._fireScreenResizeEvent);
            this._pageGroupComp.$logic.removeAllEvents();
            this._siteNode.$logic.removeAllEvents();
            this.removeAllEvents();
            this._siteNode.$logic.dispose();
        },



        /** Function _onSiteReady
         * Called on site ready when all necessary components are ready
         */
        _onSiteReady: function () {
            this._logViewerRender('site ready');
            // Set ready flag
            this._isSiteReady = true;
            if(this.resources.W.Config.mobileConfig.isMobile()){
                this._scrollToHideMobileAddressBar();
            }

            //Apply loaded anchors
            W.Layout.attachSavedAnchors();

            this.fireEvent('SiteReady', {viewerName: this._viewerName});
            this._reportBIEvents(); //switched order

            //this is for site history, feedme and preview unpublished sites
            //in this cases there is a preview not inside the editor.. and then things (apps zoom for example)
            // that wait for this command
            if(this.resources.W.Config.env.$isEditorlessPreview){
                var cmd = this.resources.W.Commands.registerCommand("EditorCommands.SiteLoaded");
                cmd.execute();
            }

//            W.Layout.findAndEnforceInvalidatedAnchors(this.getSiteNode().getLogic());

            //Fire initial "resize" event to report document size to listeners
            this._fireScreenResizeEvent();
            if (this.getSiteNode() && this.getSiteNode().getLogic) {
                this.siteHeightChanged();
            }
            this.resources.W.Utils.callLater(this._notifySiteReadyForThumbnail);

            if (this.resources.W.Config.isLoadedFromStatic()){
                this._viewer._staticLoadingHandler_.addEvent(this._viewer._staticLoadingHandler_.EVENTS.SITE_REPLACED_STATIC_HTML, this._afterSiteReplacedStaticHtml);
                this._viewer._staticLoadingHandler_.replaceStaticHtmlWithActualSite();
            }
        },

        _afterSiteReplacedStaticHtml: function(){
            this._isStaticHtmlCleared = true;
            this.fireEvent(this._viewer._staticLoadingHandler_.EVENTS.SITE_REPLACED_STATIC_HTML, {viewerName: this._viewerName});
        },

        _logViewerRender: function(step) {
            deployStatus('viewerRender', {
                'step': step,
                'time': LOG.getSessionTime()
            });
        },

        _scrollToHideMobileAddressBar: function () {
            if (!this.resources.W.Config.isLoadedFromStatic()){
                window.scrollTo(0, 1);
            }
        },

        isStaticHtmlCleared: function() {
            return this._isStaticHtmlCleared;
        },

        getSiteHeight: function () {
            return this._siteHeight;
        },


        siteHeightChanged: function (dontNotifySiteStructure) {
            this.getSiteNode().getLogic().flushPhysicalHeightCache();
            this._siteHeight = this._getHeightFromCallback();
            this.fireEvent('resize', this._siteHeight);

            if (!dontNotifySiteStructure) {
                this.getSiteNode().getLogic().setHeight(this._siteHeight);
            }

            this._postHeightMessage();
        },
        _getHeightFromCallback: function () {
            return this._viewer.getActiveViewerHeightFromCallback();
        },

        _postHeightMessage: function () {
            // Handle communication with Facebook app where the viewer is loaded in Iframe
            var target = parent.postMessage ? parent : (parent.document.postMessage ? parent.document : undefined);
            if (target && typeof target !== "undefined") {
                target.postMessage(this._siteHeight, "*");
            }
        },

        _updateDocWidth: function(newDocWidth) {
            if (newDocWidth) {
                this._docWidth = newDocWidth;
                return;
            }

            var previewDocumentData = this.getAndInitSiteStructureData();
            var renderModifiers = previewDocumentData.get('renderModifiers');

            var siteWidthQueryParam = this.injects().Utils.getQueryParam("siteWidth");
            if (siteWidthQueryParam) {
                this._docWidth = parseInt(siteWidthQueryParam, 10);
                renderModifiers.siteWidth = this._docWidth;
                previewDocumentData.markDataAsDirty();
                return;
            }

            if (renderModifiers && renderModifiers.siteWidth) {
                this._docWidth = renderModifiers.siteWidth;
                return;
            }

            switch(window.rendererModel.applicationType) {
                //            case Constants.WEditManager.SITE_TYPE_FACEBOOK:
                case 'HtmlFacebook':
                    this._docWidth = '520';
                    break;
                //            case Constants.WEditManager.SITE_TYPE_WEB:
                case 'HtmlWeb':
                    this._docWidth = '980';
                    break;
                default:
                    this._docWidth = 980;
            }
        },

        getDocWidth: function() {
            if (!this._docWidth) {
                this._updateDocWidth();
            }
            return this._docWidth;
        },

        getAndInitSiteStructureData: function(){
            if(!this._siteStructureData){
                this._siteStructureData = W.Data.getDataByQuery('#SITE_STRUCTURE');
            }
            return this._siteStructureData;
        },

        _notifySiteReadyForThumbnail: function () {
            if (this.resources.W.Utils.getQueryParam('siteReadyAlert') === 'true') {
                // alert('siteReady');
            }
            var postUrl = this.resources.W.Utils.getQueryParam('siteReadyPost');
            if (postUrl) {
                var req = new Request.JSON({url: postUrl});
                req.post({'siteReady': true});
            }
        },

        /** Function getSiteNode
         * Returns viewer site structure node
         */
        getSiteNode: function() {
            return this._siteNode;
        },

        getPages: function(){
            return this._pageManager.getPageNodes();
        },

        /**
         *
         * @param id
         * @returns {Node} the component's viewNode
         */
        getCompByID: function(id) {
            var searchId = id;
            //we need it for pages, cause people search for pages by data id, it should STOP
            if(this._prefix && id.indexOf(this._prefix) !== 0){
                searchId = this._prefix + id;
            }
            var results = document.querySelectorAll('[id="'+searchId+'"]');

            if(!results || results.length === 0){
                LOG.reportError(wixErrors.NO_COMPONENT_WITH_GIVEN_ID, this.className, "getCompByID", 'id' + id);
                return;
            }

            if(results.length>1){
                LOG.reportError(wixErrors.CORRUPTED_ELEMENT_WITH_COMPONENT_ID, this.className, "getCompByID", 'id' + id);
            }

            for(var i=0; i<results.length; i++){
                var current = results[i];
                if(current.getAttribute("comp")){
                    return current;
                }
            }
            //fallback
//            LOG.reportError(wixErrors.CORRUPTED_ELEMENT_WITH_ID_AND_NOT_SUCH_COMPOENENT, this.className, "getCompByID", 'id' + id);
            return  results[0];
        },

        /**
         * When we specifically want to get multiple components with the same ID -
         * which is not a valid scenario, but we need this if we want to fix the scenario
         * @param id
         * @returns {NodeList}
         */
        getAllCompsWithID: function(id){
            var searchId = id;
            if(this._prefix && id.indexOf(this._prefix) !== 0){
                searchId = this._prefix + id;
            }
            return document.querySelectorAll('[id="'+searchId+'"]');
        },

        getMasterComponents: function(){
            var siteLogic = this.getSiteNode().$logic;
            return this._getMasterComponents(siteLogic, []);
        },

        _getMasterComponents: function(root, results){
            var children = root.getChildComponents();

            _.forEach(children, function(child){
                var compName = child.get('comp');
                var comp = child.$logic;

                if(comp && !this._viewer.isPageComponent(compName)) {
                    results.push(comp);

                    if(comp.isContainer()) {
                        this._getMasterComponents(comp, results);
                    }
                }
            }.bind(this));

            return results;
        },

        getPageComponents: function(pageId){
            pageId = pageId || this.getCurrentPageId();
            var page = this.getCompByID(pageId).$logic;
            if (!page) {
                return null;//maybe report something?
            }
            return page.getPageComponents();
        },

        _onPageExtraDataChange_: function (extData, pageId, silent) {
            if (silent) {
                return;
            }
            var nextPageData = W.Data.getDataByQuery('#' + pageId);
            var pageType = nextPageData.get("type");
            if(pageType === "Page"){
                this._handleTPAExtraDataChange(nextPageData);
            }
        },

        _handleTPAExtraDataChange: function(nextPageData) {
            this.resources.W.Commands.executeCommand('TPAViewerCommands.HashExtraDataChange', nextPageData);
        },

        getCompByIDAddPrefix: function(id){
            return $(this._prefix+id);
        },

        _fireScreenResizeEvent: function () {
            this.fireEvent(this.SCREEN_RESIZE_EVENT);
        },

        _reportBIEvents: function() {
            switch(window.viewMode) {
                case 'preview':
                    LOG.reportEvent(wixEvents.PREVIEW_READY);
                    break;
                case 'site':
//                    var isNewPublishSite = W.Pages && W.Pages.loadSite && !window.wixData;
                    var isNewPublishSite = !window.wixData;
                    var stateStr = this.resources.W.Utils.getFullStateString();
                    var stateHash = this.resources.fnvHash.hash(stateStr);
                    var params = {'c1': isNewPublishSite, 'c2': stateHash};
                    LOG.reportEvent(wixEvents.SITE_READY, params);
                    break;
            }
        },

        getPrefix: function(){
            return this._prefix;
        }
    });
});
