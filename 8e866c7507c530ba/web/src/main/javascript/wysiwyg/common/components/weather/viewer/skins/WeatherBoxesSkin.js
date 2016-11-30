define.skin('wysiwyg.common.components.weather.viewer.skins.WeatherBoxesSkin', function (skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({
        'description' : 'Boxes skin for weather indicator',
        'iconUrl'     : '/images/wysiwyg/skinIcons/forms/formonecollabelleft.png',
        'hidden'      : false,
        'index'       : 3
    });

    def.skinParams([
        {
            "id"           : 'boxesDegreesValueFont',
            "type"         : Constants.SkinParamTypes.FONT,
            "defaultTheme" : 'font_5',
            "lang"         : 'WEATHER_BASIC_SKIN_DEGREES_VALUE_FONT_LABEL',
            "enableEdit"   : true
        },
        {
            "id"           : 'boxesDegreesUnitFont',
            "type"         : Constants.SkinParamTypes.FONT,
            "defaultTheme" : 'font_5',
            "lang"         : 'WEATHER_BASIC_SKIN_DEGREES_UNIT_FONT_LABEL',
            "enableEdit"   : true
        },

        {
            "id"           : 'boxesBgColor',
            "type"         : Constants.SkinParamTypes.BG_COLOR,
            "defaultTheme" : 'color_18',
            "lang"         : 'WEATHER_BASIC_SKIN_BACKGROUND_COLOR_LABEL',
            "enableEdit"   : true
        },
        {
            "id"           : 'boxesTextColor',
            "type"         : Constants.SkinParamTypes.COLOR,
            "defaultTheme" : 'color_11',
            "lang"         : 'WEATHER_BASIC_SKIN_TEXT_COLOR_LABEL',
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
        '   color : [boxesTextColor];' +
        '}',
        '%degreesUnit% {' +
        '   [boxesDegreesUnitFont];' +
        '   [boxesBgColor]' +
        '   padding : 7px;' +
        '   margin-left : 5px;' +
        '}',
        '%degreesValue% {' +
        '   [boxesDegreesValueFont];' +
        '   padding : 7px;' +
        '   [boxesBgColor]' +
        '}'
    ]);
});
