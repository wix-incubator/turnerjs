describe('Unit: EditorUtils service', function () {

    var undoRedoManager;

    beforeEach(module('angularEditor'));

    beforeEach(function() {
        spyOn(W.UndoRedoManager, 'startTransaction');
        spyOn(W.UndoRedoManager, 'endTransaction');
    });

    beforeEach(inject(function(_undoRedoManager_) {
        undoRedoManager = _undoRedoManager_;
    }));

    describe('Service functionality - ', function() {
        it('should call W.UndoRedoManager.startTransaction when startTransaction is called', function() {
            undoRedoManager.startTransaction();

            expect(W.UndoRedoManager.startTransaction).toHaveBeenCalled();
        });

        it('should call W.UndoRedoManager.endTransaction when endTransaction is called', function() {
            undoRedoManager.endTransaction();

            expect(W.UndoRedoManager.endTransaction).toHaveBeenCalled();
        });
    });
});