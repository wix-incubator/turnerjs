define.Class('wysiwyg.editor.components.panels.traits.MobileComponentPanelPropertySplitHandler', function(classDefinition) {
    /**type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.utilize(['wysiwyg.editor.managers.preview.MobileComponentPropertyHandler']);

    def.binds(['_onResetPropertiesButtonClicked', '_onInnerPanelReady']);

    def.statics({
        DIALOG_ARGS: {
            icon: {x: 0, y: 0, width: 85, height: 70,  url:"mobile/props_not_connected.png"},
            title: 'MOBILE_COMP_PROPS_SPLIT_WARNING_TITLE',
            description: 'MOBILE_COMP_PROPS_SPLIT_WARNING_DESCRIPTION',
            buttonSet: [
                {
                    label: 'GOT_IT',
                    color: Constants.DialogWindow.BUTTON_COLOR.BLUE,
                    align: Constants.DialogWindow.BUTTON_ALIGN.RIGHT
                }
            ]
        }
    });

    def.methods({

        initialize:function (compId, viewNode, args) {
            this.resources.W.Preview.getPreviewManagersAsync(function(previewManagers){
                this._componentDataManager = previewManagers.ComponentData;
                this._mobileComptPropHandler = new this.imports.MobileComponentPropertyHandler(this._componentDataManager);
            }.bind(this));

            this._wasUserNotifiedOnPropsSplit = false;
        },

        /************************* public API *************************/

        isSupportedByMobilePanelUndo: function() {
            return this._editedComponent && (this._isPropertiesSplitActionDisabled() || this._areCurrentComponentPropertiesSplitByUser());
        },

        areComponentPropertiesSplit: function(component) {
            return this._mobileComptPropHandler.arePropertiesSplit(component);
        },

        splitMobilePropertiesFromDesktop: function(component, newRawProperties) {
            this._mobileComptPropHandler.splitMobileComponentProperties(component, newRawProperties);
        },

        splitMobileComponentProperties: function(newRawProperties, isUndoSplit) {
            this._removePropertyChangeListenerIfNeeded(isUndoSplit);
            this.splitMobilePropertiesFromDesktop(this._editedComponent, newRawProperties);
            this._rebuildInnerPanel();
            this._toggleResetButton(true);
        },

        revertMobileComponentPropertiesSplit: function() {
            var undoData, oldValue = this._editedComponent.getComponentProperties().cloneData();

            this._mobileComptPropHandler.revertMobileComponentPropertiesToOriginalComponentProperties(this._editedComponent);

            undoData = {newValue: this._editedComponent.getComponentProperties().cloneData(), oldValue: oldValue, action: 'attach'};
            this._notifyUndoRedoManager('WEditorCommands.MobilePropertyAttach', undoData);
            this._rebuildInnerPanel();
            this._toggleResetButton(false);
        },

        /**************************************************************/

        _removePropertyChangeListenerIfNeeded: function(isUndoSplit) {
            var componentProperties = this._editedComponent.getComponentProperties();
            if (isUndoSplit && this._mobileComptPropHandler.isComponentToModify(this._editedComponent)) {
                componentProperties.off(Constants.DataEvents.DATA_CHANGED, this, this._setMobileComponentPropertiesSplit);
            }
        },

        _areCurrentComponentPropertiesSplitByUser: function() {
            if (!this._editedComponent) {
                return false;
            }
            return this._mobileComptPropHandler.areMobileComponentPropertiesSplitByUser(this._editedComponent);
        },

        _isPropertiesSplitActionDisabled: function() {
            return !this._mobileComptPropHandler.isMobileComponentPropertiesSplitEnabled(this._editedComponent);
        },

        _rebuildInnerPanel: function() {
            this._disposeInnerDataPanel();
            this._setPanelPartsFromData();
        },

        _toggleResetButton: function(isEnabled) {
            var resetButton = this._skinParts.mobilePropertiesResetButton;
            isEnabled ? resetButton.enable() : resetButton.disable();
        },

        _initiatePanelHeader: function() {
            this._skinParts.mobilePropertiesResetButton.addEvent('click', this._onResetPropertiesButtonClicked);
            this._skinParts.mobilePropertiesResetButton._view.getElement('.tooltipIcon').setStyles({position: 'absolute', float: 'none', top: '-20px', right: '3px'});
        },

        _onResetPropertiesButtonClicked: function() {
            this.revertMobileComponentPropertiesSplit();
            this._reportBIEvent('MOBILE_PROPS_RESET');
        },

        _notifyUndoRedoManager: function(command, undoData) {
            W.UndoRedoManager.startTransaction();
            this.resources.W.Commands.executeCommand(command, undoData);
            W.UndoRedoManager.endTransaction();
        },

        _setMobileSplitProps: function() {
            if (!this._editedComponent) {
                return;
            }
            if (this._mobileComptPropHandler.isMobileComponentPropertiesSplitEnabled(this._editedComponent)) {
                this._changeResetButtonVisibility(true);
                this._toggleResetButton(this._mobileComptPropHandler.areMobileComponentPropertiesSplitByUser(this._editedComponent));
            }
            else {
                this._changeResetButtonVisibility(false);
            }
        },

        _changeResetButtonVisibility: function(isVisible) {
            var mobilePropsButtonContainer = this._skinParts.mobilePropertiesResetButton._view.getParent();
            isVisible ? mobilePropsButtonContainer.uncollapse() : mobilePropsButtonContainer.collapse();
        },

        _getDataPanelParams: function() {
            var dataPanelParams = {};
            dataPanelParams.previewComponent = this._editedComponent;
            dataPanelParams.enablePropertySplit = this._mobileComptPropHandler.isEnabled(this._editedComponent);
            return dataPanelParams;
        },

        _getInnerPanelReadyCallback: function() {
            return this._mobileComptPropHandler.shouldListenToDesktopComponentPropertiesChange(this._editedComponent) ? this._onInnerPanelReady : null;
        },

        _onInnerPanelReady: function(panelLogic) {
            if (!panelLogic._previewComponent) {
                return;
            }
            var originalComponentProperties = panelLogic._previewComponent.getComponentProperties();
            if (originalComponentProperties) {
                originalComponentProperties.on(Constants.DataEvents.DATA_CHANGED, this, this._setMobileComponentPropertiesSplit);
            }
        },

        _setMobileComponentPropertiesSplit: function(eventInfo) {
            var onSplitCallback, data = eventInfo.data;
            var propertiesItem = data.dataItem, fieldName = data.field, oldValue = data.oldValue;
            if (!this._isMobile()) { //it remains true because we arrive here before the split (as a result of properties change)
                return;
            }

            propertiesItem.off(Constants.DataEvents.DATA_CHANGED, this, this._setMobileComponentPropertiesSplit);
            if (this._wasUserNotifiedOnPropsSplit) {
                var timeout = Browser.ie ? 30 : 0;
                this.resources.W.Utils.callLater(function(){
                    this._splitMobilePropsAndRevertDesktop(propertiesItem, fieldName, oldValue);
                    this._reportBIEvent('MOBILE_PROPS_SPLIT');
                }, null, this, timeout); //trying to solve bug #MOB-1284
            }
            else {
                onSplitCallback = this._getOnSplitCallback(propertiesItem, fieldName, oldValue);
                W.EditorDialogs.openPromptDialogWithIcon(this.DIALOG_ARGS.description, this.DIALOG_ARGS.buttonSet, this.DIALOG_ARGS.icon, onSplitCallback.bind(this), this.DIALOG_ARGS.title, this.DIALOG_ARGS.buttonSet[0].label, null, null, null, null, 'SIDE_PANEL_MobileSettingsPanel');
            }
        },

        _getOnSplitCallback: function(propertiesItem, fieldName, oldValue) {
            return function () {
                this._splitMobilePropsAndRevertDesktop(propertiesItem, fieldName, oldValue);
                this._reportBIEvent('MOBILE_FIRST_PROPS_SPLIT_DIALOG_APPROVED');
                this._wasUserNotifiedOnPropsSplit = true;
            };
        },

        _reportBIEvent: function(eventName) {
            LOG.reportEvent(wixEvents[eventName], {c1: this._editedComponent.$className});
        },

        _splitMobilePropsAndRevertDesktop: function(propertiesItem, fieldName, oldFieldValue) {
            var undoData;
            var oldValue = this._editedComponent.getComponentProperties().cloneData();

            this.splitMobileComponentProperties();
            if (!this._mobileComptPropHandler.isComponentToModify(this._editedComponent)) {
                this._revertOriginalComponentProperties(propertiesItem, fieldName, oldFieldValue);
            }
            undoData = {newValue: this._editedComponent.getComponentProperties().cloneData(), oldValue: oldValue, action: 'detach'};
            this._notifyUndoRedoManager('WEditorCommands.MobilePropertyDetach', undoData);
        },

        _revertOriginalComponentProperties: function(propertiesItem, fieldName, oldValue) {
            //we don't want to record the revert action
            W.UndoRedoManager.endTransaction();
            propertiesItem.set(fieldName, oldValue[fieldName]);
        }
    });
});
