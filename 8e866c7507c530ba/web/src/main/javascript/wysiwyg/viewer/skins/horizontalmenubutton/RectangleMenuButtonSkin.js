define.skin('wysiwyg.viewer.skins.horizontalmenubutton.RectangleMenuButtonSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams([
        {'id':'tdr','type':Constants.SkinParamTypes.URL,  'defaultTheme': 'BASE_THEME_DIRECTORY'},
        {'id':'fnt',  'type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_5'},
        {'id':'c',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_1'}
    ]);
    def.html('<div skinPart="bg"></div><div skinPart="label"></div>');
    def.css([
        '{ display:inline-block; cursor:pointer; padding:0 0px;  position:relative; color:[c]; [fnt] ' +
            'background-image:url([tdr]apple_buttons_divider.png); background-repeat: repeat-y; }',

        ':first-child { background:none; }',




        '%label%  {  line-height:40px; }',

        ':hover  { color:#f00; }'

    ]
    );
});