define.skin('wysiwyg.editor.skins.panels.MobileQuickActionsViewPanelSkin', function(def){
    def.inherits('mobile.core.skins.BaseSkin');
    def.skinParams(
        [
            {'id': 'webThemeDir', 'type':Constants.SkinParamTypes.URL, 'defaultTheme': 'WEB_THEME_DIRECTORY'},
            {'id': '$contentAreaShadow', 'type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue': '-3px 0 50px #000'},
            {'id': '$sidePanelBorderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0 16px 16px 0'},
            {'id': '$topBorderRightRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0 16px 0 0'},
            //Typography
            {'id': 'titleFontSize', 'type':Constants.SkinParamTypes.OTHER, 'defaultValue': '18px'}
        ]
    );

    def.compParts(
        {
            doneButton: {skin: 'wysiwyg.editor.skins.buttons.ButtonSmallerBlueSkin'}
        }
    );

    def.html(
        '<div skinPart="topBar">' +
            '<div class="label">' +
            '<strong skinPart="panelLabel"></strong>' +
            '</div>'+

            '<div class="topBarActions">' +
            '<div skinPart="help" class="help"><span>&nbsp;</span></div>' +
            '<div skinPart="close"><span>&nbsp;</span></div>' +
            '</div>' +
            '</div>' +

            '<div skinPart="content"></div>' +

            '<div skinpart="bottom">' +
            '<div class="doneWrapper">' +
            '<div skinPart="doneButton"></div>'+
            '</div>' +
        '</div>'
    );

    def.css(
        [
            '{position:absolute; left:247px; min-height:223px; background-color:#fdfdfd; width:800px; [$contentAreaShadow]; [$sidePanelBorderRadius];}',

            '%topBar% {width :100%; [$BorderTopRadius]; border-bottom:1px solid #ddd;}',
            '%.label% {overflow:hidden; width:250px}',
            '%panelLabel% {padding-left:35px; display:block; font-size: [titleFontSize]; line-height: 38px; font-weight:bold; color:#444;}',
            '%.topBarActions% {position:absolute; right:0; top:0;}',

            '%.help% {width:35px; height:35px; position:absolute; right:35px;}',
            '%.help% span {background:url([webThemeDir]icons/help_sprite.png) no-repeat 0 1px; width:19px; height:18px; position:absolute; right:8px; top:12px; cursor:pointer}',
            '%.help% span:hover { background-position: 0 -16px}',
            '%.help% span:active { background-position: 0 -33px}',

            '%close% {position:absolute; top:0; right:0; height:38px; width:34px; border-left:1px solid #ccc; cursor:pointer;}',
            '%close% span {position:absolute; left:50%; top:50%; margin: -8px 0 0 -10px; width:15px; height:15px; background:url("[webThemeDir]icons/top-bar-icons.png") 0 0 no-repeat}',
            '%close%:hover {background:#ddd; [$topBorderRightRadius]}',
            '%close%:hover span {background-position:0 -140px}',

            '%content% {padding:0 20px 0 40px; overflow:auto; border-top:1px solid #fff; word-wrap:break-word}',
            '%bottom%{height: 60px;}',
            '[state=SiteNamePanel] %bottom%{padding-top:60px;}',
            '%.doneWrapper% {position:absolute; bottom:20px; right:20px}'
        ]
    )
});