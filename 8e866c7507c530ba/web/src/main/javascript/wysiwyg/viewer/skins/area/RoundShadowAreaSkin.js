define.skin('wysiwyg.viewer.skins.area.RoundShadowAreaSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams([
        {'id':'bgc','type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_1'},
        {'id':'c',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_1'},
        {'id':'pos','type':Constants.SkinParamTypes.OTHER, 'defaultValue':'position:absolute; top:0; bottom:0; left:0; right:0;'},
        {'id':'rd', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0.6em 0.6em 0.6em 0.6em'},
        {'id':'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue':'0 1px 2px rgba(0, 0, 0, 0.6);'}
    ]);
    def.html('<div skinPart="bg"></div><div skinPart="inlineContent"></div>');
    def.css([
        '%bg% {overflow:hidden; border:3px solid [c];[pos][bgc][rd][shd] }',
        '%inlineContent% {[pos]}'
    ]);
});