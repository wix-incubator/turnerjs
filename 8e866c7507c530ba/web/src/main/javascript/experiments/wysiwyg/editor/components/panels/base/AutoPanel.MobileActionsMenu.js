define.experiment.component('wysiwyg.editor.components.panels.base.AutoPanel.MobileActionsMenu', function (componentDefinition, experimentStrategy) {
    /**@type  core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        addMobileActionsMenuPreviewField: function (quickActionsData, zoom) {
            return this._addField(
                "wysiwyg.editor.components.inputs.MobileActionsMenuPreview",
                "wysiwyg.editor.skins.inputs.MobileActionsMenuPreviewSkin",
                {
                    quickActionsData: quickActionsData,
                    defaultZoom: zoom
                }
            );
        }
    });
});