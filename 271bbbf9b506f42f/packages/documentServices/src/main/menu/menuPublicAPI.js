define(['documentServices/menu/menu', 'documentServices/constants/constants'], function (menu, constants) {
    "use strict";
    return {
        methods: {
            mainMenu: {
                addHeaderItem: {dataManipulation: menu.addHeaderItem, getReturnValue: menu.getNewMenuItemId},
                addLinkItem: {dataManipulation: menu.addLinkItem, getReturnValue: menu.getNewMenuItemId},
                updateLinkItem: {dataManipulation: menu.updateLinkItem},
                getItemType: menu.getItemType,
                getMenu: menu.getMenu,
                isItemRemovable: menu.isItemRemovable,
                moveItem: {dataManipulation: menu.moveItem},
                removeItem: {dataManipulation: menu.deleteItem},
                setItemLabel: {dataManipulation: menu.setItemLabel},
                setItemVisibility: {dataManipulation: menu.setItemVisibility}, //should change third parameter to view mode
                ITEM_TYPES: constants.MENU_ITEM_TYPES
            }
        }
    };
});
