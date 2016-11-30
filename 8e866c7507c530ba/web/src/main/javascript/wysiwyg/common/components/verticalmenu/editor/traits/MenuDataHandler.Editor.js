define.Class('wysiwyg.common.components.verticalmenu.editor.traits.MenuDataHandler', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.common.components.verticalmenu.viewer.traits.MenuDataHandler');

    def.methods({
        /**
         * Invoked by DataChange event on this._menuDataItem
         * @private
         */
        _onMainMenuDataChange: function() {
            this._updateMenuData();

            //call later to prevent ugly jumps
            this.resources.W.Utils.callLater(function() {
                this.buildItemList();
                this._setItemsHeight(true);
            }, [], this);
        },

        _updateMenuData: function() {
            this._menuDataNP = this._createMenuNonPersistentData(this._mainMenuData);
        },

        /**
         * @override BasicMenuDataHandler (Editor part) abstract function
         * @param dataInfo
         * @private
         */
        _handlePageDataChange: function(dataInfo) {
            var pageDataItem = dataInfo.data.dataItem;
            var field = dataInfo.data.field;

            if (field === 'hidePage') {
                //call later to prevent ugly jumps
                //Data is already updated in the page data item which is referenced by menu data item
                this.resources.W.Utils.callLater(function() {
                    this.buildItemList();
                    this._setItemsHeight(true);
                }, [], this);

                return;
            }

            if (field !== 'title') {  //Only field we need to react to change
                return;
            }

            var newValue = pageDataItem.get(field);
            var menuDataItemsToUpdate = this._getMenuItemsOfChangedPage(pageDataItem.get('id'), this._menuDataNP.get('items'));
            var viewNodesToUpdate = [];

            //Get all the view nodes that correspond to the menuDataItems that needs an update
            _.forEach(menuDataItemsToUpdate, function (menuDataItem) {
                var viewNodes = this._getViewNodesByLinkId(menuDataItem.get('link'));
                viewNodesToUpdate.push.apply(viewNodesToUpdate, viewNodes);
            }, this);

            //Update the menu data items
            _.forEach(menuDataItemsToUpdate, function (menuDataItem) {
                menuDataItem.set('label', newValue);
            });

            //Update the view nodes
            _.forEach(viewNodesToUpdate, function (buttonViewNode) {
                if (!pageDataItem.get('hidePage')) {
                    this._handleButtonLabelChange(newValue, buttonViewNode);
                }
            }, this);
        },

        /**
         * Sets the given label (string) on the given view node
         * @param label
         * @param viewNode
         * @private
         */
        _handleButtonLabelChange: function(label, viewNode) {
            var labelElement = this.getLabelElement(viewNode);
            labelElement.set('text', label);
        },

        /**
         * Helper function: Returns all the menu data item associated (has a link) with the changed page
         * @param changedPageId
         * @param menuDataItems
         * @returns {Array}
         * @private
         */
        _getMenuItemsOfChangedPage :function (changedPageId, menuDataItems) {
            var changedMenuDataItems = [];

            _.forEach(menuDataItems, function (menuDataItem) {
                var linkRef = menuDataItem.get('link');
                var linkDataItem = this.resources.W.Data.getDataByQuery(linkRef);
                if(!linkDataItem || !(linkDataItem.getType() === 'PageLink')) {
                    return false;  //Not a link to page
                }

                var pageId = linkDataItem.get('pageId').substr(1);
                if(pageId === changedPageId) {
                    changedMenuDataItems.push(menuDataItem);
                }

                var subItems = menuDataItem.get('items');
                if(subItems && subItems.length) {
                    changedMenuDataItems.push.apply(changedMenuDataItems, this._getMenuItemsOfChangedPage(changedPageId, subItems));
                }
            }, this);

            return changedMenuDataItems;
        }
    });
});