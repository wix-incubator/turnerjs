define.experiment.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.HorizontalSiteMenuSkin.Dropdownmenu', function(skinDefinition, experimentStrategy){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition,
        strategy = experimentStrategy;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Separate Shiny-Buttons Menu II', 'iconUrl': '/images/wysiwyg/skinIcons/menu/menusolidgradient.png', 'hidden': true, 'index': 0});

    def.compParts(strategy.customizeField(function() {return {};}));

    def.skinParams([
       {'id': 'fnt','type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},
       {'id': 'txt',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_15'},
       {'id': 'txth',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_15'},
       {'id': 'txts',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_15'},

       {'id': 'bg', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11'},
       {'id': 'bgh', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_17'},
       {'id': 'bgs', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_18'},
       {'id': 'bgDrop', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11'},

       {'id': 'rd', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '10px'},
       {'id': 'rdDrop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '10px'},
       {'id': 'rdRight', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['bl', 'tl']], 'defaultParam': 'rd'},
       {'id': 'rdLeft', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['br', 'tr']], 'defaultParam': 'rd'},
       {'id': 'rdTop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['bl', 'br']], 'defaultParam': 'rdDrop'},
       {'id': 'rdBottom', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tl', 'tr']], 'defaultParam': 'rdDrop'},

       {'id': 'sep',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15'},
       {'id': 'brd',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15'},
       {'id': 'brw', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '0'},

       {'id': 'SKINS_dropDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '5px'},
       {'id': 'trueDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultParam': 'SKINS_dropDistance' ,'sumParams': ['SKINS_dropDistance', 'brw'], 'usedInLogic': true, 'noshow': true},

       {'id': 'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue':'0 1px 4px rgba(0, 0, 0, 0.6);'},

       {'id': 'trans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'background-color 0.4s ease 0s'},
       {'id': 'trans2','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'color 0.4s ease 0s'},
       {'id': 'pos', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'top: 0; bottom: 0; right: 0; left: 0;', 'noshow': true},
       {'id': 'ellipsis', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;', 'noshow': true}
   ]);

   def.html(
       '<ul skinpart="menuContainer">' +
           '<li skinpart="menuItem">' +
               '<a></a>' +
               '<div class="wrapper">' +
                   '<ul></ul>' +
               '</div>' +
           '</li>' +
       '</ul>'
   );

    def.css([
        'ul {cursor: pointer; list-style: none; padding: 0; margin: 0; white-space: nowrap; position: absolute;}',
        'li {[bg] margin: 0; padding: 0; box-sizing: border-box;}',
        'li:hover {[bgh] [trans]}',
        'li.selected {[bgs]}',
        'li.selected:hover {[bgs]}',

        ' .label {[fnt] color: [txt]; padding: 0 10px; vertical-align: middle;}',
        ' li:hover > .label {color: [txth]}',
        ' .selected .label {[trans2] color: [txts]; display: inline-block;}',
        ' .selected:hover .label {color: [txts];}',

        ' .moreButton{[ellipsis] vertical-align: middle;}',
        ' .wrapper {visibility: hidden; min-width: inherit; z-index: 1; position: absolute; width: 100%; left: 0;}',

        '%menuContainer% {[pos] [rd] [shd] box-sizing: border-box; border: [brw] solid [brd]; display: table; position: relative !important;}',
        '%menuContainer% > li {[bg] border-left: 1px solid [sep]; display: table-cell; vertical-align: middle; position: relative; height: 100%;}',

        '%menuContainer% > li:first-child {[rdLeft] border-left: 0 solid [sep];}',
        '%menuContainer% > li:last-child {[rdRight]}',
        '%menuContainer% > li:only-child {[rd]}',

        '%menuContainer% > li:hover > .wrapper {visibility: visible;}',
        '%menuContainer% > li:hover > .wrapper > .emptySubMenu {visibility: hidden; padding: 0;}',

        '%menuContainer% > li:last-child.selectedContainer {[rdRight]}',
        '%menuContainer% > li:only-child.selectedContainer {[rd]}',

        ' .subMenu {[shd] [rdDrop] width: auto;}',
        ' .subMenu li {[bgDrop] border-left: [brw] solid [brd]; border-right: [brw] solid [brd]; border-bottom: 1px solid [sep]; height: 50px;}',
        ' .subMenu li:hover {[bgh] [trans]}',
        ' .subMenu li.selected {[bgs]}',
        ' .subMenu li:first-child {[rdTop] border-top: [brw] solid [brd];}',
        ' .subMenu li:last-child {[rdBottom] border-bottom: [brw] solid [brd];}',

        '[state~="buttons-align-left"] ul {float: left;}',
        '[state~="buttons-align-center"] ul {margin: 0 auto; float: none;}',
        '[state~="buttons-align-right"] ul {float: right;}',

        '[state~="text-align-left"] li {text-align: left;}',
        '[state~="text-align-center"] li {text-align: center;}',
        '[state~="text-align-right"] li {text-align: right;}',

        '[state~="buttons-stretch"] %menuContainer% {text-align: justify; display: table; width: 100%;}',
        '[state~="buttons-stretch"]:after {content: ""; width: 100%;}',
        '[state~="buttons-stretch"] li {box-sizing: border-box;}',

        '[state~=subMenuOpenDir-up] %menuContainer% > li > .wrapper {bottom: 100%; padding: [trueDistance] 0;}',
        '[state~=subMenuOpenDir-up] .subMenu {bottom: 100%;}',

        '[state~=subMenuOpenDir-down] %menuContainer% > li > .wrapper {top: 100%; padding: [trueDistance] 0;}',
        '[state~=subMenuOpenDir-down] .subMenu {top: 100%;}'
    ]);
});