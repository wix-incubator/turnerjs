define.skin('wysiwyg.editor.skins.inputs.LabelSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    })
    def.html('<div skinpart="label"></div>');
    def.css(
        [
            '%label% {line-height: 2em;}',
            '[disabled]{opacity:0.5}'
        ]
    );
});
