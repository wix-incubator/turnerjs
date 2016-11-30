/**
 * @class wysiwyg.viewer.components.inputs.ComboBoxInput
 */
define.component('wysiwyg.viewer.components.inputs.ComboBoxInput', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.statics({
        PROMPT_OPTION_VALUE: -1
    });

    def.traits(['wysiwyg.viewer.components.traits.ValidationSettings']);

    def.skinParts( {
        'collection':{type:Constants.ComponentPartTypes.HTML_ELEMENT},
        'errorMessage':{type:Constants.ComponentPartTypes.HTML_ELEMENT, optional:"true"}
    });

    def.binds(['_selectedIndexChanged', '_getPromptOptionDataItem']);

    def.states({
        'validity':['valid', 'invalid']
    });

    def.dataTypes(['SelectableList']);

    def.propertiesSchemaType('ComboBoxInputProperties');

    def.fields({
        _optionsData:[]
    });

    /**
     * @lends wysiwyg.viewer.components.inputs.ComboBoxInput
     */
    def.methods({
        initialize:function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this.addEvent(this.VALID_STATE_CHANGED_EVENT, function (isValid) {
                this.setState(isValid ? 'valid' : 'invalid', 'validity');
            }.bind(this));
        },

        _preventRenderOnDataChange:function (dataItem, field, value) {
            return field == 'selected';
        },

        _prepareForRender:function () {
            this._createDropDownList();
            return true;
        },

        _onAllSkinPartsReady:function () {
            this._createDropDownList();
            this._skinParts.collection.addEvent(Constants.CoreEvents.CHANGE, this._selectedIndexChanged);
        },

        _createDropDownList:function () {
            var bindToData = function (list) {
                this._optionsData = Object.values(list);
                this._bindDdlToData(this._skinParts.collection);
            }.bind(this);

            var options = this.getDataItem().get('items').filter(function (option) {
                return option.get('enabled');
            });
            if (options.length > 0 && typeof(options[0]) === 'string') {
                this.injects().Data.getDataByQueryList(options, bindToData);
            } else {
                bindToData(options);
            }
        },

        _bindDdlToData:function (selectElement) {
            selectElement.empty();
            for (var i = 0; i < this._optionsData.length; i++) {
                var optionData = this._optionsData[i];
                selectElement.options[i] = new Option(optionData.get('text'), optionData.get('value'));
            }
            var selected = this.getDataItem().get('selected');
            if(selected){
                this._setSelectedFromData(selectElement, selected);
            }
            else if(this.getComponentProperty('hasPrompt')){
                this._addPrompt(selectElement);
            }
        },

        _setSelectedFromData:function (selectElement, selected) {
            var self = this;
            if(typeof(selected) == 'string'){
                this.injects().Data.getDataByQuery(selected, function(selectedItem){
                    self._setSelected(selectElement, selectedItem);
                });
            }
            else{
                this._setSelected(selectElement, selected);
            }
        },

        _setSelected: function(selectElement, selectedDataItem){
            var ind = this._optionsData.indexOf(selectedDataItem);
            if (ind > -1 && ind < selectElement.length) {
                selectElement.getSelected()[0].erase('selected');
                selectElement[ind].set('selected', 'selected');
            }
        },

        _selectedIndexChanged:function () {
            if(this._hasPrompt){
                this._removePrompt();
            }
            var ind = this._getSelectedIndex();
            this.setValidationState(true);
            this.getDataItem().set('selected', this._optionsData[ind]);
            this.fireEvent('selectionChanged', this._optionsData[ind]);
        },

        _getSelectedIndex:function () {
            return this._skinParts.collection.selectedIndex;
        },

        setSelectedItemByIndex: function(index) {
            var selectedDI = this._optionsData[index];
            this._setSelected(this._skinParts.collection, selectedDI);
            this._selectedIndexChanged();
        },

        setError:function (message) {
            this.setValidationState(false);
            if (this._skinParts.errorMessage) {
                this._skinParts.errorMessage.set("text", message);
            }
        },

        _addPrompt: function(selectElement){
            var promptText = this.getComponentProperty('promptText');
            selectElement.options.add(new Option(promptText, this.PROMPT_OPTION_VALUE, true, true), 0); //prompt is added at index 0 and selected by default
            this._optionsData.splice(0, 0, this._getPromptOptionDataItem(promptText));
            this._hasPrompt = true;
        },

        _removePrompt: function(){
            var selectElement = this._skinParts.collection;
            if(selectElement.getFirst().value == this.PROMPT_OPTION_VALUE){
                selectElement.options.remove(0); //prompt is added at index 0
                this._optionsData.splice(0, 1);
                this._hasPrompt = false;
            }
        },

        _getPromptOptionDataItem:function (promptText) {
            var rawData = {
                "type":"SelectOption",
                'value':this.getComponentProperty('promptValue'),
                'text':promptText,
                'enabled':true,
                'description':''
            };
            var dataItem = W.Data.createDataItem(rawData);
            dataItem.setMeta('isPersistent', false);
            return dataItem;
        }
    });

});