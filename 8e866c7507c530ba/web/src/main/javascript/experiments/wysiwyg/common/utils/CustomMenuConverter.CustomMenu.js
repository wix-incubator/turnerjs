define.experiment.newClass('wysiwyg.common.utils.CustomMenuConverter.CustomMenu', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.binds(['_handleDetachRequest']);

    def.methods({
        _initConverter: function () {
            var dataId = this.getDataItem().get('menuRef');

            this._dataManager = this.resources.W.Preview.getPreviewManagers().Data;
            this._isSiteMenu = dataId.indexOf('MAIN_MENU') > -1;

            if(this._isSiteMenu){
                this._setupEditSiteMenuSkinParts();
            } else {
                this._setupEditCustomMenuSkinParts(this._dataManager.getDataByQuery(dataId));
            }
        },

        _setupEditSiteMenuSkinParts: function () {
            this._skinParts.menuName.setLabel(this.resources.W.Resources.getCur('CUSTOMMENU_MenuPanel_SiteMenu'));
            this._skinParts.editMenu.setButtonLabel(this.resources.W.Resources.getCur('CUSTOMMENU_MenuPanel_EditSiteMenu'));
            this._skinParts.editMenu.on(Constants.CoreEvents.CLICK, this, this._editSiteMenu);
            this._skinParts.detach.on(Constants.CoreEvents.CLICK, this, this._confirmDetach);
        },

        _setupEditCustomMenuSkinParts: function (dataObject) {
            this._skinParts.editMenu.setButtonLabel(this.resources.W.Resources.getCur('CUSTOMMENU_MenuPanel_EditMenu'));
            this._skinParts.editMenu.on(Constants.CoreEvents.CLICK, this, this._editCustomMenu);

            if(dataObject){
                this._skinParts.editMenu.off(Constants.CoreEvents.CLICK, this, this._editSiteMenu);
                this._skinParts.detach.off(Constants.CoreEvents.CLICK, this, this._confirmDetach);
                this._skinParts.detach.dispose();
                this._skinParts.menuName.setLabel(dataObject.get('name'));
            }
        },

        _editCustomMenu: function () {
            var dataId = this.getDataItem().get('menuRef');

            this.resources.W.Commands.executeCommand('WEditorCommands.CustomMenu.ManageMenuItemsDialog', {dataId: dataId}, this);
        },

        _editSiteMenu: function () {
            this.resources.W.Commands.executeCommand('WEditorCommands.Pages', {}, this);
        },

        _confirmDetach: function () {
            this.resources.W.Commands.executeCommand('W.EditorCommands.CustomMenu.ConfirmDetachDialog', {okCallback: this._handleDetachRequest}, this);
        },

        _handleDetachRequest: function(event){
            if(event.result === 'CUSTOMMENU_ConfirmDetachDialog_Yes'){
                this._detachSiteMenu();
            }
        },

        _detachSiteMenu: function () {
            var newMenuName = this.resources.W.Resources.getCur('CUSTOMMENU_MenuPanel_CopyOfSiteMenu'),
                newCustomMenu = this._dataManager.addDataItemWithUniqueId('', {type: 'CustomMenu', name: newMenuName}),
                dataObject = newCustomMenu.dataObject,
                dataId = '#' + newCustomMenu.id;

            this._convertSiteMenuToCustomMenu(this._dataManager, dataObject, W.Preview.getPreviewManagers().Data.getDataByQuery('#MAIN_MENU').get('items'));
            this._addCustomMenuToCollection(dataId);
            this.getDataItem().set('menuRef', dataId);
            this._setupEditCustomMenuSkinParts(dataObject);
            this._isSiteMenu = false;
            this.resources.W.Commands.executeCommand('WEditorCommands.CustomMenu.ManageMenuItemsDialog', {dataId: dataId}, this);
        },

        _convertSiteMenuToCustomMenu: function (dataManager, customMenu, siteMenuItems) {
            siteMenuItems.forEach(function (item) {
                customMenu.get('items').push(this._convertMenuItemToBasicMenuItem(dataManager, item));
            }.bind(this));

            return customMenu;
        },

        _convertMenuItemToBasicMenuItem: function (dataManager, menuItem) {
            var pageLink = dataManager.addDataItemWithUniqueId('', {
                    type: 'PageLink',
                    pageId: menuItem.get('refId')
                }),
                items = [];

            menuItem.get('items').forEach(function (item) {
                items.push(this._convertMenuItemToBasicMenuItem(dataManager, item));
            }.bind(this));

            return this.resources.W.Data.addDataItemWithUniqueId('cm', {'link': '#' + pageLink.id, 'items': items, 'type': 'BasicMenuItem'}).dataObject;
        },

        _addCustomMenuToCollection: function (dataId) {
            var collection = this._dataManager.getDataByQuery('#CUSTOM_MENUS');

            if (!collection) {
                collection = this._dataManager.addDataItemWithId('CUSTOM_MENUS', {type: 'CustomMenusCollection'});
            }

            collection.get('menus').push(dataId);
        }
    });
});
