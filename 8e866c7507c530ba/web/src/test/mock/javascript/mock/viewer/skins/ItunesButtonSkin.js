define.skin('mock.viewer.skins.ItunesButtonSkin', function(SkinDefinition) {
    var def = SkinDefinition;
    def.inherits('core.managers.skin.BaseSkin2');
    def.skinParams([]);
    def.html(
        '<div skinPart="downloadButton">' +
            '<img skinPart="itunesImg" src="" alt=""/>' +
        '</div>'
    );
});
