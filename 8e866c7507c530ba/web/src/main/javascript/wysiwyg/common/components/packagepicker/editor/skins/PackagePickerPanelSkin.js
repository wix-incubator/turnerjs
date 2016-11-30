define.skin('wysiwyg.common.components.packagepicker.editor.skins.PackagePickerPanelSkin', function (skinDefinition) {
	/** @type core.managers.skin.SkinDefinition */
	var def = skinDefinition;

	def.inherits('mobile.core.skins.BaseSkin');

	def.skinParams([
		{'id': '$BorderRadius', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '5px'}
	]);

	def.compParts({
		packageId: {skin: Constants.PanelFields.Input.skins.default},
		buttonImage: {skin: Constants.PanelFields.ImageField.skins.default},
		tooltipText: {skin: Constants.PanelFields.TextArea.skins.default},
		buttonTopOffset: {skin: Constants.PanelFields.Input.skins.default},
		radioButtonGap: {skin: Constants.PanelFields.Input.skins.default},
		selectCycle: {skin: Constants.PanelFields.ComboBox.skins.default },
		isDefault: {skin: Constants.PanelFields.CheckBox.skins.default }
	});

	def.html(
			'<div skinPart="content">' +

			'<fieldset>' +
			'<div skinpart="packageId"></div>' +
			'</fieldset>' +

			'<fieldset>' +
			'<div skinpart="selectCycle"></div>' +
			'</fieldset>' +

			'<fieldset>' +
			'<div skinpart="isDefault"></div>' +
			'</fieldset>' +

			'<fieldset>' +
			'<div skinpart="tooltipText"></div>' +
			'</fieldset>' +

			'<fieldset>' +
			'<div skinpart="buttonImage"></div>' +
			'</fieldset>' +

			'<fieldset>' +
			'<div skinpart="buttonTopOffset"></div>' +
			'</fieldset>' +

			'<fieldset>' +
			'<div skinpart="radioButtonGap"></div>' +
			'</fieldset>' +

			'</div>'
	);

	def.css([
		'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}'
	]);
});