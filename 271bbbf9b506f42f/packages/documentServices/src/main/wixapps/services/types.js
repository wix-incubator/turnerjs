define(['lodash', 'utils', 'documentServices/wixapps/utils/pathUtils', 'documentServices/wixapps/utils/stringUtils'], function (_, utils, pathUtils, stringUtils) {
    'use strict';

    var FIELD_TYPE_ORDER = {
        'String': 1,
        'wix:Date': 2,
        'wix:RichText': 3,
        'String|AsPrice': 4,
        'wix:Image': 5,
        'wix:Video': 6,
        'String|AsButton': 7
    };

    var typeNameUnderscoreFormat = new RegExp('(.*)_\\d+$');

    /**
     * Performs an IN-PLACE sort the given type definition's fields, according to the FIELD_TYPE_ORDER map (title field will always be first).
     * @param typeDef
     */
    function reOrderFields(typeDef) {
        if (typeDef && typeDef.fields) {
            typeDef.fields = _.sortBy(typeDef.fields, function (field) {
                if (field.name === 'title') {
                    return Number.MIN_VALUE;
                }
                return FIELD_TYPE_ORDER[getFieldTypeKey(field)] || Number.MAX_VALUE;
            });
        }
    }

    /**
     * @param field
     * @returns {string} returns a field key built from its type and showAs metdata (for example: String|AsButton)
     */
    function getFieldTypeKey(field) {
        var showAsHint = field.metadata && field.metadata.showAsHint;
        return _.compact([field.type, showAsHint]).join('|');
    }

    function getType(ps, typeId) {
        var type = ps.dal.getByPath(pathUtils.getTypePath(typeId));
        reOrderFields(type);
        return type;
    }

    function getAllTypes(ps) {
        var allTypes = ps.dal.getByPath(pathUtils.getBaseTypesPath());
        _.forEach(allTypes, reOrderFields);
        return allTypes;
    }

    function addPathsForTypeItems(ps, typeId) {
        ps.dal.full.setByPath(pathUtils.getBaseItemsPath(typeId), {});
    }

    function getMaxSuffixIndex(typeName, allTypesNames) {
        var regex = new RegExp(typeName + '_(\\d+)$');
        var maxSuffixOfTypeName = _(allTypesNames)
            .map(function (name) {
                var match = regex.exec(name);
                return match ? _.parseInt(match[1]) : null;
            })
            .max();

        return Math.max(maxSuffixOfTypeName, 0) + 1;
    }

    function generateTypeName(ps, typeName) {
        var match = typeNameUnderscoreFormat.exec(typeName);
        var baseTypeName = match ? match[1] : typeName;
        var allTypesNames = ps.dal.getKeysByPath(pathUtils.getBaseTypesPath());
        var maxSuffixIndex = getMaxSuffixIndex(baseTypeName, allTypesNames);
        return baseTypeName + '_' + maxSuffixIndex;
    }

    function createType(ps, typeDef) {
        typeDef = typeDef || {};
        var newType = {};
        newType.name = generateTypeName(ps, typeDef.name || 'type');
        newType.displayName = replaceWithUniqueDisplayName(ps, typeDef.displayName || newType.name);
        newType.version = 0;
        newType.baseTypes = typeDef.baseTypes || [];
        newType.fields = typeDef.fields || [];
        ps.dal.full.setByPath(pathUtils.getTypePath(newType.name), newType);
        addPathsForTypeItems(ps, newType.name);
        return newType.name;
    }

    function replaceWithUniqueDisplayName(ps, originalDisplayName) {
        var existingDisplayNames = _.pluck(getAllTypes(ps), 'displayName');
        var uniqueDisplayName = originalDisplayName;
        while (_.includes(existingDisplayNames, uniqueDisplayName)) {
            uniqueDisplayName = stringUtils.incNumberSuffix(uniqueDisplayName);
        }
        return uniqueDisplayName;
    }

    return {
        /**
         * Returns a type definition
         * @param ps Private Services
         * @param {string} id Type definition ID
         * @returns {Object} The type definition object with the requested ID
         */
        getType: getType,


        /**
         * Returns all type definitions
         * @param ps Private Services
         * @returns {Object} The type definitions
         */
        getAllTypes: getAllTypes,


        /**
         * Create a new type according to a given type definition
         * @param ps Private Services
         * @param {Object} typeDef
         * @returns {string} the new type's ID
         */
        createType: createType
    };
});
