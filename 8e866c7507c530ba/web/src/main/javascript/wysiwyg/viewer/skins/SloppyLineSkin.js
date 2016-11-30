define.skin('wysiwyg.viewer.skins.SloppyLineSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams([ {'id':'tdr','type':Constants.SkinParamTypes.URL, 'defaultTheme':'BASE_THEME_DIRECTORY'}  ]);
    def.html('<div skinPart="line"></div>');
    def.css([ '%line%    { background-image:url( [tdr]header-line.png); background-repeat:repeat-x; background-position:0 0; height:3px; min-height:3px; }' ]);
});