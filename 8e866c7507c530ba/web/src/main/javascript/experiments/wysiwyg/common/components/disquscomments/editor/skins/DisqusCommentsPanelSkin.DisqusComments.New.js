define.experiment.newSkin('wysiwyg.common.components.disquscomments.editor.skins.DisqusCommentsPanelSkin.DisqusComments.New', function(skinDefinition) {
	/** @type core.managers.skin.SkinDefinition */

	var def = skinDefinition;

	def.inherits('mobile.core.skins.BaseSkin');

    def.compParts({
        disqusId: { skin: Constants.PanelFields.SubmitInput.skins.default },
        registerDisqusSiteProfile: { skin: Constants.PanelFields.InlineTextLinkField.skins.default }
    });

    def.html(
        '<div skinPart="content">' +

        '<fieldset>' +

            '<div skinpart="disqusId"></div>' +

            '<div skinpart="registerDisqusSiteProfile"></div>' +

        '</fieldset>' +

        '</div>'
    );

    def.css([
        'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}',
        '%registerDisqusSiteProfile% { padding-top:10px }'
    ]);

});
