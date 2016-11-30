define.experiment.Class('wysiwyg.editor.managers.WDialogManager.CustomSiteMenu', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.methods({

        openCustomMenuAddLinkDialog: function (params) {
            this._createAndOpenWDialog(
                '_customMenuAddLinkDialog',
                'wysiwyg.editor.components.dialogs.CustomMenuAddLinkDialog',
                'wysiwyg.editor.skins.dialogs.CustomMenuAddLinkDialogSkin',
                function (innerLogic) {},
                {
                    width: 180,
                    top: params.dialogPosition.y,
                    left: params.dialogPosition.x,
                    position: Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll: false,
                    semiModal: true,
                    allowDrag: false,
                    buttonSet: W.EditorDialogs.DialogButtonSet.NONE,
                    dialogSkin: 'wysiwyg.editor.skins.dialogs.JustWindowDialogSkinNoPadding'
                },
                null, true, params, false, false, true
            );
        },

        openCustomMenuEditItemSettingsDialog: function (params) {
            var titleKey,
                isLinkItem = !!params.data.getLinkedDataItem(),
                isNewItem = params.isNewItem;

            if(isNewItem){
                if(isLinkItem){
                    titleKey = 'CUSTOMMENU_EditItemSettingsDialog_Title_AddLinkItem';
                } else {
                    titleKey = 'CUSTOMMENU_EditItemSettingsDialog_Title_AddHeaderItem';
                }
            } else {
                if(isLinkItem){
                    titleKey = 'CUSTOMMENU_EditItemSettingsDialog_Title_EditLinkItem';
                } else {
                    titleKey = 'CUSTOMMENU_EditItemSettingsDialog_Title_EditHeaderItem';
                }
            }

            this._createAndOpenWDialog(
                '_customMenuEditItemSettingsDialog',
                'wysiwyg.editor.components.dialogs.CustomMenuEditItemSettingsDialog',
                'wysiwyg.editor.skins.dialogs.CustomMenuEditItemSettingsDialogSkin',
                function (innerLogic) {},
                {
                    width: 300,
                    title: W.Resources.get('EDITOR_LANGUAGE', titleKey),
                    allowDrag: true,
                    buttonSet: [W.EditorDialogs.DialogButtons.CANCEL, W.EditorDialogs.DialogButtons.DONE],
                    helpButtonId: isLinkItem ? '/node/23848' : '/node/23847'
                },
                null, true, params, false, false, true
            );
        },

        openLinkDialog: function (params) {
            var helpletComponent = 'LINK_DIALOG';
            this._createAndOpenWDialog(
                '_linkDialog',
                'wysiwyg.editor.components.dialogs.LinkDialog',
                'wysiwyg.editor.skins.dialogs.LinkDialogSkin',
                function (innerLogic) {
                },
                {
                    width: 320,
                    top: params.top,
                    left: params.left,
                    position: params.position || Constants.DialogWindow.POSITIONS.DYNAMIC,
                    allowScroll: false,
                    semiModal: params.semiModal === undefined ? true : params.semiModal,
                    allowDrag: true,
                    title: params.title || W.Resources.get('EDITOR_LANGUAGE', "LINK_DIALOG_DEFAULT_TITLE"),
                    description: params.description || W.Resources.get('EDITOR_LANGUAGE', "LINK_DIALOG_DEFAULT_DESCRIPTION"),
                    helpButtonId: params.helpNode || '/node/6050',
                    helplet: params.helpNode
                },
                null, true, params, false, false
            );
        }

    });
});