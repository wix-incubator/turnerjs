define.Class('wysiwyg.common.components.basicmenu.editor.traits.BasicMenuDataHandler', function(classDefinition) {
    /**type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('wysiwyg.common.components.basicmenu.viewer.traits.BasicMenuDataHandler');

    def.binds(['_onMainMenuDataChange']);

    def.methods({

        initialize: function() {
            this._menuDataNP = null;
            this._mainMenuData = null;
        },

        _createMenuNonPersistentData: function(mainMenuData) {
            var menuDataObject = this._createNonPersistentRawData(mainMenuData);
            var nonPersistentDataItem = this.resources.W.Data.createDataItem(menuDataObject);
            nonPersistentDataItem.setMeta('isPersistent', false);
            mainMenuData.addEvent(Constants.DataEvents.DATA_CHANGED, this._onMainMenuDataChange);//was new event (on), but reverted to old addEvent due to a bug that caused the handler not to be fired. to be discussed with Alissa
            return nonPersistentDataItem;
        },

        _onMainMenuDataChange: function() {
            this._menuDataNP = this._createMenuNonPersistentData(this._mainMenuData);
        },

        _removePagesEventListeners: function() {
            var menuItems = this._menuContainer.getElements('li');

            _.forEach(menuItems, function(item) {
                var linkId = item.get('linkId'),
                    pageData = this._getPageDataByLinkId(linkId);

                if (pageData) {
                    pageData.off(Constants.DataEvents.DATA_CHANGED, this, this._handlePageDataChange);
                }
            }, this);
        },

        _removeHiddenPagesEventListeners: function() {
            _(this.resources.W.Viewer.getPagesData())
                .filter(function(pageData) {return !!pageData.get('hidePage');}, this)
                .forEach(function(pageData) {
                    pageData.off(Constants.DataEvents.DATA_CHANGED, this, this._handlePageDataChange);
                }, this);
        },

        _addPagesEventListeners: function() {
            var menuItems = this._menuContainer.getElements('li');

            _.forEach(menuItems, function(item) {
                var linkId = item.get('linkId'),
                    pageData = this._getPageDataByLinkId(linkId);

                if (pageData) {
                    pageData.on(Constants.DataEvents.DATA_CHANGED, this, this._handlePageDataChange);
                }
            }, this);
        },

        _addHiddenPagesEventListeners: function() {
            _(this._getPagesData())
                .filter(function(pageData) {return !!pageData.get('hidePage');}, this)
                .forEach(function(pageData) {pageData.on(Constants.DataEvents.DATA_CHANGED, this, this._handlePageDataChange);}, this);
        },

        /**
         * This method tries to get the pages data from the Viewer.
         * If the pages data isn't available yet from the Viewer,
         * get it directly from the Data
         * @returns {Array} pages data
         * @private
         */
        _getPagesData: function() {
            var pagesData = this.resources.W.Viewer.getPagesData();

            if (pagesData) {
                return pagesData;
            }

            pagesData = [];

            // Go over the stored menu items, and get the page data from each of them
            _.forEach(this._menuDataNP.get('items'), function(basicMenuDataItem) {
                var linkId = basicMenuDataItem.get('link'),
                    pageData = this._getPageDataByLinkId(linkId);

                if (pageData) {
                   pagesData.push(pageData);
                }
            }.bind(this));

            return pagesData;
        },

        _getPageDataByLinkId: function(linkId) {
            var pageData,
                linkItem;

            if (linkId && linkId !=='undefined') {
                linkItem = this.resources.W.Data.getDataByQuery(linkId);
                if (!linkItem) {
                    return;
                }
                pageData = this.resources.W.Data.getDataByQuery(linkItem.get('pageId'));
                if (pageData) {
                    return pageData;
                }
            }
        },

        /*Should be implemented*/
        _handlePageDataChange: function() {}

    });
});
