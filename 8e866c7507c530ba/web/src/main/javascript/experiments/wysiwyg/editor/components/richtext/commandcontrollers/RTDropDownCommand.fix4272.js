define.experiment.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTDropDownCommand.fix4272', function(classDefinition, experimentStrategy) {
    var def = classDefinition;

    var strategy = experimentStrategy;

    def.methods({
        _getOptionToDisplay: function(currentValue) {
            var selectedOption, isDefault = false;

            if (currentValue === CKEDITOR.TRISTATE_OFF || currentValue === CKEDITOR.TRISTATE_DISABLED){
                currentValue = this._getDefaultValueAccordingToStyle();
                isDefault = true;
            }
            selectedOption = this._getOptionFromMenu(currentValue);
            var optionNotInDropDown = !selectedOption;

            if (optionNotInDropDown && !this._isFixedMenu){//get cached option or create a new one
                selectedOption = this._getOptionNotFromMenu(currentValue);
            }
            if (selectedOption) {
                if (isDefault) {
                    selectedOption._data.isDefault = true;
                } else if (!selectedOption._data.isDefault) {
                    //verify that the isDefault is not undefined
                    selectedOption._data.isDefault = false;
                }
            }
            return selectedOption;
        }
    });

});
