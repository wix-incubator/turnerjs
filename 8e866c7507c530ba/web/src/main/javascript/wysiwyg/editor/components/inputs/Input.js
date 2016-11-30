define.component('wysiwyg.editor.components.inputs.Input', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.traits(['wysiwyg.editor.components.inputs.traits.InputComponentWithValidators']);

    def.binds([
        '_fireBlur',
        '_fireKeyUp',
        '_setLastValidInput',
        '_revertToLastValidInputIfCurrentInvalid',
        '_onFocus'
    ]);

    def.skinParts({
        label: {type: 'htmlElement'},
        input: {type: 'htmlElement'},
        message: {type: 'htmlElement'}
    });

    def.states(
        {'label': ['hasLabel', 'noLabel'], 'validation': ['invalid']}
    );

    def.methods({
        /**
         * @override
         * Initialize Input
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * presetText: a pre set text value
         * placeholderText: text to show when the field is empty
         * labelText: the value of the label to show above/next to the field
         * maxLength: the maximum number of characters
         * minLength: the minimum number of characters
         * validators: an array of functions validate the field against, each function should return an error message or null for success;
         */
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._placeholderText = args.placeholderText || '';
            this._minLength = args.minLength || Constants.Inputs.Default.MIN_LENGTH;
            this._maxLength = args.maxLength || Constants.Inputs.Default.MAX_LENGTH;
            this._minLengthErrorMessage = this._translate('INPUT_MIN_LENGTH_ERROR_MSG');
            this._maxLengthErrorMessage = this._translate('INPUT_MAX_LENGTH_ERROR_MSG');
            this._labelText = args.labelText || '';
            this._ignoreRevertToLastValidInput = !!args.ignoreRevertToLastValidInput;
            this._stylesForSkinparts = args.stylesForSkinparts;
            this.setValidators(args.validatorArgs || {});
        },

        _onAllSkinPartsReady: function () {
            this.parent();
            this._skinParts.input.addEvent('focus', this._onFocus);
            if(!this._ignoreRevertToLastValidInput) {
                this._skinParts.input.addEvent('blur', this._revertToLastValidInputIfCurrentInvalid);
            }
            if(this._stylesForSkinparts){
                _.forOwn(this._stylesForSkinparts, function(styles, skinPartName){
                    if(_.has(this._skinParts, skinPartName)){
                        this._skinParts[skinPartName].setStyles(styles);
                    }
                }, this);
            }
        },

        _onFocus: function() {
            this._valueOnFocus = this.getValue();
            this._setLastValidInput();
        },

        _setLastValidInput: function () {
            this._lastValidInput = this.getValue();
        },

        _revertToLastValidInputIfCurrentInvalid: function () {
            if (this.getInputValidationErrorMessage()) {
                this._skinParts.input.set('value', this._lastValidInput);
                this._resetInvalidState();
                this._changeEventHandler();
            }
        },

        /**
         * @override
         */
        render: function () {
            this.parent();
            //Set placeholder text if present
            this.setPlaceholder(this._placeholderText);
            this.setMaxLength(this._maxLength);

            if (this.getState("validation") == "invalid") {
                this.setState('invalid', 'validation');
            } else {
                this._resetInvalidState();
            }
        },

        isValidInput: function () {
            return (this.getState("validation") !== "invalid");
        },

        setFocus: function () {
            this._skinParts.input.focus();
        },

        setMaxLength: function (maxLength) {
            this._maxLength = maxLength;
            this._skinParts.input.setProperty('maxlength', maxLength);
        },

        setInputType: function (type) {
            this._skinParts.input.set("type", type);
        },

        /**
         * @override
         * Set the value of the input field
         * @param text The text to set
         * @param isPreset optional, if set to true the isPreset flag is set to true
         */
        setValue: function (text, isPreset) {
            var input = this._skinParts.input;
            //For IE8 placeholder polyfill
            if (this.hasPlaceholder) {
                input.removeClass('isPlaceholder');
            }
            input.set('value', text);
            if (isPreset) {
                input.set('isPreset', 'true');
            } else {
                input.erase('isPreset');
            }
        },

        /**
         * @override
         * Returns the value of the input field
         * Ignores the text if isPlaceholder is set
         */
        getValue: function () {
            var input = this._skinParts.input;
            var value = '';
            if (!input.hasClass('isPlaceholder')) {
                value = input.get('value');
            }
            return value;
        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function () {
            this.parent();
            this._skinParts.input.removeAttribute('disabled');
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function () {
            this.parent();
            this._skinParts.input.setAttribute('disabled', 'disabled');
        },

        getInputValidationErrorMessage: function () {
            var inputContent = this.getValue();
            var errorMsg = '';
            if (inputContent.length > this._maxLength) {
                errorMsg = this._maxLengthErrorMessage + ' ' + this._maxLength;
            } else if (inputContent.length < this._minLength) {
                errorMsg = this._minLengthErrorMessage + ' ' + this._minLength;
            } else if (this._validators && this._validators.length) {
                for (var i = 0, j = this._validators.length; i < j; i++) {
                    var validator = this._validators[i];
                    errorMsg = validator(inputContent);
                    if (errorMsg) {
                        break;
                    }
                }
            }
            return errorMsg;
        },
        _showValidationMessage: function (message) {
            this.setState('invalid', 'validation');
            if (this._skinParts.message) {
                this._skinParts.message.set('text', message);
                this._skinParts.message.uncollapse();
            }
        },
        _resetInvalidState: function () {
            this.removeState('invalid', 'validation');
            if (this._skinParts.message) {
                this._skinParts.message.set('text', '');
                this._skinParts.message.collapse();
            }
        },
        /**
         * Set a placeholder text
         * Uses Modernizr to load polyfill for non-supporting browsers
         * @param text
         */
        setPlaceholder: function (text) {
            this._skinParts.input.set('placeholder', text);
            if (window.Modernizr && !window.Modernizr.input.placeholder) {
                this._placeholderPolyFill();
            }
        },
        /**
         * The polyfill used by setPlaceholder, adds a focus and blur events,
         * adds a 'isPlaceholder' property when placeholder is displayed
         */
        _placeholderPolyFill: function () {
            function showPlaceholder(e) {
                var input = e.target;
                if (input.get('value') === '' && input.get('placeholder')) {
                    input.addClass('isPlaceholder');
                    input.set('value', input.get('placeholder'));
                }
            }

            function hidePlaceholder(e) {
                var input = e.target;
                if (input.hasClass('isPlaceholder')) {
                    input.removeClass('isPlaceholder');
                    input.set('value', '');
                }
            }

            if (!this.hasPlaceholder) {
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
        _changeEventHandler: function (e) {
            // ignore tab and shift keys
            if (e && e.code && !W.Utils.isInputKey(e.code)) {
                return;
            }
            //Validations
            var validationMessage = this.getInputValidationErrorMessage();
            if (validationMessage) {
                this._showValidationMessage(validationMessage);
                this._validationFailCallback(validationMessage);
                return false;
            } else {
                this._resetInvalidState();
                this._validationOkCallback();
                this._setLastValidInput();
            }

            //Remove preset flag on change
            this._skinParts.input.set('isPreset', '');

            this.parent(e);
        },
        /**
         * Select the text on click for preset values
         */
        _selectPresetFieldContent: function (e) {
            if (e.target.get('isPreset')) {
                if (!e.target.get('isSelected')) {
                    e.target.set('isSelected', 'true');
                    e.target.select();
                }
            }
        },
        /**
         * Deselect the text on click for preset values
         */
        _deselectPresetFieldContent: function (e) {
            e.target.erase('isSelected');
        },

        _fireBlur: function (e) {
            var isValueValid = (!this.getInputValidationErrorMessage());
            if (isValueValid) {
                e.wasDataChanged = (this._valueOnFocus !== this.getValue());
                e.newValue = this.getValue();
                e.oldValue = this._valueOnFocus;
            }
            this.fireEvent(Constants.CoreEvents.BLUR, e);
        },

        _fireKeyUp: function (e) {
            this.fireEvent(Constants.CoreEvents.KEY_UP, e);
        },

        /**
         * @override
         * show validation error
         */
        showValidationMessage: function (message) {
            this._showValidationMessage(message);
        },
        /**
         * @override
         * remove validation error
         */
        resetInvalidState: function () {
            this._resetInvalidState();
        },


        /**
         * @override
         * Assign change events
         */
        _listenToInput: function () {
            this._skinParts.input.addEvent(Constants.CoreEvents.KEY_UP, this._changeEventHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.KEY_UP, this._fireKeyUp);

            this._skinParts.input.addEvent(Constants.CoreEvents.CUT, this._changeEventHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.PASTE, this._changeEventHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.CLICK, this._selectPresetFieldContent);

            this._skinParts.input.addEvent(Constants.CoreEvents.BLUR, this._deselectPresetFieldContent);
            this._skinParts.input.addEvent(Constants.CoreEvents.BLUR, this._fireBlur);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function () {
            this._skinParts.input.removeEvent(Constants.CoreEvents.KEY_UP, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.KEY_UP, this._fireKeyUp);

            this._skinParts.input.removeEvent(Constants.CoreEvents.CUT, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.PASTE, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.CLICK, this._selectPresetFieldContent);
            this._skinParts.input.removeEvent(Constants.CoreEvents.BLUR, this._deselectPresetFieldContent);
            this._skinParts.input.removeEvent(Constants.CoreEvents.BLUR, this._fireBlur);
        }
    });
});

