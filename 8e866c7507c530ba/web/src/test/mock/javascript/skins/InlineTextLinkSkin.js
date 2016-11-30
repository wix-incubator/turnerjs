define.skin('wysiwyg.editor.skins.InlineTextLinkSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id': 'webThemeDir', 'type':'themeUrl', 'defaultTheme': 'WEB_THEME_DIRECTORY'}
        ]
    );
    def.html('<span skinpart="label"></span>');
    def.css(
        [
            '{cursor:pointer; color:#379acf}',
//            '{cursor:pointer; font-family:"Helvetica", "Arial", sans-serif; color:#379acf}',
            '[state~="over"] %label% {text-decoration:underline}',
            '[state~="disabled"] {opacity: .5;}'
        ]
    );
});
