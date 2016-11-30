define(['lodash', 'utils', 'core/core/data/pathValidationUtil'], function (_, utils, pathValidation) {
    'use strict';

    var cloneDeep = utils.objectUtils.cloneDeep;

    function isPathExist(json, path, shouldValidatePathList) {
        return pathValidation.validatePathExist(json, path, shouldValidatePathList);
    }

    function removeValueInPath(json, path) {
        var clonedPath = [].concat(path);
        var keyOrIndexToDelete = clonedPath.pop();
        var parentValue = _.get(json, clonedPath);

        if (_.isString(keyOrIndexToDelete)) {
            delete parentValue[keyOrIndexToDelete];
        } else {
            parentValue.splice(keyOrIndexToDelete, 1);
        }
    }

    var DisplayedJsonDal = function (jsonData, pointersCache) {
        this.pointersCache = pointersCache;
        this.jsonData = jsonData;
    };

    DisplayedJsonDal.prototype = {
        get: function (pointer) {
            var path = this.pointersCache.getPath(pointer);
            return this.getByPath(path);
        },
        getByPath: function (path) {
            if (path) {
                return cloneDeep(_.get(this.jsonData, path));
            }
            return undefined; //this is what the other dal returns :)
        },
        set: function (pointer, data) {
            var path = this.pointersCache.getPath(pointer, true);
            this.setByPath(path, data);
        },
        setByPath: function (path, data) {
            if (!_.isArray(path)) {
                throw new Error('path type is not an array - ' + path);
            }

            _.set(this.jsonData, path, cloneDeep(data));
        },
        isExist: function (pointer) {
            var path = this.pointersCache.getPath(pointer);
            return !!path;
        },
        isPathExist: function (path) {
            return isPathExist(this.jsonData, path, true);
        },
        merge: function (pointer, obj) {
            if (this.isExist(pointer)) {
                var pointerPath = this.pointersCache.getPath(pointer);
                this.mergeByPath(pointerPath, obj);
            }
        },
        mergeByPath: function (pathToObject, obj) {
            if (isPathExist(this.jsonData, pathToObject, true) && _.isPlainObject(obj)) {
                var value = this.getByPath(pathToObject);
                var mergedData = _.assign({}, value, obj);
                this.setByPath(pathToObject, mergedData);
                this.pointersCache.resetValidations();
            } else if (!_.isPlainObject(obj)) {
                throw new Error(obj + ' is not an object');
            }
        },
        push: function (pointerToArray, item, pointerToPush, index) {
            if (!this.isExist(pointerToArray)) {
                throw new Error(JSON.stringify(pointerToArray) + ' path does not exist');
            }

            var arrayPath = this.pointersCache.getPath(pointerToArray);
            var arrayData = this.getByPath(arrayPath);

            if (!_.isUndefined(index) && !_.isNumber(index)) {
                throw new Error('push index arguments should be a numbert');
            }
            index = _.isNumber(index) ? index : arrayData.length;

            this.pushByPath(arrayPath, item, index);

            if (pointerToPush) {
                var pathToNewItem = arrayPath.concat(index);
                this.pointersCache.setPath(pointerToPush, pathToNewItem);
            }
        },
        pushByPath: function (pathToArray, item, index) {
            var dataArray = this.getByPath(pathToArray);

            index = _.isNumber(index) ? index : dataArray.length;
            if (index > dataArray.length || index < 0) {
                throw new Error('Index out of bound');
            }

            if (index === 0) {
                dataArray.unshift(item);
            } else {
                dataArray.splice(index, 0, item);
            }

            this.setByPath(pathToArray, dataArray);
            this.pointersCache.resetValidations();
        },
        remove: function (pointer) {
            if (!this.isExist(pointer)) {
                throw new Error(pointer + ' pointer does not exist');
            }
            var path = this.pointersCache.getPath(pointer);
            this.removeByPath(path);
        },
        removeByPath: function (path) {
            if (!path) {
                throw new Error('path is not valid');
            }
            removeValueInPath(this.jsonData, path);
            this.pointersCache.resetValidations();
        },

        getKeys: function (pointer) {
            var path = this.pointersCache.getPath(pointer);
            if (!path) {
                return undefined;
            }
            return this.getKeysByPath(path);
        },

        getKeysByPath: function (path) {
            pathValidation.validatePath(path, this.jsonData);
            var valueInPath = _.get(this.jsonData, path);
            if (!_.isPlainObject(valueInPath)) {
                throw new Error("Can not get keys of an element that isn't a plain object");
            }
            return _.keys(valueInPath);
        }
    };

    return DisplayedJsonDal;
});
