define.skin('wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonFixedWidthSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.statics({
        separatorNotIncludedInLineHeight: true,
        borderNotIncludedInLineHeight: true
    });

    def.iconParams({'description': 'Separated Buttons Fixed Width', 'iconUrl': 'images/wysiwyg/skinIcons/verticalmenu/seperatedButtonsFixedWidth.jpg', 'hidden': false, 'index': 1});

    def.skinParams([
        {'id':'fnt','type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},
        {'id':'SKINS_fntSubmenu','type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},

        {'id':'txt',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_15'},
        {'id':'txth',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_13'},
        {'id':'txts',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_13'},

        {'id':'separatorHeight',  'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '8', 'usedInLogic': true},
        {'id':'bg', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11'},
        {'id':'SKINS_bgSubmenu', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11'},
        {'id':'bgh', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_15'},
        {'id':'bgs', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_15'},
        {'id':'rd',  'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'0'},
        {'id':'SKINS_submenuBR',  'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'0'},
        {'id':'brw', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '1px', 'usedInLogic': true},
        {'id':'brd',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15'},
        {'id':'rdTop', 'type':Constants.SkinParamTypes.BORDER_RADIUS, mutators:['square',['br','bl']], 'defaultParam': 'rd'},
        {'id':'rdBottom', 'type':Constants.SkinParamTypes.BORDER_RADIUS, mutators:['square',['tr','tl']], 'defaultParam': 'rd'},
        {'id':'dropDownRdTop', 'type':Constants.SkinParamTypes.BORDER_RADIUS, mutators:['square',['br','bl']], 'defaultParam': 'SKINS_submenuBR'},
        {'id':'dropDownRdBottom', 'type':Constants.SkinParamTypes.BORDER_RADIUS, mutators:['square',['tr','tl']], 'defaultParam': 'SKINS_submenuBR'},
        {'id':'SKINS_submenuMargin', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '8px' },
        {'id':'dropdownMarginReal', 'type':Constants.SkinParamTypes.SIZE, 'sumParams': ['SKINS_submenuMargin', 'brw', 'brw'], 'noshow': true },

        {'id':'textSpacing', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '10px'},
        {'id':'subItemAlterAlignPad', 'type':Constants.SkinParamTypes.SIZE, 'mutators': [ 'increase', 7 ], 'defaultParam': 'textSpacing' },

        {'id':'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue':'0 1px 4px rgba(0, 0, 0, 0.6);', "styleDefaults": { "boxShadowToggleOn": "false" }},

        {'id':'itemBGColorTrans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'background-color 0.4s ease 0s'},
        {'id':'subMenuOpacityTrans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'all 0.6s ease 0s'}
    ]);

    def.html(
        '<ul skinpart="menuContainer">' +
            '<li skinpart="menuItem" class="item">' +
                '<div class="itemContentWrapper">' +
                    '<a></a>' +
                    '<ul class="subMenu"></ul>' +
                '</div>' +
                '<div class="separator"></div>' +
            '</li>' +
        '</ul>'
    );

    //God help you if you remove the space before the .label rules (this class is added by JS later)
    def.css([
        //General
        '{ pointer-events: none; }',
        '[state~="items-align-left"] { text-align: left; }',
        '[state~="items-align-center"] { text-align: center; }',
        '[state~="items-align-right"] { text-align: right; }',

        '%menuContainer% { pointer-events: auto; padding: 0; margin: 0; height:100%; width: 100%; position: relative; }',
        '%menuContainer% .emptySubMenu { display: none; }',
        '%.itemContentWrapper% { display: block; border:solid [brw] [brd]; [shd] [rd] [itemBGColorTrans] cursor:pointer; padding-left: [textSpacing]; padding-right: [textSpacing]; [bg] }',
        '%.item% { width: 100%; background-color: transparent; margin: 0; position: relative; float:left; clear:left; list-style: none; }',
        ' .label { [fnt] color:[txt]; display: block; white-space: nowrap; text-overflow:ellipsis; overflow:hidden; }',
        '%.subMenu% .label { [SKINS_fntSubmenu] }',
        '%.subMenu% %.itemContentWrapper% { border:solid [brw] [brd]; [SKINS_bgSubmenu] [SKINS_submenuBR] [shd] }',

        '[state~="items-align-left"] %.item% { text-align: left; }',
        '[state~="items-align-center"] %.item% { text-align: center; }',
        '[state~="items-align-right"] %.item% { text-align: right; }',

        '[state~="subItems-align-left"] %.subMenu% %.item% { text-align: left; }',
        '[state~="subItems-align-center"] %.subMenu% %.item% { text-align: center; }',
        '[state~="subItems-align-right"] %.subMenu% %.item% { text-align: right; }',

        '[state~="subItems-align-left"] %.subMenu% %.itemContentWrapper% { padding-left: [textSpacing]; padding-right: [subItemAlterAlignPad]; }',
        '[state~="subItems-align-center"] %.subMenu% %.itemContentWrapper% { padding-left: [textSpacing]; padding-right: [textSpacing]; }',
        '[state~="subItems-align-right"] %.subMenu% %.itemContentWrapper% { padding-left: [subItemAlterAlignPad]; padding-right: [textSpacing]; }',

        //Hide sub-menus
        '%.subMenu% { min-width: 100%; z-index: 999; background-color: transparent; opacity: 0; display: none; position: absolute; [subMenuOpacityTrans] }',

        //Show sub-menus on hover
        '%.itemContentWrapper%:hover > %.subMenu% { background-color: transparent; opacity: 1; [subMenuOpacityTrans] display: block; }',

        //Sub-menu side open
        // Shifting the submenu 1px back, so that it overlaps the parent-menu's border when skin param SKINS_submenuMargin == 0
        '[state~="subMenuOpenSide-right"] %.subMenu% { left: 100%; left: calc(100% - 1px); float: left; margin-left: [SKINS_submenuMargin]; }',
        '[state~="subMenuOpenSide-left"] %.subMenu% { right: 100%; right: calc(100% - 1px); float: right; margin-right: [SKINS_submenuMargin]; }',

        //Sub-menu open direction
        '[state~="subMenuOpenDir-down"] %.subMenu% { top: 0; }',
        '[state~="subMenuOpenDir-up"] %.subMenu% { bottom: 0; }',

        //This bridges the gap so you can mouse into the sub-menu without it disappearing
        '%.subMenu%:before { content: " "; display: block; width: [SKINS_submenuMargin]; height: 100%; position: absolute; top: 0; }',
        '[state~="subMenuOpenSide-right"] %.subMenu%:before { left: 0; margin-left: -[SKINS_submenuMargin]; }',
        '[state~="subMenuOpenSide-left"] %.subMenu%:before { right: 0; margin-right: -[SKINS_submenuMargin]; }',

        //Item hover style
        '%.itemContentWrapper%:hover { [bgh] [itemBGColorTrans] }',
        '%.itemContentWrapper%:hover > .label { color:[txth]; }',

        //This is necessary to keep the sub-menu open when the mouse is between the menu item and the sub-menu
        '%.itemContentWrapper%:hover:before { content: " "; position:absolute; left: 0; right: 0; height:100%; top: 0; }',

        //Separator
        '%.separator% { width: 100%; height: [separatorHeight]; background-color:transparent; }',
        '%.item%:last-child %.separator% { display: none; }',

        //Item selected style (or one of it's child)
        '%.item%.selected > %.itemContentWrapper% { [bgs] [itemBGColorTrans] }',
        '%.item%.selectedContainer > %.itemContentWrapper% { [bgs] [itemBGColorTrans] }',
        '%.item%.selected > %.itemContentWrapper% > .label { color:[txts]; }',
        '%.item%.selectedContainer > %.itemContentWrapper% > .label { color:[txts]; }'
    ]);
});