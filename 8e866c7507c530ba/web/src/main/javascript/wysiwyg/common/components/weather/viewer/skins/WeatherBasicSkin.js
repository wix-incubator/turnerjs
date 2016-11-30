define.skin('wysiwyg.common.components.weather.viewer.skins.WeatherBasicSkin', function (skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.skinParams([
        {
            "id"           : "basicDegreesValueFont",
            "type"         : Constants.SkinParamTypes.FONT,
            "defaultTheme" : "font_6",
            "lang"         : "WEATHER_BASIC_SKIN_DEGREES_VALUE_FONT_LABEL",
            "enableEdit"   : true
        },
        {
            "id"           : "basicDegreesUnitFont",
            "type"         : Constants.SkinParamTypes.FONT,
            "defaultTheme" : "font_6",
            "lang"         : "WEATHER_BASIC_SKIN_DEGREES_UNIT_FONT_LABEL",
            "enableEdit"   : true
        },

        {
            "id"           : "basicBorderRadius",
            "type"         : Constants.SkinParamTypes.BORDER_RADIUS,
            "defaultValue" : "4px",
            "lang"         : "WEATHER_BASIC_SKIN_BORDER_RADIUS_LABEL",
            "enableEdit"   : true
        },
        {
            "id"           : "basicBorderWidth",
            "type"         : Constants.SkinParamTypes.SIZE,
            "defaultValue" : "2px",
            "lang"         : "WEATHER_BASIC_SKIN_BORDER_WIDTH_LABEL",
            "enableEdit"   : true
        },
        {
            "id"           : "basicBorderColor",
            "type"         : Constants.SkinParamTypes.COLOR,
            "defaultTheme" : "color_18",
            "lang"         : "WEATHER_BASIC_SKIN_BORDER_COLOR_LABEL",
            "enableEdit"   : true
        },
        {
            "id"           : "basicBgColor",
            "type"         : Constants.SkinParamTypes.BG_COLOR,
            "defaultTheme" : "color_15",
            "lang"         : "WEATHER_BASIC_SKIN_BACKGROUND_COLOR_LABEL",
            "enableEdit"   : true
        },
        {
            "id"           : "basicTextColor",
            "type"         : Constants.SkinParamTypes.COLOR,
            "defaultTheme" : "color_11",
            "lang"         : "WEATHER_BASIC_SKIN_TEXT_COLOR_LABEL",
            "enableEdit"   : true
        }
    ]);

    def.iconParams({
        'description' : 'Basic skin for weather indicator',
        'iconUrl'     : '/images/wysiwyg/skinIcons/forms/formonecollabelleft.png',
        'hidden'      : false,
        'index'       : 0
    });

    def.html(
        '<div skinpart="degreesBox">' +
        '   <span skinpart="degreesValue"></span>' +
        '   <span skinpart="degreesUnit"></span>' +
        '</div>'
    );

    def.css([
        '{ position: relative; }',
        '%degreesBox% {' +
        '   white-space: nowrap;' +
        '   border-width : [basicBorderWidth];' +
        '   [basicBorderRadius];' +
        '   border-style : solid;' +
        '   border-color : [basicBorderColor];' +
        '   text-align : center;' +
        '   padding : 12px;' +
        '   [basicBgColor];' +
        '   color : [basicTextColor];' +
        '}',
        '%degreesUnit% {' +
        '   [basicDegreesUnitFont];' +
        '   margin-left : 15px;' +
        '}',
        '%degreesValue% {' +
        '   [basicDegreesValueFont];' +
        '}'
    ]);
});
