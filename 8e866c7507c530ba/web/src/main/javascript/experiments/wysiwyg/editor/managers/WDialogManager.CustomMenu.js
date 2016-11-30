define.experiment.Class('wysiwyg.editor.managers.WDialogManager.CustomMenu', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.methods({
        openCustomMenuAddPageItemsDialog: function (params) {
            this._createAndOpenWDialog(
                '_customMenuAddPageItemsDialog',
                'wysiwyg.editor.components.dialogs.CustomMenuAddPageItemsDialog',
                'wysiwyg.editor.skins.dialogs.CustomMenuAddPageItemsDialogSkin',
                function (innerLogic) {},
                {
                    width: 284,
                    height: 290,
                    top: 285,
                    left: 345,
                    allowScroll: true,
                    semiModal: true,
                    allowDrag: true,
                    position: Constants.DialogWindow.POSITIONS.DYNAMIC,
                    title: W.Resources.get('EDITOR_LANGUAGE', "CUSTOMMENU_AddPageItemsDialog_Title"),
                    description: W.Resources.get('EDITOR_LANGUAGE', "CUSTOMMENU_AddPageItemsDialog_Description"),
                    buttonSet: W.EditorDialogs.DialogButtonSet.NONE,
                    helpButtonId: '/node/22301'
                },
                null, true, params, false, false, true
            );
        },

        openCustomMenuManageMenuItemsDialog: function (params) {
            this._createAndOpenWDialog(
                '_customMenuManageMenuItemsDialog',
                'wysiwyg.editor.components.dialogs.CustomMenuManageMenuItemsDialog',
                'wysiwyg.editor.skins.dialogs.CustomMenuManageMenuItemsDialogSkin',
                function (innerLogic) {},
                {
                    width:300,
                    height: 520,
                    top: 100,
                    left: 200,
                    position: Constants.DialogWindow.POSITIONS.SIDE,
                    allowScroll: true,
                    semiModal: true,
                    allowDrag: true,
                    title: W.Resources.get('EDITOR_LANGUAGE', "CUSTOMMENU_ManageMenuItemsDialog_Title"),
                    description: W.Resources.get('EDITOR_LANGUAGE', "CUSTOMMENU_ManageMenuItemsDialog_Description"),
                    buttonSet: [W.EditorDialogs.DialogButtons.CANCEL, W.EditorDialogs.DialogButtons.DONE],
                    helpButtonId: '/node/22301'
                },
                null, true, params, true, false, true
            );
        },

        openCustomMenuAddLinkDialog: function (params) {
            this._createAndOpenWDialog(
                '_customMenuAddLinkDialog',
                'wysiwyg.editor.components.dialogs.CustomMenuAddLinkDialog',
                'wysiwyg.editor.skins.dialogs.CustomMenuAddLinkDialogSkin',
                function (innerLogic) {},
                {
                    width:160,
                    height: 111,
                    minHeight: 111,
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
            this._createAndOpenWDialog(
                '_customMenuEditItemSettingsDialog',
                'wysiwyg.editor.components.dialogs.CustomMenuEditItemSettingsDialog',
                'wysiwyg.editor.skins.dialogs.CustomMenuEditItemSettingsDialogSkin',
                function (innerLogic) {},
                {
                    width: 300,/*
                    height: 278,
                    minHeight: 278,*/
                    title: W.Resources.get('EDITOR_LANGUAGE', "CUSTOMMENU_EditItemSettingsDialog_Title"),
                    semiModal: true,
                    allowDrag: true,
                    buttonSet: [W.EditorDialogs.DialogButtons.CANCEL, W.EditorDialogs.DialogButtons.DONE],
                    helpButtonId: '/node/22301'
                },
                null, true, params, false, false, true
            );
        },

        openCustomMenuConfirmDetachDialog: function(params){
            this.openNotificationDialog(
                '_customMenuConfirmDetachDialog',
                'CUSTOMMENU_ConfirmDetachDialog_Title',
                'CUSTOMMENU_ConfirmDetachDialog_Text', 566, 90, null, false, '/node/21781', 1, null,
                'CUSTOMMENU_ConfirmDetachDialog_Yes',
                'CUSTOMMENU_ConfirmDetachDialog_No'
            ).getLogic().setCloseCallBack(params.okCallback);
        },

        openNotificationDialog:function(dialogName, title, description, notificationWidth, notificationMinHeight, icon, showAgainSelection, helpletID, marginOfViolations, okButtonCallback, okButtonTitle, cancelButtonTitle) {

            if(typeOf(dialogName)!=="string" || typeOf(dialogName)===""){
                return null;
            }
            if(!this._isNotificationDialogCanBeShownAgain(dialogName, marginOfViolations, showAgainSelection)){
                return this.getNotificationDialogByName(dialogName);
            }
            var dialogParams = {};
            if(helpletID){
                dialogParams["helpletID"] = helpletID;
            }
            if(icon){
                dialogParams["icon"] = icon;
            }
            if(description){
                dialogParams["description"] = description;
            }
            if(showAgainSelection){
                dialogParams["setShowAgainStatusCallBack"] = this.setNotificationDialogShowAgainStatus;
            }
            if(okButtonCallback){
                dialogParams['okButtonCallback'] = okButtonCallback;
            }
            if(!okButtonTitle){
                okButtonTitle = this.DialogButtonSet.OK;
            }

            var buttonSet = [{label:okButtonTitle, align:Constants.DialogWindow.BUTTON_ALIGN.RIGHT}];
            if(cancelButtonTitle){
                buttonSet.push({label:cancelButtonTitle, align:Constants.DialogWindow.BUTTON_ALIGN.LEFT, color: 'grayed'});
            }

            dialogParams["dialogName"] = dialogName;
            dialogParams["notificationWidth"] = notificationWidth;
            var isFromCache = this._isDialogShouldBeShownFromCache(dialogName, dialogParams);
            var dialog = this._createAndOpenWDialog(
                '_saveSuccessDialogHide',
                'wysiwyg.editor.components.dialogs.NotificationDialog',
                'wysiwyg.editor.skins.panels.base.AutoPanelSkin',
                function () {},
                {
                    width:notificationWidth,
                    minHeight:notificationMinHeight,
                    allowScroll:false,
                    allowDrag:false,
                    position:Constants.DialogWindow.POSITIONS.CENTER,
                    title:W.Resources.get('EDITOR_LANGUAGE', title),
                    buttonSet  : buttonSet
                },
                null, true, dialogParams, false, isFromCache);
            dialogParams["dialog"] = dialog;
            this._updateListOfDialogs(dialogName, dialogParams);
            return dialog;
        },
    });
});