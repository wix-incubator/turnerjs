/**
 * @class wysiwyg.viewer.components.WPhotoOBC
 */
define.component('wysiwyg.viewer.components.WPhotoOBC', function (componentDefinition) {
        /**@type core.managers.component.ComponentDefinition */
        var def = componentDefinition;

        def.inherits('mobile.core.components.base.BaseComponent');

        def.binds(["_mediaGalleryCallback"]);

        def.utilize([
            'core.components.image.ImageSettings',
            'core.components.image.ImageDimensionsNew',
            'wysiwyg.common.utils.LinkRenderer'
        ]);

        def.resources(["W.Config", 'W.Data']);

        def.skinParts( {
            'link':{ type:'htmlElement' },
            'img':{ 'type':'core.components.image.ImageNew', 'dataRefField':'*', 'hookMethod': '_setImageArgs'}
        });

        def.dataTypes(['Image']);

        def.propertiesSchemaType('WPhotoProperties');

        def.fields({
            _renderTriggers:[ Constants.DisplayEvents.ADDED_TO_DOM, Constants.DisplayEvents.DISPLAYED, Constants.DisplayEvents.DISPLAY_CHANGED, Constants.DisplayEvents.SKIN_CHANGE ]
        });


        def.statics({
            MIN_IMAGE_HEIGHT:1,
            MIN_IMAGE_WIDTH:1,

            _autoSizeStates:{
                'none':1,
                'autoSizeNoLayoutUpdate':2,
                'autoSizeUpdateLayout':3
            },
            EDITOR_META_DATA:{
                general:{
                    settings    : true,
                    design      : true
                },
                custom:[
                    {
                        label   : 'PHOTO_REPLACE_IMAGE',
                        command : 'WEditorCommands.OpenMediaFrame',
                        commandParameter : {
                            galleryConfigID: 'photos',
                            publicMediaFile: 'photos',
                            selectionType: 'single',
                            i18nPrefix: 'single_image',
                            mediaType: 'picture',
                            callback: "_mediaGalleryCallback"
                        }
                    },
                    {
                        label   : 'PHOTO_EDIT_IMAGE',
                        command : 'WEditorCommands.OpenAviaryDialog'
                    },
                    {
                        label   : 'LINK_LINK_TO',
                        command : 'WEditorCommands.OpenLinkDialogCommand',
                        commandParameter : {
                            position: 'center'
                        },
                        commandParameterDataRef: 'SELF'
                    }
                ],
                dblClick:{
                    command : 'WEditorCommands.OpenMediaFrame',
                    commandParameter : {
                        galleryConfigID: 'photos',
                        publicMediaFile: 'photos',
                        selectionType: 'single',
                        i18nPrefix: 'single_image',
                        mediaType: 'picture',
                        callback: "_mediaGalleryCallback"
                    }
                }
            }
        });

        /**
         * @lends wysiwyg.viewer.components.WPhoto
         */
        def.methods({
            initialize:function (compId, viewNode, argsObject) {
                this._imageDimensions = new this.imports.ImageDimensionsNew();
                this._SettingsClass = this.imports.ImageSettings;
                this.parent(compId, viewNode, argsObject);
                if (argsObject && argsObject.props) {
                    this.setComponentProperties(argsObject.props);
                }
                this._contentPadding = {'x':0, 'y':0};
                this._autoSizeState = this._autoSizeStates.none;
                this._initialDataChange = true;

                this._linkRenderer = new this.imports.LinkRenderer();
            },

            _setImageArgs: function(definition){
                definition.argObject = {'requestExactSize': !this.injects().Config.env.$isEditorViewerFrame};
                return definition;
            },

            _onAllSkinPartsReady:function (skinParts) {
                this.parent(skinParts);
                if (this._data) {
                    this._setTitle();
                }
            },

            _preventRenderOnDataChange: function(dataItem, field, value){
                if(!field || field == 'displayMode' || field == 'href'){
                    return false;
                }
                return true;
            },


            //Experiment PhotoLayoutFix.New was promoted to feature on Thu Oct 11 11:08:36 IST 2012

            _onDataChange:function (dataItem, field, value) {
                if (this._skinParts && field == 'title') {
                    this._setTitle();
                }

                if (field == 'displayMode') {
                    var imageCropMode = this._translateDisplayModeToImageCropMode(value.displayMode);
                    this._getImageSettings().setCropMode(imageCropMode);
                }
                //(!field) - this means that the whole image was replaced or display mode changed
                if (!this._initialDataChange && this._isFitMode() &&
                    (field == 'displayMode' || !field)) {
                    this._autoSizeState = this._autoSizeStates.autoSizeUpdateLayout;
                }
                this._initialDataChange = false;
                this.parent(dataItem, field, value);
            },


            //Experiment PhotoLayoutFix.New was promoted to feature on Thu Oct 11 11:08:36 IST 2012

            setWidth:function (value, forceUpdate, triggersOnResize, isInternal) {
                if (!value || isNaN(value)) {
                    return;
                }
                // Prevent user from modifying width if in strict mode
                if (!isInternal && this._getDisplayMode() == 'fitHeightStrict') {
                    return;
                }
                this._getImageSettings().setContainerWidth(value - this._getContentPaddingSize().x);
                this.parent(value, forceUpdate, triggersOnResize);
                if (!isInternal) {
                    var imageDisplayMode = this._getImageDisplayMode();
                    if (imageDisplayMode == this._SettingsClass.CropModes.FIT_HEIGHT && this._isDisplayed) {
                        this._getImageSettings().setCropMode(this._SettingsClass.CropModes.FIT_WIDTH);
                    }
                    if(imageDisplayMode === this._SettingsClass.CropModes.FIT_WIDTH || imageDisplayMode === this._SettingsClass.CropModes.FIT_HEIGHT){
                        this._autoSizeState = this._autoSizeStates.autoSizeNoLayoutUpdate;
                    }
                    this._renderImage();
                }
            },


            //Experiment PhotoLayoutFix.New was promoted to feature on Thu Oct 11 11:08:37 IST 2012

            setHeight:function (value, forceUpdate, triggersOnResize, isInternal) {
                if (!value || isNaN(value)) {
                    return;
                }
                // Prevent user from modifying height if in strict mode
                if (!isInternal && this._getDisplayMode() == 'fitWidthStrict') {
                    return;
                }
                this.parent(value, forceUpdate, triggersOnResize);
                this._getImageSettings().setContainerHeight(value - this._getContentPaddingSize().y);
                if (!isInternal) {
                    var imageDisplayMode = this._getImageDisplayMode();
                    if (imageDisplayMode == this._SettingsClass.CropModes.FIT_WIDTH && this._isDisplayed) {
                        this._getImageSettings().setCropMode(this._SettingsClass.CropModes.FIT_HEIGHT);
                    }
                    if(imageDisplayMode === this._SettingsClass.CropModes.FIT_WIDTH || imageDisplayMode === this._SettingsClass.CropModes.FIT_HEIGHT){
                        this._autoSizeState = this._autoSizeStates.autoSizeNoLayoutUpdate;
                    }
                    this._renderImage();
                }
            },

            /**
             * @overrides WBaseComponent method
             */
            getMinPhysicalHeight:function () {
                return this._getContentPaddingSize().y;
            },


            //Experiment PhotoLayoutFix.New was promoted to feature on Thu Oct 11 11:08:37 IST 2012

            render:function () {
                //TODO: change when we can tell whether the render is caused by a skin change
                this._styleChanged();
                this._renderImage();
                this.parent();

                this._renderLink();
            },

            _renderLink: function() {
                if (this.PREVENT_LINK_RENDER) {
                    this._linkRenderer.removeRenderedLinkFrom(this._skinParts.link, this);
                    return;
                }

                var dataItemWithSchema = this.getDataItem();
                var linkId = dataItemWithSchema._data.link;
                if(!linkId) {
                    this._linkRenderer.removeRenderedLinkFrom(this._skinParts.link, this);
                    return;
                }
                var linkDataItem = this.resources.W.Data.getDataByQuery(linkId) ;
                if(linkDataItem) {
                    this._linkRenderer.renderLink(this._skinParts.link, linkDataItem, this);
                }
            },

            //Experiment PhotoLayoutFix.New was promoted to feature on Thu Oct 11 11:08:37 IST 2012

            _renderImage:function () {
                if (!this._layoutInitialized) {
                    return;
                }
                var image = this._skinParts.img;
                if (!image || !image.getOriginalClassName) {
                    return;
                }
                var settings = this._getImageSettings();
                image.setSettings(settings);
                if (settings.getCropMode() == settings.CropModes.FIT_WIDTH) {
                    this.setHeight(image.getSize().y + this._getContentPaddingSize().y, false, false, true);

                } else if (settings.getCropMode() == settings.CropModes.FIT_HEIGHT) {
                    this.setWidth(image.getSize().x + this._getContentPaddingSize().x, false, false, true);
                }
                this._fireAutoSize();
            },


            //Experiment PhotoLayoutFix.New was promoted to feature on Thu Oct 11 11:08:37 IST 2012

            _fireAutoSize: function(){
                if(this._autoSizeState != this._autoSizeStates.none){
                    this.fireEvent('autoSized', { 'ignoreLayout': this._autoSizeState == this._autoSizeStates.autoSizeNoLayoutUpdate});
                    if (!this.resources.W.Config.env.$isEditorFrame) {
                        this.injects().Layout.notifyPositionChanged(this, 'updateSize');
                    }
                    this._autoSizeState = this._autoSizeStates.none;
                }
            },

            _styleChanged:function () {
                var padding = this._getContentPaddingSize(true);
                this.setMinH(padding.y + this.MIN_IMAGE_HEIGHT);
                this.setMinW(padding.x + this.MIN_IMAGE_WIDTH);
                var photoInnerSize = this._getPhotoInnerSize();
                this._getImageSettings().setSize(photoInnerSize.x, photoInnerSize.y);
            },
            _getContentPaddingSize:function (forceUpdate) {
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


            _getImageSettings:function () {
                if (!this._imageSettings) {
                    var photoInnerSize = this._getPhotoInnerSize();
                    var imageDisplayMode = this._translateDisplayModeToImageCropMode(this._getDisplayMode());
                    this._imageSettings = new this.imports.ImageSettings(imageDisplayMode, photoInnerSize.x, photoInnerSize.y);
                }
                return this._imageSettings;
            },

            _getPhotoInnerSize:function () {
                var paddingSize = this._getContentPaddingSize();
                var width = this.getWidth() - paddingSize.x;
                var height = this.getHeight() - paddingSize.y;
                return {'x':width, 'y':height};
            },

            _setTitle:function () {
                var title = this._data.get('title');
                this._skinParts.view.set('title', title);
            },

            _getDisplayMode:function () {
                return this.getComponentProperty('displayMode');
            },
            _getImageDisplayMode:function () {
                return this._getImageSettings() && this._getImageSettings().getCropMode();
            },
            _translateDisplayModeToImageCropMode:function (displayMode) {
                var imageCropMode = displayMode;
                if (displayMode == 'fitWidthStrict') {
                    imageCropMode = this._SettingsClass.CropModes.FIT_WIDTH;
                }
                if (displayMode == 'fitHeightStrict') {
                    imageCropMode = this._SettingsClass.CropModes.FIT_HEIGHT;
                }
                return imageCropMode;
            },

            //Experiment PhotoLayoutFix.New was promoted to feature on Thu Oct 11 11:08:37 IST 2012
            allowHeightLock:function () {
                return !this._isFitMode();
                //return this._getDisplayMode() != 'fitWidth';
            },

            //Experiment PhotoLayoutFix.New was promoted to feature on Thu Oct 11 11:08:37 IST 2012
            _isFitMode:function () {
                var fitModes = ['fitWidth', 'fitWidthStrict', 'fitHeightStrict'];
                return fitModes.indexOf(this._getDisplayMode()) >= 0;
            },

            _mediaGalleryCallback: function(rawData) {
                this.getDataItem().setFields({
                    title       : rawData.title,
                    description : rawData.description || "",
                    height      : rawData.height,
                    width       : rawData.width,
                    uri         : rawData.fileName
                });
            }
        });

    });
