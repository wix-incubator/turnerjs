define.skin('wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSolidColorSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.statics({
        separatorNotIncludedInLineHeight: true
    });

    def.iconParams({'description': 'Solid Color', 'iconUrl': 'images/wysiwyg/skinIcons/verticalmenu/solidColor.jpg', 'hidden': false, 'index': 0});

    def.skinParams([
        {'id':'fnt','type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},
        {'id':'SKINS_fntSubmenu','type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},

        {'id':'txt',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_15'},
        {'id':'txth',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_13'},
        {'id':'txts',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_13'},

        {'id':'sep',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15'},
        {'id':'sepw',  'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '1px'},
        {'id':'separatorHeight', 'type':Constants.SkinParamTypes.SIZE, 'defaultParam': 'sepw'},
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
        {'id':'submenuItemRdTop', 'type':Constants.SkinParamTypes.BORDER_RADIUS, mutators:['square',['br','bl']], 'defaultParam': 'SKINS_submenuBR'},
        {'id':'submenuItemRdBottom', 'type':Constants.SkinParamTypes.BORDER_RADIUS, mutators:['square',['tr','tl']], 'defaultParam': 'SKINS_submenuBR'},
        {'id':'SKINS_submenuMargin', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '0' },
        {'id':'dropdownMarginReal', 'type':Constants.SkinParamTypes.SIZE, 'sumParams': ['SKINS_submenuMargin', 'brw'], 'noshow': true, 'usedInLogic': true },


        {'id':'textSpacing', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '10px'},
        {'id':'subItemAlterAlignPad', 'type':Constants.SkinParamTypes.SIZE, 'mutators': [ 'increase', 7 ], 'defaultParam': 'textSpacing' },

        {'id':'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue':'0 1px 4px rgba(0, 0, 0, 0.6);', "styleDefaults": { "boxShadowToggleOn": "false" }},

        {'id':'itemBGColorTrans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'background-color 0.4s ease 0s'},
        {'id':'subMenuOpacityTrans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'all 0.4s ease 0s'}
    ]);

    def.html(
        '<ul skinpart="menuContainer">' +
            '<li skinpart="menuItem" class="itemHoverArea">' +
                '<div class="item">' +
                    '<a></a>' +
                    '<ul class="subMenu"></ul>' +
                '</div>' +
            '</li>' +
        '</ul>'
    );

    //God help you if you remove the space before the .label rules (this class is added by JS later)
    def.css([
        //General
        '%menuContainer% { padding: 0; margin: 0; height:100%; border:solid [brw] [brd]; position: relative; [shd] [rd] }',
        '%menuContainer% .emptySubMenu { display: none!important; }',
        '%.itemHoverArea% { box-sizing: content-box; border-bottom:solid [sepw] [sep]; }',
        '%.item% { height: 100%; padding-left: [textSpacing]; padding-right: [textSpacing]; [itemBGColorTrans] margin: 0; position: relative; cursor:pointer; list-style: none; [bg] }',
        ' .label { [fnt] color:[txt]; display: block; white-space: nowrap; text-overflow:ellipsis; overflow:hidden; }',
        '%.subMenu% %.item% { [SKINS_bgSubmenu]; }',
        '%.subMenu% .label { [SKINS_fntSubmenu]; }',

        '[state~="items-align-left"] %.item% { text-align: left; }',
        '[state~="items-align-center"] %.item% { text-align: center; }',
        '[state~="items-align-right"] %.item% { text-align: right; }',

        '[state~="subItems-align-left"] %.subMenu% > %.item% { text-align: left; padding-left: [textSpacing]; padding-right: [subItemAlterAlignPad]; }',
        '[state~="subItems-align-center"] %.subMenu% > %.item% { text-align: center; padding-left: [textSpacing]; padding-right: [textSpacing]; }',
        '[state~="subItems-align-right"] %.subMenu% > %.item% { text-align: right; padding-left: [subItemAlterAlignPad]; padding-right: [textSpacing]; }',

        //Round corners to first and last elements
        '%.itemHoverArea%:first-child > %.item% { [rdTop] }',
        '%.itemHoverArea%:last-child { border-bottom: 0px solid transparent; }',
        '%.itemHoverArea%:last-child > %.item% { [rdBottom] border-bottom: 0px solid transparent; }',
        '%.subMenu% > %.itemHoverArea%:first-child > %.item% { [submenuItemRdTop] }',
        '%.subMenu% > %.itemHoverArea%:last-child { border-bottom: 0px solid transparent; }',
        '%.subMenu% > %.itemHoverArea%:last-child > %.item% { [submenuItemRdBottom] border-bottom: 0px solid transparent; }',
        '%.subMenu% > %.itemHoverArea%:first-child:last-child > %.item% { [SKINS_submenuBR]; }', // only child

        //Hide sub-menus
        '%.subMenu% { z-index: 999; min-width:100%; display: none; visibility: hidden; opacity: 0; [subMenuOpacityTrans]; position: absolute; border:solid [brw] [brd]; [SKINS_submenuBR]; [shd]; }',

        //Show sub-menus on hover
        '%.itemHoverArea%:hover %.subMenu% { opacity: 1; display: block; visibility: visible; }',

        //Sub-menu side open
        '[state~="subMenuOpenSide-right"] %.subMenu% { left: 100%; float: left; margin-left: [SKINS_submenuMargin]; }',
        '[state~="subMenuOpenSide-left"] %.subMenu% { right: 100%; float: right; margin-right: [SKINS_submenuMargin]; }',

        //Sub-menu open direction
        '[state~="subMenuOpenDir-down"] %.subMenu% { top: -[brw]; }',
        '[state~="subMenuOpenDir-up"] %.subMenu% { bottom: -[brw]; }',

        //This bridges the gap so you can mouse into the sub-menu without it disappearing
        '%.subMenu%:before { background-color: white; opacity: 0; z-index: 999; content: " "; display: block; width: [dropdownMarginReal]; height: 100%; position: absolute; top: 0; }',
        '[state~="subMenuOpenSide-right"] %.subMenu%:before { right: 100%; }',
        '[state~="subMenuOpenSide-left"] %.subMenu%:before { left: 100%; }',



        //Item hover style
        '%.itemHoverArea%:hover > %.item% { [bgh] [itemBGColorTrans] }',
        ' %.itemHoverArea%:hover > %.item% > .label { color:[txth]; }',

        //Item selected style (or one of it's child)
        '%.itemHoverArea%.selected > %.item% { [bgs] [itemBGColorTrans] }',
        '%.itemHoverArea%.selectedContainer > %.item% { [bgs] [itemBGColorTrans] }',
        ' %.itemHoverArea%.selected > %.item% > .label { color:[txts]; }',
        ' %.itemHoverArea%.selectedContainer > %.item% > .label { color:[txts]; }'
    ]);
});