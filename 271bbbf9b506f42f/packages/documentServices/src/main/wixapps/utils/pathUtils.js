define(['lodash'], function (_) {
    'use strict';

    // TODO: unite with appPart2DataRequirementsChecker

    // error messages
    var ERROR_MISSING_TYPE_ID = 'Must provide a type ID';
    var ERROR_MISSING_ITEM_ID = 'Must provide an item ID';
    var ERROR_MISSING_PART_ID = 'Must provide a part ID';
    var ERROR_MISSING_VIEW_ID = 'Must provide a view ID';
    var ERROR_MISSING_DATA_SELECTOR_ID = 'Must provide a data selector ID';
    var ERROR_MISSING_PAGE_ID = 'Must provide a page ID';


    // site data paths
    var BASE_WIXAPPS_PATH = ['wixapps'];
    var BASE_APPBUILDER_PATH = BASE_WIXAPPS_PATH.concat('appbuilder');
    var BASE_REPO_PATH = BASE_APPBUILDER_PATH.concat('descriptor');

    var BASE_DATA_PATHS = {
        VIEWS: BASE_REPO_PATH.concat('views'),
        TYPES: BASE_REPO_PATH.concat('types'),
        PARTS: BASE_REPO_PATH.concat('parts'),
        DATA_SELECTORS: BASE_REPO_PATH.concat('dataSelectors'),
        PAGES: BASE_REPO_PATH.concat('pages'),
        ITEMS: BASE_APPBUILDER_PATH.concat('items'),
        DELETED_ITEMS: BASE_APPBUILDER_PATH.concat('deletedItems')
    };

    function throwIfUndefined(param, errorMessage) {
        if (!param) {
            throw new Error(errorMessage);
        }
    }

    return {
        initBasePaths: function (ps) {
            var pathsToSet = [
                BASE_WIXAPPS_PATH,
                BASE_APPBUILDER_PATH,
                BASE_REPO_PATH
            ].concat(_.values(BASE_DATA_PATHS));

            _.forEach(pathsToSet, function (path) {
                if (!ps.dal.isPathExist(path)) { // DAL does not support deep merge
                    ps.dal.full.setByPath(path, {});
                }
            });
        },

        getBaseItemsPath: function (typeId) {
            return typeId ? BASE_DATA_PATHS.ITEMS.concat(typeId) : BASE_DATA_PATHS.ITEMS;
        },

        /**
         * Get the path to an item or item's property.
         * @param {String} typeId The type id.
         * @param {String} itemId The item id.
         * @param {String|String[]?} property The property of in the item
         * @returns {string[]} The path to the item or property of an item.
         */
        getItemPath: function (typeId, itemId, property) {
            throwIfUndefined(typeId, ERROR_MISSING_TYPE_ID);
            throwIfUndefined(itemId, ERROR_MISSING_ITEM_ID);
            var path = this.getBaseItemsPath(typeId).concat(itemId);
            if (property) {
                path = path.concat(property);
            }
            return path;
        },

        getBaseDeletedItemsPath: function (typeId) {
            return typeId ? BASE_DATA_PATHS.DELETED_ITEMS.concat(typeId) : BASE_DATA_PATHS.DELETED_ITEMS;
        },

        getDeletedItemPath: function (typeId, itemId) {
            throwIfUndefined(typeId, ERROR_MISSING_TYPE_ID);
            throwIfUndefined(itemId, ERROR_MISSING_ITEM_ID);
            return this.getBaseDeletedItemsPath(typeId).concat(itemId);
        },

        getBaseTypesPath: function () {
            return BASE_DATA_PATHS.TYPES;
        },

        getTypePath: function (typeId) {
            throwIfUndefined(typeId, ERROR_MISSING_TYPE_ID);
            return this.getBaseTypesPath().concat(typeId);
        },

        getBasePartsPath: function () {
            return BASE_DATA_PATHS.PARTS;
        },

        getPartPath: function (partId) {
            throwIfUndefined(partId, ERROR_MISSING_PART_ID);
            return this.getBasePartsPath().concat(partId);
        },

        getBaseViewsPath: function () {
            return BASE_DATA_PATHS.VIEWS;
        },

        getViewPath: function (viewId) {
            throwIfUndefined(viewId, ERROR_MISSING_VIEW_ID);
            return this.getBaseViewsPath().concat(viewId);
        },

        getBaseDataSelectorsPath: function () {
            return BASE_DATA_PATHS.DATA_SELECTORS;
        },

        getDataSelectorPath: function (dataSelectorId) {
            throwIfUndefined(dataSelectorId, ERROR_MISSING_DATA_SELECTOR_ID);
            return this.getBaseDataSelectorsPath().concat(dataSelectorId);
        },

        getPagePath: function (pageId) {
            throwIfUndefined(pageId, ERROR_MISSING_PAGE_ID);
            return BASE_DATA_PATHS.PAGES.concat(pageId);
        },

        getApplicationInstanceVersionPath: function () {
            return BASE_REPO_PATH.concat(['applicationInstanceVersion']);
        },

        getOffsetFromServerTimePath: function () {
            return BASE_REPO_PATH.concat(['offsetFromServerTime']);
        },

        getRepoPath: function () {
            return BASE_REPO_PATH;
        },

        getAppbuilderPath: function () {
            return BASE_APPBUILDER_PATH;
        },

        getPackageMetaDataPath: function () {
            return BASE_APPBUILDER_PATH.concat(['metadata']);
        },

        getAppbuilderMetadataPath: function (innerPath) {
            return _.compact(BASE_APPBUILDER_PATH.concat(['metadata', 'appbuilder_metadata'].concat(innerPath)));
        },

        getAppPart2MetadataPath: function (partName) {
            return BASE_APPBUILDER_PATH.concat(['metadata', partName]);
        }
    };
});
