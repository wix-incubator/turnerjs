define(["lodash"], function (_) {
    'use strict';

    function getDataItemTypeName (dataItem) {
        if (_.isUndefined(dataItem)) {
            return "undefined";
        }

        if (_.isNull(dataItem)) {
            return "null";
        }

        if (dataItem._type) {
            return dataItem._type;
        }

        if (_.isString(dataItem)) {
            return "String";
        }

        if (_.isNumber(dataItem)) {
            return "Number";
        }

        if (_.isBoolean(dataItem)) {
            return "Boolean";
        }

        if (_.isArray(dataItem)) {
            return "Array";
        }

        if (_.isPlainObject(dataItem)) {
            return "wix:Object";
        }

        throw "Error:: Unable to resolve typeName for dataItem [ " + JSON.stringify(dataItem) + " ]";
    }

    /**
     * @class wixappsCore.typeNameResolver
     */
    return {
        getDataItemTypeName: getDataItemTypeName
    };
});
