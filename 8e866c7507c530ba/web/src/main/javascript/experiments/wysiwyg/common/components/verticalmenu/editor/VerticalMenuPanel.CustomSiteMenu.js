define.experiment.component('wysiwyg.common.components.verticalmenu.editor.VerticalMenuPanel.CustomSiteMenu', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStrategy;

    def.dataTypes(strategy.merge(['Menu']));
});