define.component('Editor.wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.panel({
        logic: 'wysiwyg.common.components.pinitpinwidget.editor.PinItPinWidgetPanel',
        skin: 'wysiwyg.common.components.pinitpinwidget.editor.skins.PinItPinWidgetPanelSkin'
    });

    def.styles(1);

    def.helpIds({
        componentPanel: '/node/21922'
    });

    def.methods({});

});