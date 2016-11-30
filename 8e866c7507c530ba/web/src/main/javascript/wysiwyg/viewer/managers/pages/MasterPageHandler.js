define.Class('wysiwyg.viewer.managers.pages.MasterPageHandler', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.viewer.managers.pages.PageHandler');

    def.utilize([
        'wysiwyg.viewer.managers.pages.SiteStructureDomBuilder',
        'wysiwyg.viewer.managers.pages.StubPageDomBuilder'
    ]);

    def.resources(['W.Data', 'W.Config']);

    def.binds(['_getPageData', '_createPagesStubs','_attachPage', '_addWixAdsNode', '_fireSiteNodeCreated']);

    /**
     * @constructs
     */
    def.methods(/** @lends {wysiwyg.viewer.managers.pages.MasterPageHandler} **/{
        /**
         * @param dataResolver
         * @param viewerName
         */
        initialize: function (dataResolver, viewerName) {
            this.parent('master', null, dataResolver, viewerName);
            var prefix = Constants.ViewerTypesParams.DOM_ID_PREFIX[viewerName];
            var compDomBuilder = new this.imports.ComponentDomBuilder(prefix);
            /**@type wysiwyg.viewer.managers.pages.SiteStructureDomBuilder*/
            this._structureDomBuilder = new this.imports.SiteStructureDomBuilder(prefix, compDomBuilder);
            /**@type wysiwyg.viewer.managers.pages.StubPageDomBuilder*/
            this._pageStubDomBuilder = new this.imports.StubPageDomBuilder(prefix);

            this._compDomBuilder = this._structureDomBuilder;
        },

        /**
         *
         * @returns {*}
         */
        loadMasterSignatureHtml: function(){
            this._rootNode = $(this._structureDomBuilder.getStructureDomId()); //why is this here??

            return this._getPageData()
                .then(this._addComponentStuffToManagers)
                .then(this._createPageStructure)
                .then(this._writePageIdOnComponentNodes)
                .then(this._fireSiteNodeCreated)
                .then(this._createPagesStubs)
                .then(this._attachPage)
                .then(this._addWixAdsNode, this._onFailBeforeWixify);
        },

        /**
         *
         * @param nodes
         * @returns {*}
         */
        wixifyMasterPage: function(nodes){
            return this._wixifyPage(nodes)
                .then(this._getSuccessInfo)
                .fail(this._onFailToRenderPage);
        },

        loadPage : function(){
            throw new Error("this method isn't implemented. user loadMasterSignatureHtml and wixifyMasterPage instead");
        },

        _getPageData :function() {
            return this._dataResolver.getMasterPageData();
        },

        _createPagesStubs:function(nodes){
            var siteNode = nodes.rootCompNode;
            var sitePages = this._getPagesContainerNode(siteNode);

            var pageIds = this._dataResolver.getPagesIds();

            var pageNodes = _.reduce(pageIds, function(result, pageId){
                result[pageId] = this._createStubPage(sitePages, pageId);
                return result;
            }, {}, this);

            return {
                'rootCompNode': siteNode,
                'pageNodes': pageNodes,
                'compNodes': nodes.compNodes,
                'pagesContainerNode': sitePages
            };
        },

        _getPagesContainerNode: function(siteNode){
            return siteNode.querySelector('#' + this._structureDomBuilder.getPagesContainerDomId());
        },

        _createStubPage:function (sitePages, pageId) {
            var pageData = this.resources.W.Data.getDataByQuery('#' + pageId);
            var pageNode = this._pageStubDomBuilder.createPageStubNode(pageId, pageData, sitePages.$domLevel + 1);
            sitePages.appendChild(pageNode);
            return pageNode;
        },

        _addStructureIdToPageData: function(pageData){
            //we clone the structure here (shallow clone) because we don't want to change what we got from the server
            var clPageData = _.clone(pageData);
            clPageData.structure = _.clone(pageData.structure);
            clPageData.structure.id = this._structureDomBuilder.STRUCTURE_COMP_ID;
            return clPageData;
        },

        _fireSiteNodeCreated: function(nodes){
            this.trigger('siteNodeCreated', {'siteNode': nodes.rootCompNode});
            return nodes;
        },

        _addWixAdsNode: function(nodes){
            if(window.adData){
                var wixAds = document.getElementById('wixFooter');
                var nodeData = W.Viewer.getNodeAdData();

                if (!wixAds && nodeData){
                    wixAds = document.createElement('div');

                    _.forOwn(nodeData, function(value, key){
                        wixAds.setAttribute(key, value);
                    });
                    document.body.appendChild(wixAds);
                }

                if(wixAds && !wixAds.$logic){
                    //the $ is for mootools events uid
                    nodes.compNodes.push($(wixAds));
                }
            }
            return nodes;
        },

        _attachPage: function (siteNodes) {
            var pivotNode       = this._getSiteStructureReferenceNode();
            var siteParent      = pivotNode.parentElement || document.body;
            var siteStructure   = siteNodes.rootCompNode || siteNodes ;

            this._insertAfter(siteStructure, siteParent, pivotNode);

            if (this.resources.W.Config.isLoadedFromStatic()){
                this._attachPageFarAwayIfNeeded(siteStructure);
            }
            return siteNodes ;
        },

        _getSiteStructureReferenceNode: function() {
            var siteStructuresNode = $("bgNodes") ;
            if(!siteStructuresNode) {
                siteStructuresNode = new Element("div", {'id':'bgNodes', 'style': 'position:relative; margin: 0 auto;'}) ;
                var siteNode = this._getSiteNode() ;
                siteNode.insertBefore(siteStructuresNode, siteNode.firstChild) ;
            }
            return siteStructuresNode ;
        },

        _insertAfter: function (nodeToInsert, parentNode, referenceNode) {
            parentNode.insertBefore(nodeToInsert, referenceNode.nextSibling);
        },

        _attachPageFarAwayIfNeeded: function(siteNode){
            var id = Constants.ViewerTypesParams.DOM_ID_STATIC_PREFIX + siteNode.getAttribute('id');
            //in case there's a static html parent node there
            if (document.getElementById(id)){
                siteNode.addClass('farAwayNode');
            } else {
                LOG.reportError(wixErrors.STATIC_HTML_REPLACEMENT_FAILURE, this.className, '_attachPageFarAwayIfNeeded', id);
            }
        },

        _getChildrenPropertyName: function(){
            return this._dataResolver.getMasterChildrenPropertyName(this._viewerName);
        },

        _getNodeWixifyFinishedEvent: function(){
            return Constants.ComponentEvents.READY;
        },

        _getSiteNode:function(){
            return document.body;
        }
    });
});
