define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTStyleDropDownCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTDropDownCommand');

    def.methods({

        initialize: function(commandInfo, controllerComponent) {
            this.parent(commandInfo, controllerComponent);
        },

        _handleStateChange: function(event) {
            var state = event.sender.state;
            var selectedOption = this._getOptionToDisplay(state);

            if (selectedOption) {
                this._controllerComponent.setSelected(selectedOption);
                this._controllerComponent.fireEvent('presentedStyleChanged');
            }
        }
    });
});