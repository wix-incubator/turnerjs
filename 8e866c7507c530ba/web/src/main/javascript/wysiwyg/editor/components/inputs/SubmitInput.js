/**
 * @Class wysiwyg.editor.components.inputs.SubmitInput
 * @extends wysiwyg.editor.components.inputs.Input
 */
define.component('wysiwyg.editor.components.inputs.SubmitInput', function(componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.Input");

    def.binds(['_inputEventHandler', '_preSubmitEventHandler', '_onFocus']);

    def.skinParts({
        label  : {type: 'htmlElement'},
        input  : {type: 'htmlElement'},
        button : {type: 'wysiwyg.editor.components.WButton', argsObject: {}},
        message: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel'], 'validation': ['invalid']});

    /**
     * @lends wysiwyg.editor.components.inputs.SubmitInput
     */
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
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._iconSrc = args.iconSrc || '';
            this._buttonLabel = args.buttonLabel || '';
            this._preSubmitFunction = args.preSubmitFunction || null;

        },

        /**
         * @override
         */
        render: function() {
            this.parent();
            this._skinParts.button.setLabel(this._buttonLabel);
            this._skinParts.button.setIcon(this._iconSrc);
            this._skinParts.button.disable(); //enabled only on focus

        },

        _onAllSkinPartsReady: function() {
            //Set change events listeners
            if (this.isEnabled()) {
                this._listenToInput();
            }
            this.addToolTip(this._toolTipId);
        },

        /**
         * @override
         * Set the value of the input field
         * @param text The text to set
         * @param isPreset optional, if set to true the isPreset flag is set to true
         */
        setValue: function(text, isPreset) {
            this.parent(text, isPreset);
        },

        setMessage: function(text) {
            this._skinParts.message.set('html', text);
        },

        getButton: function() {
            return this._skinParts.button;
        },

        /**
         * @override
         * Returns the value of the input field
         * Ignores the text if isPlaceholder is set
         */
        getValue: function() {
            return this.parent();
        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function() {
            this.parent();
            this._skinParts.input.removeAttribute('disabled');
            this._skinParts.button.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function() {
            this.parent();
            this._skinParts.input.setAttribute('disabled', 'disabled');
            if (this.isReady()) {
                this._skinParts.button.disable();
            }
        },

        _onFocus: function(e) {
            this._valueOnFocus = this.getValue();
            this._setLastValidInput();

            this._skinParts.button.enable();
        },

        _inputEventHandler: function(e) {
            // Submit on Enter
            if (W.Utils.isEnterKey(e.code)) {
                this._skinParts.input.blur();
                this._preSubmitEventHandler(e);
            }
            // ignore tab and shift keys
            return !W.Utils.isInputKey(e.code);
        },

        /**
         * Select the text on click for preset values
         */
        _selectPresetFieldContent: function(e) {
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
        _deselectPresetFieldContent: function(e) {
            e.target.erase('isSelected');
        },

        _preSubmitEventHandler: function(e) {
            if (this._preSubmitFunction) {
                this._preSubmitFunction(e, this._changeEventHandler);
            } else {
                this._changeEventHandler(e);
            }
            this._deselectPresetFieldContent(e);
            this._skinParts.button.disable();

        },

        /**
         * @override
         * Assign change events
         */
        _listenToInput: function() {
            this._skinParts.input.addEvent(Constants.CoreEvents.KEY_UP, this._inputEventHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.CLICK, this._selectPresetFieldContent);
            this._skinParts.input.addEvent(Constants.CoreEvents.BLUR, this._deselectPresetFieldContent);
            this._skinParts.button.addEvent(Constants.CoreEvents.CLICK, this._preSubmitEventHandler);
            this._skinParts.input.addEvent(Constants.CoreEvents.FOCUS, this._onFocus);
        },

        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._skinParts.input.removeEvent(Constants.CoreEvents.KEY_UP, this._inputEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.CLICK, this._selectPresetFieldContent);
            this._skinParts.input.removeEvent(Constants.CoreEvents.BLUR, this._deselectPresetFieldContent);
            this._skinParts.button.removeEvent(Constants.CoreEvents.CLICK, this._preSubmitEventHandler);
            this._skinParts.input.removeEvent(Constants.CoreEvents.FOCUS, this._onFocus);
        }
    });
});