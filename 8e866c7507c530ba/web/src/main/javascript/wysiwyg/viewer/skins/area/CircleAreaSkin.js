define.skin('wysiwyg.viewer.skins.area.CircleAreaSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams([
        {'id':'bgc','type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_1'},
        {'id':'brc','type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_1'},
        {'id':'pos','type':Constants.SkinParamTypes.OTHER, 'defaultValue':'position:absolute; top:0; bottom:0; left:0; right:0;'},
        {'id':'rd', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '50%'}
    ]);
    def.html('<div skinPart="bg"></div><div skinPart="inlineContent"></div>');
    def.css([
        '%bg% { overflow:hidden; border:4px solid [brc];[pos][bgc][rd] }',
        '%inlineContent% { [pos][rd] overflow:hidden; }'
    ]);
});