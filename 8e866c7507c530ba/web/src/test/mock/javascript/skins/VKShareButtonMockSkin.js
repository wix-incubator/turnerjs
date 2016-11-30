define.skin('mock.viewer.skins.VKShareButtonMockSkin', function (skinDefinition) {
    /**@type core.managers.skin.SkinDefinition*/
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.html('<iframe frameborder="0" scrolling="no" allowtransparency="true" skinpart="iframe"></iframe>');

    def.css([
        '%iframe% { width: 100px; height: 21px; overflow:hidden }'
    ]);
});
