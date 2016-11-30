define.skin('mobile.core.skins.GooglePlusOneSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.fields({
        _tags: []
    });

    def.html('<div skinPart="googlePlus"></div>');
    def.css(
        [
            '%googlePlus% {margin-top:10px; margin-bottom:10px;}'
        ]
    );
});
