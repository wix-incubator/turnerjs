define.component('wysiwyg.common.components.numericstepper.editor.NumericStepperPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.dataTypes(['NumericStepper']);

    def.skinParts({
        changeStyle: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {buttonLabel: 'CHOOSE_STYLE_TITLE'}
        }
    });
});
