define.experiment.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.SloppyBorderMenuButtonSkin.Dropdownmenu', function(skinDefinition, experimentStrategy){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition,
        strategy = experimentStrategy;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Sloppy Border Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/sloppy.png', 'hidden': false, 'index': 18});

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

        {'id': 'sep',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15'},

        {'id': 'SKINS_dropDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '8px'},
        {'id': 'trueDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultParam': 'SKINS_dropDistance' ,'sumParams': ['SKINS_dropDistance'], 'usedInLogic': true, 'noshow': true},

        {'id': 'trans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'background-color 0.4s ease 0s'},
        {'id': 'trans1','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'color 0.4s ease 0s'},
        {'id': 'pos', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'top: 0; bottom: 0; right: 0; left: 0;', 'noshow': true},
        {'id': 'ellipsis', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;', 'noshow': true},
        {'id': 'borderHeight', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '7px', 'noshow': true},
        {'id': 'tdr', 'type': Constants.SkinParamTypes.URL, 'defaultTheme': 'BASE_THEME_DIRECTORY'}
    ]);

    def.html(
        '<div class="strip"></div>' +
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
        ':before {height: 7px; position: absolute; top: -7px; left: 0; right: 0; content: ""; background: url([tdr]sloppyhoriz.png) repeat-x 0 top;}',
        ':after {height: 7px; position: absolute; bottom: -7px; left: 0; right: 0; content: ""; background: url([tdr]sloppyhoriz.png) repeat-x 0 bottom;}',

        ' .strip {[bg] width: 100%; min-height: inherit; position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: table; box-sizing: border-box;}',
        ' .strip:before {position: absolute; top: 0; left: -7px; width: 7px;  height: 100%; content: ""; background: url([tdr]sloppyvertical.png) repeat-y 0 0;}',
        ' .strip:after {position: absolute; top: 0; right: -7px; width: 7px; height: 100%; content: ""; background: url([tdr]sloppyvertical.png) repeat-y 100% 0;}',

        'ul {cursor: pointer; list-style: none; padding: 0; margin: 0; white-space: nowrap; position: absolute;}',
        'li {[bg] [trans] margin: 0; padding: 0; box-sizing: border-box;}',
        'li:hover {[bgh] [trans]}',
        'li.selected {[bgs]}',
        'li.selected:hover {[bgs]}',

        ' .label {[fnt] [trans1] color: [txt]; padding: 0 10px; vertical-align: middle;}',
        ' li:hover > .label {[trans1] color: [txth]}',
        ' .selected > .label {color: [txts]; display: inline-block;}',
        ' .selected:hover > .label {color: [txts];}',

        ' .selectedContainer {[bgs]}',
        ' .selectedContainer:hover {[bgs]}',
        ' .selectedContainer > .label {display: inline-block; color: [txts];}',
        ' .selectedContainer:hover > .label {display: inline-block; color: [txts];}',

        ' .moreButton {[ellipsis] vertical-align: middle;}',
        ' .wrapper {visibility: hidden; min-width: 100%; z-index: 1; position: absolute; width: 100%; height: 15px; left: 0;}',

        '%menuContainer% {[pos] min-height: inherit; display: table; position: relative !important;}',
        '%menuContainer% > li {margin: 0; [bg] [trans] border-left: 1px solid [sep]; display: table-cell; vertical-align: middle; position: relative; height: 100%;}',
        '%menuContainer% > li:first-child {border-left: 0 solid [sep];}',
        '%menuContainer% > li:hover > .wrapper {visibility: visible;}',
        'li:hover > .emptySubMenu {visibility: hidden; padding: 0;}',

        ' .subMenu {min-width: 100%;}',
        ' .subMenu:before {height: [borderHeight]; position: absolute; top: -[borderHeight]; left: 0; right: 0; content: ""; background: url([tdr]sloppyhoriz.png) repeat-x 0 top;}',
        ' .subMenu:after {height: [borderHeight]; position: absolute; bottom: -[borderHeight]; left: 0; right: 0; content: ""; background: url([tdr]sloppyhoriz.png) repeat-x 0 bottom;}',

        ' .subMenu li {[bgDrop] border-bottom: 1px solid [sep]; padding: 5px 0;}',
        ' .subMenu > li:before {position: absolute; top: 0; left: -7px; width: 7px;  height: 100%; content: ""; background: url([tdr]sloppyvertical.png) repeat-y 0 0;}',
        ' .subMenu > li:after {position: absolute; top: 0; right: -7px; width: 7px; height: 100%; content: ""; background: url([tdr]sloppyvertical.png) repeat-y 100% 0;}',

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