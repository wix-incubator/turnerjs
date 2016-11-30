define.experiment.component('wysiwyg.viewer.components.WPhoto.EditableImageInput', function (def, strategy) {
    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true,
                proportionalResize: true
            },
            custom: [
                {
                    label: 'PHOTO_REPLACE_IMAGE',
                    command: 'WEditorCommands.OpenMediaFrame',
                    commandParameter: {
                        commandSource: 'FPP',
                        galleryConfigID: 'photos',
                        publicMediaFile: 'photos',
                        selectionType: 'single',
                        i18nPrefix: 'single_image',
                        mediaType: 'picture',
                        callback: "_mediaGalleryCallback"
                    }
                },
                {
                    label: 'IMAGEINPUTNEW_IMAGE_EFFECTS',
                    command: 'WEditorCommands.OpenAviaryDialog',
                    commandParameter: {
                        commandSource: 'FPP'
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
                    galleryConfigID: 'photos',
                    publicMediaFile: 'photos',
                    selectionType: 'single',
                    i18nPrefix: 'single_image',
                    mediaType: 'picture',
                    callback: "_mediaGalleryCallback"
                }
            },
            mobile: {
                previewImageDataRefField: '*'
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

            this._reportLogEvent();
        }
    });
});

