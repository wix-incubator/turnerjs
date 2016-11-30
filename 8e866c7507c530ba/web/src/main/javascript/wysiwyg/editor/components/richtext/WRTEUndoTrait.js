define.Class('wysiwyg.editor.components.richtext.WRTEUndoTrait', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.methods({
        _startUndoTransaction: function(size, data, migratedText) {
            if (this._undoRedoManager._isInTransaction) {
                this._undoRedoManager.endTransaction();
            }
            this._dataBeforeStartEditing = migratedText || data;
            this._heightBeforeStartEditing = size.y;
            this._minHeightBeforeStartEditing = this._editedComponent.getSizeLimits() && this._editedComponent.getSizeLimits().minH;
            this._undoRedoManager.startTransaction();
        },

        _handleUndo: function(isEmptyText) {
            var undoData = this._createTextUndoData();
            if (this._wasTextComponentChanged(undoData)) {
                this.resources.W.Commands.executeCommand('WEditorCommands.TextDataChange', undoData);
            }
            if(isEmptyText) {
                //cancel current transaction - text component will be deleted later
                this._setComponentText(this.__dataBeforeEditing);
                this._undoRedoManager.cancelCurrentTransaction();
            }
            else {
                this._undoRedoManager.endTransaction();
            }
        },

        _wasTextComponentChanged: function(data) {
            var utils = this.resources.W.Utils;
            return !utils.areObjectsEqual(data.oldValue, data.newValue);

        },

        _createTextUndoData: function() {
            var textComp = this._editedComponent;
            var compHeight = this.getComponentSize().y;
            var data =  {
                changedComponentIds: [textComp.getComponentId()],
                oldValue: {height: this._heightBeforeStartEditing, minHeight: this._minHeightBeforeStartEditing},
                newValue: {height: compHeight, minHeight: textComp.getSizeLimits().minH}
            };
            return data;
        }
    });
});