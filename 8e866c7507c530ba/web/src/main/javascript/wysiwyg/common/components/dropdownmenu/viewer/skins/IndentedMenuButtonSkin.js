define.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.IndentedMenuButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.statics({
        "maxH": 430
    });

    def.inherits('mobile.core.skins.BaseSkin');

    def.iconParams({'description': 'Indented Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/indented.png', 'hidden': false, 'index': 15});

    def.compParts({
        "repeaterButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.IndentedMenuButtonNSkin",
            "styleGroup": "inherit"
        },
        "moreButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.IndentedMenuButtonNSkin",
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
            "id": "bg",
            "type": Constants.SkinParamTypes.COLOR_ALPHA,
            "defaultTheme": "color_11"
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
            "defaultValue": "7px"
        },
        {
            "id": "tdr",
            "type": Constants.SkinParamTypes.URL,
            "defaultTheme": "BASE_THEME_DIRECTORY"
        },
        {
            "id": "shd",
            "type": Constants.SkinParamTypes.BOX_SHADOW,
            "defaultValue": "0 1px 4px rgba(0, 0, 0, 0.6);"
        }
    ]);

    def.html(
        '<div class="wrapper">' +
        '<div skinPart="itemsContainer">' +
        '</div>' +
        '</div>' +
        '<div skinPart="moreButton">' +
        '</div>' +
        '<div skinPart="dropWrapper">' +
        '<div skinPart="moreContainer">' +
        '</div>' +
        '</div>');

    def.css([
        '%.wrapper%       { background:[bg] url([tdr]indented_bg_inverted.png) center top repeat-x; position:relative; overflow:hidden;  [rd] [shd] }',
        '%itemsContainer% { background:transparent url([tdr]indented_bg_inverted.png) center bottom repeat-x; [rd] }',
        '%dropWrapper%    { visibility:hidden; position:absolute; margin-top:[gapFromMenu]; [boxModel] }',
        '%dropWrapper%[dropMode=dropUp] { margin-top:0; margin-bottom:[gapFromMenu]; }',
        '%moreContainer% { [bgDrop] [rdDrop] [shd] }'
    ]);

});