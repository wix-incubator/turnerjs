define(['lodash', 'documentServices/constants/constants'], function
    (_, constants) {
    'use strict';

    function bindOwnMethodsDeep(obj, context) {
        _.forIn(obj, function (value, propertyName) {
            if (_.isFunction(value)) {
                obj[propertyName] = value.bind(context);
            } else if (_.isPlainObject(value)) {
                obj[propertyName] = bindOwnMethodsDeep(_.clone(value), context);
            }
        });

        return obj;
    }

    var GeneralSuperDal = function (fullJsonDal, displayedDal, /** FullJsonUpdater */fullJsonUpdater, /** DisplayedJsonUpdater */displayedJsonUpdater, pointers) {
        this.displayedJsonUpdater = displayedJsonUpdater;
        this.fullJsonUpdater = fullJsonUpdater;
        this.fullJsonDal = fullJsonDal;
        this.displayedJsonDal = displayedDal;
        bindOwnMethodsDeep(this, this);  // TODO GuyR 12/9/15 19:26 - move binding method to utils
        this.pointers = pointers;
    };

    function isPointerToPagesData(fullJsonDal, pointer){
        var rootJsonType = fullJsonDal.getPointerJsonType(pointer);
        return rootJsonType === constants.JSON_TYPES.FULL;
    }

    function isPathToPagesData(fullJsonDal, path){
        var rootJsonType = fullJsonDal.getPathJsonType(path);
        return rootJsonType === constants.JSON_TYPES.FULL;
    }

    function getActiveModes(displayedJsonDal, pointers) {
        var activeModesPointer = pointers.general.getActiveModes();
        return displayedJsonDal.get(activeModesPointer);
    }

    GeneralSuperDal.prototype = {
        get: function(pointer) {
            return this.displayedJsonDal.get(pointer);
        },

        getByPath: function(path) {
            return this.displayedJsonDal.getByPath(path);
        },

        isExist: function(pointer) {
            return this.displayedJsonDal.isExist(pointer);
        },

        isPathExist: function(path) {
            return this.displayedJsonDal.isPathExist(path);
        },

        getKeys: function(pointer) {
            return this.displayedJsonDal.getKeys(pointer);
        },

        getKeysByPath: function(path) {
            return this.displayedJsonDal.getKeysByPath(path);
        },

        set: function(pointer, value) {
            if (isPointerToPagesData(this.fullJsonDal, pointer)){
                this.displayedJsonDal.set(pointer, value);
                this.fullJsonUpdater.onSet(pointer, value);
            } else {
                this.fullJsonDal.set(pointer, value);
            }
        },

        push: function(pointerToArray, value, pointerToPush, index) {
            if (isPointerToPagesData(this.fullJsonDal, pointerToArray)){
                this.displayedJsonDal.push(pointerToArray, value, pointerToPush, index);
                this.fullJsonUpdater.onPush(pointerToArray, value, pointerToPush, index);
            } else {
                this.fullJsonDal.push(pointerToArray, value, pointerToPush, index);
            }
        },

        merge: function(pointer, value) {
            if (isPointerToPagesData(this.fullJsonDal, pointer)){
                this.displayedJsonDal.merge(pointer, value);
                this.fullJsonUpdater.onMerge(pointer, value);
            } else {
                this.fullJsonDal.merge(pointer, value);
            }
        },

        remove: function(pointer) {
            if (isPointerToPagesData(this.fullJsonDal, pointer)){
                this.displayedJsonDal.remove(pointer);
                this.fullJsonUpdater.onRemove(pointer);
            } else {
                this.fullJsonDal.remove(pointer);
            }
        },

        takeSnapshot: function(tag) {
            return this.fullJsonDal.takeSnapshot(tag);
        },

        duplicateLastSnapshot: function(tag, changes) {
            return this.fullJsonDal.duplicateLastSnapshot(tag, changes);
        },

        wasValueChangedSinceLastSnapshot: function(snapshotTagName, pointer) {
            return this.fullJsonDal.wasValueChangedSinceLastSnapshot(snapshotTagName, pointer);
        },

        getLastSnapshotByTagName: function(tag, pathMap) {
            return this.fullJsonDal.getLastSnapshotByTagName(tag, pathMap);
        },

        getInitialSnapshot: function(pathMap) {
            return this.fullJsonDal.getInitialSnapshot(pathMap);
        },

        removeLastSnapshot: function(tag) {
            this.fullJsonDal.removeLastSnapshot(tag);
        },

        getSnapshotByTagAndIndex: function(tag, index, pathMap) {
            return this.fullJsonDal.getSnapshotByTagAndIndex(tag, index, pathMap);
        },

        full: {
            immutable: {
                getSnapshotByTagAndIndex: function(tag, index){
                    return this.fullJsonDal.immutable.getSnapshotByTagAndIndex(tag, index);
                },
                getLastSnapshotByTagName: function(tag){
                    return this.fullJsonDal.immutable.getLastSnapshotByTagName(tag);
                },
                getInitialSnapshot: function(){
                    return this.fullJsonDal.immutable.getInitialSnapshot();
                },
                getByPath: function(path){
                    return this.fullJsonDal.immutable.getByPath(path);
                }

            },
            get: function (pointer) {
                return this.fullJsonDal.get(pointer);
            },
            set: function (pointer, value) {
                if (this.fullJsonDal.set(pointer, value) && isPointerToPagesData(this.fullJsonDal, pointer)){
                    var activeModes = getActiveModes(this.displayedJsonDal, this.pointers);
                    this.displayedJsonUpdater.onSet(pointer, activeModes);
                }
            },
            push: function (pointerToArray, item, pointerToPush, index) {
                this.fullJsonDal.push(pointerToArray, item, pointerToPush, index);
                if (isPointerToPagesData(this.fullJsonDal, pointerToArray)){
                    var activeModes = getActiveModes(this.displayedJsonDal, this.pointers);
                    this.displayedJsonUpdater.onPush(pointerToArray, index, item, pointerToPush, activeModes);
                }
            },
            merge: function(pointer, value) {
                if (this.fullJsonDal.merge(pointer, value) && isPointerToPagesData(this.fullJsonDal, pointer)) {
                    var activeModes = getActiveModes(this.displayedJsonDal, this.pointers);
                    this.displayedJsonUpdater.onMerge(pointer, activeModes);
                }
            },
            getByPath: function(path) {
                return this.fullJsonDal.getByPath(path);
            },
            isExist: function(pointer) {
                return this.fullJsonDal.isExist(pointer);
            },
            isPathExist: function(path) {
                return this.fullJsonDal.isPathExist(path);
            },
            remove: function(pointer) {
                this.fullJsonDal.remove(pointer);
                if (isPointerToPagesData(this.fullJsonDal, pointer)) {
                    var activeModes = getActiveModes(this.displayedJsonDal, this.pointers);
                    this.displayedJsonUpdater.onRemove(pointer, activeModes);
                }
            },
            getKeys: function(pointer) {
                return this.fullJsonDal.getKeys(pointer);
            },
            getKeysByPath: function(path) {
                return this.fullJsonDal.getKeysByPath(path);
            },
            setByPath: function(path, value) {
                this.fullJsonDal.setByPath(path, value);
                if (isPathToPagesData(this.fullJsonDal, path)){
                    var activeModes = getActiveModes(this.displayedJsonDal, this.pointers);
                    this.displayedJsonUpdater.onSetByPath(path, activeModes);
                }
            },
            removeByPath: function(path) {
                this.fullJsonDal.removeByPath(path);
                if (isPathToPagesData(this.fullJsonDal, path)){
                    var activeModes = getActiveModes(this.displayedJsonDal, this.pointers);
                    this.displayedJsonUpdater.onRemoveByPath(path, activeModes);
                }
            },
            pushByPath: function(pathToArray, value, optionalIndex) {
                this.fullJsonDal.pushByPath(pathToArray, value, optionalIndex);
                if (isPathToPagesData(this.fullJsonDal, pathToArray)){
                    var activeModes = getActiveModes(this.displayedJsonDal, this.pointers);
                    this.displayedJsonUpdater.onPushByPath(pathToArray, optionalIndex, activeModes);
                }
            },
            mergeByPath: function(path, value) {
                this.fullJsonDal.mergeByPath(path, value);
                if (isPathToPagesData(this.fullJsonDal, path)){
                    var activeModes = getActiveModes(this.displayedJsonDal, this.pointers);
                    this.displayedJsonUpdater.onMergeByPath(path, activeModes);
                }
            }
        }
    };

    return GeneralSuperDal;
});
