define.experiment.component('wysiwyg.editor.components.panels.BackgroundDesignPanel.BackgroundReplaceDesign',
function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    var strategy = experimentStrategy;

    def.methods({
        canGoBack : function() {
            return false;
        }
    });
});

