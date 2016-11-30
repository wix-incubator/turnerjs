define.Class('wysiwyg.editor.managers.undoredomanager.RotationChange', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.resources(['W.Preview', 'W.Commands']);

    def.methods({

        startListen:function () {
            this.resources.W.Preview.getPreviewManagers().Layout.addEvent('updateAngle', this._onChange);
        },

        stopListen:function () {
            this.resources.W.Preview.getPreviewManagers().Layout.removeEvent('updateAngle', this._onChange);
        },

        undo: function (changeData) {
            this._updateComponentAngle(changeData, changeData.oldDimensions.angle);
        },

        redo: function (changeData) {
            this._updateComponentAngle(changeData,  changeData.newDimensions.angle);
        },

        _updateComponentAngle: function(changeData, angleToApply) {
            var editedComponent = this.resources.W.Preview.getCompLogicById(changeData.changedComponentIds[0]);
            var params = {
                rotationAngle: angleToApply,
                editedComponent:  editedComponent,
                updateControllers: true
            };
            this.resources.W.Commands.executeCommand("WEditorCommands.SetSelectedCompRotationAngle", params);
            editedComponent.saveCurrentDimensions();
        },

        getPreliminaryActions:function () {
            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;
            return [urmPreliminaryActions.SELECT_COMPONENT];
        }
    });
});
