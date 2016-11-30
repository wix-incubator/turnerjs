define.skin('wysiwyg.viewer.skins.FadeLineSkin', function(skinDefinition) {
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams([
        {'id':'tdr','type':Constants.SkinParamTypes.URL, 'defaultTheme':'BASE_THEME_DIRECTORY'} ,
        {'id':'h',  'type':Constants.SkinParamTypes.OTHER, 'defaultValue':'height:29px; min-height:29px;'}
    ]);
    def.html('<div skinPart="line"><div class="left ln"></div><div class="center ln"></div><div class="right ln"></div></div>');
    def.css([
        '%line%       { [h] position:relative; }',
        '%.ln%        { [h] background-image:url( [tdr]fade_line.png); position:absolute; top:0; }',
        '%.left%      { background-position:0 0;     width:100px; left:0; }',
        '%.right%     { background-position:100% 0;  width:100px; right:0; }',
        '%.center%    { background-position:0 -29px; right:100px; left:100px; }'
    ]
    );
});