define.skin('wysiwyg.common.components.numericstepper.viewer.skins.NumericStepperHorizontalSkin', function (skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/numericstepper/horizontal.png', 'hidden': false, 'index': 1});

    def.skinParams([
        {'id': 'backgroundcolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_1', lang: 'NUMERICSTEPPER_BACKGROUNDCOLOR' },
        {'id': 'bordercolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_14', lang: 'NUMERICSTEPPER_BORDERCOLOR' },
        {'id': 'textcolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_13', lang: 'NUMERICSTEPPER_TEXTCOLOR' },
        {'id': 'buttonscolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_14', lang: 'NUMERICSTEPPER_BUTTONSCOLOR'},
        {'id': 'buttontextcolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_1', lang: 'NUMERICSTEPPER_BUTTONTEXTCOLOR'}
    ]);

    def.html(
        '<div skinpart="inputNumberWrapper">' +
            '<div class="numericStepper" skinpart="inputNumberContainer">' +
                '<input skinpart="inputNumberInput" type="text">' +
                '<div skinpart="controls" class="inputNumberControls">' +
                    '<a class="plus">+</a>' +
                    '<a class="minus">-</a>' +
                '</div>' +
            '</div>' +
        '</div>'
    );

    def.css([
        '%inputNumberWrapper% { width: 70px; height: 38px; }',
        '%inputNumberContainer% { border:1px solid [bordercolor]; position: relative; height: 21px; width: 68px; display: inline-block; margin-top: 7px; }',
        '%inputNumberInput% { border:none; width: 26px; height: 21px; text-align: center; position: absolute; top: 0; left: 21px; background-color:[backgroundcolor]; color:[textcolor]; font-size: 10px; -webkit-appearance:none; padding:0; border-radius:0; }',
        '%controls% a.minus { left: 0; }',
        '%controls% a.plus { left: 47px; }',
        '%controls% a { background-color: [buttonscolor]; color: [buttontextcolor]; display: block; width: 21px; height: 21px; position: absolute; top: 0; text-align: center; line-height:20px; -moz-user-select: none; -webkit-user-select: none; -webkit-user-drag: none; font-size: 14px; }',
        '%controls% a:focus { outline: 0;}'
    ]);
});