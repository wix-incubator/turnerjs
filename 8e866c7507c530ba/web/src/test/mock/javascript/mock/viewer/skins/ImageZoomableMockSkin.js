define.skin('mock.viewer.skins.ImageZoomableMockSkin', function(skinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.skinParams([
        {
            "id": "tdr",
            "type": Constants.SkinParamTypes.URL,
            "defaultTheme": "BASE_THEME_DIRECTORY"
        }

    ]);

    def.html('<img skinPart="image"/>');

    def.css([
        '%image% {position: static; box-shadow: #000 0 0 0; image-rendering: optimizequality; -moz-user-select: none;}',
        '.zoomedin {cursor: url([tdr]cursor_zoom_out.png),url([tdr]cursor_zoom_out.cur), auto; overflow: hidden; display: block;}',
        '.zoomedout {cursor: url([tdr]cursor_zoom_in.png), url([tdr]cursor_zoom_in.cur), auto;}'
    ]);

});