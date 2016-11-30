define.skin('wysiwyg.viewer.skins.contactform.LabelSkinDefault', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.html ('<p skinpart="label"></p>');
    def.css(
        [
            '[state~="hasLabel"] %label% {}',
            '[disabled] %label% {}'
        ]
    );
});

