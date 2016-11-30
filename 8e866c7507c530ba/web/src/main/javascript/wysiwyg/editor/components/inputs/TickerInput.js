/**
 * @Class wysiwyg.editor.components.inputs.TickerInput
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.TickerInput', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.binds(['_changeEventHandler', '_stopListeningToInput', '_listenToInput', '_keyDownHandler']);

    def.skinParts({
        label: {type: 'htmlElement'},
        input: {type: 'htmlElement'},
        units: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel'] });

    /**
     * @lends wysiwyg.editor.components.inputs.TickerInput
     */
    def.methods({
        /**
         * @override
         * Initialize Input
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * labelText: the value of the label to show above/next to the field
         * max: the maximum number
         * min: the minimum number
         * step: step
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this.max = (typeof args.max == 'undefined')? Constants.Inputs.Default.TICKER_MAX : args.max;
            this.min = args.min || Constants.Inputs.Default.MIN;
            this.step = args.step || Constants.Inputs.Default.STEP;
            this._inputWidth = args.inputWidth;
            this._isInputTypeNumber = Modernizr && Modernizr.inputtypes.number;
            this._labelText = args.labelText || '';
            this._value = 0;
            this._units = args.units || '';
            this._isFireChangeOnBlur = args.isFireChangeOnBlur || false;
            this._isFireChangeOnEnter = args.isFireChangeOnEnter || false;
            if (this.step > this.max || this.step <= 0){
                //TODO: ERROR
                LOG.reportError();
            }
            if (this.min > this.max){
                //TODO: ERROR
                LOG.reportError();
            }
        },
        _onAllSkinPartsReady: function(){
            if (this._isInputTypeNumber){
                this._skinParts.input.setProperties({
                    step: this.step,
                    min: this.min,
                    max: this.max
                });
            }
            if (this._inputWidth) {
                this._skinParts.input.setStyle('width', this._inputWidth);
            }
            this.setUnits(this._units);
        },
        /**
         * @override
         */
        render: function() {
            //Set label if present
            this.parent();

        },
        setFocus: function(){
            this._skinParts.input.focus();
        },
        setUnits: function(units){
            this._units = units || '';
            if (units){
                this._skinParts.units.uncollapse();
                this._skinParts.units.set('html', units);
            }
            else{
                this._skinParts.units.collapse();
            }
        },
        /**
         * @override
         * Set the value of the input field
         * @param value The number or percentage to set
         * @param isPreset optional, if set to true the isPreset flag is set to true
         */
        setValue: function(value, isPreset){

            var input = this._skinParts.input;

            //Zerofy non number values
            if (isNaN(value)){
                if (!isNaN(parseFloat(value))) {
                    value = parseFloat(value);
                }
                else if (value != '-' || value != '.') {
                    value = 0;
                }
            }

            input.set('value', value);
            if (isPreset){
                input.set('isPreset', 'true');
            }else{
                input.erase('isPreset');
            }
            this._value = value;
        },
        /**
         * @override
         * Returns the value of the input field
         */
        getValue: function(){
            var input = this._skinParts.input;
            this._value = input.get('value');
            if (isNaN(this._value)){
                return 0;
            }
            return this._value;
        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.input.removeAttribute('disabled');
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            this._skinParts.input.setAttribute('disabled', 'disabled');
        },

        _keyDownHandler: function(e){
            switch (e.code){
                case 40: // down arrow
                    // Sub
                    if (!this._isInputTypeNumber){
                        this.setValue(Number(this.getValue()) - this.step);
                    }
                    this._changeEventHandler(e);
                    return true;
                case 38: // up arrow
                    // Add, use browser if it supports input type=number
                    if (!this._isInputTypeNumber){
                        this.setValue(Number(this.getValue()) + this.step);
                    }
                    this._changeEventHandler(e);
                    return true;
                case 13: //Enter
                    if (this._isFireChangeOnEnter){
                        this._changeEventHandler(e);
                        return true;
                    }
            }

        },
        _changeEventHandler: function(e) {
            //Remove preset flag on change
            this._skinParts.input.set('isPreset', '');
            this.parent(e);
        },
        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            this._skinParts.input.addEvent(Constants.CoreEvents.KEY_DOWN, this._keyDownHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.MOUSE_UP, this._changeEventHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this._changeEventHandler);
            if (this._isFireChangeOnBlur){
                this._skinParts.input.addEvent(Constants.CoreEvents.BLUR, this._changeEventHandler);
            }else{
                this._skinParts.input.addEvent(Constants.CoreEvents.KEY_UP, this._changeEventHandler);
                this._skinParts.input.addEvent(Constants.CoreEvents.CUT, this._changeEventHandler);
                this._skinParts.input.addEvent(Constants.CoreEvents.PASTE, this._changeEventHandler);
                this._skinParts.input.addEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
            }
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._skinParts.input.removeEvent(Constants.CoreEvents.KEY_DOWN, this._keyDownHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.KEY_UP, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.CUT, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.PASTE, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.MOUSE_UP, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.MOUSE_WHEEL, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.BLUR, this._changeEventHandler);

        }
    });
});