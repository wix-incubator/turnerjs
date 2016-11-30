define.skin('wysiwyg.common.components.weather.viewer.skins.WeatherOneLineSkin', function (skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({
        'description' : 'One line skin for weather indicator',
        'iconUrl'     : '/images/wysiwyg/skinIcons/forms/formonecollabelleft.png',
        'hidden'      : false,
        'index'       : 4
    });

    def.skinParams([
        {
            "id"           : "oneLineDegreesValueFont",
            "type"         : Constants.SkinParamTypes.FONT,
            "defaultTheme" : "font_6",
            "lang"         : "WEATHER_BASIC_SKIN_DEGREES_VALUE_FONT_LABEL",
            "enableEdit"   : true
        },
        {
            "id"           : "oneLineDegreesUnitFont",
            "type"         : Constants.SkinParamTypes.FONT,
            "defaultTheme" : "font_6",
            "lang"         : "WEATHER_BASIC_SKIN_DEGREES_UNIT_FONT_LABEL",
            "enableEdit"   : true
        },
        {
            "id"           : "oneLineTextColor",
            "type"         : Constants.SkinParamTypes.COLOR,
            "defaultTheme" : "color_15",
            "lang"         : "WEATHER_BASIC_SKIN_TEXT_COLOR_LABEL",
            "enableEdit"   : true
        }
    ]);

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
        '   text-align : center;' +
        '   color : [oneLineTextColor];' +
        '}',
        '%degreesUnit% {' +
        '   [oneLineDegreesUnitFont];' +
        '   margin-left : 13px;' +
        '}',
        '%degreesValue% {' +
        '   [oneLineDegreesValueFont];' +
        '}'
    ]);
});
