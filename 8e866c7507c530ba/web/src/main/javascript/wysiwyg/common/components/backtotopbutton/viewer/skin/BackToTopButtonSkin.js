define.skin('wysiwyg.common.components.backtotopbutton.viewer.skins.BackToTopButtonSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */

    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.skinParams([
        {
            "id": "webThemeDir",
            "type": "themeUrl",
            "defaultTheme": "WEB_THEME_DIRECTORY"
        }
    ]);

    def.html(
        '<div skinPart="bg"></div>'
    );

    def.css([
        '{ left:0px; float:left; position:relative; bottom:42px; cursor:pointer; }',
        '%bg% { position:absolute; width:46px; height:46px; left:-46px; background-image:url([webThemeDir]backtotop/topButton.png); opacity:1; filter:none; }'
    ]);
});
