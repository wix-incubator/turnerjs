define.experiment.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.VerticalRibbonsMenuButtonSkin.Dropdownmenu', function(skinDefinition, experimentStrategy){
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition,
        strategy = experimentStrategy;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Side Ribbons Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/vertical_ribbon.png', 'hidden': false, 'index': 14});

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

        {'id': 'foldh', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultParam': 'bgh', 'mutators': ['brightness',70], 'noshow': true},
        {'id': 'folds', 'type': Constants.SkinParamTypes.COLOR_ALPHA, 'defaultParam': 'bgs', 'mutators': ['brightness',70], 'noshow': true},

        {'id': 'SKINS_dropDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultValue': '0'},
        {'id': 'trueDistance', 'type':Constants.SkinParamTypes.SIZE, 'defaultParam': 'SKINS_dropDistance' ,'sumParams': ['SKINS_dropDistance'], 'usedInLogic': true, 'noshow': true},

        {'id': 'shd','type':Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue': '1px 1px 1px 0 rgba(0, 0, 0, 0.2);'},
        {'id': 'ribbonShd', 'type': Constants.SkinParamTypes.BOX_SHADOW, 'defaultValue': '3px 0 3px -2px rgba(0, 0, 0, 0.3);', 'noshow': true},

        {'id': 'trans','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'background-color 0.4s ease 0s;'},
        {'id': 'trans1','type':Constants.SkinParamTypes.TRANSITION,'defaultValue': 'color 0.4s ease 0s;'},
        {'id': 'trans2', 'type': Constants.SkinParamTypes.TRANSITION, 'defaultValue': 'border-width 0.2s ease 0.2s'},
        {'id': 'pepos', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'content: ""; position: absolute; width: 0; height: 0;', 'noshow': true},
        {'id': 'leftB', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'left: -20px; bottom: 0px;', 'noshow': true},
        {'id': 'leftT', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'left: -20px; top: 0px;', 'noshow': true},
        {'id': 'borderT', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'border-top: 10px solid transparent; border-bottom: 0px solid transparent; border-left: 10px solid transparent;', 'noshow': true},
        {'id': 'borderB', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'border-top: 0px solid transparent; border-bottom: 10px solid transparent; border-left: 10px solid transparent;', 'noshow': true},
        {'id': 'ellipsis', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;', 'noshow': true},
        {'id': 'none', 'type': Constants.SkinParamTypes.OTHER, 'defaultValue': 'display: none; box-shadow: none;', 'noshow': true}
    ]);

    def.html(
        '<div class="strip"></div>' +
        '<ul skinpart="menuContainer">' +
            '<li skinpart="menuItem">' +
                '<div class="center">' +
                    '<a></a>' +
                '</div>' +
                '<div class="wrapper">' +
                    '<ul></ul>' +
                '</div>' +
            '</li>' +
        '</ul>'
    );

    def.css([
        ' .strip {position: absolute; top: 10px; right: 0; bottom: 10px; left: 0; [bg] [shd]}',
        'ul {cursor: pointer; list-style: none; padding: 0; margin: 0; white-space: nowrap; position: absolute;}',
        'li {margin: 0; padding: 0; box-sizing: border-box;}',
        'li:hover {background-color: transparent;}',

        ' .moreButton{[ellipsis]}',
        ' .wrapper {padding-top: [trueDistance]; visibility: hidden; min-width: inherit; width: 100%; z-index: 1; position: absolute;}',

        '%menuContainer% {min-height: inherit; box-sizing: border-box; display: table; position: relative !important;}',
        '%menuContainer% > li {margin: 0 5px; min-height: inherit; display: table-cell; vertical-align: middle; position: relative; height: 100%;}',
        '%menuContainer% > li:hover > .wrapper {visibility: visible;}',
        'li:hover > .emptySubMenu {visibility: hidden;}',

        '%menuContainer% > li:before {content: ""; position: absolute; right: 0; width: 100%; height: 100%;}',
        '%menuContainer% > li:hover:before {content: ""; position: absolute; right: 0; width: 100%;}',
        '%menuContainer% > li.selected:before {content: ""; position: absolute; right: 0; width: 100%;}',

        ' .subMenu {[shd] min-width: calc(100% - 20px); min-width: -webkit-calc(100% - 20px);}',
        ' .subMenu li {[bgDrop] position: relative; padding: 5px 0;}',
        ' .subMenu li:hover {[trans] [bgh]}',
        ' .subMenu li.selected {[bgs]}',

        'li .center {[trans] min-height: inherit; position: relative; text-align: center; border: 0; margin: 0 auto;}',
        'li .center:before {[pepos] [leftT] [borderT] border-right: 10px solid transparent;}',
        'li .center:after {[pepos] [leftB] [borderB] border-right: 10px solid transparent;}',

        'li:hover .center {[bgh] [trans] position: relative; text-align: center; border: 0; [ribbonShd]}',
        'li:hover .center:before {[trans2] [pepos] [leftT] [borderT] border-right: 10px solid [foldh];}',
        'li:hover .center:after {[trans2] [pepos] [leftB] [borderB] border-right: 10px solid [foldh];}',

        'li.selected > .center {[bgs] position: relative; text-align: center; border: 0; [ribbonShd]}',
        'li.selectedContainer > .center {[bgs] position: relative; text-align: center; border: 0; [ribbonShd]}',
        'li.selected > .center:before {[pepos] [leftT] [borderT] border-right: 10px solid [folds];}',
        'li.selectedContainer > .center:before {[pepos] [leftT] [borderT] border-right: 10px solid [folds];}',
        'li.selected > .center:after {[pepos] [leftB] [borderB] border-right: 10px solid [folds];}',
        'li.selectedContainer > .center:after {[pepos] [leftB] [borderB] border-right: 10px solid [folds];}',

        'li.selected:hover > .center {[bgs] position: relative; text-align: center; border: 0; [ribbonShd]}',
        'li.selectedContainer:hover > .center {[bgs] position: relative; text-align: center; border: 0; [ribbonShd]}',
        'li.selected:hover > .center:before {[pepos] [leftT] [borderT] border-right: 10px solid [folds];}',
        'li.selectedContainer:hover > .center:before {[pepos] [leftT] [borderT] border-right: 10px solid [folds];}',
        'li.selected:hover > .center:after {[pepos] [leftB] [borderB] border-right: 10px solid [folds];}',
        'li.selectedContainer:hover > .center:after {[pepos] [leftB] [borderB] border-right: 10px solid [folds];}',

        'li:hover .subMenu .center {background-color: transparent; box-shadow: none;}',
        'li:hover .subMenu .center:before {[none]}',
        'li:hover .subMenu .center:after {[none]}',

        'li:hover .subMenu li:hover .center {background-color: transparent;}',
        'li:hover .subMenu li:hover .center:before {[none]}',
        'li:hover .subMenu li:hover .center:after {[none]}',

        'li:hover .subMenu li.selected:hover .center {background-color: transparent;}',
        'li:hover .subMenu li.selected .center {background-color: transparent;}',
        'li:hover .subMenu li.selected:hover .center:before, li:hover .subMenu li.selected .center:before {[none]}',
        'li:hover .subMenu li.selected:hover .center:after, li:hover .subMenu li.selected .center:after {[none]}',

        ' .label {[fnt] [trans1] color: [txt]; padding: 0 9px; vertical-align: middle;}',
        ' li:hover > .center .label {[trans1] color: [txth]}',
        ' .selected > .center .label {color: [txts]; display: inline-block;}',
        ' li.selected:hover > .center .label {color: [txts];}',
        ' li.selectedContainer:hover > .center .label {color: [txts];}',

        '[state~="buttons-align-left"] ul {float: left; left: 10px;}',
        '[state~="buttons-align-left"] ul.subMenu {left: 5px;}',
        '[state~="buttons-align-center"] ul {margin: 0 auto; float: none;}',
        '[state~="buttons-align-center"] ul.subMenu {left: 5px;}',
        '[state~="buttons-align-right"] ul {float: right; right: 10px;}',
        '[state~="buttons-align-right"] ul.subMenu {right: 5px !important;}',

        '[state~="text-align-left"] li {text-align: left;}',
        '[state~="text-align-center"] li {text-align: center;}',
        '[state~="text-align-right"] li {text-align: right;}',
        '[state~="text-align-ignore"] li {text-align: center;}',

        '[state~="buttons-stretch"] %menuContainer% {text-align: justify; display: table; width: calc(100% - 20px); width: -webkit-calc(100% - 20px);}',
        '[state~="buttons-stretch"]:after {content: ""; width: 100%;}',
        '[state~="buttons-stretch"] li {box-sizing: border-box;}',
        '[state~="buttons-stretch"] ul.subMenu {left: 10px;}',

        ':not([state~="buttons-stretch"]) %menuContainer% {width: auto;}',
        ':not([state~="buttons-stretch"]) ul.subMenu {min-width: calc(100% - 10px); min-width: -webkit-calc(100% - 10px);}',

        '%menuContainer% > li > .center {height: 100%; display: table;}',
        '%menuContainer% > li > .center .label {display: table-cell;}',
        '%menuContainer% > li.selected > .center .label {display: table-cell;}',
        '%menuContainer% > li.selectedContainer > .center .label {display: table-cell; color: [txts];}',

        '[state~=subMenuOpenDir-up] %menuContainer% > li > .wrapper {bottom: 100%;}',
        '[state~=subMenuOpenDir-up] .subMenu {bottom: 0; margin-bottom: [trueDistance];}',

        '[state~=subMenuOpenDir-down] %menuContainer% > li > .wrapper {top: 100%;}',
        '[state~=subMenuOpenDir-down] .subMenu {top: 0; margin-top: [trueDistance];}'
    ]);
});