define(['lodash'], function(_){
    'use strict';

    function validatePath(path, json, validateValueInPathExist) {
        if (!_.isArray(path)) {
            throw new Error('path type is not an array - ' + path);
        }
        if (!isPathExist(json, path, validateValueInPathExist)) {
            throw new Error('path does not exist - ' + path);
        }
        return true;
    }

    function validatePathExistsAndCorrect(json, path, itemValidationPredicate){
        if (!path){
            return false;
        }
        var item = getItemInPath(json, path, path.length);
        if (_.isUndefined(item)){
            return false;
        }
        return !itemValidationPredicate || itemValidationPredicate(item);
    }

    function isPathExist(json, path, validateValueInPathExist) {
        var pathSuffix = path[path.length - 1];
        var pathLengthToValidate = validateValueInPathExist ? path.length : path.length - 1;
        var item = getItemInPath(json, path, pathLengthToValidate);
        if (_.isUndefined(item)){
            return false;
        }
        return validateValueInPathExist ? true : validatePathSuffix(pathSuffix, item);
    }

    function getItemInPath(json, path, pathLengthToValidate){
        var item = json;
        for (var i = 0; i < pathLengthToValidate; i++) {
            item = item[path[i]];
            if (_.isUndefined(item)) {
                break;
            }
        }
        return item;
    }

    function validatePathSuffix(pathSuffix, jsonEntry) {
        if (_.isNumber(pathSuffix)) {
            return _.isArray(jsonEntry);
        }
        if (_.isString(pathSuffix)) {
            return isPlainObject(jsonEntry);
        }
        return false;
    }

    function isPlainObject(collection) {
        return Object.prototype.toString.call(collection) === "[object Object]";
    }

    return {
        validatePath: validatePath,
        validatePathExist: isPathExist,
        validatePathExistsAndCorrect: validatePathExistsAndCorrect
    };
});
