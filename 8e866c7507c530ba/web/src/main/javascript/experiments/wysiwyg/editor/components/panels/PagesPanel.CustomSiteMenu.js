define.experiment.component('wysiwyg.editor.components.panels.PagesPanel.CustomSiteMenu', function(componentDefinition, experimentStartegy){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStartegy;

    def.skinParts(strategy.customizeField(function(original){
            original.addPage.argObject = {
                iconSrc: 'icons/site_menu_add_item.png',
                spriteOffset: {x: '0', y: '0'}/*,
                iconSize: {width: '20px', height: '20px'}*/
            };
            original.addPage.autoBindDictionary = 'CUSTOMMENU_ManageMenuItemsDialog_Add';
            delete original.addPage.command;
            return original;
        })
    );
    def.methods({

        initialize: strategy.after(function(){
            this._registerCommands();
            this._initDefaultNames();
        }),
        _initDefaultNames: function(){
            this._itemsDefaultNames = {
                SCROLL_TO_BOTTOM: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_AnchorBottom', 'Scroll to Bottom'),
                SCROLL_TO_TOP: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_AnchorTop', 'Scroll to Top'),
                AnchorLink: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_Anchor', 'Anchor'),
                DocumentLink: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_Document', 'Document'),
                EmailLink: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_Email', 'Email'),
                ExternalLink: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_WebAddress', 'Web Address'),
                header: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_DefaultName_Header', 'Header')
            };
        },
        _onAllSkinPartsReady: strategy.after(function(){
            this._skinParts.addPage.on(Constants.CoreEvents.CLICK, this, this._addPageClickListener);
        }),
        _addPageClickListener: function(){
            var dialogPosition = this._getDesiredAddLinkDialogPosition(),
                params = {
                    dialogPosition: dialogPosition,
                    customMenuCheckedState: {itemSpecificArgs: this._addedPages}
                };

            this.resources.W.Commands.executeCommand('W.EditorCommands.CustomMenu.OpenAddLinkDialog', params, this);
        },
        _getDesiredAddLinkDialogPosition: function(){
            var position = this._skinParts.addPage.getGlobalPosition(),
                size = this._skinParts.addPage.$view.getSize();

            return  {
                x: position.x + size.x + 5,
                y: position.y - 10 - window.pageYOffset
            };
        },
        _deleteItem: function(params){
            var event = params.data.getLinkedDataItem() ? window.wixEvents.REMOVE_LINK_FROM_MENU : window.wixEvents.REMOVE_HEADER_FROM_MENU,
                datItemId = params.data.get('id');

            this._skinParts.siteMenu.getDataItem().deleteNavigationItemByDataItem(params.data);
            LOG.reportEvent(event, {c1: datItemId});
        },
        _registerCommands: function(){
            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.CustomMenu.AddMenuHeader', this, this._onHeaderAddedListener);
            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.CustomMenu.LinkAdded', this, this._onLinkAddedListener);
            this.resources.W.Commands.registerCommandAndListener('W.EditorCommands.CustomMenu.Actions.DeleteItem', this, this._deleteItem);
        },
        _unregisterCommands: function(){
            this.resources.W.Commands.unregisterCommand('W.EditorCommands.CustomMenu.AddMenuHeader');
            this.resources.W.Commands.unregisterCommand('W.EditorCommands.CustomMenu.LinkAdded');
            this.resources.W.Commands.unregisterCommand('W.EditorCommands.CustomMenu.Actions.DeleteItem');
        },
        _onHeaderAddedListener: function(){
            var navigationItem = this._skinParts.siteMenu.getDataItem().createAndAddNavigationItem('#CUSTOM_MENU_HEADER', null, null, this._itemsDefaultNames.header);
            this.resources.W.Commands.executeCommand("W.EditorCommands.CustomMenu.OpenEditItemSettingsDialog", {data: navigationItem, isNewItem: true});
            LOG.reportEvent(window.wixEvents.ADD_HEADER_TO_MENU, {c1: navigationItem.get('id')});
        },
        _onLinkAddedListener: function(params){
            var dataItem = params.target,
                dataChange = params.data,
                newLinkId = dataChange.newValue.link,
                oldLinkId = dataChange.oldValue.link,
                newLinkType,
                navigationItem;

            if(oldLinkId){
                this._skinParts.siteMenu.getDataItem().getItemByRefId(newLinkId).fireEvent('dataChanged');
            } else {
                newLinkType = this._getLinkType(dataItem.getLinkedDataItem());
                navigationItem = this._skinParts.siteMenu.getDataItem().createAndAddNavigationItem({id: newLinkId.substr(1), dataObject: dataItem}, null, null, this._itemsDefaultNames[newLinkType]);
                this.resources.W.Commands.executeCommand("W.EditorCommands.CustomMenu.OpenEditItemSettingsDialog", {data: navigationItem, isNewItem: true});
                LOG.reportEvent(window.wixEvents.ADD_LINK_TO_MENU, {c1: navigationItem.get('id')});
            }
        },

        _getLinkType: function(linkedDataItem){
            var type = linkedDataItem.getType(),
                anchorDataId = linkedDataItem.get('anchorDataId');

            if(type === 'AnchorLink' && anchorDataId && anchorDataId.indexOf('SCROLL_TO_') === 0){
                return anchorDataId;
            }

            return type;
        }
    });
});