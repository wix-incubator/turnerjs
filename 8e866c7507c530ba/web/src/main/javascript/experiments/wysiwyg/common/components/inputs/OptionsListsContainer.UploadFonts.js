define.experiment.newComponent('wysiwyg.common.components.inputs.OptionsListsContainer', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.traits(['wysiwyg.viewer.components.traits.ValidationSettings']);

    def.utilize(['wysiwyg.viewer.utils.ComponentSequencer']);

    def.binds(['_onItemSelected']);

    def.states({
        'validity':['valid', 'invalid']
    });
    def.fields(
        {_selectedItem:null}
    );
    def.dataTypes(["SelectableList"]);
    def.resources(['W.Data']);

    def.methods({
        initialize:function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._sequencer = new this.imports.ComponentSequencer();
            if (args) {
                this._allowOptionReselect=args.allowOptionReselect;
                this._sequencer.resolveItem = function () {
                    var obj = { comp:args.compType, skin:args.compSkin};
                    if(args.compStyleId){
                        obj.styleId = args.compStyleId;
                    }
                    return obj;
                };
            }
        },

        _onAllSkinPartsReady:function () {

        },
        _onDataChange: function(dataItem, field, value) {
            if (field === 'selected') {
                var selectedComponentByData = this._getSelectedComponentByData(value[field]);
                this._changeSelectedItem(selectedComponentByData);
            }
            this.parent(dataItem, field, value);
        },
        _getSelectedComponentByData: function(dataItem) {
            var itemLogicArray = this.items.map(function(itemNode) {
                return itemNode.$logic;
            });
            var selectedComponentArray = itemLogicArray.filter(function(item) {
                return (item.getDataItem() == dataItem);
            });
            return selectedComponentArray && selectedComponentArray[0];
        },

        _getFirstFilteredDataItem: function(filterFunction) {
            var dataItemsArray = _.map(this.items, function(itemNode) {
                return itemNode.$logic.getDataItem();
            });

            var resultArray = _.filter(dataItemsArray, filterFunction);

            return resultArray && resultArray[0];
        },
        getDataItemByLabel: function(label) {
            var lcLabel = label.toLowerCase();
            return this._getFirstFilteredDataItem(function(item) {
                return (item.get('label').toLowerCase() === lcLabel);
            });
        },
        getDataItemByLabelStartingWith: function(prefix) {
            var lcPrefix = prefix.toLowerCase();
            return this._getFirstFilteredDataItem(function(item) {
                return (item.get('label').toLowerCase().indexOf(lcPrefix) === 0);
            });
        },
        scrollToByDataItem: function(dataItem) {
            this.$view.scrollTop = this._getComponentHeightByData(dataItem);
        },
        _getComponentHeightByData: function(dataItem) {
            var result = 0;
            for (var i=0; i< this.items.length; i++) {
                var component = this.items[i];
                if (component.$logic.getDataItem() === dataItem) {
                    return result;
                }

                result += component.getHeight();
            }

            return 0;
        },
        _preventRenderOnDataChange:function (dataItem, field, value) {
            return field === 'selected';
        },

        _prepareForRender:function () {
            this._sequencer.addEvent('productionFinished', function (event) {
                this._onSequencerFinished(event);
                this.fireEvent('optionListInputReady', event);
            }.bind(this));
            this._sequencer.createComponents(this.getViewNode(), this.getDataItem().get("items"));
            return true;
        },

        _onSequencerFinished:function (payload) {
            this.items = payload.elements;
            this.items.forEach(function (item) {
                var itemLogic = item.getLogic();
                itemLogic.addEvent('itemSelected', this._onItemSelected);
                //here we set the selected by default item, consider comparing by value..
                if (itemLogic.getDataItem() === this.getDataItem().get('selected')) {
                    this._selectedItem = itemLogic;
                    this._selectedItem.setSelected(true);
                }
            }.bind(this));
        },

        _onItemSelected:function (newSelected) {
            if (this._selectedItem && this._selectedItem === newSelected && !this._allowOptionReselect) {
                return;
            }
            //save selected to data
            var selectedData = newSelected.getDataItem();
            this.setValidationState(true);
            this.getDataItem().set('selected', selectedData);
            this.fireEvent('selectionChanged', selectedData);
        },

        _changeSelectedItem: function(selectedComponent) {
            if (this._selectedItem) {
                this._selectedItem.setSelected(false);
            }
            if (selectedComponent) {
                this._selectedItem = selectedComponent;
                this._selectedItem.setSelected(true);
                this._selectedItem.getViewNode().focus();
            }
        },

        setValidationState:function (isValid) {
            this.setState(isValid ? 'valid' : 'invalid', 'validity');
            this.parent(isValid);
        }
    });
});