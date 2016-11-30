define.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.VerticalRibbonsMenuButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.iconParams({'description': 'Vertical Ribbons Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/vertical_ribbon.png', 'hidden': false, 'index': 14});

    def.compParts({
        "repeaterButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.VerticalRibbonsMenuButtonNSkin",
            "styleGroup": "inherit"
        },
        "moreButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.VerticalRibbonsMenuButtonNSkin",
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
            "id": "bgDrop",
            "type": Constants.SkinParamTypes.BG_COLOR,
            "defaultTheme": "color_11"
        },
        {
            "id": "els",
            "type": Constants.SkinParamTypes.SIZE,
            "defaultValue": "10",
            "noshow": true
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
            "defaultValue": "0 2px 3px rgba(0, 0, 0, 0.7);"
        }
    ]);

    def.html(
        '<div class="bar">' +
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
        '%.bar% { position:absolute; top:[els]; bottom:[els]; left:0; right:0; [bg][shd]}',
        '%itemsContainer% { position:relative; overflow:hidden; }',
        '%dropWrapper% { visibility:hidden; position:absolute; margin-top:[gapFromMenu]; [boxModel] }',
        '%dropWrapper%[dropMode=dropUp] { margin-top:0; margin-bottom:[gapFromMenu]; }',
        '%moreContainer% { [bgDrop][shd] }'
    ]);

});