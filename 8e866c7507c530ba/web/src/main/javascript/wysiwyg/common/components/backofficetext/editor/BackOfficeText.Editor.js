define.component('Editor.wysiwyg.common.components.backofficetext.viewer.BackOfficeText', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.panel({
        logic: 'wysiwyg.common.components.backofficetext.editor.BackOfficeTextPanel',
        skin: 'wysiwyg.common.components.backofficetext.editor.skins.BackOfficeTextPanelSkin'
    });

    def.styles(1);

    def.helpIds({
        chooseStyle: ''
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings:true,
                design:true
            }
        }
    });

    def.methods({});

});