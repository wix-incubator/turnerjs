define.skin('mock.viewer.skins.PinterestFollowSkin', function(SkinDefinition) {
    var def = SkinDefinition;
    def.inherits('core.managers.skin.BaseSkin2');
    def.skinParams([]);
    def.html(
        '<a target="_blank" skinPart="followButton">' +
            '<div class="icon"></div>' +
            '<div skinPart="followButtonTag"></div>' +
        '</a');

});
