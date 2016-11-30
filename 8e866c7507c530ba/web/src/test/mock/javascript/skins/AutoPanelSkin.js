define.skin('wysiwyg.editor.skins.panels.base.AutoPanelSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.html('<div skinPart="content"></div>');
});