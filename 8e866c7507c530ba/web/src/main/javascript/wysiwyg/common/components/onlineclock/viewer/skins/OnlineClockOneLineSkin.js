define.skin('wysiwyg.common.components.onlineclock.viewer.skins.OnlineClockOneLineSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'One Line', 'iconUrl': '/images/wysiwyg/skinIcons/onlineclock/skin-icon-5.png', 'hidden': false, 'index': 4});

    def.skinParams([
        {'id': 'txt', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_15'},

        {'id': 'timefont', 'type':Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_6', lang: 'ONLINECLOCK_Time'},
        {'id': 'datefont', 'type':Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_9', lang: 'ONLINECLOCK_Date'},

        {
            "id": "transition",
            "type": Constants.SkinParamTypes.TRANSITION,
            "defaultValue": "opacity 0.4s ease 0s"
        }
    ]);

    def.html(
        '<div skinpart="container">' +
            '<div skinpart="time">' +
                '<span class="hours">88</span>' +
                '<span class="colon">:</span>' +
                '<span class="minutes">88</span>' +
                '<span class="colon">:</span>' +
                '<span class="seconds">88</span>' +
                '<span class="ampm hidden"></span>' +
            '</div>' +
            '<div skinpart="date"></div>' +
        '</div>'
    );

    def.css([
        '%container% {color: [txt]; white-space: nowrap}',
        '%time% {display: inline-block; [timefont] line-height: 1em; white-space: nowrap}',
        '%time% .colon {[transition]}',
        '[state~=colonHide] .colon {opacity:0}',
        '%time% .ampm {display: inline-block; margin-left: 10px}',
        '%date% {display: inline-block; [datefont] line-height: 1em; white-space: nowrap; margin-left: 10px}',
        '%date% .slash {display: inline-block; margin: 0 1px;}',

        '[state~=alignLeft] %container% { text-align: left }',
        '[state~=alignCenter] %container% { text-align: center }',
        '[state~=alignRight] %container% { text-align: right }'
    ]);
});