define.skin('wysiwyg.editor.skins.inputs.InlineTextLinkInputSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    });
    def.compParts(
        {
            button : { skin: 'wysiwyg.editor.skins.InlineTextLinkSkin' }
        }
    );
    def.html(
        '<div class="clearfix">' +
            '<label skinPart="label"></label>' +
            '<div class="buttonTextArea">' +
                '<span skinPart="prefixText"></span>' +
                '<span skinPart="button"></span>' +
                '<span skinPart="postfixText"></span>' +
            '</div>' +
        '</div>'
    );
    def.css(
        [
            '{margin:5px 0;}',
//            '[state~="hasLabel"] %button%{padding: 5px;}',
//            '[state~="hasLabel"] %label% {display:block;}',
            '[disabled] %label% {opacity:0.5}'
        ]
    );
});
