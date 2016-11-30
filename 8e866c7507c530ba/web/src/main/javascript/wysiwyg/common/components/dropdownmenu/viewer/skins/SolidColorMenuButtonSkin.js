define.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.SolidColorMenuButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.iconParams({'description': 'Solid Color Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/menusolid.png', 'hidden': false, 'index': 3});

    def.compParts({
        "repeaterButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.SolidColorMenuButtonNSkin",
            "styleGroup": "inherit"
        },
        "moreButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.SolidColorMenuButtonNSkin",
            "styleGroup": "inherit"
        }
    });

    def.skinParams([
        {
            "id": "rd",
            "type": Constants.SkinParamTypes.BORDER_RADIUS,
            "defaultValue": "10px"
        },
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
            "id": "bg",
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
            "id": "boxModel",
            "type": Constants.SkinParamTypes.OTHER,
            "defaultValue": "-moz-box-sizing:border-box; -webkit-box-sizing:border-box; box-sizing:border-box;"
        },
        {
            "id": "gapFromMenu",
            "type": Constants.SkinParamTypes.OTHER,
            "defaultValue": "7px"
        },
        {
            "id": "shd",
            "type": Constants.SkinParamTypes.BOX_SHADOW,
            "defaultValue": "0 1px 4px rgba(0, 0, 0, 0.6);"
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
        '%itemsContainer%               { [bg][rd][shd] border:solid [brw] [brd]; position:relative; overflow:hidden; }',
        '%dropWrapper%                  { margin-top:[gapFromMenu]; visibility:hidden; position:absolute;  [boxModel] }',
        '%dropWrapper%[dropMode=dropUp] { margin-top:0; margin-bottom:[gapFromMenu]; }',
        '%moreContainer%                { [bgDrop][rdDrop][shd] border:solid [brw] [brd]; }'
    ]);

});