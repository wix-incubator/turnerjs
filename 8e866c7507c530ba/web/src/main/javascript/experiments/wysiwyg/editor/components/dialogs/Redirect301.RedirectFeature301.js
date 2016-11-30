define.experiment.newComponent("wysiwyg.editor.components.dialogs.Redirect301.RedirectFeature301", function (componentDefinition, experimentStrategy) {

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

    def.dataTypes(['SiteSettings', '']);
    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds(['_isOldUrlExist', '_onAlertLinkClick', '_rowIsEdited', '_editedRowApplied', '_deleteRow', '_updateComboBox', '_onDialogOpened', '_createPagesMenuList', '_fireDataChangeEvent', '_comboInputChanged', '_onApplyButtonClick', '_onDialogClosed', '_onAddButtonClick', '_onOldUrlInputKeyUp', '_showValidationErrorMessage']);
    def.resources(['W.Commands', 'W.Resources', 'W.Data', 'W.Config', 'W.Preview']);
    def.traits(['core.editor.components.traits.DataPanel', 'wysiwyg.editor.components.traits.BindValueToData']);

    def.statics({
        MAX_REDIRECTS: 50,
        NORMAL_BORDER_COLOR: '1px solid rgb(180, 180, 180)',
        ERROR_BORDER_COLOR: '1px solid rgb(255, 0, 0)'
    });

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._alertLabel = null;
            this._applyButton = null;
            this._dialogWindow = args.dialogWindow;
            this._oldUrlInputField = null;
            this._comboBox = null;
            this._itemListCont = null;
            this._itemsListObj = {};
            this._isErrorAlert = true;
            this.setDataItem(args.dialogData);
            this._menuData = this._getMenuData();
        },

        _getMenuData:function(){
            if(!this._menuData){
                this._menuData = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery("#MAIN_MENU");
            }
            return this._menuData;
        },

        _onDialogOpened: function() {
            this._filter301RowsAccordingToPages();
            if(this._comboBox){
                this._updateComboBox(this._comboBox, true);
            }
            this._applyButton.disable();

            if(this.isLimitReached()) {
                this.handleLimit();
            } else {
                this.setDialogFocus();
            }
        },

        _updateComboBox:function(comboBox, addSelectPageItem){
            var pagesList = this._createPagesMenuList(addSelectPageItem);
            var data = {'items': pagesList, 'type':'list'};
            var dataProvider = comboBox.getDataProvider();
            var selectedValue = comboBox.getValue();
            dataProvider.setData(data);
            dataProvider.fireDataChangeEvent();
            var pageData = this.resources.W.Preview.getPreviewManagers().Viewer.getPageData(selectedValue);
            if(pageData){
                comboBox.setValue(selectedValue);
            }
        },

        _createPagesMenuList: function(addSelectPageItem) {
            if(!this._menuData){
                return;
            }
            var subItems;
            var items = this._menuData.getItems();
            var pagesList = [];
            _.forEach(items, function (item) {
                this._addMenuItemToList(item, false, pagesList);
                subItems = item.get('items');
                _.forEach(subItems, function (subItem) {
                    this._addMenuItemToList(subItem, true, pagesList);
                },this);
            },this);
            if(addSelectPageItem){
                pagesList.unshift({ label:this._translate('LINK_DLG_SELECT_PAGE'), value:"" });
            }
            return pagesList;
        },

        _addMenuItemToList: function (item, isChild, menuItemsList) {
            var ref = item.get('refId');
            var refItem = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery(ref);
            var isRepeater = refItem.get('repeaterPage');
            if(isRepeater){
                return;
            }
            var label = refItem.get('title') || '';
            var value = (ref.indexOf('#') === 0) ? ref.substr(1) : ref;
            var newItem = {'label':label, 'value':value};
            menuItemsList.push(newItem);
        },

        _filter301RowsAccordingToPages:function(){
            var newArr = [];
            _.forEach(this._itemsListObj, function (item) {
                var dataItem = item.getLogic().getDataItem();
                if(!dataItem){
                    item.getLogic().disposeRow();
                    item = undefined;
                }
                else{
                    var toWixUri = dataItem.get('toWixUri');
                    var fromExternalUri = dataItem.get('fromExternalUri');
                    var pageData = this._menuData.getItemByRefId('#' + toWixUri);
                    if(!pageData){
                        item.getLogic().disposeRow();
                        item = undefined;
                    }
                    else{
                        item.getLogic().setDestinationUrlTitle(this.resources.W.Preview.getPreviewManagers().Viewer.getPageData(toWixUri).get('title'));
                        newArr.push({fromExternalUri: fromExternalUri, toWixUri: toWixUri});
                    }
                }

            },this);
            this._data.set('externalUriMappings', newArr);
            this._fireDataChangeEvent();
        },

        _onAllSkinPartsReady: function(compId, viewNode, args){
            this.parent();
            this._skinParts.content.addEvent(Constants.CoreEvents.MOUSE_WHEEL, this.resources.W.Utils.stopMouseWheelPropagation);
            this._dialogWindow.addEvent('dialogOpened', this._onDialogOpened);
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosed);
        },

        _createFields: function(){
            this.setNumberOfItemsPerLine(0, '3px');
            this.addInputGroupField(function(panel){
                panel._createSubTitle(this);
                panel._createDomainTitle(this);
                this.addBreakLine('10px', '1px solid #D6D5C3', '10px').setStyles({'margin-right':'16px'});
                panel._createRedirectUrlsListGroup(this);
                this.addBreakLine('8px');
                panel._createApplyButton(this);
                this.addBreakLine('13px');
                panel._createAlert(this);
            },'skinless', null, null, null, null, null, null, {'margin-left': '25px'});
        },

        _createRedirectUrlsListGroup:function(container){
            container.addInputGroupField(function(panel){
                this.setNumberOfItemsPerLine(3, '10px');
                panel._oldUrlInputField = panel._createOldUrlInputField(this);
                panel._oldUrlInputField.runWhenReady( function( logic ) {
                    panel._oldUrlInputField = logic;
                });
                panel._comboBox = panel._createCombo(this);
                panel._comboBox.runWhenReady( function( logic ) {
                    panel._comboBox = logic;
                });
                panel._addButton = panel._createAddButton(this);
                this.addBreakLine('1px');
                panel._redirectUrlsListGroup = this.addInputGroupField(function(panel){
                    panel._itemListCont = this;
                    _.defer(function () {
                        panel._createItemList();
                    });
                },'skinless', null, null, null, null, null, null, {'overflow':'auto', 'width':'520px', 'height':'120px', 'border':'1px solid #d7d7d7', 'border-radius':'4px'});
            },'skinless');
        },

        _createItemList:function(container){
            var items = this._data.get('externalUriMappings');
            var isValid;
            var newArr = [];
            _.forEach(items, function (item) {
                isValid = this._create301UrlRow(item);
                if(isValid){
                    newArr.push(item);
                }
            },this);
            this._data.set('externalUriMappings', newArr);
            this._data.fireDataChangeEvent();
        },

        _create301UrlRow:function(itemData){
            var value = itemData.toWixUri;
            var pageData = this.resources.W.Preview.getPreviewManagers().Viewer.getPageData(value);
            if(!pageData){
                return null;
            }

            var row = this.resources.W.Components.createComponent(
                'wysiwyg.editor.components.dialogs.Connected301UrlRow',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                null,
                {
                    height: '115px',
                    scrollable: true,
                    itemData: itemData,
                    createPagesMenuList: this._createPagesMenuList,
                    showValidationErrorMessage: this._showValidationErrorMessage,
                    trimDomainFromOldURL: this._trimDomainFromOldURL,
                    validateOldUrlInput: this._validateOldUrlInput,
                    updateComboBox: this._updateComboBox,
                    editedRowApplied: this._editedRowApplied,
                    rowIsEdited: this._rowIsEdited,
                    deleteRow: this._deleteRow,
                    ifOldUrlAlreadyExist: this._isOldUrlExist
                }
            );

            this._itemsListObj[itemData.toWixUri + '_' + _.random(99999)] = row;
            row.insertInto(this._itemListCont._skinParts.content);
            this._itemListCont._skinParts.content.insertBefore(row, this._itemListCont._skinParts.content.firstChild);
            this._itemListCont._skinParts.content.scrollTop = 0;
            return row;
        },

        _createAddButton:function(container){
            return container.addButtonField("", ('+ ' + this._translate('ADVANCED_SEO_301_ADD_BUTTON')), null, null, 'smaller' , null, 'Add_301_redirect_row_ttid')
                .runWhenReady( function( logic ) {
                    logic._skinParts.view.setStyles({'vertical-align':'bottom', 'width':'93px', 'margin-bottom':'4px'});
                    logic.disable();
                })
                .addEvent('click', this._onAddButtonClick);
        },

        _createOldUrlInputField:function(container){
            var that = this;
            return container.addInputField(this._translate('ADVANCED_SEO_301_ROW_OLD_LINK_TITLE'), this._translate('ADVANCED_SEO_301_OLD_LINK_PLACE_HOLDER'), null, 300, {validators: [this._inputValidators._301redirectValidator]}, null, null, true)
                .runWhenReady( function( logic ) {
                    logic._skinParts.view.setStyle('width','230px');
                    logic._skinParts.input.setStyle('padding-left','8px');
                    logic._skinParts.input.addEvent(Constants.CoreEvents.KEY_UP, that._onOldUrlInputKeyUp);
                    logic._skinParts.input.addEvent(Constants.CoreEvents.CUT, that._onOldUrlInputKeyUp);
                    logic._skinParts.input.addEvent(Constants.CoreEvents.PASTE, that._onOldUrlInputKeyUp);
                    logic._stopListeningToInput();
                });
        },

        _createCombo:function(container){
            var that = this;
            var combo = container.addComboBoxField(this._translate('ADVANCED_SEO_301_ROW_DESTINATION_PAGE_TITLE'), this._createPagesMenuList(true))
                .runWhenReady( function( logic ) {
                    logic._skinParts.view.setStyles({'padding-top':'0px', 'width':'180px'});
                })
                .addEvent('inputChanged', that._comboInputChanged);
            return combo;
        },

        _createSubTitle:function(container){
            container.addInlineTextLinkField(null, this._translate('ADVANCED_SEO_301_SUB_TITLE'), this._translate('HELPLET_LEARN_MORE'))
                .runWhenReady( function( labelLogic ) {
                    labelLogic._skinParts.label.setStyles({'margin-right': '20px', 'margin-bottom': '2px', 'padding': '.2em 0', 'font-size': '14px'});
                })
                .addEvent('click', this._showLearnMoreDialog);
            container.addBreakLine('18px');
        },

        _createDomainTitle:function(container){
            var isPremium = this.resources.W.Config.isPremiumUser();
            var domainTitle = '';
            var domainURL = this.resources.W.Config.getUserPublicUrl();
            if(isPremium && (domainURL.indexOf('.wix.com/')===-1)){
                domainTitle = this._translate('ADVANCED_SEO_301_CONNECTED_DOMAIN_TITLE') + '<br>';
            }
            else {
                domainTitle = '<br>' + this._translate('ADVANCED_SEO_301_NOT_CONNECTED_DOMAIN_TITLE1');
                domainURL = this._translate('ADVANCED_SEO_301_NOT_CONNECTED_DOMAIN_TITLE2');
            }
            container.addInlineTextLinkField(null, domainTitle + ' ', domainURL)
                .runWhenReady( function( labelLogic ) {
                    labelLogic._skinParts.label.setStyles({'margin-bottom': '2px', 'padding': '.2em 0', 'font-size': '14px'});
                })
                .addEvent('click', this._goToConnectDomainURL);
        },

        _createAlert:function(container){
            var that = this;
            container.addInputGroupField(function(panel){
                this.addSubLabel('gaga')
                    .runWhenReady( function( labelLogic ) {
                        that._alertLabel = labelLogic._skinParts.label;
                        that._setNotificationAlertStyle();
                        that._alertLabel.collapse();
                    });
            },'skinless');
        },

        _onOldUrlInputKeyUp:function(e){
            e.stopPropagation();
            // ignore tab and shift keys
            if (e && e.code && !this.resources.W.Utils.isInputKey(e.code)) {
                return;
            }
            var validationMessage = this._oldUrlInputField.getInputValidationErrorMessage();
            this._handleAddButtonVisibility();
            if(validationMessage) {
                var isValid = this._showValidationErrorMessage(validationMessage);
                isValid ? this._setOldUrlBorder(this.NORMAL_BORDER_COLOR) : this._setOldUrlBorder(this.ERROR_BORDER_COLOR);
            }
            if (!validationMessage && !this.isLimitReached()) {
                this._alertLabel.collapse();
                this._setOldUrlBorder(this.NORMAL_BORDER_COLOR);
            }
        },

        _setOldUrlBorder: function(color){
            if(this._oldUrlInputField) {
                this._oldUrlInputField._skinParts.input.setStyle('border', color);
            }
        },

        _showValidationErrorMessage:function(validationMessage){
            this._setNotificationAlertStyle();
            this._alertLabel.collapse();
            if(!validationMessage){
                return true;
            }
            LOG.reportEvent(wixEvents.REDIRECT_301_INVALID_CHAR);
            this._isErrorAlert = true;
            this._alertLabel.uncollapse();
            this._setErrorAlertStyle();
            this._alertLabel.set('html', validationMessage + '<br>' + this._addLink('ADVANCED_SEO_301_LEARN_MORE_LINK'));
            this._alertLabel.getElement('a').addEvent(Constants.CoreEvents.CLICK, this._onAlertLinkClick);
            return false;
        },

        _comboInputChanged:function(){
            this._handleAddButtonVisibility();
        },

        _handleAddButtonVisibility:function(){
            var validationMessage = this._oldUrlInputField.getInputValidationErrorMessage();
            this._addButton.disable();
            if(this.isLimitReached()) {
                this.handleLimit();
            }
            if(this._validateOldUrlInput(this._oldUrlInputField.getValue()) && this._comboBox.getValue() && !validationMessage){
                this._addButton.enable();
            }
        },

        _showLimitReachedMessage:function(){
            this._isErrorAlert = false;
            this._alertLabel.set('html', this._translate('ADVANCED_SEO_301_ENTRY_LIMIT1') + '(' + this.MAX_REDIRECTS + ')' + '<br>' + this._translate('ADVANCED_SEO_301_ENTRY_LIMIT2'));
            this._setErrorAlertStyle();
            this._alertLabel.uncollapse();
        },

        isLimitReached: function() {
            return this._data.get('externalUriMappings').length >= this.MAX_REDIRECTS;
        },

        handleLimit: function () {
            this._showLimitReachedMessage();
            this._oldUrlInputField.disable();
            this._comboBox.disable();
        },

        _validateOldUrlInput:function(oldURL){
            if(!oldURL){
                return false;
            }
            var match = oldURL.match(   "^(((https?:\/\/))?" +
                                        "((([a-zA-Z0-9_]+).)([a-zA-Z0-9_]+).([a-zA-Z]{2,6})(.([a-zA-Z]{2,6}))?([\/]{1,1})?))?" +
                                        "((([\/]{1,1})?([a-zA-Z0-9_%@!$&*+~-]+)?" +
                                        "([\/]{1,1})?)+)(([a-zA-Z0-9_]+).(htm|html|php|shtml|asp|jsp|aspx|xml|pdf|doc|cgi|cfm))?" +
                                        "([\/,';:()%@!$&*+~a-zA-Z0-9_\\?\\[\\]\"\n=-]*)$");
            return match;
        },

        _goToConnectDomainURL:function(){
            var isPremium = this.resources.W.Config.isPremiumUser();
            var connectDomainURL = this._translate('ADVANCED_SEO_301_CONNECT_DOMAIN_URL');

            var url = "";
            if(isPremium){
                LOG.reportEvent(wixEvents.REDIRECT_301_DOMAIN, {i1: 1});
                url = this.resources.W.Config.getUserPublicUrl();
            }
            else{
                LOG.reportEvent(wixEvents.REDIRECT_301_DOMAIN, {i1: 0});
                url = connectDomainURL;
            }

            window.open(url, '_blank');
        },

        _createApplyButton:function(container){
            var that = this;
            container.addInputGroupField(function(panel){
                this.setNumberOfItemsPerLine(0);
                this.addButtonField(null, that._translate('ADVANCED_SEO_PANEL_APPLY_BUTTON'), null, null, 'blue', '60px')
                    .runWhenReady( function( logic ) {
                        that._applyButton = logic;
                        that._applyButton.disable();
                        logic._skinParts.view.setStyles({'margin-right':'25px', 'width':'87px'});
                    })
                    .addEvent(Constants.CoreEvents.CLICK, that._onApplyButtonClick);
            },'skinless', null, null, null, 'right');
        },

        _onAddButtonClick:function(){
            var oldUrl = this._oldUrlInputField.getValue();
            var destinationUrl = this._comboBox.getValue();
            oldUrl = this._trimDomainFromOldURL(oldUrl);
            if(this._isOldUrlExist(oldUrl)){
                this._setOldUrlBorder(this.ERROR_BORDER_COLOR);
                this._addButton.disable();
                return;
            }
            LOG.reportEvent(wixEvents.REDIRECT_301_ADD_NEW_ROW, {c1: destinationUrl});
            var items = this._data.get('externalUriMappings');
            var item = {fromExternalUri: oldUrl, toWixUri: destinationUrl};
            items.splice(0, 0, item);
            if(items.length > this.MAX_REDIRECTS) {
                return;
            } else {
                this._create301UrlRow(item);
                this._fireDataChangeEvent();
                this._resetOldUrlAndCombo();
                this._addButton.disable();
                this._applyButton.enable();
            }
        },

        _isOldUrlExist:function(oldUrl){
            var isExist = false;
            _.forEach(this._itemsListObj, function (item) {
                var dataItem = item.getLogic().getDataItem();
                if(dataItem) {
                    var fromExternalUri = dataItem.get('fromExternalUri');
                    if (oldUrl === fromExternalUri) {
                        this._showValidationErrorMessage(this._translate('ADVANCED_SEO_301_DUP_MSG'));
                        isExist = true;
                    }
                }
            },this);
            return isExist;
        },

        _resetOldUrlAndCombo:function(){
            this._oldUrlInputField.setValue('');
            this._comboBox.setValue(this._comboBox.getDataProviderItems()[0].value);
        },

        _trimDomainFromOldURL:function(oldURL){
            oldURL = oldURL.toLowerCase();

            if (oldURL.indexOf('://') > -1 && oldURL.indexOf('://') < 8) {
                // remove protocol [http(s)://]
                oldURL = oldURL.substring(oldURL.indexOf('//') + 2, oldURL.length);

                // then find first slash after the protocol
                var indexOfStartTrimming = (oldURL.indexOf('/')> -1) ? oldURL.indexOf('/') : 0;

                // and trim everything before it [host (www.wix.com)]
                oldURL = oldURL.substring(indexOfStartTrimming, oldURL.length);
            }
            if(oldURL.indexOf('/') !== 0){
                // add starting slash
                oldURL = '/' + oldURL;
            }
            return oldURL;
        },

        _fireDataChangeEvent:function(){
            this._data.fireDataChangeEvent();
            this._handleAddButtonVisibility();
        },

        _deleteRow:function(itemData){
            LOG.reportEvent(wixEvents.REDIRECT_301_DELETE_ROW);
            var items = this._data.get('externalUriMappings');
            for(var i=0; i<items.length; i++){
                if(items[i].fromExternalUri === itemData.fromExternalUri && items[i].toWixUri === itemData.toWixUri ){
                    items.splice(i, 1);
                    break;
                }
            }
            this._resetOldUrlAndCombo();
            this._setNotificationAlertStyle();
            this._alertLabel.collapse();
            this._setOldUrlBorder(this.NORMAL_BORDER_COLOR);
            this._applyButton.enable();
            this._data.fireDataChangeEvent();
            this._addButton.disable();
        },

        _rowIsEdited:function(){
            LOG.reportEvent(wixEvents.REDIRECT_301_EDIT_ROW);
            if(this.isLimitReached()) {
                this.handleLimit();
            }
            this._setNotificationAlertStyle();
            this._alertLabel.collapse();
            this._setOldUrlBorder(this.NORMAL_BORDER_COLOR);
            this._resetOldUrlAndCombo();
            this._data.fireDataChangeEvent();
            this._applyButton.disable();
            this._addButton.disable();
        },

        _editedRowApplied:function(newParams, lastParams){
            LOG.reportEvent(wixEvents.REDIRECT_301_APPLY_EDITED_ROW, {c1: newParams.toWixUri});
            if(this.isLimitReached()) {
                this.handleLimit();
            }
            var items = this._data.get('externalUriMappings');
            var dirtyItem = _.find(items, function(item){
                return item.fromExternalUri === lastParams.oldUrl && item.toWixUri === lastParams.toWixUri
            });
            if (dirtyItem) {
                dirtyItem.fromExternalUri = newParams.oldUrl;
                dirtyItem.toWixUri = newParams.toWixUri
            }
            this._applyButton.enable();
            this._data.fireDataChangeEvent();
            this._addButton.disable();
        },

        _onApplyButtonClick:function(){
            LOG.reportEvent(wixEvents.REDIRECT_301_APPLY_CHANGES, {i1: this._data.get('externalUriMappings').length});
            this._applyButton.disable();
            this._showSuccessMessage();
        },

        _showSuccessMessage:function(){
            this._isErrorAlert = false;
            this._setSuccessAlertStyle();
            this._alertLabel.uncollapse();
            this._alertLabel.set('html', this._translate('ADVANCED_SEO_301_VALIDATION_SUCCESS_MESSAGE5') + '<br>' + this._addLink('ADVANCED_SEO_301_VALIDATION_SUCCESS_MESSAGE2') + this._translate('ADVANCED_SEO_PANEL_VALIDATION_SUCCESS_MESSAGE3'));
            this._alertLabel.getElement('a').addEvent(Constants.CoreEvents.CLICK, this._onAlertLinkClick);
        },

        _setErrorAlertStyle:function(){
            this._alertLabel.setStyles({'margin-top': '-54px', 'height': '5px', 'color': '#c90000'});
        },

        _setNotificationAlertStyle:function(){
            this._alertLabel.setStyles({'margin-top': '-54px', 'height': '5px', 'color': '#000000'});
        },

        _setSuccessAlertStyle:function(){
            this._alertLabel.setStyles({'margin-top': '-54px', 'height': '5px', 'color': '#60BC57'});
        },

        _showLearnMoreDialog:function(){
            LOG.reportEvent(wixEvents.REDIRECT_301_LEARN_MORE);
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'Redirect301LearnMore');
        },

        _onAlertLinkClick:function(){
            if(this._isErrorAlert) {
                LOG.reportEvent(wixEvents.REDIRECT_301_INVALID_CHAR_LEARN_MORE_CLICKED);
                this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'Redirect301LearnMoreOnInvalidOldURL');
            }
            else{
                this.resources.W.Commands.executeCommand('WEditorCommands.OpenPublishDialog', {});
            }
        },


        _addLink: function(wording) {
            return ' <a target="blank">' + this._translate(wording) + '</a>';
        },

        _onDialogClosed:function(){
            this._alertLabel.collapse();
            this._setNotificationAlertStyle();
        },

        setDialogFocus:function(){
                this._oldUrlInputField.setFocus();
        },

        onDialogCollapse:function(){
            LOG.reportEvent(wixEvents.REDIRECT_301_OPENED_CLOSED, {i1: 0});
        },

        onDialogUncollapse:function(){
            LOG.reportEvent(wixEvents.REDIRECT_301_OPENED_CLOSED, {i1: 1});
        }
    });
});
