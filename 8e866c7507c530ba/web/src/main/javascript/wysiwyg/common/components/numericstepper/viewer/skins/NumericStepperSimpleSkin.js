define.skin('wysiwyg.common.components.numericstepper.viewer.skins.NumericStepperSimpleSkin', function (skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Simple', 'iconUrl': '/images/wysiwyg/skinIcons/numericstepper/simple.png', 'hidden': false, 'index': 0});

    def.skinParams([
        {'id': 'backgroundcolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_1', lang: 'NUMERICSTEPPER_BACKGROUNDCOLOR' },
        {'id': 'bordercolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_14', lang: 'NUMERICSTEPPER_BORDERCOLOR' },
        {'id': 'textcolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_13', lang: 'NUMERICSTEPPER_TEXTCOLOR' },
    ]);

    def.html(
        '<div skinpart="inputNumberWrapper">' +
            '<input skinpart="inputNumberInput" type="number" step="1">' +
            '<div skinpart="controls"></div>' +
        '</div>'
    );

    def.css([
        '%inputNumberWrapper% { width:100%; height:38px; }',
        'input { width:100%; position:relative; padding:5px; border:1px solid [bordercolor]; color:[textcolor]; background:[backgroundcolor]; display: inline-block; margin-top: 6px; }'
    ]);
});