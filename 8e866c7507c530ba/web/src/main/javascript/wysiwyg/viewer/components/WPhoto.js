/**
 * @class wysiwyg.viewer.components.WPhoto
 */
define.component('wysiwyg.viewer.components.WPhoto', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.binds(['_mediaGalleryCallback', '_onClick']);

    def.utilize([
        'core.components.image.ImageSettings',
        'core.components.image.ImageDimensionsNew',
        'wysiwyg.common.utils.LinkRenderer'
    ]);

    def.skinParts({
        'link': { type: 'htmlElement' },
        'img': { 'type': 'core.components.image.ImageNew', 'dataRefField': '*', 'hookMethod': '_setImageArgs'}
    });

    def.dataTypes(['Image']);

    def.states({
        touch: ['noTouch', 'hasTouch']
    });

    def.propertiesSchemaType('WPhotoProperties');

    def.resources(['W.Utils', 'W.Viewer', 'W.Config', 'W.Data', 'W.Commands']);

    def.fields({
        _renderTriggers: [ Constants.DisplayEvents.ADDED_TO_DOM, Constants.DisplayEvents.DISPLAYED, Constants.DisplayEvents.DISPLAY_CHANGED, Constants.DisplayEvents.SKIN_CHANGE ]
    });

    def.statics({
        MIN_IMAGE_HEIGHT: 1,
        MIN_IMAGE_WIDTH: 1,

        _autoSizeStates: {
            'none': 1,
            'autoSizeNoLayoutUpdate': 2,
            'autoSizeUpdateLayout': 3
        },

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
                    label: 'PHOTO_EDIT_IMAGE',
                    command: 'WEditorCommands.OpenAviaryDialog'
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

    /**
     * @lends wysiwyg.viewer.components.WPhoto
     */
    def.methods({
        initialize: function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            this._SettingsClass = this.imports.ImageSettings;
            this._imageSettings = new this.imports.ImageSettings();
            this._imageDimensions = new this.imports.ImageDimensionsNew();

            // ToDo: check if this is in use
            if (argsObject && argsObject.props) {
                                     this.setComponentProperties(argsObject.props);
            }

            this._contentPadding = {'x': 0, 'y': 0};
            this._rotatable = true;
            this._linkRenderer = new this.imports.LinkRenderer();
        },

        isRenderNeeded: function (invalidations) {
            return (invalidations.isInvalidated([this.INVALIDATIONS.PART_SIZE]) ||
                this.parent(invalidations));
        },

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations,
                properties = this.getComponentProperties(),
                mode = properties.get('onClickBehavior') || '',
                isModeZoom = mode === 'zoomAndPanMode',
                isModeLink = mode === 'goToLink',
                changedObject,
                touchState = Modernizr.touch ? 'hasTouch' : 'noTouch',
                changedField;

            if (this.className === 'wysiwyg.viewer.components.WPhoto') {
                this.PREVENT_LINK_RENDER = true;
            } else {
                this.PREVENT_LINK_RENDER = false;
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.SKIN_CHANGE, this.INVALIDATIONS.PART_SIZE])) {
                this._updateFramePadding();
                this._updateImageSize(this.getWidth(), this.getHeight());
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE, this.INVALIDATIONS.SKIN_CHANGE])) {
                var image = this._skinParts.img;
                image.setZoom(isModeZoom);
                if (!isModeZoom) {
                    image.fireEvent('resize', false);
                } else {
                    image.fireEvent('resize', image.isOriginalImageSmallerThanWrapper());
                }
            }

            this._updateImageSettings();//This line MUST remain before the nex block of code!!! Otherwise, tests will fail

            if (invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE])) {
                this._setTitle();
                this._checkResizeInFitMode();
                this._skinParts.img._view.style.cursor = '';

                changedObject = invalidations._invalidations.dataChange[0];
                if (!!changedObject && changedObject.field === 'link' && !!changedObject.value.link) {
                    this.getComponentProperties().set('onClickBehavior', 'goToLink');
                }
                this._clickEventSelector();
                this._renderLink();
            }
            this.setState(touchState, 'touch');
        },

        _normalizeTitle: function(title) {
            var CHARS_TO_ADD = '...';
            var NUM_OF_CHARS_TO_KEEP = 3;
            var TITLE_LENGTH_LIMIT = 100;

            if (title.length <= TITLE_LENGTH_LIMIT) {
                return title;
            }
            var arr = title.split('');
            var numOfCharsToRemove = title.length - TITLE_LENGTH_LIMIT + CHARS_TO_ADD.length;
            var isFileTypeSuffix = title.lastIndexOf('.') > title.length - numOfCharsToRemove - NUM_OF_CHARS_TO_KEEP;
            var fileTypeSuffixIndex = isFileTypeSuffix ? title.lastIndexOf('.') : title.length - 1;
            var removeIndex = fileTypeSuffixIndex - numOfCharsToRemove - NUM_OF_CHARS_TO_KEEP;
            arr.splice(removeIndex, numOfCharsToRemove, CHARS_TO_ADD);
            return arr.join('');
        },

        _clickEventSelector: function () {
            var onClickBehavior = this.getComponentProperty('onClickBehavior');
            this._skinParts.view.removeEvent('click', this._onClick);

            switch (onClickBehavior) {
                case 'zoomMode':
                    this._zoomModeSelected();
                    break;
                case 'goToLink':
                    this.PREVENT_LINK_RENDER = false;
                    break;
                case 'disabled':
                    this._doNothigModeSelected();
                    break;
            }
        },

        _doNothigModeSelected: function () {
            this.PREVENT_LINK_RENDER = true;
            this._skinParts.img._view.style.cursor = 'default';
        },

        _zoomModeSelected: function () {
            this.PREVENT_LINK_RENDER = true;
            this._skinParts.view.addEvent('click', this._onClick);
            this._skinParts.img._view.style.cursor = 'pointer';
        },

        _onClick: function (event) {
            if (event.rightClick !== false) {
                return;
            }
            if (this.getComponentProperty('onClickBehavior') === 'zoomMode') {
                this.resources.W.Commands.executeCommand('WViewerCommands.OpenZoom', {'item': this._data,
                    'getDisplayerDivFunction': this.resources.W.Viewer.getDefaultGetZoomDisplayerFunction('Image')
                }, this);
            }
        },

        _renderLink: function () {
            if (this.PREVENT_LINK_RENDER) {
                this._linkRenderer.removeRenderedLinkFrom(this._skinParts.link, this);
                return;
            }

            var dataItemWithSchema = this.getDataItem();
            var linkId = dataItemWithSchema._data.link;
            if (!linkId) {
                this._linkRenderer.removeRenderedLinkFrom(this._skinParts.link, this);
                return;
            }
            var linkDataItem = this.resources.W.Data.getDataByQuery(linkId);
            if (linkDataItem) {
                this._linkRenderer.renderLink(this._skinParts.link, linkDataItem, this);
            }
        },

        _setImageArgs: function (definition) {
            definition.argObject = {
                'requestExactSize': !this.resources.W.Config.env.$isEditorViewerFrame
            };
            return definition;
        },

        _preventRenderOnDataChange: function (dataItem, field, value) {
            if (!field || field === 'displayMode' || field === 'href') {
                return false;
            }
            return true;
        },

        setWidth: function (value, dontCheckFitMode) {
            this.parent(value);
            this._updateImageSize(value, null);
            if (!dontCheckFitMode) {
                this._changeCropModeInFit(true);
                this._skinParts.img.setSettings(this._imageSettings);
                this._checkResizeInFitMode();
            }
        },

        setHeight: function (value, dontCheckFitMode) {
            this.parent(value);
            this._updateImageSize(null, value);
            if (!dontCheckFitMode) {
                this._changeCropModeInFit(false);
                this._skinParts.img.setSettings(this._imageSettings);
                this._checkResizeInFitMode();
            }
        },

        _changeCropModeInFit: function (isWidth) {
            if (!this.isDisplayed() || this._getDisplayMode() !== 'fitWidth') {
                return;
            }
            if (isWidth) {
                this._imageSettings.setCropMode(this._imageSettings.CropModes.FIT_WIDTH);
            } else {
                this._imageSettings.setCropMode(this._imageSettings.CropModes.FIT_HEIGHT);
            }

        },

        _updateImageSize: function (width, height) {
            if (!this._framePadding) {
                this._updateFramePadding();
            }
            if (width !== null && !isNaN(width)) {
                var contentWidth = width - this._framePadding.x;
                this._imageSettings.setWidth(contentWidth);
            }
            if (height !== null && !isNaN(height)) {
                var contentHeight = height - this._framePadding.y;
                this._imageSettings.setHeight(contentHeight);
            }
        },

        _checkResizeInFitMode: function () {
            var framePadding = this._framePadding;
            if(!this._skinParts.img.getSize()){
                return;
            }
            if (this._imageSettings.getCropMode() === this._imageSettings.CropModes.FIT_WIDTH) {
                var imageHeight = this._skinParts.img.getSize().y;
                this.setHeight(imageHeight + framePadding.y, true);
            } else if (this._imageSettings.getCropMode() === this._imageSettings.CropModes.FIT_HEIGHT) {
                var imageWidth = this._skinParts.img.getSize().x;
                this.setWidth(imageWidth + framePadding.x, true);
            }
        },

        _updateImageSettings: function () {
            var imageCropMode = this._getImageCropMode();
            this._imageSettings.setCropMode(imageCropMode);
            if (this._skinParts.img.setSettings) {

                this._skinParts.img.setSettings(this._imageSettings);
            }
        },

        _updateFramePadding: function () {
            var skin = this.getSkin();
            var paddingParams = {
                left: skin.getParamValue('contentPaddingLeft'),
                right: skin.getParamValue('contentPaddingRight'),
                top: skin.getParamValue('contentPaddingTop'),
                bottom: skin.getParamValue('contentPaddingBottom')
            };
            var padding = {
                left: parseInt(paddingParams.left ? paddingParams.left._amount : 0, 10),
                right: parseInt(paddingParams.right ? paddingParams.right._amount : 0, 10),
                top: parseInt(paddingParams.top ? paddingParams.top._amount : 0, 10),
                bottom: parseInt(paddingParams.bottom ? paddingParams.bottom._amount : 0, 10)
            };

            this._framePadding = {
                x: padding.left + padding.right,
                y: padding.top + padding.bottom
            };
        },

        _getImageCropMode: function () {
            var imageCropMode = this.getComponentProperty('displayMode');
            if (imageCropMode === 'fitWidthStrict') {
                imageCropMode = this._imageSettings.CropModes.FIT_WIDTH;
            }
            if (imageCropMode === 'fitHeightStrict') {
                imageCropMode = this._imageSettings.CropModes.FIT_HEIGHT;
            }
            return imageCropMode;
        },

        /**
         * @overrides WBaseComponent method
         */
        getMinPhysicalHeight: function () {
            return this._getContentPaddingSize().y;
        },

        //Experiment PhotoLayoutFix.New was promoted to feature on Thu Oct 11 11:08:37 IST 2012
        _renderImage: function () {
            if (!this._layoutInitialized) {
                return;
            }
            var image = this._skinParts.img;
            if (!image || !image.getOriginalClassName) {
                return;
            }
            var settings = this._getImageSettings();
            image.setSettings(settings);
            if (settings.getCropMode() === settings.CropModes.FIT_WIDTH) {
                this.setHeight(image.getSize().y + this._getContentPaddingSize().y, false, false, true);

            } else if (settings.getCropMode() === settings.CropModes.FIT_HEIGHT) {
                this.setWidth(image.getSize().x + this._getContentPaddingSize().x, false, false, true);
            }
            this._fireAutoSize();
        },

        _fireAutoSize: function () {
            if (this._autoSizeState !== this._autoSizeStates.none) {
                this.fireEvent('autoSized', { 'ignoreLayout': this._autoSizeState === this._autoSizeStates.autoSizeNoLayoutUpdate});
                if (this.injects().Layout) { // make sure notifying layout only in viewer
                    this.injects().Layout.notifyPositionChanged(this, 'updateSize');
                }
                this._autoSizeState = this._autoSizeStates.none;
            }
        },

        _styleChanged: function () {
            var padding = this._getContentPaddingSize(true);
            this.setMinH(padding.y + this.MIN_IMAGE_HEIGHT);
            this.setMinW(padding.x + this.MIN_IMAGE_WIDTH);
            var photoInnerSize = this._getPhotoInnerSize();
            this._getImageSettings().setSize(photoInnerSize.x, photoInnerSize.y);
        },

        _getContentPaddingSize: function (forceUpdate) {
            if (!this._contentPadding || forceUpdate) {
                this._contentPadding = {};
                var skin = this.getSkin();
                this._contentPadding.x = parseInt(skin.getParamValue('contentPaddingLeft'), 10) +
                    parseInt(skin.getParamValue('contentPaddingRight'), 10);
                this._contentPadding.y = parseInt(skin.getParamValue('contentPaddingTop'), 10) +
                    parseInt(skin.getParamValue('contentPaddingBottom'), 10);

                this._contentPadding.x = isNaN(this._contentPadding.x) ? 0 : this._contentPadding.x;
                this._contentPadding.y = isNaN(this._contentPadding.y) ? 0 : this._contentPadding.y;
                this.getSizeLimits().minH = this._contentPadding.y;
                this.getSizeLimits().minW = this._contentPadding.x;
            }
            return this._contentPadding;
        },

        _getImageSettings: function () {
            if (!this._imageSettings) {
                var photoInnerSize = this._getPhotoInnerSize();
                var imageDisplayMode = this._translateDisplayModeToImageCropMode(this._getDisplayMode());
                this._imageSettings = new this.imports.ImageSettings(imageDisplayMode, photoInnerSize.x, photoInnerSize.y);
            }
            return this._imageSettings;
        },

        _getPhotoInnerSize: function () {
            var paddingSize = this._getContentPaddingSize();
            var width = this.getWidth() - paddingSize.x;
            var height = this.getHeight() - paddingSize.y;
            return {'x': width, 'y': height};
        },

        _setTitle: function () {
            var title = this._normalizeTitle(this._data.get('title'));
            this._skinParts.view.set('title', title);
            if (title !== this._data.get('title')) {
                this.getDataItem().set('title', title);
            }
        },

        _getDisplayMode: function () {
            return this.getComponentProperty('displayMode');
        },

        _getImageDisplayMode: function () {
            return this._getImageSettings() && this._getImageSettings().getCropMode();
        },

        _translateDisplayModeToImageCropMode: function (displayMode) {
            var imageCropMode = displayMode;
            if (displayMode === 'fitWidthStrict') {
                imageCropMode = this._SettingsClass.CropModes.FIT_WIDTH;
            }
            if (displayMode === 'fitHeightStrict') {
                imageCropMode = this._SettingsClass.CropModes.FIT_HEIGHT;
            }
            return imageCropMode;
        },

        allowHeightLock: function () {
            return !this._isFitMode();
        },

        _isFitMode: function () {
            var fitModes = ['fitWidth', 'fitWidthStrict', 'fitHeightStrict'];
            return fitModes.indexOf(this._getDisplayMode()) >= 0;
        },

        _mediaGalleryCallback: function (rawData) {
            this.getDataItem().setFields({
                title: rawData.title,
                description: rawData.description || "",
                height: rawData.height,
                width: rawData.width,
                uri: rawData.fileName
            });

            this._reportLogEvent();
        },

        _reportLogEvent: function () {
            LOG.reportEvent(wixEvents.CHANGE_IMAGE_CLICK_SUCCESS, {c1: this.className });
        }
    });
});
