define.skin('mobile.core.skins.ImageSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id':'themeDir', 'type':'themeUrl', 'defaultTheme':'THEME_DIRECTORY', 'name': ''}
        ]
    );

    def.fields({
        _tags: []
    });
    def.html('<div skinPart="loadingAnimation"></div><img skinPart="image"/>');
    def.css(
        [
            '{}',
            '[state="loading"] > img {visibility:hidden}',
            '[state="loaded"] > img {visibility:visible}',
            '[state="loading"] > [skinPart="loadingAnimation"]{width:100%; height:100%; display:block; background:#000000 url([themeDir]ajax-loader.gif) center no-repeat}',
            '[state="loaded"] > [skinPart="loadingAnimation"]{display:none;}'
        ]
    );
});
