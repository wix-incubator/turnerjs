define.Class('wysiwyg.viewer.managers.viewer.PageManagementTemp', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Utils', 'W.Data']);

    def.methods({

        goToHomePage: function() {
            this.changePageWithTransition(this.getHomePageId());
        },

        isHomePage: function(pageId) {
            if (this._isSiteReady) {
                return (pageId === this.getHomePageId());
            }

            return true;
        },

        getHomePageId: function(){
            if (this._mainPageData) {
                return this._mainPageData.get('id');
            }
        },

        getPageNode: function(pageId){
            var ret = null;
            if (pageId && this._siteNode) {
                ret = this.injects().Viewer.getCompByID(pageId);
            }
            return ret;
        },


        /** Function indexPages
         * Go through a node and index all of its child nodes into an object by id.
         * - pagesContainer - Container node to index
         * Returns:
         * Object map of pages by id
         */
        indexPages: function () {
            var pagesContainer = this._viewer.getPageGroupElement();

            if (!pagesContainer) {
                return this.resources.W.Utils.callLater(this.indexPages, [], this, 10);
            }

            var pages = {};
            var pagesQueries = [];
            // Collect site pages queries from html and site nodes
            this._getPageElements(pagesContainer).each(function (pageNode) {
                var pageId = pageNode.get('id') || this.resources.W.Utils.getUniqueId();
                if(this._prefix){
                    pageId = pageId.replace(this._prefix, '');
                }
                pages[pageId] = pageNode;
                pageNode.addClass('sitePage');
                var pageQuery = pageNode.get('dataQuery');
                pagesQueries.push(pageQuery);
            }.bind(this));

            pagesQueries = this._fixPagesOrderByNewMenuData(pagesQueries);

            // Save pages order
            var oldPagesIndex = this._siteStructureData.getData().pages; // ToDo: fix data manager to return defaults when no data is found!
            oldPagesIndex = oldPagesIndex || [];
            var i;
            for (i = 0; i < oldPagesIndex.length; ++i) {
                var query = oldPagesIndex[i];
                var currentIndex = pagesQueries.indexOf(query);
                if (currentIndex != -1) {
                    pagesQueries.splice(currentIndex, 1);
                    pagesQueries.splice(i, 0, query);
                }
            }

            // Add queries to SITE_STRUCTURE data item (AND don't change data changed flag)
            var dataChangeFlag = W.Data.isDataChange();
            this._siteStructureData.set('pages', pagesQueries);

            //Set mainPage to be the first page on the list
            if (this._siteStructureData.get('mainPage') === undefined || this._siteStructureData.get('mainPage') === "") {
                this._siteStructureData.set('mainPage', pagesQueries[0]);
            }

            if (dataChangeFlag) {
                W.Data.flagDataChange();
            }
            // Save nodes references
            this._pages = pages;
        },

        _getPageElements: function (pagesContainer) {
            var PageCompNameSelector = '[comp=mobile.core.components.Page],[comp=core.components.Page],[comp=wixapps.integration.components.AppPage]';
            return pagesContainer.getElements(PageCompNameSelector);
        },

        _fixPagesOrderByNewMenuData: function (currentPagesQueries) {
            if (W.Data.isDataAvailable('#MAIN_MENU')) {
                var mainMenuData = W.Data.getDataByQuery('#MAIN_MENU');
                var menuItems = mainMenuData.getAllItems();

                // refresh item list after items were deleted from main menu
                menuItems = mainMenuData.getAllItems();
                currentPagesQueries = menuItems.map(function (menuItem) {
                    return menuItem.get('refId');
                });
            }
            return currentPagesQueries;
        },



        getPageData: function (pageId) {
            return this._pagesData[pageId];
        },

        getPagesData: function(){
            return this._pagesData;
        },

        getLinkablePagesData: function () {
            return this._pagesData;
        },

        //should move to site view or die
        updatePagesData: function() {
            this._pagesData = {};
            var pages = this.getPages();
            for (var pageKey in pages) {
                var pageDataId = pages[pageKey].getAttribute('dataQuery');
                var pageData = this.resources.W.Data.getDataByQuery(pageDataId);
                this._pagesData[pageData.get('id')] = pageData;
                this._viewer._notifyPageDataLoaded(pageData);
                if (this._siteStructureData.get('mainPage') === '#' + pageData.get('id')){
                    this._mainPageData = pageData;
                }
            }
        },

        changePageWithTransition: function (nextPageId) {
            if (this._pageGroupComp) {
                this._pageGroupComp.getLogic().gotoPage(nextPageId);
//            } else{
                //throw
            }
        },


        getNewUniquePageId: function(name) {
            var id;
            var pages = this.getPages();

            do {
                id = W.Utils.getUniqueId(name + 'Page');
            }
            while (pages[id] !== undefined);

            return id;
        }
    });
});