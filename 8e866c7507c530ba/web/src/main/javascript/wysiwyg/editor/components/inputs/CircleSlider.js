define.component('wysiwyg.editor.components.inputs.CircleSlider', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    def.skinParts({
        label: {type: 'htmlElement'},
        input: {type: 'wysiwyg.editor.components.inputs.TickerInput', hookMethod:'_setInputParams'},
        sliderContainer: {type: 'htmlElement'},
        sliderKnob: {type: 'htmlElement'}
    });
    def.inherits('wysiwyg.editor.components.inputs.BaseInput');
    def.states({'label': ['hasLabel', 'noLabel'] });
    def.binds(['_changeEventHandler', '_stopListeningToInput', '_listenToInput', '_sliderMouseDownHandler', '_sliderMouseUpHandler', '_sliderMouseMoveHandler']);
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
            this._max = 359;
            this._circle = 360;
            this._min = 0;
            this._step = 1;
            this._labelText = args.labelText || '';
            this._hideInput = args.hideInput|| false;
            //this._noFloats = args.noFloats || false;
            this._updateOnEnd = args.updateOnEnd || false; // prevent frequent updates while dragging
            this._value = 0;
            this._units = '&deg;';
        },
        _setInputParams: function(definition){
            definition.argObject.min = this._min;
            definition.argObject.max = this._max;
            definition.argObject.step = this._step;
            definition.argObject.isFireChangeOnBlur = true;
            definition.argObject.isFireChangeOnEnter = true;
            return definition;
        },
        /**
         * @override
         */
        render: function() {
            //Set label if present
            this.parent();
            var angle = this._value;
            this._setKnobPosition(angle);
        },

        _onAllSkinPartsReady: function(){
            this.parent();
            this._radius = this._skinParts.sliderContainer.getSize().y/2 - 1;

            //Show / Hide input
            if (this._hideInput){
                this._skinParts.input.collapse();
            }
            this._skinParts.input.setValue(this._value);
            this._skinParts.input.setUnits(this._units);

        },
        /**
         * @override
         * Set the value of the input field
         * @param value The number or percentage to set
         */
        setValue: function(value){
            this._value = this._modulo(value, this._circle);
            this._skinParts.input.setValue(this._value);
            this._setKnobPosition(this._value);
        },
        /**
         * @override
         * Returns the value of the input field
         */
        getValue: function(){
            var inputValue = this._modulo(this._skinParts.input.getValue(), this._circle);
            if (this._value != inputValue){
                this.setValue(inputValue);
            }
            return this._value;
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

        _setKnobPosition: function(angle){
            angle = this._modulo(180 - angle, this._circle);
            var radius = this._radius;
            this._skinParts.sliderKnob.setStyles({
                top:  radius + (radius * Math.cos(this._deg2rad(angle))),
                left: radius + (radius * Math.sin(this._deg2rad(angle)))
            });
        },

        _getCalculatedAngle:function (target, center) { //), source){
            target = target || {};
            target.x = target.x || 0;
            target.y = target.y || 0;

            center = center || {};
            center.x = center.x || 0;
            center.y = center.y || 0;

            // Assume source is always 90deg from center
            var source = {
                x:center.x,
                y:center.y - Math.sqrt(Math.abs(target.x - center.x) * Math.abs(target.x - center.x) +
                                       Math.abs(target.y - center.y) * Math.abs(target.y - center.y))
            };
            this._angle = this._rad2deg(2 * Math.atan2(target.y - source.y, target.x - source.x));
            return Math.round(this._angle);
        },

        _sliderMouseDownHandler: function(event){
            this._mouse = event.page;
            document.removeEvent(Constants.CoreEvents.MOUSE_MOVE, this._sliderMouseMoveHandler);
            document.removeEvent(Constants.CoreEvents.MOUSE_UP, this._sliderMouseUpHandler);

            this._sliderMouseMoveHandler(event);
            document.addEvent(Constants.CoreEvents.MOUSE_MOVE, this._sliderMouseMoveHandler);
            document.addEvent(Constants.CoreEvents.MOUSE_UP, this._sliderMouseUpHandler);
        },

        _sliderMouseMoveHandler: function(event){
            var mouse = event.page || this._mouse;
            var slider = this._skinParts.sliderContainer.getPosition();
            var target = {x: mouse.x - slider.x, y: mouse.y - slider.y};
            var center = {x: this._radius, y: this._radius};
            var angle = this._getCalculatedAngle(target, center);
            this.setValue(angle);

            if (!this._updateOnEnd) { // prevent frequent updates while dragging
                this._changeEventHandler(event);
            }
        },

        _deg2rad:function (deg) {
            return deg * Math.PI / 180;
        },
        _rad2deg:function (rad) {
            return rad * 180 / Math.PI;
        },
        _modulo: function(num, mod){
            return (((num % mod) + mod) % mod);
        },
        _sliderMouseUpHandler: function(e){
            if (!this._hideInput){
                this._skinParts.input.setFocus();
            }

            if (this._updateOnEnd) { //update at end of slide
                this._changeEventHandler(e);
            }

            document.removeEvent(Constants.CoreEvents.MOUSE_MOVE, this._sliderMouseMoveHandler);
            document.removeEvent(Constants.CoreEvents.MOUSE_UP, this._sliderMouseUpHandler);
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
            this._skinParts.sliderContainer.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._sliderMouseDownHandler);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._skinParts.input.removeEvent('inputChanged', this._changeEventHandler);
            this._skinParts.sliderContainer.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._sliderMouseDownHandler);
            document.removeEvent(Constants.CoreEvents.MOUSE_UP, this._sliderMouseUpHandler);
            document.removeEvent(Constants.CoreEvents.MOUSE_MOVE, this._sliderMouseMoveHandler);
        }
    });

});
