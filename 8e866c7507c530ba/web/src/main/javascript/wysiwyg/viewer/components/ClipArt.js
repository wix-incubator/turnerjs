define.component('wysiwyg.viewer.components.ClipArt', function (componentDefinition) {

    //Experiment Photo.New was promoted to feature on Wed Aug 22 10:08:39 IDT 2012

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.binds(["_mediaGalleryCallback"]);

    def.inherits('wysiwyg.viewer.components.WPhoto');

    def.skinParts({
        'link': {
            type: 'htmlElement'
        },
        'img': {
            'type': 'core.components.image.ImageNew',
            'dataRefField': '*'
        }
    });

    def.propertiesSchemaType('WPhotoProperties');

    def.dataTypes(['Image']);

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
                allInputsHidden: false
            }
        }
    });

    def.methods({
        _mediaGalleryCallback: function (rawData) {
            this.getDataItem().setFields({
                title: "",
                description: rawData.description || "",
                height: rawData.height,
                width: rawData.width,
                uri: rawData.fileName
            });

            this._logChangeMediaSuccess();
        },

        _logChangeMediaSuccess: function () {
            LOG.reportEvent(wixEvents.CHANGE_IMAGE_CLICK_SUCCESS, {c1: this.className });
        },

        _setTitle: function () {
            this.getDataItem().set('title', '', true);
        }
    });
});
