define.experiment.newComponent('wysiwyg.editor.components.inputs.EditableImageInput.EditableImageInput', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.resources(['W.Data','W.Editor', 'W.UndoRedoManager']);

    def.utilize(['core.components.image.ImageSettings']);

    def.binds([
        '_openImageDialog',
        '_onImageDelete',
        '_logAviaryImageData',
        'setValue',
        '_revertImage',
        '_mediaGalleryCallback',
        '_aviaryCallback'
    ]);

    def.skinParts({
        label: {type: 'htmlElement'},
        imageContainer: {type: 'htmlElement'},
        image: { type: 'core.components.image.ImageNew' },
        editButton:   { type: 'wysiwyg.editor.components.WButton' },
        changeButton: { type: 'wysiwyg.editor.components.WButton' },
        deleteButton: { type: 'wysiwyg.editor.components.WButton' },
        revertButton: { type: 'wysiwyg.editor.components.WButton' }
    });

    def.states({
        'label': ['hasLabel', 'noLabel'],
        'delete': ['hasDelete'],
        'image': ['missingImage']
    }); //Obj || Array

    def.statics({
        DisableMGForTypes: ['xxxx-social_icons', 'xxxx-favicon', 'xxxx-audio']
    });

    def.fields({
        HeightWidth: {
            height: null,
            width: null
        }
    });

    def.methods({
        /**
         * @override
         * Initialize Input
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * buttonText: {String} The text of the image replacement button
         * data: {Object} The Image data object
         * mediaTabs: {Array} For the Media Dialog - Define the list of tabs to show
         * mediaFilterWixImages: {String} For the Media Dialog - The filter for images to show in the dialog
         */

        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            _.extend(this, {
                _addText: args.addText || this._translate('IMAGE_ADD'),
                _editText: args.editText || this._translate('PHOTO_EDIT_IMAGE'),
                _changeText: args.changeText || this._translate('PHOTO_REPLACE_IMAGE'),
                _deleteText: args.deleteText || this._translate('IMAGE_REMOVE'),
                _revertText: args.revertText || this._translate('PHOTO_REVERT_IMAGE'),
                _aviaryDialogLabel: args.aviaryDialogLabel || 'IMAGEINPUTNEW_IMAGE_EFFECTS',
                _galleryTypeID: args.galleryConfigID || 'photos',
                _hasDeleteButton: args.hasDelete || false,
                _callback: args.callback,
                _args: args,
                HeightWidth: {
                    height: args.height,
                    width: args.width
                }
            });

            this.setCommand('WEditorCommands.OpenMediaFrame');
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.OpenMediaFrame', this, this._disableChangeButton);
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.CloseMediaFrame', this, this._enableChangeButton);
        },

        _translate: function (key) {
            return W.Resources.get('EDITOR_LANGUAGE', key);
        },

        /**
         * Render the COMPONENT,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function () {
            this.parent();

            if (!this.resources.W.Commands.getCommand('WEditorCommands.OpenAviaryDialog').isEnabled()) {
                this.disableEditButton();
            }

            this._updateAllState();

            /* for favi icons mostly */
            if (this.HeightWidth.height && this.HeightWidth.height < 64) {
                var margin = (64 - this.HeightWidth.height) / 2;

                this._skinParts.imageContainer.setStyles({
                    'height': this.HeightWidth.height,
                    'width': this.HeightWidth.width,
                    'margin': margin
                });
            }
        },

        _updateAllState: function () {
            var isMissing = this._isImageMissing();

            this._updateMissingState(isMissing);
            this._updateChangeButton(isMissing);
            this._updateDeleteButton(isMissing);
            this._updateEditButton(isMissing);

            this._updateRevertButton();
            this._updateImageContainer();

            this._fillImageContainerData();
        },

        _isImageMissing: function () {
            var data = this.getValue() || {};
            return !data.uri || data.uri === 'none';
        },

        _updateMissingState: function (isImageMissing) {
            if (isImageMissing) {
                this.setState('missingImage', 'image');
            } else {
                this.removeState('missingImage', 'image');
            }
        },

        _updateChangeButton: function (isImageMissing) {
            var button = this._skinParts.changeButton;

            if (isImageMissing) {
                button.setLabel(this._addText || this._changeText);
            } else {
                button.setLabel(this._changeText);
            }
        },

        _updateDeleteButton: function (isImageMissing) {
            if (this._hasDeleteButton && !isImageMissing)  {
                this._showDeleteButton();
            } else {
                this._hideDeleteButton();
            }
        },

        _updateEditButton: function (isImageMissing) {
            if (isImageMissing) {
                this._disableEditButton();
            } else {
                this._enableEditButton();
            }
        },

        _updateRevertButton: function () {
            var revertButton = this._skinParts.revertButton,
                originalData = this.getOriginalImageData();

            if (originalData) {
                revertButton.uncollapse();
            } else {
                revertButton.collapse();
            }
        },

        _updateImageContainer: function () {
            var container = this._skinParts.imageContainer,
                width = container.getWidth(),
                height = container.getHeight(),
                cropMode = this.imports.ImageSettings.CropModes.COVER,
                imageSettings;

            if (width <= 0 || height <= 0) {
                width = parseInt(container.getStyle('width'), 10);
                height = parseInt(container.getStyle('height'), 10);
            }

            if (width > 0 && height > 0) {
                imageSettings = new this.imports.ImageSettings(cropMode, width, height);
                this._skinParts.image.setSettings(imageSettings);
            }
        },

        _fillImageContainerData: function () {
            var image = this._skinParts.image,
                imageData = image.getDataItem(),
                panelRawData,
                dataItem,
                value;

            if (imageData) {
                panelRawData = this.getRawData();
                if (panelRawData.type === 'Image') {
                    imageData.setFields(_.omit(this._validateDataSchema(panelRawData), 'type', 'title', 'alt'));
                } else {
                    image.setDataItem(imageData);
                }
                return;
            }

            dataItem = this.getDataItem();

            if (!dataItem || dataItem.getType() !== 'Image') {
                value = _.clone(this.getValue());
                if (!value || value.type !== 'Image') {
                    value = this._validateDataSchema(null);
                }

                dataItem = this.resources.W.Data.createDataItem(value);
            }

            image.setDataItem(dataItem);
        },

        _hideDeleteButton: function () {
            this.removeState('hasDelete', 'delete');
            this._skinParts.deleteButton.collapse();
            this._skinParts.deleteButton.removeEvent(Constants.CoreEvents.CLICK, this._onImageDelete);
        },

        _showDeleteButton: function () {
            this.setState('hasDelete', 'delete');
            this._skinParts.deleteButton.uncollapse();
            this._skinParts.deleteButton.addEvent(Constants.CoreEvents.CLICK, this._onImageDelete);
        },

        _disableEditButton: function () {
            this._skinParts.editButton.disable();
            this._skinParts.editButton.setCommand(null);
        },

        _enableEditButton: function () {
            this._skinParts.editButton.enable();
            this._skinParts.editButton.setCommand("WEditorCommands.OpenAviaryDialog", {
                dialogLabel: this._aviaryDialogLabel,
                dataItem: this._skinParts.image.getDataItem(),
                onChange: this._aviaryCallback,
                sender: this
            });
        },

        _disableChangeButton: function () {
            this._skinParts.changeButton.disable();
        },

        _enableChangeButton: function () {
            this._skinParts.changeButton.enable();
        },

        _onAllSkinPartsReady: function (skinParts) {
            this.parent(skinParts);

            skinParts.editButton.setLabel(this._editText);
            skinParts.changeButton.setLabel(this._changeText);
            skinParts.deleteButton.setLabel(this._deleteText);
            skinParts.revertButton.setLabel(this._revertText);

            this._updateImageContainer();
        },

        setValue: function (rawData) {
            var value = this.getValue(),
                dataItem;

            rawData = this._validateDataSchema(rawData);

            if (_.isEqual(value, rawData)) {
                return;
            }

            if (rawData.type === 'Image') {
                dataItem = this._skinParts.image.getDataItem();

                if (dataItem) {
                    dataItem.setFields(_.omit(rawData, 'type'));
                }
            }

            this.parent(_.extend({}, value || {}, rawData));
            this._updateAllState();
        },

        _validateDataSchema: function(rawData) {
            var result, defaultSize, uri;

            if (this.DisableMGForTypes.indexOf(this._galleryTypeID) !== -1) {
                return rawData;
            }

            if (typeof rawData === "string") {
                rawData = { uri: rawData };
            }

            if (rawData && rawData.type && rawData.type !== "Image") {
                return rawData;
            }

            rawData = rawData || {};
            uri = rawData.fileName || rawData.uri || null;
            defaultSize = this._getImageContainerSize();

            result = {
                type        : "Image",
                width       : Number(rawData.width || defaultSize.width),
                height      : Number(rawData.height || defaultSize.height),
                uri         : uri !== 'none' ? uri : null,
                originalImageDataRef: rawData.originalImageDataRef || null
            };

            if (rawData.hasOwnProperty('description')) {
                result.description = rawData.description;
            }

            if (rawData.hasOwnProperty('title')) {
                result.title = rawData.title;
            }

            if (rawData.hasOwnProperty('alt')) {
                result.alt = rawData.alt;
            }

            if (rawData.hasOwnProperty('link')) {
                result.link = rawData.link;
            }

            return result;
        },

        _getImageContainerSize: function () {
            if (this._skinParts && this._skinParts.imageContainer) {
                return {
                    width: this._skinParts.imageContainer.offsetWidth,
                    height: this._skinParts.imageContainer.offsetHeight
                };
            }

            return { width: 0, height: 0 };
        },

        /**
         * Assign change events
         */
        _listenToInput: function () {
            this._skinParts.imageContainer.addEvent(Constants.CoreEvents.CLICK, this._openImageDialog);
            this._skinParts.changeButton.addEvent(Constants.CoreEvents.CLICK, this._openImageDialog);
            this._skinParts.deleteButton.addEvent(Constants.CoreEvents.CLICK, this._onImageDelete);
            this._skinParts.revertButton.addEvent(Constants.CoreEvents.CLICK, this._revertImage);
            this._skinParts.editButton.addEvent(Constants.CoreEvents.CLICK, this._logAviaryImageData);
        },
        /**
         * Remove change events
         */
        _stopListeningToInput: function () {
            this._skinParts.imageContainer.removeEvent(Constants.CoreEvents.CLICK, this._openImageDialog);
            this._skinParts.changeButton.removeEvent(Constants.CoreEvents.CLICK, this._openImageDialog);
            this._skinParts.deleteButton.removeEvent(Constants.CoreEvents.CLICK, this._onImageDelete);
            this._skinParts.revertButton.removeEvent(Constants.CoreEvents.CLICK, this._revertImage);
            this._skinParts.editButton.removeEvent(Constants.CoreEvents.CLICK, this._logAviaryImageData);
        },

        _onImageDelete: function () {
            this.setValue(null);
        },

        _revertImage : function () {
            var originalData = this.getOriginalImageData(),
                hasOriginalImageData = Boolean(originalData);

            if (originalData){
                this.setValue(originalData.getData());
            }

            this._logAviaryRevertImage(hasOriginalImageData);
        },

        getOriginalImageData: function () {
            var value = this.getValue(),
                originalRef = value ? value.originalImageDataRef : null,
                originalData,
                previewDataManager;

            if (!originalRef) {
                return;
            }

            if (this._data) {
                originalData = this._data.getDataManager().getDataByQuery(originalRef);
            }

            if (!originalData) {
                previewDataManager = W.Preview.getPreviewManagers().Data;
                originalData = previewDataManager.getDataByQuery(originalRef);
            }

            if (!originalData) {
                originalData = W.Data.getDataByQuery(originalRef);
            }

            return originalData;
        },

        _logAviaryImageData: function () {
            var value = this.getValue();

            LOG.reportEvent(wixEvents.AVIARY_EDIT_IMAGE, {
                c1: value.uri || 'none',
                c2: this._getEditedComponentClassName(),
                g2: 'panel',
                i1: value.originalImageDataRef ? 1 : 0
            });
        },

        _logAviaryRevertImage: function (hasOriginalImageDataRef) {
            var value = this.getValue();

            LOG.reportEvent(wixEvents.AVIARY_REVERT_IMAGE, {
                c1: value.uri || 'none',
                c2: this._getEditedComponentClassName(),
                i1: hasOriginalImageDataRef ? 1 : 0
            });
        },

        _getEditedComponentClassName: function () {
            var data = this.getDataItem(),
                component;

            if (data && data.getType() === 'TransientCustomBG') {
                return "Background";
            }

            component = W.Editor.getEditedComponent();
            return component ? component.$className : 'unknown';
        },

        _openImageDialog: function () {
            // temp hack to exclude these media types from MG
            if (this.DisableMGForTypes.indexOf(this._galleryTypeID) !== -1) {
                this.setCommand('WEditorCommands.OpenImageDialog');
            }

            this.executeCommand({
                galleryConfigID: this._args.galleryConfigID,
                selectionType: this._args.selectionType,
                publicMediaFile: this._args.publicMediaFile,
                i18nPrefix: this._args.i18nPrefix,
                mediaType: this._args.mediaType,
                hasPrivateMedia: this._args.hasPrivateMedia,
                callback: this._mediaGalleryCallback,
                commandSource: this._args.commandSource,
                componentName: this._args.componentName,
                startingTab: this._args.startingTab
            });
        },

        _mediaGalleryCallback: function (galleryData) {
            if (galleryData) {
                delete galleryData.alt;
                delete galleryData.title;
                delete galleryData.description;
            }

            var callback = this._args.mgCallback || this.setValue;
            callback.call(this, galleryData);
        },

        _aviaryCallback: function () {
            var raw = this._skinParts.image.getRawData();
            raw = _.pick(raw, 'height', 'width', 'uri', 'originalImageDataRef');
            this.setValue(raw);
        }
    });
});
