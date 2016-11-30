define.skin('mock.viewer.skins.TestRichTextSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    });
    def.html('<div skinPart="richTextContainer" class="richTextContainer"></div>');
});

