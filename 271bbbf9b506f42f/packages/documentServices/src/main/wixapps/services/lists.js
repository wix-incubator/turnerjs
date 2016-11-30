define([
        'lodash',
        'utils',
        'documentServices/wixapps/utils/pathUtils',
        'documentServices/wixapps/utils/stringUtils',
        'documentServices/wixapps/services/types',
        'documentServices/wixapps/services/items',
        'documentServices/wixapps/services/selection',
        'documentServices/wixapps/services/views',
        'documentServices/wixapps/utils/wixappsConsts'
    ],
    function (_, utils, pathUtils, stringUtils, types, items, selection, views, consts) {
        'use strict';

        var ERROR_LIST_DOES_NOT_EXIST = 'List does not exist';
        var ERROR_DATA_SELECTOR_DOES_NOT_EXIST = 'Data selector does not exist';
        var ERROR_TYPE_DOES_NOT_EXIST = 'Type does not exist';
        var ERROR_LIST_VIEWS_DO_NOT_EXIST = 'List views do not exist';
        var ERROR_VIEW_IS_NOT_VALID = 'View is not valid';

        var DEFAULT_LIST_DISPLAY_NAME = 'New List';

        function throwError(errorMessage) {
            throw new Error(errorMessage);
        }

        /**
         * Get a list definition
         * @param ps Private Services
         * @param {string} listId
         * @returns {Object} the request list part definition
         */
        function getListDef(ps, listId) {
            return ps.dal.getByPath(pathUtils.getPartPath(listId));
        }

        /**
         * Get list name
         * @param ps Private Services
         * @param {string} listId
         * @returns {string} list display name
         */

        function getDisplayName(ps, listId){
            return getListDef(ps, listId).displayName;
        }

        /**
         * Get list version
         * @param ps Private Services
         * @param {string} listId
         * @returns {string} list version
         */

        function getVersion(ps, listId){
            return getListDef(ps, listId).version || '1.0';
        }

        /**
         * Get all items that belong to a given list
         * @param ps Private Services
         * @param {string} listId
         * @returns {Object|{}} map of items with their id as the key
         * @throws Throws an error if the list does not exist
         * @throws Throws an error if the list's data selector does not exist
         * @throws Throws an error if list is not manual
         */
        function getItems(ps, listId) {
            var list = getListDef(ps, listId) || throwError(ERROR_LIST_DOES_NOT_EXIST);
            var dataSelector = getSelector(ps, listId);
            if (!dataSelector) {
                throw new Error(ERROR_DATA_SELECTOR_DOES_NOT_EXIST);
            }
            if (dataSelector.type !== 'ManualSelectedList') {
                // TODO: remove once we support non manual lists
                throw new Error('Only manual lists are supported');
            } else {
                return _(items.getAllItemsOfType(ps, list.type)).pick(dataSelector.itemIds).values().value();
            }
        }

        function getHiddenItems(ps, listId) {
            var list = getListDef(ps, listId) || throwError(ERROR_LIST_DOES_NOT_EXIST);
            var listItems = getItems(ps, listId);
            var allItemsOfType = items.getAllItemsOfType(ps, list.type);
            return _(allItemsOfType)
                .omit(_.pluck(listItems, '_iid'))
                .values()
                .value();
        }

        /**
         * Get a list's type definition object
         * @param ps Private Services
         * @param {string} listId
         * @returns {Object} List's type definition
         * @throws Throws an error if the list does not exist
         */
        function getType(ps, listId) {
            var list = getListDef(ps, listId) || throwError(ERROR_LIST_DOES_NOT_EXIST);
            return types.getType(ps, list.type);
        }

        /**
         * Get a list's type name
         * @param ps Private Services
         * @param {string} listId
         * @returns {string} List's type name
         * @throws Throws an error if the list does not exist
         */
        function getTypeName(ps, listId){
            return getType(ps, listId).name;
        }

        /**
         * Get all list's view definition objects
         * @param ps Private Services
         * @param {string} listId
         * @returns {Object} Map of all list's view definitions
         * @throws Throws an error if the list does not exist
         */
        function getViews(ps, listId) {
            var list = getListDef(ps, listId) || throwError(ERROR_LIST_DOES_NOT_EXIST);
            return views.getAllViewsByName(ps, list.viewName);
        }

        /**
         * Get a list's data selector object
         * @param ps Private Services
         * @param {string} listId
         * @returns {Object} List's data selector
         * @throws Throws an error if the list does not exist
         */
        function getSelector(ps, listId) {
            var list = getListDef(ps, listId) || throwError(ERROR_LIST_DOES_NOT_EXIST);
            return selection.getSelector(ps, list.dataSelector);
        }

        /**
         * Set a list as a manually seleced list with given item IDs
         * @param ps Private Services
         * @param {string} listId
         * @param {string[]} itemIds
         * @throws Throws an error if the list does not exist
         */
        function setManualSelector(ps, listId, itemIds) {
            var list = getListDef(ps, listId) || throwError(ERROR_LIST_DOES_NOT_EXIST);
            selection.setManualSelector(ps, list.dataSelector, itemIds);
        }

        /**
         * Returns all list definitions
         * @param ps Private Services
         * @returns {Object} The list definitions
         */
        function getAllLists(ps) {
            return ps.dal.getByPath(pathUtils.getBasePartsPath());
        }


        function replaceWithUniqueDisplayName(ps, originalDisplayName) {
            var existingDisplayNames = _.pluck(getAllLists(ps), 'displayName');
            var uniqueDisplayName = originalDisplayName;
            while (_.includes(existingDisplayNames, uniqueDisplayName)) {
                uniqueDisplayName = stringUtils.incNumberSuffix(uniqueDisplayName);
            }
            return uniqueDisplayName;
        }

        /**
         * Create a new list part definition
         * @param ps Private Services
         * @param {Object} listDef
         * @returns {string} The created list's ID
         * @throws Throws an error if the defined type does not exist
         * @throws Throws an error if the defined data selector does not exist
         * @throws Throws an error if the defined viewName does not exist
         */
        function createList(ps, listDef) {
            if (!types.getType(ps, listDef.type)) {
                throw new Error(ERROR_TYPE_DOES_NOT_EXIST);
            }
            if (!selection.getSelector(ps, listDef.dataSelector)) {
                throw new Error(ERROR_DATA_SELECTOR_DOES_NOT_EXIST);
            }
            if (_.isEmpty(views.getAllViewsByName(ps, listDef.viewName))) {
                throw new Error(ERROR_LIST_VIEWS_DO_NOT_EXIST);
            }

            var newListDef = {
                displayName: replaceWithUniqueDisplayName(ps, listDef.displayName || DEFAULT_LIST_DISPLAY_NAME),
                dataSelector: listDef.dataSelector,
                type: listDef.type,
                viewName: listDef.viewName,
                version: consts.LIST_VERSION
            };

            var newListId = 'list_' + utils.guidUtils.getUniqueId();
            ps.dal.full.setByPath(pathUtils.getPartPath(newListId), newListDef);
            return newListId;
        }

        function rename(ps, listId, newName){
            var listDef = getListDef(ps, listId);
            listDef.displayName = newName;
            ps.dal.full.setByPath(pathUtils.getPartPath(listId), listDef);
        }

        function getItemViewAndId(ps, listId, format) {
            var list = getListDef(ps, listId) || throwError(ERROR_LIST_DOES_NOT_EXIST);
            var listViews = getViews(ps, listId);
            var viewId = _.findKey(listViews, function(view) {
                return view.forType === list.type && (format ? view.format === format : _.isEmpty(view.format));
            });
            return [viewId, listViews[viewId]];
        }

        /**
         * Replace a list's item view (does not replace array or mobile views)
         * @param ps Private Services
         * @param {string} listId
         * @param {object} viewDefTemplate - is being changed during replacement
         * @returns {object} the previous view definition that has been replaced
         */
        function replaceItemView(ps, listId, viewDefTemplate) {
            if (_.isEmpty(viewDefTemplate)) {
                throwError(ERROR_VIEW_IS_NOT_VALID);
            }
            var itemViewId = _.first(getItemViewAndId(ps, listId, viewDefTemplate.format));
            views.replaceView(ps, itemViewId, viewDefTemplate);
        }

        /**
         * Return the list's item view with the given optional format
         * @param ps
         * @param listId
         * @param {string} [format]
         * @returns {*}
         */
        function getItemView(ps, listId, format) {
            return _.last(getItemViewAndId(ps, listId, format));
        }

        return {
            getListDef: getListDef,
            getDisplayName: getDisplayName,
            getItems: getItems,
            getHiddenItems: getHiddenItems,
            getType: getType,
            getViews: getViews,
            getSelector: getSelector,
            setManualSelector: setManualSelector,
            getAllLists: getAllLists,
            createList: createList,
            getTypeName: getTypeName,
            rename: rename,
            getVersion: getVersion,
            replaceItemView: replaceItemView,
            getItemView: getItemView
        };
    });
