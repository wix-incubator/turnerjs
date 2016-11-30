define.experiment.component('wysiwyg.editor.components.EditorUI.ExitMobileModeEditorToggle', function(compDefinition, experimentStrategy){
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;


    def.methods({
        _showHiddenElementsPanelOnce: function(event){
            // TODO: Somehow... check if exitMobileButton was just deleted and cancel this shit
            this._mobileHideCommand.unregisterListener(this);
            W.Commands.executeCommand('WEditorCommands.MobileHiddenElements');
        }
    });
});