define.experiment.newComponent('Editor.wysiwyg.common.components.rssbutton.viewer.RSSButton.BlogRss.New', function(componentDefinition, definitionStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.panel({
        logic: 'wysiwyg.common.components.rssbutton.editor.RSSButtonPanel',
        skin: 'wysiwyg.common.components.rssbutton.editor.skins.RSSButtonPanelSkin'
    });

    def.styles(1);

    def.helpIds({
        componentPanel: '/node/21349999'
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            }
        }
    });
});
