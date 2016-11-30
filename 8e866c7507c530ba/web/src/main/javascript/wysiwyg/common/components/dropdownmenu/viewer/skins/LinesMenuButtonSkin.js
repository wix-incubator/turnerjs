define.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.LinesMenuButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.iconParams({'description': 'Lines Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/menulines.png', 'hidden': false, 'index': 10});

    def.compParts({
        "repeaterButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.LinesMenuButtonNSkin",
            "styleGroup": "inherit"
        },
        "moreButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.LinesMenuButtonNSkin",
            "styleGroup": "inherit"
        }
    });

    def.skinParams([
        {
            "id": "brw",
            "type": Constants.SkinParamTypes.SIZE,
            "defaultValue": "1px"
        },
        {
            "id": "brd",
            "type": Constants.SkinParamTypes.COLOR_ALPHA,
            "defaultTheme": "color_15"
        },
        {
            "id": "rd",
            "type": Constants.SkinParamTypes.BORDER_RADIUS,
            "defaultValue": "0px"
        },
        {
            "id": "shd",
            "type": Constants.SkinParamTypes.BOX_SHADOW,
            "defaultValue": "0 1px 4px rgba(0, 0, 0, 0.6);",
            "lang": "shDrop"
        },
        {
            "id": "bgDrop",
            "type": Constants.SkinParamTypes.BG_COLOR,
            "defaultTheme": "color_11"
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
        '%itemsContainer% { position:relative; overflow:hidden; border-top:solid [brw] [brd]; border-bottom:solid [brw] [brd]}',
        '%dropWrapper%    { visibility:hidden; position:absolute;  }',
        '%moreContainer%  { z-index:99999; margin:7px 0; [shd][bgDrop][rd] }'
    ]);

});