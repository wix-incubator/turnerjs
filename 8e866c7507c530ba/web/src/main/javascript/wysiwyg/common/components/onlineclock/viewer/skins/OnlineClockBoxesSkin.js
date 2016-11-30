define.skin('wysiwyg.common.components.onlineclock.viewer.skins.OnlineClockBoxesSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Boxes', 'iconUrl': '/images/wysiwyg/skinIcons/onlineclock/skin-icon-4.png', 'hidden': false, 'index': 3});

    def.skinParams([
        {'id': 'bg3', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_18', lang: 'bg'},

        {'id': 'timecolor', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_11', lang: 'ONLINECLOCK_Time'},
        {'id': 'datecolor', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_11', lang: 'ONLINECLOCK_Date'},

        {'id': 'timefont', 'type':Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_5', lang: 'ONLINECLOCK_Time'},
        {'id': 'datefont', 'type':Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_9', lang: 'ONLINECLOCK_Date'},

        {'id': 'rd', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0px'}
    ]);

    def.html(
        '<div skinpart="container">' +
            '<div>' +
                '<div skinpart="time">' +
                    '<span class="hours">88</span>' +
                    '<span class="colon">:</span>' +
                    '<span class="minutes">88</span>' +
                    '<span class="colon">:</span>' +
                    '<span class="seconds">88</span>' +
                    '<span class="ampm hidden"></span>' +
                '</div>' +
            '</div>' +
            '<div skinpart="date"></div>' +
        '</div>'
    );

    def.css([
        '%container% {}',
        '%time% {display: inline-block; color: [timecolor]; [timefont] line-height: 1em; white-space: nowrap; margin-right: -5px}',
        '%time% > * {display: inline-block; background: [bg3]; [rd] padding: 7px 7px 4px; margin-right: 5px}',
        '%time% .invisible {visibility: hidden}',
        '%time% .colon {display: none}',
        '%date% {display: inline-block; background: [bg3]; [rd] margin-top:5px; padding: 7px; color: [datecolor]; [datefont] line-height: 1em; white-space: nowrap}',
        '%date% .slash {display: inline-block; margin: 0 1px;}',

        '[state~=alignLeft] %container% { text-align: left }',
        '[state~=alignCenter] %container% { text-align: center }',
        '[state~=alignRight] %container% { text-align: right }'
    ]);
});