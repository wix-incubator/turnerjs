define.experiment.newComponent('wysiwyg.editor.components.dialogs.CustomMenuManageMenuItemsDialog.CustomMenu', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.binds(['_onDialogClosing', '_onItemCheckedListener', '_onLinkAddedListener', '_updateMenuName']);

    def.resources(['W.Commands', 'W.Resources']);

    def.skinParts({
        upDownLabel: {
            type: 'wysiwyg.editor.components.inputs.Label',
            autoBindDictionary: 'CUSTOMMENU_ManageMenuItemsDialog_MoveUpDown',
            argObject: {
                spriteSrc:'icons/custom_menu_move_up_down.png',
                spriteSize: {
                    width: '20px',
                    height: '20px'
                }
            }
        },
        rightLabel: {
            type: 'wysiwyg.editor.components.inputs.Label',
            autoBindDictionary: 'CUSTOMMENU_ManageMenuItemsDialog_MakeSubItems',
            argObject: {
                spriteSrc:'icons/custom_menu_make_subitem.png',
                spriteSize: {
                    width: '20px',
                    height: '20px'
                }
            }
        },
        menuName: {
            type: 'wysiwyg.editor.components.inputs.Input',
            autoBindDictionary: 'CUSTOMMENU_ManageMenuItemsDialog_MenuName',
            argObject: {
                boldLabel: true
            }
        },
        menuItems: {
            type: 'wysiwyg.editor.components.inputs.Label',
            autoBindDictionary: 'CUSTOMMENU_ManageMenuItemsDialog_MenuItems',
            argObject: {
                boldLabel: true
            }
        },
        scrollableArea: {
            type: 'htmlElement'
        },
        customMenu: {
            type: 'wysiwyg.editor.components.panels.navigation.SiteNavigationEditor',
            argObject: {
                maxSubmenuLevels: 1 // To be defined?
            }
        },
        startBuilding: {
            type: 'htmlElement'
        },
        clickAdd: {
            type: 'htmlElement'
        },
        arrowContainer: {
            type: 'htmlElement'
        },
        addItem: {
            type: 'wysiwyg.editor.components.WButton',
            autoBindDictionary: 'CUSTOMMENU_ManageMenuItemsDialog_Add',
            argObject: {
                iconSrc:'icons/top-bar-icons.png',
                spriteOffset: {
                    x: '0',
                    y:'-122px'
                }
            }
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
            this._dataId = args.dataId;
            this._addedPages = {};
            this._initMenuData();
            this._startListeners();
            this._initItemsCounter();
        },

        _onAllSkinPartsReady: function(){
            this._toggleEmptyList();

            this._skinParts.customMenu._treeEditor.on('buttonAdded', this, this._markAdded);
            this._skinParts.customMenu.setScrollArea(this._skinParts.scrollableArea);
            this._skinParts.customMenu.initMenu(this._dataId, Constants.NavigationButtons.CUSTOM_MENU_NAVIGATION_BUTTON);

            this._skinParts.menuName.setValue(this._customMenuData.get('name'));
            this._skinParts.startBuilding.set('html', this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_StartBuilding', 'Start Building Your Menu'));
            this._skinParts.clickAdd.set('html', this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_ClickAdd', 'Click Add to select menu items.'));

            this._skinParts.addItem.on(Constants.CoreEvents.CLICK, this, this._addItemClickListener);
            this._skinParts.menuName.addEvent('inputChanged', this._updateMenuName);
            this._updateMenuName();
        },

        _initMenuData: function(){
            this._dataManager = this.resources.W.Preview.getPreviewManagers().Data;

            if(this._dataId){
                this._customMenuData = this._dataManager.getDataByQuery(this._dataId);
            } else {
                this._customMenuData = this._dataManager.addDataItemWithUniqueId('',{type: 'CustomMenu', name: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_NewMenu')}).dataObject;
                this._dataId = '#' + this._customMenuData.get('id');
                this._addCustomMenuToCollection(this._dataId);
            }

            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.CustomMenu.CheckboxStateChanged', this, this._onItemCheckedListener);
            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.CustomMenu.LinkAdded', this, this._onLinkAddedListener);
            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.CustomMenu.AddMenuHeader', this, this._onHeaderAddedListener);
            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.CustomMenu.Actions.DeleteItem', this, this._deleteItem);
            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.CustomMenu.Actions.DuplicateItem', this, this._duplicateItem);
        },

        _duplicateItem: function(params){
            var data = params.data,
                link = data.get('link'),
                title = this._itemsDefaultNames.CopyOf + ' ' + data.get('label'),
                duplicatedData;

            if(link === '#CUSTOM_MENU_HEADER'){
                duplicatedData = this._duplicateHeader(title);
            } else {
                duplicatedData = this._duplicateLink(link, title);
            }

            this.resources.W.Commands.executeCommand("W.EditorCommands.CustomMenu.OpenEditItemSettingsDialog", {data: duplicatedData});
        },

        _duplicateHeader: function(title){
            return this._customMenuData.createAndAddNavigationItem('#CUSTOM_MENU_HEADER', null, null, title);
        },

        _duplicateLink: function(link, title){
            var linkDataItem = this._dataManager.getDataByQuery(link),
                linkItemCopy = this._dataManager.addDataItemWithUniqueId('', linkDataItem.cloneData());

            return this._customMenuData.createAndAddNavigationItem('#' + linkItemCopy.id, null, null, title);
        },

        _deleteItem: function(params){
            var data = params.data;

            if(this._customMenuData.get('items').length === 1){
                return;
            }

            this._customMenuData.deleteNavigationItemById(data.get('id'));
            this._toggleEmptyList();
        },

        _onHeaderAddedListener: function(){
            var type = 'header';
            this._customMenuData.createAndAddNavigationItem('#CUSTOM_MENU_HEADER', null, null, this._getNewItemName(type));

            this._toggleEmptyList();
        },

        _onLinkAddedListener: function(params){
            var dataChange = params.data,
                newLinkId = dataChange.newValue.link,
                oldLinkId = dataChange.oldValue.link,
                newLinkType;

            if(oldLinkId){
                this._customMenuData.getItemByRefId(newLinkId).fireEvent('dataChanged');
            } else {
                newLinkType = this._getLinkType(newLinkId);
                this._customMenuData.createAndAddNavigationItem(newLinkId, null, null, this._getNewItemName(newLinkType));
            }

            this._toggleEmptyList();
        },

        _getLinkType: function(linkId){
            var linkDataItem = this._dataManager.getDataByQuery(linkId),
                type = linkDataItem.getType(),
                anchorDataId = linkDataItem.get('anchorDataId');

            if(type === 'AnchorLink' && anchorDataId && anchorDataId.indexOf('SCROLL_TO_') === 0){
                return anchorDataId;
            }

            return type;
        },

        _onItemCheckedListener: function(params){
            var isChecked = params.state,
                dataItem = params.dataItem,
                pageId = dataItem.get('refId');

            if(isChecked){
                this._addPage(pageId);
            } else {
                this._removePage(pageId);
            }

            this._toggleEmptyList();
        },

        _addPage: function(pageId){
            var pageLink = this._dataManager.addDataItemWithUniqueId('', {
                    type: 'PageLink',
                    pageId: pageId
                });

            this._customMenuData.createAndAddNavigationItem('#' + pageLink.id);
        },

        _removePage: function(pageId){
            this._customMenuData.deleteNavigationItemById(this._addedPages[pageId].navItemId);
            delete this._addedPages[pageId];
        },

        _toggleEmptyList: function(){
            var isEmpty = this._customMenuData.getItems().length === 0;

            if(isEmpty){
                this._skinParts.arrowContainer.uncollapse();
            } else {
                this._skinParts.arrowContainer.collapse();
            }
        },

        _onDialogClosing: function(){
            this._clearListeners();
        },

        _startListeners: function(){
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
        },

        _clearListeners: function(){
            this._skinParts.customMenu.unregisterCommands();
            this._skinParts.addItem.off(Constants.CoreEvents.CLICK, this, this._addItemClickListener);
            this._skinParts.menuName.removeEvent('inputChanged', this._updateMenuName);
            this._dialogWindow.removeEvent('onDialogClosing', this._onDialogClosing);
            this.resources.W.Commands.unregisterCommand('W.EditorCommands.CustomMenu.CheckboxStateChanged');
            this.resources.W.Commands.unregisterCommand('W.EditorCommands.CustomMenu.LinkAdded');
            this.resources.W.Commands.unregisterCommand('W.EditorCommands.CustomMenu.AddMenuHeader');
            this.resources.W.Commands.unregisterCommand('W.EditorCommands.CustomMenu.Actions.DeleteItem');
        },

        _addItemClickListener: function(){
            var dialogPosition = this._getDesiredAddLinkDialogPosition(),
                params = {
                    dialogPosition: dialogPosition,
                    customMenuCheckedState: {itemSpecificArgs: this._addedPages}
                };

            this.resources.W.Commands.executeCommand('W.EditorCommands.CustomMenu.OpenAddLinkDialog', params, this);
        },

        _getDesiredAddLinkDialogPosition: function(){
            var position = this._skinParts.addItem.getGlobalPosition(),
                size = this._skinParts.addItem.$view.getSize(),
                dialogHeight = 111;

            return  {
                x: position.x + size.x + 5,
                y: position.y - (dialogHeight - size.y)/2
            };
        },

        _initItemsCounter: function(){
            this._itemsCounterByType = {};
            this._itemsDefaultNames = {
                SCROLL_TO_BOTTOM: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_AnchorBottom', 'Scroll to Bottom'),
                SCROLL_TO_TOP: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_AnchorTop', 'Scroll to Top'),
                AnchorLink: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_Anchor', 'Anchor'),
                DocumentLink: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_Document', 'Document'),
                EmailLink: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_Email', 'Email'),
                ExternalLink: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_WebAddress', 'Web Address'),
                header: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_Header', 'Header'),
                PageLink: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_Page', 'Page'),
                CopyOf: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_CopyOf', 'Copy of')
            };
        },

        _increaseItemsCounter: function(type){
            if(!this._itemsCounterByType[type]){
                this._itemsCounterByType[type] = 0;
            }
            this._itemsCounterByType[type]++;
        },

        _getItemsCounter: function(type){
            return this._itemsCounterByType[type] || 0;
        },

        _getNewItemName: function(type){
            var name = this._itemsDefaultNames[type] || 'New Item',
                counter = this._getItemsCounter(type) + 1;

            this._increaseItemsCounter(type);

            return name + ' ' + counter;
        },

        _updateMenuName: function(){
            this._customMenuData.set('name', this._skinParts.menuName.getValue());
        },

        _addCustomMenuToCollection: function(dataId){
            var collection = this._dataManager.getDataByQuery('#CUSTOM_MENUS');

            if(!collection){
                collection = this._dataManager.addDataItemWithId('CUSTOM_MENUS', {type: 'CustomMenusCollection'});
            }

            collection.get('menus').push(dataId);
        },

        _markAdded: function(event){
            var navItem = event.data.treeItem,
                navData = navItem.getDataItem(),
                linkedData = this._dataManager.getDataByQuery(navData.get('link'));

            if(linkedData && linkedData.getType() === 'PageLink'){
                this._addedPages[linkedData.get('pageId')] = {
                    isCheckboxChecked: true,
                    navItemId: navData.get('id')
                };
            }
        }
    });
});