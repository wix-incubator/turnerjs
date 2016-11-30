define.experiment.Class('wysiwyg.editor.commandregistrars.OpenDialogCommandRegistrar.RemovePrepublishDialog', function(classDefinition, experimentStrategy){

    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        // ugly patch to prevent prepublish dialog from be opened before publish action
        _openPublishDialogByAppType: function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.Publish');
        }
    });
});