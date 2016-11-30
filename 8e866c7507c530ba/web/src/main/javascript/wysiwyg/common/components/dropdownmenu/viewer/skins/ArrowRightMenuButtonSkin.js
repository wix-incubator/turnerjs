define.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.ArrowRightMenuButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.statics({
        "maxH": 280
    });

    def.inherits('mobile.core.skins.BaseSkin');

    def.iconParams({'description': 'Arrow Right Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/arrows.png', 'hidden': false, 'index': 17});

    def.compParts({
        "repeaterButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.ArrowRightMenuButtonNSkin",
            "styleGroup": "inherit"
        },
        "moreButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.ArrowRightMenuButtonNSkin",
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
            "id": "pad",
            "type": Constants.SkinParamTypes.SIZE,
            "mutators": [
                "decrease",
                70
            ],
            "defaultValue": "1"
        },
        {
            "id": "padLeft",
            "type": Constants.SkinParamTypes.SIZE,
            "defaultValue": "70",
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
        '%itemsContainer% { position:relative; overflow:hidden; }',
        '%dropWrapper% { visibility:hidden; position:absolute; margin-top:[gapFromMenu]; [boxModel] }',
        '%dropWrapper%[dropMode=dropUp] { margin-top:0; margin-bottom:[gapFromMenu]; }',
        '%moreContainer% { margin-right:[pad]; [bgDrop] [rdDrop] }',
        '%dropWrapper%[dropHPosition=left] %moreContainer% { margin-right:0; margin-left:0; left:0; }',
        '%dropWrapper%[dropAlign=left][dropHPosition=center] %moreContainer% { margin-right:0; margin-left:[padLeft]; }',
        '%dropWrapper%[dropAlign=left][dropHPosition=left] %moreContainer% { margin-right:0; margin-left:0 !important; }',
        '%dropWrapper%[dropAlign=right] { text-align:right; }',
        '%dropWrapper%[dropAlign=right] %moreContainer% { margin-right:0; }'
    ]);

});