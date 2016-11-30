/**
 * @class wysiwyg.editor.managers.undoredomanager.TextDataChange
 */
define.Class('wysiwyg.editor.managers.undoredomanager.TextDataChange', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition  */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.resources(['W.Commands', 'W.Utils', 'W.Preview']);

    def.methods({

        startListen:function () {
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.TextDataChange', this, this._onChange);
        },

        stopListen:function () {
            this.resources.W.Commands.unregisterListener(this);
        },

        getPreliminaryActions:function (data) {
            var urmPreliminaryActions = this.injects().UndoRedoManager._constants.PreliminaryActions;
            return [urmPreliminaryActions.SELECT_COMPONENT];
        },

        _onChange:function (data) {
            if (!data.changedComponentIds || data.changedComponentIds.length === 0) {
                return;
            }
            var changeData = {
                type: this.className,
                changedComponentIds: data.changedComponentIds,
                newValue: data.newValue,
                oldValue: data.oldValue
            };

            this.fireEvent(Constants.UrmEvents.DATA_CHANGE_RECORDED, changeData);
            return changeData; // returns value for spec's sake
        },


        undo:function (changeData) {
            this._applyValue(changeData.changedComponentIds[0], changeData.oldValue);
        },

        redo:function (changeData) {
            this._applyValue(changeData.changedComponentIds[0], changeData.newValue);
        },

        _applyValue:function (textCompId, value) {
            var textComp = this.resources.W.Preview.getCompLogicById(textCompId);
            textComp.setMinH(value.minHeight);
            textComp.setHeight(value.height, false, false);
            textComp.fireEvent('autoSized',{ignoreLayout:false});
        }

    });

});
