define.skin('wysiwyg.viewer.skins.horizontalmenubutton.TextOnlyMenuButtonSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams([
        {'id':'fnt','type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_5'},
        {'id':'c',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color5'}
    ]);
    def.html('<div skinPart="bg"></div><div skinPart="label"></div>');
    def.css([
        '{ display:inline-block; cursor:pointer; position:relative; color:[c]; [fnt] }'
    ]);
});