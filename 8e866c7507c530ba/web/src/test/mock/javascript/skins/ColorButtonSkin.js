define.skin('skins.editor.ColorButtonSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id':'themeDir', 'type':'themeUrl', 'defaultTheme': 'THEME_DIRECTORY'}
        ]
    );
    def.html('<div skinPart="bg"></div><p skinPart="clickToEdit"></p>');
    def.css(
        [
            '{position:relative; background-image:url([themeDir]transparency.gif); text-align:left; cursor:pointer;}',
            '[disabled]{cursor:default;}',
            '> [skinPart=bg]{position:absolute; width:100%; height:100%; left:0; top:0;}',
            '> [skinPart=clickToEdit]{visibility:hidden; text-decoration:underline; display:inline; position:relative; top:10px; cursor:inherit; margin:5px 5px 5px 20px; padding:5px; font-size:12px}',
            ':hover> [skinPart=clickToEdit] {visibility:visible;}'
        ]
    );
});
