define.experiment.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateShinyIIMenuButtonSkin.Dropdownmenu', function(skinDefinition, experimentStrategy){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition,
        strategy = experimentStrategy;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Separate Shiny-Buttons Menu II', 'iconUrl': '/images/wysiwyg/skinIcons/menu/menubuttonsgradient.png', 'hidden': false, 'index': 9});

    def.compParts(strategy.customizeField(function() {return {};}));

    def.skinParams([
        {'id': 'fnt', 'type': Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_1'},
        {'id': 'txt', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_15'},
        {'id': 'txth', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_12'},
        {'id': 'txts', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_12'},

        {'id': 'bg', 'type': Constants.SkinParamTypes.BG_COLOR, 'defaultTheme': 'color_11'},
        {'id': 'bgDrop', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme': 'color_11'},
        {'id': 'bgh', 'type': Constants.SkinParamTypes.BG_COLOR, 'defaultTheme': 'color_18'},
        {'id': 'bgs', 'type': Constants.SkinParamTypes.BG_COLOR, 'defaultTheme': 'color_18'},

        {'id': 'rd', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '2px'},
        {'id': 'rdDrop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '2px'},
        {'id': 'rdTop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['bl', 'br']], 'defaultParam': 'rdDrop'},
        {'id': 'rdBottom', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tl', 'tr']], 'defaultParam': 'rdDrop'},

        {'id': 'SKINS_dropDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '1px'},
        {'id': 'trueDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultParam': 'SKINS_dropDistance' ,'sumParams': ['SKINS_dropDistance'], 'usedInLogic': true, 'noshow': true},
        {'id': 'pad', 'type': Constants.SkinParamTypes.SIZE, 'defaultValue': '5px'},

        {'id': 'shd', 'type': Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue': '1px 1px 1px 0 rgba(0, 0, 0, 0.2);'},

        {'id': 'pos', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'top: 0; bottom: 0; right: 0; left: 0;', 'noshow': true},
        {'id': 'ellipsis', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;', 'noshow': true},
        {'id': 'trans', 'type': Constants.SkinParamTypes.TRANSITION, 'defaultValue': 'background-color 0.4s ease 0s'},
        {'id': 'trans1', 'type': Constants.SkinParamTypes.TRANSITION, 'defaultValue': 'color 0.4s ease 0s'},
        {'id': 'tdr', 'type': Constants.SkinParamTypes.URL, 'defaultTheme': 'BASE_THEME_DIRECTORY'}
    ]);

    def.html(
        '<ul skinpart="menuContainer">' +
            '<li skinpart="menuItem">' +
                '<div class="gap">' +
                    '<div class="color">' +
                        '<div class="shade">' +
                            '<div class="shade2"></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="bg">' +
                        '<a skinpart="label"></a>' +
                    '</div>' +
                '</div>'+
                '<div class="wrapper">' +
                    '<ul></ul>' +
                '</div>' +
            '</li>' +
        '</ul>'
    );

    def.css([
        'ul {cursor: pointer; list-style: none; padding: 0; margin: 0; white-space: nowrap; position: absolute;}',
        'li {margin: 0; padding: 0;}',

        ' .moreButton{[ellipsis]}',
        ' .wrapper {[rdDrop] padding-top: [trueDistance]; visibility: hidden; min-width: 100%; z-index: 1; position: absolute; left: 0;}',

        ' .label {[fnt] [trans1] color: [txt]; padding: 0 10px; vertical-align: middle;}',
        'li:hover > %.gap% .label {[trans1] color: [txth]}',
        'li.selected > %.gap% .label {color: [txts]; display: inline-block;}',
        'li.selected:hover > %.gap% .label {color: [txts];}',

        '%menuContainer% {[pos] min-height: inherit; position: relative !important; display: table;}',
        '%menuContainer% > li {margin: 0 [pad]; display: inline-block; vertical-align: middle; position: relative; height: 100%;}',
        '%menuContainer% > li:first-child {margin: 0 [pad] 0 0;}',
        '%menuContainer% > li:last-child {margin: 0 0 0 [pad];}',
        '%menuContainer% > li:only-child {margin: 0;}',
        '%menuContainer% > li:hover > .wrapper {visibility: visible;}',
        'li:hover > .emptySubMenu {visibility: hidden;}',

        '%.gap% {overflow: hidden;}',
        '%.bg% {position: relative; cursor: pointer;}',

        '%.color% {[bg] [trans] [rd] [shd] [pos] position: absolute;}',
        '%menuContainer% > li:hover > %.gap% %.color% {[bgh] [trans]}',
        '%menuContainer% > li.selected > %.gap% %.color% {[bgs]}',
        '%menuContainer% > li.selected:hover > %.gap% %.color% {[bgs]}',

        '%.shade% {[rd] background: url([tdr]shiny2button_bg.png) center top repeat-x, url([tdr]shiny2button_bg.png) center bottom repeat-x; position: absolute; top: 0; bottom: 0; left: 0; right: 0;}',
        '%menuContainer% > li:hover > %.gap% %.shade% {background: url([tdr]shiny2button_bg.png) center top repeat-x, url([tdr]shiny2button_bg.png) center bottom repeat-x;}',
        '%menuContainer% > li.selected > %.gap% %.shade% {background: url([tdr]shiny2button_bg.png) center top repeat-x, url([tdr]shiny2button_bg.png) center bottom repeat-x;}',
        '%menuContainer% > li.selected:hover > %.gap% %.shade% {background: url([tdr]shiny2button_bg.png) center top repeat-x, url([tdr]shiny2button_bg.png) center bottom repeat-x;}',

        ' .subMenu {[rdDrop] [shd] min-width: calc(100% - ([pad] * 2)); min-width: -webkit-calc(100% - ([pad] * 2)); z-index: 1; overflow: hidden;}',
        ' .subMenu li %.gap% {padding: 0; overflow: hidden; position: relative;}',
        ' .subMenu li %.bg% {padding: 5px 15px;}',
        ' .subMenu li %.color% {[bgDrop] border-radius: 0; box-shadow: none;}',
        ' .subMenu li:hover %.color% {[bgh] [trans] border-radius: 0;}',
        ' .subMenu li.selected > %.gap% %.color% {[bgs]}',
        ' .subMenu li.selected:hover > %.gap% %.color% {[bgs]}',

        ' .subMenu li %.shade% {background: none;}',
        ' .subMenu li:hover %.shade% {background: url([tdr]shiny2button_bg.png) center top repeat-x, url([tdr]shiny2button_bg.png) center bottom repeat-x; border-radius: 0;}',
        ' .subMenu li.selected %.shade% {background: url([tdr]shiny2button_bg.png) center top repeat-x, url([tdr]shiny2button_bg.png) center bottom repeat-x; border-radius: 0;}',
        ' .subMenu li.selected:hover %.shade% {background: url([tdr]shiny2button_bg.png) center top repeat-x, url([tdr]shiny2button_bg.png) center bottom repeat-x;}',

        ' .subMenu li:first-child %.color% {[rdTop]}',
        ' .subMenu li:last-child %.color% {[rdBottom]}',
        ' .subMenu li:only-child %.color% {[rdDrop]}',
        ' .subMenu li:first-child %.shade% {[rdTop]}',
        ' .subMenu li:last-child %.shade% {[rdBottom]}',
        ' .subMenu li:only-child %.shade% {[rdDrop]}',

        '%menuContainer% > li.selectedContainer > %.gap% %.color% {[bgs]}',
        '%menuContainer% > li.selectedContainer:hover > %.gap% %.color% {[bgs]}',
        '%menuContainer% > li.selectedContainer > %.gap% .label {display: inline-block; color: [txts];}',
        '%menuContainer% > li.selectedContainer:hover > %.gap% .label {display: inline-block; color: [txts];}',

        '[state~="buttons-align-left"] ul {float: left; left: 0;}',
        '[state~="buttons-align-center"] ul {margin: 0 auto; float: none;}',
        '[state~="buttons-align-right"] ul {float: right; right: 0;}',

        '[state~="text-align-left"] li {text-align: left;}',
        '[state~="text-align-center"] li {text-align: center;}',
        '[state~="text-align-right"] li {text-align: right;}',
        '[state~="text-align-ignore"] li {text-align: center;}',

        '[state~="buttons-stretch"] %menuContainer% {text-align: justify; display: table; width: 100%;}',
        '[state~="buttons-stretch"] %menuContainer% > li {display: table-cell;}',
        '[state~="buttons-stretch"] %menuContainer% > li > %.gap% %.color% {left: [pad]; right: [pad];}',
        '[state~="buttons-stretch"] %menuContainer% > li > %.gap% %.bg% {padding: 0 [pad];}',
        '[state~="buttons-stretch"] ul.subMenu {left: [pad];}',
        '[state~="buttons-stretch"]:after {content: ""; width: 100%;}',

        ':not([state~="buttons-stretch"]) .subMenu {min-width: 100%;}',
        ':not([state~="buttons-stretch"]) %menuContainer% > li > %.gap% {height: 100%;}',
        ':not([state~="buttons-stretch"]) %menuContainer% > li > %.gap% %.bg% {display: table; height: 100%; width: 100%;}',
        ':not([state~="buttons-stretch"]) %menuContainer% > li > %.gap% %.bg% .label {display: table-cell;}',

        '[state~=subMenuOpenDir-up] %menuContainer% > li > .wrapper {bottom: 100%; padding: [trueDistance] 0;}',
        '[state~=subMenuOpenDir-up] .subMenu {bottom: 100%;}',

        '[state~=subMenuOpenDir-down] %menuContainer% > li > .wrapper {top: 100%; padding: [trueDistance] 0;}',
        '[state~=subMenuOpenDir-down] .subMenu {top: 100%;}'
    ]);
});