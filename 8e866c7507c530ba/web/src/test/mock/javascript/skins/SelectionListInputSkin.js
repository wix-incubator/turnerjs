define.skin('wysiwyg.editor.skins.inputs.SelectionListInputSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    })
    def.html('<label skinpart="label"></label>' +
        '<div skinPart="collection"></div>');
    def.css(
        [
            '{position:relative;}',
            '%collection% { border-bottom:1px solid #fff; overflow:hidden;}',
            '[disabled] %label% {opacity:0.5}'
        ]
    );
});
