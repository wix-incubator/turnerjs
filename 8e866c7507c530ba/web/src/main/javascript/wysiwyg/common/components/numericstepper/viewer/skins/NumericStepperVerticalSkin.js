define.skin('wysiwyg.common.components.numericstepper.viewer.skins.NumericStepperVerticalSkin', function (skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Vertical', 'iconUrl': '/images/wysiwyg/skinIcons/numericstepper/vertical.png', 'hidden': false, 'index': 2});

    def.skinParams([
        {'id': 'backgroundcolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_1', lang: 'NUMERICSTEPPER_BACKGROUNDCOLOR' },
        {'id': 'bordercolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_14', lang: 'NUMERICSTEPPER_BORDERCOLOR'},
        {'id': 'textcolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_13', lang: 'NUMERICSTEPPER_TEXTCOLOR'},
        {'id': 'buttonscolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_14', lang: 'NUMERICSTEPPER_BUTTONSCOLOR'},
        {'id': 'arrowscolor', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_1', lang: 'NUMERICSTEPPER_ARROWSCOLOR'}
    ]);

    def.html(
        '<div skinpart="inputNumberWrapper">' +
            '<div class="numericStepper" skinpart="inputNumberContainer">' +
                '<input skinpart="inputNumberInput" type="text">' +
                '<div skinpart="controls" class="inputNumberControls">' +
                    '<a class="plus"><span></span></a>' +
                    '<a class="minus"><span></span></a>' +
                '</div>' +
            '</div>' +
        '</div>'
    );

    def.css([
        '%inputNumberWrapper% { width: 70px; height: 38px; }',
        '%inputNumberContainer% { border:1px solid [bordercolor]; border-radius: 3px; width: 28px; position: relative; height: 36px; margin: 0 auto; }',
        '%inputNumberInput% { width: 28px; height: 17px; text-align: center; position: absolute; top: 10px; left: 0; background-color:[backgroundcolor]; color:[textcolor]; border:0; font-size: 10px; -webkit-appearance:none; padding:0; border-radius:0; }',
        '%controls% a.plus { top: 0;  }',
        '%controls% a.minus { top: 26px; }',
        '%controls% a { background-color: [buttonscolor]; display: block; width: 28px; height: 10px; position: absolute; left: 0; text-align: center; line-height:9px; -moz-user-select: none; -webkit-user-select: none; -webkit-user-drag: none; overflow:hidden; }',
        '%controls% a:focus { outline: 0; }',
        '%controls% span { display: inline-block; width: 3px; height: 3px; border-top: 1px solid [arrowscolor]; border-right: 1px solid [arrowscolor]; }',
        '%controls% a.plus span { transform: rotate(-45deg); -ms-transform: rotate(-45deg); -webkit-transform: rotate(-45deg); }',
        '%controls% a.minus span { transform: rotate(135deg); -ms-transform: rotate(135deg); -webkit-transform: rotate(135deg); margin-bottom: 1px; }'
    ]);
});