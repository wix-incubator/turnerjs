define.component('wysiwyg.editor.components.inputs.CheckBox', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.binds(['_changeEventHandler']);

    def.states({
        'label': ['hasLabel', 'noLabel']
    });

    def.skinParts({
        label:  {type: 'htmlElement'},
        checkBox: {type: 'htmlElement'}
    });

    def.methods({
        /**
         * @override
         * @param value
         */
        setValue: function(value){
            if (typeof value == 'string') {
                this._skinParts.checkBox.setProperty('value', value);
            }
            this.setChecked(value);
        },
        /**
         * Get the state of the checkbox
         * @returns {Boolean}
         */
        getValue: function(){
            return this.getChecked();
        },
        /**
         * Get the value of the checkbox as a string
         * @returns {String}
         */
        getValueString: function(){
            return this._skinParts.checkBox.getProperty('value');
        },
        /**
         * Set the state of the checkbox
         * @param value true/false
         */
        setChecked: function(value){
            if (value){
                this._skinParts.checkBox.setProperty('checked', 'checked');
            }else{
                this._skinParts.checkBox.removeProperty('checked');
            }
        },
        /**
         * Returns the value of the input field
         */
        getChecked: function(){
            return !!this._skinParts.checkBox.getProperty('checked');
        },

        toggleChecked: function(){
            var curValue = this.getChecked();
            this.setChecked(!curValue);
        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.checkBox.removeAttribute('disabled');
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            this._skinParts.checkBox.setAttribute('disabled', 'disabled');
        },


        /**
         * @override
         * A handler for all change events, also contains a function to filter unsupported keystrokes
         * @param e
         * @return true/false
         */
        _changeEventHandler: function(e) {
            var value = this.getValue();
            var valueString = this.getValueString();
            var event = {value: value, valueString: valueString, origEvent: e, compLogic: this};
            this.fireEvent('inputChanged', event);
        },
        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            this._skinParts.checkBox.addEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._skinParts.checkBox.removeEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
        }
    });
});