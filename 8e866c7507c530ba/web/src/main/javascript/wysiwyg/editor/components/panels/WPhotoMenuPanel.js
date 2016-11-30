define.component('wysiwyg.editor.components.panels.WPhotoMenuPanel', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Resources', 'W.Data', 'scriptLoader', 'W.Commands', 'W.Preview']);

    def.binds(['_createStylePanel', '_revertImage', 'photoDataChangeEvent', 'setAviaryCommandState', '_mediaGalleryCallback']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['Image']);

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._galleryConfigName = args.galleryConfigName || 'photos';

            this.setAviaryCommandState(false);
            this.resource.getResourceValue('Aviary', this.setAviaryCommandState);
            this._previewComponent = args.previewComponent;

            this._htmlCharactersValidator = this._inputValidators.htmlCharactersValidator;
        },

        setAviaryCommandState: function (aviary) {
            if (aviary) {
                this.resources.W.Commands.getCommand('WEditorCommands.OpenAviaryDialog').enable();
            } else {
                this.resources.W.Commands.getCommand('WEditorCommands.OpenAviaryDialog').disable();
            }
        },

        _onAllSkinPartsReady: function () {
            this.parent() ;
            this.resources.W.Utils.preventMouseDownOn(this._skinParts.content);
        },

        _createFields: function () {
            this._addImageField();
            this._addImageDetails();
            this._addImageLink();
            this.addStyleSelector();
            this.addAnimationButton();
        },

        _addImageField: function () {
            this.addInputGroupField(function (panel) {
                this.addImageField(null, null, null, this._translate('PHOTO_REPLACE_IMAGE'), panel._galleryConfigName, false, 'blue', null, null, 'photos', 'single_image', panel._mediaGalleryCallback, null, 'panel', 'WPhoto').bindToDataItem(this._data);
            });

            this.addInputGroupField(function (panel) {
                var combo;
                var inputToDataHook = function (data) {
                    if (data === 'fitWidth' && panel._previewComponent.getHorizontalGroup()) {
                        combo.setValue('fill');
                        return 'fill';
                    }
                    return data;
                };
                combo = this.addComboBoxField(this._translate('PHOTO_IMAGE_SCALING'), panel._getCropModesList(), undefined, '', 'Image_Settings_Image_Scaling_ttid').bindToProperty('displayMode').bindHooks(inputToDataHook);
            });

            this.addInputGroupField(function (panel) {
                var iconObj = {
                    iconSrc: 'button/edit-image-icon.png',
                    iconSize: {width: 28, height: 28}
                };

                this.addButtonField('', this._translate('PHOTO_EDIT_IMAGE'), false, iconObj, 'withArrow', null, null, 'WEditorCommands.OpenAviaryDialog').addEvent(Constants.CoreEvents.CLICK,function () {
                    LOG.reportEvent(wixEvents.AVIARY_EDIT_IMAGE, {c1: panel._data.get('uri'), i1: panel._data.get('originalImageDataRef') ? 1 : 0});
                }).runWhenReady(function (logic) {
                        if (!panel.resources.W.Commands.getCommand('WEditorCommands.OpenAviaryDialog').isEnabled()) {
                            logic.disable();
                        }
                    });
                this.addButtonField('', this._translate('PHOTO_REVERT_IMAGE'), false, null, 'revertImage').addEvent(Constants.CoreEvents.CLICK, panel._revertImage).runWhenReady(function runWhenReady(logic) {
                    var dataItem = panel.getDataItem();
                    panel.revertButton = logic;

                    if (dataItem) {
                        //disable or enable revert on data change
                        dataItem.addEvent(Constants.DataEvents.DATA_CHANGED, panel.photoDataChangeEvent);

                        //run once
                        panel.photoDataChangeEvent(dataItem);
                    }
                });
            });
        },

        _mediaGalleryCallback: function (rawData) {
            this._previewComponent._mediaGalleryCallback(rawData);
        },

        _addImageDetails: function () {
            var thisPanel = this;

            this.addInputGroupField(function (panel) {
                this.addInputField(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'PHOTO_TITLE'), null, null, 100, {validators: [thisPanel._htmlCharactersValidator]}, null, "Image_Settings_Title_ttid").bindToField('title');
                this.addInputField(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'PHOTO_ALT_TEXT'), null, null, 256, {validators: [thisPanel._htmlCharactersValidator]}, null, "Image_Settings_Alt_Text_ttid").bindToField('alt');
            });
        },

        _addImageLink: function () {
            var linkField,
                panel = this;

            this.addInputGroupField(function (panel) {
                var combo = this.addComboBoxField(this._translate('PHOTO_IMAGE_BEHAVIOR'), panel._getClickModesList(), undefined, '', null).bindToProperty('onClickBehavior'),
                    smallImageLabel = this.addLabel(this._translate('Types.WPhotoProperties.displayMode.zoomAndPanMode.imageIsSmall')),
                    image = this._previewComponent._skinParts.img;

                image.addEvent("resize", function (showSmallImageLabel) {
                    if (showSmallImageLabel) {
                        smallImageLabel.uncollapse();
                    } else {
                        smallImageLabel.collapse();
                    }
                });

                if (image._isZoomOn() && image.isOriginalImageSmallerThanWrapper()) {
                    smallImageLabel.uncollapse();
                } else {
                    smallImageLabel.collapse();
                }
            });

            linkField = this.addInputGroupField(function (panel) {
                var lbl = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'LINK_LINK_TO'),
                    plcHldr = 'http://www.wix.com';
                this.addLinkField(lbl, plcHldr).bindToDataItem(this.getDataItem());
            });

            this.addVisibilityCondition(linkField, function () {
                return (this._previewComponent.getComponentProperty('onClickBehavior') === 'goToLink');
            }.bind(this));
        },

        _getClickModesList: function () {
            var optionList = [],
                visibleCropMode = ['disabled', 'goToLink', 'zoomMode', 'zoomAndPanMode'],
                i;

            for (i = 0; i < visibleCropMode.length; i++) {
                var enumEntry = visibleCropMode[i],
                    label = W.Resources.get('EDITOR_LANGUAGE', 'Types.WPhotoProperties.displayMode.' + enumEntry);
                optionList.push({value: enumEntry, label: label});
            }
            return optionList;
        },


        photoDataChangeEvent: function (item) {
            if (item.get('originalImageDataRef')) {
                this.revertButton.enable();
            } else {
                this.revertButton.disable();
            }
        },

        disposeFields: function () {
            this.parent();
            this._data.removeEvent(Constants.DataEvents.DATA_CHANGED, this.photoDataChangeEvent);
        },
        /**
         * Revert the image to its saved 'originalImageDataRef' value if exists.
         */
        _revertImage: function (event) {
            LOG.reportEvent(wixEvents.AVIARY_REVERT_IMAGE, {c1: this._data.get('uri'), i1: this._data.get('originalImageDataRef') ? 1 : 0});
            var originalImageDataRef = this._data.get('originalImageDataRef');
            if (!originalImageDataRef) {
                return;
            }

            var originalImageData = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery(originalImageDataRef);
            if (originalImageData) {
                this._data.setData(originalImageData.getData());
            }
        },

        _getCropModesList: function () {
            var optionList = [],
                visibleCropMode = ['fill', 'full', 'stretch', 'fitWidth'],
                i,
                enumEntry,
                label;

            for (i = 0; i < visibleCropMode.length; i++) {
                enumEntry = visibleCropMode[i];
                label = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'Types.WPhotoProperties.displayMode.' + enumEntry);
                optionList.push({value: enumEntry, label: label});
            }
            return optionList;
        }
    });

});

