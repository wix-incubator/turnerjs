define.experiment.newComponent('Editor.wysiwyg.common.components.disquscomments.viewer.DisqusComments.DisqusComments.New', function(componentDefinition) {
	/**@type core.managers.component.ComponentDefinition */
	var def = componentDefinition;

	def.panel({
		logic: 'wysiwyg.common.components.disquscomments.editor.DisqusCommentsPanel',
		skin: 'wysiwyg.common.components.disquscomments.editor.skins.DisqusCommentsPanelSkin'
	});

//	def.styles(1);

	def.methods({
		_isEditModeChangeToFromPreview: function (mode, oldMode) {
			return mode === 'PREVIEW' || (oldMode && oldMode.source === 'PREVIEW');
		}

	});

	def.helpIds({
		componentPanel: '/node/24028'
	});

});