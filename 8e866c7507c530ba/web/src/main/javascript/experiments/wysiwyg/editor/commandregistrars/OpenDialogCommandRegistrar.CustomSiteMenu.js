define.experiment.Class('wysiwyg.editor.commandregistrars.OpenDialogCommandRegistrar.CustomSiteMenu', function(classDefinition, experimentStrategy){

    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        registerCommands: strategy.after(function () {
            this.resources.W.Commands.registerCommandAndListener("W.EditorCommands.CustomMenu.OpenAddLinkDialog", this, this._openCustomMenuAddLinkDialog);
            this.resources.W.Commands.registerCommandAndListener("W.EditorCommands.CustomMenu.OpenEditItemSettingsDialog", this, this._openCustomMenuEditItemSettingsDialog);
        }),

        _openCustomMenuAddLinkDialog: function(params) {
            this.resources.W.EditorDialogs.openCustomMenuAddLinkDialog(params);
        },

        _openCustomMenuEditItemSettingsDialog: function(params) {
            this.resources.W.EditorDialogs.openCustomMenuEditItemSettingsDialog(params);
        }
    });
});