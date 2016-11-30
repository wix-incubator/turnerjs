define.experiment.Class('wysiwyg.editor.managers.WDialogManager.EditableImageInput', function (def) {
    def.methods({
        openAviaryDialog: function (params) {
            var selectedComp = W.Editor.getSelectedComp(),
                dialogOptions,
                dialog,
                isDialogFromCache;

            params = params || {};
            params.dialogLabel = params.dialogLabel || 'IMAGEINPUTNEW_IMAGE_EFFECTS';
            if (!params.dataItem) {
                params.dataItem = selectedComp.getDataItem();
            }

            dialogOptions = {
                width      : 850, //TODO: Override by AviaryDialog
                minHeight  : 550, //TODO: Override by AviaryDialog
                position   : Constants.DialogWindow.POSITIONS.CENTER,
                allowScroll: false,
                modal      : true,
                allowDrag  : false,
                buttonSet  : this.DialogButtonSet.NONE,
                title      : W.Resources.get('EDITOR_LANGUAGE', params.dialogLabel, 'Image Effects')
            };

            dialog = this._createAndOpenWDialog(
                '_aviaryDialog',
                'wysiwyg.editor.components.dialogs.AviaryDialog',
                'wysiwyg.editor.skins.dialogs.AviaryDialogSkin',
                function (aviary) {
                    isDialogFromCache = true;
                    aviary._onChange = params.onChange;
                    aviary._data = params.dataItem;
                },
                dialogOptions,
                params.dataItem,
                true,
                params,
                false,
                true,
                true
            );

            if (dialog && dialog.$logic && isDialogFromCache) {
                dialog.$logic.setDialogOptions(dialogOptions);
            }

            this._logAviaryOpened({
                commandSource: params.commandSource,
                compType: selectedComp.className,
                uri: params.dataItem.get('uri'),
                originalImageDataRef: params.dataItem.get('originalImageDataRef')
            });
        },
        _logAviaryOpened: function (params) {
            if (!params.commandSource) {
                return;
            }

            LOG.reportEvent(wixEvents.AVIARY_EDIT_IMAGE, {
                c1: params.uri || 'none',
                c2: params.compType,
                g2: params.commandSource,
                i1: params.originalImageDataRef ? 1 : 0
            });
        }
    });
});
