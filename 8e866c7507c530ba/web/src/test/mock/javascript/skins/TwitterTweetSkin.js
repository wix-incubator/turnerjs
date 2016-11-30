define.skin( 'mobile.core.skins.TwitterTweetSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.utilize(
        ['mobile.core.skins.BaseSkin']
    );
    def.html(
        '<div skinPart="twitter" />'
    );
    def.css(
        [
            '%twitter% {margin-top:10px; margin-bottom:10px;}'
        ]
    );
});
