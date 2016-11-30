define.experiment.newSkin('wysiwyg.common.components.facebooklikebox.editor.skins.FacebookLikeBoxPanelSkin.NewFacebookLikebox', function(skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('mobile.core.skins.BaseSkin');

	def.skinParams([
        {'id':'$BorderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue':'5px'}
    ]);

	def.compParts({
        getFacebookLink:    { skin: Constants.PanelFields.InlineTextLinkField.skins["default"] },
        pageIdInput:        { skin: Constants.PanelFields.Input.skins.facebooklikebox },
        facesCB :           { skin: Constants.PanelFields.CheckBox.skins["default"] },
        streamCB:           { skin: Constants.PanelFields.CheckBox.skins["default"] },
        headerCB:           { skin: Constants.PanelFields.CheckBox.skins["default"] }
    });

    def.html(
        '<div skinPart="content">' +
            '<div skinpart="getFacebookLink"></div>' +

            '<fieldset>' +
                '<div class="fld" skinpart="pageIdInput"></div>' +
            '</fieldset>' +

            '<fieldset>' +
                '<div class="fld chbx" skinpart="facesCB"></div>' +
                '<div class="fld chbx" skinpart="streamCB"></div>' +
                /*'<div class="fld chbx" skinpart="borderCB"></div>' +*/
                '<div class="fld chbx" skinpart="headerCB"></div>' +
            '</fieldset>' +
        '</div>'
    );

    def.css([
        'fieldset { position:relative;background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}',
        '%getFacebookLink% { padding-bottom: 20px; }',
        '%pageIdInput% { position:relative;}',
        '%.chbx% { margin:5px 0}',
        '%.chbx% input[type="checkbox"] { margin-right:10px;}'
    ]);
});
