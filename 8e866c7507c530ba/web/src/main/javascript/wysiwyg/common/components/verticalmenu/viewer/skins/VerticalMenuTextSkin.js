define.skin('wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuTextSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Text', 'iconUrl': 'images/wysiwyg/skinIcons/verticalmenu/text.jpg', 'hidden': false, 'index': 2});

    def.skinParams([
        {'id':'SKINS_bgSubmenu', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11', 'styleDefaults': { "alpha": 0.6 }},

        {'id':'txt', 'type':Constants.SkinParamTypes.COLOR, 'defaultTheme':'color_15'},
        {'id':'txth', 'type':Constants.SkinParamTypes.COLOR, 'defaultTheme':'color_13'},
        {'id':'txts', 'type':Constants.SkinParamTypes.COLOR, 'defaultTheme':'color_13'},

        {'id':'fnt', 'type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},
        {'id':'SKINS_fntSubmenu', 'type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},

        {'id':'SKINS_submenuMargin', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '1px' },

        {'id':'textSpacing', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '10px'},
        {'id':'subItemAlterAlignPad', 'type':Constants.SkinParamTypes.SIZE, 'mutators': [ 'increase', 7 ], 'defaultParam': 'textSpacing' },

        {'id':'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue':'0 1px 4px rgba(0, 0, 0, 0.6);', "styleDefaults": { "boxShadowToggleOn": "false" }},

        {'id':'subMenuOpacityTrans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'all 0.4s ease 0s'}
    ]);

    def.html(
        '<ul skinpart="menuContainer">' +
            '<li skinpart="menuItem" class="item">' +
                '<a></a>' +
                '<ul class="subMenu"></ul>' +
            '</li>' +
        '</ul>'
    );

    //God help you if you remove the space before the .label rules (this class is added by JS later)
    def.css([
        //General
        '%menuContainer% { padding: 0; margin: 0; height:100%; position: relative; }',
        '%menuContainer% .emptySubMenu { display: none!important; }',

        '%.item% { padding-left: [textSpacing]; padding-right: [textSpacing]; margin: 0; position: relative; display: block; cursor:pointer; list-style: none; }',
        ' .label { [fnt] color:[txt]; display: block; white-space: nowrap; text-overflow:ellipsis; overflow:hidden; }',
        '%.subMenu% .label { [SKINS_fntSubmenu] }',

        '%.item%:last-child { border-bottom: none; }',

        '[state~="items-align-left"] %.item% { text-align: left; }',
        '[state~="items-align-center"] %.item% { text-align: center; }',
        '[state~="items-align-right"] %.item% { text-align: right; }',

        '[state~="subItems-align-left"] %.subMenu% > %.item% { text-align: left; padding-left: [textSpacing]; padding-right: [subItemAlterAlignPad]; }',
        '[state~="subItems-align-center"] %.subMenu% > %.item% { text-align: center; padding-left: [textSpacing]; padding-right: [textSpacing]; }',
        '[state~="subItems-align-right"] %.subMenu% > %.item% { text-align: right; padding-left: [subItemAlterAlignPad]; padding-right: [textSpacing]; }',

        //Hide sub-menus
        '%.subMenu% { z-index: 999; min-width:100%; opacity: 0; display: none; position: absolute; [subMenuOpacityTrans] [SKINS_bgSubmenu] [shd] }',

        //Show sub-menus on hover
        '%.item%:hover > %.subMenu% { opacity: 1; [subMenuOpacityTrans] display: block; }',

        //Sub-menu side open
        '[state~="subMenuOpenSide-right"] %.subMenu% { left: 100%; float: left; margin-left: [SKINS_submenuMargin]; }',
        '[state~="subMenuOpenSide-left"] %.subMenu% { right: 100%; float: right; margin-right: [SKINS_submenuMargin]; }',

        //Sub-menu open direction
        '[state~="subMenuOpenDir-down"] %.subMenu% { top: 0; }',
        '[state~="subMenuOpenDir-up"] %.subMenu% { bottom: 0; }',

        //This bridges the gap so you can mouse into the sub-menu without it disappearing
        '%.subMenu%:before { content: " "; display: block; width: [SKINS_submenuMargin]; height: 100%; position: absolute; top: 0; }',
        '[state~="subMenuOpenSide-right"] %.subMenu%:before { left: 0; margin-left: -[SKINS_submenuMargin]; }',
        '[state~="subMenuOpenSide-left"] %.subMenu%:before { right: 0; margin-right: -[SKINS_submenuMargin]; }',

        //Item hover style
        ' %.item%:hover > .label { color:[txth]; }',

        //Item selected style (or one of it's child)
        ' %.item%.selected > .label { color:[txts]; }',
        ' %.item%.selectedContainer > .label { color:[txts]; }'
    ]);
});