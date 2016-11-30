define.experiment.component('wysiwyg.editor.components.panels.FloatingPropertyPanel.NGCore', function(componentDefinition, experimentStrategy){

    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.methods({
        _showPropertyPanel:function () {
            W.Commands.executeCommand(Constants.EditorUI.HIGHLIGHT_PROPERTY_PANEL);
            W.Commands.executeCommand(Constants.EditorUI.OPEN_PROPERTY_PANEL, {src: 'fpp'});
        }
    });
});