define.component('Editor.wysiwyg.common.components.numericstepper.viewer.NumericStepper', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.panel({
        logic: 'wysiwyg.common.components.numericstepper.editor.NumericStepperPanel',
        skin: 'wysiwyg.common.components.numericstepper.editor.skins.NumericStepperPanelSkin'
    });

    def.helpIds({
        chooseStyle: ''
    });

    def.styles(1);

    def.methods({});

});