define.skin('mock.viewer.skins.LinkBarMockSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.compParts({
        "imageItem": {
            "skin": "mock.viewer.skins.LinkBarItemMockSkin",
            "styleGroup": "displayer"
        }
    });

    def.html(
            '<div skinPart="itemsContainer">' +
            '</div>');


});