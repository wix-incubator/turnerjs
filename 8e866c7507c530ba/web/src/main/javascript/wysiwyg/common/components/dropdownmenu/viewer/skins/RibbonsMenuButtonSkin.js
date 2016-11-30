define.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.RibbonsMenuButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.iconParams({'description': 'Ribbons Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/muenuribbons.png', 'hidden': false, 'index': 13});

    def.compParts({
        "repeaterButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.RibbonsMenuButtonNSkin",
            "styleGroup": "inherit"
        },
        "moreButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.RibbonsMenuButtonNSkin",
            "styleGroup": "inherit"
        }
    });

    def.skinParams([
        {
            "id": "bg",
            "type": Constants.SkinParamTypes.BG_COLOR,
            "defaultTheme": "color_11"
        },
        {
            "id": "elm",
            "type": Constants.SkinParamTypes.COLOR_ALPHA,
            "defaultTheme": "color_15",
            "lang": "foldR"
        },
        {
            "id": "elm2",
            "type": Constants.SkinParamTypes.COLOR_ALPHA,
            "defaultTheme": "color_15",
            "lang": "foldL"
        },
        {
            "id": "els",
            "type": Constants.SkinParamTypes.SIZE,
            "mutators": [
                "increase",
                10
            ],
            "defaultValue": "0",
            "lang": "fold"
        },
        {
            "id": "bgDrop",
            "type": Constants.SkinParamTypes.BG_COLOR,
            "defaultTheme": "color_11"
        },
        {
            "id": "boxModel",
            "type": Constants.SkinParamTypes.OTHER,
            "defaultValue": "-moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;"
        },
        {
            "id": "gapFromMenu",
            "type": Constants.SkinParamTypes.OTHER,
            "defaultValue": "0px"
        },
        {
            "id": "shd",
            "type": Constants.SkinParamTypes.BOX_SHADOW,
            "defaultValue": "0 2px 3px rgba(0, 0, 0, 0.7);"
        }
    ]);

    def.html(
        '<div class="fl ribbon">' +
        '</div>' +
        '<div class="fr ribbon">' +
        '</div>' +
        '<div skinPart="itemsContainer">' +
        '</div>' +
        '<div skinPart="moreButton">' +
        '</div>' +
        '<div skinPart="dropWrapper">' +
        '<div skinPart="moreContainer">' +
        '</div>' +
        '</div>');

    def.css([
        '%itemsContainer% { margin:0 0 [els] 0; position:relative; overflow:hidden; [bg][shd]}',
        '%.ribbon% { position:absolute; bottom:-[els]; height:0; width:0; border:[els] solid transparent;}',
        '%.fr% { border-top-color:[elm]; border-left-width:0; right:0; }',
        '%.fl% { border-top-color:[elm2]; border-right-width:0; left:0;}',
        '%dropWrapper% { visibility:hidden; position:absolute; margin-top:[gapFromMenu]; margin-top:-10px; [boxModel] }',
        '%dropWrapper%[dropMode=dropUp] { margin-top:0; margin-bottom:[gapFromMenu]; }',
        '%moreContainer%                {[bgDrop][shd] }'
    ]);

});