define.skin('mock.viewer.skins.NBCRichTextSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    });
    def.html('<div skinPart="richTextContainer"></div>');
});
