define.experiment.Class('wysiwyg.editor.commandregistrars.OpenDialogCommandRegistrar.CustomMenu', function(classDefinition, experimentStrategy){

    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        registerCommands: strategy.after(function () {
            this.resources.W.Commands.registerCommandAndListener("WEditorCommands.CustomMenu.ManageMenuItemsDialog", this, this._openCustomMenuManageMenuItemsDialog);
            this.resources.W.Commands.registerCommandAndListener("W.EditorCommands.CustomMenu.OpenAddPageItemsDialog", this, this._openCustomMenuAddPageItemsDialog);
            this.resources.W.Commands.registerCommandAndListener("W.EditorCommands.CustomMenu.OpenManageMenuItemsDialog", this, this._openCustomMenuManageMenuItemsDialog);
            this.resources.W.Commands.registerCommandAndListener("W.EditorCommands.CustomMenu.OpenAddLinkDialog", this, this._openCustomMenuAddLinkDialog);
            this.resources.W.Commands.registerCommandAndListener("W.EditorCommands.CustomMenu.OpenEditItemSettingsDialog", this, this._openCustomMenuEditItemSettingsDialog);
            this.resources.W.Commands.registerCommandAndListener("W.EditorCommands.CustomMenu.ConfirmDetachDialog", this, this._openCustomMenuConfirmDetachDialog);
        }),

        _openCustomMenuManageMenuItemsDialog: function(params){
            this.resources.W.EditorDialogs.openCustomMenuManageMenuItemsDialog(params);
        },
        _openCustomMenuAddPageItemsDialog: function(params) {
            this.resources.W.EditorDialogs.openCustomMenuAddPageItemsDialog(params);
        },

        _openCustomMenuManageMenuItemsDialog: function(params) {
            this.resources.W.EditorDialogs.openCustomMenuManageMenuItemsDialog(params);
        },

        _openCustomMenuAddLinkDialog: function(params) {
            this.resources.W.EditorDialogs.openCustomMenuAddLinkDialog(params);
        },

        _openCustomMenuEditItemSettingsDialog: function(params) {
            this.resources.W.EditorDialogs.openCustomMenuEditItemSettingsDialog(params);
        },

        _openCustomMenuConfirmDetachDialog: function(params){
            this.resources.W.EditorDialogs.openCustomMenuConfirmDetachDialog(params);
        }

    });
});