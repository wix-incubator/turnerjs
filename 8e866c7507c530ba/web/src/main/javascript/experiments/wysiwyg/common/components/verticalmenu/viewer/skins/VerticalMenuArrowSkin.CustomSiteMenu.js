define.experiment.skin('wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuArrowSkin.CustomSiteMenu', function(skinDefinition){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

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
        '%.item%:hover:not(.noLink) > .itemWrapper { background-color: [bgh]; }',
        '%.item%:hover:not(.noLink) > .itemWrapper > .label { color:[txth]; }',
        '%.item%:hover .arrow:after { border-left-color: [bgh]; border-right-color: [bgh]; }',

        //Sub-Item hover style
        '%.subMenu% > %.item%:hover:not(.noLink) { background-color: [bgh]; [itemBGColorTrans] }',
        '%.subMenu% > %.item%:hover:not(.noLink) > .label { color:[txth]; }',

        '%.item%.noLink > .itemWrapper { cursor: default; }',

        //Item selected style (or one of it's child)
        '%.item%.selected > .arrowWrapper { display: block; }',
        '%.item%.selectedContainer > .arrowWrapper { display: block; }',
        '%.item%.selected > .itemWrapper { background-color: [bgs]; }',
        '%.item%.selectedContainer:not(.noLink) > .itemWrapper { background-color: [bgs]; }',
        '%.item%.selected > .itemWrapper > .label { color:[txts]; }',
        '%.item%.selectedContainer:not(.noLink) > .itemWrapper > .label { color:[txts]; }',
        '%.item%.selected > .arrowWrapper > .arrow:after { border-left-color: [bgs]; border-right-color: [bgs]; }',
        '%.item%.selectedContainer:not(.noLink) > .arrowWrapper > .arrow:after { border-left-color: [bgs]; border-right-color: [bgs]; }',


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