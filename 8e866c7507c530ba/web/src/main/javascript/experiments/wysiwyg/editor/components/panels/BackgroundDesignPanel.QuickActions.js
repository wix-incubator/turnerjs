define.experiment.component("wysiwyg.editor.components.panels.BackgroundDesignPanel.QuickActions", function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    var strategy = experimentStrategy;

    def.methods({
        initialize: strategy.after(function(compId, viewNode, args) {
            this._breadcrumbs = ["designPanel"];
        })
    });
});