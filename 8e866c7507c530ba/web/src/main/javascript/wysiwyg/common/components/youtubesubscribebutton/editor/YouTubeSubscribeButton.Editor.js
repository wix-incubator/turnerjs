define.component('Editor.wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.panel({
        logic: 'wysiwyg.common.components.youtubesubscribebutton.editor.YouTubeSubscribeButtonPanel',
        skin: 'wysiwyg.common.components.youtubesubscribebutton.editor.skins.YouTubeSubscribeButtonPanelSkin'
    });

    def.styles(1);

    def.helpIds({
        componentPanel: '/node/20046'
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            }
        }
    });

    def.methods({});

});