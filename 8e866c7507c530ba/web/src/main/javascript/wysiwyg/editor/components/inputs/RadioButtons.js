/**
 * @Class wysiwyg.editor.components.inputs.RadioButtons
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.RadioButtons', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.binds(['_onRadioReady']);

    def.skinParts({
        label:  {type: 'htmlElement'},
        radioButtons: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel']});

    /**
     * @lends wysiwyg.editor.components.inputs.RadioButtons
     */
    def.methods({
        /**
         * @override
         * Initialize Input
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * presetList: an array of {value:value, label:label} pairs. value should be unique
         * labelText: the value of the label to show above/next to the field
         * listSize: the size of the options list to show on focus
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._presetList = args.presetList || [];
            this._initialValue = args.defaultValue || null;
            this._labelText = args.labelText || '';
            this._display = (args.display == 'inline') ? args.display : 'block';
            this._group = args.group || 'radios_' + new Date().getTime();
            this._radioButtonsLogic = {};
            this._radioButtonsElements = {};
            this._value = '';
            this._isButtonsLogicReady = false;
        },
        /**
         * @override
         */
        render: function() {
            //Set label if present
            this.setLabel(this._labelText);
        },

        _prepareForRender : function() {
            if (this._isButtonsLogicReady) {
                return true;
            }
            //Set preset text if present
            this.setRadioButtons(this._presetList, this._initialValue);

            return this._isButtonsLogicReady;
        },

        /**
         * Set the options of the select
         * @param list an array of {value:value, label:label} pairs, value is expected to be unique
         */
        setRadioButtons: function(list, initialValue){
            if (list && list.length){
                this._initialValue = initialValue || this._initialValue;
                var radioContainer = this._skinParts.radioButtons;
                var radio;
                if(this._presetList != list){
                    this._presetList = list;
                }
                // TODO cleanup
                radioContainer.empty();
                this._radioButtonsLogic = {};
                this._radioButtonsElements = {};

                list.forEach(function(item){
                    item = (typeof item != 'undefined')? item : {};
                    if (item == Constants.AutoPanel.BREAK){
                        // Add a new line on LineBreak
                        radioContainer.grab(new Element('br'), 'bottom');
                    }else{
                        if (this._radioButtonsElements[item.value]){
                            //TODO: report error
                        }
                        radio = this.injects().Components.createComponent(
                            'wysiwyg.editor.components.inputs.Radio',
                            'wysiwyg.editor.skins.inputs.RadioSkin',
                            undefined,
                            {
                                labelText: item.label,
                                group: this._group,
                                value: item.value,
                                display: this._display
                            },
                            null,
                            function(logic){
                                var viewNode = logic.$view;
                                this._radioButtonsElements[item.value] = viewNode;
                                this._onRadioReady(logic);
                            }.bind(this)
                        );
                        radio.insertInto(radioContainer);
                    }
                },this);
            }
            else {
                this._isButtonsLogicReady = true;
                this._renderIfReady();
            }
        },

        _onRadioReady: function(logic){
            //Check if all components are ready
            var allReady = Object.every(this._radioButtonsElements, function(node, value){
                return (node.getLogic && node.getLogic().isReady());
            }, this);

            if (allReady){
                this._onAllRadioButtonsReady();
            }
        },

        _onAllRadioButtonsReady: function () {
            //Map node list to a logic list
            this._radioButtonsLogic = Object.map(this._radioButtonsElements, function (node) {
                return node.getLogic();
            }, this);
            //Set default value
            if (this._initialValue && this._radioButtonsLogic[this._initialValue]) {
                this._radioButtonsLogic[this._initialValue].setChecked(true);
            }
            this._isButtonsLogicReady = true;
            this._listenToInput();
            this._renderIfReady();
        },

        /**
         * @override
         * Set the value of the select field
         * @param value The value to select
         */
        setValue: function(value, isPreset){
            for (var buttonKey in this._radioButtonsLogic){
                var button = this._radioButtonsLogic[buttonKey];
                if (buttonKey===value.toString()){
                    button.setChecked(true);
                    this._value = buttonKey;
                    if (isPreset){
                        this._skinParts.radioButtons.set('isPreset', 'true');
                    }else{
                        this._skinParts.radioButtons.erase('isPreset');
                    }
                }else{
                    button.setChecked(false);
                }
            }
        },
        /**
         * @override
         * Returns the value of the input field
         * Ignores the text if isPlaceholder is set
         */
        getValue: function(){
            return this._value;
        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            Object.forEach(this._radioButtonsLogic, function(radio){
                radio.enable();
            });
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            Object.forEach(this._radioButtonsLogic, function(radio){
                radio.disable();
            });
        },

        _changeEventHandler: function(e){
            this.setValue(e.value);

            this.parent(e);
        },
        /**
         * @override
         */
        _listenToInput: function(){
            Object.forEach(this._radioButtonsLogic, function(logic){
                logic.addEvent('inputChanged', this._changeEventHandler);
            }.bind(this));
        },
        /**
         * @override
         */
        _stopListeningToInput: function(){
            Object.forEach(this._radioButtonsLogic, function(logic){
                logic.removeEvent('inputChanged', this._changeEventHandler);
            }.bind(this));
        },

        getRadioButtonsList: function(){
            return this._radioButtonsLogic;
        }
    });
});