define.component('Editor.wysiwyg.common.components.imagebutton.viewer.ImageButton', function(componentDefinition, definitionStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.panel({
        logic: 'wysiwyg.common.components.imagebutton.editor.ImageButtonPanel',
        skin: 'wysiwyg.common.components.imagebutton.editor.skins.ImageButtonPanelSkin'
    });

    def.styles(1);

    def.helpIds({
        componentPanel: '/node/21349'
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            },
            custom: [
                {
                    label: 'LINK_LINK_TO',
                    command: 'WEditorCommands.OpenLinkDialogCommand',
                    commandParameter: {
                        position: 'center'
                    },
                    commandParameterDataRef: 'SELF'
                }
            ]
        }
    });
});
