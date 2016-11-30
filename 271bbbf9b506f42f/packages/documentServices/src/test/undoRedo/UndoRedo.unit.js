define(['lodash',
        'documentServices/autosave/autosave',
        'documentServices/hooks/hooks',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/undoRedo/UndoRedo',
        'documentServices/jsonConfig/jsonConfig'], function (_, autosave, hooks, privateServicesHelper, UndoRedo, jsonConfig) {

    'use strict';
    var undoRedo;

    describe('undoRedo', function () {
        beforeEach(function () {
            this.undoableList = jsonConfig.getWhiteList();
            this.nonUndoablePathList = jsonConfig.getNonUndoableList();
            this.nonUndoablePathList.push(['wixapps', 'myNonUndoableItemKey']);
            this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(null, jsonConfig.getPathsInJsonData());
            undoRedo = new UndoRedo(this.ps, this.undoableList, this.nonUndoablePathList);
            this.dal = undoRedo.privateServices.dal;
        });

        describe('undo', function () {
            var snapshotName, snapshotAfterActionName, editorState, path, valueBeforeChange;
            beforeEach(function () {
                snapshotName = 'firstSiteSnapshot';
                snapshotAfterActionName = 'snapshotAfterAction';
                editorState = {panel: 'open'};
                path = ['pagesData'];
            });

            describe('undo stack contains more than 1 element', function () {
                beforeEach(function () {
                    valueBeforeChange = this.dal.full.getByPath(path);
                    undoRedo.add(snapshotName, editorState);
                    this.dal.full.setByPath(path, {
                        page1: {
                            structure: 'hi',
                            data: ''
                        }
                    });

                    undoRedo.add(snapshotAfterActionName, editorState);
                });
                it('should set site jsons to be the same as before set action was done', function () {
                    undoRedo.undo();

                    var result = this.dal.full.getByPath(path);
                    expect(result).toEqual(valueBeforeChange);
                });
                it('should return last undoStack item after pop label', function () {
                    var returnedValue = undoRedo.undo();

                    expect(returnedValue).toEqual(snapshotName);
                });
                it('should not undo an item which is in a nonUndoable path', function () {
                    var nonUndoablePath = ['somePath'];
                    var jsonPaths = _.clone(jsonConfig.getPathsInJsonData());
                    jsonPaths.siteData = jsonPaths.siteData.concat({path: nonUndoablePath, optional: true});

                    this.nonUndoablePathList = this.nonUndoablePathList.concat(nonUndoablePath);
                    undoRedo = new UndoRedo(privateServicesHelper.mockPrivateServicesWithRealDAL(null, jsonPaths), this.undoableList, this.nonUndoablePathList);
                    this.dal = undoRedo.privateServices.dal;
                    var nonUndoableItem = {'myNonUndoableItemKey': 'myNonUndoableItem'};
                    this.dal.full.setByPath(nonUndoablePath, nonUndoableItem);
                    var valueBeforeUndo = this.dal.full.getByPath(nonUndoablePath.concat('myNonUndoableItemKey'));

                    undoRedo.undo();

                    var valueAfterUndo = this.dal.full.getByPath(nonUndoablePath.concat('myNonUndoableItemKey'));
                    expect(valueBeforeUndo).toEqual('myNonUndoableItem');
                    expect(valueBeforeUndo).toEqual(valueAfterUndo);
                });
                it('should not undo an item in a nonUndoable path that its path head is undoable', function () {
                    var nonUndoablePath = ['wixapps', 'myNonUndoableItemKey'];
                    this.dal.full.setByPath(nonUndoablePath, 'myNonUndoableItem');
                    var valueBeforeUndo = this.dal.full.getByPath(nonUndoablePath);

                    undoRedo.undo();

                    var valueAfterUndo = this.dal.full.getByPath(nonUndoablePath);
                    expect(valueBeforeUndo).toEqual(valueAfterUndo);
                });
                it('should not undo only an item that is a nonUndoable and undo others', function () {
                    var nonUndoablePath = ['wixapps', 'myNonUndoableItemKey'];
                    var undoablePath = ['wixapps', 'myUndoableItemKey'];
                    var undoableValueBeforeSet = this.dal.full.getByPath(undoablePath);
                    this.dal.full.setByPath(nonUndoablePath, 'myNonUndoableItem');
                    this.dal.full.setByPath(undoablePath, 'myUndoableItem');
                    var nonUndoableValueBeforeUndo = this.dal.full.getByPath(nonUndoablePath);

                    undoRedo.undo();

                    var nonUndoableValueAfterUndo = this.dal.full.getByPath(nonUndoablePath);
                    var undoableValueAfterUndo = this.dal.full.getByPath(undoablePath);
                    expect(nonUndoableValueBeforeUndo).toEqual(nonUndoableValueAfterUndo);
                    expect(undoableValueBeforeSet).toEqual(undoableValueAfterUndo);
                });

                describe('autosave', function () {
                    beforeEach(function () {
                        var pointer = this.ps.pointers.general.getAutosaveInfo();
                        this.dal.set(pointer, {shouldAutoSave: true});

                        autosave.init(this.ps, {
                            AUTOSAVE_TIMEOUT: 10,
                            AUTOSAVE_ACTION_COUNT: 10,
                            SAVE_AFTER_AUTOSAVE_COUNT: 10,
                            DEBOUNCE_WAIT: 2
                        });

                        spyOn(hooks, 'executeHook');
                    });

                    it('should execute autosave hook', function () {
                        undoRedo.undo();

                        expect(hooks.executeHook).toHaveBeenCalledWith(hooks.HOOKS.AUTOSAVE.ACTION);
                    });
                });
            });

            describe('undo stack contains less than 2 elements', function () {
                beforeEach(function () {
                    valueBeforeChange = this.dal.full.getByPath(path);
                });
                it('should do nothing', function () {
                    undoRedo.undo();

                    var result = this.dal.full.getByPath(path);
                    expect(result).toEqual(valueBeforeChange);
                });
            });


        });

        describe('redo', function () {
            var snapshotName = 'firstSiteSnapshot';
            var snapshotAfterActionName = 'snapshotAfterAction';
            var editorState = {panel: 'open'};
            var path = ['pagesData'];
            var valueBeforeUndo;
            beforeEach(function () {
                this.dal.full.setByPath(path, {
                    page1: {
                        structure: 'hi',
                        data: ''
                    }
                });
                undoRedo.add(snapshotName, editorState);
                valueBeforeUndo = this.dal.full.getByPath(path);
                undoRedo.add(snapshotAfterActionName, editorState);
            });
            describe('redo stack is not empty', function () {
                beforeEach(function () {
                    undoRedo.undo();
                });
                it('should set site jsons to be the same as before undo action was done', function () {
                    undoRedo.redo();

                    var result = this.dal.full.getByPath(path);
                    expect(result).toEqual(valueBeforeUndo);
                });
                it('should return last redoStack item label', function () {
                    var returnedValue = undoRedo.redo();

                    expect(returnedValue).toEqual(snapshotAfterActionName);
                });

                describe('autosave', function () {
                    beforeEach(function () {
                        var pointer = this.ps.pointers.general.getAutosaveInfo();
                        this.dal.set(pointer, {shouldAutoSave: true});

                        autosave.init(this.ps, {
                            AUTOSAVE_TIMEOUT: 10,
                            AUTOSAVE_ACTION_COUNT: 10,
                            SAVE_AFTER_AUTOSAVE_COUNT: 10,
                            DEBOUNCE_WAIT: 2
                        });

                        spyOn(hooks, 'executeHook');
                    });

                    it('should execute autosave hook', function () {
                        undoRedo.redo();

                        expect(hooks.executeHook).toHaveBeenCalledWith(hooks.HOOKS.AUTOSAVE.ACTION);
                    });
                });
            });
            describe('redo stack is empty', function () {
                it('should do nothing', function () {
                    undoRedo.redo();

                    var result = this.dal.full.getByPath(path);
                    expect(result).toEqual(valueBeforeUndo);
                });
            });
        });

        describe('add', function () {
            var snapshotName = 'mySnapshot';
            var editorState = {panel: 'open'};
            it('should be able to undo the action after add', function () {
                undoRedo.add(snapshotName, editorState);

                expect(undoRedo.canUndo()).toBeTruthy();
            });
            it('should reset redo stack', function () {
                undoRedo.add('snapshot1', editorState);
                undoRedo.add('snapshot2', editorState);
                undoRedo.add('snapshot3', editorState);
                undoRedo.undo();
                undoRedo.undo();
                undoRedo.undo();

                undoRedo.add(snapshotName, editorState);

                expect(undoRedo.canRedo()).toBeFalsy();
            });

            describe('autosave', function () {
                beforeEach(function () {
                    var pointer = this.ps.pointers.general.getAutosaveInfo();
                    this.dal.set(pointer, {shouldAutoSave: true});

                    autosave.init(this.ps, {
                        AUTOSAVE_TIMEOUT: 10,
                        AUTOSAVE_ACTION_COUNT: 10,
                        SAVE_AFTER_AUTOSAVE_COUNT: 10,
                        DEBOUNCE_WAIT: 2
                    });

                    spyOn(hooks, 'executeHook');
                });

                it('should execute autosave hook', function () {
                    undoRedo.add(snapshotName, editorState);

                    expect(hooks.executeHook).toHaveBeenCalledWith(hooks.HOOKS.AUTOSAVE.ACTION);
                });
            });
        });

        describe('clear', function(){
            it('should not be able to undo or redo after performing clear when stack contained snapshots', function(){
                undoRedo.add('first snapshot');
                undoRedo.add('second snapshot');
                undoRedo.add('third snapshot');
                undoRedo.undo();

                undoRedo.clear();

                expect(undoRedo.canUndo()).toBe(false);
                expect(undoRedo.canRedo()).toBe(false);
            });

            it('should be able to perform clear more than once', function(){
                undoRedo.add('some snapshot');

                undoRedo.clear();
                undoRedo.clear();

                expect(undoRedo.canUndo()).toBe(false);
                expect(undoRedo.canRedo()).toBe(false);
            });

            it('should be able to undo after clear and then add', function(){
                undoRedo.add('some snapshot');
                undoRedo.add('another snapshot');

                undoRedo.clear();
                undoRedo.add('snapshot after clear');

                expect(undoRedo.canUndo()).toBe(true);
                undoRedo.undo();
                expect(undoRedo.canUndo()).toBe(false);
            });
        });

        describe('getUndoLastSnapshotParams', function () {
            var snapshotName = 'mySnapshot';
            var editorState = {panel: 'open'};

            it('should return the last undo stack item params value', function () {
                undoRedo.add(snapshotName, editorState);

                var result = undoRedo.getUndoLastSnapshotParams();

                expect(result).toEqual(editorState);
            });

            it('should return null in case the undo stack is empty', function () {
                var result = undoRedo.getUndoLastSnapshotParams();

                expect(result).toBeNull();
            });
        });
        describe('getRedoLastSnapshotParams', function () {
            var snapshotName = 'mySnapshot';
            var editorState = {panel: 'open'};

            beforeEach(function () {
                undoRedo.add(snapshotName, editorState);
                undoRedo.add(snapshotName, editorState);
            });

            it('should return the last redo stack item params value', function () {
                undoRedo.undo();

                var result = undoRedo.getRedoLastSnapshotParams();

                expect(result).toEqual(editorState);
            });

            it('should return null in case the undo stack is empty', function () {
                var result = undoRedo.getRedoLastSnapshotParams();

                expect(result).toBeNull();
            });
        });
        describe('canUndo', function () {
            it('should return false if undo stack has less than 2 items', function () {
                var result = undoRedo.canUndo();

                expect(result).toBeFalsy();
            });
            it('should return true if undo stack has at least 2 items', function () {
                undoRedo.add('someLabel', {});
                undoRedo.add('anotherLabel', {});

                var result = undoRedo.canUndo();

                expect(result).toBeTruthy();
            });
        });

        describe('canRedo', function () {
            it('should return false if redo stack is empty', function () {
                var result = undoRedo.canRedo();

                expect(result).toBeFalsy();
            });
            it('should return true if redo stack is not empty', function () {
                undoRedo.add('someSnapshot', {});
                undoRedo.add('anotherSnapshot', {});
                undoRedo.undo();

                var result = undoRedo.canRedo();

                expect(result).toBeTruthy();
            });

        });
    });
});
