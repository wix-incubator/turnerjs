define(['lodash', 'utils', 'documentServices/dataModel/dataModel', 'documentServices/routers/routersGetters'], function (_, utils, dataModel, routersGetters) {
    'use strict';

    function sanitizeHash(str) {
        return str.replace('#', '');
    }

    function getIndexOfItemInParent(ps, parentId, itemId) {
        var parentPointer = getMenuDataItemPointer(ps, parentId);
        var parentItems = ps.dal.get(ps.pointers.getInnerPointer(parentPointer, 'items'));
        var itemIndex = parentItems.indexOf('#' + itemId);

        if (itemIndex < 0) {
            throw new Error('Cannot find item #' + itemId + ' at parent #' + parentId);
        }

        return itemIndex;
    }

    /*
     This functions throws error if one of the following scenarios happen:
     1. parentId refers to a non existing data item
     2. parentId refers to a data item of type other than BasicMenuItem or CustomMenu
     3. parentId refers to a data item which is already a sub item of another item
     4. itemId refers to a data item with sub items, and user tries to move it to item other than top level (CUSTOM_MAIN_MENU)
     */
    function validateParent(ps, parentId, itemId) {
        parentId = parentId ? sanitizeHash(parentId) : 'CUSTOM_MAIN_MENU';
        itemId = itemId && sanitizeHash(itemId);

        if (itemId && itemId === parentId) {
            throw new Error('menu item ' + itemId + ' cannot be a parent for itself');
        }

        var parentItemPointer = getMenuDataItemPointer(ps, parentId);

        if (!ps.dal.isExist(parentItemPointer)) {
            throw new Error('Parent "' + parentId + '" does not exist');
        }
        var parentType = ps.dal.get(ps.pointers.getInnerPointer(parentItemPointer, 'type'));

        if (parentType !== 'BasicMenuItem' && parentType !== 'CustomMenu') {
            throw new Error('Parent of type "' + parentType + '" is not a legal parent. Please provide parent of types "BasicMenuItem" or "CustomMenu" only');
        }

        if (!isAllowedParent(ps, parentId)) {
            throw new Error('Cannot add/move items into a sub item');
        }

        if (itemId) {
            var itemPointer = getMenuDataItemPointer(ps, itemId);
            var subItemsPointer = ps.pointers.getInnerPointer(itemPointer, 'items');
            var subItems = ps.dal.get(subItemsPointer);

            if (subItems && subItems.length > 0 && parentId !== 'CUSTOM_MAIN_MENU') {
                throw new Error('Cannot move item with sub items (#' + itemId + ') to anything other than  #CUSTOM_MAIN_MENU');
            }
        }
    }

    function isAllowedParent(ps, parentId) {
        if (parentId === 'CUSTOM_MAIN_MENU') {
            return true;
        }

        var customMainMenuPointer = getMenuDataItemPointer(ps, 'CUSTOM_MAIN_MENU');
        var subItemsPointer = ps.pointers.getInnerPointer(customMainMenuPointer, 'items');
        var customMainMenuItems = ps.dal.get(subItemsPointer);

        return _.includes(customMainMenuItems, '#' + parentId);
    }

    function getParentItemId(parent, itemId) {
        var items = parent.items, i, subItem;
        for (i = 0; i < items.length; i++) {
            subItem = items[i];
            if (subItem.id === itemId) {
                return parent.id;
            }

            var parentFromSubItem = getParentItemId(subItem, itemId);
            if (parentFromSubItem) {
                return parentFromSubItem;
            }
        }

        return null;
    }

    function getItemIdAndParent(parent, data) {
        var item, itemIdAndParent;
        var items = parent.items;
        for (var i = 0; i < items.length; i++) {
            item = items[i];
            if (item.link && isContained(item.link, data)) {
                return {
                    parentId: parent.id ? sanitizeHash(parent.id) : null,
                    itemId: item.id ? sanitizeHash(item.id) : null
                };
            }

            itemIdAndParent = getItemIdAndParent(item, data);
            if (itemIdAndParent) {
                return itemIdAndParent;
            }

        }

        return null;
    }

    function isContained(container, contained) {
        return _.every(contained, function (value, key) {
            var containerValue = container[key];
            if (_.isObject(containerValue)) {
                return _.isEqual(value, '#' + containerValue.id);
            }
            return _.isEqual(value, containerValue);
        });
    }

    /**
     * Return the site menu items
     *
     * @param {PrivateServices} ps
     * @returns {Array.object}
     */
    function getSiteMenu(ps) {
        // TODO: refactor menu utils to stop using siteData and get the relevant data items as parameters.
        var siteData = {
            getDataByQuery: function (query, pageId) {
                return dataModel.getDataItemById(ps, query, pageId);
            },
            getRouters:function(){
                return routersGetters.get.all(ps);
            }
        };

        var siteMenu = utils.menuUtils.getSiteMenuWithoutRenderedLinks(siteData, false, true);
        return siteMenu;
    }

    function getLinkIdByMenuItemId(ps, menuItemId){
        var menuItemPointer = getMenuDataItemPointer(ps, menuItemId);
        var linkPointer = ps.pointers.getInnerPointer(menuItemPointer, 'link');
        return ps.dal.get(linkPointer);
    }
    function getLinkItemByMenuItemId(ps, menuItemId) {
        var linkId = getLinkIdByMenuItemId(ps, menuItemId);
        if (!linkId) {
            return null;
        }
        var linkItemPointer = getMenuDataItemPointer(ps, linkId);

        return ps.dal.get(linkItemPointer);
    }

    function getMenuDataItemPointer(ps, dataItemId) {
        dataItemId = sanitizeHash(dataItemId);
        return ps.pointers.data.getDataItem(dataItemId, 'masterPage');
    }

    /**
     * @exports documentServices/menu/menuUtils
     */
    return {
        getIndexOfItemInParent: getIndexOfItemInParent,
        getItemIdAndParent: getItemIdAndParent,
        getLinkItemByMenuItemId: getLinkItemByMenuItemId,
        getLinkIdByMenuItemId: getLinkIdByMenuItemId,
        getParentItemId: getParentItemId,
        getSiteMenu: getSiteMenu,
        sanitizeHash: sanitizeHash,
        validateParent: validateParent,
        getMenuDataItemPointer: getMenuDataItemPointer
    };
});
