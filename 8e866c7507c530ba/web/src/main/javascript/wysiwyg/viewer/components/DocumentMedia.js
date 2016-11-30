/**
 * @class wysiwyg.viewer.components.documentmedia.DocumentMedia
 */
define.component('wysiwyg.viewer.components.documentmedia.DocumentMedia', function (componentDefinition) {

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.viewer.components.WPhoto');

    def.resources(['topology']);

    def.skinParts({
        'link': {
            type: 'htmlElement'
        },
        'label': {
            type: 'htmlElement'
        },
        'img': {
            'type': 'core.components.image.ImageNew',
            'dataRefField': '*'
        }
    });

    def.binds(['documentGalleryCallback', 'mediaGalleryCallback']);

    def.propertiesSchemaType('DocumentMediaProperties');

    def.dataTypes(['Image']);

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            },
            custom: [
                {
                    label: 'CHOOSE_DOCUMENT',
                    command: 'WEditorCommands.OpenMediaFrame',
                    commandParameter: {
                        commandSource: 'FPP',
                        galleryConfigID: 'documents',
                        publicMediaFile: 'file_icons',
                        i18nPrefix: 'document',
                        selectionType: 'single',
                        mediaType: 'document',
                        callback: 'documentGalleryCallback'
                    }
                },
                {
                    label: 'LINK_TO_ICON',
                    command: 'WEditorCommands.OpenMediaFrame',
                    commandParameter: {
                        galleryConfigID: 'photos',
                        publicMediaFile: 'file_icons',
                        i18nPrefix: 'single_icon',
                        selectionType: 'single',
                        mediaType: 'picture',
                        callback: 'mediaGalleryCallback',
                        startingTab: 'free'
                    }
                }
            ],
            dblClick: {
                command: 'WEditorCommands.OpenMediaFrame',
                commandParameter: {
                    commandSource: 'dblClick',
                    galleryConfigID: 'documents',
                    publicMediaFile: 'file_icons',
                    i18nPrefix: 'document',
                    selectionType: 'single',
                    mediaType: 'document',
                    callback: 'documentGalleryCallback'
                }
            }
        }
    });

    def.methods({
        _setDefaultImage: function () {
            this.getDataItem().set('uri', this.resources.topology.skins + '/images/wysiwyg/core/themes/editor_web/add_image_thumb.png');
        },

        _onRender: function (renderEvent) {
            this.parent(renderEvent);

            var invalidations = renderEvent.data.invalidations;
            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                if (this.getDataItem().get('uri') === '') {
                    this._setDefaultImage();
                }
                this.setComponentProperty('displayMode', 'full', true);
            }
            this._setLabelAccordingToData();
            this.setMinW(this._skinParts.label.$measure.width);
            this.getViewNode().setStyle('width', this._skinParts.label.$measure.width);

            this._setLineHeight();
            this._toggleTitleDisplay();
        },

        _setLineHeight: function () {
            var image = this._skinParts.img.getViewNode();
            image.setStyle('line-height', image.getStyle('height'));
        },

        _setLabelAccordingToData: function () {
            var documentTitle = this.getDataItem().get('title');
            this._skinParts.label.set('html', documentTitle);
        },

        _toggleTitleDisplay: function () {
            var documentLabel = this._skinParts.label;
            documentLabel.setStyle('display', this.getComponentProperty('showTitle') ? 'inline-block' : 'none');
        },

        _updateFramePadding: function () {
            var skin = this.getSkin();
            this._framePadding = {
                x: parseInt(skin.getParamValue('contentPaddingLeft')._amount, 10) + parseInt(skin.getParamValue('contentPaddingRight')._amount, 10),
                y: parseInt(skin.getParamValue('contentPaddingTop')._amount, 10) + parseInt(this._skinParts.label.getHeight(), 10)
            };
        },

        _getImageCropMode: function () {
            return 'full';
        },

        documentGalleryCallback: function (rawData) {
            var thumbnailUri = this._getThumbnailUri(rawData.thumbnailUrl);
            var newDocLinkDataItem = this._createDocumentLinkDataItem(rawData.title, rawData.uri);
            var newDataItemObj = this._createCompDataItemObj('#' + newDocLinkDataItem.get('id'), thumbnailUri, rawData.title);

            this.getDataItem().setFields(newDataItemObj);
            this._logChangeMediaSuccess();
        },

        _getThumbnailUri: function (thumbnailUrl) {
            var thumbnailArray = thumbnailUrl.split('/');
            return thumbnailArray[thumbnailArray.length - 1];
        },

        _logChangeMediaSuccess: function () {
            LOG.reportEvent(wixEvents.CHANGE_IMAGE_CLICK_SUCCESS, {c1: this.className });
        },

        _createCompDataItemObj: function (linkRef, imageUri, title) {
            return {
                'link': linkRef,
                'title': title,
                'uri': imageUri,
                'width': 60,
                'height': 60
            };
        },

        _createDocumentLinkDataItem: function (title, docUri) {
            var linkDataItem = this.resources.W.Data.createDataItem({
                type: 'DocumentLink',
                docId: docUri,
                name: title
            });


            var previewDataManager = this._getViewerDataManager();
            return previewDataManager.addDataItemWithUniqueId("", linkDataItem.getData()).dataObject;
        },

        _getViewerDataManager: function () {
            if (W.Config.env.$isEditorFrame) {
                return W.Preview.getPreviewManagers().Data;
            }
            return this.resources.W.Data;
        },

        mediaGalleryCallback: function (rawData) {
            this.getDataItem().setFields(this._createImageObject(rawData.description || '', rawData.height, rawData.width, rawData.fileName));
        },

        _createDocumentObject: function (title, imageUri, documentUri) {
            return {
                'title': title,
                'text': title,
                'linkType': 'DOCUMENT',
                'href': documentUri,
                'target': '_blank',
                'uri': imageUri
            };
        },

        _createImageObject: function (description, height, width, uri) {
            return {
                description: description,
                height: height,
                width: width,
                uri: uri
            };
        },
        /**
         * We add a manual call to setMinW because UndoRedo's mechanism calls setWidth
         * when undoing resize, but what really interests us is setMinW,
         * which is usually fired from _onRender
         * */
        setWidth: function (requestedWidth) {
            this.setMinW(requestedWidth);
            this.parent(requestedWidth);
        }
    });
});
