define.component('wysiwyg.editor.components.inputs.ButtonInput', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.binds(['_tunnelButtonEvent']);

    def.states({
        'label': ['hasLabel', 'noLabel'],
        'editable': ['disabled', 'enabled']
    });

    def.skinParts({
        label : {type: 'htmlElement'},
        button: {type: 'wysiwyg.editor.components.WButton'}
    });

    def.methods({
        /**
         * Initialize Input
         * Each input should get it's parameters through 'args'
         * 'labelText' is the only mandatory parameter
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * labelText: the value of the label to show above/next to the field
         */
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            args = args || {};
            this._buttonLabel = args.buttonLabel || '';
            this._toggleMode = args.toggleMode || false;
            this._iconSrc = args.iconSrc || '';
            this._value = '';
            this._spriteOffset = args.spriteOffset || {x: '50%', y: '50%'};
            this._minWidth = args.minWidth || 0;
            this._iconSize = args.iconSize || null;
            this._command = args.command;
            this._commandParameter = args.commandParameter;
        },

        /**
         * Render the component,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function(){
            this.parent();

            this._skinParts.button.setParameters({
                label           : this._buttonLabel,
                toggleMode      : this._toggleMode,
                command         : this._command,
                commandParameter: this._commandParameter
            }, true);

            if(this._skinParts.button.setMinWidth){
                this._skinParts.button.setMinWidth(this._minWidth);
            }

            if(this._skinParts.button.setIcon){
                this._skinParts.button.setIcon(this._iconSrc, this._iconSize, this._spriteOffset);
            }

            this._skinParts.button.setLabel(this._buttonLabel);
        },

        _onAllSkinPartsReady: function(){
            this.parent();
            if(this.isEnabled()){
                this._skinParts.button.enable();
            } else {
                this._skinParts.button.disable();
            }
            this.setIcon(this._iconSrc);
        },

        /**
         * Set the value of the input field, MANDATORY
         * @param value The text to set
         */
        setValue: function(value){
            this._value = value;
        },

        /**
         * Returns the value of the input field
         */
        getValue: function(){
            return this._value;
        },

        /**
         * Sets the text that is on the button
         */
        setButtonLabel: function(label){
            this._buttonLabel = label;
            if (this._skinParts && this._skinParts.button) {
                this._skinParts.button.setLabel(label);
            }
        },

        getButtonState: function(){
            this._skinParts.button.getState();
        },

        toggleSelected: function(force){
            this._skinParts.button.toggleSelected(force);
        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this._skinParts.button.enable();
            this._listenToInput();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this._skinParts.button.disable();
            this._stopListeningToInput();
        },

        setToggleMode: function(mode){
            this._toggleMode = !!mode;
            this._skinParts.button.setToggleMode(this._toggleMode);
        },

        setIcon: function(src){
            if(src){
                this._iconSrc = src;
                this._skinParts.button.setIcon(this._iconSrc);
            }
        },

        setFocus: function(){
            this._skinParts.button.setFocus();
        },

        _tunnelButtonEvent: function(e){
            var type = e.type;
            switch(e.type){
                case 'mouseover':
                    type = 'over';
                    break;
                case 'mouseout':
                    type = 'up';
                    break;
            }
            var event = {value: this._value, origEvent: e, compLogic: this};
            this.fireEvent(type, event);
            this.trigger(type, event);
        },

        /**
         * Assign change events
         */
        _listenToInput: function(){
            this._skinParts.button.addEvent('click', this._changeEventHandler);
            this._skinParts.button.addEvent('click', this._tunnelButtonEvent);
            this._skinParts.button.addEvent('over', this._tunnelButtonEvent);
            this._skinParts.button.addEvent('up', this._tunnelButtonEvent);
        },

        /**
         * Remove change events
         */
        _stopListeningToInput: function(){
            this._skinParts.button.removeEvent('click', this._changeEventHandler);
            this._skinParts.button.removeEvent('click', this._tunnelButtonEvent);
            this._skinParts.button.removeEvent('over', this._tunnelButtonEvent);
            this._skinParts.button.removeEvent('up', this._tunnelButtonEvent);
        }

    });

});