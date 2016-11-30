define.component('wysiwyg.common.components.packagepicker.editor.PackagePickerPanel', function (componentDefinition) {
	/**@type core.managers.component.ComponentDefinition */
	var def = componentDefinition;

	def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

	def.dataTypes(['PackagePicker']);

	def.resources(['W.Config', 'W.Data', 'W.Preview']);

	def.skinParts({
		buttonImage: {
			type: Constants.PanelFields.ImageField.compType,
			argObject: {
				buttonText: 'Change button image'
			},
			bindToData: 'buttonImageUrl',
			bindHooks: ['_imageInputToData', '_imageDataToInput']
		},
		packageId: {
			type: Constants.PanelFields.Input.compType,
			argObject: {
				labelText: 'Package ID'
			},
			bindToData: 'packageId'
		},
		tooltipText: {
			type: Constants.PanelFields.TextArea.compType,
			argObject: {
				labelText: 'Tooltip Text'
			},
			bindToData: 'tooltipText'
		},
		buttonTopOffset: {
			type: Constants.PanelFields.Input.compType,
			argObject: {
				labelText: 'Button top offset'
			},
			bindToProperty: 'buttonTopOffset'
		},
		radioButtonGap: {
			type: Constants.PanelFields.Input.compType,
			argObject: {
				labelText: 'Radio Button Gap'
			},
			bindToProperty: 'radioButtonGap'
		},
		selectCycle: {
			type: Constants.PanelFields.ComboBox.compType,
			argObject: { labelText: 'Cycle' },
			bindToData: 'billingCycle',
			dataProvider: function () {
				return [
					{ label: "Monthly", value: 'monthly' },
					{ label: "Yearly", value: 'yearly' }
				];
			}
		},
		isDefault: {
			type: Constants.PanelFields.CheckBox.compType,
			argObject: {
				labelText: 'Display as Selected'
			},
			bindToData: 'selectByDefault'
		}

	});


	def.methods({
		_imageInputToData: function (inputData) {
			return inputData.uri;
		},
		_imageDataToInput: function (buttonImageUrl) {
			return { uri: buttonImageUrl, width: 128, height: 128 };
		}
	});

});
