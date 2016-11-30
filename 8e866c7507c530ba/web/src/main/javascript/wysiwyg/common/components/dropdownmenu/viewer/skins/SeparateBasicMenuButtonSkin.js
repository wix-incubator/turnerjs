define.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateBasicMenuButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.iconParams({'description': 'Separate Basic Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/menubuttons.png', 'hidden': false, 'index': 7});

    def.compParts({
        "repeaterButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.SeparateBasicMenuButtonNSkin",
            "styleGroup": "inherit"
        },
        "moreButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.SeparateBasicMenuButtonNSkin",
            "styleGroup": "inherit"
        }
    });

    def.skinParams([
        {
            "id": "rdDrop",
            "type": Constants.SkinParamTypes.BORDER_RADIUS,
            "defaultValue": "10px"
        },
        {
            "id": "bgDrop",
            "type": Constants.SkinParamTypes.BG_COLOR,
            "defaultTheme": "color_11"
        },
        {
            "id": "brw",
            "type": Constants.SkinParamTypes.SIZE,
            "defaultValue": "0"
        },
        {
            "id": "brd",
            "type": Constants.SkinParamTypes.COLOR_ALPHA,
            "defaultTheme": "color_15"
        },
        {
            "id": "shd",
            "type": Constants.SkinParamTypes.BOX_SHADOW,
            "defaultValue": "0 1px 4px rgba(0, 0, 0, 0.6);"
        },
        {
            "id": "boxModel",
            "type": Constants.SkinParamTypes.OTHER,
            "defaultValue": "-moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;"
        },
        {
            "id": "gapFromMenu",
            "type": Constants.SkinParamTypes.OTHER,
            "defaultValue": "7px"
        }
    ]);

    def.html(
        '<div skinPart="itemsContainer">' +
        '</div>' +
        '<div skinPart="moreButton">' +
        '</div>' +
        '<div skinPart="dropWrapper">' +
        '<div skinPart="moreContainer">' +
        '</div>' +
        '</div>');

    def.css([
        '%itemsContainer% { position:relative; overflow:hidden;}',
        '%dropWrapper%                      { visibility:hidden; position:absolute; margin-top:[gapFromMenu];  [boxModel][shd][rdDrop] }',
        '%dropWrapper%[dropMode=dropUp]     { margin-top:0; margin-bottom:[gapFromMenu]; }',
        '%dropWrapper%[dropHPosition=left]  { padding-left:0; }',
        '%dropWrapper%[dropHPosition=right] { padding-right:0; }',
        '%moreContainer%                    { border:solid [brw] [brd]; [bgDrop] [rdDrop] [shd] }'
    ]);

});