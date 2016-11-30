define([
    'lodash',
    'documentServices/dataModel/dataModel',
    'documentServices/hooks/hooks',
    'documentServices/constants/constants',
    'documentServices/menu/menuUtils',
    'documentServices/page/pageUtils',
    'documentServices/page/pageData',
    'documentServices/page/popupUtils',
    'documentServices/tpa/tpa'
], function (_, dataModel, hooks, constants, menuUtils, pageUtils, pageDataModule, popupUtils, tpa) {
    'use strict';

    initialize();

    function initialize() {
        hooks.registerHook(hooks.HOOKS.REMOVE.AFTER, menuHookDeletePage, 'mobile.core.components.Page');
        hooks.registerHook(hooks.HOOKS.REMOVE.AFTER, menuHookDeletePage, 'wixapps.integration.components.AppPage');
        hooks.registerHook(hooks.HOOKS.ADD.BEFORE, addDropDownMenuHook, 'wysiwyg.viewer.components.menus.DropDownMenu');
        hooks.registerHook(hooks.HOOKS.ADD.BEFORE, validateDataTypeIsMenuRef, 'wysiwyg.common.components.verticalmenu.viewer.VerticalMenu');

        pageUtils.registerPageDataChangedCallback(pageDataChanged);
    }

    function addDropDownMenuHook(ps, compToAddPointer, containerPointer, compDefinitionPrototype) {
        delete compDefinitionPrototype.data;
        compDefinitionPrototype.dataQuery = '#MAIN_MENU'; //drop down menus must have a reference to actual menu data
    }

    function isReferenceToMenuData(ps, dataRef, pageId) {
        if (!_.isString(dataRef) || dataRef[0] !== '#') {
            return false;
        }
        var data = dataModel.getDataItemById(ps, dataRef.replace('#', ''), pageId);
        return _.get(data, 'type') === 'Menu';
    }

    function validateDataTypeIsMenuRef(ps, compToAddPointer, containerPointer, compDefinitionPrototype) {
        var menuRef = _.get(compDefinitionPrototype, 'data.menuRef');
        var pageIdOfComponent = ps.pointers.components.getPageOfComponent(containerPointer).id;
        if (menuRef) {
            if (!isReferenceToMenuData(ps, menuRef, pageIdOfComponent)) {
                compDefinitionPrototype.data.menuRef = "#MAIN_MENU";
            }
        } else {
            menuRef = compDefinitionPrototype.dataQuery;
            if (menuRef && isReferenceToMenuData(ps, menuRef, pageIdOfComponent)) {
                compDefinitionPrototype.data = {
                    menuRef: menuRef,
                    type: 'MenuDataRef'
                };
                delete compDefinitionPrototype.dataQuery;
            }
        }
    }

    function pageDataChanged(ps, pageId, data) {
        if (!popupUtils.isPopup(ps, pageId)) {
            var existingPage = false;
            var pageLinkPointers = ps.pointers.data.getDataItemsWithPredicate({type: 'PageLink', pageId: '#' + pageId});
            var menuItemPointer;

            for (var i = 0; i < pageLinkPointers.length; i++) {
                menuItemPointer = ps.pointers.data.getDataItemWithPredicate({
                    type: 'BasicMenuItem',
                    link: '#' + pageLinkPointers[i].id
                });
                if (menuItemPointer) {
                    existingPage = true;
                    break;
                }
            }

            if (existingPage) {
                menuHookChangePageData(ps, menuItemPointer, data);
            } else {
                menuHookAddPage(ps, pageId);
            }
        }
    }

    /*********/
    function menuHookChangePageData(ps, menuItemPointer, data) {
        var menuItemLink, pageData;
        var menuItem = ps.dal.get(menuItemPointer);
        var modifiedMenuItemData = _.reduce(data, function (res, value, key) {
            switch (key) {
                case 'title':
                    res.label = value;
                    break;
                case 'hidePage':
                    menuItemLink = menuUtils.getLinkItemByMenuItemId(ps, menuItem.id);
                    pageData = pageDataModule.getPageData(ps, menuUtils.sanitizeHash(menuItemLink.pageId));
                    res.isVisible = !value;
                    if (pageData.mobileHidePage === undefined || pageData.mobileHidePage === null) {
                        res.isVisibleMobile = !value;
                    }
                    break;
                case 'mobileHidePage':
                    res.isVisibleMobile = !value;
                    break;
            }
            return res;
        }, {});

        dataModel.setDataItemByPointer(ps, menuItemPointer, _.assign(menuItem, modifiedMenuItemData), 'data');
    }

    function menuHookAddPage(ps, pageId) {
        //page node and data ids the same (if we fix it, this will stop working)
        var pageDataPointer = ps.pointers.data.getDataItemFromMaster(pageId);
        var pageData = ps.dal.get(pageDataPointer);

        addPageItem(ps, '#' + pageData.id, pageData.title, pageData.hidePage, pageData.mobileHidePage);
        return {success: true};
    }

    function menuHookDeletePage(ps, pageComponentPointer) {
        var siteMenu = menuUtils.getSiteMenu(ps);
        var pageId = pageComponentPointer.id;
        var itemIdAndParent = menuUtils.getItemIdAndParent({items: siteMenu}, {type: 'PageLink', pageId: '#' + pageId});

        if (itemIdAndParent) {
            deleteItem(ps, itemIdAndParent.itemId);
        }
        return {success: true};
    }

    function addHeaderItem(ps, dataId, label, parentId, hideItem, hideItemMobile) {
        return addMenuItem(ps, dataId, label, 'CUSTOM_MENU_HEADER', parentId, hideItem, hideItemMobile);
    }

    function isPageLink(ps, linkData) {
        var pageId = linkData.pageId && linkData.pageId.replace('#', '');

        return linkData.type === 'PageLink' && !popupUtils.isPopup(ps, pageId);
    }

    function addNonPageLinkItem(ps, dataId, linkData, label, parentItemId, hideItem, hideItemMobile) {
        if (isPageLink(ps, linkData)) {
            throw new Error('Explicitly adding a LinkItem of type "PageLink" is not allowed');
        }

        return addLinkItem(ps, dataId, linkData, label, parentItemId, hideItem, hideItemMobile);
    }

    function updateNonPageLinkItem(ps, itemId, linkData) {
        if (isPageLink(ps, linkData)) {
            throw new Error('Explicitly setting a LinkItem of type "PageLink" is not allowed');
        }

        var linkId = menuUtils.getLinkIdByMenuItemId(ps, itemId);
        if (!linkId) {
            throw new Error('Cannot update item with "' + itemId + '", link does not exist');
        }
        var linkItemPointer = menuUtils.getMenuDataItemPointer(ps, linkId);

        var dataItemId = dataModel.generateNewDataItemId();
        dataModel.setDataItemByPointer(ps, linkItemPointer, _.assign(linkData, {id: dataItemId}), 'data');
    }

    //TODO: if used in public it should be wrapped in set operation if getValue method
    function addPageItem(ps, pageId, label, hideItem, hideItemMobile) {
        var pageLinkRawData = dataModel.createDataItemByType(ps, 'PageLink');
        var dataId = getNewMenuItemId(ps);
        addLinkItem(ps, dataId, _.assign(pageLinkRawData, {pageId: pageId}), label, null, hideItem, hideItemMobile);
    }

    function addLinkItem(ps, dataId, linkData, label, parentItemId, hideItem, hideItemMobile) {
        var linkId = addLinkDataItemAndReturnId(ps, linkData);
        addMenuItem(ps, dataId, label, linkId, parentItemId, hideItem, hideItemMobile);
    }

    function addLinkDataItemAndReturnId(ps, linkData) {
        var dataItemId = dataModel.generateNewDataItemId();
        var linkPointer = ps.pointers.data.getDataItemFromMaster(dataItemId);
        dataModel.setDataItemByPointer(ps, linkPointer, _.assign(linkData, {id: dataItemId}), 'data');

        return dataItemId;
    }

    function getNewMenuItemId() {
        return dataModel.generateNewDataItemId();
    }

    function addMenuDataItem(ps, dataItemId, label, link, hideItem, hideItemMobile) {
        var dataItem = dataModel.createDataItemByType(ps, 'BasicMenuItem');
        var menuItemPointer = ps.pointers.data.getDataItemFromMaster(dataItemId);

        dataModel.setDataItemByPointer(ps, menuItemPointer, _.assign(dataItem, {
            id: dataItemId,
            label: label,
            isVisible: !hideItem,
            isVisibleMobile: !(typeof hideItemMobile === 'boolean' ? hideItemMobile : hideItem),
            link: '#' + link
        }), 'data');

        return dataItemId;
    }

    function addMenuItem(ps, dataId, label, linkId, parentItemId, hideItem, hideItemMobile) {
        parentItemId = parentItemId || 'CUSTOM_MAIN_MENU';

        menuUtils.validateParent(ps, parentItemId);
        addMenuDataItem(ps, dataId, label, linkId, hideItem, hideItemMobile);
        var parentPointer = menuUtils.getMenuDataItemPointer(ps, parentItemId);

        var parentItemsPointer = ps.pointers.getInnerPointer(parentPointer, 'items');
        if (!ps.dal.isExist(parentItemsPointer)) {
            ps.dal.set(parentItemsPointer, ['#' + dataId]);
        } else {
            ps.dal.push(parentItemsPointer, '#' + dataId);
        }
    }

    function deleteNonPageItem(ps, itemId) {
        itemId = menuUtils.sanitizeHash(itemId);
        var linkItem = menuUtils.getLinkItemByMenuItemId(ps, itemId);

        if (linkItem) {
            var sanitizedPageId = (linkItem.pageId) ? menuUtils.sanitizeHash(linkItem.pageId) : null;
            var isPopupLink = popupUtils.isPopup(ps, sanitizedPageId);

            if (linkItem.type === 'PageLink' && !isPopupLink) {
                throw new Error("Explicitly deleting a page link item is not allowed");
            }
        }

        deleteItem(ps, itemId);
    }

    /**
     * Remove item from menu, while flattening his children
     *
     * @param {PrivateServices} ps
     * @param itemId item to delete
     */
    function deleteItem(ps, itemId) {
        var siteMenu = menuUtils.getSiteMenu(ps);
        var parentItemId = menuUtils.getParentItemId({items: siteMenu, id: 'CUSTOM_MAIN_MENU'}, itemId);
        var itemPointer = menuUtils.getMenuDataItemPointer(ps, itemId);

        var subItems = ps.dal.get(itemPointer).items;

        var parentPointer = menuUtils.getMenuDataItemPointer(ps, parentItemId);
        var parent = ps.dal.get(parentPointer);
        var parentItems = parent.items;

        var itemIndex = parentItems.indexOf('#' + itemId);
        //TODO: we want to use the new and shiny method of the DAL, that Shahar will create for us
        parentItems.splice.call(parentItems, itemIndex, 1);
        if (subItems) {
            parentItems.splice.apply(parentItems, [itemIndex, 0].concat(subItems));
        }

        ps.dal.set(parentPointer, parent);
        //TODO: didn't we just remove this?
        ps.dal.remove(itemPointer);
    }

    /**
     * Move item from old parent to new parent at specified index
     *
     * @param {PrivateServices} ps
     * @param {string} itemId item to move
     * @param {string} newParentId the id of the new parent item
     * @param {number} newIndex the desired position in the new parent item
     */
    function moveItem(ps, itemId, newParentId, newIndex) {
        itemId = menuUtils.sanitizeHash(itemId);
        var siteMenu = menuUtils.getSiteMenu(ps);
        var oldParentId = menuUtils.getParentItemId({items: siteMenu}, itemId) || 'CUSTOM_MAIN_MENU';
        newParentId = newParentId || 'CUSTOM_MAIN_MENU';

        menuUtils.validateParent(ps, newParentId, itemId);

        var oldIndex = menuUtils.getIndexOfItemInParent(ps, oldParentId, itemId);
        var oldParentPointer = menuUtils.getMenuDataItemPointer(ps, oldParentId);
        var oldParent = ps.dal.get(oldParentPointer);
        oldParent.items.splice(oldIndex, 1);
        ps.dal.set(oldParentPointer, oldParent);

        var newParentPointer = menuUtils.getMenuDataItemPointer(ps, newParentId);
        var newParent = ps.dal.get(newParentPointer);
        newParent.items = newParent.items || [];
        newParent.items.splice(newIndex, 0, '#' + itemId);
        ps.dal.set(newParentPointer, newParent);
    }

    function getItemType(ps, itemId) {
        var linkedItemId = menuUtils.getLinkIdByMenuItemId(ps, itemId);

        if (linkedItemId === '#CUSTOM_MENU_HEADER') {
            return constants.MENU_ITEM_TYPES.HEADER;
        }

        var linkedItemPointer = menuUtils.getMenuDataItemPointer(ps, linkedItemId);
        var linkedItemType = ps.dal.get(ps.pointers.getInnerPointer(linkedItemPointer, 'type'));

        if (linkedItemType === 'PageLink') {
            return constants.MENU_ITEM_TYPES.PAGE;
        }

        return constants.MENU_ITEM_TYPES.LINK;
    }

    function setItemData(ps, itemId, data) {
        var itemPointer = menuUtils.getMenuDataItemPointer(ps, itemId);
        var currentData = ps.dal.get(itemPointer);

        if (!currentData) {
            throw new Error('Cannot update item with "' + itemId + '", it does not exist');
        }

        dataModel.setDataItemByPointer(ps, itemPointer, _.assign(currentData, data), 'data');
    }

    /**
     * Set menu item's label
     *
     * @param {PrivateServices} ps
     * @param {string} itemId item id to change
     * @param {string} label the label to set
     */
    function setItemLabel(ps, itemId, label) {
        setItemData(ps, itemId, {label: label});
    }

    /**
     * Set menu item's visibility
     *
     * @param {PrivateServices} ps
     * @param {string} itemId item id to change
     * @param {boolean} hideItem should this menu item be hidden
     * @param {boolean} hideItemMobile should this menu item be hidden on mobile devices
     */
    function setItemVisibility(ps, itemId, hideItem, hideItemMobile) {
        setItemData(ps, itemId, {isVisible: !hideItem, isVisibleMobile: !hideItemMobile});
    }

    /**
     * Determine if a menu item can be explicitly removed
     *
     * @param {PrivateServices} ps
     * @param {string} itemId
     * @returns {boolean} true if link item or header item, false if page item
     */
    function isItemRemovable(ps, itemId) {
        return getItemType(ps, itemId) !== constants.MENU_ITEM_TYPES.PAGE;
    }

    function getMenu(ps, filterHideFromMenuPages) {
        var menuItems = menuUtils.getSiteMenu(ps);
        if (filterHideFromMenuPages) {
            return _.filter(menuItems, function (dataItem) {
                return !isPageMarkedAsHideFromMenu(ps, dataItem.link);
            });
        }
        return menuItems;
    }

    function isPageMarkedAsHideFromMenu(ps, linkObject) {
        var pageId = _.get(linkObject, 'pageId');
        if (pageId && _.get(linkObject, 'type') === 'PageLink') {
            pageId = pageId.replace('#', '');
            var pageData = dataModel.getDataItemById(ps, pageId);
            var tpaApplicationId = _.get(pageData, 'tpaApplicationId');
            var tpaPageId = _.get(pageData, 'tpaPageId');
            return tpa.isPageMarkedAsHideFromMenu(ps, tpaApplicationId, tpaPageId);
        }
        return false;
    }

    /** @class documentServices.mainMenu */
    return {
        getNewMenuItemId: getNewMenuItemId,
        /**
         * Add a dropdown item to the menu
         *
         * @param {string} label the label of the dropdown item
         * @param {string=} parentId the parent item id under-which to place the dropdown item
         * @returns {*}
         */
        addHeaderItem: addHeaderItem,
        /**
         * Add a link item to the menu
         *
         * @param {object} linkData the link data, must contain type and relevant info of that type (e.g. {type: 'ExternalLink', url: 'http://www.wix.com'})
         * @param {string} label the label of the link item
         * @param {string=} parentItemId the parent item id under-which to place the link item
         * @returns {*}
         */
        addLinkItem: addNonPageLinkItem,
        /**
         * Updates link of existing link menu item
         */
        updateLinkItem: updateNonPageLinkItem,
        addPageItem: addPageItem,
        /**
         * Remove item from menu, while flattening its children
         *
         * @param {string} itemId item to delete
         */
        deleteItem: deleteNonPageItem,
        /**
         * Returns the item type
         *
         * @param {string} itemId
         * @returns {string} one of [header, link, page]
         */
        getItemType: getItemType,
        /**
         * Return the site menu items
         *
         * @param {boolean} filterHiddenFromMenuPages filter out tpa pages which their 'hideFromMenu' flag in the client spec map is true
         * @returns {Array.object}
         */
        getMenu: getMenu,
        initialize: initialize,
        /**
         * Determine if a menu item can be explicitly removed
         *
         * @param {string} itemId
         * @returns {boolean} true if link item or header item, false if page item
         */
        isItemRemovable: isItemRemovable,
        /**
         * Move item from old parent to new parent at specified index
         *
         * @param {string} itemId item to move
         * @param {string} newParentId the id of the new parent item
         * @param {number} newIndex the desired position in the new parent item
         */
        moveItem: moveItem,
        /**
         * Set menu item's label
         *
         * @param {string} itemId item id to change
         * @param {string} label the label to set
         */
        setItemLabel: setItemLabel,
        /**
         * Set menu item's visibility
         *
         * @param {string} itemId item id to change
         * @param {boolean} hideItem should this menu item be hidden
         * @param {boolean} hideItemMobile should this menu item be hidden on mobile devices
         */
        setItemVisibility: setItemVisibility
    };
});
