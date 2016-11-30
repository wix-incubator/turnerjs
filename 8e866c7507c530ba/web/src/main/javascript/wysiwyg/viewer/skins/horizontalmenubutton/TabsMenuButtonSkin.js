define.skin('wysiwyg.viewer.skins.horizontalmenubutton.TabsMenuButtonSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams([

        {'id':'c',   'type':Constants.SkinParamTypes.COLOR, 'defaultTheme':'color_1'},
        {'id':'bgc',   'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color5'},
        {'id':'tdr', 'type':Constants.SkinParamTypes.URL,  'defaultTheme': 'BASE_THEME_DIRECTORY'},
        {'id':'rd',  'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '5px 5px 0 0'},
        {'id':'fnt', 'type':Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_7'}
    ]);
    def.html(
        '<div skinPart="bg"></div>' +
        '<div skinPart="label"></div>');
    def.css([
        '{ display:inline-block; cursor:pointer; height:35px; line-height:35px; text-align:center;[bgc][rd] [fnt] color:[c];' +
            'background-image:url([tdr]gradient_top_white.png); background-repeat:repeat-x; background-position:0 0; }',


        '%label% { padding:0 10px 0;}'
    ]
    );
});
