define.skin('mock.viewer.skins.LinkBarItemMockSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.compParts({
        "image": {
            "skin": "mobile.core.skins.ImageSkin"
        }
    });

    def.html(
            '<a skinPart="link">' +
            '<div skinPart="image">' +
            '</div>' +
            '</a>');

});