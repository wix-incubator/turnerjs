define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTDropDownCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTBaseCommand');

    def.resources(['W.Data']);

    def.fields({
        _key: 'value',
        _isFixedMenu: true,
        _labelUnits: '',
        _optionsData: null
    });

    def.methods({

        initialize: function(commandInfo, controllerComponent) {
            this.setComponentData(controllerComponent.getDataItem());
            this._key = commandInfo.dataKeyOfValueProperty || this._key;
            this._isFixedMenu = this._isFixedMenu != undefined ? commandInfo.isFixedMenu : this._isFixedMenu;
            this._labelUnits = commandInfo.labelUnits || this._labelUnits;
            this.parent(commandInfo, controllerComponent);
        },

        setComponentData: function(data){
            this._optionsData = data.get('items');
        },

        getUserActionEventName: function(){
            return Constants.CoreEvents.CHANGE;
        },

        executeCommand: function(event)  {
            this.parent(event);
            if (!this._editorInstance) {
                //bi error?
                return;
            }

            var value = event.get(this._key);
            this._editorInstance.execCommand(this._commandName, value);
        },

        _handleStateChange: function(event) {
            var state = event.sender.state;
            var selectedOption = this._getOptionToDisplay(state);

            if (selectedOption) {
                this._controllerComponent.setSelected(selectedOption);
            }
        },

        _getOptionToDisplay: function(currentValue) {
            var selectedOption, isDefault = false;

            if (currentValue === Constants.CkEditor.TRISTATE.OFF || currentValue === Constants.CkEditor.TRISTATE.DISABLED){
                currentValue = this._getDefaultValueAccordingToStyle();
                isDefault = true;
            }
            selectedOption = this._getOptionFromMenu(currentValue);
            var optionNotInDropDown = !selectedOption;

            if (optionNotInDropDown && !this._isFixedMenu){//get cached option or create a new one
                selectedOption = this._getOptionNotFromMenu(currentValue);
            }
            if (isDefault && selectedOption) {
                selectedOption._data.isDefault = true;
            }
            return selectedOption;
        },

        _getOptionComponent: function(value){
            var self = this;
            var canonizedValue = this._canonizeValue(value);

            var predicate = function(optionComp){
                var optionValue = optionComp.$logic.getDataItem().get(self._key);
                optionValue = self._canonizeValue(optionValue);
                return canonizedValue === optionValue;
            };
            var compView = this._controllerComponent.getOptionComponentByPredicate(predicate);
            return compView && compView.$logic;
        },

        _getOptionFromMenu: function(value){
            var self = this;
            var canonizedValue = this._canonizeValue(value);

            return this._optionsData.first(function(optionData){
                var optionValue = self._canonizeValue(optionData.get(self._key));
                return canonizedValue === optionValue;
            });
        },

        _canonizeValue: function(value) {
            return typeOf(value) === 'string' ?
                value.toLowerCase().replace(/['"\s]/g, '') : value;
        },

        _getOptionNotFromMenu: function(value) {
            var cachedOption = this._controllerComponent.cache[value.replace(/\s/g, '')];
            return cachedOption || this._createNewOptionObject(value);
        },

        _createNewOptionObject: function(value) {
            var dataObjectExample = this._controllerComponent.getDataItem().get('items')[0];
            var rawDataItem = {"command": this._commandName, "type": 'ButtonWithIcon'};
            rawDataItem.value = dataObjectExample.get('value') && value;
            rawDataItem.label = dataObjectExample.get('label') && this._getLabelFromValue(value);
            var optionObject = this.resources.W.Data.createDataItem(rawDataItem, 'ButtonWithIcon');
            this._controllerComponent.cache[value] = optionObject;
            return optionObject;
        },

        _getLabelFromValue: function(value) {
            var labelManipulation = this._getLabelManipulation();
            var units = this._labelUnits || '';
            if (labelManipulation) {
                return labelManipulation(value, units);
            }
            return value;
        },

        _getLabelManipulation: function() {
            return function(val, units){return val.substring(0, val.length-2) + " " + units;};
        },

        resetControllersValues: function() {
            var defaultValue = this._getDefaultValueAccordingToStyle();
            this._editorInstance.execCommand(this._commandName, defaultValue);
        }

    });
});