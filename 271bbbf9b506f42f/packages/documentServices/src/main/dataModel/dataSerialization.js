define([
    'lodash',
    'utils',
    'documentServices/dataModel/dataValidators',
    'documentServices/dataModel/dataIds',
    'documentServices/dataModel/DataSchemas.json',
    'documentServices/dataModel/PropertiesSchemas.json',
    'documentServices/dataModel/DesignSchemas.json',
    'documentServices/dataModel/BehaviorsSchemas.json',
    'documentServices/dataModel/ConnectionSchemas.json',
    'documentServices/dataModel/StyleSchemas'], function
    (_,
     utils,
     dataValidators,
     dataIds,
     dataSchemas,
     propertiesSchemas,
     designSchemas,
     behaviorsSchemas,
     connectionsSchemas,
     StyleSchemas) {
    'use strict';

    var DATA_TYPES = utils.constants.DATA_TYPES;

    var dataItemTypeToSchema = {
        data: dataSchemas,
        props: propertiesSchemas,
        style: StyleSchemas,
        behaviors: behaviorsSchemas,
        connections: connectionsSchemas
    };

    dataItemTypeToSchema.design = designSchemas;

    function addSerializedDataItemToPage(ps, pageId, dataItem, customId) {
        return deserializeDataItemAndAddToDAL(ps, pageId, dataItem, customId, DATA_TYPES.data);
    }

    function addSerializedPropertyItemToPage(ps, pageId, dataItem, customId, componentPointer) {
        return deserializeDataItemAndAddToDAL(ps, pageId, dataItem, customId, DATA_TYPES.prop, componentPointer);
    }

    function addSerializedStyleItemToPage(ps, dataItem, customId) {
        return deserializeDataItemAndAddToDAL(ps, 'masterPage', dataItem, customId, DATA_TYPES.theme);
    }

    function addSerializedDesignItemToPage(ps, pageId, dataItem, customId, componentPointer) {
        return deserializeDataItemAndAddToDAL(ps, pageId, dataItem, customId, DATA_TYPES.design, componentPointer);
    }

    function addSerializedBehaviorsItemToPage(ps, pageId, dataItem, customId) {
        return deserializeDataItemAndAddToDAL(ps, pageId, dataItem, customId, DATA_TYPES.behaviors);
    }

    function addSerializedConnectionsItemToPage(ps, pageId, dataItem, customId) {
        return deserializeDataItemAndAddToDAL(ps, pageId, dataItem, customId, DATA_TYPES.connections);
    }

    function deserializeDataItemAndAddToDAL(ps, pageId, serializedDataItem, dataItemId, itemType, optionalCompPointer) {
        return deserializeDataItemAndAddToDALWithRefPath(ps, pageId, serializedDataItem, dataItemId, itemType, optionalCompPointer);
    }

    function deserializeDataItemAndAddToDALWithRefPath(ps, pageId, serializedDataItem, dataItemId, itemType, optionalCompPointer) {
        var deserializedItems = [];
        var deserializedItemId = deserializeDataItemOriginal(ps, pageId, serializedDataItem, dataItemId, itemType, optionalCompPointer, deserializedItems);
        var rootToLeavesOrderedDeserializedDTOs = deserializedItems.reverse();
        setDeserializedItemsToDAL(ps, rootToLeavesOrderedDeserializedDTOs);
        return deserializedItemId;
    }

    function setDeserializedItemsToDAL(ps, deserializedItemDTOs) {
        var compPointer = null;
        for (var i = 0; i < deserializedItemDTOs.length; i++) {
            var deserializedItemDTO = deserializedItemDTOs[i];
            var pointer = deserializedItemDTO.pointer;
            if (!compPointer && pointer.component) {
                compPointer = pointer.component;
            }
            pointer.component = compPointer;
            pointer.refPath = deserializedItemDTO.refPath;
            var item = deserializedItemDTO.item;
            ps.dal.set(pointer, item);
        }
    }

    function deserializeDataItemOriginal(ps, pageId, serializedDataItem, dataItemId, itemType, optionalCompPointer, deserializedItems, refPath) {
        refPath = refPath || [];
        var deserializedDataItem = deserializeDataItemInner(ps, pageId, serializedDataItem, dataItemId, itemType, deserializeDataItemOriginal, deserializedItems, refPath);
        _.set(deserializedDataItem, 'metaData.isPreset', false);
        var itemPointer;
        itemPointer = ps.pointers.data.getItem(itemType, deserializedDataItem.id, pageId, optionalCompPointer);
        dataValidators.validateDataBySchema(deserializedDataItem, itemType);
        deserializedItems.push({pointer: itemPointer, item: deserializedDataItem, refPath: refPath});
        return deserializedDataItem.id;
    }

    function deserializeDataItemInner(ps, pageId, serializedDataItem, dataItemId, itemType, handleRefItem, deserializedItems, refPath) {
        var itemId = dataItemId || dataIds.generateNewId(itemType);
        var dataItemInDAL = {};
        var deserializedDataItem = {id: itemId};
        var updatedItemPointer = ps.pointers.data.getItem(itemType, itemId, pageId);
        if (ps.dal.isExist(updatedItemPointer)) {
            dataItemInDAL = ps.dal.get(updatedItemPointer);
        }
        serializedDataItem.type = serializedDataItem.type || _.get(dataItemInDAL, 'type');
        var schema = dataItemTypeToSchema[itemType][serializedDataItem.type];
        if (!schema) {
            throw new Error("missing schema (dataItemType) for the given data item");
        }

        function deserializeProp(key, value) {
            if (handleRefItem) {
                return '#' + handleRefItem(ps, pageId, value, value.id, itemType, null, deserializedItems, refPath.concat(key));
            }
            return '#' + (value.id || dataIds.generateNewId(itemType));
        }

        _.forOwn(serializedDataItem, function (value, key) {
            if (_.isPlainObject(value) && isOfType(schema, key, 'ref', dataItemTypeToSchema[itemType])) {
                deserializedDataItem[key] = deserializeProp(key, value);

            } else if (isOfType(schema, key, 'refList', dataItemTypeToSchema[itemType])) {
                deserializedDataItem[key] = _.map(value, deserializeProp.bind(null, key));

            } else if (key !== 'id') {
                deserializedDataItem[key] = value;
            }
        });

        if (shouldMergeDataItems(dataItemInDAL, deserializedDataItem)) {
            deserializedDataItem = _.assign(dataItemInDAL, deserializedDataItem);
        }

        addDefaultMetaData(deserializedDataItem);

        return deserializedDataItem;
    }

    function shouldMergeDataItems(existingDataItem, newDataItem) {
        return !existingDataItem.type || !newDataItem.type || _.isEqual(existingDataItem.type, newDataItem.type);
    }

    function deserializeDataItem(ps, serializedDataItem, itemType) {
        return deserializeDataItemInner(ps, null, serializedDataItem, serializedDataItem.id, itemType);
    }

    function addDefaultMetaData(newDataItem) {
        var defaultsMetaData = {isPreset: false, schemaVersion: '1.0', isHidden: false};
        newDataItem.metaData = _.assign(defaultsMetaData, newDataItem.metaData);
    }

    function serializeDataItem(ps, schemas, dataItemPointer, deleteId) {
        if (!ps.dal.full.isExist(dataItemPointer)) {
            return undefined;
        }

        var dataItem = ps.dal.full.get(dataItemPointer);

        if (deleteId) {
            delete dataItem.id;
        }

        var pageId = ps.pointers.data.getPageIdOfData(dataItemPointer);
        var schema = schemas && schemas[dataItem.type];

        function serializeRef(ref, dataType) {
            var pointer = getRefPointer(ps, ref, pageId, dataType);
            return serializeDataItem(ps, schemas, pointer, deleteId);
        }

        _.forOwn(dataItem, function (value, key) {
            if (value && isOfType(schema, key, 'ref', schemas)) {
                dataItem[key] = serializeRef(value, dataItemPointer.type);
            } else if (value && isOfType(schema, key, 'refList', schemas)) {
                dataItem[key] = _.compact(_.map(value, function (ref) {
                    return serializeRef(ref, dataItemPointer.type);
                }));
            }
        });

        return dataItem;
    }

    function getRefPointer(ps, value, pageId, dataType) {
        var itemId = value && _.isString(value) && utils.stringUtils.startsWith(value, '#') && value.replace('#', '');
        if (dataType === DATA_TYPES.data) {
            return ps.pointers.data.getDataItem(itemId, pageId);
        }
        return ps.pointers.data.getDesignItem(itemId, pageId);
    }

    function getPropertyDefinition(schema, propertyKey, schemas) {
        if (!schema) {
            return null;
        }

        if (schema.$ref) {
            var refSchema = schemas[schema.$ref];
            return getPropertyDefinition(refSchema, propertyKey, schemas);
        }

        if (schema.properties) {
            return schema.properties[propertyKey];
        }

        if (schema.allOf) {
            var dataType = _.find(schema.allOf, function (innerSchema) {
                return getPropertyDefinition(innerSchema, propertyKey, schemas);
            });

            return dataType && getPropertyDefinition(dataType, propertyKey, schemas);
        }
    }

    function isOfType(schema, propertyKey, expectedType, schemas) {
        var propertyDefinition = getPropertyDefinition(schema, propertyKey, schemas);
        if (!propertyDefinition || _.isString(propertyDefinition)) {
            return propertyDefinition && propertyDefinition === expectedType || false;
        }
        if (expectedType === 'list') {
            expectedType = 'array';
        }
        return !!(_.includes(propertyDefinition.pseudoType, expectedType) || _.includes(propertyDefinition.type, expectedType) || propertyDefinition.type === expectedType);
    }

    function executeForDataItemRefs(schemas, dataItem, callback) {
        var schema = schemas[dataItem.type];
        if (schema) {
            _.forOwn(dataItem, function (value, key) {
                if (isOfType(schema, key, 'ref', schemas)) {
                    return callback(value);
                } else if (isOfType(schema, key, 'refList', schemas)) {
                    return _.map(value, function (refItem) {
                        return callback(refItem);
                    });
                }
            });
        }
    }

    return {
        addSerializedStyleItemToPage: addSerializedStyleItemToPage,
        addSerializedDataItemToPage: addSerializedDataItemToPage,
        addSerializedPropertyItemToPage: addSerializedPropertyItemToPage,
        addSerializedDesignItemToPage: addSerializedDesignItemToPage,
        addSerializedBehaviorsItemToPage: addSerializedBehaviorsItemToPage,
        addSerializedConnectionsItemToPage: addSerializedConnectionsItemToPage,
        deserializeDataItem: deserializeDataItem,
        serializeDataItem: serializeDataItem,
        executeForDataItemRefs: executeForDataItemRefs,
        isOfType: isOfType
    };
});
