/**
 * SelectionListInput is a base class for all list input fields.
 * This component holds a collection of components (the repeaters), each component contains a set of properties. when a component is
 * being selected by the 'click' event, the value of this class is set to hold the selected component's set of properties.
 *
 * It manages the components data-provider and is updated as the data changes.
 * The data-provider object is a dataItem of type 'list'.
 * the raw-data object holds an 'items' key in which the list of objects are stored {label: "", value:""}
 * for example: dataProvider.getData('items') => [{label:"a", value:"aa"}, {label:"b", value:"bb"}, {label:"c", value:"cc"}]
 *
 */

define.component('wysiwyg.editor.components.inputs.SelectionListInput', function(componentDefinition) {

    //@type core.managers.component.ComponentDefinition
    var def = componentDefinition;
    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.skinParts({
        label: {type: 'htmlElement'},
        collection: {type: 'htmlElement'}
    });
    def.resources(['W.Commands', 'W.Resources']);

    def.binds(['_onRepeaterClick','_propagateEvent','_deleteItem','_moveUpItem','_moveDownItem']);
    def.traits(['wysiwyg.editor.components.traits.BindDataProvider']);
    def.utilize(['core.managers.data.DataItemBase']);

    def.dataTypes(['']);


    def.methods({
        /**
         * @param compId
         * @param viewNode
         * @param args contains an optional repeaterArgs object with the following fields:
         *                 <li> repeaterComp - the component name of the repeater </li>
         *                <li> repeaterSkin - the skin name of the repeater </li>
         *                <li> dataProvider - can be either an object or dataRef (string) </li>
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            var componentArgs = args.repeaterArgs || {};
            this._repeaterComp = componentArgs.type;
            this._repeaterSkin = componentArgs.skin;
            this._repeaterArgs = componentArgs.args || {};
            this._numRepeatersInLine = componentArgs.numRepeatersInLine;
            this._dataItemFilter = args.dataItemFilter;
            this._componentArgs = componentArgs;
            //used to disable data updates when change is issued from this component
            this._disableReRender = false;
            if(typeOf(args.selectedIndex) === 'number' && args.selectedIndex >- 1){
                this._selectItemAtIndex = args.selectedIndex;
            }else{
                this._selectItemAtIndex = -1;
            }
            this._repeatersSelectable = (typeof args.repeatersSelectable !== 'undefined') ? args.repeatersSelectable : true;
            if (args.dataProvider) {

                //data provider can come in two formats: as an object, or as a dataref (e.g. "#COLOR_PALETTES").
                //we need to handle both cases:
                if (typeof args.dataProvider === 'string' && args.dataProvider.indexOf("#") === 0) {
                    this.injects().Data.getDataByQuery(args.dataProvider, function(dataProvider) {
                        this.bindToDataProvider(dataProvider); // will call renderIfReady
                    }.bind(this));
                }
                else {
                    this.bindToDataProvider(args.dataProvider);
                }
            }
            else {
                LOG.reportError(wixErrors.INVALID_INPUT_BIND, this.className, 'initialize', 'xx')();
            }

            this.addEvent('subMenuCloses', function() {
                this._clearSelection();
            }.bind(this));

            this._enforceSelection = false;
            this._dataBeforeDeletion = {};
            if(typeOf(this._componentArgs.enforceSelection) === 'boolean' && this._componentArgs.enforceSelection===true){
                this._enforceSelection = true;
            }

        },
        _onAllSkinPartsReady: function() {
            this.parent();
            if (this._componentArgs && this._componentArgs.scrollable) {
                this._view.setStyles({
                    overflow: 'auto',
                    height:this._componentArgs.height,
                    width:this._componentArgs.width

                });
            }
        },

        deleteSelectedItem: function() {
            this._deleteItem(this._selectedItem._data);
        },

        moveUpSelectedItem: function() {
            this._moveUpItem(this._selectedItem._data);
        },

        moveDownSelectedItem: function() {
            this._moveDownItem(this._selectedItem._data);
        },

        moveToFirstSelectedItem: function() {
            var itemData = this._selectedItem._data;
            var items = this._dataProvider.get('items');
            var index = this._getItemIndex(itemData);
            if(items && items.length>0 && index>-1 && index<items.length && items[index]){
                items.splice(index, 1);
                items.splice(0, 0, '#' + itemData.get('id'));
                this._rearangeListInput();
            }
        },

        moveToLastSelectedItem: function() {
            var itemData = this._selectedItem._data;
            var items = this._dataProvider.get('items');
            var index = this._getItemIndex(itemData);
            if(items && items.length>0 && index>-1 && index<items.length && items[index]){
                items.splice(index, 1);
                items.splice(items.length, 0, '#' + itemData.get('id'));
                this._rearangeListInput();
            }
        },

        _rearangeListInput:function(fireDataChangeEventWithUndoTransaction){
            this._updateSelection();
            this._renderIfReady();
            if(fireDataChangeEventWithUndoTransaction && this._dataBeforeDeletion){
                if(this.injects().UndoRedoManager && this.injects().UndoRedoManager.hasOwnProperty("_startTransaction")) {
                    this.injects().UndoRedoManager._startTransaction(true);
                }
                var dataAfterDeletion = {};
                dataAfterDeletion = Object.merge(dataAfterDeletion, this._dataProvider._data);
                this._dataProvider.fireDataChangeEvent(undefined, dataAfterDeletion, this._dataBeforeDeletion, this);
                if(this.injects().UndoRedoManager && this.injects().UndoRedoManager.hasOwnProperty("_endTransaction")){
                    this.injects().UndoRedoManager._endTransaction(true);
                }
            } else {
                this._dataProvider.fireDataChangeEvent();
            }
        },

        getSelectItemIdx: function() {
            if(!this._selectedItem){
                return -1;
            }
            var itemData = this._selectedItem._data;
            return this._getItemIndex(itemData);
        },

        selectItemAtIndex: function(index) {
            this._selectItemAtIndex = index;
        },

        selectItemAtIndexAndUpdate: function(index) {
            this._selectItemAtIndex = index ;
            var newValue = this._dataProvider._data.items[index] ;
            this.fireEvent('inputChanged', {value: newValue});
        },

        getCompAtIndex: function(i){
            if (this._comps && this._comps[i] && this._comps[i].getLogic){
                return this._comps[i].getLogic();
            }
            return null;
        },


        /**
         * Bind dataItem fields to dataProvider fields, excluding the dataProvider fields in the excludeList array
         * @param dataItem
         * @param excludeList
         */
        bindToDataItemAndFilterFromDataProvider: function(dataItem, excludeList) {
            var filter = null;
            if (Array.isArray(excludeList)) {
                filter = Object.filter(this.getDataProviderItem(0), function(value, key) {
                    return !excludeList.contains(key);
                });
            }
            else {
                filter = this.getDataProviderItem(0);
            }
            this.bindToDataItemsFilteredFields(dataItem, filter);
        },

        /**
         * @override
         * overrodes BaseInput's dispose(), by first disposing all collection's children, then
         * disposing itself
         */
        dispose: function() {
            this._dataItemFilter = null;
            this._comps = null;
            this._disposeChildren();
            this.parent();
        },



        /**
         *
         */
        _prepareForRender : function() {
            //updates the components item list
            if (!this._dataProvider) {
                return false;
            }

            this._items = this._dataProvider.get('items') || [];
            if (this._dataItemFilter) {
                this._items = this._items.filter(this._dataItemFilter);
            }

            if(this._items && this._items.length>0 && this._selectItemAtIndex === -1 && this._enforceSelection === true){
                this._selectItemAtIndex = 0;
            }
            //check if there are any BREAK_LINE in the dataProvider
            this._explicitBreakLineExist = this._items.some(function(item) {
                return item === Constants.SelectionListInput.BREAK_LINE;
            });

            this._setItems();
            return true;
        },
        _getComps: function() {
            return this._comps;
        },
        /**
         * traverses over the items, creates the repeater for each item and inserts it into the collection
         */
        _setItems:function() {
            if (this._disableReRender){
                return;
            }
            this._comps = [];
//            this._disposeChildren();
            var collection = this._skinParts.collection;
            var comp, i;
            this._storeCollectionForReuse(collection);
            var originalScrollValue = this._view.scrollTop;
            collection.empty();

            //there are two options of building the subcomponents:
            //a. if _numRepeatersInLine==1 && no BREAK_LINE, the components should be regular divs
            //b. else, wrap each inline group with its own div

            //option a:
            if (this._omitBreakLinesUsage || (this._numRepeatersInLine === 1 && !this._explicitBreakLineExist)) {
                for (i = 0; i < this._items.length; i++) {
                    comp = this._createSingleRepeater(this._items[i], i === this._selectItemAtIndex, i);
                    this._comps.push(comp);
                    comp.insertInto(collection);
                }
            }

            //option b:
            else {
                var groupContainer = new Element('div', {'class': 'inline-component-group'});

                for (i = 0; i < this._items.length; i++) {
                    if (this._items[i] !== Constants.SelectionListInput.BREAK_LINE) {
                        comp = this._createSingleRepeater(this._items[i], i === this._selectItemAtIndex, i);
                        this._comps.push(comp);
                        comp.addClass('inline-component');
                        comp.insertInto(groupContainer);
                    }

                    if (this._items[i] === Constants.SelectionListInput.BREAK_LINE || (this._numRepeatersInLine > 0 && (i + 1) % this._numRepeatersInLine === 0)) {
                        groupContainer.insertInto(collection);
                        groupContainer = new Element('div', {'class': 'inline-component-group'});
                    }
                }

                // if the last group has children, add it into the collection
                if (groupContainer.getChildren().length > 0) {
                    groupContainer.insertInto(collection);
                }

            }

            this._view.scrollTop = originalScrollValue;
        },

        _listenToInput: function() {
            //do nothing - all repeaters' events are added when in the process of the creation of the repeaters.
        },


        /**
         * Prepares or fetches a data item with <i>rawData</i>,
         * that is, if rawData is a data item or a data item reference, the data item is returned.
         * Otherwise, a data item that wraps a copy of rawData is created and returned
         * @param {Object/DataItemBase/String} rawData
         * @returns {DataItemBase} a data item wrapper for rawData
         */
        _getSingleRepeaterDataItem: function(rawData) {
            // handle raw data that's already a data item
            if (instanceOf(rawData, this.imports.DataItemBase)) {
                return rawData;
            }
            // handle raw data that contains a data ref
            var dataManager = this._dataProvider.getDataManager();
            if (typeof rawData === 'string') {
                return dataManager.getDataByQuery(rawData, function() {
                });
            }
            // handle raw data
            var newRawData = {};
            for (var field in rawData) {
                newRawData[field] = rawData[field];
            }
            if (typeof newRawData.type !== 'string') {
                newRawData.type = 'list';
            }
            return dataManager.createDataItem(newRawData);
        },

        _storeCollectionForReuse : function (collection) {
            this._repeaterPool = [];
            for (var i = 0; i < collection.children.length; i++) {
                if (collection.children[i].getLogic) {
                    this._repeaterPool.push(collection.children[i]);
                }
            }
        },

        _findExistingRepeater : function (data) {
            var logic;
            var collection = this._repeaterPool;
            for (var i = 0; i < collection.length; i++) {
                if (collection[i].getLogic) {
                    logic = collection[i].getLogic();
                    if (logic.getDataItem() === data) {
                        return collection[i];
                    }
                }
            }
            return null;
        },

        _setupRepeaterStates : function (comp, data, selected, itemIndex) {
            var compState = "singleItem";
            if (comp.hasState(compState)) {
                comp.setState(compState);
            }
        },

        /**
         * this method should be overriden by components that do not expect this default functionality.
         * the default functionality creates a component for each of the data provider items
         * @param {Object/DataItemBase/String} rawData
         * @param {Boolean} selected if true, the item will fire a click event as soon as it's ready
         */
        _createSingleRepeater:function(rawData, selected, itemIndex) {
            var selectableComp;
            var data = this._getSingleRepeaterDataItem(rawData);

            selectableComp = this._findExistingRepeater(data);

            if (selectableComp) {
                this._setupRepeaterStates(selectableComp.getLogic(), data, selected, itemIndex);
            } else {
                // create the component:
                selectableComp = this.injects().Components.createComponent(
                    this._repeaterComp,
                    this._repeaterSkin,
                    data,
                    this._repeaterArgs,
                    null,
                    function(comp) {
                        var viewNode = comp.getViewNode();
                        viewNode.addEvent('click', function() {
                            var event = {data:data,target:viewNode};
                            comp.fireEvent('click', event);
                        });
                        viewNode.addEvent('mouseenter', function() {
                            var event = {data:data.getData(),target:viewNode};
                            this.fireEvent('itemOver', event);
                        }.bind(this));
                        viewNode.addEvent('mouseleave', function() {
                            var event = {data:data.getData(),target:viewNode};
                            this.fireEvent('itemOut', event);
                        }.bind(this));
                        comp.addEvent('click', this._onRepeaterClick);
                        comp.addEvent('propagateEvent', this._propagateEvent);
                        comp.addEvent(Constants.SelectionListEvents.DELETE_ITEM, this._deleteItem);
                        comp.addEvent(Constants.SelectionListEvents.MOVE_UP_ITEM, this._moveUpItem);
                        comp.addEvent(Constants.SelectionListEvents.MOVE_DOWN_ITEM, this._moveDownItem);
                        if (selected) {
                            comp.fireEvent('click', {data:data,target:viewNode});
                        }
                        this._setupRepeaterStates(comp, data, selected, itemIndex);
                    }.bind(this)
                );
            }
            return selectableComp;
        },
        _propagateEvent: function(ev) {
            this.fireEvent(ev.type, ev);
        },
        _getItemIndex: function(itemData) {
            var items = this._dataProvider.get('items');
            var id = itemData._data.id;
            return items.indexOf('#' + id);
        },

        _deleteItem: function(itemData) {
            var items = this._dataProvider.get('items');
            var index = this._getItemIndex(itemData);
            this._dataBeforeDeletion = Object.merge(this._dataBeforeDeletion, this._dataProvider._data);
            if(items && items.length>0 && index>-1 && index<items.length && items[index]){
                items.splice(index, 1);
                this._comps.splice(index, 1);
                this._clearSelection();
                if(this._comps[index]){
                    this._selectItemAtIndex = index;
                }
                else
                if(this._comps[index-1]){
                    this._selectItemAtIndex = index-1;
                }
                else{
                    this._selectItemAtIndex = -1;
                }
                if(this._selectItemAtIndex > -1){
                    setTimeout(function () {
                        this._selectItem(this._comps[this._selectItemAtIndex]);
                    }.bind(this), 250);
                }
                else{
                    this._selectItem(null);
                }
            }
            this._rearangeListInput(true);
        },

        _moveUpItem: function(itemData) {
            var items = this._dataProvider.get('items');
            var index = this._getItemIndex(itemData);
            var dataBeforeMovement = {};
            dataBeforeMovement = Object.merge(dataBeforeMovement, this._dataProvider._data);

            items.splice(index, 1);
            if (index > 0) {
                index--;
            }
            items.splice(index, 0, '#' + itemData.get('id'));
            this._updateSelection();
            this._renderIfReady();
            this.injects().UndoRedoManager.startTransaction();
            var dataAfterMovement = {};
            dataAfterMovement = Object.merge(dataAfterMovement, this._dataProvider._data);
            //Fire data change event
            this._dataProvider.fireDataChangeEvent(undefined, dataAfterMovement, dataBeforeMovement, this);
            this.injects().UndoRedoManager.endTransaction();
        },
        _moveDownItem: function(itemData) {
            var items = this._dataProvider.get('items');
            var index = this._getItemIndex(itemData);
            var dataBeforeMovement = {};
            dataBeforeMovement = Object.merge(dataBeforeMovement, this._dataProvider._data);

            if (index < items.length - 1) {
                items.splice(index, 1);
                index++;
                items.splice(index, 0, '#' + itemData.get('id'));
            }

            this._updateSelection();
            this._renderIfReady();
            this.injects().UndoRedoManager.startTransaction();
            var dataAfterMovement = {};
            dataAfterMovement = Object.merge(dataAfterMovement, this._dataProvider._data);
            //Fire data change event
            this._dataProvider.fireDataChangeEvent(undefined, dataAfterMovement, dataBeforeMovement, this);
            this.injects().UndoRedoManager.endTransaction();
        },

        _selectItem: function (item, data) {
            if (item) {
                var itemLogic = item.getLogic();
                if(data === undefined) {
                    data = itemLogic.getDataItem();
                }
                this._disableReRender = true;
                this.setValue(data);
                this._disableReRender = false;
                this._updateSelection(itemLogic);
            } else {
                this.setValue(null);
            }
        },

        _selectCompAtIndex: function(index){
            var comp = this.getCompAtIndex(index),
                viewNode = comp && comp.$view;
            if(viewNode){
                this._selectItem(viewNode);
            }
        },

        /**
         * when a certain repeater is selected, this will set its value to hold the selected repeater
         * this method will only work if the repeater uses the trait
         * 'wysiwyg.editor.components.traits.PropagateClickEventToContainingList', as mentioned above
         * @param event
         */
        _onRepeaterClick:function(event) {
            var data;
            if(event && event.data) {
                data = event.data.getData();
            }
            this._selectItem(event.target, data);
            this._updateSelection(event.target.getLogic());
        },

        _updateSelection: function(selectedItem) {
            selectedItem = selectedItem || this._selectedItem;
            if (selectedItem && selectedItem.hasState('selected') && selectedItem.hasState('up') && this._repeatersSelectable) {
                this._selectedItem = selectedItem;
                this._clearSelection();
                selectedItem.setState('selected');
            }
            this.fireEvent("updateSelection");
        },
        _clearSelection: function() {
            var comps = this._getComps();
            for (var i = 0; i < comps.length; i++) {
                if (comps[i].getLogic) {
                    comps[i].getLogic().setState('up');
                }
            }

        },

        getDataProvider : function(){
            return this._dataProvider;
        },

        clearSelection: function(){
            this._clearSelection();
            this.selectItemAtIndex(-1);
            this._value = null;
        },


        /**
         * @override
         * Returns the value of the input field
         * Ignores the text if isPlaceholder is set
         */
        getValue: function() {
            return this._value;
        },

        /**
         * implements the "abstract" method of BaseInput
         * @param newValue
         */
        setValue: function(newValue) {
            if (this._value !== newValue) {
                this._value = newValue;
                this.fireEvent('inputChanged', {value: newValue, target: this._view});
            }
        },


        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function() {
            this.parent();
            this._skinParts.collection.removeAttribute('disabled');
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function() {
            this.parent();
            this._skinParts.collection.setAttribute('disabled', 'disabled');
        },

        _changeEventHandler: function(e) {
            this.parent(e);
        },

        /**
         * goes over all collection's children, and disposes them
         */
        _disposeChildren: function() {
            var collectionChildren = this._skinParts.collection.getChildren();
            for (var i = 0; i < collectionChildren.length; i++) {
                var child = collectionChildren[i];
                var comp = child.getLogic && child.getLogic();
                if (comp) {
                    comp.dispose();
                }
                else {
                    child.destroy();
                }
            }
            this._skinParts.collection.empty();
        },

        /**
         * override
         */
        _stopListeningToInput: function() {}
    });
});

