define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTStyleDependentCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTDropDownCommand');

    def.traits(['wysiwyg.editor.components.richtext.commandcontrollers.traits.RTStyleDependent']);

    def.resources(['W.Resources']);

    def.binds(['_addRealValueToDefaultOptionLabel', '_onDropDownReady']);

    def.methods({

        initialize: function(commandInfo, controllerComponent) {
            controllerComponent.addEvent('dropDownReady', this._onDropDownReady);
            this.parent(commandInfo, controllerComponent);
        },

        addStateChangeListener: function() {
            this.parent();
            this._styleCommandComponent.addEvent('presentedStyleChanged', this._addRealValueToDefaultOptionLabel);
        },

        executeCommand: function(event)  {
            this.parent(event);
            this._handleDefaultOptionSelection(event);
        },

        _onDropDownReady: function(){
            var defaultOptionComp = this._getOptionComponent(Constants.CkEditor.TRISTATE.OFF);
            //the default value button label changes while it's hidden
            defaultOptionComp && defaultOptionComp.startRenderingComponentOnDisplay();
        },

        _handleDefaultOptionSelection: function(selectedOption) {
            if (!this._isDefaultOption(selectedOption)) {
                return;
            }
            var displayedOption = this._getOptionToDisplay(Constants.CkEditor.TRISTATE.OFF);
            this._controllerComponent.getDataItem().set('selected', displayedOption);
        },

        _isDefaultOption: function(option) {
            return option.get('value') === Constants.CkEditor.TRISTATE.OFF;
        },

        _isDefaultOptionSelected: function() {
            var currentSelection = this._controllerComponent.getSelectedOption();
            return !currentSelection || currentSelection.get('isDefault') != false;
        },

        _setControllerSelection: function(value) {
            var selectedOption = this._getOptionToDisplay(value);
            this._controllerComponent.setSelected(selectedOption);
        },

        _addRealValueToDefaultOptionLabel: function() {
            var value = this._getDefaultValueAccordingToStyle();
            var newDefaultOption = this._getOptionToDisplay(value);
            var defaultOption = this._getOptionFromMenu(Constants.CkEditor.TRISTATE.OFF);
            var defaultLabel = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'TOOLBAR_DROP_DOWN_DEFAULT_VALUE');
            defaultOption.set('label', defaultLabel + "  (" + (newDefaultOption ? newDefaultOption.get("label") : value) + ")");
        },

        /**
         * called when a value is changed due to a style change
         * @private
         */
        _styleValueChanged: function(){}
    });
});