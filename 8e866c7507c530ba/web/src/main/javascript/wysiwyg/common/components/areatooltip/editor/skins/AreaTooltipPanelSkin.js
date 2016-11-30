define.skin('wysiwyg.common.components.areatooltip.editor.skins.AreaTooltipPanelSkin', function (skinDefinition) {
	/** @type core.managers.skin.SkinDefinition */
	var def = skinDefinition;

	def.inherits('mobile.core.skins.BaseSkin');

	def.skinParams([
		{'id': '$BorderRadius', 'type': Constants.SkinParamTypes.BORDER_RADIUS, 'defaultValue': '5px'}
	]);

	def.compParts({
		changeStyle: {skin: Constants.PanelFields.ButtonField.skins.blueWithArrow},
		tooltipText: {skin: Constants.PanelFields.TextArea.skins.default},
		position: {skin: Constants.PanelFields.ComboBox.skins.default }
	});

	def.html(
			'<div skinPart="content">' +

			'<fieldset>' +
			'<div skinpart="tooltipText"></div>' +
			'</fieldset>' +

			'<fieldset>' +
			'<div skinpart="position"></div>' +
			'</fieldset>' +

			'</div>'
	);

	def.css([
		'fieldset { background:#fff; padding:10px; border:1px solid #e6e6e6; border-top:1px solid #ccc; margin-bottom:6px; [$BorderRadius]}'
	]);
});