define.skin('wysiwyg.common.components.onlineclock.viewer.skins.OnlineClockBasicSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/onlineclock/skin-icon-1.png', 'hidden': false, 'index': 0});

    def.skinParams([
        {'id': 'bg1', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_15', lang: 'bg'},
        {'id': 'brd', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_18'},

        {'id': 'timecolor', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_11', lang: 'ONLINECLOCK_Time'},
        {'id': 'datecolor', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_11', lang: 'ONLINECLOCK_Date'},

        {'id': 'timefont', 'type':Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_6', lang: 'ONLINECLOCK_Time'},
        {'id': 'datefont', 'type':Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_9', lang: 'ONLINECLOCK_Date'},

        {'id': 'rd', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0px'},
        {'id': 'brw', 'type': Constants.SkinParamTypes.SIZE, 'defaultValue': '0px'},

        {
            "id": "transition",
            "type": Constants.SkinParamTypes.TRANSITION,
            "defaultValue": "opacity 0.4s ease 0s"
        }
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
        '%container% {padding: 12px; background: [bg1]; border: [brw] solid [brd]; [rd]}',
        '%time% {display: inline-block; color: [timecolor]; [timefont] line-height: 1em; white-space: nowrap}',
        '%time% .colon {[transition]}',
        '[state~=colonHide] .colon {opacity:0}',
        '%time% .ampm {display: inline-block; margin-left: 12px}',
        '%date% {display: inline-block; color: [datecolor]; [datefont] line-height: 1em; white-space: nowrap; margin-top: 3px}',
        '%date% .slash {display: inline-block; margin: 0 1px}',

        '[state~=alignLeft] %container% { text-align: left }',
        '[state~=alignCenter] %container% { text-align: center }',
        '[state~=alignRight] %container% { text-align: right }'
    ]);
});