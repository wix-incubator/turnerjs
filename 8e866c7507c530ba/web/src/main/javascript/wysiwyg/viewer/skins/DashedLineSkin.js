define.skin('wysiwyg.viewer.skins.DashedLineSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams([ {'id':'c','type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color3'}  ]);
    def.html('<div skinPart="line"></div>');
    def.css([ '{  border-bottom:2px dashed [c]; }' ]);
});