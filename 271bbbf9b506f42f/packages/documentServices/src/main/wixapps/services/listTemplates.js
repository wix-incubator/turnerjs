define([
        'lodash',
        'utils',
        'wixappsBuilder',
        'documentServices/wixapps/utils/pathUtils',
        'documentServices/wixapps/services/lists',
        'documentServices/wixapps/services/types',
        'documentServices/wixapps/services/views',
        'documentServices/wixapps/services/items',
        'documentServices/wixapps/services/selection'
    ],
    function (_, utils, wixappsBuilder, pathUtils, listsDS, typesDS, viewsDS, itemsDS, selectionDS) {
        'use strict';

        var ERROR_ONLY_MANUAL_LISTS_SUPPORTED = 'Only manual lists are supported';
        var ERROR_LIST_DOES_NOT_EXIST = 'List does not exist';
        var ERROR_TYPE_DOES_NOT_EXIST = 'Type does not exist';
        var ERROR_LIST_VIEWS_DO_NOT_EXIST = 'List views do not exist';
        var ERROR_DATA_SELECTOR_DOES_NOT_EXIST = 'Data selector does not exist';
        var ERROR_TEMPLATE_TYPE_IS_NOT_VALID = 'Template\'s type definition is not valid';
        var ERROR_TEMPLATE_VIEWS_ARE_NOT_VALID = 'Template\'s view definitions are not valid';
        var ERROR_TEMPLATE_MISSING_ITEM_VIEW = 'The template is missing an item view';

        var DEFAULT_LIST_DISPLAY_NAME = 'New List';

        function throwError(errorMessage) {
            throw new Error(errorMessage);
        }

        function omitPrivateFields(objects) {
            return _.mapValues(objects, function (obj) {
                return _.omit(obj, function (value, key) {
                    return key !== '_iid' && _.startsWith(key, '_');
                });
            });
        }

        function modifyViewsType(views, typeId) {
            _.forEach(views, function (view) {
                view.forType = view.forType === 'Array' ? 'Array' : typeId;
            });
        }

        function createViews(ps, views) {
            var newViewIds = viewsDS.createViewsWithSameName(ps, views);
            return viewsDS.getViewById(ps, newViewIds[0]).name;
        }

        function createItemsWithType(ps, items, typeId) {
            return _.transform(items, function (acc, item) {
                var newItemId = itemsDS.createItem(ps, typeId, item);
                acc[item._iid || newItemId] = newItemId;
            }, {});
        }

        function createManualDataSelector(ps, typeId, itemIds) {
            var newDataSelectorId = selectionDS.createSelector(ps, typeId);
            selectionDS.setManualSelector(ps, newDataSelectorId, itemIds);
            return newDataSelectorId;
        }

        /**
         * Generate a preset template from an existing list
         * @param ps Private Services
         * @param {string} listId
         * @returns {{type: *, views: Object[], items: Object[], displayName: (string)}}
         * @throws Throws an error if the list does not exist
         * @throws Throws an error if the list is not manual
         * @throws Throws an error if the list does not have views
         * @throws Throws an error if the list's type does not exist
         */
        function generateTemplate(ps, listId) {
            var list = listsDS.getListDef(ps, listId) || throwError(ERROR_LIST_DOES_NOT_EXIST);
            var dataSelector = listsDS.getSelector(ps, listId) || throwError(ERROR_DATA_SELECTOR_DOES_NOT_EXIST);
            if (dataSelector.type !== 'ManualSelectedList') {
                throw new Error(ERROR_ONLY_MANUAL_LISTS_SUPPORTED);
            }
            var listViews = listsDS.getViews(ps, listId);
            if (_.isEmpty(listViews)) {
                throwError(ERROR_LIST_VIEWS_DO_NOT_EXIST);
            }

            var typeDef = listsDS.getType(ps, listId);
            return {
                type: typeDef || throwError(ERROR_TYPE_DOES_NOT_EXIST),
                views: _.values(listViews),
                items: omitPrivateFields(itemsDS.getAllItemsOfType(ps, typeDef.name)),
                dataSelector: dataSelector,
                displayName: list.displayName || DEFAULT_LIST_DISPLAY_NAME
            };
        }

        function createDataSelectorFromTemplate(ps, dataSelector, newItemIdsMap, newTypeId) {
            var itemIdsMap = dataSelector ? _.pick(newItemIdsMap, dataSelector.itemIds) : newItemIdsMap;
            var selectedItemIds = _.values(itemIdsMap);
            return createManualDataSelector(ps, newTypeId, selectedItemIds);
        }

        /**
         * Create a new list according to a given template
         * @param ps Private Services
         * @param {{type: *, views: Object[], items: (Object[]), displayName: (string)}} template
         * @returns {string} The created list ID
         * @throws Throws an error if no type is defined
         * @throws Throws an error if no views are defined
         */
        function createListFromTemplate(ps, template) {
            if (_.isEmpty(template.type)) {
                throw new Error(ERROR_TEMPLATE_TYPE_IS_NOT_VALID);
            }
            if (_.isEmpty(template.views)) {
                // TODO: check for real validity of each view ?
                throw new Error(ERROR_TEMPLATE_VIEWS_ARE_NOT_VALID);
            }

            var views = _.map(template.views, function (templateView) {
                return _.clone(templateView);
            });

            var newTypeId = typesDS.createType(ps, template.type);
            modifyViewsType(views, newTypeId);
            var newViewName = createViews(ps, views);
            var newItemIdsMap = createItemsWithType(ps, template.items, newTypeId);
            var newDataSelectorId = createDataSelectorFromTemplate(ps, template.dataSelector, newItemIdsMap, newTypeId);

            var listPartDef = {
                displayName: template.displayName,
                dataSelector: newDataSelectorId,
                type: newTypeId,
                viewName: newViewName
            };

            return listsDS.createList(ps, listPartDef);
        }

        /**
         * Changes the list's item view according to the item view from the given template
         * The template's view field refs will be changed to match the existing list's fields, according to their type
         * @param ps Private Services
         * @param {string} listId
         * @param {{type: *, views: Object[]}} template
         */
        function setItemViewFromTemplate(ps, listId, template) {
            if (_.isEmpty(template.type)) {
                throw new Error(ERROR_TEMPLATE_TYPE_IS_NOT_VALID);
            }
            if (_.isEmpty(template.views)) {
                throw new Error(ERROR_TEMPLATE_MISSING_ITEM_VIEW);
            }
            var existingTypeDef = listsDS.getType(ps, listId) || throwError(ERROR_TYPE_DOES_NOT_EXIST);

            var itemViews = _.filter(template.views, {forType: template.type.name});

            var viewsMatchingToType = wixappsBuilder.viewsTemplatesUtils.getMatchingViewsForType(itemViews, template.type, existingTypeDef);

            _.forEach(viewsMatchingToType, function (itemView) {
                listsDS.replaceItemView(ps, listId, itemView);
            });
        }

        return {
            generateTemplate: generateTemplate,
            createListFromTemplate: createListFromTemplate,
            setItemViewFromTemplate: setItemViewFromTemplate
        };
    });
