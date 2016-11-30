define.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.PointerMenuButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.iconParams({'description': 'Pointer Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/menuribbonbottom.png', 'hidden': false, 'index': 12});

    def.compParts({
        "repeaterButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.PointerMenuButtonNSkin",
            "styleGroup": "inherit"
        },
        "moreButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.PointerMenuButtonNSkin",
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
            "id": "brd",
            "type": Constants.SkinParamTypes.COLOR_ALPHA,
            "defaultTheme": "color_15"
        },
        {
            "id": "bgDrop",
            "type": Constants.SkinParamTypes.BG_COLOR,
            "defaultTheme": "color_11"
        },
        {
            "id": "rd",
            "type": Constants.SkinParamTypes.BORDER_RADIUS,
            "defaultValue": "0px"
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
        '<div class="back">' +
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
        '%itemsContainer% { position:relative; overflow:hidden; }',
        '%.back%          { [bg] position:absolute; top:0; bottom:13px; left:0; right:0; border-bottom:solid 1px [brd]; }',
        '%dropWrapper%                  { visibility:hidden; position:absolute; [boxModel] }',
        '%dropWrapper%[dropMode=dropUp] { margin-top:0; margin-bottom:[gapFromMenu]; }',
        '%moreContainer%                { [bgDrop] [rd] [shd] }'
    ]);

});