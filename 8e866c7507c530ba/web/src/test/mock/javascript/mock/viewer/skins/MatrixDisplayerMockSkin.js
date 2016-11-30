define.skin('mock.viewer.skins.MatrixDisplayerMockSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.compParts({
        "image": {
            "skin": "mobile.core.skins.ImageSkin"
        }
    });

    def.html(
            '<div skinPart="imageWrapper">' +
            '<div class="imgBorder">' +
            '<div skinPart="image"></div>' +
            '<div skinPart="zoom">' +
            '<div skinPart="title"></div>' +
            '<div skinPart="description"></div>' +
            '<a skinPart="link">Go to link</a>' +
            '</div>' +
            '</div>' +
            '</div>');


});