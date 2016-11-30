define.experiment.newComponent('wysiwyg.editor.components.dialogs.CustomMenuEditItemSettingsDialog.CustomSiteMenu', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Commands', 'W.EditorDialogs', 'W.Theme']);

    def.skinParts({
        /***************Actions****************/
        deleteItem: {
            type: 'wysiwyg.editor.components.WButton',
            autoBindDictionary: 'CUSTOMMENU_EditItemSettingsDialog_Delete'
        },
        duplicateItem: {
            type: 'wysiwyg.editor.components.WButton',
            autoBindDictionary: 'CUSTOMMENU_EditItemSettingsDialog_Duplicate'
        },
        /**************************************/
        /************Page section**************/
        pageNameLabel: {
            type: 'wysiwyg.editor.components.inputs.Label',
            autoBindDictionary: 'CUSTOMMENU_EditItemSettingsDialog_PageName',
            argObject: {
                boldLabel: true
            }
        },
        pageNameData: {
            type: 'wysiwyg.editor.components.inputs.Label',
            argObject: {
                boldLabel: true
            }
        },
        editPageNameCheckbox: {
            type: 'wysiwyg.editor.components.inputs.CheckBox',
            autoBindDictionary: 'CUSTOMMENU_EditItemSettingsDialog_EditPageName'
        },
        editPageNameInput: {
            type: 'wysiwyg.editor.components.inputs.Input',
            argObject: {
                boldLabel: true
            }
        },
        /**************************************/
        /************Link section**************/
        itemName: {
            type: 'wysiwyg.editor.components.inputs.Input',
            autoBindDictionary: 'CUSTOMMENU_EditItemSettingsDialog_ItemName',
            argObject: {
                boldLabel: true,
                minLength: 1,
                maxLength: Constants.Page.NAME_MAX_LENGTH,
                validatorArgs: {validators: ['htmlCharactersValidator']}
            }
        },
        itemLink: {
            type: 'wysiwyg.editor.components.inputs.Link',
            autoBindDictionary: 'CUSTOMMENU_EditItemSettingsDialog_ItemLink',
            argObject: {
                boldLabel: true,
                customLinksOrder: ['WEBSITE', 'EMAIL', 'DOCUMENT', 'ANCHOR', 'ANCHOR_TOP', 'ANCHOR_BOTTOM'],
                helpNode: '/node/23848',
                helplet: '/node/23848'
            }
        },
        /***************************************/
        /************Header section*************/
        headerName: {
            type: 'wysiwyg.editor.components.inputs.Input',
            autoBindDictionary: 'CUSTOMMENU_EditItemSettingsDialog_MenuHeaderName',
            argObject: {
                boldLabel: true,
                minLength: 1,
                maxLength: Constants.Page.NAME_MAX_LENGTH,
                validatorArgs: {validators: ['htmlCharactersValidator']}
            }
        },
        /***************************************/
        /************Common section*************/
        hideFromMenu: {
            type: 'wysiwyg.editor.components.inputs.CheckBox'
        },
        description: {
            type: 'htmlElement'
        },
        image: {
            type: 'htmlElement'
        }
    });

    def.binds(['_onEditPageNameCheckboxChanged', '_onDialogClosing', '_deleteItem', '_handleKeyUp']);

    def.states({
        section: ['sectionEditPage', 'sectionEditLink', 'sectionEditHeader'],
        mode: ['newItem', 'editItem']
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
            this._data = args.data;
            this._mobile = args.mobile;
            this._setDialogMode(args.isNewItem);
            this._dataManager = this.resources.W.Preview.getPreviewManagers().Data;
            this._initDataItem();
        },

        _setDialogMode: function(isNewItem){
            this._isNewItem = isNewItem;
            this.setState(isNewItem ? 'newItem' : 'editItem');
        },

        _initDataItem: function(){
            if(this._data.get('link') === '#CUSTOM_MENU_HEADER'){
                this.setState('sectionEditHeader');
                return;
            }

            this._linkDataItem = this._data.getLinkedDataItem();
            if(this._linkDataItem && this._linkDataItem.getType() === 'PageLink'){
                this.setState('sectionEditPage');
            } else {
                this.setState('sectionEditLink');
            }
        },

        _onAllSkinPartsReady: function(){
            this._state = this.getState('section');

            switch(this._state){
                case 'sectionEditPage':
                    this._initPageItem();
                    break;
                case 'sectionEditLink':
                    this._initLinkItem();
                    break;
                case 'sectionEditHeader':
                    this._initHeaderItem();
                    break;
            }

            if(this._mobile){
                this._skinParts.actions.dispose();
            }

            this._setIsHidden();
            this._addListeners();
        },

        _setIsHidden: function(){
            var isVisible, label;

            if(this._isNewItem) {
                this._skinParts.hideFromMenu.dispose();
                return;
            }

            if(this._mobile){
                isVisible = this._data.isVisibleMobile();
                label = this.resources.W.Resources.getCur('CUSTOMMENU_EditItemSettingsDialog_HideFromThisMenuMobile', 'Hide from this mobile menu');
            } else {
                isVisible = this._data.isVisible();
                label = this.resources.W.Resources.getCur('CUSTOMMENU_EditItemSettingsDialog_HideFromThisMenu', 'Hide from this menu');
            }

            this._skinParts.hideFromMenu.setValue(!isVisible);
            this._skinParts.hideFromMenu.setLabel(label);
        },

        _initHeaderItem: function(){
            this._setDescription(this.resources.W.Resources.getCur('CUSTOMMENU_EditItemSettingsDialog_ItemName_Desc', 'Set the header name as it appears on the menu. Pack pages and links under the header and they will appear as sub-pages and sub-links on your menu.'));
            if(this._isNewItem){
                this._skinParts.image.set('src', this.resources.W.Theme.getProperty("WEB_THEME_DIRECTORY") + 'dialogs/custom_menu_header_animation.gif');
            }
            this._skinParts.headerName.setValue(this._data.get('label'));
            this._skinParts.headerName.setFocus();
            this._skinParts.headerName.addEvent(Constants.CoreEvents.KEY_UP, this._handleKeyUp);

            if(this._mobile){
                this._skinParts.headerName.disable();
            }
        },

        _initLinkItem: function(){
            this._setDescription(this.resources.W.Resources.getCur('CUSTOMMENU_EditItemSettingsDialog_ItemLink_Desc', 'Name your link (the name you choose will show up on you Pages menu).'));
            this._skinParts.itemLink.setPreviewData(this._data);
            this._skinParts.itemLink.bindToDataItem(this._data);
            this._skinParts.itemName.setValue(this._data.get('label'));
            this._skinParts.itemName.setFocus();
            this._skinParts.itemName.addEvent(Constants.CoreEvents.KEY_UP, this._handleKeyUp);
            if(this._mobile){
                this._skinParts.itemName.disable();
                this._skinParts.itemLink.disable();
            }
        },

        _initPageItem: function(){
            var pageId = this._linkDataItem.get('pageId'),
                pageDataItem = this._dataManager.getDataByQuery(pageId),
                pageOriginalTitle = pageDataItem.get('title'),
                customTitle = this._data.get('label');

            this._skinParts.pageNameData.setLabel(pageOriginalTitle);
            this._skinParts.editPageNameInput.setValue(customTitle || pageOriginalTitle);

            if(!customTitle){
                this._skinParts.editPageNameInput.disable();
            } else {
                this._skinParts.editPageNameCheckbox.setChecked(true);
            }

            this._skinParts.editPageNameCheckbox.addEvent('inputChanged', this._onEditPageNameCheckboxChanged);
        },

        _setDescription: function(desc){
            if(!this._mobile){
                this._skinParts.description.set('html', desc);
            }
        },

        _onEditPageNameCheckboxChanged: function(event){
            var isChecked = event.value;
            if(isChecked){
                this._skinParts.editPageNameInput.enable();
            } else {
                this._skinParts.editPageNameInput.disable();
            }
        },

        _onDialogClosing: function(event){

            if(event.result === W.EditorDialogs.DialogButtons.CANCEL){
                if(this._isNewItem){
                    this._deleteItem();
                }
                return;
            }

            this._save();
        },

        _save: function(){
            switch(this._state){
                case 'sectionEditPage':
                    this._savePageItem();
                    break;
                case 'sectionEditLink':
                    this._saveLinkItem();
                    break;
                case 'sectionEditHeader':
                    this._saveHeaderItem();
                    break;
            }

            this._saveIsHidden();
        },

        _saveIsHidden: function(){
            var visible = this._isNewItem || !this._skinParts.hideFromMenu.getValue();

            if(this._mobile){
                this._data.set('isVisibleMobile', visible);
            } else if(this._data.isVisibleMobile() !== visible){
                this._data.set('isVisible', visible);
                this._data.set('isVisibleMobile', visible);
            } else {
                this._data.set('isVisible', visible);
            }
        },

        _saveHeaderItem: function(){
            var customTitle = this._skinParts.headerName.getValue();
            if(customTitle){
                this._setItemTitle(customTitle);
            }
        },

        _saveLinkItem: function(){
            var customTitle = this._skinParts.itemName.getValue();
            if(customTitle){
                this._setItemTitle(customTitle);
            } else {
                this._setEmptyTitle();
            }
        },

        _savePageItem: function(){
            var isChecked = this._skinParts.editPageNameCheckbox.getChecked(),
                customTitle = this._skinParts.editPageNameInput.getValue();

            if(isChecked && customTitle){
                this._setItemTitle(customTitle);
            } else {
                this._setEmptyTitle();
            }
        },

        _setEmptyTitle: function(){
            this._setItemTitle('');
        },

        _setItemTitle: function(label){
            this._data.set('label', label);
        },

        _warnBeforeDelete: function(){
            var title = this.resources.W.Resources.getCur('CUSTOMMENU_EditItemSettingsDialog_WarnDelete_Title', 'So You Want to Delete this {{TYPE}}...'),
                text = this.resources.W.Resources.getCur('CUSTOMMENU_EditItemSettingsDialog_WarnDelete_Text', 'This will remove your {{TYPE}}, "{{NAME}}", from the menu.'),
                typeAndName = this._getTypeAndName();

            this.resources.W.EditorDialogs.openPromptDialog(
                title.replace('{{TYPE}}', typeAndName.type),
                text.replace('{{TYPE}}', typeAndName.type.toLowerCase()).replace('{{NAME}}', typeAndName.name),
                undefined,
                this.resources.W.EditorDialogs.DialogButtonSet.DELETE_CANCEL,
                this._deleteItem);
        },

        _getTypeAndName: function(){
            switch(this._state){
                case 'sectionEditLink':
                    return {
                        type: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_AddItemLink', 'Link'),
                        name: this._skinParts.itemName.getValue()
                    };
                case 'sectionEditHeader':
                    return {
                        type: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_AddItemHeader', 'Header'),
                        name: this._skinParts.headerName.getValue()
                    };
            }
        },

        _deleteItem: function(response){
            if (response && response.result !== "DELETE") {
                return;
            }
            this.resources.W.Commands.executeCommand('W.EditorCommands.CustomMenu.Actions.DeleteItem', {data : this._data}, this);
            this._dialogWindow.endDialog();
        },

        _duplicateItem: function(){
            this.resources.W.Commands.executeCommand('W.EditorCommands.CustomMenu.Actions.DuplicateItem', {data : this._data}, this);
            this._dialogWindow.endDialog();
        },

        _handleKeyUp: function(event){
            var result;
            switch(event.code){
                case 13://enter
                    result = W.EditorDialogs.DialogButtons.OK;
                    break;
                case 27://escape
                    result = W.EditorDialogs.DialogButtons.CANCEL;
                    break;
            }

            if(result){
                this._dialogWindow.endDialog(null, {result: result});
            }
        },

        _addListeners: function(){
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);

            this._skinParts.deleteItem.on(Constants.CoreEvents.CLICK, this, this._warnBeforeDelete);
            this._skinParts.duplicateItem.on(Constants.CoreEvents.CLICK, this, this._duplicateItem);
        },

        _removeListeners: function(){
            this._dialogWindow.removeEvent('onDialogClosing', this._onDialogClosing);
            this._skinParts.editPageNameCheckbox.removeEvent('inputChanged', this._onEditPageNameCheckboxChanged);
            this._skinParts.itemName.removeEvent(Constants.CoreEvents.KEY_UP, this._handleKeyUp);
            this._skinParts.headerName.removeEvent(Constants.CoreEvents.KEY_UP, this._handleKeyUp);

            this._skinParts.deleteItem.off(Constants.CoreEvents.CLICK, this, this._warnBeforeDelete);
            this._skinParts.duplicateItem.off(Constants.CoreEvents.CLICK, this, this._duplicateItem);

        },


        dispose: function(){
            this._removeListeners();
            this.parent();
        }
    });
});