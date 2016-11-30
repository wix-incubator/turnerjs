define.experiment.Class('wysiwyg.common.components.dropdownmenu.viewer.traits.MenuPropertiesHandler.Dropdownmenu', function(classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition,
        strategy = experimentStrategy;

    def.methods({

        setMenuProperty: strategy.after(function(propertyItem, fieldName, fieldValue) {
            switch(fieldName) {
                case 'moreButtonLabel':
                    if (this._isMoreButtonVisible) {
                        this._handleMoreButtonLabelProperty(fieldValue);
                    }
                    break;
            }
        })
    });
});