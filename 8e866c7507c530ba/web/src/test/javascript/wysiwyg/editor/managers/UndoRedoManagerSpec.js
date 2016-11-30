describe('UndoRedoManagerSpec', function() {
    beforeEach(function() {
        var mockViewer = getPlayGround();

        mockViewer.getCurrentPageId = function() {
            return "mainPage";
        };

        var PreviewManager = null;
        var EditorManager = null;
        this._undoRedoManager = null;
        var CompData = null;
        var DataManager = null;
        this.resource.getResources(['W.Preview', 'W.Editor', 'W.UndoRedoManager', 'W.ComponentData', 'W.Data', 'W.Theme'], function(resourceMap){
            PreviewManager = resourceMap.W.Preview;
            EditorManager = resourceMap.W.Editor;
            this._undoRedoManager = resourceMap.W.UndoRedoManager;
            CompData = resourceMap.W.ComponentData;
            DataManager = resourceMap.W.Data;
            spyOn(PreviewManager, 'getPreviewManagers').andReturn(W);
            spyOn(PreviewManager, 'goToPage').andReturn(null);

            spyOn(EditorManager, 'onComponentChanged').andReturn(undefined);
            spyOn(this._undoRedoManager, '_getComponentPropDataManager').andReturn(CompData);
            spyOn(this._undoRedoManager, '_getComponentDataManager').andReturn(DataManager);
            spyOn(this._undoRedoManager, '_getCurrentPageId').andReturn("mainPage");
            spyOn(this._undoRedoManager, '_handlePreliminaryAction');
        }.bind(this));

        waitsFor(function(){
            return PreviewManager &&  EditorManager && this._undoRedoManager && CompData && DataManager;
        }.bind(this), 'all managers to be ready', 1000);

        runs(function(){
            this._undoRedoManager._onSiteLoaded();
        });
    });


    describe('Initialize', function() {
        describe('Stacks', function() {
            describe('History Stack', function() {
                it('should create an _undoStack array', function(){
                    expect(this._undoRedoManager._undoStack).toBeOfType('array');
                });

                it('_undoStack should be empty on initialize', function(){
                    expect(this._undoRedoManager._undoStack.length).toEqual(0);
                });

                it('should create an _redoStack array', function(){
                    expect(this._undoRedoManager._redoStack).toBeOfType('array');
                });

                it('_redoStack should be empty on initialize', function(){
                    expect(this._undoRedoManager._redoStack.length).toEqual(0);
                });

                it('should create an _transactionStack array', function(){
                    expect(this._undoRedoManager._transactionStack).toBeOfType('array');
                });

                it('_transactionStack should be empty on initialize', function(){
                    expect(this._undoRedoManager._transactionStack.length).toEqual(0);
                });
            });

            describe('Modules', function() {
                it('should instantiate Layout module', function(){
                    expect(this._undoRedoManager._layoutData).toBeDefined();
                });

                it('should instantiate Component Data module', function(){
                    expect(this._undoRedoManager._positionData).toBeDefined();
                });

                it('should instantiate Position Data module', function(){
                    expect(this._undoRedoManager._compPropData).toBeDefined();
                });
            });

            describe('SiteLoad', function() {
                testRequire().resources('W.Commands');

                it('should register command listener by name on SiteLoad', function(){
                    spyOn(this.W.Commands, 'registerCommandListenerByName');

                    this._undoRedoManager.initialize();
//                    W.Managers.fireEvent('deploymentCompleted');

                    expect(this.W.Commands.registerCommandListenerByName).toHaveBeenCalled();
                })
            });
        });
    });

    describe('_onSiteLoaded', function() {
        beforeEach(function() {
            spyOn(this._undoRedoManager, '_onChange');
            this._undoRedoManager._getComponentDataManager.andReturn(W.ComponentData);
            this._undoRedoManager._onSiteLoaded();
        });

        it('should call _onChange on dataChanged events fired from compPropData module', function(){
            this._undoRedoManager._compPropData.fireEvent(Constants.DataEvents.DATA_CHANGED);

            waitsFor(function() {
                return this._undoRedoManager._onChange.callCount > 0;
            }.bind(this), "_onChange to be called", 1000);
        });

        it('should call _onChange on dataChanged events fired from Layout module', function(){
            this._undoRedoManager._layoutData.fireEvent(Constants.DataEvents.DATA_CHANGED);

            waitsFor(function() {
                return this._undoRedoManager._onChange.callCount > 0;
            }.bind(this), "_onChange to be called", 1000);
        });

        it('should call _onChange on dataChanged events fired from Position and Size module', function(){
            this._undoRedoManager._positionData.fireEvent(Constants.DataEvents.DATA_CHANGED);

            waitsFor(function() {
                return this._undoRedoManager._onChange.callCount > 0;
            }.bind(this), "_onChange to be called", 1000);
        });

    });

    describe('_onChange', function() {
        it('should reset future stack if undo was called and future stack is populated', function(){
            this._undoRedoManager._redoStack[0] = {};
            expect(this._undoRedoManager._redoStack.length).toEqual(1);

            this._undoRedoManager._onChange({
                sender: null
            });

            expect(this._undoRedoManager._redoStack.length).toEqual(0);
        });

        it('should add change to TRANSACTION stack if isInTransaction', function(){
            this._undoRedoManager._isInTransaction = true;

            this._undoRedoManager._onChange({});

            expect(this._undoRedoManager._transactionStack.length).toEqual(1);
        });
    });

    describe('undo', function() {
        it('should return if undoable', function(){
            spyOn(this._undoRedoManager, '_isUndoable');

            var result = this._undoRedoManager.undo();

            expect(result).toBeFalsy();
        });

        it('should clear change data from _undoStack', function() {
            spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();
            spyOn(this._undoRedoManager, '_removeItemFromStack').andReturn();
            this._undoRedoManager._undoStack[0] = {
                dataItemId: "someId",
                pageId: "mainPage",
                oldValue: {key:"value1"},
                newValue: {key:"value2"},
                type: "wysiwyg.editor.managers.undoredomanager.PropertyChange"
            };

            this._undoRedoManager.undo();

            expect(this._undoRedoManager._removeItemFromStack).toHaveBeenCalledWith(this._undoRedoManager._undoStack);
        });

        it('should add change data to _redoStack', function() {
            spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();

            var changeData = {
                dataItemId: "someId",
                oldValue: {key:"value1"},
                newValue: {key:"value2"},
                pageId: "mainPage",
                type: "wysiwyg.editor.managers.undoredomanager.PropertyChange"
            };
            this._undoRedoManager._undoStack[0] = changeData;

            this._undoRedoManager.undo();

            expect(this._undoRedoManager._redoStack[0]).toEqual(changeData);
        });

        it('should store undo change data in _redoStack', function() {
            spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();
            var changeData = {
                dataItemId: "someId",
                oldValue: {key:"value1"},
                newValue: {key:"value2"},
                pageId: "mainPage",
                type: "wysiwyg.editor.managers.undoredomanager.PropertyChange"
            };
            this._undoRedoManager._undoStack[0] = changeData;
            expect(this._undoRedoManager._redoStack.length).toEqual(0);

            this._undoRedoManager.undo();

            expect(this._undoRedoManager._redoStack.length).toEqual(1);
        });

        it('should remove first item from _undoStack', function() {
            spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();
            var changeData = {
                dataItemId: "someId",
                oldValue: {key:"value1"},
                newValue: {key:"value2"},
                pageId: "mainPage",
                type: "wysiwyg.editor.managers.undoredomanager.PropertyChange"
            };
            this._undoRedoManager._undoStack[0] = changeData;
            this._undoRedoManager._undoStack[1] = {};
            expect(this._undoRedoManager._undoStack.length).toEqual(2);

            this._undoRedoManager.undo();

            expect(this._undoRedoManager._undoStack.length).toEqual(1);
        });

        it('should refresh component edit box', function() {
            spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();
            spyOn(this._undoRedoManager, '_refreshComponentEditBox').andReturn();
            var changeData = {
                dataItemId: "someId",
                oldValue: {key:"value1"},
                newValue: {key:"value2"},
                pageId: "mainPage",
                type: "wysiwyg.editor.managers.undoredomanager.PropertyChange"
            };
            this._undoRedoManager._undoStack[0] = changeData;

            this._undoRedoManager.undo();

            expect(this._undoRedoManager._refreshComponentEditBox).toHaveBeenCalled();
        });
    });

    describe('redo', function() {
        it('should return if redoable', function(){
            spyOn(this._undoRedoManager, '_isRedoable');

            var result = this._undoRedoManager.redo();

            expect(result).toBeFalsy();
        });

        it('should clear change data from _redoStack', function() {
            spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();
            spyOn(this._undoRedoManager, '_removeItemFromStack').andReturn();
            this._undoRedoManager._redoStack[0] = {
                dataItemId: "someId",
                oldValue: {key:"value1"},
                newValue: {key:"value2"},
                pageId: "mainPage",
                type: "wysiwyg.editor.managers.undoredomanager.PropertyChange"
            };

            this._undoRedoManager.redo();

            expect(this._undoRedoManager._removeItemFromStack).toHaveBeenCalledWith(this._undoRedoManager._redoStack);
        });

        it('should add change data to _undoStack', function() {
            spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();
            var changeData = {
                dataItemId: "someId",
                oldValue: {key:"value1"},
                newValue: {key:"value2"},
                pageId: "mainPage",
                type: "wysiwyg.editor.managers.undoredomanager.PropertyChange"
            };
            this._undoRedoManager._redoStack[0] = changeData;

            this._undoRedoManager.redo();

            expect(this._undoRedoManager._undoStack[0]).toEqual(changeData);
        });


        it('should store undo change data in _undoStack', function() {
            spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();
            var changeData = {
                dataItemId: "someId",
                oldValue: {key:"value1"},
                newValue: {key:"value2"},
                pageId: "mainPage",
                type: "wysiwyg.editor.managers.undoredomanager.PropertyChange"
            };
            this._undoRedoManager._redoStack[0] = changeData;
            expect(this._undoRedoManager._undoStack.length).toEqual(0);

            this._undoRedoManager.redo();

            expect(this._undoRedoManager._undoStack.length).toEqual(1);
        });

        it('should remove first item from _redoStack', function() {
            spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();
            var changeData = {
                dataItemId: "someId",
                oldValue: {key:"value1"},
                newValue: {key:"value2"},
                pageId: "mainPage",
                type: "wysiwyg.editor.managers.undoredomanager.PropertyChange"
            };
            this._undoRedoManager._redoStack[0] = changeData;
            this._undoRedoManager._redoStack[1] = {};
            expect(this._undoRedoManager._redoStack.length).toEqual(2);

            this._undoRedoManager.redo();

            expect(this._undoRedoManager._redoStack.length).toEqual(1);
        });

        it('should refresh component edit box', function() {
            spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();
            spyOn(this._undoRedoManager, '_refreshComponentEditBox').andReturn();
            var changeData = {
                dataItemId: "someId",
                oldValue: {key:"value1"},
                newValue: {key:"value2"},
                pageId: "mainPage",
                type: "wysiwyg.editor.managers.undoredomanager.PropertyChange"
            };
            this._undoRedoManager._undoStack[0] = changeData;

            this._undoRedoManager.undo();

            expect(this._undoRedoManager._refreshComponentEditBox).toHaveBeenCalled();
        });
    });

    describe('Transactions', function() {
        describe('_undoTransaction', function() {
            it('should apply changes for each of the transaction data cells', function(){
                spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();
                var transactionData = [
                    { type: "wysiwyg.editor.managers.undoredomanager.PropertyChange" },
                    { type: "wysiwyg.editor.managers.undoredomanager.PropertyChange" },
                    { type: "wysiwyg.editor.managers.undoredomanager.PropertyChange" }
                ];

                this._undoRedoManager._undoTransaction(transactionData);

                expect(this._undoRedoManager._applyChangeMap).toHaveBeenCalledXTimes(transactionData.length);
                expect(this._undoRedoManager._applyChangeMap).toHaveBeenCalledWith('undo', transactionData[0], "wysiwyg.editor.managers.undoredomanager.PropertyChange");
            });
        });

        describe('_redoTransaction', function() {
            it('should apply changes for each of the transaction data cells', function(){
                spyOn(this._undoRedoManager, '_applyChangeMap').andReturn(false);
                var transactionData = [
                    { type: "wysiwyg.editor.managers.undoredomanager.PropertyChange" },
                    { type: "wysiwyg.editor.managers.undoredomanager.PropertyChange" },
                    { type: "wysiwyg.editor.managers.undoredomanager.PropertyChange" }
                ];

                this._undoRedoManager._redoTransaction(transactionData);

                expect(this._undoRedoManager._applyChangeMap).toHaveBeenCalledXTimes(transactionData.length);
                expect(this._undoRedoManager._applyChangeMap).toHaveBeenCalledWith('redo', transactionData[0], "wysiwyg.editor.managers.undoredomanager.PropertyChange");
            });
        });

        describe('startTransaction', function() {
            it('should raise transaction flag', function(){
                this._undoRedoManager.startTransaction();

                expect(this._undoRedoManager._isInTransaction).toBeTruthy();
            });

        });

        describe('endTransaction', function() {
            it('should set transaction flag to FALSE', function(){
                spyOn(this._undoRedoManager, '_getRichTextEditor').andReturn({isInEditingMode: false});
                this._undoRedoManager.endTransaction();

                expect(this._undoRedoManager._isInTransaction).toBeFalsy();
            });

        });

        describe('_isTransactionData', function() {
            it('should validate changemap is a transaction of type array', function(){
                expect(this._undoRedoManager._isTransactionData({})).toBeFalsy();
                expect(this._undoRedoManager._isTransactionData([1,2,3])).toBeFalsy();
                expect(this._undoRedoManager._isTransactionData([])).toBeFalsy();
                expect(this._undoRedoManager._isTransactionData({notTransaction:[]})).toBeFalsy();
                expect(this._undoRedoManager._isTransactionData({transaction:{}})).toBeFalsy();
                expect(this._undoRedoManager._isTransactionData({transaction:[]})).toBeTruthy();
            });
        });
    });

    describe('_resetFutureStack', function() {
        it('should check if isRedoable', function(){
            this._undoRedoManager._redoStack[0] = {};
            this._undoRedoManager._redoStack[1] = {};

            this._undoRedoManager._resetFutureStack();

            expect(this._undoRedoManager._redoStack.length).toEqual(0);
        });
    });

    describe('_isUndoable', function() {
        it('should return false if _undoStack is empty', function(){
            this._undoRedoManager._undoStack = [];
            expect(this._undoRedoManager._isUndoable()).toBeFalsy();
        });

        it('should return true if _undoStack is populated', function(){
            this._undoRedoManager._undoStack[0] = {};
            expect(this._undoRedoManager._isUndoable()).toBeTruthy();
        });
    });

    describe('_isRedoable', function() {
        it('should return false if _redoStack is empty', function() {
            this._undoRedoManager._redoStack = [];
            expect(this._undoRedoManager._isRedoable()).toBeFalsy();
        });

        it('should return true if _redoStack is populated', function(){
            this._undoRedoManager._redoStack[0] = {};
            expect(this._undoRedoManager._isRedoable()).toBeTruthy();
        });
    });

    describe('_removeItemFromStack', function() {
        it('should remove an item from a specified stack', function(){
            var historyStack = this._undoRedoManager._undoStack;

            historyStack[0] = {dada: "gaga"};
            historyStack[1] = {baba: "lala"};
            this._undoRedoManager._removeItemFromStack(historyStack);

            expect(historyStack.length).toEqual(1);
            expect(historyStack[0]).toEqual({baba: "lala"});
        });
    });

    describe('_applyChangeMap', function() {
        it('should refer layoutData changes to Layout module', function() {
            spyOn(this._undoRedoManager._layoutData, 'undo').andReturn();

            this._undoRedoManager._applyChangeMap('undo', {}, this._undoRedoManager._constants.Modules.LAYOUT_CHANGE);

            expect(this._undoRedoManager._layoutData.undo).toHaveBeenCalled()
        });

        it('should refer componentProperty changes to compProp module', function() {
            spyOn(this._undoRedoManager._compPropData, 'redo').andReturn();

            this._undoRedoManager._applyChangeMap('redo', {}, this._undoRedoManager._constants.Modules.COMP_DATA_CHANGE);

            expect(this._undoRedoManager._compPropData.redo).toHaveBeenCalled()
        });

        it('should refer _positionProperty changes to Position module', function() {
            spyOn(this._undoRedoManager._positionData, 'redo').andReturn();

            this._undoRedoManager._applyChangeMap('redo', {}, this._undoRedoManager._constants.Modules.POSITION_CHANGE);

            expect(this._undoRedoManager._positionData.redo).toHaveBeenCalled()
        });
    });

    describe('', function() {

        function execTrans() {
            this._undoRedoManager.startTransaction();
            this._undoRedoManager._onChange({
                dataItemId: "someId",
                oldValue: {key:"value1"},
                newValue: {key:"value2"},
                pageId: "mainPage",
                type: "wysiwyg.editor.managers.undoredomanager.PropertyChange"
            });
            return this._undoRedoManager.endTransaction();
        }

        beforeEach(function () {
            spyOn(this._undoRedoManager, '_handleFinalizingActions');
        });

        describe('endTransaction', function() {
            it('should return increasing transaction id', function () {
                spyOn(this._undoRedoManager, '_getRichTextEditor').andReturn({isInEditingMode: false});

                var prev = execTrans.call(this),
                    next;

                for (var i = 0; i < 5; ++i) {
                    next = execTrans.call(this);
                    expect(next).toEqual(prev + 1);
                    prev = next;
                }
            });
        });

        describe('removeTransactionAndAfter', function() {
            function addFiveTransactions() {
                for (var i = 0; i < 5; i++) {
                    execTrans.call(this);
                }
            }

            beforeEach(function () {
                this._undoRedoManager._resetStacks();
                spyOn(this._undoRedoManager, '_getRichTextEditor').andReturn({isInEditingMode: false});
                addFiveTransactions.call(this);
            });

            it('should remove transactions after given', function () {
                this._undoRedoManager.removeTransactionAndAfter(3);
                expect(this._undoRedoManager._undoStack.length).toBe(2);
            });

            it('should remove from redo stack', function () {
                spyOn(this._undoRedoManager, '_applyChangeMap').andReturn();
                spyOn(this._undoRedoManager, '_getEditedComponent').andReturn();

                this._undoRedoManager.undo();
                this._undoRedoManager.removeTransactionAndAfter(3);

                expect(this._undoRedoManager._undoStack.length).toBe(2);
                expect(this._undoRedoManager._redoStack.length).toBe(0);
            });
        });
    });

});


