/**
 * @Class wysiwyg.editor.components.inputs.Slider
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.Slider', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.binds(['_changeEventHandler', '_stopListeningToInput', '_listenToInput', '_sliderMouseDownHandler', '_sliderMouseUpHandler', '_sliderMouseMoveHandler']);

    def.skinParts({
        label: {type: 'htmlElement'},
        input: {type: 'wysiwyg.editor.components.inputs.TickerInput', hookMethod:'_setInputParams'},
        sliderContainer: {type: 'htmlElement'},
        leftCorner: {type: 'htmlElement'},
        rightCorner: {type: 'htmlElement'},
        sliderKnob: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel'] });

    /**
     * @lends wysiwyg.editor.components.inputs.Slider
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
            this.max = (typeof args.max === 'undefined')? Constants.Inputs.Default.SLIDER_MAX : args.max;
            this.min = args.min || Constants.Inputs.Default.MIN;
            this.step = args.step || Constants.Inputs.Default.STEP;
            this._labelText = args.labelText || '';
            this._hideInput = args.hideInput|| false;
            this._noFloats = args.noFloats || false;
            this._updateOnEnd = args.updateOnEnd || false; // prevent frequent updates while dragging
            this._leftIcon = args.leftIcon;
            this._rightIcon = args.rightIcon;
            this._value = 0;
            this._units = args.units || '';
            if (this.step > this.max || this.step <= 0){
                //TODO: ERROR
                LOG.reportError();
            }
            if (this.min > this.max){
                //TODO: ERROR
                LOG.reportError();
            }
        },
        _setInputParams: function(definition){
            definition.argObject.min = this.min;
            definition.argObject.max = this.max;
            definition.argObject.step = this.step;
            definition.argObject.isFireChangeOnBlur = true;
            definition.argObject.isFireChangeOnEnter = true;
            // Make room for the icons (no way to do it through the skin...)
            if (this._rightIcon && this._leftIcon) {
                definition.argObject.inputWidth = '4em';
            }
            return definition;
        },
        /**
         * @override
         */
        render: function() {
            //Set label if present
            this.parent();

            var num = this._value;
            var percent = this._percentFromValue(num);

            this._skinParts.sliderKnob.setStyle('left', percent + '%');


        },
        _onAllSkinPartsReady: function(){
            var iconFullUrl, bgValue;
            this.parent();
            //Show / Hide input
            if (this._hideInput){
                this._skinParts.input.collapse();
            }
            this._skinParts.input.setValue(this._value);
            this._skinParts.input.setUnits(this._units);
            // Make room for the units (no way to do it through the skin...)
            if (this._units){
                this._skinParts.sliderContainer.setStyle('margin-right', '7em');
            }
            if (this._leftIcon) {
                iconFullUrl = this._buildIconFullUrl(this._leftIcon);
                bgValue = this._buildBgValueString(iconFullUrl);
                this._skinParts.leftIcon.setStyle('background', bgValue);
            }
            if (this._rightIcon) {
                iconFullUrl = this._buildIconFullUrl(this._rightIcon);
                bgValue = this._buildBgValueString(iconFullUrl);
                this._skinParts.rightIcon.setStyle('background', bgValue);
            }
        },

        _buildIconFullUrl: function(iconUrl) {
            return W.Theme.getProperty("WEB_THEME_DIRECTORY") + iconUrl;
        },

        _buildBgValueString: function(iconFullUrl) {
            return [
                'url(' + iconFullUrl + ')',
                'no-repeat',
                '0',
                '0'
            ].join(' ');
        },

        /**
         * @override
         * Set the value of the input field
         * @param value The number or percentage to set
         */
        setValue: function(value){
            this._value = this._normalizeNumber(value);
            this._skinParts.input.setValue(this._value);
            this._renderIfReady();
        },
        /**
         * @override
         * Returns the value of the input field
         */
        getValue: function(){
            var inputValue = this._skinParts.input.getValue();
            var normalizedValue = this._normalizeNumber(inputValue);
            if (normalizedValue != this._value || normalizedValue != inputValue){
                this.setValue(normalizedValue);
            }
            return this._value;
        },
        /**
         * Round number is set to round
         * @param value
         */
        _roundIfNoFloats: function(value){
            if (this._noFloats) {
                return Math.round(value);
            } else {
                return value;
            }
        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.input.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            this._skinParts.input.disable();
        },

        _normalizeNumber: function(input){
            var num = this._roundIfNoFloats(Number(input));
            // Set num to 0 if NaN
            if (isNaN(num)){
                num = 0;
            }
            // Align number to steps
            if (num % this.step){
                num = Math.round(num / this.step) * this.step;
            }

            if (num > this.max){
                num = this.max;
            }
            else
            if (num < this.min){
                num = this.min;
            }
            if (num != Math.round(num)) {
                num = num.toFixed(2);
            }

            return num;

        },
        /**
         * Convert a number to it's percentage equivalent
         * @param {Number} num
         */
        _percentFromValue: function(num){
            var range = this.max - this.min;
            //var current = num + (range - this.max) ;
            var current = num - this.min;
            var percent = (current / range) * 100;

            return percent;
        },
        _valueFromPercent: function(percent){
            var range = this.max - this.min;
            var current = (percent * range) / 100;
            var num = current + this.min;

            return num;
        },
        _sliderMouseDownHandler: function(e){
            document.on(Constants.CoreEvents.MOUSE_MOVE, this, this._sliderMouseMoveHandler);
            document.on(Constants.CoreEvents.MOUSE_UP, this, this._sliderMouseUpHandler);
            var slider = this._skinParts.sliderContainer;

            this._sliderPos = {
                mouseX: e.page.x,
                sliderX: slider.getPosition().x,
                sliderWidth: slider.getWidth()
            };

            this._sliderMouseMoveHandler(e);
        },

        _sliderMouseMoveHandler: function(e){
            this._sliderPos.mouseX = e.page.x;
            var percent = ((this._sliderPos.mouseX - this._sliderPos.sliderX)/this._sliderPos.sliderWidth) * 100;
            this.setValue(this._valueFromPercent(percent));

            if (!this._updateOnEnd) { // prevent frequent updates while dragging
                this._changeEventHandler(e);
            }
        },

        _sliderMouseUpHandler: function(e){
            if (!this._hideInput){
                this._skinParts.input.setFocus();
            }

            if (this._updateOnEnd) { //update at end of slide
                this._changeEventHandler(e);
            }
            this.trigger('sliderMouseUp', {value: this.getValue()});

            document.off(Constants.CoreEvents.MOUSE_MOVE, this, this._sliderMouseMoveHandler);
            document.off(Constants.CoreEvents.MOUSE_UP, this, this._sliderMouseUpHandler);
        },
        /**
         * @override
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
            this._skinParts.input.addEvent('inputChanged', this._changeEventHandler);
            this._skinParts.sliderContainer.on(Constants.CoreEvents.MOUSE_DOWN, this, this._sliderMouseDownHandler);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            document.off(Constants.CoreEvents.MOUSE_MOVE, this, this._sliderMouseMoveHandler);
            document.off(Constants.CoreEvents.MOUSE_UP, this, this._sliderMouseUpHandler);
            this._skinParts.input.removeEvent('inputChanged', this._changeEventHandler);
        }
    });
});