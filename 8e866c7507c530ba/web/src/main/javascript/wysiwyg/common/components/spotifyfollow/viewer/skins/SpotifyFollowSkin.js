define.skin('wysiwyg.common.components.spotifyfollow.viewer.skins.SpotifyFollowSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/xxx.png', 'hidden': false, 'index': 0});

    def.skinParams([
        { "id": "webThemeDir", "type": Constants.SkinParamTypes.URL, "defaultTheme": "WEB_THEME_DIRECTORY"}
    ]);

    def.html(
        '<iframe id="spotifyFollowId" skinPart="iframe" scrolling="no" frameborder="0" style="border:none; overflow:hidden;" allowtransparency="true"></iframe>'+
        '<div skinpart="placeholder" class="hidden"></div>'
    );

    def.css([
        '%iframe% { overflow:hidden }',
        '[state~=detailed_dark_show]  %placeholder% {width: 225px; height: 56px; background: transparent url([webThemeDir]spotify/spotify_follow_placeholder_detailed_dark_show.png)  0 0 no-repeat;}',
        '[state~=detailed_dark_hide]  %placeholder% {width: 225px; height: 56px; background: transparent url([webThemeDir]spotify/spotify_follow_placeholder_detailed_dark_hide.png)  0 0 no-repeat;}',
        '[state~=detailed_light_show] %placeholder% {width: 225px; height: 56px; background: transparent url([webThemeDir]spotify/spotify_follow_placeholder_detailed_light_show.png) 0 0 no-repeat;}',
        '[state~=detailed_light_hide] %placeholder% {width: 225px; height: 56px; background: transparent url([webThemeDir]spotify/spotify_follow_placeholder_detailed_light_hide.png) 0 0 no-repeat;}',
        '[state~=basic_all_show]      %placeholder% {width: 156px; height: 25px; background: transparent url([webThemeDir]spotify/spotify_follow_placeholder_basic_all_show.png)      0 0 no-repeat;}',
        '[state~=basic_all_hide]      %placeholder% {width: 156px; height: 25px; background: transparent url([webThemeDir]spotify/spotify_follow_placeholder_basic_all_hide.png)      0 0 no-repeat;}'
    ]);
});