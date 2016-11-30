define.skin('mock.viewer.skins.GoogleMapEmbeddedSkin', function(SkinDefinition) {
    /**@type core.managers.skin.SkinDefinition */
    var def = SkinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.skinParams([]);

    def.html('<div skinPart="mapContainer">' +
            '<iframe  width="100%" height="100%" frameborder="0" scrolling="no" skinpart="iframe"></iframe>' +
            '</div>');

    def.css([
        '%iframe% {overflow:hidden}'
    ]);
});
