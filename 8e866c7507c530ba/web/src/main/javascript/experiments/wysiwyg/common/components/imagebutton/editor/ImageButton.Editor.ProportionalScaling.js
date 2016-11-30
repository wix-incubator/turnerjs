define.experiment.component('Editor.wysiwyg.common.components.imagebutton.viewer.ImageButton.ProportionalScaling', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    var strategy = experimentStrategy;

    def.statics({
        EDITOR_META_DATA: strategy.merge({
            general: { proportionalResize: true }
        })
    });
});
