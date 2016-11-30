define.experiment.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.PointerMenuButtonSkin.Dropdownmenu', function(skinDefinition, experimentStrategy){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition,
        strategy = experimentStrategy;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Pointer Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/menuribbonbottom.png', 'hidden': false, 'index': 12});

    def.compParts(strategy.customizeField(function() {return {};}));

    def.skinParams([
        {'id': 'fnt','type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},
        {'id': 'txt',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_15'},
        {'id': 'txth',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_12'},
        {'id': 'txts',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_12'},

        {'id': 'bg', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11'},
        {'id': 'bgh', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_18'},
        {'id': 'bgs', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_18'},
        {'id': 'bgDrop', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11'},

        {'id': 'arrBrdHover', 'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_18', 'defaultParam': 'bgh', 'noshow': true},
        {'id': 'arrBrd', 'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_18', 'defaultParam': 'bgs', 'noshow': true},
        {'id': 'arrSize', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '10px', 'noshow': true, 'usedInLogic': true},
        {'id': 'arrBSize', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '11px', 'noshow': true, 'usedInLogic': true},
        {'id': 'brd', 'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15'},

        {'id': 'rd', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0', 'lang': 'rdDrop'},
        {'id': 'rdTop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['bl', 'br']], 'defaultParam': 'rd'},
        {'id': 'rdBottom', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tl', 'tr']], 'defaultParam': 'rd'},

        {'id': 'SKINS_dropDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '0'},
        {'id': 'trueDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultParam': 'SKINS_dropDistance' ,'sumParams': ['SKINS_dropDistance'], 'usedInLogic': true, 'noshow': true},

        {'id': 'shd', 'type': Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue': '1px 1px 1px 0 rgba(0, 0, 0, 0.2);', 'styleDefaults': {'boxShadowToggleOn': 'false'}},

        {'id': 'trans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'background-color 0.4s ease 0s'},
        {'id': 'trans1','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'color 0.4s ease 0s'},
        {'id': 'pos', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'top: 0; bottom: 10px; right: 0; left: 0;', 'noshow': true},
        {'id': 'ellipsis', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;', 'noshow': true}
    ]);

    def.html(
        '<div class="strip">' +
            '<ul skinpart="menuContainer">' +
                '<li skinpart="menuItem">' +
                    '<a></a>' +
                    '<div class="wrapper">' +
                        '<ul></ul>' +
                    '</div>' +
                '</li>' +
            '</ul>' +
        '</div>'+
        '<div skinPart="hasExtraDecorations"></div>'
    );

    def.css([
        ' .strip {[bg] [pos] border-bottom: 1px solid [brd]; border-top: 0 solid [brd]; position: absolute; min-height: calc(100% - [arrBSize]); min-height: -webkit-calc(100% - [arrBSize]);}',
        'ul {cursor: pointer; list-style: none; padding: 0; margin: 0; white-space: nowrap; position: absolute; min-height: 100%;}',
        'li {margin: 0; padding: 0; box-sizing: border-box; [bg] [trans]}',
        'li:hover {[trans] [bgh]}',
        'li.selected {[bgs]}',
        'li.selected:hover {[bgs]}',

        ' .label {[fnt] [trans1] color: [txt]; padding: 0 10px; vertical-align: middle; line-height: 100% !important;}',
        ' li:hover > .label {[trans1] color: [txth]}',
        ' .selected > .label {color: [txts]; display: inline-block;}',
        ' .selected:hover > .label {color: [txts];}',

        '%menuContainer% > li.selectedContainer {[bgs]}',
        '%menuContainer% > li.selectedContainer:hover {[bgs]}',
        '%menuContainer% > li.selectedContainer > .label {display: inline-block; color: [txts];}',
        '%menuContainer% > li.selectedContainer:hover > .label {display: inline-block; color: [txts];}',
        '%menuContainer% > li.selectedContainer:hover:after {visibility: visible; border-top: [arrSize] solid [arrBrd];}',

        ' .moreButton{[ellipsis]}',
        ' .wrapper {visibility: hidden; min-width: inherit; z-index: 1; position: absolute; width: 100%; height: 15px; left: 0;}',

        '%menuContainer% {[pos] display: table; position: relative !important; z-index: 1;}',
        '%menuContainer% > li {margin: 0; display: table-cell; vertical-align: middle; position: relative; height: calc(100% - 9px); height: -webkit-calc(100% - 9px);}',
        '%menuContainer% > li:hover > .wrapper {visibility: visible;}',
        'li:hover > .emptySubMenu {visibility: hidden;}',

        '%menuContainer% > li:before {content: ""; z-index: 2; visibility: hidden; position: absolute; left: 50%; margin-left: -[arrBSize]; bottom: -[arrBSize]; width: 0; height: 0; border-left: [arrBSize] solid transparent; border-right: [arrBSize] solid transparent; border-top: [arrBSize] solid [brd];}',
        '%menuContainer% > li:hover:before {visibility: visible;}',
        '%menuContainer% > li.selected:before {visibility: visible;}',
        '%menuContainer% > li.selectedContainer:before {visibility: visible;}',
        '%menuContainer% > li:after {content: ""; z-index: 2;  visibility: hidden; position: absolute; left: 50%; margin-left: -[arrSize]; bottom: -[arrSize]; width: 0; height: 0; border-left: [arrSize] solid transparent; border-right: [arrSize] solid transparent; border-top: [arrSize] solid [arrBrd];}',
        '%menuContainer% > li:hover {}',
        '%menuContainer% > li:hover:after {visibility: visible; border-top: [arrSize] solid [arrBrdHover];}',
        '%menuContainer% > li.selected:hover:after {visibility: visible; border-top: [arrSize] solid [arrBrd];}',
        '%menuContainer% > li.selected:after {visibility: visible;}',
        '%menuContainer% > li.selectedContainer:after {visibility: visible;}',

        ' .subMenu {[bgDrop] [rd] [shd] min-width: 100%; overflow: hidden;}',
        ' .subMenu li {border: 0 solid [brd]; padding: 5px 15px; background-color: transparent;}',
        ' .subMenu li:first-child {[rdTop]}',
        ' .subMenu li:last-child {[rdBottom]}',
        ' .subMenu li:only-child {[rd]}',
        ' .subMenu li:hover {[trans] [bgh]}',
        ' .subMenu li.selected {[bgs]}',
        ' .subMenu li.selected:hover {[bgs]}',

        '[state~="buttons-align-left"] ul {float: left; left: 0;}',
        '[state~="buttons-align-center"] ul {margin: 0 auto; float: none;}',
        '[state~="buttons-align-right"] ul {float: right; right: 0;}',

        '[state~="text-align-left"] li {text-align: left;}',
        '[state~="text-align-center"] li {text-align: center;}',
        '[state~="text-align-right"] li {text-align: right;}',
        '[state~="text-align-ignore"] li {text-align: center;}',

        '[state~="buttons-stretch"] %menuContainer% {text-align: justify; display: table; width: 100%;}',
        '[state~="buttons-stretch"]:after {content: ""; width: 100%;}',
        '[state~="buttons-stretch"] li {box-sizing: border-box;}',

        '[state~=subMenuOpenDir-up] %menuContainer% > li > .wrapper {bottom: calc(100% + 1px); bottom: -webkit-calc(100% + 1px); padding: [trueDistance] 0;}',
        '[state~=subMenuOpenDir-up] .subMenu {bottom: 100%;}',
        '[state~=subMenuOpenDir-up] %menuContainer% {top: 0; bottom: 0;}',

        '[state~=subMenuOpenDir-down] %menuContainer% > li > .wrapper {top: calc(100% + 1px); top: -webkit-calc(100% + 1px); padding: [trueDistance] 0;}',
        '[state~=subMenuOpenDir-down] .subMenu {top: 100%;}',
        '[state~=subMenuOpenDir-down] %menuContainer% {top: 0; bottom: 0;}'
    ]);
});