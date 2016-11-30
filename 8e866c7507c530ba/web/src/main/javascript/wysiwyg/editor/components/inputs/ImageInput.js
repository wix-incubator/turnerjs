define.component('wysiwyg.editor.components.inputs.ImageInput', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.utilize(['core.components.image.ImageSettings']);

    def.resources(['W.Data', 'W.Editor', 'W.UndoRedoManager']);

    def.binds(['_onImgSelect', '_openImageDialog', '_onImgSelect', '_onImageDelete', '_dataIsOfTypeImage']);

    def.skinParts({
        label: {type: 'htmlElement'},
        imageContainer: {type: 'htmlElement'},
        image: {
            type: 'core.components.image.ImageNew', argObject: { requestExactSize: false }
        },
        changeButton: {type: 'wysiwyg.editor.components.WButton'},
        deleteButton: {type: 'wysiwyg.editor.components.WButton'}
    });

    def.states({'label': ['hasLabel', 'noLabel'], 'delete': ['hasDelete'], 'image': ['missingImage', 'hasImage']}); //Obj || Array

    def.statics({
        DisableMGForTypes: ['xxxx-social_icons', 'xxxx-favicon', 'xxxx-audio']
    });

    def.fields({
        HeightWidth: {height: null, width: null}
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
            this._buttonText = args.buttonText || '';
            this._deleteText = args.deleteText || '';
            this._galleryTypeID = args.galleryConfigID || 'photos';
            this._imageRawData = null;
            this._hasDeleteButton = args.hasDelete || false;
            this.HeightWidth.height = args.height;
            this.HeightWidth.width = args.width;
            this.setCommand('WEditorCommands.OpenImageDialog');
            this._args = args;
            this._callback = args.callback;
            this._componentName = args.componentName || '';
            this.setCommand('WEditorCommands.OpenMediaFrame');
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.OpenMediaFrame', this, function () {
                this._skinParts.changeButton.disable();
            });
            this.resources.W.Commands.registerCommandListenerByName('WEditorCommands.CloseMediaFrame', this, function () {
                this._skinParts.changeButton.enable();
            });
        },
        /**
         * Render the COMPONENT,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function () {
            this.parent();
            this.setButton(this._buttonText);
            this.setDelete(this._deleteText);

            if (this._dataIsOfTypeImage()) {
                this._imageRawData = this._data.getData();
            }
            this.setValue(this._imageRawData);
            /* for favi icons mostly */
            if (this.HeightWidth.height && this.HeightWidth.height < 64) {
                var margin = (64 - this.HeightWidth.height) / 2;
                this._skinParts.imageContainer.setStyles({'height': this.HeightWidth.height, 'width': this.HeightWidth.width, 'margin': margin});
            }
        },
        /**
         * Set the image from an imageDataType object
         * @param {Object} rawData The image data object to set
         */
        setValue: function (rawData) {
            var dataItem = null;
            this._imageRawData = rawData;
            if (this._imageRawData && this._imageRawData.uri && this._imageRawData.uri !== 'none') {
                if (this._dataIsOfTypeImage()) {
                    // copy image fields
                    this._data.setFields({
                        'width': rawData.width || 0,
                        'height': rawData.height || 0,
                        'uri': rawData.uri,
                        'title': rawData.title,
                        'borderSize': rawData.borderSize,
                        'description': rawData.description,
                        'originalImageDataRef': rawData.originalImageDataRef || null
                    });
                    dataItem = this._data;
                } else {
                    dataItem = this.resources.W.Data.createDataItem(this._imageRawData);
                }
                this._skinParts.image.setDataItem(dataItem);
                this.setState('hasImage', 'image');
                if (this.getState('delete')){
                    this._skinParts.deleteButton.enable();
                }

            } else {
                this.setState('missingImage', 'image');
                if (this.getState('delete')){
                    this._skinParts.deleteButton.disable();
                }
            }

            // Update image settings
            var container = this._skinParts.imageContainer;
            var width = container.getWidth();
            var height = container.getHeight();
            if(width >= 1 && height >= 1) {
                this._skinParts.image.setSettings(new this.imports.ImageSettings(this.imports.ImageSettings.CropModes.COVER, width, height));
            }
        },

        /**
         * Returns the details of the image as an imageDataType object
         */
        getValue: function () {
            return this._imageRawData || null;
        },
        /**
         * Set the text on the 'change image' button
         * @param text If text value is falsie - hide the button
         */
        setButton: function (text) {
            if (text) {
                this._skinParts.changeButton.uncollapse();
                this._skinParts.changeButton.setLabel(text);
            } else {
                this._skinParts.changeButton.collapse();
                this._skinParts.changeButton.setLabel('');
            }
        },
        setDelete: function (text) {
            if (text) {
                this._skinParts.deleteButton.uncollapse();
                this._skinParts.deleteButton.setLabel(text);
                this.setState('hasDelete', 'delete');
                this._skinParts.deleteButton.addEvent(Constants.CoreEvents.CLICK, this._onImageDelete);
            } else {
                this._skinParts.deleteButton.collapse();
                this._skinParts.deleteButton.setLabel('');
                this.removeState('hasDelete', 'delete');
                this._skinParts.deleteButton.removeEvent(Constants.CoreEvents.CLICK, this._onImageDelete);
            }
        },
        _onImageDelete: function (e) {
            this.setValue(null);
            this._changeEventHandler(e);
        },
        _dataIsOfTypeImage: function () {
            return this._data && this._data.getType && this._data.getType() === 'Image';
        },
        /**
         * Open dialog
         */
        _openImageDialog: function () {
            if (this.DisableMGForTypes.indexOf(this._galleryTypeID) !== -1) {
                this.setCommand('WEditorCommands.OpenImageDialog');
            }

            this.executeCommand({
                commandSource: this._args.commandSource,
                componentName: this._componentName,
                galleryConfigID: this._args.galleryConfigID,
                selectionType: this._args.selectionType,
                publicMediaFile: this._args.publicMediaFile,
                i18nPrefix: this._args.i18nPrefix,
                mediaType: this._args.mediaType,
                hasPrivateMedia: this._args.hasPrivateMedia,
                callback: this._args.mgCallback || this._onImgSelect,
                startingTab: this._args.startingTab || 'my'
            });
        },

        _onImgSelect: function (rawData) {
            rawData.width = Number(rawData.width);
            rawData.height = Number(rawData.height);
            var imageData = this.injects().Data.createDataItem(this._validateDataSchema(rawData));
            //imageData._data.type = this._data._schemaType;
            this.setValue(imageData.getData());
            this._changeEventHandler({target: this._skinParts.imageContainer});
        },

        _validateDataSchema: function (rawData) {
            if (this.DisableMGForTypes.indexOf(this._galleryTypeID) !== -1) {
                return rawData;
            }
            return {
                type: rawData.type || 'Image',
                title: rawData.title,
                description: rawData.description || '',
                height: rawData.height,
                width: rawData.width,
                //borderSize  : rawData.borderSize || this.getDataItem().getData().borderSize,
                uri: rawData.fileName || rawData.uri
            };
        },

        _changeEventHandler: function (e) {
            this.parent(e);
        },
        /**
         * Assign change events
         */
        _listenToInput: function () {
            this._skinParts.imageContainer.addEvent(Constants.CoreEvents.CLICK, this._openImageDialog);
            this._skinParts.changeButton.addEvent(Constants.CoreEvents.CLICK, this._openImageDialog);
            this._skinParts.deleteButton.addEvent(Constants.CoreEvents.CLICK, this._onImageDelete);
        },
        /**
         * Remove change events
         */
        _stopListeningToInput: function () {
            this._skinParts.imageContainer.removeEvent(Constants.CoreEvents.CLICK, this._openImageDialog);
            this._skinParts.changeButton.removeEvent(Constants.CoreEvents.CLICK, this._openImageDialog);
            this._skinParts.deleteButton.removeEvent(Constants.CoreEvents.CLICK, this._onImageDelete);

        }
    });
});

