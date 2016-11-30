define.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.ShinyMenuIButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.iconParams({'description': 'Shiny Menu I ', 'iconUrl': '/images/wysiwyg/skinIcons/menu/menusolidshiny.png', 'hidden': false, 'index': 4});

    def.compParts({
        "repeaterButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.ShinyMenuIButtonNSkin",
            "styleGroup": "inherit"
        },
        "moreButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.ShinyMenuIButtonNSkin",
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
            "type": Constants.SkinParamTypes.COLOR_ALPHA,
            "defaultTheme": "color_11"
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
        '<div skinPart="itemsContainer">' +
        '</div>' +
        '<div skinPart="moreButton">' +
        '</div>' +
        '<div skinPart="dropWrapper">' +
        '<div skinPart="moreContainer">' +
        '</div>' +
        '</div>');

    def.css([
        '%itemsContainer%               { position:relative; overflow:hidden; background:[bg] url([tdr]shiny1button_bg.png) center center repeat-x; [rd] [shd] }',
        '%dropWrapper%                  { visibility:hidden; position:absolute; margin-top:[gapFromMenu]; }',
        '%dropWrapper%[dropMode=dropUp] { margin-top:0; margin-bottom:[gapFromMenu]; }',
        '%moreContainer%                { [bgDrop] [rdDrop] [shd] }'
    ]);

});