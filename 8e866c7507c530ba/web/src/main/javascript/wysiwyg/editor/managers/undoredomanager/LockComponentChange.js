define.Class('wysiwyg.editor.managers.undoredomanager.LockComponentChange', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.undoredomanager.BaseChange');

    def.resources(['W.Editor', 'W.Commands']);

    def.methods({

        startListen:function () {
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.ComponentLockStatusChanged', this, this._onChange);
        },

        stopListen:function () {
            this.resources.W.Commands.unregisterListener(this);
        },

        undo: function (changeData) {
            var compEditBox = this.resources.W.Editor.getComponentEditBox();
            compEditBox.undoComponentsLockStatus(changeData);
        },

        redo: function (changeData) {
            var compEditBox = this.resources.W.Editor.getComponentEditBox();
            compEditBox.redoComponentsLockStatus(changeData);
        }
    });
});
