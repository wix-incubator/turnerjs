define([
    'lodash',
    'utils',
    'wixappsBuilder',
    'documentServices/wixapps/utils/linksConverter',
    'documentServices/wixapps/utils/pathUtils',
    'documentServices/wixapps/utils/timeUtils',
    'documentServices/wixapps/services/types',
    'documentServices/wixapps/services/selection'
], function (_, utils, wixappsBuilder, linksConverter, pathUtils, timeUtils, types, selection) {
    'use strict';

    var ERROR_TYPE_DOES_NOT_EXIST = 'Type does not exist';
    var ERROR_ITEM_DOES_NOT_MATCH_SCHEMA = 'Item does not match schema';
    var ERROR_ITEM_DOES_NOT_EXIST = 'Item does not exist';
    var ERROR_DELETED_ITEM_DOES_NOT_EXIST = 'Deleted item does not exist';

    var STATES = {
        DRAFT: 'Draft',
        SAVED: 'Saved',
        PUBLISHED: 'Published',
        MODIFIED: 'Modified'
    };

    function throwError(errorMessage) {
        throw new Error(errorMessage);
    }


    function convertLinks(links, convertFunc) {
        if (!_.isObject(links)) {
            return links;
        }
        var mapFunc = _.isArray(links) ? _.map : _.mapValues;
        return mapFunc(links, function (link) {
            return _.isObject(link) ? convertFunc(link) : link;
        });
    }

    function convertItemLinks(item, convertFunc) {
        var convertedItem = item;
        if (_.has(item, 'links')) {
            convertedItem = _.clone(item);
            convertedItem.links = convertLinks(item.links, convertFunc);
        }
        _.forEach(convertedItem, function(fieldValue, fieldName) {
            if (_.has(fieldValue, 'links')) {
                convertedItem[fieldName] = _.clone(fieldValue);
                convertedItem[fieldName].links = convertLinks(fieldValue.links, convertFunc);
            }
        });
        return convertedItem;
    }

    function convertToWixFormat(ps, item) {
        return convertItemLinks(item, _.partial(linksConverter.convertWixappsDataToWLink, ps));
    }

    function convertToWixappsFormat(item) {
        return convertItemLinks(item, linksConverter.convertWLinkToWixappsData);
    }

    /**
     * Get an object with default values for the given type definition
     * @param ps Private Services
     * @param typeId
     * @returns {Object} An item with the default field values set
     * @throws Throws an error if the type does not exist
     */
    function getDefaultItem(ps, typeId) {
        var defaultItem = {};
        var typeDef = types.getType(ps, typeId) || throwError(ERROR_TYPE_DOES_NOT_EXIST);
        _.forEach(typeDef.fields, function (field) {
            if (!_.isUndefined(field.defaultValue)) {
                defaultItem[field.name] = _.clone(field.defaultValue);
            }
        });
        return defaultItem;
    }

    /**
     * Check if item fields are part of its a type definition
     * @param ps Private Services
     * @param typeId
     * @param partialItem
     * @returns {boolean} true if all keys in partialItem are valid fields or false otherwise
     * @throws Throws an error if the type does not exist
     */
    function areFieldsAssignable(ps, typeId, partialItem) {
        var typeDef = types.getType(ps, typeId) || throwError(ERROR_TYPE_DOES_NOT_EXIST);
        var validFields = _.pluck(_.filter(typeDef.fields, isAssignableField), 'name');
        var itemFields = _.keys(partialItem);
        var invalidFields = _.difference(itemFields, validFields);
        return invalidFields.length === 0;
    }

    /**
     * Check if a field can be assigned with a value
     * @param field
     * @returns {boolean}
     */
    function isAssignableField(field) {
        return _.isUndefined(field.computed) || !field.computed;
    }

    /**
     * Get an item with no conversions
     * @param ps Private Services
     * @param {string} typeId
     * @param {string} itemId
     * @returns {Object} the requested item
     */
    function getRawItem(ps, typeId, itemId) {
        return ps.dal.getByPath(pathUtils.getItemPath(typeId, itemId));
    }

    function fixImageData(serviceTopology, item) {
        return _.mapValues(item, function (fieldValue) {
            return fieldValue._type === 'wix:Image' ? wixappsBuilder.resolveImageData(fieldValue, serviceTopology) : fieldValue;
        });
    }

    /**
     * Get all items of a given type
     * @param ps Private Services
     * @param {string} typeId
     * @returns {Object|{}} map of items of the given type
     */
    function getAllItemsOfType(ps, typeId) {
        var serviceTopology = ps.dal.get(ps.pointers.general.getServiceTopology());
        var items = ps.dal.getByPath(pathUtils.getBaseItemsPath(typeId)) || {};
        return _(items)
            .mapValues(_.partial(fixImageData, serviceTopology))
            .mapValues(_.partial(convertToWixFormat, ps))
            .value();
    }

    function setAllItemsOfType(ps, typeId, items) {
        ps.dal.full.setByPath(pathUtils.getBaseItemsPath(typeId), items);
    }

    function getDefaults(newItemId, typeId, now) {
        return {
            _iid: newItemId,
            _type: typeId,
            _createdAt: now,
            _updatedAt: now,
            _state: STATES.DRAFT
        };
    }

    /**
     * Creates a new item
     * @param ps Private Services
     * @param {string} typeId
     * @param {Object} [item] optional item data
     * @returns {string} ID of the created item
     * @throws Throws an error if the provided item fields do not fit the type schema
     */
    function createItem(ps, typeId, item) {
        var newItemId = utils.guidUtils.getUniqueId();
        var now = timeUtils.getCurrentTime(ps);
        var genericDefaults = getDefaults(newItemId, typeId, now);
        var newItem = _.omit(_.cloneDeep(item) || {}, _.keys(genericDefaults).concat('_permissions'));
        newItem = convertToWixappsFormat(newItem);

        if (!areFieldsAssignable(ps, typeId, newItem)) {
            throw new Error(ERROR_ITEM_DOES_NOT_MATCH_SCHEMA);
        }

        newItem = _.assign(getDefaultItem(ps, typeId), newItem, genericDefaults);
        ps.dal.full.setByPath(pathUtils.getItemPath(typeId, newItem._iid), newItem);
        return newItemId;
    }

    /**
     * Update an existing item
     * @param ps Private Services
     * @param {string} typeId
     * @param {string} itemId
     * @param {Object} fieldsToUpdate - an object with key/value pairs that should be updated
     * @throws Throws an error if the provided item fields do not fit the type schema
     */
    function updateItem(ps, typeId, itemId, fieldsToUpdate) {
        if (!areFieldsAssignable(ps, typeId, fieldsToUpdate)) {
            throw new Error(ERROR_ITEM_DOES_NOT_MATCH_SCHEMA);
        }
        fieldsToUpdate = convertToWixappsFormat(fieldsToUpdate);

        var existingItem = getRawItem(ps, typeId, itemId) || throwError(ERROR_ITEM_DOES_NOT_EXIST);
        _.forOwn(fieldsToUpdate, function(fieldUpdate, fieldKey) {
            existingItem[fieldKey] = _.defaults(fieldUpdate, existingItem[fieldKey]);
        });
        existingItem._updatedAt = timeUtils.getCurrentTime(ps);
        if (existingItem._state === STATES.PUBLISHED) {
            existingItem._state = STATES.MODIFIED;
        }
        ps.dal.full.setByPath(pathUtils.getItemPath(typeId, itemId), existingItem);
    }

    /**
     * Delete an item (set _deletedAt and move it to the deletedItems store)
     * @param ps Private Services
     * @param {string} typeId
     * @param {string} itemId
     * @throws Throws an error if the item does not exist
     */
    function deleteItem(ps, typeId, itemId) {
        if (!getRawItem(ps, typeId, itemId)) {
            throwError(ERROR_ITEM_DOES_NOT_EXIST);
        }
        //item._deletedAt = timeUtils.getCurrentTime();
        ps.dal.full.removeByPath(pathUtils.getItemPath(typeId, itemId));
        selection.deleteItemFromAllManualDataSelectors(ps, itemId);
    }

    /**
     * Restore an item (move it to the items store and unset _deletedAt)
     * @param ps Private Services
     * @param {string} typeId
     * @param {string} itemId
     * @throws Throws an error if the item does not exist
     */
    function restoreItem(ps, typeId, itemId) {
        var deletedItem = ps.dal.getByPath(pathUtils.getDeletedItemPath(typeId, itemId)) || throwError(ERROR_DELETED_ITEM_DOES_NOT_EXIST);
        delete deletedItem._deletedAt;
        ps.dal.full.removeByPath(pathUtils.getDeletedItemPath(typeId, itemId));
        ps.dal.full.setByPath(pathUtils.getItemPath(typeId, itemId), deletedItem);
    }

    return {
        STATES: STATES,
        createItem: createItem,
        updateItem: updateItem,
        deleteItem: deleteItem,
        restoreItem: restoreItem,
        setAllItemsOfType: setAllItemsOfType,
        getAllItemsOfType: getAllItemsOfType
    };
});
