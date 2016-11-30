W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').factory('undoRedoManager', function () {
        return {
            startTransaction: W.UndoRedoManager.startTransaction.bind(W.UndoRedoManager),
            endTransaction: W.UndoRedoManager.endTransaction.bind(W.UndoRedoManager)
        };
    });
});