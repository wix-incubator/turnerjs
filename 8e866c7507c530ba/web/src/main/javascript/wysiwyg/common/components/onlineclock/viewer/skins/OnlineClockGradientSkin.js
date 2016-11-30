define.skin('wysiwyg.common.components.onlineclock.viewer.skins.OnlineClockGradientSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Gradient', 'iconUrl': '/images/wysiwyg/skinIcons/onlineclock/skin-icon-2.png', 'hidden': false, 'index': 1});

    def.skinParams([
        {'id': 'bg2', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_19', lang: 'bg'},

        {'id': 'timecolor', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_11', lang: 'ONLINECLOCK_Time'},
        {'id': 'datecolor', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_11', lang: 'ONLINECLOCK_Date'},

        {'id': 'timefont', 'type':Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_5', lang: 'ONLINECLOCK_Time'},
        {'id': 'datefont', 'type':Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_9', lang: 'ONLINECLOCK_Date'},

        {'id': 'rd', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '4px'},
        {'id': 'shd', 'type': Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue': '0px 1px 1px rgba(0, 0, 0, .2)'},

        {
            "id": "transition",
            "type": Constants.SkinParamTypes.TRANSITION,
            "defaultValue": "opacity 0.4s ease 0s"
        }
    ]);

    def.html(
        '<div skinpart="container">' +
            '<div skinpart="date"></div>' +
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
        '</div>'
    );

    def.css([
        '%container% {padding: 10px 10px 6px; background: [bg2];' +
            'background-image: -webkit-linear-gradient(148deg, transparent 0%, rgba(255,255,255,.35) 99%);' +
            'background-image: -moz-linear-gradient(148deg, transparent 0%, rgba(255,255,255,.35) 99%);' +
            'background-image: -ms-linear-gradient(148deg, transparent 0%, rgba(255,255,255,.35) 99%);' +
            'background-image: -o-linear-gradient(148deg, transparent 0%, rgba(255,255,255,.35) 99%);' +
            'background-image: linear-gradient(148deg, transparent 0%, rgba(255,255,255,.35) 99%);' +
            '[rd] [shd]}',
        '%time% {display: inline-block; color: [timecolor]; [timefont] line-height: 1em; white-space: nowrap}',
        '%time% .colon {[transition]}',
        '[state~=colonHide] .colon {opacity:0}',
        '%time% .ampm {display: inline-block; margin-left: 10px}',
        '%date% {display: inline-block; color: [datecolor]; [datefont] line-height: 1em; white-space: nowrap; margin-bottom: 5px}',
        '%date% .slash {display: inline-block; margin: 0 1px;}',

        '[state~=alignLeft] %container% { text-align: left }',
        '[state~=alignCenter] %container% { text-align: center }',
        '[state~=alignRight] %container% { text-align: right }'
    ]);
});