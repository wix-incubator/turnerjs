define(['lodash',
    'core/core/data/pathValidationUtil',
    'core/core/data/pointers/pointerGeneratorsRegistry'], function
    (_, pathValidationUtil, pointerGeneratorsRegistry) {
    "use strict";

    var NOT_FOUND = 0;
    var PARENT_FOUND = 1;
    var FOUND_AND_CORRECT = 2;

    function getItemInPath(json, path) {
        var object = json;
        _.forEach(path, function (pathPart) {
            if (_.isUndefined(object)) {
                return false;
            }
            object = object[pathPart];
        });
        return object;
    }

    /**
     *
     * @constructor DS.PointersCache
     */
    function PointersCache(siteData, json, fullJson) {
        this.initMyState();
        this.json = json;
        this.fullJson = fullJson;
        this.siteData = siteData;
        this.getItemInPath = getItemInPath.bind(null, json);
        this.fullJsonGetItemInPath = getItemInPath.bind(null, fullJson);
        this.validated = {};

        // uses the types registered in the dataPointers module.
        var types = pointerGeneratorsRegistry.getAllTypes();

        _.forOwn(types, function (typeDescription, typeName) {
            this.cache[typeName] = {};
            this.itemFinders[typeName] = typeDescription.findItemFunction;
            this.identityCheckers[typeName] = typeDescription.identityCheckFunction;
            this.identityCheckersCache[typeName] = {};
            if (typeDescription.isUsingDifferentNameSpaceForFull) {
                this.fullJsonCache[typeName] = {};
            }
            if (typeDescription.isExistInFullJson) {
                this.typesExistingInFullJson[typeName] = true;
            }
        }, this);
    }

    function checkPointerPathValidity(validatedKey, pointer, path, ignoreLastPartInPointerPath, json) {
        var valid = this.validated[validatedKey] || NOT_FOUND;

        if (ignoreLastPartInPointerPath) {
            return valid || (pathValidationUtil.validatePathExist(json, path, false) ? PARENT_FOUND : NOT_FOUND);
        }

        if (valid !== FOUND_AND_CORRECT) {
            var identityCheckers = this.identityCheckersCache[pointer.type];
            var identityChecker = identityCheckers[pointer.id];
            if (!identityChecker) {
                identityChecker = this.identityCheckers[pointer.type].bind(this, pointer.id);
                identityCheckers[pointer.id] = identityChecker;
            }
            valid = pathValidationUtil.validatePathExistsAndCorrect(json, path, identityChecker) ? FOUND_AND_CORRECT : NOT_FOUND;
        }

        return valid;
    }

    function findAndCachePathForPointer(pointer, typeCache, oldPath, getItemInPathFunction) {
        var foundPath = null;
        var itemFinder = this.itemFinders[pointer.type];
        if (itemFinder) {
            foundPath = itemFinder(this.siteData.getAllPossiblyRenderedRoots(), getItemInPathFunction, pointer);
            typeCache[pointer.id] = foundPath || oldPath;
        }
        return foundPath;
    }

    function getValidationIndex(pointer, isUsingFullJson) {
        var sep = isUsingFullJson ? '|' : ',';
        return pointer.id + sep + pointer.type;
    }

    PointersCache.prototype = {
        initMyState: function () {
            this.cache = {general: {}};
            this.fullJsonCache = {};
            this.itemFinders = {
                general: function () {
                    return null;
                } //we can't look for these, and we assume they don't move
            };
            this.identityCheckers = {
                general: function () {
                    return true;
                } //we assume they don't move..
            };
            this.identityCheckersCache = {};
            //TODO: find a way to get rid of this, the jsons should look the same
            //now we have only the pagesData on the full json
            this.typesExistingInFullJson = {};

        },

        getBoundCacheInstance: function (isUsingFullJson) {
            return {
                getPath: this.getPath.bind(this, isUsingFullJson),
                getPointer: this.getPointer.bind(this, isUsingFullJson),
                setPath: this.setPath.bind(this, isUsingFullJson),
                resetValidations: this.resetValidations.bind(this)
            };
        },

        setPath: function (isUsingFullJson, pointer, path) {
            if (path) {
                if (isUsingFullJson) {
                    this.fullJsonCache[pointer.type][pointer.id] = path;
                } else {
                    this.cache[pointer.type][pointer.id] = path;
                }
            }
        },

        getPath: function (isUsingFullJson, pointer, ignoreLastPartInValidation) {
            var isUsingFullCache = isUsingFullJson && this.fullJsonCache.hasOwnProperty(pointer.type);
            var cache = isUsingFullCache ? this.fullJsonCache : this.cache;
            //TODO (Alissa): find a better way.. :)
            var isLookingInFullJson = isUsingFullJson && this.typesExistingInFullJson.hasOwnProperty(pointer.type);
            var json = isLookingInFullJson ? this.fullJson : this.json;
            var getItemInPathFunction = isLookingInFullJson ? this.fullJsonGetItemInPath : this.getItemInPath;

            var typeCache = cache[pointer.type];
            if (!typeCache) {
                return null;
            }
            var path = typeCache[pointer.id];
            var ignoreLastPartInPointerPath = ignoreLastPartInValidation && _.isEmpty(pointer.innerPath);

            var index = getValidationIndex(pointer, isUsingFullCache);
            var valid = checkPointerPathValidity.call(this, index, pointer, path, ignoreLastPartInPointerPath, json);

            if (valid === NOT_FOUND) {
                //no point in looking, probably won't find it otherwise why ignore last part..
                path = ignoreLastPartInPointerPath ? null : findAndCachePathForPointer.call(this, pointer, typeCache, path, getItemInPathFunction);
                //so that we won't override the PARENT_FOUND
                valid = path ? FOUND_AND_CORRECT : (this.validated[index] || NOT_FOUND);
            }

            this.validated[index] = valid;

            if (path && pointer.innerPath) {
                path = path.concat(pointer.innerPath);
                if (!pathValidationUtil.validatePathExist(json, path, !ignoreLastPartInValidation)) {
                    return null;
                }
            }
            return path;
        },

        getPointer: function (isUsingFullJson, id, type, path, optionalComponentPointer) {
            var isUsingFullCache = isUsingFullJson && this.fullJsonCache[type];
            var typeCache = isUsingFullCache ? this.fullJsonCache[type] : this.cache[type];
            var pointer = {
                type: type,
                id: id
            };
            if (path) {
                if (!_.isEqual(typeCache[id], path)) {
                    this.validated[getValidationIndex(pointer, isUsingFullCache)] = NOT_FOUND;
                }
                typeCache[id] = path;
            }
            if (!typeCache[id]) {
                return null;
            }
            if (optionalComponentPointer) {
                pointer.component = optionalComponentPointer;
            }
            return pointer;
        },

        resetValidations: function () {
            this.validated = {};
        }
    };

    return PointersCache;

    /**
     * @typeDef {Object} jsonDataPointer
     * @property {String} type
     * @property {String} id
     */
});
