define.skin('wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuArrowSkin', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Arrow', 'iconUrl': 'images/wysiwyg/skinIcons/verticalmenu/ribbon.jpg', 'hidden': true, 'index': 6});

    def.skinParams([
        {'id':'fnt','type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},
        {'id':'fntDrop','type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},

        {'id':'txt',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_15'},
        {'id':'txth',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_13'},
        {'id':'txts',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_13'},

        {'id':'bg', 'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_11'},
        {'id':'bgDrop', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11'},
        {'id':'bgh', 'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15'},
        {'id':'bgs', 'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15'},
        {'id':'rd',  'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'0'},
        {'id':'dropdownBR',  'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'0'},
        {'id':'rdTop', 'type':Constants.SkinParamTypes.BORDER_RADIUS, mutators:['square',['br','bl']], 'defaultParam': 'rd'},
        {'id':'rdBottom', 'type':Constants.SkinParamTypes.BORDER_RADIUS, mutators:['square',['tr','tl']], 'defaultParam': 'rd'},
        {'id':'dropDownRdTop', 'type':Constants.SkinParamTypes.BORDER_RADIUS, mutators:['square',['br','bl']], 'defaultParam': 'dropdownBR'},
        {'id':'dropDownRdBottom', 'type':Constants.SkinParamTypes.BORDER_RADIUS, mutators:['square',['tr','tl']], 'defaultParam': 'dropdownBR'},
        {'id':'dropdownMargin', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '1px' },

        {'id':'textSpacing', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '10px'},
        {'id':'subItemAlterAlignPad', 'type':Constants.SkinParamTypes.SIZE, 'mutators': [ 'increase', 7 ], 'defaultParam': 'textSpacing' },

        {'id':'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue':'0 1px 4px rgba(0, 0, 0, 0.6);', "styleDefaults": { "boxShadowToggleOn": "false" }},

        {'id':'itemBGColorTrans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'background-color 0.4s ease 0s'},
        {'id':'subMenuOpacityTrans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'all 0.4s ease 0s'}
    ]);

    def.html(
        '<ul skinpart="menuContainer">' +
            '<li skinpart="menuItem" class="item">' +
                '<div class="itemWrapper">' +
                    '<a></a>' +
                    '<ol class="subMenu">' +
                    '</ol>' +
                '</div>' +
                '<div class="arrowWrapper">' +
                    '<span class="arrow arrowTop"></span>' +
                    '<span class="arrow arrowBottom"></span>' +
                '</div>' +
            '</li>' +

            '<li skinpart="subMenuItem" class="item">' +
                '<a></a>' +
                '<ul></ul>' +
            '</li>' +
        '</ul>'
    );

    //God help you if you remove the space before the .label rules (this class is added by JS later)
    def.css([
        //General
        '%menuContainer% { padding: 0; margin: 0; width: 100%; height:100%; position: relative; [shd] [rd] }',
        '%menuContainer% .emptySubMenu { display: none; }',
        '%.item% { background-color: [bg]; margin: 0; position: relative; display: block; cursor:pointer; list-style: none; [itemBGColorTrans] }',
        ' .label { padding-left: [textSpacing]; padding-right: [textSpacing]; [fnt] color:[txt]; display: block; white-space: nowrap; text-overflow:ellipsis; overflow:hidden; }',
        '%.subMenu% .label { [fntDrop] }',

        ' .itemWrapper { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }',

        // Arrow
        ' .arrowWrapper { z-index: 1000; display: none; width: 40px; height: 100%; position: absolute; top: 0; }',

        ' .arrow { position: absolute; width:100%; height: 50%; overflow:hidden; }',
        ' .arrow:after { width:100%; height:100%; position:absolute; content:" "; border-width:2000px; border-left-width:1000px; border-right-width:1000px; border-color:transparent; border-style:solid; }',

        ' .arrowTop { top: 0; }',
        ' .arrowBottom { top: 50%; }',

        ' .arrowTop:after { top: 0; }',
        ' .arrowBottom:after { bottom: 0; }',

        '[state~="subMenuOpenSide-right"] .arrowWrapper { left: 100%; }',
        '[state~="subMenuOpenSide-right"] .arrow { left: 0; }',
        '[state~="subMenuOpenSide-right"] .arrow:after  { left: 0; }',

        '[state~="subMenuOpenSide-left"] .arrowWrapper { right: 100%; }',
        '[state~="subMenuOpenSide-left"] .arrow { right: 0; }',
        '[state~="subMenuOpenSide-left"] .arrow:after { right: 0; }',


        //Item hover style
        '%.item%:hover .arrowWrapper { display: block; }',
        '%.item%:hover > .itemWrapper { background-color: [bgh]; }',
        '%.item%:hover > .itemWrapper > .label { color:[txth]; }',
        '%.item%:hover .arrow:after { border-left-color: [bgh]; border-right-color: [bgh]; }',

        //Sub-Item hover style
        '%.subMenu% > %.item%:hover { background-color: [bgh]; [itemBGColorTrans] }',
        '%.subMenu% > %.item%:hover > .label { color:[txth]; }',


        //Item selected style (or one of it's child)
        '%.item%.selected > .arrowWrapper { display: block; }',
        '%.item%.selectedContainer > .arrowWrapper { display: block; }',
        '%.item%.selected > .itemWrapper { background-color: [bgs]; }',
        '%.item%.selectedContainer > .itemWrapper { background-color: [bgs]; }',
        '%.item%.selected > .itemWrapper > .label { color:[txts]; }',
        '%.item%.selectedContainer > .itemWrapper > .label { color:[txts]; }',
        '%.item%.selected > .arrowWrapper > .arrow:after { border-left-color: [bgs]; border-right-color: [bgs]; }',
        '%.item%.selectedContainer > .arrowWrapper > .arrow:after { border-left-color: [bgs]; border-right-color: [bgs]; }',


        '[state~="items-align-left"] %.item% { text-align: left; }',
        '[state~="items-align-center"] %.item% { text-align: center; }',
        '[state~="items-align-right"] %.item% { text-align: right; }',

        '[state~="subItems-align-left"] %.subMenu% > %.item% { text-align: left; padding-left: [textSpacing]; padding-right: [subItemAlterAlignPad]; }',
        '[state~="subItems-align-center"] %.subMenu% > %.item% { text-align: center; padding-left: [textSpacing]; }',
        '[state~="subItems-align-right"] %.subMenu% > %.item% { text-align: right; padding-left: [subItemAlterAlignPad]; padding-right: [textSpacing]; }',

        //Round corners to first and last elements
        '%.item%:first-child { [rdTop] }',
        '%.item%:last-child { [rdBottom] border-bottom: 1px solid transparent; }',
        '%.subMenu% > %.item%:first-child { [dropDownRdTop] }',
        '%.subMenu% > %.item%:last-child { [dropDownRdBottom] border-bottom: 1px solid transparent; }',

        //Hide sub-menus
        '%.subMenu% { z-index: 999; min-width:100%; opacity: 0; display: none; position: absolute; [subMenuOpacityTrans] [bgDrop] [dropdownBR] [shd] }',

        //Show sub-menus on hover
        '%.item%:hover %.subMenu% { opacity: 1; [subMenuOpacityTrans] display: block; }',

        //Sub-menu opening side
        '[state~="subMenuOpenSide-right"] %.subMenu% { left: 100%; float: left; margin-left: [dropdownMargin]; }',
        '[state~="subMenuOpenSide-left"] %.subMenu% { right: 100%; float: right; margin-right: [dropdownMargin]; }',

        //Sub-menu opening direction
        '[state~="subMenuOpenDir-down"] %.subMenu% { top: 0; }',
        '[state~="subMenuOpenDir-up"] %.subMenu% { bottom: 0; }',

        //This bridges the gap so you can mouse into the sub-menu without it disappearing
        '%.subMenu%:before { content: " "; display: block; width: [dropdownMargin]; height: 100%; position: absolute; top: 0; }',
        '[state~="subMenuOpenSide-right"] %.subMenu%:before { left: 0; margin-left: -[dropdownMargin]; }',
        '[state~="subMenuOpenSide-left"] %.subMenu%:before { right: 0; margin-right: -[dropdownMargin]; }'
    ]);
});