define.Class('wysiwyg.viewer.managers.PageManager', function(classDefinition){

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;


    def.inherits('bootstrap.managers.BaseManager');

    def.resources(['W.Utils']);

    def.binds(['_createMasterPage', '_onLoadSiteSuccess', '_onLoadSiteFailed', '_saveSiteNode', '_markPageAsLoaded', '_savePageNodes', '_handleFailedComps', '_addFailedComps']);

    def.utilize([
        'wysiwyg.viewer.managers.pages.PageHandler',
        'wysiwyg.viewer.managers.pages.MasterPageHandler',
        'wysiwyg.viewer.managers.pages.LazyPageLoader',
        'wysiwyg.viewer.managers.pages.PageDeadCompsHandler'
    ]);

    def.statics({
        'EVENTS':{
            'SITE_LOADED':'siteLoaded'
        },
        pageStatus: {
            NONE: 0,
            LOADING: 1,
            LOADED: 2
        }
    });

    /**
     * @constructs
     */
    def.methods({

        isReady: function(){
            return true;
        },

        clone: function(){
            return new this.$class();
        },


        initialize: function(viewerName, dataResolver){
            this._viewerName = viewerName;
            this._dataResolver = dataResolver;
            this._loadSitePromise = null;
            this._siteNode = null;
            this._loadedPages = {};
            this._pageNodes = {};
            this._firstPageId = null;
            this._failedComps = [];
        },

        /**
         *
         * @param shouldWixifyAllPages
         * @returns {null|*|_loadSitePromise}
         */
        loadSite: function(shouldWixifyAllPages){
            this._initFirstPageInfo();
            var self = this;

            if(!this._loadSitePromise) {
                this._loadSitePromise = this._createMasterPage()
                    .then(this._saveSiteNode)
                    .then(this._savePageNodes)
                    .then(function(nodes) {
                        if(shouldWixifyAllPages){
                            return self._loadAllPages(nodes);
                        } else{
                            return self._loadMasterAndFirstPage(nodes);
                        }
                    })
                    .then(this._handleFailedComps)
                    .then(this._onLoadSiteSuccess)
                    .fail(this._onLoadSiteFailed);
            }
            return this._loadSitePromise;
        },

        _initFirstPageInfo: function(){
            this._firstPageId = this._getFirstPageId();
            this._startLoadingFirstPageData(this._firstPageId);
        },

        /**
         *
         * @returns {*|_dataResolver}
         */
        getDataResolver: function(){
            return this._dataResolver;
        },

        getLoadedPageIds: function() {
            return _.keys(this._loadedPages);
        },

        _createMasterPage: function(){

            var masterPageHandler = new this.imports.MasterPageHandler(this._dataResolver, this._viewerName);

            this._propagateEvents(masterPageHandler);

            var nodesPromise = masterPageHandler.loadMasterSignatureHtml();

            this._masterPageHandler = masterPageHandler;

            return nodesPromise;
        },

        _propagateEvents: function(masterPageHandler){
            masterPageHandler.on('siteNodeCreated',this, function(eventInfo){
                this.fireEvent('siteNodeCreated', eventInfo.data.siteNode);
            });
        },

        _saveSiteNode: function(nodes){

            this._siteNode = nodes.rootCompNode;

            // this._pageWidth = nodes.pagesContainerNode.$logic.getWidth();
            this._pageWidth = W.Viewer.getDocWidth();

            return nodes;
        },

        _savePageNodes: function(nodes){
            var pagesIds = this._dataResolver.getPagesIds();
            var pageNodes = nodes.pageNodes;
            var self = this;
            _.forEach(pagesIds, function(pageId){
                self._pageNodes[pageId] = pageNodes[pageId];
            });
            return nodes;
        },

        _loadMasterAndFirstPage: function(nodes){
            var pageNodes = nodes.pageNodes;
            var promises = [];

            promises.push(this._getLoadMasterPromise(nodes));

            promises.push(this.loadPage(this._firstPageId, pageNodes[this._firstPageId], true));
            return Q.all(promises);
        },

        /**
         *
         * @param nodes
         * @returns {*}
         * @private
         */
        _loadAllPages: function(nodes){
            var pageNodes = nodes.pageNodes;
            var pagesIds = this._dataResolver.getPagesIds();
            var promises = [];

            promises.push(this._getLoadMasterPromise(nodes));

            _.forEach(pagesIds, function(pageId){
                promises.push(this.loadPage(pageId, pageNodes[pageId], pageId === this._firstPageId));
            }, this);

            return Q.all(promises);
        },

        _getLoadMasterPromise: function(nodes){
            var masterPromise = this._masterPageHandler.wixifyMasterPage(nodes);
            masterPromise.then(this._addFailedComps);
            return masterPromise;
        },

        /**
         *
         * @param pageId
         * @param pageNode
         * @param waitForRender
         * @returns {*}
         */
        loadPage: function(pageId, pageNode, waitForRender){
            if(this._loadedPages[pageId]){
                return;
            }
            this._loadedPages[pageId] = this.pageStatus.LOADING;
            var pageHandler = new this.imports.PageHandler(pageId, pageNode, this._dataResolver, this._viewerName, this._pageWidth, waitForRender);

            var promise = pageHandler.loadPage();

            promise.then(this._markPageAsLoaded);

            return promise;
        },

        /**
         *
         * @param pageId
         * @param pageNode
         */
        addLoadedPage: function(pageId, pageNode){
            this._markPageAsLoaded({
                'pageId': pageId,
                'pageNode': pageNode
            });
        },

        /**
         *
         * @param pageId
         */
        removePage: function(pageId){
            delete this._loadedPages[pageId];
            delete this._pageNodes[pageId];
        },

        getLoadedPages: function() {
            return this._loadedPages;
        },

        _markPageAsLoaded: function(pageInfo){
            var pageId = pageInfo.pageId;
            this._loadedPages[pageId] = this.pageStatus.LOADED;
            this._pageNodes[pageId] = pageInfo.pageNode;
            this._addFailedComps(pageInfo);
        },

        _handleFailedComps: function(){
            if(this._failedComps.length){
                var handler = new this.imports.PageDeadCompsHandler();
                return handler.handleDeadComps(this._failedComps);
            }
            return true;
        },

        /**
         *
         * @returns {{}|*}
         */
        getPageNodes: function(){
            return this._pageNodes;
        },

        _addFailedComps: function(pageInfo){
            this._failedComps = this._failedComps.concat(pageInfo.failed);
//            this._timedOutComps = this._timedOutComps.concat(pageInfo.timedOut);
        },

        _onLoadSiteFailed: function(err){
            var errorMessage = err.stack ? err.stack : err;
            console.log("Failed to load site", errorMessage );
            LOG.reportError(wixErrors.PM_SITE_LOAD_FAILED,"PageManager","_onLoadSiteFailed",  errorMessage );
            throw err;
        },

        _onLoadSiteSuccess: function(){
            this.fireEvent(this.EVENTS.SITE_LOADED, this._siteNode);
            this._startPageLazyLoading();
        },

        _startPageLazyLoading: function(){
            if(!this._dataResolver.isAllPagesDataLoaded()) {

                this._lazyPageLoader = this._createLazyPageLoader();

                this._lazyPageLoader.start();
            }
        },

        _createLazyPageLoader:function(){
            return new this.imports.LazyPageLoader(this._dataResolver);
        },

        /**
         *
         * @param pageId
         * @param pageNode
         * @param callback
         * @param scope
         */
        loadPageById: function(pageId, pageNode, callback, scope){
            callback = callback || _.noop;
            var promise = this.loadPage(pageId, pageNode);
            if(promise){
                promise.then(callback.bind(scope)).done();
                return promise;
            } else{
                var result = {
                    'pageId': pageId,
                    'pageNode': this._pageNodes[pageId]
                };

                callback.call(scope, result);

                return Q(result);
            }
        },

        /**
         *
         * @returns {null|*|_loadSitePromise}
         */
        isPageLoadingCompleted: function(){
            return this._loadSitePromise && this._loadSitePromise.isFulfilled();
        },

        /**
         *
         * @param pageId
         * @returns {boolean}
         */
        isPageLoaded: function(pageId){
            return this._loadedPages[pageId] === this.pageStatus.LOADED;
        },

        _getFirstPageId: function(){
            var mainPageId = this._dataResolver.getMainPageId();
            var currentPageId = W.Viewer.getCurrentPageId();
            var pageIdFromHash = this._getPageIdFromHash();
            var pageToLoadFallbackOrder = [];

            if (W.Config.env.isPublicViewer()) {
                pageToLoadFallbackOrder = [pageIdFromHash, mainPageId];
            }
            else {//editor mode
                if (W.Config.env.isViewingDesktopDevice()) {
                    pageToLoadFallbackOrder = [mainPageId];
                }
                else { //editor mobile mode
                    pageToLoadFallbackOrder = [currentPageId, mainPageId];
                }
            }

            return this._getPageIdToLoad(pageToLoadFallbackOrder);
        },

        _getPageIdFromHash: function() {
            var hashParts = this.resources.W.Utils.hash.getHashParts();
            return (hashParts.id === 'zoom') ? hashParts.extData.match("([^/]+)/([^/]+)")[1] : hashParts.id;
        },

        _getPageIdToLoad: function(pageToLoadFallbackOrder) {
            var pagesIds = this._dataResolver.getPagesIds();
            var pageIdToLoad = _.find(pageToLoadFallbackOrder, function(pageId) {
                return (!!pageId && _.contains(pagesIds, pageId));
            });

            return pageIdToLoad || _.first(pagesIds);
        },

        _startLoadingFirstPageData: function(pageIdToLoad){
            //load first the master page then the main page
            this._dataResolver.getPageData('master');
            this._dataResolver.getPageData(pageIdToLoad);
        }

    });
});
