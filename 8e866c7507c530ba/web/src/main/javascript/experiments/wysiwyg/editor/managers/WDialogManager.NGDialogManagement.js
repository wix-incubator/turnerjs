define.experiment.Class('wysiwyg.editor.managers.WDialogManager.NGDialogManagement', function (classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    var strategy = experimentStrategy;

    def.methods({
        _registerNewDialog: function (dialog, dlgTypeID) {
            this._getAngularLegacyDialogsService().registerLegacyDialog(dlgTypeID, dialog.$logic.getModalMode());
        },

        _onDialogClosing: strategy.after(function (dialog, dialogTypeId, fromCache) {
            this._getAngularLegacyDialogsService().removeLegacyDialog(dialogTypeId);
        }),

        // todo YotamB 28/08/14 REMOVE this test thingy
        openNGTestDialog: function (params) {
            params = params || {};
            var dlgTypeId = params.dlgTypeId || '_NGTestPanel' + (new Date()).getTime();
            this._createAndOpenWDialog(
                dlgTypeId,
                'wysiwyg.editor.components.dialogs.NGTestDialog',
                'wysiwyg.editor.skins.dialogs.NGTestDialogSkin',
                function (innerLogic) {
                },
                {
                    width: 320,
                    top: params.top || 50,
                    left: params.left || 50,
                    position: params.position || Constants.DialogWindow.POSITIONS.DYNAMIC,
                    level: params.level || 0,
                    allowScroll: false,
                    semiModal: true,
                    allowDrag: true,
                    title: 'NG Test Dialog',
                    description: 'NG test dialog description'
                },
                null, true, params, false, false
            );
        }
    });
});