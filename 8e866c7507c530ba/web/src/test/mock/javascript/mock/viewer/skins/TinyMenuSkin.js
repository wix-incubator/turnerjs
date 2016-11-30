define.skin('mock.viewer.skins.TinyMenuSkin', function(SkinDefinition) {
    var def = SkinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams([]);
    def.html(
        '<div skinPart="menuButton"></div>'+
        '<div skinPart="menuContainer">' +
//          <li></li>
        '</div>'
    );
});
