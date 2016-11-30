define.skin('wysiwyg.common.components.multiselectionitem.viewer.skins.MultiSelectionItemSkin', function (skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.skinParams([
        {"id": "webThemeDir", "type": Constants.SkinParamTypes.URL, "defaultTheme": "WEB_THEME_DIRECTORY"},
        {"id": "$closeBorderRadius", "type": Constants.SkinParamTypes.BORDER_RADIUS, "defaultValue": "0 5px 0 0"},
    ]);

    def.html(
        '<div skinpart="content">' +
            '<div skinpart="text"></div>' +
            '<div skinPart="button">' +
                '<span>x</span>' +
            '</div>' +
        '</div>'
    );

    def.css([
        ' { position:relative; }',
        '%content% { border-radius:2px; border:solid 1px #d4d4d4;}',
        '%content% > * { height:15px; backgroud-color:#ffffff; display:inline-block;}',
        '%text% {padding-left:5px; padding-right:5px;}',
        '%button% {cursor:pointer;}',
        '%button% span { display:block; padding-left:4px; padding-right:4px; color:#737373; border-left:solid 1px #d4d4d4; }',
        '%button% span:hover {color:#0099ff;}',
        '%button%:hover {background:#ddd}'
    ]);
});
