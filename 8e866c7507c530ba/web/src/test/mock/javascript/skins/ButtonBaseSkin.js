define.skin('wysiwyg.editor.skins.buttons.ButtonBaseSkin', function(skinDefinition){

    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id': 'webThemeDir',           'type':Constants.SkinParamTypes.URL,            'defaultTheme': 'WEB_THEME_DIRECTORY'},
            {'id': '$borderRadius',         'type':Constants.SkinParamTypes.BORDER_RADIUS,  'defaultValue': '4px'},

            {'id': 'borderColor',           'type':Constants.SkinParamTypes.COLOR,          'defaultValue': '#c4c4c4'},
            {'id': 'borderColorOver',       'type':Constants.SkinParamTypes.COLOR,          'defaultValue': '#89a4af'},

            {'id': 'bgColor',               'type':Constants.SkinParamTypes.COLOR,          'defaultValue': '#f9fafc'},
            {'id': 'bgColorOver',           'type':Constants.SkinParamTypes.COLOR,          'defaultValue': '#f2f3f5'},
            {'id': 'bgColorPressed',           'type':Constants.SkinParamTypes.COLOR,       'defaultValue': '#f3f3f3'},

            {'id': 'shadowColor',           'type':Constants.SkinParamTypes.COLOR_ALPHA,    'defaultValue': '0,0,0,.35'},
            {'id': 'shadowInsetColor',      'type':Constants.SkinParamTypes.COLOR_ALPHA,    'defaultValue': '0,0,0,.7'},
            {'id': 'shadowInsetColorOver',  'type':Constants.SkinParamTypes.COLOR_ALPHA,    'defaultValue': '255,255,255,.7'},

            {'id': 'labelColor',            'type':Constants.SkinParamTypes.COLOR,          'defaultValue': '#24a0c4'}

        ]
    );
    def.html(
        '<div skinpart="icon"></div>' +
        '<div skinpart="label"></div>'
    );
    def.css(
        [
            '{padding: 0 10px; border: 1px solid [borderColor]; [$borderRadius]; background: [bgColor] url([webThemeDir]button/button-gradient.png) repeat-x 0 50%; position:relative; text-align: center; cursor: pointer}',
            '[state~="over"]{border: 1px solid [borderColorOver]; background: [bgColorOver] none; box-shadow: 0 2px 3px 0 [shadowColor], 0 1px 2px 0 [shadowInsetColorOver] inset}',
            '[state~="selected"],[state~="pressed"] {background: [bgColorPressed] none; border-color: transparent; box-shadow: 0 1px 3px 0 [shadowInsetColor] inset}',
            '%icon% {position:absolute; left: 5px; top: 50%; width:24px; height:24px; margin-top: -12px;}',
            '%label% {color: [labelColor]; height:30px; line-height:30px;}',
            '[disabled] {opacity: .5;}'
        ]
    );
});
