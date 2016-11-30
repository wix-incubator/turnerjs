define.skin('wysiwyg.viewer.skins.DoubleLineSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams([
        {'id':'c1',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_10'},
        {'id':'c2',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_10'},
        {'id':'pos','type':Constants.SkinParamTypes.OTHER, 'defaultValue':'position:absolute; top:0; bottom:0; left:0; right:0;'}
    ]);
    def.html('<div skinPart="line"><div class="top"></div><div class="bottom"></div></div>');
    def.css([
        '%.top%    { border-bottom:3px solid [c1]; margin:0 0 5px 0; }',
        '%.bottom% { border-bottom:1px solid [c2]; }'
    ]);
});