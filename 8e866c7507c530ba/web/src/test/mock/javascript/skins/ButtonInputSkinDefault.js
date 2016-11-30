define.skin('wysiwyg.viewer.skins.contactform.ButtonInputSkinDefault', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    });
    def.compParts(
        {
            button : { skin: 'wysiwyg.viewer.skins.contactform.ButtonBaseSkinDefault' }
            //button : { skin: 'wysiwyg.editor.skins.buttons.ButtonBaseSkin' }
        }
    );
    def.html(
        '<label skinpart="label"></label>' +
        '<div skinpart="button"></div>'
    );
    def.css(
        [
            '[state~="hasLabel"] %button%{ }',
            '[state~="hasLabel"] %label% {}',
            '[disabled] %label% {}'
        ]
    );
});
