define.component('wysiwyg.common.components.areatooltip.editor.AreaTooltipPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.dataTypes(['AreaTooltip']);

    def.skinParts({
		tooltipText: {
			type: Constants.PanelFields.TextArea.compType,
			argObject: {
				labelText: 'AREATOOLTIPCOMPONENT_tooltiptext'
			},
			bindToData: 'tooltipText'
		},
		position: {
			type: Constants.PanelFields.ComboBox.compType,
			argObject: {
				labelText: 'AREATOOLTIPCOMPONENT_tooltipposition'
			},
			bindToProperty: 'tooltipPosition',
			dataProvider: function () {
				return [
					{ label: "Right", value: 'right' },
					{ label: "Left", value: 'left' },
					{ label: "Top", value: 'top' },
					{ label: "Bottom", value: 'bottom' }
				];
			}
		}
    });
});
