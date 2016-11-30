define(['lodash'], function(_) {
    'use strict';

    function retrieveAllMenuIds(docData) {
        var mainMenu = docData.MAIN_MENU;
        var allMenuIds = [];
        _.forEach(mainMenu.items, function (menuItem) {
            allMenuIds.push(menuItem.refId);
            if (menuItem.items && menuItem.items.length > 0) {
                for (var i = 0; i < menuItem.items.length; i++) {
                    allMenuIds.push(menuItem.items[i].refId);
                }
            }
        });
        return allMenuIds;
    }
    function removeTopLevelMenuItem(mainMenu, topLevelIndex) {
        var subMenu = mainMenu.items[topLevelIndex];
        if (subMenu.items && subMenu.items.length > 0) {
            _.forEach(subMenu.items, function (menuItem, subItemIndex) { //push the subitems to the top level array before removal
                mainMenu.items.push(menuItem);
                delete subMenu.items[subItemIndex]; //delete makes that array item = undefined, does not actually change the array length
            });
        }
        subMenu.items = []; //I prefer deletion of the items + set to empty array over splice an unknown amount of times
        mainMenu.items.splice(topLevelIndex, 1);
    }
    function findSubMenuItem(mainMenu, id) {
        var result = {};
        _.find(mainMenu.items, function (menuItem, topIndex) { //for each item
            result.topIndex = topIndex;
            return _.find(menuItem.items, function (subItem, subIndex) { //check all of it's subitems
                if (subItem.refId === id) {
                    result.subIndex = subIndex;
                    return true;
                }
            });
        });

        return result;
    }
    function removeMenuItem(mainMenu, id) {
        var topLevelIndex = _.findIndex(mainMenu.items, {refId: id});
        if (topLevelIndex >= 0) { //case: id to remove is a top level menu item
            removeTopLevelMenuItem(mainMenu, topLevelIndex);
        } else { //case: id to remove is a subItem
            var location = findSubMenuItem(mainMenu, id);
            mainMenu.items[location.topIndex].items.splice(location.subIndex, 1);
        }
    }

    function removeAllBlankMenuItems(docData, menuIds) {
        var mainMenu = docData.MAIN_MENU;
        _.forEach(menuIds, function (id) {
            if (!id) {
                removeMenuItem(mainMenu, id);
            }
        });

        _.pull(menuIds, '', undefined);
    }
    function removeMenuItemsForNonexistingPages(docData, menuIds, pageIdsArray) {
        _.forEach(menuIds, function (id) {
            if (!_.includes(pageIdsArray, id.slice(1))) { //id is in #csdf format
                removeMenuItem(docData.MAIN_MENU, id);
            }
        });
    }
    function addMissingPageIdsToMenu(docData, menuIds, pageIdsArray) {
        var mainMenu = docData.MAIN_MENU;
        var emptyMainMenu = mainMenu.items.length === 0;
        var hasCsmData = !!docData.CUSTOM_MAIN_MENU;

        if (hasCsmData) {
            if (!emptyMainMenu) {
                delete docData.CUSTOM_MAIN_MENU;
                delete docData.CUSTOM_MENUS;
            } else {
                return;
            }
        }
        _.forEach(pageIdsArray, function (id) {
            if (!_.includes(menuIds, '#' + id)) {
                //id from pages list is not in the main menu, meaning it doesn't exist
                menuIds.push('#' + id); //add it to our array
                var newMenuItem = {items: [], refId: '#' + id};
                mainMenu.items.push(newMenuItem);
            }
        });
    }
    function validateSiteMainPage(siteStructure, pageIdsArray) {
        if (siteStructure && siteStructure.mainPage && !_.includes(pageIdsArray, siteStructure.mainPage.slice(1))) {
            siteStructure.mainPage = '#' + pageIdsArray[0];
        }
    }

    function removeCustomSiteMenuIfNotLegal(docData) {
        var hasCsmData = !!docData.CUSTOM_MAIN_MENU;

        if (hasCsmData) {
            var items = docData.CUSTOM_MAIN_MENU.items;
            for (var i = 0; i < items.length; i++) {
                if (!docData[items[i].replace('#', '')]) {
                    delete docData.CUSTOM_MAIN_MENU;
                    delete docData.CUSTOM_MENUS;
                    return;
                }
            }
        }
    }

    function isJsonForMasterPage(pageJson) {
        return _.get(pageJson, 'structure.type') === 'Document';
    }

    /**
     * @export utils/dataFixer/plugins/menuFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson, pageIdsArray) {
            var docData = pageJson.data.document_data;
            if (isJsonForMasterPage(pageJson) && !pageJson.data.document_data.MAIN_MENU) {
                pageJson.data.document_data.MAIN_MENU = {items: [], type: 'Menu', id: 'MAIN_MENU', metaData: {}};
            }

            if (docData.MAIN_MENU && pageIdsArray) {
                var menuIds = retrieveAllMenuIds(docData);
                removeCustomSiteMenuIfNotLegal(docData);
                removeAllBlankMenuItems(docData, menuIds);
                removeMenuItemsForNonexistingPages(docData, menuIds, pageIdsArray);
                addMissingPageIdsToMenu(docData, menuIds, pageIdsArray);
                var siteStructure = docData.masterPage;
                validateSiteMainPage(siteStructure, pageIdsArray);
            }
        }
    };

    return exports;
});
