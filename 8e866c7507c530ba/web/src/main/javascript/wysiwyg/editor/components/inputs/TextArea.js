/**
 * @Class wysiwyg.editor.components.inputs.TextArea
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.TextArea', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.traits(['wysiwyg.editor.components.inputs.traits.InputComponentWithValidators']);

    def.binds(['_checkMaxLength','_setLastValidInput','_revertToLastValidInputIfCurrentInvalid']);

    def.skinParts({
        label: {type: 'htmlElement'},
        textarea: {type: 'htmlElement'},
        message: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel'], 'validation': ['invalid']});

    /**
     * @lends wysiwyg.editor.components.inputs.TextArea
     */
    def.methods({
        /**
         * @override
         * Initialize TextArea
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * presetText: a pre set text value
         * labelText: the value of the label to show above/next to the field
         * maxLength: the maximum number of characters
         * minLength: the minimum number of characters
         * validators: an array of functions validate the field against, each function should return an error message or null for success;
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._labelText = args.labelText || '';
            this.setValidators(args.validatorArgs || {});
            this._height = args.height || null;
            this._width = args.width || null;
            this._maxLength = args.maxLength || Constants.Inputs.Default.MAX_LENGTH;
            this._stylesForSkinparts = args.stylesForSkinparts;
        },
        /**
         * @override
         */
        render: function() {
            //Set label if present
            this.setLabel(this._labelText);
            this.setMaxLength(this._maxLength);
            if (this.getState("validation") == "invalid") {
                this.setState('invalid', 'validation');
            } else {
                this._resetInvalidState();
            }
        },

        _onAllSkinPartsReady:function(){
            if (this._height) {
                this._skinParts.textarea.setStyle('height', this._height);
                this._skinParts.textarea.setStyle('max-height', this._height);
                this._skinParts.textarea.setStyle('min-height', this._height);
            }
            if (this._width) {
                this._skinParts.textarea.setStyle('width', this._width);
                this._skinParts.textarea.setStyle('max-width', this._width);
                this._skinParts.textarea.setStyle('min-width', this._width);
            }

            if (Browser.ie) { // IE doesn't support the "maxlength" property on TextAreas, need to do it by myself
                this._skinParts.textarea.addEvent(Constants.CoreEvents.KEY_UP, this._checkMaxLength);
            }
            if(this._stylesForSkinparts){
                _.forOwn(this._stylesForSkinparts, function(styles, skinPartName){
                    if(_.has(this._skinParts, skinPartName)){
                        this._skinParts[skinPartName].setStyles(styles);
                    }
                }, this);
            }
            this._skinParts.textarea.addEvent('focus', this._setLastValidInput);
            this._skinParts.textarea.addEvent('blur', this._revertToLastValidInputIfCurrentInvalid);
            this.addToolTip();
        },

        _setLastValidInput: function() {
            this._lastValidInput = this.getValue();
        },

        //this behavior was taken from Input.js
        //not sure it's the best. I'd prefer to just take out the bad chars, but we'll leave it at that for now
        _revertToLastValidInputIfCurrentInvalid: function() {
            if (this.getTextAreaValidationErrorMessage()) {
                this.setValue(this._lastValidInput, '');
                this._resetInvalidState();
            }
        },

        setMaxLength: function(maxLength) {
            this._maxLength = maxLength;
            this._skinParts.textarea.setProperty('maxlength', maxLength);
        },
        setFocus: function(){
            this._skinParts.textarea.focus();
        },
        /**
         * @override
         * Set the value of the textarea field
         * @param text The text to set
         * @param isPreset optional, if set to true the isPreset flag is set to true
         */
        setValue: function(text, isPreset){
            var textarea = this._skinParts.textarea;
            textarea.set('value', text);
            if (isPreset){
                textarea.set('isPreset', 'true');
            }else{
                textarea.erase('isPreset');
            }
        },

        /**
         * @override
         * Returns the value of the textarea field
         */
        getValue: function(){
            var textarea = this._skinParts.textarea;
            return textarea.get('value');
        },

        getTextAreaValidationErrorMessage:function() {
            var textareaContent = this.getValue();
            var errorMsg = '';
            if (this._validators.length) {
                for (var i = 0,  j = this._validators.length; i < j; i++) {
                    var validator = this._validators[i];
                    errorMsg = validator(textareaContent);
                    if (errorMsg) {
                        break;
                    }
                }
            }
            return errorMsg;
        },
        _showValidationMessage: function(message){
            this.setState('invalid', 'validation');
            if (this._skinParts.message){
                this._skinParts.message.set('text', message);
                this._skinParts.message.uncollapse();
            }
        },
        _resetInvalidState: function(){
            this.removeState('invalid', 'validation');
            if (this._skinParts.message){
                this._skinParts.message.set('text', '');
                this._skinParts.message.collapse();
            }
        },
        /**
         * @override
         * A handler for all change events, also contains a function to filter unsupported keystrokes
         * @param e
         */
        _changeEventHandler: function(e) {
            e = e || {};
            // DONT Submit on Enter
            if (e.code == 13){
                return false;
            }
            // ignore tab and shift keys
            if (e.code && !W.Utils.isInputKey(e.code)){
                return;
            }

            var validationMessage = this.getTextAreaValidationErrorMessage();
            if (validationMessage){
                this._showValidationMessage(validationMessage);
                this._validationFailCallback(validationMessage);
                return false;
            }else{
                this._resetInvalidState();
                this._validationOkCallback();
                this._setLastValidInput();
            }

            //Remove preset flag on change
            this._skinParts.textarea.set('isPreset', '');

            this.parent(e);

        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.textarea.removeAttribute('disabled');
        },


        _checkMaxLength: function(e) {
            var textValue = this._skinParts.textarea.get('value');
            var textLen = textValue.length;
            if (textValue.length > this._maxLength) {
                var diff = this._maxLength - textLen ;
                textValue = textValue.slice(0, diff);
                this._skinParts.textarea.set('value', textValue);
            }
        },


        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            this._skinParts.textarea.setAttribute('disabled', 'disabled');
        },

        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            this._skinParts.textarea.addEvent(Constants.CoreEvents.KEY_UP, this._changeEventHandler);
            this._skinParts.textarea.addEvent(Constants.CoreEvents.CUT, this._changeEventHandler);
            this._skinParts.textarea.addEvent(Constants.CoreEvents.PASTE, this._changeEventHandler);
            this._skinParts.textarea.addEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._skinParts.textarea.removeEvent(Constants.CoreEvents.KEY_UP, this._changeEventHandler);
            this._skinParts.textarea.removeEvent(Constants.CoreEvents.CUT, this._changeEventHandler);
            this._skinParts.textarea.removeEvent(Constants.CoreEvents.PASTE, this._changeEventHandler);
            this._skinParts.textarea.removeEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
            if (Browser.ie) { // see above
                this._skinParts.textarea.removeEvent(Constants.CoreEvents.KEY_UP, this._checkMaxLength);
            }
        }
    });
});