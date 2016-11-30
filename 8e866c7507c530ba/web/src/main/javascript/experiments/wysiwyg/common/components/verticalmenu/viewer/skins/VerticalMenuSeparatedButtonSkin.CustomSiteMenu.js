define.experiment.skin('wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonSkin.CustomSiteMenu', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.css([
        //General
        '{ pointer-events: none; }',
        '[state~="items-align-left"] { text-align: left; }',
        '[state~="items-align-center"] { text-align: center; }',
        '[state~="items-align-right"] { text-align: right; }',

        '%menuContainer% { pointer-events: auto; padding: 0; margin: 0; height:100%; position: relative; display: inline-block; }',
        '%menuContainer% .emptySubMenu { display: none; }',
        '%.itemContentWrapper% { display: inline-block; border:solid [brw] [brd]; [shd] [rd] [itemBGColorTrans] cursor:pointer; padding-left: [textSpacing]; padding-right: [textSpacing]; [bg] }',
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
        '%.itemContentWrapper%:hover > %.subMenu% { background-color: transparent; opacity: 1; [subMenuOpacityTrans] display:block; }',

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
        '%.item%:not(.noLink) > %.itemContentWrapper%:hover { [bgh] [itemBGColorTrans] }',
        '%.item%:not(.noLink) > %.itemContentWrapper%:hover > .label { color:[txth] }',

        '%.item%.noLink > %.itemContentWrapper% { cursor: default; }',

        //This is necessary to keep the sub-menu open when the mouse is between the menu item and the sub-menu
        '%.itemContentWrapper%:hover:before { content: " "; position:absolute; left: 0; right: 0; height:100%; top: 0; }',

        //Separator
        '%.separator% { width: 100%; height: [separatorHeight]; background-color:transparent; }',
        '%.item%:last-child %.separator% { display: none; }',

        //Item selected style (or one of it's child)
        '%.item%.selected > %.itemContentWrapper% { [bgs] [itemBGColorTrans] }',
        '%.item%.selectedContainer:not(.noLink) > %.itemContentWrapper% { [bgs] [itemBGColorTrans] }',
        '%.item%.selected > %.itemContentWrapper% > .label { color:[txts]; }',
        '%.item%.selectedContainer:not(.noLink) > %.itemContentWrapper% > .label { color:[txts]; }'
    ]);
});