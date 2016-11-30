define.experiment.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.ArrowRightMenuButtonSkin.Dropdownmenu', function(skinDefinition, experimentStrategy){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition,
        strategy = experimentStrategy;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Arrows-Right Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/arrows.png', 'hidden': false, 'index': 17});

    def.compParts(strategy.customizeField(function() {return {};}));

    def.skinParams([
        {'id': 'fnt', 'type':Constants.SkinParamTypes.FONT,'defaultTheme':'font_1'},
        {'id': 'txt', 'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_15'},
        {'id': 'txth', 'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_12'},
        {'id': 'txts', 'type':Constants.SkinParamTypes.COLOR,'defaultTheme':'color_12'},

        {'id': 'bg', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11'},
        {'id': 'bgh', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_18'},
        {'id': 'bgs', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_18'},
        {'id': 'bgDrop', 'type':Constants.SkinParamTypes.BG_COLOR, 'defaultTheme':'color_11'},

//        {'id': 'sep',  'type':Constants.SkinParamTypes.COLOR_ALPHA, 'defaultTheme':'color_15', 'mutators': ['alpha', 40]},

//        {'id': 'rd', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '10px'},
//        {'id': 'rdTopRight', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tl', 'br', 'bl']], 'defaultParam': 'rd'},
//        {'id': 'rdTopLeft', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tr', 'br', 'bl']], 'defaultParam': 'rd'},
//        {'id': 'rdBottomRight', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tl', 'tr', 'bl']], 'defaultParam': 'rd'},
//        {'id': 'rdBottomLeft', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tl', 'tr', 'br']], 'defaultParam': 'rd'},
//        {'id': 'rdRight', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tl', 'bl']], 'defaultParam': 'rd'},
//        {'id': 'rdLeft', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tr', 'br']], 'defaultParam': 'rd'},

        {'id': 'rdDrop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '10px'},
        {'id': 'rdTop', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['bl', 'br']], 'defaultParam': 'rdDrop'},
        {'id': 'rdBottom', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'mutators': ['square', ['tl', 'tr']], 'defaultParam': 'rdDrop'},

        {'id': 'SKINS_dropDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '5px'},
        {'id': 'trueDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultParam': 'SKINS_dropDistance' ,'sumParams': ['SKINS_dropDistance'], 'usedInLogic': true, 'noshow': true},
        {'id': 'pad', 'type': Constants.SkinParamTypes.SIZE, 'defaultValue': '1px'},

        {'id': 'pos', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'top: 0; bottom: 0; right: 0; left: 0;', 'noshow': true},
        {'id': 'ellipsis', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;', 'noshow': true},
        {'id': 'trans', 'type': Constants.SkinParamTypes.TRANSITION, 'defaultValue': 'background-color 0.4s ease 0s'},
        {'id': 'trans1', 'type': Constants.SkinParamTypes.TRANSITION, 'defaultValue': 'color 0.4s ease 0s'}
    ]);

    def.html(
        '<ul skinpart="menuContainer">' +
            '<li skinpart="menuItem">' +
                '<div class="top"></div>' +
                '<div class="bottom"></div>' +
                '<a></a>' +
                '<div class="wrapper">' +
                    '<ul></ul>' +
                '</div>' +
            '</li>' +
        '</ul>' +
        '<div skinpart="limitAspectRatio"></div>'
    );

    def.css([
        'ul {cursor: pointer; list-style: none; padding: 0; margin: 0; white-space: nowrap; position: absolute;}',
        'li {margin: 0; padding: 0; box-sizing: border-box;}',

        ' .moreButton{[ellipsis]}',
        ' .wrapper {[rdDrop] position: absolute; visibility: hidden; min-width: 100%; height: 15px; left: -12px; z-index: 1;}',

        'li:first-child .wrapper {left: 0;}',
        'li:first-child .wrapper {left: 26px;}',

        '%menuContainer% {[pos] min-height: inherit; display: table; border-spacing: [pad] 0; position: relative !important;}',
        '%menuContainer% > li {margin: 0; display: table-cell; vertical-align: middle; position: relative; height: 100%;}',

        '%menuContainer% > li:first-child {}',
//        '%menuContainer% > li:last-child {[rdRight]}',
        '%menuContainer% > li:last-child {}',
        '%menuContainer% > li:last-child.selectedContainer {}',
        '%menuContainer% > li:hover > .wrapper {visibility: visible;}',
        'li:hover > .emptySubMenu {visibility: hidden;}',

        ' .top {[bg] [trans] height: 50%; /*border-right: 1px solid [sep]; border-left: 1px solid [sep];*/ position:absolute; top: 0; left: 0; width: 100%; -webkit-transform: skewX(30deg); transform: skewX(30deg); -webkit-transform-origin: 100% 100%; transform-origin: 100% 100%;}',
        ' .bottom {[bg] [trans] height: 50%; /*border-right: 1px solid [sep]; border-left: 1px solid [sep];*/ position: absolute; bottom: 0; left: 0; width: 100%; -webkit-transform: skewX(-30deg); transform: skewX(-30deg); -webkit-transform-origin: 0 0; transform-origin: 0 0;}',

        'li:hover .top, li:hover .bottom {[bgh] [trans]}',
        'li.selected .top, li.selected:hover .top, li.selected:hover .bottom, li.selected .bottom {[bgs]}',
        ' .selectedContainer .top, .selectedContainer:hover .top, .selectedContainer:hover .bottom, .selectedContainer .bottom {[bgs]}',

//        'li:first-child .top {[rdTopLeft] border: 0 solid transparent; -webkit-transform: skewX(0deg); transform: skewX(0deg);}',
        'li:first-child .top {border: 0 solid transparent; -webkit-transform: skewX(30deg); transform: skewX(30deg);}',
//        'li:first-child .bottom {[rdBottomLeft] border: 0 solid transparent; -webkit-transform: skewX(0deg); transform: skewX(0deg);}',
        'li:first-child .bottom {border: 0 solid transparent; -webkit-transform: skewX(-30deg); transform: skewX(-30deg);}',
//        'li:last-child {[bg] [trans]}',
//        'li:last-child .top {[rdTopRight] border-right: 0 solid transparent;}',
        'li:last-child .top {border-right: 0 solid transparent;}',
//        'li:last-child .bottom {[rdBottomRight] border-right: 0 solid transparent;}',
        'li:last-child .bottom {border-right: 0 solid transparent;}',
//        'li:last-child:hover {[bgh] [trans]}',
//        'li.selected:last-child, li.selected:hover:last-child {[bgs]}',


        ' .subMenu {[bgDrop] [rdDrop] min-width: 100%; overflow: hidden;}',
        ' .subMenu li {padding: 5px 15px; background-color: transparent;}',
        ' .subMenu .top {display: none;}',
        ' .subMenu .bottom {display: none;}',

        ' .subMenu li:first-child {[rdTop]}',
        ' .subMenu li:last-child {[rdBottom]}',
        ' .subMenu li:only-child {[rdDrop]}',
        ' .subMenu li:hover {[bgh] [trans]}',
        ' .subMenu li.selected, .subMenu li.selected:hover {[bgs]}',

        ' .label {position: relative; [fnt] [trans1] color: [txt]; padding: 0 10px;}',
        ' li:hover > .label {[trans1] color: [txth]}',
        ' li.subMenu:hover > .label {[trans1] [txt]}',
        ' .selected > .label {color: [txts];}',
        ' .selected:hover > .label {color: [txts];}',
        ' .selectedContainer > .label {display: inline-block; color: [txts];}',
        ' .selectedContainer:hover > .label {display: inline-block; color: [txts];}',

        '[state~="buttons-align-left"] ul {float: left; left: 0;}',
        '[state~="buttons-align-left"] li:last-child {background-color: transparent;}',
        '[state~="buttons-align-left"] li:last-child .top {border-radius: 0;}',
        '[state~="buttons-align-left"] li:last-child .bottom {border-radius: 0;}',

//        '[state~="buttons-align-left"] %menuContainer% > li:first-child:before {position: absolute; content: ""; width: 100%; height: 100%; left: calc(-100% / 4); [rdLeft] [bg] [trans]}',
//        '[state~="buttons-align-left"] %menuContainer% > li:first-child:hover:before {position: absolute; content: ""; width: 100%; height: 100%; calc(-100% / 4); [rdLeft] [bgh] [trans]}',
//        '[state~="buttons-align-left"] %menuContainer% > li.selected:first-child:before {position: absolute; content: ""; width: 100%; height: 100%; left: calc(-100% / 4); [rdLeft] [bgs]}',
//        '[state~="buttons-align-left"] %menuContainer% > li.selected:hover:first-child:before {position: absolute; content: ""; width: 100%; height: 100%; left: calc(-100% / 4); [rdLeft] [bgs]}',

        '[state~="buttons-align-center"] ul {margin: 0 auto; float: none;}',
        '[state~="buttons-align-center"] li:last-child {background-color: transparent;}',
        '[state~="buttons-align-center"] li:last-child .top {border-radius: 0;}',
        '[state~="buttons-align-center"] li:last-child .bottom {border-radius: 0;}',
        '[state~="buttons-align-center"] li:first-child .top {-webkit-transform: skewX(30deg); transform: skewX(30deg); border-radius: 0;}',
        '[state~="buttons-align-center"] li:first-child .bottom {-webkit-transform: skewX(-30deg); transform: skewX(-30deg); border-radius: 0;}',
        '[state~="buttons-align-right"] ul {float: right; right: 0; }',
        '[state~="buttons-align-right"] %menuContainer% li:last-child ol.subMenu {margin-right: -12px;}',
        '[state~="buttons-align-right"] li:first-child .top {-webkit-transform: skewX(30deg); transform: skewX(30deg); border-radius: 0;}',
        '[state~="buttons-align-right"] li:first-child .bottom {-webkit-transform: skewX(-30deg); transform: skewX(-30deg); border-radius: 0;}',

        '[state~="text-align-left"] li {text-align: left;}',
        '[state~="text-align-center"] li {text-align: center;}',
        '[state~="text-align-right"] li {text-align: right;}',
        '[state~="text-align-ignore"] li {text-align: center;}',

        '[state~="buttons-stretch"] %menuContainer% {text-align: justify; display: table; width: 100%;}',
        '[state~="buttons-stretch"]:after {content: ""; width: 100%;}',
        '[state~="buttons-stretch"] li {box-sizing: border-box;}',

//        '[state~="buttons-stretch"] %menuContainer% > li:first-child:before {position: absolute; content: ""; width: 100%; height: 100%; left: calc(-100% / 4); [rdLeft] [bg] [trans]}',
//        '[state~="buttons-stretch"] %menuContainer% > li:first-child:hover:before {position: absolute; content: ""; width: 100%; height: 100%; calc(-100% / 4); [rdLeft] [bgh] [trans]}',
//        '[state~="buttons-stretch"] %menuContainer% > li.selected:first-child:before {position: absolute; content: ""; width: 100%; height: 100%; left: calc(-100% / 4); [rdLeft] [bgs]}',
//        '[state~="buttons-stretch"] %menuContainer% > li.selected:hover:first-child:before {position: absolute; content: ""; width: 100%; height: 100%; left: calc(-100% / 4); [rdLeft] [bgs]}',

        '[state~=subMenuOpenDir-up] %menuContainer% > li > .wrapper {bottom: 100%; }',
        '[state~=subMenuOpenDir-up] .subMenu {bottom: 0; margin-bottom: [trueDistance];}',

        '[state~=subMenuOpenDir-down] %menuContainer% > li > .wrapper {top: 100%;}',
        '[state~=subMenuOpenDir-down] .subMenu {top: 0; margin-top: [trueDistance];}'
    ]);
});