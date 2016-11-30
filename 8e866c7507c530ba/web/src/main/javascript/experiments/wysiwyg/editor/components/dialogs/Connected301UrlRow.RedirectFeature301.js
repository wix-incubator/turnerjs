define.experiment.newComponent('wysiwyg.editor.components.dialogs.Connected301UrlRow.RedirectFeature301', function (componentDefinition, experimentStrategy) {

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.dataTypes(['Item301redirect', '']);
    def.binds(['disposeRow', '_createEditGroupContent', '_onOldUrlInputKeyUp', '_createBtn', '_onDeleteClicked', '_applyEditedRow']);

    def.statics({
        NORMAL_BORDER_COLOR: '1px solid rgb(180, 180, 180)',
        ERROR_BORDER_COLOR: '1px solid rgb(255, 0, 0)'
    });

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._textArea = null;
            this._applyButton = null;
            this._dialogWindow = args.dialogWindow;
            this._viewGroup = null;
            this._editGroup = null;
            this._destinationUrlTitle = null;
            this.isEdiBoxCreated = false;
            this.createPagesMenuList = args.createPagesMenuList;
            this.showValidationErrorMessage = args.showValidationErrorMessage;
            this.trimDomainFromOldURL = args.trimDomainFromOldURL;
            this.updateComboBox = args.updateComboBox;
            this.editedRowApplied = args.editedRowApplied;
            this.ifOldUrlAlreadyExist = args.ifOldUrlAlreadyExist;
            this.validateOldUrlInput = args.validateOldUrlInput;
            this.rowIsEdited = args.rowIsEdited;
            this.deleteRow = args.deleteRow;
            this._ediGroupContainer = null;
            this._oldURLinput = null;
            this.setDataItem(this._createDataItem(args.itemData));
            this._itemData = args.itemData;
            this._lastOldURL = null;
            this._lastDestinationPage = null;
            this._mouseDownCommand = this.resources.W.Commands.registerCommand("WEditorCommands.DialogWindowMouseDown", true);
        },

        _createDataItem:function(itemData){
            itemData.type = 'Item301redirect';
            itemData.id = 'SITE_SETTINGS';
            return this.resources.W.Data.createDataItem(itemData);
        },

        getDataItem:function(){
            return this._data;
        },

        _createFields: function(){
            this._createViewGroup();
            this._createEditGroupContainer();
        },

        _createViewGroup:function(){
            this._viewGroup = this.addInputGroupField(function(panel){
                this.setNumberOfItemsPerLine(4, '1px');
                panel._createOldUrlTitle(this);
                panel._createDestinationUrlTitle(this);
                panel._createBtn(panel, this, 'buttons/deleteURLIcon.png', 'Boundary_box_Trash_can_ttid', "_onDeleteClicked", 'linkRight', {x:0, y:0});
                panel._createBtn(panel, this, 'buttons/pensilIcon.png', 'Edit_301_redirect_row_ttid', "onEditClicked", 'linkRight', {x:0, y:2});
            },'skinless', null, null, null, null, null, null, {'border-bottom': '1px solid #d7d7d7', 'height':'31px'});
        },

        _createEditGroupContainer:function(){
            this._editGroup = this.addInputGroupField(function(panel){
                panel._ediGroupContainer = this;
                this.setNumberOfItemsPerLine(3, '3px');
            },'skinless', null, null, null, null, null, null, {'border-bottom': '1px solid #d7d7d7', 'height':'31px'});
            this.collapseGroup(this._editGroup);
        },

        _callOnBlurIfNeeded:function(event){
            if (this.$view.contains(event.target)){
                console.log('do nothing!');
            } else {
                this._cancelApplyingEditedRow(event);
            }
        },

        _cancelApplyingEditedRow:function(event){
            this._mouseDownCommand.unregisterListener(this);
            this.collapseGroup(this._editGroup);
            this.uncollapseGroup(this._viewGroup);
            this._oldUrlInputField.setValue(this._lastOldLink);
            this._destinationUrlTitle.setValue(this.resources.W.Preview.getPreviewManagers().Viewer.getPageData(this._lastDestinationPage).get('title'));
            this._comboBox.setValue(this._lastDestinationPage);
            this._setOldUrlBorder(this.NORMAL_BORDER_COLOR);
            this.showValidationErrorMessage('');
        },

        _createEditGroupContent:function(){
            if(this.isEdiBoxCreated){
                this.updateComboBox(this._comboBox);
                return;
            }
            this.isEdiBoxCreated = true;
            this._createOldUrlInputField(this._ediGroupContainer);
            this._comboBox = this._createCombo(this._ediGroupContainer);
            var that = this;
            this._comboBox.runWhenReady( function( logic ) {
                that._comboBox = logic;
            });
            this._applyButton = this._createApplyButton(this._ediGroupContainer);
        },

        _createApplyButton:function(container){
            return container.addInlineTextLinkField(null, null, this._translate('ADVANCED_SEO_PANEL_APPLY_BUTTON'), null, null, null, null, null, null, {'margin-top':'6px', 'margin-left': '0px', 'width': '80px', 'text-align': 'center'})
                 .addEvent('click', this._applyEditedRow);
        },

        _createBtn: function (panel, btnCont, iconUrl, toolTip, manipulationType, skinName, spriteOffset) {
            var that = this;
            return btnCont.addButtonField(null, null, false, {iconSrc: iconUrl, iconSize: {width: 14, height: 14}, spriteOffset: spriteOffset}, skinName, null, toolTip)
                .addEvent(Constants.CoreEvents.CLICK, function (ev) {
                    if(manipulationType){
                        that[manipulationType](ev);
                    }
                })
                .runWhenReady( function( logic ) {
                    logic._skinParts.view.setStyle('margin-top', '9px');
                });
        },

        _createOldUrlTitle:function(container){
            container.addLabel(null, null, null, null, null, null, null, {'padding-left':'7px', 'width':'218px', 'min-width':'218px', 'margin-top': '6px', 'margin-right': '20px', 'text-overflow': 'ellipsis', 'overflow':'hidden', 'white-space':'nowrap'})
                .bindToField('fromExternalUri');
        },

        _createDestinationUrlTitle:function(container){
            var value = this._data.get('toWixUri');
            var pageData = W.Preview.getPreviewManagers().Viewer.getPageData(value);
            var label = '';
            if(!pageData){
                this.disposeRow(value);
            }
            else{
                label = pageData.get('title');
            }
            this._destinationUrlTitle = container.addLabel(label, null, null, null, null, null, null, {'margin-right':'32px', 'width':'160px', 'min-width':'160px', 'margin-top':'6px', 'margin-left':'-1px', 'text-overflow': 'ellipsis', 'overflow':'hidden', 'white-space':'nowrap'});
        },

        setDestinationUrlTitle:function(title){
            if(this._destinationUrlTitle) {
                this._destinationUrlTitle.setValue(title);
            }
        },

        _createOldUrlInputField:function(container){
            var that = this;
            this._oldUrlInputField = container.addInputField(null, this._translate('ADVANCED_SEO_301_OLD_LINK_PLACE_HOLDER'), null, 300, {validators: [this._inputValidators._301redirectValidator]}, null, null, true);
            this._oldUrlInputField.runWhenReady( function( logic ) {
                that._oldUrlInputField = logic;
                logic._skinParts.view.setStyles({'width':'226px', 'margin-top': '3px', 'margin-left': '3px', 'margin-right': '10px'});
                logic._skinParts.input.addEvent(Constants.CoreEvents.KEY_UP, that._onOldUrlInputKeyUp);
                logic._skinParts.input.addEvent(Constants.CoreEvents.CUT, that._onOldUrlInputKeyUp);
                logic._skinParts.input.addEvent(Constants.CoreEvents.PASTE, that._onOldUrlInputKeyUp);
                logic._stopListeningToInput();
            })
            .bindToField('fromExternalUri');
        },

        _onOldUrlInputKeyUp:function(e){
            // ignore tab and shift keys
            if (e && e.code && !W.Utils.isInputKey(e.code)) {
                return;
            }
            var validationMessage = this._oldUrlInputField.getInputValidationErrorMessage();
            this._applyButton.disable();
            if(this.validateOldUrlInput(e.target.value) && !validationMessage){
                this._applyButton.enable();
            }
            var isValid = this.showValidationErrorMessage(validationMessage);
            isValid ? this._setOldUrlBorder(this.NORMAL_BORDER_COLOR) : this._setOldUrlBorder(this.ERROR_BORDER_COLOR);
        },

        _setOldUrlBorder: function(color) {
            if(this._oldUrlInputField) {
                this._oldUrlInputField._skinParts.input.setStyle('border', color);
            }
        },

        _createCombo:function(container){
            var combo = container.addComboBoxField(null, this.createPagesMenuList())
                .runWhenReady( function( logic ) {
                    logic._skinParts.view.setStyles({'margin-top':'3px', 'width':'180px'});
                })
                .bindToField('toWixUri');
            return combo;
        },

        _onDataChange: function(dataObj, field, value) {
            this.parent(dataObj, field, value);
            if(this._destinationUrlTitle){
                var newValue = this._data.get('toWixUri');
                var label = W.Preview.getPreviewManagers().Viewer.getPageData(newValue).get('title');
                this._destinationUrlTitle.setValue(label);
            }
            if(this._oldUrlInputField && this._comboBox) {
                var validationMessage = this._oldUrlInputField.getInputValidationErrorMessage();
                this._applyButton.disable();
                if (this._oldUrlInputField.getValue() && this._comboBox.getValue() && !validationMessage) {
                    this._applyButton.enable();
                }
            }
        },

        _onDeleteClicked: function(ev){
            this.disposeRow();
        },

        disposeRow:function(){
            this.deleteRow(this._itemData);
            this.dispose();
        },

        onEditClicked: function(ev){
            this._mouseDownCommand.registerListener(this, this._callOnBlurIfNeeded);
            this._createEditGroupContent();
            this._lastOldLink = this._oldUrlInputField.getValue();
            this._lastDestinationPage = this._comboBox.getValue();
            this.collapseGroup(this._viewGroup);
            this.uncollapseGroup(this._editGroup);
            this.rowIsEdited();
        },

        _applyEditedRow:function(ev){
            var oldUrl = this._oldUrlInputField.getValue();
            oldUrl = this.trimDomainFromOldURL(oldUrl);
            if(oldUrl!==this._lastOldLink && this.ifOldUrlAlreadyExist(oldUrl)){
                this._setOldUrlBorder(this.ERROR_BORDER_COLOR);
                this._applyButton.disable();
                return;
            }
            this._mouseDownCommand.unregisterListener(this);
            this.collapseGroup(this._editGroup);
            this.uncollapseGroup(this._viewGroup);
            var toWixUri = this._comboBox.getValue();

            var newParams = {oldUrl:oldUrl, toWixUri:toWixUri};
            var lastParams = {oldUrl:this._data.get('fromExternalUri'), toWixUri:this._data.get('toWixUri')};

            this._data.set('fromExternalUri', oldUrl);
            this._data.set('toWixUri', toWixUri);
            this._data.fireDataChangeEvent();
            this.editedRowApplied(newParams, lastParams);
        },

        collapseGroup:function(group){
            group.runWhenReady(function(groupComp) {
                groupComp.collapseGroup();
            });
        },

        uncollapseGroup:function(group){
            group.runWhenReady(function(groupComp) {
                groupComp.uncollapseGroup();
            });
        }
    });
});
