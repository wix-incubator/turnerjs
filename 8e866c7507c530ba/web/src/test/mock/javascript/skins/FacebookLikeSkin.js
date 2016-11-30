define.skin('skins.core.FacebookLikeSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    });
    def.html('<div skinPart="facebook"></div>');
    def.css(
        [
            '%facebook% {}',
            '[state="loading"] > [skinPart="loadingAnimation"]{width:100%; height:100%; display:block; background:#000000 url([themeDir]ajax-loader.gif) center no-repeat}',
            '[state="loaded"] > [skinPart="loadingAnimation"]{display:none;}'
        ]
    );
});
