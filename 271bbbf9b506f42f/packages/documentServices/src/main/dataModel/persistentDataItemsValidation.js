define(['lodash'], function (_) {
    'use strict';

    var PERSISTENT_DATA_ITEMS = ['MAIN_MENU', 'CUSTOM_MENUS', 'CUSTOM_MAIN_MENU', 'IMAGE_QUALITY'];

    function isDataItemPersistent(ps, dataItemPointer) {
        var dataItem = ps.dal.get(dataItemPointer);
        return dataItem && _.includes(PERSISTENT_DATA_ITEMS, dataItem.id);
    }

    return {
        isDataItemPersistent: isDataItemPersistent
    };
});
