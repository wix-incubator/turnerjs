define.skin('wysiwyg.common.components.dropdownmenu.viewer.skins.SloppyBorderMenuButtonSkin', function(SkinDefinition) {

    /** @type core.managers.skin.SkinDefinition */

    var def=SkinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.iconParams({'description': 'Sloppy Border Menu', 'iconUrl': '/images/wysiwyg/skinIcons/menu/sloppy.png', 'hidden': false, 'index': 18});

    def.compParts({
        "repeaterButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.SloppyBorderMenuButtonNSkin",
            "styleGroup": "inherit"
        },
        "moreButton": {
            "skin": "wysiwyg.viewer.skins.dropmenubutton.SloppyBorderMenuButtonNSkin",
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
            "id": "tdr",
            "type": Constants.SkinParamTypes.URL,
            "defaultTheme": "BASE_THEME_DIRECTORY"
        },
        {
            "id": "gapFromMenu",
            "type": Constants.SkinParamTypes.OTHER,
            "defaultValue": "15px"
        },
        {
            "id": "fr",
            "type": Constants.SkinParamTypes.OTHER,
            "defaultValue": "position:absolute; content:\"\";"
        },
        {
            "id": "s",
            "type": Constants.SkinParamTypes.OTHER,
            "defaultValue": "7px"
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
        '%itemsContainer% { position:relative; overflow:hidden; [bg] }',
        '%dropWrapper% { visibility:hidden; position:absolute; margin-top:[gapFromMenu]; }',
        '%dropWrapper%[dropMode=dropUp] { margin-top:0; margin-bottom:[gapFromMenu]; }',
        '%moreContainer% { [bgDrop] }',
        '%.wrapper%:before  { [fr] background:url([tdr]sloppyvertical.png) repeat-y 0 0;    left:-[s];  top:0; bottom:0; width:[s]; }',
        '%.wrapper%:after   { [fr] background:url([tdr]sloppyvertical.png) repeat-y 100% 0; right:-[s]; top:0; bottom:0; width:[s]; }',
        ':before  { [fr] background:url([tdr]sloppyhoriz.png) repeat-x 0 0;    left:-[s];  top:-[s];    right:-[s]; height:[s]; }',
        ':after   { [fr] background:url([tdr]sloppyhoriz.png) repeat-x 0 100%; left:-[s];  bottom:-[s]; right:-[s]; height:[s]; }',
        '%dropWrapper%:before  { [fr] background:url([tdr]sloppyvertical.png) repeat-y 0 0;    left:-[s];  top:0; bottom:0; width:[s]; }',
        '%dropWrapper%:after   { [fr] background:url([tdr]sloppyvertical.png) repeat-y 100% 0; right:-[s]; top:0; bottom:0; width:[s]; }',
        '%moreContainer%:before  { [fr] background:url([tdr]sloppyhoriz.png) repeat-x 0 0;    left:-[s];  top:-[s];    right:-[s]; height:[s]; }',
        '%moreContainer%:after   { [fr] background:url([tdr]sloppyhoriz.png) repeat-x 0 100%; left:-[s];  bottom:-[s]; right:-[s]; height:[s]; }'
    ]);

});