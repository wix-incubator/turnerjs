/**
 * @class wysiwyg.viewer.managers.viewer.ViewerProxy
 * @lends wysiwyg.viewer.managers.WViewManager
 */
define.Class('wysiwyg.viewer.managers.viewer.ViewerProxy', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@lends wysiwyg.viewer.managers.WViewManager */
    def.methods({
        initialize: function(){
            this.SCREEN_RESIZE_EVENT = "ScreenResize";
        },

    _eventHandlers: {},
        propagateEvents: function(){
            this.addEventPropagation('pageTransitionEnded');
            this.addEventPropagation('SiteReady');
            this.addEventPropagation('resize');
            this.addEventPropagation(this._activeViewer_.SCREEN_RESIZE_EVENT);
            this.addEventPropagation('siteReplacedStaticHtml');
        },

        removeEventPropagation: function(){
            this.removeEvent('resize', this._eventHandlers['resize']);
            this.removeEvent('SiteReady', this._eventHandlers['SiteReady']);
            this.removeEvent('pageTransitionEnded', this._eventHandlers['pageTransitionEnded']);
            this.removeEvent(this._activeViewer_.SCREEN_RESIZE_EVENT, this._eventHandlers[this._activeViewer_.SCREEN_RESIZE_EVENT]);
            this.removeEvent('siteReplacedStaticHtml', this._eventHandlers['siteReplacedStaticHtml']);
        },

        addEventPropagation: function (eventName){
            var self = this;
            this._eventHandlers[eventName] = function(args){
                self.fireEvent(eventName, args);
            };
            this._activeViewer_.addEvent(eventName, this._eventHandlers[eventName]);
        },


        //PAGES
        indexPages: function () {
            return this._activeViewer_.indexPages();
        },

        getPageData: function (pageId) {
            return this._activeViewer_.getPageData(pageId);
        },

        getPagesData: function(){
            return this._activeViewer_.getPagesData();
        },

        getPages: function (viewerName) {
            var viewer = viewerName ? this._loadedViewers[viewerName] : this._activeViewer_;
            return viewer.getPages();
        },

        getLinkablePagesData: function () {
            return this._activeViewer_.getLinkablePagesData();
        },

        updatePagesData: function() {
            return this._activeViewer_.updatePagesData();
        },

        getNewUniquePageId: function(name) {
            return this._activeViewer_.getNewUniquePageId(name);
        },

        goToHomePage: function() {
            return this._activeViewer_.goToHomePage();
        },
        isHomePage: function(pageId) {
            pageId = pageId || this.getCurrentPageId();
            return this._activeViewer_.isHomePage(pageId);
        },

        getCurrentPageNode: function() {
            //we always want the current page from the page group, unless it's first site load, when it isn't available;
            return this.getPageGroup().getCurrentPageNode() || this.getCompByID(this.getCurrentPageId());
        },

        getMasterComponents: function(viewerMode){
            if (viewerMode in this._loadedViewers){
                return this._loadedViewers[viewerMode].getMasterComponents();
            }
            return this._activeViewer_.getMasterComponents();
        },

        getPageComponents: function(pageId, viewerMode){
            if (viewerMode in this._loadedViewers){
                return this._loadedViewers[viewerMode].getPageComponents(pageId);
            }
            return this._activeViewer_.getPageComponents(pageId);
        },

        loadPageById: function(pageId, pageNode, callback, scope){
            return this._activeViewer_.getPageManager().loadPageById(pageId, pageNode, callback, scope);
        },

        isPageLoaded: function(pageId){
            return this._activeViewer_.getPageManager().isPageLoaded(pageId);
        },

        isStaticHtmlCleared: function() {
            return this._activeViewer_ && this._activeViewer_.isStaticHtmlCleared();
        },

        //HANDLER
        isSiteReady: function() {
            return this._activeViewer_ && this._activeViewer_.isSiteReady();
        },

        getSiteHeight: function () {
            return this._activeViewer_.getSiteHeight();
        },

        siteHeightChanged: function (dontNotifySiteStructure) {
            return this._activeViewer_.siteHeightChanged(dontNotifySiteStructure);
        },

        getDocWidth: function() {
            return this._activeViewer_? this._activeViewer_.getDocWidth() : 0;
        },
        /**
         * @returns {Node}
         */
        getSiteNode: function(viewerMode) {
            return viewerMode ? this._loadedViewers[viewerMode].getSiteNode() : this._activeViewer_.getSiteNode();
        },

        initScreenResizeEventPropagation: function () {
            return this._activeViewer_.initScreenResizeEventPropagation();
        },

        /**
         *
         * @param id
         * @param viewerMode
         * @returns {Node}
         */
        getCompByID: function(id, viewerMode){
            if (viewerMode in this._loadedViewers){
                return this._loadedViewers[viewerMode].getCompByID(id);
            }
            return this._activeViewer_.getCompByID(id);
        },
        getAllCompsWithID: function(id, viewerMode){
            if (viewerMode in this._loadedViewers){
                return this._loadedViewers[viewerMode].getAllCompsWithID(id);
            }
            return this._activeViewer_.getAllCompsWithID(id);
        },

        getElementBySelector: function(selector){
            var siteNode = this.getSiteNode();
            return siteNode.getElement(selector) || null;
        },

        getCompLogicBySelector: function(selector){
            var element = this.getElementBySelector(selector);
            return (element && element.$logic) ? element.$logic : null;
        },

        getCompLogicById: function(id, viewerMode){
            var compNode = this.getCompByID(id, viewerMode);
            return (compNode && compNode.$logic) ? compNode.$logic : null;
        },

        getPageGroup: function () {
            return this.getPageGroupElement().getLogic();
        },
        getPageGroupElement: function () {
            return this._activeViewer_.getCompByID('SITE_PAGES');
        },
        getPagesContainer: function(){
            return this._activeViewer_.getCompByIDAddPrefix('PAGES_CONTAINER');
        },
        getFooterContainer: function(){
            return this._activeViewer_.getCompByIDAddPrefix('SITE_FOOTER');
        },
        getHeaderContainer: function(){
            return this._activeViewer_.getCompByIDAddPrefix('SITE_HEADER');
        },
        getCurrentPrefix: function(){
            return this._activeViewer_.getPrefix();
        }

    });

});