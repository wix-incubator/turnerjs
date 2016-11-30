define.skin('wysiwyg.common.components.weather.viewer.skins.WeatherGradientSkin', function (skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({
        'description': 'Gradient skin for weather indicator',
        'iconUrl': '/images/wysiwyg/skinIcons/forms/formonecollabelleft.png',
        'hidden': false,
        'index': 1
    });

    def.skinParams([
        {
            "id": "gradientDegreesValueFont",
            "type": Constants.SkinParamTypes.FONT,
            "defaultTheme": "font_5",
            "lang": "WEATHER_BASIC_SKIN_DEGREES_VALUE_FONT_LABEL",
            "enableEdit": true
        },
        {
            "id": "gradientDegreesUnitFont",
            "type": Constants.SkinParamTypes.FONT,
            "defaultTheme": "font_5",
            "lang": "WEATHER_BASIC_SKIN_DEGREES_UNIT_FONT_LABEL",
            "enableEdit": true
        },

        {
            "id": "gradientMainColor",
            "type": Constants.SkinParamTypes.COLOR,
            "defaultTheme": "color_19",
            "lang": "WEATHER_BASIC_SKIN_BACKGROUND_COLOR_LABEL",
            "enableEdit": true
        },
        {
            "id": "gradientTextColor",
            "type": Constants.SkinParamTypes.COLOR,
            "defaultTheme": "color_11",
            "lang": "WEATHER_BASIC_SKIN_TEXT_COLOR_LABEL",
            "enableEdit": true
        },
        {
            "id": "gradientTextColor",
            "type": Constants.SkinParamTypes.COLOR,
            "defaultTheme": "color_11",
            "lang": "WEATHER_BASIC_SKIN_TEXT_COLOR_LABEL",
            "enableEdit": true
        },
        {
            "id": "gradientShadow",
            "type": Constants.SkinParamTypes.BOX_SHADOW,
            "defaultValue": "1px 1px 2px 0 rgba(0, 0, 0, .45);",
            "lang": "WEATHER_GRADIENT_SKIN_SHADOW_LABEL"
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
            '   padding : 10px;' +
            '   color : [gradientTextColor];' +
            '   background : linear-gradient(148deg, [gradientMainColor], #fff);' +
            '   [gradientShadow];' +
            '}',
            '%degreesUnit% {' +
            '   [gradientDegreesUnitFont];' +
            '   margin-left : 15px;' +
            '}',
            '%degreesValue% {' +
            '   [gradientDegreesValueFont];' +
            '}'
    ]);
});
