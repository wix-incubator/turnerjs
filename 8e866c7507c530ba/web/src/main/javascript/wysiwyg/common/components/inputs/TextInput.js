define.component('wysiwyg.viewer.components.inputs.TextInput', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    def.inherits('mobile.core.components.base.BaseComponent');

    def.traits(['wysiwyg.viewer.components.traits.ValidationSettings']);

    def.binds([ '_changeEventHandler', '_fireBlur', '_fireKeyUp']);

    def.dataTypes(['Text']);

    def.resources(["W.Config"]);

    def.states({
        'validation':[
            'valid',
            'invalid'
        ],
        'displayDevice':[
            'mobile'
        ]
    });

    def.skinParts({
        'input': {type: "htmlElement"},
        'errorMessage': {type: "htmlElement", "optional": true}
    });

    def.methods({
        initialize: function(compId, viewNode, argsObject){
            if(argsObject && argsObject.shouldRenderOnDisplay){
                this.startRenderingComponentOnDisplay();
            }

            this.parent(compId, viewNode, argsObject);

            this.addEvent(this.VALID_STATE_CHANGED_EVENT, function(isValid){
                this.setState(isValid ? 'valid': 'invalid', 'validation');
            }.bind(this));
            argsObject = argsObject || {};
            this._placeholder = argsObject.placeholder || null;
            this._isPasswordField = argsObject.passwordField || false;
            this._label = argsObject.label || "";
            if(this._getViewerMode() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this.setState('mobile', 'displayDevice');
            }
        },

        startRenderingComponentOnDisplay: function(){
            if(this._renderTriggers.indexOf(Constants.DisplayEvents.DISPLAY_CHANGED) < 0){
                this._renderTriggers.push(Constants.DisplayEvents.DISPLAY_CHANGED);
            }
        },

        _getViewerMode: function () {
            return this.resources.W.Config.env.getCurrentFrameDevice();
        },

        _onAllSkinPartsReady: function(){
            var input = this._skinParts.input;
            this.addEvent('inputChanged', function(evt){
                this.getDataItem().set('text', evt.value);
            }.bind(this));

            this._listenToInput();
            if(this._placeholder) {
                this.setPlaceholder(this._placeholder);
            }

            if (this._isPasswordField) {
                input.set("type", "password");
            }

            this.setLabel ( this._label );
        },

        render: function(){
            //workaround for issue #HEA-247
            if (!this._skinParts.input) {
                return;
            }

            var input = this._skinParts.input;
            var inputValue = input.get('value');
            var dataValue = this.getDataItem().get('text');
            //it might not be of same type
            //noinspection JSHint
            if(inputValue !== dataValue){
                input.set('value', dataValue);
            }
        },


        setError: function ( message ) {
            this.setValidationState(false);
            this._skinParts.errorMessage && this._skinParts.errorMessage.set("text", message);
        },

        setLabel: function ( label ) {
            if (this._skinParts.label){
                this._skinParts.label.appendText(label, "top");
            }
        },
        setFocus: function() {
            this._skinParts.input.focus();
        },
        selectText: function(from, to) {
            if (!from) {
                from = 0;
            }

            if (to != 0 && !to) {
                to = this._skinParts.input.value.length;
            }

            this._selectText(this._skinParts.input, from, to);
        },
        setTextContent : function(text) {
            this._skinParts.input.value = text;
        },
        _selectText: function(field, start, end) {
            //copied from - http://stackoverflow.com/questions/646611/programmatically-selecting-partial-text-in-an-input-field
            if( field.createTextRange ) {
                var selRange = field.createTextRange();
                selRange.collapse(true);
                selRange.moveStart('character', start);
                selRange.moveEnd('character', end);
                selRange.select();
                field.focus();
            } else if( field.setSelectionRange ) {
                field.focus();
                field.setSelectionRange(start, end);
            } else if( typeof field.selectionStart != 'undefined' ) {
                field.selectionStart = start;
                field.selectionEnd = end;
                field.focus();
            }
        },
        /**
         * Set a placeholder text
         * Uses Modernizr to load polyfill for non-supporting browsers
         * @param text
         */
        setPlaceholder: function(text){
            this._skinParts.input.set('placeholder', text);
            if(window.Modernizr && !window.Modernizr.input.placeholder){
                this._placeholderPolyFill();
            }
        },

        /**
         * The polyfill used by setPlaceholder, adds a focus and blur events,
         * adds a 'isPlaceholder' property when placeholder is displayed
         */
        _placeholderPolyFill: function(){
            function showPlaceholder(e){
                var input = e.target;
                if (input.get('value') === '' && input.get('placeholder')){
                    input.addClass('isPlaceholder');
                    input.set('value', input.get('placeholder'));
                }
            }
            function hidePlaceholder(e){
                var input = e.target;
                if (input.hasClass('isPlaceholder')){
                    input.removeClass('isPlaceholder');
                    input.set('value', '');
                }
            }

            if (!this.hasPlaceholder){
                this.hasPlaceholder = true;
                this._skinParts.input.addEvent('focus', hidePlaceholder);
                this._skinParts.input.addEvent('blur', showPlaceholder);
            }
            showPlaceholder({target: this._skinParts.input});
        },

        /**
         * @override
         * A handler for all change events, also contains a function to filter unsupported keystrokes
         * @param e
         */
        _changeEventHandler: function(e) {
            // ignore tab and shift keys
            if (e.code && !W.Utils.isInputKey(e.code)) {
                return;
            }

            var value = this._getValue();
            value = this.injects().Utils.convertToHtmlText(value);
            var event = {value: value, origEvent: e, compLogic: this};
            this.fireEvent('inputChanged', event);
        },

        // TODO: find why both methods cause infinite loop
        _fireBlur: function(e) {
            this.fireEvent(Constants.CoreEvents.BLUR, e);
        },

        _fireKeyUp: function(e) {
            this.fireEvent(Constants.CoreEvents.KEY_UP, e);
        },


        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            this._skinParts.input.addEvent(Constants.CoreEvents.KEY_UP, this._changeEventHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.KEY_UP, this._fireKeyUp);

            this._skinParts.input.addEvent(Constants.CoreEvents.CUT, this._changeEventHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.PASTE, this._changeEventHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.BLUR, this._fireBlur);
        },

        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._skinParts.input.removeEvent(Constants.CoreEvents.KEY_UP, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.KEY_UP, this._fireKeyUp);

            this._skinParts.input.removeEvent(Constants.CoreEvents.CUT, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.PASTE, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.BLUR, this._fireBlur);
        },

        /**
         * @override
         * Returns the value of the input field
         * Ignores the text if isPlaceholder is set
         */
        _getValue: function(){
            var input = this._skinParts.input;
            var value = '';
            if (!input.hasClass('isPlaceholder')) {
                value = input.get('value');
            }
            return value;
        },

        /**
         * @override
         * Cleans up this component: disconnect it from its view and clean up the view
         * Calls a function to disconnect all input events.
         */
        dispose: function(){
            this._stopListeningToInput();
            this.parent();
        }
    });
});