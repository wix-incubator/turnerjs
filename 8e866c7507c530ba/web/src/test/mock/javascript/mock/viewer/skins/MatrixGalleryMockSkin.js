define.skin('mock.viewer.skins.MatrixGalleryMockSkin', function(SkinDefinition) {
    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.statics({
        "heightDiff": 25
    });

    def.inherits('mobile.core.skins.BaseSkin');

    def.compParts({
        "imageItem": {
            "skin": "mock.viewer.skins.MatrixDisplayerMockSkin",
            "styleGroup": "inherit"
        }
    });

    def.html(
            '<div skinPart="itemsContainer">' +
            '</div>' +
            '<div class="pos">' +
            '<div skinPart="showMore" hightDiff="true">' +
            'Show More</div>' +
            '</div>');



});