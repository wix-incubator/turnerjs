define.Class('wysiwyg.common.components.verticalmenu.viewer.traits.MenuDataHandler', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        /**
         * Gets a dataItem and returns true of the item is visible on the menu
         * @override MenuDomBuilder abstract function
         * @param itemDataNode
         * @returns {boolean}
         */
        isItemVisible: function(itemDataNode) {
            var linkRef = itemDataNode.get('link');
            var linkData = this.resources.W.Data.getDataByQuery(linkRef);
            if(!linkData) {
                return true;
            }

            //TODO-Kaduri: One day - when items are not necessarily pages - need a switch here to check the type of the link
            //and check if it's visible or not

            var pageId = linkData.get('pageId');
            var pageData = this.resources.W.Data.getDataByQuery(pageId);
            if(!pageData) {
                return true;
            }

            return !pageData.get('hidePage');
        },

        /**
         * Invoked by MenuDomBuilder & _onSelectedPageChanged
         * @override BasicMenu abstract function
         * @returns {string} linkId for the selected item
         */
        getSelectedLinkId: function(pageId) {
            var items = (this._menuDataNP && this._menuDataNP.get('items')) || [];
            var linkItems = this._getAllMenuLinkDataItems(items);
            var currentPageLinkItem = this._getLinkDataItemOfCurrentPage(linkItems, pageId);
            return currentPageLinkItem && ('#' + currentPageLinkItem.get('id'));
        },

        /**
         * Creates and returns a new link data item (according to the given data item)
         * @override BasicMenuDataHandler implementation (only for pages)
         * @param rawDataItem
         * @returns {*}
         */
        createLinkDataItem: function(rawDataItem){
            var linkData = null;
            var dataType = rawDataItem.getType();
            dataType = (dataType) ? dataType.toLowerCase() : '';

            switch (dataType) {
                case "menuitem":  //Original menu data item
                    linkData = {
                        type: 'PageLink',
                        pageId: rawDataItem.get('refId')
                    };
                    break;
                //Handle other data types here
                default:
                    break;
            }

            //NOTE: These links are only referenced by the menu data (which currently is NOT saved in the server)
            //So they orphans and will be deleted on save
            return (linkData) ? this.resources.W.Data.addDataItemWithUniqueId('', linkData) : null;
        },

        /**
         * Returns the label (string to show) of the given data item
         * @override BasicMenu abstract function
         * @param rawDataItem
         * @returns {string}
         */
        getItemLabel: function(rawDataItem) {
            var label = '';
            var dataType = rawDataItem.getType();
            dataType = (dataType) ? dataType.toLowerCase() : '';

            switch (dataType) {
                case "menuitem":  //Original menu data item
                    var pageRef = rawDataItem.get('refId');
                    var pageData = this.resources.W.Data.getDataByQuery(pageRef);
                    label = pageData.get('title');
                    break;
                //Handle other data types here
                default:
                    break;
            }

            return label;
        },

        /**
         * Helper function: Extracts (recursively) all the links data items
         * @param menuDataItems
         * @returns {Array}
         * @private
         */
        _getAllMenuLinkDataItems: function(menuDataItems) {
            var linkDataItems = [];

            _.forEach(menuDataItems, function(dataItem) {
                var linkRef = dataItem.get('link');
                var subItems = dataItem.get('items');
                var linkDataItem = this.resources.W.Data.getDataByQuery(linkRef);
                linkDataItems.push(linkDataItem);

                if(subItems && subItems.length) {
                    linkDataItems.push.apply(linkDataItems, this._getAllMenuLinkDataItems(subItems));
                }
            }, this);

            return linkDataItems;
        },

        /**
         * Helper function: Finds the link data item of a given page id (or current page id)
         * @param linkItems
         * @param pageId
         * @returns {*}
         * @private
         */
        _getLinkDataItemOfCurrentPage: function(linkItems, pageId) {
            var currentPageId = '#' + (pageId || this.resources.W.Viewer.getCurrentPageId());
            return _.find(linkItems, function(item) {
                return item.get('pageId') === currentPageId;
            });
        }
    });
});