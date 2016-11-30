define.experiment.Class('wysiwyg.editor.managers.WDialogManager.FloatingSkinForSaveNotice', function (classDefinition) {
    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.methods({
        openSaveSuccessDialog: function (afterSecondSave) {
            if (afterSecondSave) {
                this.openSomePublishDialog('_saveNoticeDialog', 'wysiwyg.editor.components.dialogs.SaveNoticeDialog', true);
            }
            else {
                this.openSomePublishDialog('_saveSuccessDialog', 'wysiwyg.editor.components.dialogs.SaveSuccessDialog');
            }
        }
    });
});
