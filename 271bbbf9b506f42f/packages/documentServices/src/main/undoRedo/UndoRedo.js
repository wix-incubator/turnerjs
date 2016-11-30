define(['lodash',
    'documentServices/hooks/hooks',
    'documentServices/autosave/autosave'
], function (_, hooks, autosave) {
    'use strict';

    var initialStateSnapshotLabel = 'initial state';

    function UndoRedo(privateServices, undoablePaths, nonUndoablePaths) {
        this.undoablePaths = convertStringsToArrays(undoablePaths);
        this.nonUndoablePaths = convertStringsToArrays(nonUndoablePaths);
        this.privateServices = privateServices;
        this.undoStack = [];
        this.redoStack = [];
        this.add(initialStateSnapshotLabel);
    }

    function collectCurrentNonUndoableValues(dal, nonUndoablePaths) {
        return _(nonUndoablePaths)
            .filter(dal.full.isPathExist)
            .transform(function (result, nonUndoablePath) {
                result[nonUndoablePath.join('.')] = dal.getByPath(nonUndoablePath);
            }, {})
            .value();
    }

    function revertNonUndoableValues(dal, nonUndoableValuesMap) {
        _.forEach(nonUndoableValuesMap, function (value, key) {
            dal.full.setByPath(key.split('.'), value);
        });
    }

    function setAllSnapshotValues(dal, pathMap, siteSnapshot) {
        _.forEach(pathMap, function (path, pathName) {
            dal.full.setByPath(path, siteSnapshot[pathName]);
        });
    }

    function setSiteSnapshotAccordingToPathMap(dal, siteSnapshot, pathMap, nonUndoablePaths) {
        var nonUndoableValuesMap = collectCurrentNonUndoableValues(dal, nonUndoablePaths);
        setAllSnapshotValues(dal, pathMap, siteSnapshot);
        revertNonUndoableValues(dal, nonUndoableValuesMap);
    }

    function retrieveAndApplySiteSnapshot(siteSnapshotItem, dal, undoablePaths, nonUndoablePaths) {
        var pathMap = buildUndoableJsonsPathMap(undoablePaths);
        var siteSnapshot = dal.getSnapshotByTagAndIndex('undoRedo', siteSnapshotItem.historyIndex, pathMap);
        setSiteSnapshotAccordingToPathMap(dal, siteSnapshot, pathMap, nonUndoablePaths);
    }

    function undo() {
        if (!this.canUndo()) {
            return null;
        }

        var lastSiteSnapshotItem = this.undoStack.pop();
        this.redoStack.push(lastSiteSnapshotItem);

        var toApplySnapshotItem = _.last(this.undoStack);
        this.privateServices.setOperationsQueue.runSetOperation(retrieveAndApplySiteSnapshot, [toApplySnapshotItem, this.privateServices.dal, this.undoablePaths, this.nonUndoablePaths]);

        executeAutoSaveHook(this.privateServices);

        return toApplySnapshotItem.label;
    }

    function redo() {
        if (!this.canRedo()) {
            return null;
        }

        var siteSnapshotItem = this.redoStack.pop();
        this.undoStack.push(siteSnapshotItem);

        var toApplySnapshotItem = _.last(this.undoStack);
        this.privateServices.setOperationsQueue.runSetOperation(retrieveAndApplySiteSnapshot, [toApplySnapshotItem, this.privateServices.dal, this.undoablePaths, this.nonUndoablePaths]);

        executeAutoSaveHook(this.privateServices);

        return toApplySnapshotItem.label;
    }

    function convertStringsToArrays(collection) {
        return _.map(collection, function (item) {
            return _.isString(item) ? [item] : item;
        });
    }

    function buildUndoableJsonsPathMap(undoablePaths) {
        var pathNameArray = _.map(undoablePaths, _.last);
        return _.zipObject(pathNameArray, undoablePaths);
    }

    function clearRedoStack() {
        this.redoStack = [];
    }

    function clearUndoStack() {
        this.undoStack = _.take(this.undoStack);
    }

    function takeUndoRedoSnapshot(snapshotLabel, params) {
        clearRedoStack.call(this);
        var self = this;
        var undoItem = {placeHolder: true, params: params || null, label: snapshotLabel || ''};

        this.privateServices.setOperationsQueue.flushQueueAndExecute(function () {
            undoItem.historyIndex = self.privateServices.dal.takeSnapshot('undoRedo');
            undoItem.placeHolder = false;
        });
        self.undoStack.push(undoItem);

        if (snapshotLabel !== initialStateSnapshotLabel) {
            executeAutoSaveHook(this.privateServices);
        }
    }

    function executeAutoSaveHook(ps) {
        if (autosave.canAutosave(ps)) {
            hooks.executeHook(hooks.HOOKS.AUTOSAVE.ACTION);
        }
    }

    function clear() {
        clearUndoStack.call(this);
        clearRedoStack.call(this);
    }

    function getUndoLastSnapshotParams() {
        return getStackLastSnapshotParams(this.undoStack);
    }

    function getRedoLastSnapshotParams() {
        return getStackLastSnapshotParams(this.redoStack);
    }

    function getUndoLastSnapshotLabel() {
        return getStackLastSnapshotLabel(this.undoStack);
    }

    function getRedoLastSnapshotLabel() {
        return getStackLastSnapshotLabel(this.redoStack);
    }

    function getLastSnapshotObject(stack) {
        return _.last(stack);
    }

    function getStackLastSnapshotParams(stack) {
        return _.isEmpty(stack) ? null : getLastSnapshotObject(stack).params;
    }

    function getStackLastSnapshotLabel(stack) {
        return _.isEmpty(stack) ? null : getLastSnapshotObject(stack).label;
    }

    function canUndo() {
        return this.undoStack.length >= 2;
    }

    function canRedo() {
        return !_.isEmpty(this.redoStack);
    }

    /**
     * @class documentServices.history
     * */
    UndoRedo.prototype = {
        /**
         * Undo the last snapshot in the stack - the actions the were done between the previous and the last call to add()
         * @returns {String} the applied snapshot label
         */
        undo: undo,
        /**
         * Redo the last snapshot in the stack - the actions the were most recently rolled back by calling undo
         * @returns {String} the applied snapshot label
         */
        redo: redo,
        /**
         * adds a snapshot (current site state) to the stack.
         * @param {String} [snapshotLabel] - a name describing the snapshot
         * @param {Object} [params] - extra parameters that will be stored with the snapshot in the stack.
         * Can be restored before performing an undo/redo action by calling getUndo/RedoLastSnapshotParams()
         */
        add: takeUndoRedoSnapshot,
        /**
         * @deprecated
         * Clears the undo/redo stack, meaning that after this method is called, no undo/redo actions will be performed until another snapshot is added
         */
        clear: clear,
        /**
         * Returns the parameters of the last snapshot in the stack, or null if there aren't any
         * @returns {Object}
         */
        getUndoLastSnapshotParams: getUndoLastSnapshotParams,
        /**
         * Returns the parameters of the last rolled back snapshot, or null if there aren't any
         * @returns {Object}
         */
        getRedoLastSnapshotParams: getRedoLastSnapshotParams,
        /**
         * Returns the label of the last snapshot in the stack, or an empty string if it wasn't set
         * @returns {String}
         */
        getUndoLastSnapshotLabel: getUndoLastSnapshotLabel,
        /**
         * Returns the label of the last rolled back snapshot, or an empty string if it wasn't set
         * @returns {String}
         */
        getRedoLastSnapshotLabel: getRedoLastSnapshotLabel,
        /**
         * Returns true if there is at least one snapshot to undo.
         * @returns {boolean}
         */
        canUndo: canUndo,
        /**
         * Returns true if there is at least one snapshot to redo
         * @returns {boolean}
         */
        canRedo: canRedo
    };

    /**
     * @class documentServices.history
     * */
    return UndoRedo;
});
