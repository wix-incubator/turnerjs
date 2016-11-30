define.experiment.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.SolidColorMenuButtonSkin.Dropdownmenu', function(skinDefinition, experimentStrategy){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition,
        strategy = experimentStrategy;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Solid Color Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/menusolid.png', 'hidden': false, 'index': 3});

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
        {'id': 'brd',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15'},
        {'id': 'brw', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '0'},

        {'id': 'rd', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0'},
        {'id': 'rdDrop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '0'},
        {'id': 'rdRight', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['bl', 'tl']], 'defaultParam': 'rd'},
        {'id': 'rdLeft', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['br', 'tr']], 'defaultParam': 'rd'},
        {'id': 'rdTop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['bl', 'br']], 'defaultParam': 'rdDrop'},
        {'id': 'rdBottom', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tl', 'tr']], 'defaultParam': 'rdDrop'},

        {'id': 'SKINS_dropDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '1px'},
        {'id': 'trueDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultParam': 'SKINS_dropDistance' ,'sumParams': ['SKINS_dropDistance', 'brw'], 'usedInLogic': true, 'noshow': true},

        {'id': 'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue': '1px 1px 1px 0 rgba(0, 0, 0, 0.2);', 'styleDefaults': {'boxShadowToggleOn': 'false'}},

        {'id': 'trans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'background-color 0.4s ease 0s'},
        {'id': 'trans1','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'color 0.4s ease 0s'},
        {'id': 'pos', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'top: 0; bottom: 0; right: 0; left: 0;', 'noshow': true},
        {'id': 'ellipsis', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;', 'noshow': true}
    ]);

    def.html(
        '<div class="strip">' +
            '<ul skinpart="menuContainer">' +
                '<li skinpart="menuItem">' +
                    '<div class="gap">' +
                        '<div class="color"></div>' +
                        '<div class="bg">' +
                            '<a skinpart="label"></a>' +
                        '</div>' +
                    '</div>'+
                    '<div class="wrapper">' +
                        '<ul></ul>' +
                    '</div>' +
                '</li>' +
            '</ul>' +
        '</div>'
    );

    def.css([
        ' .strip {[shd] [rd] [bg] border: [brw] solid [brd]; width: 100%; min-height: inherit; position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: block; box-sizing: border-box;}',
        'ul {cursor: pointer; list-style: none; padding: 0; margin: 0; white-space: nowrap; position: absolute;}',
//        'li {[bg] [trans] margin: 0; padding: 0;}',
//        'li:hover {[bgh] [trans]}',
//        'li.selected {[bgs]}',
//        'li.selected:hover {[bgs]}',

        ' .moreButton{[ellipsis]}',
        ' .wrapper {[rdDrop] visibility: hidden; min-width: inherit; width: 100%; height: 15px; z-index: 1; position: absolute; left: -1px;}',

        ' .label {[fnt] [trans1] color: [txt]; padding: 0 10px; vertical-align: middle;}',
        'li:hover > %.gap% .label {[trans1] color: [txth];}',
        'li.selected > %.gap% .label {color: [txts]; display: inline-block;}',
        'li.selected:hover > %.gap% .label {color: [txts];}',

        '%menuContainer% {min-height: inherit; position: relative !important; display: table; box-sizing: border-box; top: -[brw]; bottom: 0; right: 0; left: 0;}',
        '%menuContainer% > li {margin: 0; border-left: 1px solid [sep]; display: inline-block; vertical-align: middle; position: relative; height: 100%;}',
        '%menuContainer% > li:hover > .wrapper {visibility: visible;}',
        'li:hover > .emptySubMenu {visibility: hidden;}',

        '%menuContainer% > li:first-child {border-left: 0 solid [sep];}',

        '%.gap% {overflow: hidden;}',
        '%.bg% {position: relative; cursor: pointer;}',

        '%.color% {[bg] [trans] position: absolute;}',
        '%menuContainer% > li > %.gap% %.color% {top: [brw]; bottom: [brw]; right: 0; left: 0;}',
        '%menuContainer% > li:hover > %.gap% %.color% {[bgh] [trans]}',
        '%menuContainer% > li.selected > %.gap% %.color% {[bgs]}',
        '%menuContainer% > li.selected:hover > %.gap% %.color% {[bgs] }',

        '%menuContainer% > li:first-child > %.gap% %.color% {[rdLeft]}',
        '%menuContainer% > li:last-child > %.gap% %.color% {[rdRight]}',
        '%menuContainer% > li:only-child {[rd]}',

        ' .subMenu {[rdDrop] [shd] [bgDrop] min-width: 100%; z-index: 1; overflow: hidden; border: [brw] solid [brd]; box-sizing: border-box;}',
        ' .subMenu li {border-radius: 0; background-color: transparent; border-top: 1px solid [brd];}',
        ' .subMenu li %.gap% {padding: 0; overflow: hidden; position: relative;}',
        ' .subMenu li %.bg% {padding: 5px 15px;}',
        ' .subMenu li %.color% {border-radius: 0; border-width: 0; background-color: transparent;}',
        ' .subMenu li:hover %.color% {[bgh] [trans] [pos] border-radius: 0;}',
        ' .subMenu li.selected > %.gap% %.color% {[bgs] [pos] position: absolute;}',
        ' .subMenu li.selected:hover > %.gap% %.color% {[bgs]}',

        ' .subMenu li:first-child {[rdTop] border-top: 0px solid transparent;}',
        ' .subMenu li:last-child {[rdBottom]}',
        ' .subMenu li:only-child {[rdDrop] border-top: 0px solid transparent;}',

        ' .subMenu li:first-child %.color% {[rdTop]}',
        ' .subMenu li:last-child %.color% {[rdBottom]}',
        ' .subMenu li:only-child %.color% {[rdDrop]}',

        '%menuContainer% > li.selectedContainer > %.gap% %.color% {[bgs]}',
        '%menuContainer% > li.selectedContainer:hover > %.gap% %.color% {[bgs]}',
        '%menuContainer% > li.selectedContainer > %.gap% .label {display: inline-block; color: [txts];}',
        '%menuContainer% > li.selected.selectedContainer:hover > %.gap% .label {display: inline-block; color: [txts];}',

        '[state~="buttons-align-left"] ul {float: left; left: 0;}',
        '[state~="buttons-align-center"] ul {margin: 0 auto; float: none;}',
        '[state~="buttons-align-center"] %menuContainer% > li:only-child > %.gap% %.color% {border-radius: 0;}',
        '[state~="buttons-align-right"] ul {float: right; right: 0;}',

        '[state~="text-align-left"] li {text-align: left;}',
        '[state~="text-align-center"] li {text-align: center;}',
        '[state~="text-align-right"] li {text-align: right;}',
        '[state~="text-align-ignore"] li {text-align: center;}',

        '[state~="buttons-stretch"] %menuContainer% {text-align: justify; display: table; width: 100%;}',
        '[state~="buttons-stretch"] %menuContainer% > li {display: table-cell;}',
        '[state~="buttons-stretch"]:after {content: ""; width: 100%;}',

        '[state~="buttons-stretch"] %menuContainer% > li:first-child {[rdLeft]}',
        '[state~="buttons-stretch"] %menuContainer% > li:last-child {[rdRight]}',
        '[state~="buttons-stretch"] %menuContainer% > li:only-child {[rd]}',
        '[state~="buttons-stretch"] %menuContainer% > li:only-child > %.gap% %.color% {[rd]}',

        ':not([state~="buttons-stretch"]) %menuContainer% > li > %.gap% {height: 100%;}',
        ':not([state~="buttons-stretch"]) %menuContainer% > li > %.gap% %.bg% {display: table; width: 100%; height: 100%;}',
        ':not([state~="buttons-stretch"]) %menuContainer% > li > %.gap% %.bg% .label {display: table-cell;}',

        '[state~=subMenuOpenDir-up] %menuContainer% > li > .wrapper {bottom: 100%;}',
        '[state~=subMenuOpenDir-up] .subMenu {bottom: 0; margin-bottom: [trueDistance];}',

        '[state~=subMenuOpenDir-down] %menuContainer% > li > .wrapper {top: 100%;}',
        '[state~=subMenuOpenDir-down] .subMenu {top: 0; margin-top: [trueDistance];}'
    ]);
});