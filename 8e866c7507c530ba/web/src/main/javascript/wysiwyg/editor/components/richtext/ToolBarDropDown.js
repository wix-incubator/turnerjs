/**
 * @class wysiwyg.editor.components.richtext.ToolBarDropDown
 */
define.component('wysiwyg.editor.components.richtext.ToolBarDropDown', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.traits(['wysiwyg.editor.components.traits.DropDownComponent']);

    def.skinParts({
        select:  {type: 'wysiwyg.editor.components.WButton', 'hookMethod': '_selectHookMethod', argObject: {shouldRenderOnDisplay: true}},
        label:   {type: 'htmlElement'},
        content: {type: 'htmlElement'},
        options: {
            type: 'wysiwyg.common.components.inputs.OptionsListInput',
            dataRefField: '*',
            hookMethod: '_createArgObject'
        },
        bottomLinks:       { 'type': 'htmlElement'},
        bottomLeftLink:    { 'type' : 'wysiwyg.editor.components.WButton'},
        bottomRightLink:   { 'type' : 'wysiwyg.editor.components.WButton'}
    });


    def.resources(['W.Components', 'W.Data', 'W.Resources', 'W.Utils', 'W.Theme', 'W.Commands']);

    def.binds(['_onOptionClick', '_setOptionStyle', '_onSelectionChanged', '_onDropDownItemsReady']);

    def.states({
        mouse: ['selected'],
        contentPosition: ['contentOnBottom', 'contentOnTop'],
        bottomLinks:['none','bottomLinks']
    });

    def.dataTypes(['SelectableList']);

    def.fields({
        //this allows you to create a matrix of options by specifying width and number of columns
        /** @type {Number} the number of columns in the options */
        _numberOfColumns: 1,
        /** @type {Object} the object to be passed as args to the option components*/
        _singleOptionInfo: null,
        //shouldn't need this
        _selectionOption: null,
        /** @type {String} the label above the options */
        _label: null,
        /**@type Function
         * the method used to get the data for the select component (a button in this drop down) from the selected data item */
        _optionToSelectDataConversionMethod: null,
        _fixedIcon: null,
        _onFocusBIEvent: null
    });


    def.methods({

        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._numberOfColumns = args.numberOfColumns;
            this._singleOptionInfo = args.singleOptionInfo;
            this._selectionOption = args.selectionOption;
            this._allowOptionReselect = args.allowOptionReselect;
            this._label = args.label && this.resources.W.Resources.get('EDITOR_LANGUAGE', args.label);
            this._optionToSelectDataConversionMethod = args.optionToSelectDataConversionMethod || this._defaultOptionToSelectDataConversionMethod;
            this.cache = {};
            this._fixedIcon = args.fixedIcon;
            if (args.disable) {
                this.disable();
            }
            this._onFocusBIEvent = args.onFocusBIEvent;
            this._bottomLinks = args.bottomLinks;
            this._bottomLeftLinkData = this._bottomLinks && this._bottomLinks.bottomLeftLink;
            this._bottomRightLinkData = this._bottomLinks && this._bottomLinks.bottomRightLink;
            this.setState('none','bottomLinks');
            this._biEvent = args.biEvent;
        },

        _createArgObject: function(definition) {
            definition.argObject = this._singleOptionInfo;
            definition.argObject.allowOptionReselect=this._allowOptionReselect;
            return definition;
        },

        /**
         * Initialize menu data or wait for site ready
         */
        _onAllSkinPartsReady: function(){
            this._addListenersToSelectEvents();
            this._addListenersToOptionsEvents();
            this._setDropDownLabel();
            var optionsViewNode = this._skinParts.options.getViewNode();
            this._optionNodes = optionsViewNode.getChildren();
            optionsViewNode.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
            if (this._fixedIcon) {
                this._skinParts.select.setIcon(this.resources.W.Theme.getProperty("WEB_THEME_DIRECTORY") + this._fixedIcon.ref, this._fixedIcon.size, this._fixedIcon.spriteOffset);
            }
        },

        initializeBottomLinks: function(){
            if (this._bottomLinks){
                this.setState('bottomLinks','bottomLinks');
                if (this._bottomLeftLinkData){
                    this._initializeBottomLink(this._skinParts.bottomLeftLink, this._bottomLeftLinkData);
                }

                if (this._bottomRightLinkData){
                    this._initializeBottomLink(this._skinParts.bottomRightLink, this._bottomRightLinkData);
                }
            }
        },

        _initializeBottomLink: function(skinPart, data){
            skinPart.setLabel(this.resources.W.Resources.get('EDITOR_LANGUAGE', data.linkText));
            skinPart.on(Constants.CoreEvents.CLICK, this, function(){
                this.resources.W.Commands.executeCommand(Constants.EditorUI.CLOSE_PROPERTY_PANEL, {stayClosed:true});
                this.resources.W.Commands.executeCommand('WEditorCommands.StopEditingText');
                this.resources.W.Commands.executeCommand(data.linkCommand, data.commandParams);
            });
        },

        _selectHookMethod: function(definition){
            var selectedData = this._data.get('selected');
            definition.dataItem = this._optionToSelectDataConversionMethod(selectedData, null);
            return definition;
        },

        _onDataChange: function(dataItem, field, value) {
            if (!this._skinParts ) {
                return;
            }


            this._updateSelectIcon(value, dataItem);

            if (field === 'selected') {
                return;
            }
            this.parent(dataItem, field, value);
            //this is for dropdowns that get their data later (dataRefField doesn't work properly)
            this._skinParts.options.setDataItem(dataItem);
        },

        _updateSelectIcon: function (value, dataItem) {
            if (this._shouldUpdateSelectIcon()) {
                var selectedValue = (value && value.selected) || dataItem.get('selected');
                var buttonSelectedValue = this._optionToSelectDataConversionMethod(selectedValue, this._skinParts.select.getDataItem());
                this._skinParts.select.setDataItem(buttonSelectedValue);
            }
        },

        _shouldUpdateSelectIcon: function () {
            return !this._fixedIcon;
        },

        _onSelectionChanged: function(selectedOptionData) {
            this._onBlur();
            var selectedOption = this.getSelectedOption();
            if (selectedOption) {
                this.setSelected(selectedOption);
                selectedOption._data.isDefault = false;
            }
            this.fireEvent(Constants.CoreEvents.CHANGE, selectedOptionData);
        },

        _onOptionClick: function(event){
            this._onSelectionChanged(event.target);
        },

        /**
         * handle option selection
         * @param option
         */
        setSelected: function(option){
            this.getDataItem().set('selected', option);
        },

        setActiveState: function(isActive) {
            if(isActive && this._biEvent) {
                LOG.reportEvent(this._biEvent);
            }
            this._setOpenPositionState();
            isActive ? this.setState('selected', 'mouse') : this.removeState('selected', 'mouse');
        },

        getSelectedOption: function() {
            return this._skinParts.options.getDataItem().get('selected');
        },

        getOptions: function() {
            return this._skinParts.options.getDataItem().get('items');
        },

        getOptionComponentByPredicate: function(predicateFunction){
            return this._optionNodes.first(predicateFunction);
        },

        _setOptionStyle: function() {
            for (var i=0; i< this._optionNodes.length; i++) {
                var field = this._optionNodes[i];
                this._setButtonFieldStyle(field);
            }
        },

        _setButtonFieldStyle: function(field) {
            if (this._numberOfColumns > 1) {
                field.setStyle('display', 'inline-block');
            }
        },

        _addListenersToSelectEvents: function() {
            this._skinParts.select.getViewNode().addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onFocus);
        },

        _addListenersToOptionsEvents: function() {
            this._skinParts.options.addEvent('optionListInputReady', this._onDropDownItemsReady);
            this._skinParts.options.addEvent('selectionChanged', this._onSelectionChanged);
        },

        _onDropDownItemsReady: function(payload){
            this._optionNodes = payload.elements;
            this._setOptionStyle();
            this.fireEvent('dropDownReady');
        },

        _setDropDownLabel: function() {
            if (this._label) {
                this._skinParts.label.set('html', this._label);
            }
            else {
                this._skinParts.label.setStyle('display', 'none');
            }
        },

        _defaultOptionToSelectDataConversionMethod: function(optionData, selectCurrentData){
            return optionData;
        },
        _getContentHeight: function () {
            if (typeof this._contentHeight === 'undefined') {
                this._contentHeight = this._computeContentHeight();
            }
            return this._contentHeight;
        },

        _setOpenPositionState: function() {
            this._shouldOpenOnTop() ? this._displayOptionsOnTop() : this._displayOptionsOnBottom();
        },

        _displayOptionsOnTop: function () {
            this.setState('contentOnTop', 'contentPosition');
        },

        _displayOptionsOnBottom: function () {
            this.setState('contentOnBottom', 'contentPosition');
        },

        _computeContentHeight: function() {
            var dimensions = this._skinParts.content.getDimensions();
            return dimensions.height;
        },

        _shouldOpenOnTop: function() {
            var dropDownComponentHeight = this.getViewNode().getHeight();
            var positionRelativeToWindow = W.Utils.getPositionRelativeToWindow(this.getViewNode());
            var windowSize = W.Utils.getWindowSize();
            return (dropDownComponentHeight + this._getContentHeight() + positionRelativeToWindow.y >= windowSize.height);
        }
    });
});