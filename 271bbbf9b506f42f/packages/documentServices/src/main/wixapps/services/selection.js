define([
    'lodash',
    'utils',
    'documentServices/wixapps/utils/pathUtils',
    'documentServices/wixapps/services/types'
], function (_, utils, pathUtils, types) {
    'use strict';

    var ERROR_TYPE_DOES_NOT_EXIST = 'Type does not exist';
    var ERROR_SELECTOR_DOES_NOT_EXIST = 'Selector does not exist';

    var dataSelectorsTranslationMap = {
        "IB.ManualSelectedList": "ManualSelectedList"
    };

    function throwError(errorMessage) {
        throw new Error(errorMessage);
    }

    function getDataSelector(ps, dataSelectorId) {
        return ps.dal.getByPath(pathUtils.getDataSelectorPath(dataSelectorId));
    }

    function isArrayOfStrings(itemIds) {
        return _.isArray(itemIds) && _.every(itemIds, function (item) {
                return _.isString(item);
            });
    }

    function filterNonExistingItems(ps, type, itemIds) {
        var existingItemsOfType = ps.dal.getByPath(pathUtils.getBaseItemsPath(type)) || {};
        return _.intersection(itemIds, _.pluck(existingItemsOfType, '_iid'));
    }

    /**
     * Get a data selector definition by its ID
     * @param ps Private Services
     * @param {string} dataSelectorId
     * @returns {Object} The requested data selector definition
     */
    function getSelector(ps, dataSelectorId) {
        var dataSelector = getDataSelector(ps, dataSelectorId);
        if (dataSelector) {
            var returnValue = _.omit(dataSelector, ['dataProviderId', 'forType', 'logicalTypeName']);
            returnValue.type = dataSelectorsTranslationMap[dataSelector.logicalTypeName];
            return returnValue;
        }
    }

    /**
     * Set a selector as manual with given item IDs
     * @param ps Private Serices
     * @param {string} dataSelectorId
     * @param {string[]} itemIds
     * @throws Throws an error if the data selector does not exist
     */
    function setManualSelector(ps, dataSelectorId, itemIds) {
        if (!isArrayOfStrings(itemIds)) {
            throw new Error("itemsId must be an array of strings.");
        }
        var dataSelector = getDataSelector(ps, dataSelectorId) || throwError(ERROR_SELECTOR_DOES_NOT_EXIST);
        dataSelector.itemIds = filterNonExistingItems(ps, dataSelector.forType, itemIds);
        dataSelector.logicalTypeName = 'IB.ManualSelectedList';
        ps.dal.full.setByPath(pathUtils.getDataSelectorPath(dataSelectorId), dataSelector); // TODO: merge instead of set ?
    }

    /**
     * Create a new data selector with a given type
     * @param ps Private Services
     * @param {string} typeId
     * @returns {string} ID of the created data selector
     * @throws Throws an error if the type does not exist
     */
    function createSelector(ps, typeId) {
        if (!types.getType(ps, typeId)) {
            throwError(ERROR_TYPE_DOES_NOT_EXIST);
        }
        var dataSelector = {
            id: 'dataSelector_' + utils.guidUtils.getUniqueId(),
            forType: typeId
        };
        ps.dal.full.setByPath(pathUtils.getDataSelectorPath(dataSelector.id), dataSelector);
        return dataSelector.id;
    }

    /**
     * Deletes an item from all of the manual data selectors
     * @param ps Private Services
     * @param {string} itemId
     */
    function deleteItemFromAllManualDataSelectors(ps, itemId) {
        var dataSelectors = ps.dal.getByPath(pathUtils.getBaseDataSelectorsPath());
        _(dataSelectors)
            .filter({logicalTypeName: 'IB.ManualSelectedList'})
            .forEach(function (selector) {
                var newItemIds = _.reject(selector.itemIds, function (id) {return id === itemId; });
                if (newItemIds.length !== selector.itemIds.length) {
                    setManualSelector(ps, selector.id, newItemIds);
                }
            }).value();
    }

    return {
        getSelector: getSelector,
        setManualSelector: setManualSelector,
        createSelector: createSelector,
        deleteItemFromAllManualDataSelectors: deleteItemFromAllManualDataSelectors
    };
});
