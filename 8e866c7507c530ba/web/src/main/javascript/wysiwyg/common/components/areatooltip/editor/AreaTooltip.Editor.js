define.component('Editor.wysiwyg.common.components.areatooltip.viewer.AreaTooltip', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.panel({
        logic: 'wysiwyg.common.components.areatooltip.editor.AreaTooltipPanel',
        skin: 'wysiwyg.common.components.areatooltip.editor.skins.AreaTooltipPanelSkin'
    });

    def.styles(1);

    def.methods({});

});