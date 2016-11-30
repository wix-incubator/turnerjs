define.skin('mobile.core.skins.FacebookCommentSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    });
    def.html(
        '<div id="fb-root"></div> ' +
        '<div skinPart="facebook"></div>'
    );
    def.css(
        [
            '%facebook% {}'
        ]
    );
});
