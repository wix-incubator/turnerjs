define.skin('wysiwyg.editor.skins.inputs.ColorInputSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id': 'webThemeDir',           'type':Constants.SkinParamTypes.URL,            'defaultTheme': 'WEB_THEME_DIRECTORY'},
            {'id': 'bgColor',               'type':Constants.SkinParamTypes.COLOR,          'defaultValue': '#ffffff'},
            {'id': 'bgColorOver',           'type':Constants.SkinParamTypes.COLOR,          'defaultValue': '#f6f6f6'},
            {'id': 'bgColorPressed',        'type':Constants.SkinParamTypes.COLOR,          'defaultValue': '#e5e5e5'},
            {'id': 'shadowInsetColor',      'type':Constants.SkinParamTypes.COLOR_ALPHA,    'defaultValue': '0,0,0,.5'}
        ]
    );
    def.fields({
        _tags: []
    });
    def.html(
        '<div class="colorsWrapper">' +
            '<div skinpart="colorButton" skin="skins.editor.ColorButtonSkin"></div>' +
            '<div class="colorsFrame"></div>' +
            '</div>'     +
            '<div skinpart="label"></div>'
    );
    def.css(
        [
            '{width:15px; position:relative; overflow:hidden; cursor:pointer; border-bottom: 1px solid #c9c9c9; border-top: 1px solid white;background: [bgColor] url([webThemeDir]button/editor_drill_btn_sprites.png) repeat-x 0 100%}',

            '%label% {display:none;}',

            '%.colorsWrapper% {width:90px; height:45px; position:absolute; left:10px; top: 50%; margin-top: -22px;}',
            '%colorButton%{width: auto; height: 36px; margin: 2px 7px 2px 6px;}',
            '%.colorsFrame%{width:90px; height:45px; position:absolute; top:0; left:0; background: url([webThemeDir]/button/colors_frame_sprite.png) no-repeat 0 0}',

            '[state~="selected"],' +
                '[state~="pressed"] {background: [bgColorPressed] none; border-top: 1px solid [shadowInsetColor]; box-shadow: 0 2px 5px 0 [shadowInsetColor] inset}',
            '[state~="over"],:hover {background-position: 0 0 ;background-color: [bgColorOver]}',
            '[state~="over"] %.colorsFrame%{background-position: 0 -45px;}',

            '[disabled] {opacity: .5;}'

        ]
    );
});
