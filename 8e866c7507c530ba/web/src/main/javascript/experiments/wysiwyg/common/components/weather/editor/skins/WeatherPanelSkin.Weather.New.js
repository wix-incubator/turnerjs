define.experiment.newSkin('wysiwyg.common.components.weather.editor.skins.WeatherPanelSkin.Weather.New', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

//    def.skinParams([
//        {'id': '$BorderRadius', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '5px', enableEdit : true}
//    ]);

    def.compParts({
        selectLocation  : { skin : Constants.PanelFields.Input.skins.default},
        choiceDegreesUnit     : { skin : Constants.PanelFields.RadioImages.skins.default },
        fontSize     : {skin : 'wysiwyg.editor.skins.inputs.SliderWithIconsSkin' },
        changeStyle : {skin : Constants.PanelFields.ButtonField.skins.blueWithArrow},
        addAnimation : {skin : Constants.PanelFields.ButtonField.skins.withArrow}
    });

    def.html(
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div skinpart="selectLocation"></div>' +

                // Skinpart for dynamic combobox. See WeatherPanel._showComboBoxWithSuggestions
                '<div skinpart="suggestedLocationsComboBox"></div>' +
                '<div skinpart="loadingIndicator"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="choiceDegreesUnit"></div>' +
            '</fieldset>' +
            '<fieldset skinPart="fontSizeWrapper">' +
            '   <div skinpart="fontSize"></div>' +
            '</fieldset>' +
            '<fieldset>' +
            '   <div skinpart="changeStyle"></div>' +
            '</fieldset>' +
            '<fieldset>' +
            '   <div skinpart="addAnimation"></div>' +
            '</fieldset>' +
        '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; border-radius: 5px;}',
        // Styles for dynamic combobox. See WeatherPanel._showComboBoxWithSuggestions
        '%suggestedLocationsComboBox% {border : 1px solid black; border-top: none; background-color: white; cursor: pointer; margin-top : -5px; display: none; position : absolute, z-index : 1;}',
        '%suggestedLocationsComboBox% .suggestedLocationItem:hover {background-color : #5B8FA7; border-radius : 3px;}',
        '%suggestedLocationsComboBox% .suggestedLocationItem {padding : 2px 3px;}',
        '%loadingIndicator% {line-height: 22px; color: grey; display: none;}'
    ]);
});
