define.experiment.component('wysiwyg.editor.components.dialogs.AviaryDialog.EditableImageInput', function (def, strategy) {
    def.dataTypes(['Image', '']);

    def.methods({
        initialize: strategy.after(function(compId, viewNode, args) {
            args = args || {};

            this._onChange = args.onChange;
        }),
        _onDialogOpened: function () {

            // Reset some declarations
            this._forceCloseTimer = null;
            this._forceClose = false;
            this._newImageSize = null;
            this._newImageUri = null;
            this._xhrObject = null;

            if (!this._skinParts.content.id){
                LOG.reportError(wixErrors.AVIARY_MISSING_ID_IN_SKIN, "AviaryDialog", "_onDialogOpened");
                return false;
            }

            if (!this._data || this._data.getType() !== 'Image'){
                LOG.reportError(wixErrors.AVIARY_DIALOG_WRONG_DATA_TYPE, "AviaryDialog", "_onDialogOpened");
                return false;
            }

            this._showEditorWaitMessages(this.injects().Resources.get('EDITOR_LANGUAGE', 'AVIARY_LOAD_MESSAGE', 'Loading Image Editor...'), false);
            this._disableCloseButton();
            this._skinParts.cancelButton.set('text', this.injects().Resources.get('EDITOR_LANGUAGE', 'AVIARY_CANCEL_UPLOAD', 'Cancel'));
            this._skinParts.cancelButton.addEvent(Constants.CoreEvents.CLICK, this._onCancelUploadClicked);

            this._setTempImage();
            this._initAviary();
        },
        _getOriginalAspectRatio: function () {
            var component = this._editor.getEditedComponent(),
                dataItem = this.getDataItem(),
                width,
                height;

            if (component && component.getDataItem() === dataItem) {
                width = component.getWidth();
                height = component.getHeight();
            } else {
                width = dataItem.get('width');
                height = dataItem.get('height');
            }

            return width + ':' + height;
        },
        _closeAndSave: strategy.after(function () {
            var callback = this._onChange;

            if (typeof callback === "function") {
                callback({});
            }
        })
//        _closeAviary: strategy.after(function () {
//            this._data = null;
//            this._onChange = null;
//        })
    });
});
