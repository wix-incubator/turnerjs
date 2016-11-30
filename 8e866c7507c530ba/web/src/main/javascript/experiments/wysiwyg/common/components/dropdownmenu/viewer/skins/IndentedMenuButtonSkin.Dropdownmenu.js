define.experiment.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.IndentedMenuButtonSkin.Dropdownmenu', function(skinDefinition, experimentStrategy){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition,
        strategy = experimentStrategy;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Indented Buttons Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/indented.png', 'hidden': false, 'index': 15});

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

        {'id': 'rd', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0'},
        {'id': 'rdDrop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0'},
        {'id': 'rdRight', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['bl', 'tl']], 'defaultParam': 'rd'},
        {'id': 'rdLeft', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['br', 'tr']], 'defaultParam': 'rd'},
        {'id': 'rdTop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['bl', 'br']], 'defaultParam': 'rdDrop'},
        {'id': 'rdBottom', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tl', 'tr']], 'defaultParam': 'rdDrop'},

        {'id': 'SKINS_dropDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '1px'},
        {'id': 'trueDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultParam': 'SKINS_dropDistance' ,'sumParams': ['SKINS_dropDistance'], 'usedInLogic': true, 'noshow': true},

        {'id': 'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue': '1px 1px 1px 0 rgba(0, 0, 0, 0.2);'},

        {'id': 'trans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'background-color 0.4s ease 0s'},
        {'id': 'trans1','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'color 0.4s ease 0s'},
        {'id': 'pos', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'top: 0; bottom: 0; right: 0; left: 0;', 'noshow': true},
        {'id': 'ellipsis', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;', 'noshow': true},
        {'id': 'tdr', 'type': Constants.SkinParamTypes.URL, 'defaultTheme': 'BASE_THEME_DIRECTORY'}
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
        '</div>'
    );

    def.css([
        ' .strip {[shd] [rd] background: url([tdr]indented_bg_inverted.png) center top repeat-x, url([tdr]indented_bg_inverted.png) center bottom repeat-x; [bg] width: 100%; min-height: inherit; position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: table; box-sizing: border-box;}',
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

        ' .moreButton{[ellipsis] vertical-align: middle;}',
        ' .wrapper {visibility: hidden; min-width: inherit; z-index: 1; position: absolute; width: 100%; height: 15px; left: -1px;}',

        '%menuContainer% {[pos] min-height: inherit; display: table; position: relative !important;}',
        '%menuContainer% > li {margin: 0; background: url([tdr]indented_bg_inverted.png) center top repeat-x, url([tdr]indented_bg_inverted.png) center bottom repeat-x; [bg] [trans] border-left: 1px solid [sep]; display: table-cell; vertical-align: middle; position: relative; height: 100%;}',

        '%menuContainer% > li.selected {background: url([tdr]indented_bg.png) center top repeat-x, url([tdr]indented_bg.png) center bottom repeat-x; [bgs]}',
        '%menuContainer% > li.selected:hover {background: url([tdr]indented_bg.png) center top repeat-x, url([tdr]indented_bg.png) center bottom repeat-x; [bgs]}',

        '%menuContainer% > li:first-child {border-left: 0 solid [sep];}',

        '%menuContainer% > li:hover > .wrapper {visibility: visible;}',
        'li:hover > .emptySubMenu {visibility: hidden; padding: 0;}',

        '%menuContainer% > li:last-child.selectedContainer {[rdRight]}',
        '%menuContainer% > li:only-child.selectedContainer {[rd]}',

        ' .subMenu {[shd] [bgDrop] [rdDrop] min-width: 100%; overflow: hidden;}',
        ' .subMenu li {padding: 5px 15px; background-color: transparent;}',
        ' .subMenu li:hover {background:transparent url([tdr]indented_bg_inverted.png) center bottom repeat-x; [bgh] [trans]}',
        ' .subMenu li.selected {background: url([tdr]indented_bg.png) center top repeat-x, url([tdr]indented_bg.png) center bottom repeat-x; [bgs]}',
        ' .subMenu li:first-child {[rdTop]}',
        ' .subMenu li:last-child {[rdBottom] border-bottom: 0 solid transparent;}',
        ' .subMenu li:only-child {[rdDrop]}',

        '[state~="buttons-align-left"] ul {float: left; left: 0;}',
        '[state~="buttons-align-left"] %menuContainer% > li:first-child {[rdLeft]}',
        '[state~="buttons-align-center"] ul {margin: 0 auto; float: none;}',
        '[state~="buttons-align-right"] ul {float: right; right: 0;}',
        '[state~="buttons-align-right"] %menuContainer% > li:last-child {[rdRight]}',

        '[state~="text-align-left"] li {text-align: left;}',
        '[state~="text-align-center"] li {text-align: center;}',
        '[state~="text-align-right"] li {text-align: right;}',
        '[state~="text-align-ignore"] li {text-align: center;}',

        '[state~="buttons-stretch"] %menuContainer% {text-align: justify; display: table; width: 100%;}',
        '[state~="buttons-stretch"]:after {content: ""; width: 100%;}',
        '[state~="buttons-stretch"] li {box-sizing: border-box;}',

        '[state~="buttons-stretch"] %menuContainer% > li:first-child {[rdLeft]}',
        '[state~="buttons-stretch"] %menuContainer% > li:last-child {[rdRight]}',
        '[state~="buttons-stretch"] %menuContainer% > li:only-child {[rd]}',

        '[state~=subMenuOpenDir-up] %menuContainer% > li > .wrapper {bottom: 100%;}',
        '[state~=subMenuOpenDir-up] .subMenu {bottom: 0; margin-bottom: [trueDistance];}',

        '[state~=subMenuOpenDir-down] %menuContainer% > li > .wrapper {top: 100%;}',
        '[state~=subMenuOpenDir-down] .subMenu {top: 0; margin-top: [trueDistance];}'
    ]);
});