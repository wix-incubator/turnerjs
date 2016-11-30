define.skin('wysiwyg.viewer.skins.horizontalmenubutton.CircleleMenuButtonSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.compParts({
        'repeaterButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.TabsMenuButtonSkin', styleGroup:'nav' },
        'moreButton':{ skin:'wysiwyg.viewer.skins.horizontalmenubutton.TabsMenuButtonSkin', styleGroup:'nav' }
    });
    def.skinParams([
        {'id':'tdr','type':Constants.SkinParamTypes.URL,  'defaultTheme': 'BASE_THEME_DIRECTORY'},
        {'id':'fnt','type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_5'},
        {'id':'rd', 'type':Constants.SkinParamTypes.BORDER_RADIUS,'defaultValue':'50%'},
        {'id':'c',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_1'} ,
        {'id':'bgc',  'type':Constants.SkinParamTypes.BG_COLOR,'defaultTheme':'color_3'}
    ]);
    def.html('<div skinPart="bg"></div><div skinPart="label"></div>');
    def.css([
        '{ display:inline-block; cursor:pointer; padding:0 10px;  position:relative; color:[c]; [fnt] [bgc] }',

        '%label%      { line-height:40px; text-align:center; }',
        ':hover       { color:#f00; }'

    ]);
});