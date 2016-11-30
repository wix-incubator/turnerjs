define.experiment.Class('wysiwyg.editor.commandregistrars.ComponentCommandRegistrar.NGCore', function (classDefinition, experimentStrategy) {
    /**@type core.managers.component.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _setSelectedComponentPosSize:strategy.after(function(params){
            this.resources.W.Commands.executeCommand('WEditorCommands.componentLayoutChanged');
        }),

        _setSelectedComponentRotationAngle: strategy.after(function(params){
            this.resources.W.Commands.executeCommand('WEditorCommands.componentLayoutChanged');
        })
    });
});



