define.experiment.skin('wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuTextWithSeparatorsSkin.CustomSiteMenu', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    //God help you if you remove the space before the .label rules (this class is added by JS later)
    def.css([
        //General
        '%menuContainer% { padding: 0; margin: 0; height:100%; border-top:solid [sepw] [brd]; border-bottom:solid [sepw] [brd]; position: relative; }',
        '%menuContainer% .emptySubMenu { display: none!important; }',

        '%.item% { border-bottom:solid [sepw] [brd]; padding-left: [textSpacing]; padding-right: [textSpacing]; [itemBGColorTrans] margin: 0; position: relative; display: block; cursor:pointer; list-style: none; }',
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
        '%.subMenu% { z-index: 999; min-width:100%; opacity: 0; display: none; position: absolute; border-top:solid [sepw] [brd]; border-bottom:solid [sepw] [brd]; [subMenuOpacityTrans] [SKINS_bgSubmenu] [shd] }',

        //Show sub-menus on hover
        '%.item%:hover > %.subMenu% { opacity: 1; [subMenuOpacityTrans] display: block; }',

        //Sub-menu side open
        '[state~="subMenuOpenSide-right"] %.subMenu% { left: 100%; float: left; margin-left: [SKINS_submenuMargin]; }',
        '[state~="subMenuOpenSide-left"] %.subMenu% { right: 100%; float: right; margin-right: [SKINS_submenuMargin]; }',

        //Sub-menu open direction
        '[state~="subMenuOpenDir-down"] %.subMenu% { top: -[sepw]; }',
        '[state~="subMenuOpenDir-up"] %.subMenu% { bottom: -[sepw]; }',

        //This bridges the gap so you can mouse into the sub-menu without it disappearing
        '%.subMenu%:before { content: " "; display: block; width: [SKINS_submenuMargin]; height: 100%; position: absolute; top: 0; }',
        '[state~="subMenuOpenSide-right"] %.subMenu%:before { left: 0; margin-left: -[SKINS_submenuMargin]; }',
        '[state~="subMenuOpenSide-left"] %.subMenu%:before { right: 0; margin-right: -[SKINS_submenuMargin]; }',

        //Item hover style
        '%.item%:hover:not(.noLink) { [bgh] [itemBGColorTrans] }',
        '%.item%:hover:not(.noLink) > .label { color:[txth]; }',

        '%.item%.noLink > .label { cursor: default; }',
        '%.item%.noLink { cursor: default; }',

        //Item selected style (or one of it's child)
        '%.item%.selected { [bgs] [itemBGColorTrans] }',
        '%.item%.selectedContainer:not(.noLink) { [bgs] [itemBGColorTrans] }',
        ' %.item%.selected > .label { color:[txts]; }',
        ' %.item%.selectedContainer:not(.noLink) > .label { color:[txts]; }'
    ]);
});