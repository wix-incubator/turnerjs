define(['lodash', 'utils',
    'core/core/data/pointers/pointerGeneratorsRegistry'], function(_, utils, pointerGeneratorsRegistry) {
    "use strict";

    var constants = utils.constants;
    var masterPageId = 'masterPage';

    var types = constants.DATA_TYPES;

    function checkIdentity(){
        return true;
    }

    function findDataItem(type, currentRootIds, getItemInPath, dataPointer) {
        var typeKey = getTypeKey(type);
        var pagesData = getItemInPath(['pagesData']);

        return _.reduce(pagesData, function (currentPath, page, pageId) {
            var newPath = getPageDataPath(type, pageId, typeKey).concat(dataPointer.id);
            if (!currentPath && getItemInPath(newPath)) {
                return newPath;
            }

            return currentPath;
        }, null);
    }

    function getTypeKey(type) {
        switch (type) {
            case types.data:
                return 'document_data';
            case types.design:
                return 'design_data';
            case types.prop:
                return 'component_properties';
            case types.theme:
                return 'theme_data';
            case types.behaviors:
                return 'behaviors_data';
            case types.connections:
                return 'connections_data';
            default:
                throw new Error("there is no such data type " + type);
        }
    }

    function getPageDataPath(type, pageId, typeKey){
        return ['pagesData', pageId, 'data', typeKey || getTypeKey(type)];
    }

    // registering the pointer type finding items methods, to a registry for the pointersCache to use it when resolving.
    pointerGeneratorsRegistry.registerPointerType(types.data, findDataItem.bind(null, types.data), checkIdentity, false, true);
    pointerGeneratorsRegistry.registerPointerType(types.prop, findDataItem.bind(null, types.prop), checkIdentity, false, true);
    pointerGeneratorsRegistry.registerPointerType(types.design, findDataItem.bind(null, types.design), checkIdentity, false, true);
    pointerGeneratorsRegistry.registerPointerType(types.theme, findDataItem.bind(null, types.theme), checkIdentity, false, true);
    pointerGeneratorsRegistry.registerPointerType(types.behaviors, findDataItem.bind(null, types.behaviors), checkIdentity, false, true);
    pointerGeneratorsRegistry.registerPointerType(types.connections, findDataItem.bind(null, types.connections), checkIdentity, false, true);

    var getterFunctions = {
        getDataItem: function(getItemAtPath, cache, dataItemId, pageId){
            return this.getItem(getItemAtPath, cache, types.data, dataItemId, pageId);
        },

        getDataItemWithPredicate: function(getItemAtPath, cache, predicate, pageId){
            return _.first(this.getDataItemsWithPredicate(getItemAtPath, cache, predicate, pageId));
        },

        getDataItemsWithPredicate: function(getItemAtPath, cache, predicate, pageId){
            var pId = pageId || 'masterPage';
            var path = getPageDataPath(types.data, pId);
            var items = getItemAtPath(path);
            return _.map(_.filter(items, predicate), function(item){
                return this.getDataItem(getItemAtPath, cache, item.id, pId);
            }, this);
        },

        getDesignItem: function(getItemAtPath, cache, designItemId, pageId, optionalComponentPointer){
            return this.getItem(getItemAtPath, cache, types.design, designItemId, pageId, optionalComponentPointer);
        },

        getPropertyItem: function(getItemAtPath, cache, propertyItemId, pageId, optionalComponentPointer){
            return this.getItem(getItemAtPath, cache, types.prop, propertyItemId, pageId, optionalComponentPointer);
        },

        getBehaviorsItem: function(getItemAtPath, cache, behaviorsItemId, pageId) {
            return this.getItem(getItemAtPath, cache, types.behaviors, behaviorsItemId, pageId);
        },

        getConnectionsItem: function(getItemAtPath, cache, connectionItemId, pageId) {
            return this.getItem(getItemAtPath, cache, types.connections, connectionItemId, pageId);
        },

        getThemeItem: function(getItemAtPath, cache, id){
            return this.getItem(getItemAtPath, cache, types.theme, id, masterPageId);
        },

        getItem: function(getItemAtPath, cache, type, id, pageId, optionalComponentPointer){
            var path = getPageDataPath(type, pageId);
            path.push(id);
            return cache.getPointer(id, type, path, optionalComponentPointer);
        },

        getDataItemFromMaster: function(getItemAtPath, cache, id){
            return this.getDataItem(getItemAtPath, cache, id, masterPageId);
        },

        getPageIdOfData: function(getItemAtPath, cache, pointer){
            var path = cache.getPath(pointer);
            return path[1];
        }
    };

    pointerGeneratorsRegistry.registerDataAccessPointersGenerator('data', getterFunctions);

    //return {
    //    types: types
    //};
});
