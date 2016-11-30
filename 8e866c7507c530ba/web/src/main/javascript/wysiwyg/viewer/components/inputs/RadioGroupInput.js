/**
 * @class wysiwyg.viewer.components.inputs.RadioGroupInput
 */
define.component('wysiwyg.viewer.components.inputs.RadioGroupInput', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.inputs.ComboBoxInput');

    def.traits(['wysiwyg.viewer.components.traits.ValidationSettings']);

    def.skinParts( {
        'collection':{type:Constants.ComponentPartTypes.HTML_ELEMENT},
        'errorMessage':{type:Constants.ComponentPartTypes.HTML_ELEMENT, optional:"true"}
    });

    /**
     * @lends wysiwyg.viewer.components.inputs.RadioGroupInput
     */
    def.methods({
        initialize:function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this._radioGroupName = argsObject.radioGroupName || "radioGroup";
            this._selectedValue = argsObject.selectedValue;
        },

        _prepareForRender:function () {
            this._createRadioGroup();
            return true;
        },

        _onAllSkinPartsReady:function () {
            this._createRadioGroup();
            this._skinParts.collection.addEvent(Constants.CoreEvents.CHANGE, this._selectedIndexChanged);
        },

        _createRadioGroup:function () {
            var bindToData = function (list) {
                this._optionsData = Object.values(list);
                this._bindRadioGroupToData(this._skinParts.collection);
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

        _bindRadioGroupToData:function (selectElement) {
            selectElement.empty();

            for (var i = 0; i < this._optionsData.length; i++) {
                var optionData = this._optionsData[i];
                var value = optionData.get('value');
                var inputEl = new Element("Input", {
                    "type":"radio",
                    "name":this._radioGroupName,
                    "value":value
                });

                if (value == this._selectedValue) {
                    inputEl.setAttribute("checked", "checked");
                }

                selectElement.grab(inputEl, 'bottom');
                selectElement.innerHTML += optionData.get('text') + "<BR/>";
            }

            this._setSelected(selectElement);
        },

        _getSelectedIndex:function () {
            var radioButtons = document.getElementsByName(this._radioGroupName);
            for (var i = 0; i < radioButtons.length; i++) {
                if (radioButtons[i].checked) {
                    return i;
                }
            }
        },

        _setSelected:function (selectElement) {
            var selected = this.getDataItem().get('selected');
            if (selected) {
                this.injects().Data.getDataByQuery(selected, function (data) {
                    var ind = this._optionsData.indexOf(data);
                    if (ind > -1 && ind < selectElement.length) {
                        selectElement[ind].set('checked', 'checked');
                    }
                }.bind(this));
            }
        }
    });

});