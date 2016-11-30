define.component('wysiwyg.editor.components.richtext.ToolBarWritableSelectableListDropDown', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.richtext.ToolBarWritableDropDown');

    def.skinParts({
        select:  {type: 'wysiwyg.viewer.components.inputs.TextInput', 'hookMethod': '_selectHookMethod', argObject: {shouldRenderOnDisplay: true}},
        arrow:   {type: 'htmlElement'},
        label:   {type: 'htmlElement'},
        options: {
            type: 'wysiwyg.common.components.inputs.OptionsListInput',
            dataRefField: '*',
            hookMethod: '_createArgObject'
        },
        bottomLinks:       { 'type': 'htmlElement'},
        bottomLeftLink:    { 'type' : 'wysiwyg.editor.components.WButton'},
        bottomRightLink:   { 'type' : 'wysiwyg.editor.components.WButton'}
    });

    def.methods({
        _getDataObjectFromUserInput: function() {
            this._skinParts.select.selectText(0,0);
            var userInput = this._skinParts.select.getDataItem().get('text');
            return this._skinParts.options.getDataItemByLabel(userInput);
        },
        autoCompleteIsAllowed: function(userInput) {
            // Allow auto complete on any user input
            return true;
        }
    });
});
