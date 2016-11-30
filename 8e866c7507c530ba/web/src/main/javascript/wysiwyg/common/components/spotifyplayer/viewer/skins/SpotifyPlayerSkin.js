define.skin('wysiwyg.common.components.spotifyplayer.viewer.skins.SpotifyPlayerSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.skinParams([
        { "id": "webThemeDir", "type": Constants.SkinParamTypes.URL, "defaultTheme": "WEB_THEME_DIRECTORY" }
    ]);

    def.html(
        '<iframe skinpart="iframe" width="300" height="80" scrolling="no" frameborder="0" allowtransparency="true"></iframe>' +
        '<div skinpart="placeholder" class="hidden"></div>'
    );

    def.css([
        '%iframe% { overflow:hidden }',
        '%placeholder% { width: 300px; height: 80px; background: transparent url([webThemeDir]spotify/placeholder.png) 0 0 no-repeat; }'
    ]);
});