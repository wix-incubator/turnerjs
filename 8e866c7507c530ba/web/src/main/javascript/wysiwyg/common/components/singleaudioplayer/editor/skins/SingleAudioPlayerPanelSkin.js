define.skin('wysiwyg.common.components.singleaudioplayer.editor.skins.SingleAudioPlayerPanelSkin', function (skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

    def.skinParams([
        {'id': '$BorderRadius', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '5px'}
    ]);

    def.compParts({
        addTrackButton: {skin: Constants.PanelFields.AudioField.skins["default"]},
        trackName: {skin: Constants.PanelFields.Input.skins["default"]},
        artistName: {skin: Constants.PanelFields.Input.skins["default"]},
        trackSettings: {skin: Constants.PanelFields.SubLabel.skins["default"]},
        autoplay: {skin: Constants.PanelFields.CheckBox.skins["default"]},
        loop: {skin: Constants.PanelFields.CheckBox.skins["default"]},
        volume: {skin: Constants.PanelFields.Slider.skins["default"]},
        changeStyle: {skin: Constants.PanelFields.ButtonField.skins.blueWithArrow},
        addAnimation: {skin: Constants.PanelFields.ButtonField.skins.withArrow}
    });

    def.html(
        '<div skinPart="content">' +
            '<fieldset>' +
                '<div skinpart="addTrackButton"></div>' +
                '<div skinpart="trackButton"></div>' +
                '<div skinpart="trackName"></div>' +
                '<div skinpart="artistName"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="trackSettings"></div>' +
                '<div skinpart="autoplay"></div>' +
                '<div skinpart="loop"></div>' +
                '<div skinpart="volume"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="changeStyle"></div>' +
            '</fieldset>' +
            '<fieldset>' +
                '<div skinpart="addAnimation"></div>' +
            '</fieldset>' +
        '</div>'
    );

    def.css([
        'fieldset {background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}',
        '%trackName%, %artistName% {margin-top: 5px;}',
        '%autoplay%, {margin-top: -10px;}',
        '%volume%, {margin-bottom: 10px;}',
        '%addTrackButton% label {text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 240px; font-weight: bold;}'
    ]);
});