//Experiments:
//------------

    describe('Addition and removal of events', function() {
        beforeEach(function() {
            this._undoRedoManager = W.UndoRedoManager;
            W.Layout.$events = {};
            W.Data.$events = {};
            W.Theme.$events = {};
            W.ComponentData.$events = {};
        });

        it('should add 1 event of each type after startTransaction, and remove it on endTransaction', function() {
            spyOn(W.Preview, 'getPreviewManagers').andReturn({Layout: W.Layout, Data:W.Data, ComponentData: W.ComponentData, Commands: W.Commands, Theme:W.Theme});

            this._undoRedoManager.startTransaction();

            expect(W.Layout.$events.updateAnchors.length).toBe(1);
            expect(W.Layout.$events.updatePosition.length).toBe(1);
            expect(W.Layout.$events.updateSize.length).toBe(1);
            expect(W.Data.$events.undoDataChangedEvent.length).toBe(1);

            spyOn(this._undoRedoManager, '_getRichTextEditor').andReturn({isInEditingMode: false});

            this._undoRedoManager.endTransaction();

            expect(W.Layout.$events.updateAnchors).toBe(undefined);
            expect(W.Layout.$events.updatePosition).toBe(undefined);
            expect(W.Layout.$events.updateSize).toBe(undefined);
            expect(W.Data.$events.undoDataChangedEvent).toBe(undefined);
        });
});

//            spyOn(this.urlBuilder, '_getCurrentState').andReturn("");
//            var result = this.urlBuilder.buildStateLessUrl( this.baseUrl , this.urlParams, this.mockComponent, this.appData);
//            expect(result).toBe("http://acme.com/pageId/title?instance=INSTANCE&section-url=http%3A%2F%2Facme.com%2FpageId%2Ftitle%3F&target=_self&width=0&cacheKiller=CK&compId=tpaComp1")
