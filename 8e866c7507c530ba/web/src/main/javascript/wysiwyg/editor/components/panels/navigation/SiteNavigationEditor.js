define.component('wysiwyg.editor.components.panels.navigation.SiteNavigationEditor', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');
    def.resources(['W.Commands','W.Preview']);
    def.binds(['_handleMenuData', '_onSitePageChanged', '_reorderPagesData']);
    def.skinParts({
        treeEditor: { type: 'wysiwyg.editor.components.panels.navigation.TreeStructureEditor'}
    });
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.TreeItemMoveComplete', this, this._reorderPagesData);
        },

        _onAllSkinPartsReady: function () {
            this._treeEditor = this._skinParts.treeEditor;

            this.injects().Editor.addEvent(Constants.EditorEvents.SITE_PAGE_CHANGED, this._onSitePageChanged);
        },

        initMenu: function () {
            this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery('#MAIN_MENU', this._handleMenuData);
        },

        //The area in which the pages tree can scroll
        setScrollArea: function (scrollArea) {
            this._treeEditor.setScrollContainer(scrollArea);
        },

        //creates the tree according to the menu data
        _handleMenuData: function (mainMenuData) {
            this.setDataItem(mainMenuData);
            this._treeEditor.setDataItem(this._data);
            this._data.addEvent(Constants.DataEvents.DATA_CHANGED, this._treeEditor.updatePanel);
            var items = mainMenuData.getItems();
            this._treeEditor.setSingleItemComponentType('wysiwyg.editor.components.SiteNavigationButton', 'wysiwyg.editor.skins.WSiteMenuItemSkin');
            this._treeEditor.createTreeItemsFromDataItems(items, 0);
        },

        //on navigation the corresponding button needs to be selected
        _onSitePageChanged: function (pageId) {
            var treeButtons = this._treeEditor.getTreeButtons();
            for (var i = 0; i < treeButtons.length; i++) {
                var item = treeButtons[i];
                var itemPageId = (item._refId.indexOf('#') === 0) ? item._refId.substr(1) : item._refId;
                if (pageId === itemPageId) {
                    treeButtons[i].setState('selected');
                } else {
                    treeButtons[i].setState('up');
                }
            }
        },

        //reorder the data according to the new tree order
        _reorderPagesData: function (params) {
            var parentData = params.parentData;
            var itemIndex = params.index;
            var itemToMove = params.sourceItem;
            // var isSubItem = params.isSubItem;
            var itemData = itemToMove.getDataItem();
            this._data.moveItemToParentAtIndex(itemData, parentData, itemIndex);

            //keep updating site structure for old menu purposes
            this._reorderSiteStructureData(itemToMove);
        },

        //reorders the site structure data according to the new menu data arrangement
        _reorderSiteStructureData: function (itemToMove) {
            var allItems = this._data.getAllItems();
            var siteStructureData = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery('#SITE_STRUCTURE');
            var oldPages = siteStructureData.get('pages');
            var newPages = [];
            for (var i = 0; i < allItems.length; i++) {
                newPages.push(allItems[i].get('refId'));
            }

            var currentPageId = itemToMove.getDataItem().get('refId');
            var newIndex = newPages.indexOf(currentPageId);
            var oldIndex = oldPages.indexOf(currentPageId);

            if (newIndex == oldIndex) {
                return;
            }

            siteStructureData.set('pages', newPages);

            // This is so stupid I'm about to barf. but in order for the site to be correctly saved
            // We must reorder the actual HTML nodes
            var preview = this.resources.W.Preview;
            var site = this.resources.W.Preview.getPreviewSite();
            var pageNode = preview.getCompByID(this._getPageIdByDataQuery(newPages[newIndex])).dispose();

            if (newIndex < newPages.length - 1) {
                var nextPageNode = preview.getCompByID(this._getPageIdByDataQuery(newPages[newIndex + 1]));
                pageNode.insertInto(nextPageNode, 'before', Constants.DisplayEvents.MOVED_IN_DOM);
            } else {
                var prevPageNode = preview.getCompByID(this._getPageIdByDataQuery(newPages[newIndex - 1]));
                pageNode.insertInto(prevPageNode, 'after', Constants.DisplayEvents.MOVED_IN_DOM);
            }

            this.injects().Utils.callOnNextRender(function () {
                this.resources.W.Preview.getPreviewManagers().Viewer.indexPages();
            }.bind(this));

            this.resources.W.Preview.getPreviewManagers().Viewer.indexPages();
        },

        /**
         * removes the data query # in order to get the page id.
         * this should be refactored in order to decouple page id's and data..
         * @private
         */
        _getPageIdByDataQuery: function(dataQuery) {
            return dataQuery.substr(1);
        }
    });
});
