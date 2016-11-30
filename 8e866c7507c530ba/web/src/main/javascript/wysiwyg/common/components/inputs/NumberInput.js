define.component('wysiwyg.viewer.components.inputs.NumberInput', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.propertiesSchemaType('NumberInputProperties');

    def.inherits('wysiwyg.viewer.components.inputs.TextInput');

    def.fields({
        _origValue:null,
        _prevValue:null,
        _valueChanged:true
    });

    def.methods({
        initialize: function(compId, viewNode, argsObject){
             this.parent(compId, viewNode, argsObject);
        },

        _onAllSkinPartsReady:function () {
            this.parent();
            this._origValue = this._getValue();
            this._prevValue = this._origValue;
            this._skinParts.input.setAttribute('min', this.getComponentProperty('minValue'));
            this._skinParts.input.setAttribute('max', this.getComponentProperty('maxValue'));
        },

        _onDataChange: function(dataItem, changedField, newValue, oldValue) {
            if (changedField == 'text') {
                this._prevValue = oldValue.text;
                this._origValue = newValue.text;
                var input = this._skinParts.input;
                input.set('value', this._origValue);
                this._valueChanged = true;
            }
            this.parent(dataItem, changedField, newValue);
        },

        /**
         * @override
         * A handler for all change events, also contains a function to filter unsupported keystrokes
         * @param e
         */
        _changeEventHandler:function (e) {
            // ignore tab and shift keys an
            if (e.code && !W.Utils.isInputKey(e.code)) {
                return;
            }

            var value = this._getValue();
            var validValue = this._getValidValue();
            if (value && value != validValue && this._valueChanged) {
                this._valueChanged = false;
                this.fireEvent('validationFailed', {evt:e, value:value, validValue:validValue});
            }

            else {
                //see if the original value is the same as the newly set value
                this._prevValue = validValue;
                validValue = this.injects().Utils.convertToHtmlText(validValue);
                var event = {value:validValue, origEvent:e, compLogic:this};
                this.fireEvent('inputChanged', event);
            }
        },

        // TODO: find why both methods cause infinite loop
        _fireBlur:function (e) {
            this._setValidValue();
            this.parent(e);
        },

        _fireKeyUp:function (e) {
            if (e.code == '13') { //enter
                this._setValidValue();
            }
            this.parent(e);
        },

        _getValidValue:function () {
            var value = this._getValue();

            if (!value) {
                value = this._origValue;
            }
            else if (value < this.getComponentProperty('minValue')) {
                value = this.getComponentProperty('minValue');
            }
            else if (value > this.getComponentProperty('maxValue')) {
                value = this.getComponentProperty('maxValue');
            }

            return value;
        },

        _setValidValue:function () {
            var input = this._skinParts.input;
            input.set('value', this._getValidValue());
            this._valueChanged = true;
        }
    });
});

