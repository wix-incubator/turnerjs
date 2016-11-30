define.experiment.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.TextSeparatorsMenuButtonSkin.Dropdownmenu', function(skinDefinition, experimentStrategy){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition,
        strategy = experimentStrategy;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Text Menu With Separators', 'iconUrl': '/images/wysiwyg/skinIcons/menu/menudivider.png', 'hidden': false, 'index': 2});

    def.compParts(strategy.customizeField(function() {return {};}));

    def.skinParams([
        {'id': 'fnt','type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},
        {'id': 'txt',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_15'},
        {'id': 'txth',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_12'},
        {'id': 'txts',  'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_12'},

        {'id': 'bgDrop', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11'},
        {'id': 'sep',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15'},

        {'id': 'rd', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0', 'lang': 'rdDrop'},
        {'id': 'rdTop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['bl', 'br']], 'defaultParam': 'rd'},
        {'id': 'rdBottom', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tl', 'tr']], 'defaultParam': 'rd'},

        {'id': 'SKINS_dropDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '4px'},
        {'id': 'trueDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultParam': 'SKINS_dropDistance' ,'sumParams': ['SKINS_dropDistance'], 'usedInLogic': true, 'noshow': true},

        {'id': 'shd', 'type': Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue': '1px 1px 1px 0 rgba(0, 0, 0, 0.2);', 'styleDefaults': {'boxShadowToggleOn': 'false'}},

        {'id': 'trans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'color 0.4s ease 0s'},
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
        'li {margin: 0; padding: 0; box-sizing: border-box;}',

        ' .label {[fnt] [trans] color: [txt]; padding: 0 10px;}',
        ' li:hover > .label {[trans] color: [txth]}',
        ' li.subMenu:hover > .label {[trans] [txt]}',
        ' .selected > .label {[trans] color: [txts]; display: inline-block;}',
        ' .selected:hover > .label {[trans] color: [txts]; display: inline-block;}',
        ' .selectedContainer > .label {display: inline; color: [txts];}',
        ' .selectedContainer:hover > .label {display: inline; color: [txts];}',

        ' .moreButton{[ellipsis]}',
        ' .wrapper {visibility: hidden; min-width: inherit; z-index: 1; position: absolute; width: 100%; left: -1px;}',

        '%menuContainer% {[pos] min-height: inherit; display: table; position: relative !important;}',
        '%menuContainer% > li {margin: 0; border-left: 1px solid [sep]; display: table-cell; vertical-align: middle; position: relative; height: 100%;}',
        '%menuContainer% > li:hover > .wrapper {visibility: visible;}',
        'li:hover > .emptySubMenu {visibility: hidden;}',
        '%menuContainer% > li:first-child {border-left: 0 solid [sep];}',

        ' .subMenu {[rd] [bgDrop] [shd] min-width: 100%; z-index: 1; left: 0;}',
        ' .subMenu li {border-bottom: 1px solid [sep]; padding: 5px 15px;}',
        ' .subMenu li:first-child {[rdTop]}',
        ' .subMenu li:last-child {[rdBottom] border-bottom: 0 solid [sep];}',
        ' .subMenu li:only-child {[rd]}',

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