define.component('wysiwyg.editor.components.richtext.ToolBarWritableDropDown', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.richtext.ToolBarDropDown');

    def.resources(['W.Data', 'W.Resources']);

    def.skinParts({
        select:  {type: 'wysiwyg.viewer.components.inputs.TextInput', 'hookMethod': '_selectHookMethod', argObject: {shouldRenderOnDisplay: true}},
        arrow:   {type: 'htmlElement'},
        label:   {type: 'htmlElement'},
        options: {
            type: 'wysiwyg.common.components.inputs.OptionsListInput',
            dataRefField: '*',
            hookMethod: '_createArgObject'
        }/*,
         bottomArea: {type: 'htmlElement', optional: 'true'}*/
    });

    def.binds(['_onOptionClick', '_setOptionStyle', '_onSelectionChanged', '_showInputArea', '_onInputChanged', '_handleArrow']);

    def.fields({
        _defaultValue: '',
        _placeholderText: '',
        _limits: null,
        _valuePost: '',
        _labelPost: ''
    });

    def.methods({

        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._defaultValue = args.defaultValue || '';
            this._placeholderText = args.placeholderText || '';
            this._limits = args.limits;
            this._valuePost = args.valuePost || '';
            this._labelPost = args.labelPost || '';
        },

        _selectHookMethod: function(definition){
            definition = this.parent(definition);
            if(this._placeholderText){
                definition.argObject.placeholder = this._placeholderText;
            }
            return definition;
        },

        _onAllSkinPartsReady: function() {
            this.parent();
            this._skinParts.select.getViewNode().addEvent(Constants.CoreEvents.CLICK, this._showInputArea);
            this._skinParts.arrow.addEvent(Constants.CoreEvents.CLICK, this._handleArrow);
        },

        _handleArrow: function() {
            if (this.isActiveState()) {
                this._onBlur();
            } else {
                this._setFocus();
                this._showInputArea();
            }
        },

        _onOptionClick: function(event){
            event.target = this._setInputValue();
            this.parent(event);
        },

        _fixLimits: function(value) {
            if (this._limits) {
                if (value > this._limits.max) {
                    return this._limits.max;
                } else if (value < this._limits.min) {
                    return this._limits.min;
                }
            }

            return value;
        },

        _setInputValue: function(){
            var userInput = this._getDataObjectFromUserInput();
            if (!userInput) {
                userInput = this._resetToSelectedOption();
            }

            return userInput;
        },

        _getDataObjectFromUserInput: function() {
            var userInput = parseFloat(this._skinParts.select.getDataItem().get('text'));
            if (!isNaN(userInput)) {
                var validInput = this._fixLimits(userInput);
                //create new data item
                var rawDataItem = {"value": validInput + this._valuePost, "label": validInput + this._labelPost, "command": this.$view.getAttribute('skinPart')};
                rawDataItem.type = 'ButtonWithIcon';
                return this.resources.W.Data.createDataItem(rawDataItem, 'ButtonWithIcon');
            }

            return false;
        },

        _resetToSelectedOption: function () {
            var selected = this._skinParts.options.getDataItem().get('selected');
            this._skinParts.select.getDataItem().set('text', selected.get('label'));
            this._skinParts.select.setTextContent(selected.get('label'));
            return selected;
        },

        _defaultOptionToSelectDataConversionMethod: function(optionData, selectCurrentData){
            var textDataItem = selectCurrentData || this.resources.W.Data.createDataItem({'type': 'Text'}, 'Text');
            var value = optionData ? optionData.get('value'): '';
            value = parseFloat(value);
            if(value === this._defaultValue){
                value = '';
            }
            textDataItem.set('text', (optionData ? optionData.get('label'): value));
            return textDataItem;
        },

        _setSelectedOptionParameters: function(optionComponent) {
            this._optionToSelectDataConversionMethod(optionComponent, this._skinParts.select.getDataItem());
        },

        _showInputArea: function(){
            this._selectText();
        },

        _selectText: function(){
            this._skinParts.select.selectText();
        },

        _addKeyUpEvent: function () {
            this._skinParts.select.$view.addEvent(Constants.CoreEvents.KEY_UP, this._onKeyPress);
            this._skinParts.select.addEvent(Constants.CoreEvents.INPUT_CHANGE, this._onInputChanged);
        },

        _addKeyPressListener:function() {
            if (!this._keyPressListnerOn) {
                this._addKeyUpEvent();
                this._skinParts.select.$view.addEvent(Constants.CoreEvents.KEY_DOWN, this._onKeyDown);
                this._keyPressListnerOn = true;
            }
        },

        _onKeyDown: function(event) {
            event.stopPropagation();
        },

        _removeKeyPressListener:function() {},

        _onKeyPress: function (event) {
            this._setFocus();

            if (event.key != 'space') {
                this.parent(event);

                if (event.key === 'up' || event.key === 'down') {
                    this._selectText();
                }
            }
        },

        isActiveState: function() {
            return this.getState('mouse') === 'selected';
        },

        _onBlur: function (event) {
            if (!this.isActiveState()) {
                return;
            }

            this.parent(event);

            //force select on the text input
            this._onOptionClick({target: this._skinParts.select.getDataItem()});
        },

        _onInputChanged: function(data) {
            if(data && data.origEvent && data.origEvent.key && data.origEvent.key !== "backspace") {
                this.autoComplete(data.value);
            }
        },

        autoComplete: function(userInput) {
            if(this.autoCompleteIsAllowed(userInput)) {
                var dataItemFromOptions = this._skinParts.options.getDataItemByLabelStartingWith(userInput);
                if(dataItemFromOptions) {
                    this.setSelected(dataItemFromOptions);
                    this._skinParts.options.scrollToByDataItem(dataItemFromOptions);
                    var label = dataItemFromOptions.get('label');
                    if(label !== userInput) {
                        // auto complete
                        this._skinParts.select.setTextContent(label);
                        this._skinParts.select.selectText(userInput.length);
                    }
                    // keep text in focus
                    this._skinParts.select.setFocus();
                }
            }

        },

        autoCompleteIsAllowed: function(userInput) {
            var translatedDefault = this.resources.W.Resources.get('EDITOR_LANGUAGE','TOOLBAR_DROP_DOWN_DEFAULT_VALUE', 'Default');
            return translatedDefault.toLowerCase().indexOf(userInput.toLowerCase()) === 0;
        }
    });
});