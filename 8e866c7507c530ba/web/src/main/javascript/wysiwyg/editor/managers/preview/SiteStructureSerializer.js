/** @class wysiwyg.editor.managers.preview.SiteStructureSerializer */
define.Class('wysiwyg.editor.managers.preview.SiteStructureSerializer', function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.utilize([
        'wysiwyg.editor.managers.WComponentSerializer'
    ]);

    /** @lends wysiwyg.editor.managers.preview.SiteStructureSerializer */
    def.methods({
        initialize: function(viewerName, preview){
            this._viewerName = viewerName;
            var idPrefix = Constants.ViewerTypesParams.DOM_ID_PREFIX[viewerName];
            this._compSerializer = new this.imports.WComponentSerializer(idPrefix);
            this._previewManager = preview;
        },

        _getSerializedStructure: function(){
            var structure = {
                'masterPage': this.serializeMasterPage(),
                'pages': this.serializePages()
            };
            return structure.masterPage && structure.pages ? structure : null;
        },

        serializeMasterPage: function () {
            var siteView = this._getSiteView();
            if(!siteView){
                return null;
            }
            var htmlStructure = siteView.getSiteNode();
            var components = this._compSerializer.serializeComponents(
                htmlStructure.getChildren("[comp]"),
                undefined,
                function (node) {
                    return  W.Editor.isPageComponent(node.get('comp'));
                }
            );
            return {
                "type": "Document",
                "children": components
            };
        },

        serializePages: function(){
            var filteredPageMap, siteView = this._getSiteView();
            if(!siteView){
                return null;
            }
            filteredPageMap = this._getFilteredPageMap(siteView);
            return  _.transform(filteredPageMap, function(result, page){
                var serPage = this._compSerializer.serializeComponent(page);
                result[serPage.id] = serPage;
            }, undefined, this);
        },

        _getFilteredPageMap: function(siteView) {
            var pagesNodes = siteView.getPages();
            var filteredPageArr = _.filter(pagesNodes, this._filterPage, this);
            return this._createMapFromFilteredPageArr(filteredPageArr);
        },

        _filterPage: function(pageNode) {
            return this._isPageWixified(pageNode) &&
                this._isValidPage.apply(this._compSerializer, [pageNode]);
        },

        _isPageWixified: function(pageNode) {
            return !!pageNode.$logic;
        },

        _createMapFromFilteredPageArr: function(filteredPageArr) {
            var filteredPageIds = _.map(filteredPageArr, function (pageNode) {
                return pageNode.get('id');
            });
            return _.zipObject(filteredPageIds, filteredPageArr);
        },

        serializePage: function (pageId) {
            var siteView = this._getSiteView();
            if(!siteView){
                return null;
            }

            var pagesNodes = siteView.getPages();
            return this._compSerializer.serializeComponent(pagesNodes[pageId]);
        },

        _getSiteView: function(){
            return this._previewManager.getPreviewManagers().Viewer.getSiteView(this._viewerName);
        },

        /**
         * reports an error by the dom comp id, so that we can know that it's
         * this - WComponentSerializer
         * @param page
         * @returns {Boolean} whether has view and logic
         * @private
         */
        _isValidPage: function(page){
            return this._validateComponent(page, "WSiteSerializer", "serializePages");
        }
    });
});
