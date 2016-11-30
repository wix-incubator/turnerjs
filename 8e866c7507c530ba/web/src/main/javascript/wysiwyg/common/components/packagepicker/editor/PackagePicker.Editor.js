define.component('Editor.wysiwyg.common.components.packagepicker.viewer.PackagePicker', function(componentDefinition) {
	/**@type core.managers.component.ComponentDefinition */
	var def = componentDefinition;

	def.panel({
		logic: 'wysiwyg.common.components.packagepicker.editor.PackagePickerPanel',
		skin: 'wysiwyg.common.components.packagepicker.editor.skins.PackagePickerPanelSkin'
	});

//	def.styles(1);

	def.methods({
		_isEditModeChangeToFromPreview: function (mode, oldMode) {
			return mode === 'PREVIEW' || (oldMode && oldMode.source === 'PREVIEW');
		}

	});

});