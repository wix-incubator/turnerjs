define.experiment.newComponent('wysiwyg.editor.components.dialogs.CustomMenuAddLinkDialog.CustomSiteMenu', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Commands', 'W.Resources']);

    def.binds(['_onDialogClosing']);

    def.states({
       addItem: ['addItem']
    });

    def.skinParts({
        addItemList: {
            type: 'htmlElement'
        },
        addItemPage: {
            type: 'wysiwyg.editor.components.ListItemButton',
            autoBindDictionary: 'CUSTOMMENU_ManageMenuItemsDialog_AddItemPage',
            argObject: {
                iconSrc: 'icons/custom_menu_item_type.png',
                iconSize:{width: 15, height: 16},
                spriteOffset:{x: 0, y: 0},
                desc: 'CUSTOMMENU_ManageMenuItemsDialog_AddItemPage_Desc'
            }
        },
        addItemLink: {
            type: 'wysiwyg.editor.components.ListItemButton',
            autoBindDictionary: 'CUSTOMMENU_ManageMenuItemsDialog_AddItemLink',
            argObject: {
                iconSrc: 'icons/custom_menu_item_type.png',
                iconSize:{width: 15, height: 15},
                spriteOffset:{x: 0, y: -19},
                desc: 'CUSTOMMENU_ManageMenuItemsDialog_AddItemLink_Desc'
            }
        },
        addItemHeader: {
            type: 'wysiwyg.editor.components.ListItemButton',
            autoBindDictionary: 'CUSTOMMENU_ManageMenuItemsDialog_AddItemHeader',
            argObject: {
                iconSrc: 'icons/custom_menu_item_type.png',
                iconSize:{width: 15, height: 14},
                spriteOffset:{x: 0, y: -36},
                desc: 'CUSTOMMENU_ManageMenuItemsDialog_AddItemHeader_Desc'
            }
        }
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
            this._customMenuCheckedState = args.customMenuCheckedState;
        },

        _onAllSkinPartsReady: function(){
            this._addClickListeners();
        },

        _onDialogClosing: function(){
            this._removeClickListeners();
        },

        _addClickListeners: function(){
            this._skinParts.addItemPage.on(Constants.CoreEvents.CLICK, this, this._addItemPageClickListener);
            this._skinParts.addItemLink.on(Constants.CoreEvents.CLICK, this, this._addItemLinkClickListener);
            this._skinParts.addItemHeader.on(Constants.CoreEvents.CLICK, this, this._addItemHeaderClickListener);
        },

        _removeClickListeners: function(){
            this._skinParts.addItemPage.off(Constants.CoreEvents.CLICK, this, this._addItemPageClickListener);
            this._skinParts.addItemLink.off(Constants.CoreEvents.CLICK, this, this._addItemLinkClickListener);
            this._skinParts.addItemHeader.off(Constants.CoreEvents.CLICK, this, this._addItemHeaderClickListener);
        },

        _addItemPageClickListener: function(){
            this.resources.W.Commands.executeCommand('WEditorCommands.AddPageDialog', this);
            this._dialogWindow.endDialog();
        },

        _addItemLinkClickListener: function(){
            var dataManager = this.resources.W.Preview.getPreviewManagers().Data,
                newLinkDataItem = dataManager.addDataItemWithUniqueId('',{type: 'BasicMenuItem'}).dataObject;

            newLinkDataItem.on(Constants.DataEvents.DATA_CHANGED, this, this._notifyManageMenu);

            this.resources.W.Commands.executeCommand('WEditorCommands.OpenLinkDialogCommand', {
                position: Constants.DialogWindow.POSITIONS.CENTER,
                data: newLinkDataItem,
                customLinksOrder: ['WEBSITE', 'EMAIL', 'DOCUMENT', 'ANCHOR', 'ANCHOR_TOP', 'ANCHOR_BOTTOM'],
                helpNode: '/node/23848',
                semiModal: false,
                title: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_AddItemLink_DialogTitle', 'Add Link to Menu'),
                description: this.resources.W.Resources.getCur('CUSTOMMENU_ManageMenuItemsDialog_AddItemLink_DialogDesc', 'To add a link to your Pages menu, pick one of the options below.')
            }, this);
            this._dialogWindow.endDialog();
        },

        _addItemHeaderClickListener: function(){
            this.resources.W.Commands.executeCommand('W.EditorCommands.CustomMenu.AddMenuHeader', {}, this);
            this._dialogWindow.endDialog();
        },

        _notifyManageMenu: function(params){
            this.resources.W.Commands.executeCommand('W.EditorCommands.CustomMenu.LinkAdded', params, this);
        }
    });
});