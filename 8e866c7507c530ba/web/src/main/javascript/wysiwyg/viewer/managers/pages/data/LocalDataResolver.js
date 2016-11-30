/** @class wysiwyg.viewer.managers.pages.data.LocalDataResolver */
define.Class('wysiwyg.viewer.managers.pages.data.LocalDataResolver', function(classDefinition){
    "use strict";
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Data', 'W.ComponentData', 'W.Theme', 'dataFixer', 'W.Commands']);

    /** @lends wysiwyg.viewer.managers.pages.data.LocalDataResolver */
    def.methods({
        initialize: function(siteData){

            this._siteData = siteData;

            this._pagesData = [];

            this._pageIds = [];

            this._pagesIdsToLoad = [];

            this._preparePageData();
        },

        _preparePageData: function(){
            this._pageIds = _.map(this._siteData.pages, function(page){
                return page.structure.id;
            });

            this._siteData.masterPage = this._fixPageData(this._siteData.masterPage, _.clone(this._pageIds));
            this._setData(this._siteData.masterPage.data);
        },

        _fixPageData: function(pageJson, pageIdsArray){
            return this.resources.dataFixer.FixPageJson(pageJson, pageIdsArray);
        },

        _setData:function (data) {
            if (!data.links_data) { return; }

            var that = this;
            this.resources.W.Data.addDataItemsForPage(data.links_data);

            //Mark all the new links data items as dirty (these links are referenced by the "fixed" data schemas)
            _.forEach(data.links_data, function (item) {
                that.resources.W.Data.markDirtyCompIdForLater(item.id);
            });

            this.resources.W.Data.addDataItemsForPage(data.document_data);
            this.resources.W.ComponentData.addDataItemsForPage(data.component_properties);
            this.resources.W.Theme.addDataItemsForPage(data.theme_data);

            return this._pageData;
        },

        /**
         * used in editor when switch to non desktop view (mobile)
         * @param viewerName
         * @param structure
         */
        setViewerStructure: function(viewerName, structure){
            this._siteData.masterPage.structure[this.getMasterChildrenPropertyName(viewerName)] = structure.masterPage.children;

            _.forEach(structure.pages, function(page){

                var pageId = page.id;

                this._pagesData[pageId].structure[this.getPageComponentsPropertyName(viewerName)] = page.components;
                this._pagesData[pageId].structure.styleId = page.styleId;

            }, this);
        },

        addPage: function(pageData){

            this._pageIds.push(pageData.id);
            this._pagesData[pageData.id] = {structure:pageData};
        },

        removePage:function(pageData){

            var id = pageData.getComponentId();

            this._pagesData[id] = null;
            delete this._pagesData[id];

            this._pageIds.splice(_.indexOf(this._pageIds, id), 1);


        },


        getPagesIds: function(){
            return this._pageIds;
        },

        isPageLoaded: function(pageId){
            return this._pagesData[pageId] !== undefined;
        },

        isAllPagesDataLoaded: function(){
            return this._pagesIdsToLoad.length === 0;
        },

        getPagesIdsToLoad: function(){
            return this._pagesIdsToLoad;
        },

        getMasterPageData: function () {
            return Q(this._siteData.masterPage);
        },

        getMainPageId: function(){
            var siteStructureData = this.resources.W.Data.getDataByQuery('#SITE_STRUCTURE');
            var homePageId = siteStructureData && siteStructureData.get('mainPage');
            return homePageId && homePageId.replace('#', '');
        },

        getPageData: function(pageId){
            return Q(this._pagesData[pageId] || this._loadPageData(pageId));
        },

        /*
         * This is a temporary solution, until server implements editor load per page, so we'll be able to use the RemoteDataResolver logic.
         * */
        _loadPageData: function(pageId) {
            var page = _.find(this._siteData.pages, function(pageObj) {
                return pageObj.structure.id === pageId;
            });
            if (!page) {
                return null;
            }
            page = this._fixPageData(page);
            this._pagesData[pageId] = page;
            this._setData(page.data);
            return page;
        },

        getSerializedPageStructureSync: function(viewerName, pageId) {
            var loadedPageData = this._loadPageData(pageId);
            if (!loadedPageData) {
                return null;
            }
            var pageStructure = loadedPageData.structure;
            return this._getPageStructureForSingleView(pageStructure, viewerName, this.getPageComponentsPropertyName.bind(this));
        },

        getDataById:function(id){
            return this._pagesData[id];
        },

        getPageComponentsPropertyName: function(viewerName){
            var prefix = Constants.ViewerTypesParams.SERVER_JSON_PREFIX[viewerName];
            return prefix && prefix.length > 0 ? prefix + "Components" : "components";
        },

        getMasterChildrenPropertyName: function(viewerName){
            var prefix = Constants.ViewerTypesParams.SERVER_JSON_PREFIX[viewerName];
            return prefix && prefix.length > 0 ? prefix + "Components" : "children";
        },

        isStructureExists: function(viewerName){
            var childrenProperty = this.getMasterChildrenPropertyName(viewerName);
            return this.getMasterPageData().then(function(masterData){
                return masterData.structure[childrenProperty] && !_.isEmpty(masterData.structure[childrenProperty]);
            });
        },

        getSerializedStructureFromServer: function(viewerName) {
            var pages = this._getPagesStructuresForSingleView(viewerName);
            var master = this._getMasterStructureForSingleView(viewerName);
            return this._buildStructureObject(master, pages);
        },

        _buildStructureObject: function(masterPage, pages) {
            var validStructure = pages && masterPage && !_.isEmpty(masterPage.children);

            var structure = null;
            if(validStructure){
                structure = {
                    'pages': pages,
                    'masterPage': masterPage
                };
            }

            return structure;
        },

        _getSerializedStructureForSingleView_: function(viewerName){
            var pages = this._getHomePageStructureForSingleView(viewerName);
            var master = this._getMasterStructureForSingleView(viewerName);
            return this._buildStructureObject(master, pages);
        },

        _getHomePageStructureForSingleView: function(viewerName){
            var pagesStructure = {};
            var foundAnyPages = false;
            var homePageId = this.getMainPageId();
            var homePage = (this._pagesData[homePageId] && this._pagesData[homePageId].structure) || null;

            if(homePage && homePage[this.getPageComponentsPropertyName(viewerName)]){
                foundAnyPages = true;
                pagesStructure[homePageId] = this._getPageStructureForSingleView(homePage, viewerName, this.getPageComponentsPropertyName.bind(this));
            }
            else{
                pagesStructure[homePageId] = null;
            }
            return foundAnyPages ? pagesStructure : null;
        },

        _getMasterStructureForSingleView: function(viewerName){
            var master = this._siteData.masterPage.structure;
            if(master[this.getMasterChildrenPropertyName(viewerName)]){
                return this._getPageStructureForSingleView(master, viewerName, this.getMasterChildrenPropertyName.bind(this));
            }
            return null;
        },

        _getPagesStructuresForSingleView: function(viewerName){
            var pagesStructure = {};

            _.forEach(this._pageIds, function(pageId){
                pagesStructure[pageId] = this.getSerializedPageStructureSync(viewerName, pageId);
            }, this);

            return pagesStructure || null;
        },

        _getPageStructureForSingleView: function(fullPage, viewerName, componentsPropertyGetter){
            var pageStructure = _.cloneDeep(fullPage);
            pageStructure[componentsPropertyGetter('DESKTOP')]= pageStructure[componentsPropertyGetter(viewerName)];
            _.forOwn(Constants.ViewerTypesParams.SERVER_JSON_PREFIX, function(prefix, name){
                if(prefix){
                    delete pageStructure[componentsPropertyGetter(name)];
                }
            }, this);
            return pageStructure;
        }
    });
});
