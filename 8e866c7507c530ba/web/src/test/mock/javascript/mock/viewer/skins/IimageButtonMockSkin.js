define.skin('mock.viewer.skins.IimageButtonMockSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.skinParams([
        {
            "id": "fade_prev",
            "type": Constants.SkinParamTypes.TRANSITION,
            "defaultValue": "opacity 0.5s ease 0s"
        },
        {
            "id": "fade_next",
            "type": Constants.SkinParamTypes.TRANSITION,
            "defaultValue": "opacity 0.1s ease 0s"
        }
    ]);

    def.compParts({
        'defaultImage': { skin:'mock.viewer.skins.ImageNewMockSkin' },
        'hoverImage':   { skin:'mock.viewer.skins.ImageNewMockSkin' },
        'activeImage':  { skin:'mock.viewer.skins.ImageNewMockSkin' }
    });

    def.html(
            '<a skinPart="link">' +
            '<div skinPart="defaultImage"></div>' +
            '<div skinPart="hoverImage"></div>' +
            '<div skinPart="activeImage"></div>' +
            '</a>'
    );
});
