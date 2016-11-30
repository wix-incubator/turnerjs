define(['lodash', 'utils', 'documentServices/dataAccessLayer/wixImmutable',
        'documentServices/dataAccessLayer/pathValidationUtil'],
    function (_, utils, wixImmutable, pathValidation) {
        'use strict';

        var cloneDeep = utils.objectUtils.cloneDeep;

        function DataAccessLayer(jsons, dataLoadedRegistrar, pathsCache, config) {
            if (arguments.length === 0) {
                return;
            }
            this.jsonsRootsMap = initJsonsRootsMap(config);
            this.jsonData = jsons;
            this.pathsCache = pathsCache;

            // creates a list of object, that have paths with the prefix from the config ('siteData' / 'fullJson')
            var unionPathList = _(config.pathsInJsonData)
                .values()
                .flatten()
                .map(function (pathObject) {
                    return _.assign({}, pathObject, {
                        path: addJsonPrefixIfNeeded(pathObject.path, this.jsonsRootsMap)
                    });
                }, this)
                .value();

            _.forEach(config.pathsInJsonData, function (jsonPaths, key) {
                validatePathList(jsonPaths, this.jsonData[key]);
            }, this);
            this.isReadOnly = !!config.isReadOnly;
            this.immutableSiteJsons = wixImmutable.fromJS(buildJsonsByPathList(unionPathList, this.jsonData));
            if (!this.isReadOnly) {
                this.setByPath(['origin'], config.origin);
            }
            this.historyDictionary = {};
            this.dynamicallyLoadedPaths = [];
            this.takeSnapshot('initialState');

            this.immutable = _.mapValues(IMMUTABLE_DAL, function(method) {

                return method.bind(this);

            }, this);

            if (dataLoadedRegistrar) {
                dataLoadedRegistrar(dataLoaded.bind(this));
            }
        }

        function initJsonsRootsMap(config) {
            var paths = config.pathsInJsonData;
            var jsonsRootsMap = {};
            _.forEach(paths, function (jsonPaths, key) {
                _.forEach(jsonPaths, function (pathObject) {
                    var pathPrefix = _.get(pathObject, 'path.0');
                    jsonsRootsMap[pathPrefix] = key;
                });
            });

            // returns a flat map, of the prefix of the beginning of the path to either 'siteData' or 'fullJson'
            // in case of 'pagesData' there's only 1 entry which equals 'fullJson'
            return jsonsRootsMap;
        }

        function validatePathList(pathList, json) {
            _(pathList)
                .reject('optional')
                .pluck('path')
                .forEach(function (path) {
                    pathValidation.validatePath(path, json);
                })
                .value();
        }

        function isPathExist(json, path, shouldValidatePathList) {
            return pathValidation.validatePathExist(json, path, shouldValidatePathList);
        }

        function buildJsonsByPathList(pathList, json) {
            return _(pathList)
                .reject('optional')
                .pluck('path')
                .filter(isPathExist.bind(null, json))
                .transform(function (acc, path) {
                    var valueToSet = _.get(json, path);
                    _.set(acc, path, valueToSet);
                }, {})
                .value();
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

        function dataLoaded(newPath, newValue) {
            newPath = addJsonPrefixIfNeeded(newPath, this.jsonsRootsMap);
            setWithNoRunningOperation.call(this, newPath, newValue);
            this.dynamicallyLoadedPaths.push({path: newPath, immutableData: wixImmutable.fromJS(newValue)});
        }

        function buildPathNameToJsonMapByPathMap(pathMap, immutableJson, jsonsRootsMap) {
            return _(pathMap)
                .map(function (path) {
                    return _.isString(path) ? [path] : path;
                })
                .reduce(function (resultedMap, path) {
                    resultedMap[path] = getValueFromImmutable(immutableJson.getIn(addJsonPrefixIfNeeded(path, jsonsRootsMap)));
                    return resultedMap;
                }, {});
        }

        //sorry for this ugly hack, but this is better than setting a page to null in order to delete it
        var DELETED_PAGES_MAP_PATH = ['deletedPagesMap'];

        function isPageMarkedAsDeleted(dataEntry, jsonsRootsMap, path) {
            var pagesDataIndex = _.findIndex(path, function (pathPart) {
                return pathPart === 'pagesData';
            });
            if (pagesDataIndex === -1) {
                return false;
            }
            var pageId = path[pagesDataIndex + 1];
            var pagePathInDeletedPagesMap = addJsonPrefixIfNeeded(DELETED_PAGES_MAP_PATH, jsonsRootsMap).concat(pageId);
            return dataEntry.getIn(pagePathInDeletedPagesMap);
        }

        function shouldIgnoreEntry(data, jsonsRootsMap, loadedEntry) {
            var doesPathExist = !_.isUndefined(data.getIn(loadedEntry.path));
            return doesPathExist || isPageMarkedAsDeleted(data, jsonsRootsMap, loadedEntry.path);
        }

        function calculateMissingLoadedItemsInEntry(dataEntry, dynamicallyLoaded, jsonsRootsMap) {
            if (!dynamicallyLoaded.length) {
                return {};
            }
            return _(dynamicallyLoaded)
                .sortBy(function (loadedEntry) {
                    return -loadedEntry.path.length;
                })
                .reject(shouldIgnoreEntry.bind(null, dataEntry, jsonsRootsMap))
                .reduce(function (diffToReturn, loadedEntry) {
	                return diffToReturn.updateIn(loadedEntry.path, _.constant(loadedEntry.immutableData));
                }, wixImmutable.fromJS({}));
        }

        function getValueFromImmutable(immutableObj) {
            return immutableObj && immutableObj.toJSON ? immutableObj.toJSON() : immutableObj;
        }

        function mergeNewValueToCurrent(currentValue, newValue) {
            if (currentValue instanceof wixImmutable.Map && newValue instanceof wixImmutable.Map) {
                var diffKeys = _.difference(currentValue.keySeq().toJS(), newValue.keySeq().toJS());
                if (diffKeys.length) {
                    currentValue = _.reduce(diffKeys, function (curr, key) {
                        return curr.remove(key);
                    }, currentValue);
                }
                return currentValue.merge(newValue);
            }
            return newValue;
        }

        function setWithNoRunningOperation(path, value) {
            path = addJsonPrefixIfNeeded(path, this.jsonsRootsMap);
            validatePath(path, this.jsonData, this.jsonsRootsMap);
            var immutableValueToSet = wixImmutable.fromJS(value);
            this.immutableSiteJsons = this.immutableSiteJsons.updateIn(path, function (currentValue) {
                return mergeNewValueToCurrent(currentValue, immutableValueToSet);
            });
            updateSiteJsonAndResetPathsCache(this.jsonData, cloneDeep(value), path, this.pathsCache);
            return true;
        }

        function validatePath(path, jsonData, jsonsRootsMap, validateValueInPathExist) {
            var prefix = _.first(path);
            var jsonsPrefixes = _.values(jsonsRootsMap);
            var hasJsonPrefix = _.includes(jsonsPrefixes, prefix);
            var innerJsonData = hasJsonPrefix ? jsonData[prefix] : jsonData;
            path = hasJsonPrefix ? path.slice(1) : path;
            pathValidation.validatePath(path, innerJsonData, validateValueInPathExist);
        }

        function pushValue(pathToArray, item, index) {
            this.immutableSiteJsons = this.immutableSiteJsons.updateIn(pathToArray, function (immutableArray) {
                if (!(immutableArray instanceof wixImmutable.List)) {
                    throw new Error('item at path - ' + pathToArray + ' is not an array');
                }
                if (_.isNumber(index)) {
                    if (index > immutableArray.size || index < 0) {
                        throw new Error('Index out of bound');
                    }
                    return immutableArray.splice(index, 0, wixImmutable.fromJS(item));
                }
                return immutableArray.push(wixImmutable.fromJS(item));
            });
            var newArray = updateSiteJsonFromImmutableAndResetPathsCache(this.jsonData, this.immutableSiteJsons, pathToArray, this.pathsCache);
            return newArray.length - 1;
        }

        function mergeValue(pathToObject, obj) {
            if (!_.isPlainObject(obj)) {
                throw new Error(obj + ' is not an object');
            }
            this.immutableSiteJsons = this.immutableSiteJsons.updateIn(pathToObject, function (immutableObject) {
                if (!(immutableObject instanceof wixImmutable.Map)) {
                    throw new Error('value in path - ' + pathToObject + ' is not an object');
                }
                return immutableObject.merge(wixImmutable.fromJS(obj));
            });
            updateSiteJsonFromImmutableAndResetPathsCache(this.jsonData, this.immutableSiteJsons, pathToObject, this.pathsCache);
            return true;
        }

        function updateSiteJsonAndResetPathsCache(siteJson, newValue, path, pathsCache) {
            _.set(siteJson, path, newValue);
            if (pathsCache) {
                pathsCache.resetValidations();
            }
        }

        function updateSiteJsonFromImmutableAndResetPathsCache(siteJson, immutableSiteJsons, path, pathsCache) {
            var newImmutableValue = immutableSiteJsons.getIn(path);
            var newValue = getValueFromImmutable(newImmutableValue);
            updateSiteJsonAndResetPathsCache(siteJson, newValue, path, pathsCache);
            return newValue;
        }

        function addJsonPrefixIfNeeded(path, jsonsRootsMap) {
            if (!path || !_.isArray(path)) {
                return path;
            }
            var prefix = jsonsRootsMap[_.first(path)];
            var alreadyHasPrefix = path.length > 1 && jsonsRootsMap[path[1]] === path[0];
            if (!alreadyHasPrefix && !prefix) {
                /*eslint no-console:0*/
                console.error('path is not defined in json config: ' + path);
                prefix = 'siteData';
            }

            return prefix ? [prefix].concat(path) : path;
        }

        // this is added to the DAL in it's constructor, and not on the prototype, on purpose...
        // since there are problems with the historyDictionary after binding the functions when it is on the prototype
        var IMMUTABLE_DAL = {
            /**
             * @param tag {String} history stack name
             * @param index {Number} index in history stack
             * @returns siteJson {*}
             */
            getSnapshotByTagAndIndex: function (tag, index) {
                //TODO: move getEntryWithLoadedItems to function
                if (!this.historyDictionary[tag] || this.historyDictionary[tag].length <= index || index < 0) {
                    throw new Error('requested index in history stack is out of bound');
                }
                var historyEntry = this.historyDictionary[tag][index];
                var missingLoadedItems = calculateMissingLoadedItemsInEntry(historyEntry, this.dynamicallyLoadedPaths, this.jsonsRootsMap);
                var entryWithLoadedItems = historyEntry.mergeDeep(missingLoadedItems);
                return entryWithLoadedItems.flatten(1);
            },
            getLastSnapshotByTagName: function(tag){
                if (!this.historyDictionary[tag] || !this.historyDictionary[tag].length) {
                    return null;
                }
                return this.immutable.getSnapshotByTagAndIndex(tag, this.historyDictionary[tag].length - 1);
            },
            getInitialSnapshot: function(){
                return this.immutable.getSnapshotByTagAndIndex('initialState', 0);
            },
            getByPath: function(path){
                path = addJsonPrefixIfNeeded(path, this.jsonsRootsMap);
                validatePath(path, this.jsonData, this.jsonsRootsMap);
                return this.immutableSiteJsons.getIn(path);
            }
        };

        DataAccessLayer.prototype = {
            setByPath: function (path, value) {
                if (this.isReadOnly) {
                    throw "DAL is in read only state, can't set";
                }
                return setWithNoRunningOperation.call(this, path, value);
            },

            /**
             * @param pointer
             * @param value {Object|Array|String|Number} - value to set
             */
            set: function (pointer, value) {
                var path = this.pathsCache.getPath(pointer, true);
                return this.setByPath(path, value);
            },

            /**
             *
             * @param pointerToArray
             * @param item
             * @param pointerToPush
             * @param index
             */
            push: function (pointerToArray, item, pointerToPush, index) {
                if (this.isReadOnly) {
                    throw "DAL is in read only state, can't push";
                }
                var cachedPath = this.pathsCache.getPath(pointerToArray);
                var path = addJsonPrefixIfNeeded(cachedPath, this.jsonsRootsMap);
                var newIndex = pushValue.call(this, path, item, index);
                if (pointerToPush) {
                    var pathToNewItem = cachedPath;
                    pathToNewItem.push(newIndex);
                    this.pathsCache.setPath(pointerToPush, pathToNewItem);
                }
            },

            /**
             * @param pathToArray <Array{String|Number}>
             * @param item {Object|Array|String|Number} - the item you want to push to the array in pathToArray
             * @returns {*} the new array
             */
            pushByPath: function (pathToArray, item, index) {
                if (this.isReadOnly) {
                    throw "DAL is in read only state, can't push";
                }
                pathToArray = addJsonPrefixIfNeeded(pathToArray, this.jsonsRootsMap);
                validatePath(pathToArray, this.jsonData, this.jsonsRootsMap);
                return pushValue.call(this, pathToArray, item, index);
            },

            /**
             * @param pathToObject <Array{String|Number}>
             * @param obj {Object}
             * @returns {*} the new merged object
             */
            mergeByPath: function (pathToObject, obj) {
                if (this.isReadOnly) {
                    throw "DAL is in read only state, can't merge";
                }
                pathToObject = addJsonPrefixIfNeeded(pathToObject, this.jsonsRootsMap);
                validatePath(pathToObject, this.jsonData, this.jsonsRootsMap);
                return mergeValue.call(this, pathToObject, obj);
            },

            merge: function (pointer, obj) {
                if (this.isReadOnly) {
                    throw "DAL is in read only state, can't merge";
                }
                var path = addJsonPrefixIfNeeded(this.pathsCache.getPath(pointer), this.jsonsRootsMap);
                return mergeValue.call(this, path, obj);
            },

            /**
             * @param path <Array{String|Number}> - path to get value from
             */
            getByPath: function (path) {
                path = addJsonPrefixIfNeeded(path, this.jsonsRootsMap);
                validatePath(path, this.jsonData, this.jsonsRootsMap);
                return cloneDeep(_.get(this.jsonData, path));
            },

            /**
             *
             * @param pointer
             * @returns {object}
             */
            get: function (pointer) {
                var path = addJsonPrefixIfNeeded(this.pathsCache.getPath(pointer), this.jsonsRootsMap);
                if (path) {
                    return cloneDeep(_.get(this.jsonData, path));
                }
            },

            isExist: function (pointer) {
                var path = this.pathsCache.getPath(pointer);
                return !!path;
            },

            remove: function (pointer) {
                if (this.isReadOnly) {
                    throw "DAL is in read only state, can't remove";
                }
                var path = addJsonPrefixIfNeeded(this.pathsCache.getPath(pointer), this.jsonsRootsMap);
                this.immutableSiteJsons = this.immutableSiteJsons.deleteIn(path);
                removeValueInPath(this.jsonData, path);
                if (this.pathsCache) {
                    this.pathsCache.resetValidations();
                }
            },

            /**
             * @param path <Array{String|Number}> - path to remove value from
             */
            removeByPath: function (path) {
                path = addJsonPrefixIfNeeded(path, this.jsonsRootsMap);
                if (this.isReadOnly) {
                    throw "DAL is in read only state, can't remove";
                }
                validatePath(path, this.jsonData, this.jsonsRootsMap, false);
                this.immutableSiteJsons = this.immutableSiteJsons.deleteIn(path);
                removeValueInPath(this.jsonData, path);
                if (this.pathsCache) {
                    this.pathsCache.resetValidations();
                }
            },

            getKeysByPath: function (path) {
                path = addJsonPrefixIfNeeded(path, this.jsonsRootsMap);
                validatePath(path, this.jsonData, this.jsonsRootsMap);
                var valueInPath = _.get(this.jsonData, path);
                if (!_.isPlainObject(valueInPath)) {
                    throw new Error("Can not get keys of an element that isn't a plain object");
                }
                return _.keys(valueInPath);
            },

            getKeys: function (pointer) {
                var path = addJsonPrefixIfNeeded(this.pathsCache.getPath(pointer), this.jsonsRootsMap);
                if (!path) {
                    return undefined;
                }
                var valueInPath = _.get(this.jsonData, path);
                if (!_.isPlainObject(valueInPath)) {
                    throw new Error("Can not get keys of an element that isn't a plain object");
                }
                return _.keys(valueInPath);
            },

            isPathExist: function (path) {
                return isPathExist(this.jsonData, addJsonPrefixIfNeeded(path, this.jsonsRootsMap), true);
            },

            getPointerJsonType: function (pointer) {
                var path = this.pathsCache.getPath(pointer, true);
                return this.getPathJsonType(path);
            },

            getPathJsonType: function (path) {
                return this.jsonsRootsMap[_.first(path)];
            },

            /**
             * @param tag {String} history stack name
             * @returns {Number} index in history stack
             */
            takeSnapshot: function (tag) {
                this.historyDictionary[tag] = this.historyDictionary[tag] || [];
                this.historyDictionary[tag].push(this.immutableSiteJsons);
                return this.historyDictionary[tag].length - 1;
            },

            /**
             * Duplicate the last snapshot and add some changes to it if changes is not null
             * @param {String} tag history stack name
             * @param {Object?} changes dictionary of path string to new value (if value is undefined the path will be removed).
             */
            duplicateLastSnapshot: function (tag, changes) {
                this.historyDictionary[tag] = this.historyDictionary[tag] || [];
                var jsonsRootMap = this.jsonsRootsMap;
                var last = _.last(this.historyDictionary[tag]) || _.first(this.historyDictionary.initialState);

                var updated = _.reduce(changes, function (acc, value, path) {
                    var pathArray = addJsonPrefixIfNeeded(path.split('.'), jsonsRootMap);

                    return _.isUndefined(value) ? acc.deleteIn(pathArray) : acc.updateIn(pathArray, function () {
                        return value;
                    });
                }, last);

                this.historyDictionary[tag].push(updated);

                return this.historyDictionary[tag].length - 1;
            },

            /**
             *
             * @param tag {String} history stack name
             */
            removeLastSnapshot: function (tag) {
                if (!this.historyDictionary[tag]) {
                    return;
                }
                this.historyDictionary[tag].pop();
            },

            /**
             * @param tag {String} history stack name
             * @param [pathMap] {*} pathName to path array map (optional)
             * @returns siteJson {*}
             */
            getLastSnapshotByTagName: function (tag, pathMap) {
                if (!this.historyDictionary[tag] || !this.historyDictionary[tag].length) {
                    return null;
                }
                return this.getSnapshotByTagAndIndex(tag, this.historyDictionary[tag].length - 1, pathMap);
            },

            /**
             *
             * @param pathMap
             * @returns {*}
             */
            getInitialSnapshot: function (pathMap) {
                return this.getSnapshotByTagAndIndex('initialState', 0, pathMap);
            },

            /**
             * @param tag {String} history stack name
             * @param index {Number} index in history stack
             * @param [pathMap] {*} pathName to path array map (optional)
             * @returns siteJson {*}
             */
            getSnapshotByTagAndIndex: function (tag, index, pathMap) {
                if (!this.historyDictionary[tag] || this.historyDictionary[tag].length <= index || index < 0) {
                    throw new Error('requested index in history stack is out of bound');
                }
                var historyEntry = this.historyDictionary[tag][index];
                var missingLoadedItems = calculateMissingLoadedItemsInEntry(historyEntry, this.dynamicallyLoadedPaths, this.jsonsRootsMap);
                var entryWithLoadedItems = historyEntry.mergeDeep(missingLoadedItems);

                if (pathMap) {
                    return buildPathNameToJsonMapByPathMap(pathMap, entryWithLoadedItems, this.jsonsRootsMap);
                }
                var jsonFromSnapshot = entryWithLoadedItems.toJS();
                // TODO GuyR 1/8/16 17:44 - check if needed - since 'origin' is defined in jsonConfig, it will be in one of the jsons and not on the jsonFromSnapshot object
                var origin = jsonFromSnapshot.origin;
                var withoutOrigin = _.omit(jsonFromSnapshot, 'origin');
                return _.transform(withoutOrigin, function (accumulator, currentJson) {
                    return _.assign(accumulator, currentJson);
                }, {origin: origin});
            },

            /**
             *
             * @param snapshotTagName {String} history stack name
             * @param pointer
             * @returns {boolean} true iff the pointer current value was changed since last snapshot
             */
            wasValueChangedSinceLastSnapshot: function (snapshotTagName, pointer) {
                var historyEntry = this.historyDictionary[snapshotTagName];
                if (!historyEntry) {
                    throw new Error('No such tag name - ' + snapshotTagName);
                }
                var lastSnapshot = _.last(historyEntry);
                if (!lastSnapshot) {
                    throw new Error('There is no snapshot under tag name - ' + snapshotTagName);
                }
                var path = addJsonPrefixIfNeeded(this.pathsCache.getPath(pointer, true), this.jsonsRootsMap);
                var currentValueInPath = this.immutableSiteJsons.getIn(path);
                var snapshotValueInPath = lastSnapshot.getIn(path);

                return !wixImmutable.is(currentValueInPath, snapshotValueInPath);
            }
        };

        /**
         * @class DAL
         * @ignore
         */
        return DataAccessLayer;
    });
