define.skin('mock.viewer.skins.FlashComponentMockSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.skinParams([
        {
            "id": "webThemeDir",
            "type": "themeUrl",
            "defaultTheme": "WEB_THEME_DIRECTORY"
        }
    ]);

    def.html(
            '<a skinPart="link">' +
            '<div skinPart="noFlashImgContainer">' +
            '<div skinPart="noFlashImg" skin="mobile.core.skins.ImageSkin">' +
            '</div>' +
            '</div>' +
            '<div skinPart="flashContainer">' +
            '</div>' +
            '<div skinPart="mouseEventCatcher">' +
            '</div>' +
            '</a>');



});