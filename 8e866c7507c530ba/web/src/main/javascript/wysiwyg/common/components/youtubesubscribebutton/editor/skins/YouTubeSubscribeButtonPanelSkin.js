define.skin('wysiwyg.common.components.youtubesubscribebutton.editor.skins.YouTubeSubscribeButtonPanelSkin', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.skinParams([
        {'id': '$BorderRadius', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '5px'}
    ]);

    def.compParts({
        uriLabel: {skin: Constants.PanelFields.Label.skins["default"]},
        uriInput: {skin: Constants.PanelFields.SubmitInput.skins["default"]},
        layoutCB: {skin: Constants.PanelFields.ComboBox.skins["default"]},
        themeCB: {skin: Constants.PanelFields.ComboBox.skins["default"]},
        addAnimation: {skin: Constants.PanelFields.ButtonField.skins.withArrow}
    });

    def.html(
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div skinpart="uriLabel"> </div>' +
                '<div skinpart="uriInput"> </div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="layoutCB"> </div>' +
                '<div skinpart="themeCB"> </div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="addAnimation"></div>' +
            '</fieldset>' +
        '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}'
    ]);
});