define.component('wysiwyg.editor.components.inputs.Radio', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.skinParts({
        radioContainer: {type: 'htmlElement'},
        label:  {type: 'htmlElement'},
        radio: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel'], 'display': ['inline', 'block'], 'editable': ['disabled', 'enabled']});

    def.methods({

        /**
         * @override
         * Initialize Input
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * labelText: the value of the label to show above/next to the field
         * name: the field name attribute
         * value: the radio buttons value to be returned
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._labelText = args.labelText || '';
            this._group = args.group || '';
            this._value = args.value || '';
            this._display = (args.display == 'inline')? args.display : 'block';
        },
        /**
         * @override
         */
        render: function() {
            //Set label if present
            this.setLabel(this._labelText);
            //Set name
            this.setGroup(this._group);
            //Set display style
            this.setDisplay(this._display);
            //Set value
            this.setValue(this._value);

        },

        /**
         * @override
         * Set the value of the radio
         * @param value string
         */
        setValue: function(value){
            this._skinParts.radio.set('value', value);
        },
        /**
         * @override
         * Returns the value of the input field
         */
        getValue: function(){
            return this._skinParts.radio.get('value');
        },
        /**
         * Check or un-check the box
         * @param value True/False
         */
        setChecked: function(value){
            if (value){
                this._skinParts.radio.set('checked', 'checked');
            }else{
                this._skinParts.radio.erase('checked');
            }
        },
        /**
         * Get the checked status of the box
         */
        getChecked: function(){
            return !!this._skinParts.radio.get('checked');
        },
        setDisplay: function(display){
            if (display == 'inline'){
                this.setState('inline', 'display');
            }else{
                this.setState('block', 'display');
            }
        },
        /**
         * Set the name of the input.
         * @param group
         */
        setGroup: function(group){
            this._skinParts.radio.set('name', group);
        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.radio.removeAttribute('disabled');
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            this._skinParts.radio.setAttribute('disabled', 'disabled');
        },

        /**
         * A handler for all change events, also contains a function to filter unsupported keystrokes
         * @param e
         */
        _changeEventHandler: function(e) {
            this.parent(e);
        },
        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            //TODO: Can these change events be deleted?
            //this._skinParts.radio.addEvent('keyup', this._changeEventHandler);
            //this._skinParts.radio.addEvent('cut', this._changeEventHandler);
            //this._skinParts.radio.addEvent('paste', this._changeEventHandler);
            this._skinParts.radio.addEvent('change', this._changeEventHandler);
            this._skinParts.radio.addEvent('click', this._changeEventHandler);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            //TODO: Can these change events be deleted?
            //this._skinParts.radio.removeEvent('keyup', this._changeEventHandler);
            //this._skinParts.radio.removeEvent('cut', this._changeEventHandler);
            //this._skinParts.radio.removeEvent('paste', this._changeEventHandler);
            this._skinParts.radio.removeEvent('change', this._changeEventHandler);
            this._skinParts.radio.removeEvent('click', this._changeEventHandler);
        }
    });
});