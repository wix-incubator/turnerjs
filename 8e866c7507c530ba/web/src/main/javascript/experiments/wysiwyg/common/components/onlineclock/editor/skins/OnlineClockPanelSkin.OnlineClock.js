define.experiment.newSkin('wysiwyg.common.components.onlineclock.editor.skins.OnlineClockPanelSkin.OnlineClock', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');
    
    def.skinParams([
        { "id": "$BorderRadius", "type": Constants.SkinParamTypes.BORDER_RADIUS, "defaultValue": "5px" },
        { "id": "$BoxShadow", "type": Constants.SkinParamTypes.BOX_SHADOW, "defaultValue": "0px 0px 2px rgba(0, 0, 0, .4)" }
    ]);
    
    def.compParts({
        location:     { skin: Constants.PanelFields.Input.skins.default },
        timeFormat:   { skin: Constants.PanelFields.ComboBox.skins.default },
        showDate:     { skin: Constants.PanelFields.CheckBox.skins.default },
        dateFormat:   { skin: Constants.PanelFields.ComboBox.skins.default },
        timeFontSize: { skin: Constants.PanelFields.Slider.skins.sliderWithIcons },
        dateFontSize: { skin: Constants.PanelFields.Slider.skins.sliderWithIcons },
        textAlign:    { skin: Constants.PanelFields.RadioImages.skins.default },
        changeStyle:  { skin: Constants.PanelFields.ButtonField.skins.blueWithArrow },
        addAnimation: { skin: Constants.PanelFields.ButtonField.skins.withArrow }
    });

    def.html(        
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div skinpart="location"></div>' +
                '<div skinpart="locationSuggest"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="timeFormat"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="showDate"></div>' +
                '<div skinpart="dateFormat"></div>' +
            '</fieldset>' +
            '<fieldset skinPart="fontSizeWrapper">' +
                '<div skinpart="timeFontSize"></div>' +
                '<div skinpart="dateFontSize"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="textAlign"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="changeStyle"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="addAnimation"></div>' +
            '</fieldset>' +
         '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius] }',
        '%dateFormat%, %dateFontSize% { margin-top: 5px }',
        '%textAlign% { margin-bottom: -10px }',
        '%locationSuggest% li { width: 242px; padding: 3px 5px; margin: 0 -3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; [$BorderRadius] cursor: pointer }',
        '%locationSuggest% li:hover { background: white; [$BoxShadow] }'
    ]);
});