define.Class('wysiwyg.editor.components.richtext.commandcontrollers.traits.RTStyleDependent', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.binds(['_updateDropDownAccordingToStyle']);

    def.resources(['W.Preview']);

    def.fields({
        _styleCommandComponent: null,
        _styleGetter:null
    });

    def.methods({
        initialize: function(commandInfo, controllerComponent) {
            this._styleGetter = commandInfo.styleGetter;
        },

        startListeningToStyleChange: function(component){
            this._styleCommandComponent = component;
            this._styleCommandComponent.addEvent('presentedStyleChanged', this._updateDropDownAccordingToStyle);
        },

        _updateDropDownAccordingToStyle: function() {
            var value = this._getDefaultValueAccordingToStyle();
            if(value){
                this._styleValueChanged(value);
            }
            if (this._isDefaultOptionSelected()) {
                this._setControllerSelection(value);
            }
        },

        _getDefaultValueAccordingToStyle: function() {
            var currStyleClass = this._styleCommandComponent.getSelectedOption().get('cssClass');
            if (!currStyleClass) {
                return;
            }
            var currentStyle = this.resources.W.Preview.getPreviewManagers().Theme.getProperty(currStyleClass);
            var defaultLabel = currentStyle[this._styleGetter]();
            return defaultLabel && defaultLabel.trim();
        }
    });
});