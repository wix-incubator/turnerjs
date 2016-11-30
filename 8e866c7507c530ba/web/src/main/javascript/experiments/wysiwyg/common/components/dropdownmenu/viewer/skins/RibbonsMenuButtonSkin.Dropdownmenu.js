define.experiment.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.RibbonsMenuButtonSkin.Dropdownmenu', function(skinDefinition, experimentStrategy){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition,
        strategy = experimentStrategy;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Ribbons Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/muenuribbons.png', 'hidden': false, 'index': 13});

    def.compParts(strategy.customizeField(function() {return {};}));

    def.skinParams([
        {'id': 'fnt','type':Constants.SkinParamTypes.FONT,'defaultTheme': 'font_1'},
        {'id': 'txt',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme': 'color_15'},
        {'id': 'txth',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme': 'color_12'},
        {'id': 'txts',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme': 'color_12'},

        {'id': 'bg', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme': 'color_11'},
        {'id': 'bgh', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme': 'color_18'},
        {'id': 'bgs', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme': 'color_18'},
        {'id': 'bgDrop', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme': 'color_11'},

        {'id': 'elm', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_15', 'lang': 'foldR'},
        {'id': 'elm2', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme': 'color_15', 'lang': 'foldL'},
        {'id': 'els', 'type': Constants.SkinParamTypes.SIZE, 'mutators': ['increase', 10], 'defaultValue': '0', 'lang': 'fold'},
        {'id': 'elsb', 'type': Constants.SkinParamTypes.SIZE, 'mutators': ['multiply', 2], 'defaultParam': 'els', 'noshow': true},

        {'id': 'SKINS_dropDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '8px'},
        {'id': 'trueDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultParam': 'SKINS_dropDistance' ,'sumParams': ['SKINS_dropDistance'], 'usedInLogic': true, 'noshow': true},

        {'id': 'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue': '1px 1px 1px 0 rgba(0, 0, 0, 0.2);'},

        {'id': 'trans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'background-color 0.4s ease 0s'},
        {'id': 'trans1','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'color 0.4s ease 0s'},
        {'id': 'pos', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'top: 0; bottom: 0; right: 0; left: 0;', 'noshow': true},
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
        ' .strip {[shd] [bg] width: 100%; min-height: calc(100% - [els]); min-height: -webkit-calc(100% - [els]); position: absolute; top: 0; right: 0; bottom: [els]; left: 0; display: block; box-sizing: border-box;}',
        ' .strip:before {content: ""; position: absolute; bottom: -[elsb]; height: 0; width: 0; border: [els] solid transparent; border-top-color: [elm2]; border-right-width: 0; left: 0;}',
        ' .strip:after {content: ""; position: absolute; bottom: -[elsb]; height: 0; width: 0; border: [els] solid transparent; border-top-color: [elm]; border-left-width: 0; right: 0;}',

        'ul {cursor: pointer; list-style: none; padding: 0; margin: 0; white-space: nowrap; position: absolute; min-height: 100%;}',
        'li {[bg] [trans] margin: 0; padding: 0; box-sizing: border-box;}',
        'li:hover {[bgh] [trans]}',
        'li.selected {[bgs]}',
        'li.selected:hover {[bgs]}',

        ' .label {[fnt] [trans1] color: [txt]; padding: 0 10px; vertical-align: middle; line-height: 100% !important;}',
        ' li:hover > .label {[trans1] color: [txth]}',
        ' .selected > .label {color: [txts]; display: inline-block;}',
        ' .selected:hover > .label {color: [txts];}',

        ' .selectedContainer {[bgs]}',
        ' .selectedContainer:hover {[bgs]}',
        ' .selectedContainer > .label {display: inline-block; color: [txts];}',
        ' .selectedContainer:hover > .label {display: inline-block; color: [txts];}',

        ' .moreButton{[ellipsis]}',
        ' .wrapper {visibility: hidden; min-width: inherit; z-index: 1; position: absolute; width: 100%; height: 15px; left: 0;}',

        '%menuContainer% {[pos] box-sizing: border-box; display: table; position: relative !important;}',
        '%menuContainer% > li {margin: 0; display: table-cell; vertical-align: middle; position: relative; height: 100%;}',
        '%menuContainer% > li:hover > .wrapper {visibility: visible;}',
        'li:hover > .emptySubMenu {visibility: hidden;}',

        ' .subMenu {[shd] min-width: 100%; z-index: 1; left: 0;}',
        ' .subMenu li {[bgDrop] padding: 5px 0;}',
        ' .subMenu li:first-child {}',
        ' .subMenu li:last-child {}',
        ' .subMenu li:hover {[bgh] [trans]}',
        ' .subMenu li:hover {[bgh] [trans]}',
        ' .subMenu li.selected {[bgs]}',

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

        '[state~=subMenuOpenDir-up] %menuContainer% > li > .wrapper {bottom: 100%; padding: [trueDistance] 0;}',
        '[state~=subMenuOpenDir-up] .subMenu {bottom: 100%;}',

        '[state~=subMenuOpenDir-down] %menuContainer% > li > .wrapper {top: 100%; padding: [trueDistance] 0;}',
        '[state~=subMenuOpenDir-down] .subMenu {top: 100%;}'
    ]);
});