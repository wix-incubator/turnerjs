define.skin('wysiwyg.common.components.basicmenu.viewer.skins.BasicMenuSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/xxx.png', 'hidden': true, 'index': 0});

    def.skinParams([]);

    def.html(
        '<ul skinpart="menuContainer"></ul>'
    );

    def.css(['li a {white-space:nowrap;}']);
});
