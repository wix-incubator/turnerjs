define.skin('wysiwyg.viewer.skins.contactform.ButtonBaseSkinDefault', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams();
    def.compParts();
    def.html(
        '<div skinpart="icon"></div>' +
        '<div skinpart="label"></div>'
    );
    def.css(
        [
            '{}',
            ':hover {}',
            '%icon% {}',
            '%label% {min-height:20px;}',
            '[state~="selected"] %label%, ' +
                '[state~="pressed"] %label% {}',
            '[state~="over"] %label%{}',
            '[disabled] {}'
        ]
    );
});
