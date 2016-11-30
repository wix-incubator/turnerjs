define.skin('mock.viewer.skins.WPhotoSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.compParts({
        'img': { skin:'mock.viewer.skins.ImageZoomableMockSkin' }
    });

    def.skinParams([

        {
            "id": "brw",
            "type": Constants.SkinParamTypes.SIZE,
            "defaultValue": "2px"
        },

        {
            "id": "contentPaddingLeft",
            "type": Constants.SkinParamTypes.SIZE,
            "sumParams": [
                "brw"
            ],
            "usedInLogic": true
        },
        {
            "id": "contentPaddingRight",
            "type": Constants.SkinParamTypes.SIZE,
            "sumParams": [
                "brw"
            ],
            "usedInLogic": true
        },
        {
            "id": "contentPaddingBottom",
            "type": Constants.SkinParamTypes.SIZE,
            "sumParams": [
                "brw"
            ],
            "usedInLogic": true
        },
        {
            "id": "contentPaddingTop",
            "type": Constants.SkinParamTypes.SIZE,
            "sumParams": [
                "brw"
            ],
            "usedInLogic": true
        }
    ]);

    def.html(
            '<a skinPart="link">' +
            '<div skinPart="img">' +
            '</div>' +
            '</a>');


});
