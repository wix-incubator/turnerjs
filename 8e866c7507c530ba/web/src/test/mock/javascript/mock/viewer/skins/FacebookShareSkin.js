define.skin('mock.viewer.skins.FacebookShareSkin', function(SkinDefinition) {
    var def = SkinDefinition;
    def.inherits('core.managers.skin.BaseSkin2');
    def.skinParams([]);
    def.html(
            '<div skinPart="facebookShareButton">' +
                '<div skinPart="shareButton">' +
                    '<span skinpart="icon"></span>' +
                    '<span skinpart="label"></span>' +
                '</div>' +
            '</div>'
        );
});
