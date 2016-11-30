define.experiment.skin('wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSolidColorSkin.CustomSiteMenu', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

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

        ' %.itemHoverArea%.noLink > %.item% { cursor: default; }',
        ' %.itemHoverArea%.noLink > %.item% > .label { cursor: default; }',

        //Item hover style
        '%.itemHoverArea%:hover:not(.noLink) > %.item% { [bgh] [itemBGColorTrans] }',
        ' %.itemHoverArea%:hover:not(.noLink) > %.item% > .label { color:[txth]; }',

        //Item selected style (or one of it's child)
        '%.itemHoverArea%.selected > %.item% { [bgs] [itemBGColorTrans] }',
        '%.itemHoverArea%.selectedContainer:not(.noLink) > %.item% { [bgs] [itemBGColorTrans] }',
        ' %.itemHoverArea%.selected > %.item% > .label { color:[txts]; }',
        ' %.itemHoverArea%.selectedContainer:not(.noLink) > %.item% > .label { color:[txts]; }'
    ]);
});