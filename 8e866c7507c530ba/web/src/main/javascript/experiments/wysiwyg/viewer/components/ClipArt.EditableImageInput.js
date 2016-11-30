define.experiment.component('wysiwyg.viewer.components.ClipArt.EditableImageInput', function (def, strategy) {
    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false,
                proportionalResize: true
            },
            custom: [
                {
                    label: 'CLIP_ART_REPLACE_IMAGE',
                    command: 'WEditorCommands.OpenMediaFrame',
                    commandParameter: {
                        commandSource: 'FPP',
                        galleryConfigID: 'clipart',
                        publicMediaFile: 'clipart',
                        i18nPrefix: 'clipart',
                        selectionType: 'single',
                        mediaType: 'picture',
                        callback: '_mediaGalleryCallback',
                        startingTab: 'free'
                    }
                },
                {
                    label: 'IMAGEINPUTNEW_CLIPART_EFFECTS',
                    command: 'WEditorCommands.OpenAviaryDialog',
                    commandParameter: {
                        commandSource: 'FPP',
                        dialogLabel: 'IMAGEINPUTNEW_CLIPART_EFFECTS'
                    }
                },
                {
                    label: 'LINK_LINK_TO',
                    command: 'WEditorCommands.OpenLinkDialogCommand',
                    commandParameter: {
                        position: 'center'
                    },
                    commandParameterDataRef: 'SELF'
                }
            ],
            dblClick: {
                command: 'WEditorCommands.OpenMediaFrame',
                commandParameter: {
                    commandSource: 'dblClick',
                    galleryConfigID: 'clipart',
                    publicMediaFile: 'clipart',
                    i18nPrefix: 'clipart',
                    selectionType: 'single',
                    mediaType: 'picture',
                    callback: '_mediaGalleryCallback',
                    startingTab: 'free'
                }
            },
            mobile: {
                previewImageDataRefField: '*',
                allInputsHidden: true
            }
        }
    });

    def.methods({
        _mediaGalleryCallback: function (rawData) {
            this.getDataItem().setFields({
                height: rawData.height,
                width: rawData.width,
                uri: rawData.fileName,
                originalImageDataRef: null
            });

            this._logChangeMediaSuccess();
        }
    });
});
