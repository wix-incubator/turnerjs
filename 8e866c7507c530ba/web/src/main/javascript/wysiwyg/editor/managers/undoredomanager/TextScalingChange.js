define.Class('wysiwyg.editor.managers.undoredomanager.TextScalingChange', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.resources(['W.Editor', 'W.Commands']);

    def.methods({
        startListen: function() {
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.TextScalingChange', this, this._onChange);
        },

        stopListen: function() {
            this.resources.W.Commands.unregisterListener(this);
        },

        getPreliminaryActions: function() {
            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;
            return [urmPreliminaryActions.SELECT_COMPONENT, urmPreliminaryActions.OPEN_COMPONENT_PANEL];
        },

        _onChange:function (changeData) {
            var editedComponent = this.resources.W.Editor.getEditedComponent();
            if (!editedComponent) {
                return;
            }
            changeData.type = this.className;
            changeData.changedComponentIds = [editedComponent.getComponentUniqueId()]; //should be unique? not sure...

            this.fireEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, changeData);
            return changeData;
        },

        undo: function(changeData) {
            var changedComponent = W.Preview.getCompLogicById(changeData.changedComponentIds[0]);
            changedComponent.setScale(changeData.oldValue);
        },

        redo: function(changeData) {
            var changedComponent = W.Preview.getCompLogicById(changeData.changedComponentIds[0]);
            changedComponent.setScale(changeData.newValue);
        }
    });
});
