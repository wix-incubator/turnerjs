define.component('wysiwyg.common.components.anchor.editor.AnchorPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.utilize(['wysiwyg.editor.utils.InputValidators']);

    def.dataTypes(['Anchor']);

    def.skinParts({
        anchorName: {
            type: Constants.PanelFields.Input.compType,
            argObject: {
                labelText: 'Anchor_NAME',
                maxLength: 50,
                minLength: 3
            },
            bindToData: 'name',
            hookMethod: '_validator'
        },
        info: {
            type: Constants.PanelFields.Label.compType,
            argObject: {
                labelText: W.Resources.get('EDITOR_LANGUAGE', 'Anchor_PANEL_DETAILS')
            }
        }
    });
    def.methods({
        _validator: function(definition){
            this._inputValidators = this._inputValidators || new this.imports.InputValidators();
            definition.argObject.validatorArgs = {validators: [this._inputValidators.htmlCharactersValidator]};
            return definition;
        }
    });
});
