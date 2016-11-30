define.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateLinesMenuButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.iconParams({'description': 'Separate Lines Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/menuseperatelines.png', 'hidden': false, 'index': 11});

    def.compParts({
        "repeaterButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.SeparateLinesMenuButtonNSkin",
            "styleGroup": "inherit"
        },
        "moreButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.SeparateLinesMenuButtonNSkin",
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
            "id": "bgDrop",
            "type": Constants.SkinParamTypes.BG_COLOR,
            "defaultTheme": "color_11"
        },
        {
            "id": "pad",
            "type": Constants.SkinParamTypes.SIZE,
            "defaultValue": "5px"
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
        '%dropWrapper% { visibility:hidden; position:absolute; margin-top:[gapFromMenu]; padding:0 [pad]; [boxModel] }',
        '%dropWrapper%[dropMode=dropUp] { margin-top:0; margin-bottom:[gapFromMenu]; }',
        '%dropWrapper%[dropHPosition=left] { padding-left:0; }',
        '%dropWrapper%[dropHPosition=right] { padding-right:0; }',
        '%moreContainer% {[bgDrop] [rd]}'
    ]);

});