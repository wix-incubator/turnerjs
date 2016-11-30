define.component('wysiwyg.editor.components.dialogs.ListEditDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.resources(['W.Commands', 'W.Resources', 'W.Preview', 'W.Editor', 'W.UndoRedoManager']);
    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds(['_onPhotosAdded']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'},
        splashScreen: {type: 'wysiwyg.editor.components.inputs.AddImageScreen'}
    });
    def.statics({
        MEDIA_GALLERY: {
            DisabledDataTypes: ["xxx-social_icons", "xxx-audio", "xxx-favicon"],
            DataTypes: {
                "picture": "Image"
            }
        }
    });
    def.dataTypes(["ImageList"]);
    def.states({ 'content': ['normalContent', 'splashscreen']});
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._galleryConfigID = args.galleryConfigID || "photos";
            this._showDescription = args.showDescription;
            this._showTitle = args.showTitle;
            this._showSplashScreen = args.showSplashScreen;
            this._startingTab = args.startingTab;
            this._imageDetails = null;
            this._moveToLastBtn = null;
            this._moveDownBtn = null;
            this._moveUpBtn = null;
            this._moveToFirstBtn = null;
            this._deleteBtn = null;
            resource.getResources(["W.Editor", "W.UndoRedoManager"], function(resources) {
                this._undoRedoManager = resources.W.UndoRedoManager;
            }.bind(this));

            this._mgConf = {
                i18nPrefix: "multiple_images",
                publicMediaFile: "photos",
                selectionType: "multiple",
                mediaType: "picture"
            };

            if (this._galleryConfigID === 'social_icons') {
                this._mgConf.i18nPrefix = "multiple_icons";
                this._mgConf.publicMediaFile = 'social_icons';
                this._mgConf.selectionImgField = 'single_icon';
            }
        },

        _onAllSkinPartsReady: function () {
            this._skinParts.splashScreen.addEvent('addImageRequested', function () {
                this.resources.W.Commands.executeCommand("WEditorCommands.OpenMediaFrame", {
                    // actual changes
                    galleryConfigID: this._galleryConfigID,
                    callback: this._onPhotosAdded,
                    i18nPrefix: this._mgConf.i18nPrefix,
                    publicMediaFile: this._mgConf.publicMediaFile,
                    selectionType: this._mgConf.selectionType,
                    mediaType: this._mgConf.mediaType,
                    startingTab: this._startingTab
                });

            }.bind(this));

            this._skinParts.splashScreen.addEvent('keepPreset', function () {
                this._data.setMeta("isPreset", false);
                this.injects().Preview.getPreviewManagers().Data.markDirtyObject(this._data);
                this.setState('normalContent');
            }.bind(this));
        },

        _createFields: function () {
            this.setNumberOfItemsPerLine(2);
            this.addInputGroupField(function (panel) {
                panel._createManageBtns(panel, this);
                this.addBreakLine('15px');
                panel._createImageList(panel, this);
            }, 'skinless');
            this._createImageDetails();
            this._checkDataState();
        },

        _createImageDetails: function () {
            this._imageDetails = this.addInputGroupField(function (panel) {
                var resources = this.injects().Resources;
                this.addImageField(
                    null, 100, 450, resources.get('EDITOR_LANGUAGE', "IMAGE_REPLACE_ALT"),
                    panel._galleryConfigID, null, 'gallery', null, null,
                    panel._mgConf.publicMediaFile,
                    panel._mgConf.selectionImgField,
                    null, null ,null ,null,
                    panel._startingTab

                ).bindToDataItem(this.getDataItem());


                if (panel._showTitle) {
                    this.addInputField(resources.get('EDITOR_LANGUAGE', "GENERAL_TITLE"), resources.get('EDITOR_LANGUAGE', "ORGANIZE_PHOTOS_DIALOG_IMAGE_TITLE_PH"), 0, 36, null, null, 'Organize_Images_Dialog_Title_ttid').bindToField('title');
                }
                if (panel._showDescription) {
                    this.addTextAreaField(resources.get('EDITOR_LANGUAGE', "GENERAL_DESCRIPTION"), 160, null, 500, null, null, 'Organize_Images_Dialog_Description_ttid').bindToField('description');
                }
                this.addLinkField(resources.get('EDITOR_LANGUAGE', 'LINK_LINK_TO'), null, null).bindToDataItem(this.getDataItem());

            }, 'menus', null, null, { width: 300, padding: '5px 0 0 0' }).createFieldsAfterDataUpdate();
            this._imageDetailsListView = this._imageDetails.getHtmlElement();

            this._imageDetails.bindDataItemToValueOf(this._imageList);
        },

        _createBtn: function (panel, btnCont, iconUrl, toolTip, manipulationType, skinName) {
            return btnCont.addButtonField(null, null, false, {iconSrc: iconUrl, iconSize: {width: 12, height: 14}, spriteOffset: {x: 0, y: 0}}, skinName, null, toolTip)
                .addEvent(Constants.CoreEvents.CLICK, function () {
                    panel._updateImageList(manipulationType);
                    panel._scrollImageList(manipulationType);
                });
        },

        _updateImageList: function (manipulationType) {
            if (this._imageList && this._imageList[manipulationType] && typeof this._imageList[manipulationType] === 'function') {
                this._imageList[manipulationType]();
            } else {
                throw new Error('Invalid manipulationType: ' + manipulationType);
            }
        },

        _scrollImageList: function (manipulationType) {
            switch (manipulationType) {
                case 'moveToLastSelectedItem':
                    this._imageList.getViewNode().scrollTop = this._imageList.getViewNode().scrollHeight;
                    break;
                case 'moveToFirstSelectedItem':
                    this._imageList.getViewNode().scrollTop = 0;
                    break;
                default:
                    break;
            }
        },

        _createManageBtns: function (panel, btnContainer) {
            panel._createAddImagesBtn(panel, btnContainer);
            btnContainer.addBreakLine('6px');
            btnContainer.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0, '27px');
                this.addInputGroupField(function (panel) {
                    this.setNumberOfItemsPerLine(0, '3px');
                    panel._moveToLastBtn = panel._createBtn(panel, this, 'buttons/imagemanager_movetolast.png', 'ImageManager_Last_ttid', "moveToLastSelectedItem", 'imageManager');
                    panel._moveDownBtn = panel._createBtn(panel, this, 'buttons/imagemanager_movedown.png', 'ImageManager_Down_ttid', "moveDownSelectedItem", 'imageManager');
                    panel._moveUpBtn = panel._createBtn(panel, this, 'buttons/imagemanager_moveup.png', 'ImageManager_Up_ttid', "moveUpSelectedItem", 'imageManager');
                    panel._moveToFirstBtn = panel._createBtn(panel, this, 'buttons/imagemanager_movetofirst.png', 'ImageManager_First_ttid', "moveToFirstSelectedItem", 'imageManager');
                }, 'skinless');
                panel._deleteBtn = panel._createBtn(panel, this, 'buttons/imagemanager_delete.png', 'ImageManager_Delete_ttid', "deleteSelectedItem", 'imageManagerDeleteBtn');
            }, 'skinless');
        },

        _createAddImagesBtn: function (panel, btnCont) {
            var resources = panel.injects().Resources;
            var editorDialogs = panel.injects().EditorDialogs;
            var buttonText = resources.get('EDITOR_LANGUAGE', "ADD_" + this._galleryConfigID.toUpperCase() + "_BUTTON_TEXT");
            btnCont.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);
                this.addButtonField(null, buttonText, false, null, 'blue', '126px').addEvent(Constants.CoreEvents.CLICK, function () {
                    if (panel.MEDIA_GALLERY.DisabledDataTypes.indexOf(panel._galleryConfigID) !== -1 ) {
                        editorDialogs.openMediaDialog(panel._onPhotosAdded, true, panel._galleryConfigID, panel._startingTab);
                        return;
                    }
                    this.resources.W.Commands.executeCommand("WEditorCommands.OpenMediaFrame", {
                        galleryConfigID: panel._galleryConfigID,
                        callback: panel._onPhotosAdded,
                        i18nPrefix: panel._mgConf.i18nPrefix,
                        publicMediaFile: panel._mgConf.publicMediaFile,
                        selectionType: panel._mgConf.selectionType,
                        mediaType: panel._mgConf.mediaType,
                        startingTab: panel._startingTab
                    });
                });
            }, 'skinless');
        },

        _createImageList: function (panel, panelCont, imageDetails) {
            panel._imageList = panelCont.addDataItemSelectionListInputFieldWithDataProvider(null, panel._data, null,
                {
                    type: 'wysiwyg.editor.components.inputs.SelectableListItem',
                    skin: 'wysiwyg.editor.skins.inputs.SelectableListItemSkin',
                    numRepeatersInLine: 1,
                    height: '400px',
                    width: '160px',
                    scrollable: true,
                    enforceSelection: true,
                    args: {
                        width: 95,
                        height: 95,
                        unit: 'px'
                    }
                },
                'imagesList') ;
            panel._imageList.runWhenReady(function (logic) {
                panel._imageList = logic;
                panel._imageList.selectItemAtIndex(0);
                panel._imageList.addEvent("updateSelection", function () {
                    panel._setListBtnsUsability();
                });
                panel._imageList.getDataProvider().addEvent(Constants.DataEvents.DATA_CHANGED, function () {
                    panel._setListBtnsUsability();
                });
            });
        },

        //        },
        _setListBtnsUsability: function () {
            var selectedIdx = this._imageList.getSelectItemIdx();
            var images = this._data.get('items');
            if (images.length === 0) {
                this._disableImageListBtns();
                return;
            }
            if (images.length === 1) {
                this._disableImageListBtns();
                this._deleteBtn.enable();
                return;
            }
            if (images.length > 1) {
                this._enableImageListBtns();

                if (selectedIdx === 0) {
                    this._moveToFirstBtn.disable();
                    this._moveUpBtn.disable();
                }
                else if (selectedIdx === (images.length - 1)) {
                    this._moveToLastBtn.disable();
                    this._moveDownBtn.disable();
                }
            }
        },

        _enableImageListBtns: function () {
            this._moveToLastBtn.enable();
            this._moveDownBtn.enable();
            this._moveUpBtn.enable();
            this._moveToFirstBtn.enable();
            this._deleteBtn.enable();
        },

        _disableImageListBtns: function () {
            this._moveToLastBtn.disable();
            this._moveDownBtn.disable();
            this._moveUpBtn.disable();
            this._moveToFirstBtn.disable();
            this._deleteBtn.disable();
        },

        _checkDataState: function () {
            if (this._skinParts) {
                if (!this._showSplashScreen) {
                    this.setState("normalContent");
                }
                else if (this._data.get("items").length === 0) {
                    this.setState("splashscreen");
                    this._skinParts.splashScreen.setState('emptyList');
                } else if (this._data.getMeta("isPreset") === true) {
                    this.setState("splashscreen");
                    this._skinParts.splashScreen.setState('presetList');
                } else {
                    this.setState("normalContent");
                }
            }

            if (this._imageDetailsListView && this._imageDetailsListView.getLogic) {
                if (this._data.get("items").length === 0) {
                    this._imageDetailsListView.getLogic().disable();
                } else {
                    this._imageDetailsListView.getLogic().enable();
                }
            }
        },

        _onDataChange: function () {
            this.parent();
            this._checkDataState();
        },


        _onPhotosAdded: function (rawImageDataArray) {
            var images = this._data.get('items');

            if (this.MEDIA_GALLERY.DisabledDataTypes.indexOf(this._galleryConfigID) === -1 ) {
                rawImageDataArray = this._validateMediaGalleryImageSchema(rawImageDataArray);
            }

            // If the data are 'preset' (default image set)
            // remove all (preset) items without adding new images
            if (this._galleryConfigID !== 'social_icons') {
                if (this._data.getMeta("isPreset") === true) {
                    images.splice(0, images.length);
                    this._data.setMeta("isPreset", false);
                }
            }
            var selectedIdx = this._imageList.getSelectItemIdx();
            for (var i = 0; i < rawImageDataArray.length; i++) {
                //Add image data record to data manager
                var dataNode = this._getDataManager().addDataItemWithUniqueId('image', rawImageDataArray[i]);
                dataNode.dataObject.setMeta('isPreset', false);
                //Add new image data to our items list
                images.splice((selectedIdx + 1 + i), 0, ('#' + dataNode.id));
            }
            if (selectedIdx === -1) {
                this._imageList.selectItemAtIndex(0);
            }
            this._data.fireDataChangeEvent();
        },

        _getSchemaNameByMediaType: function(type) {
            return this.MEDIA_GALLERY.DataTypes[type];
        },

        _validateMediaGalleryImageSchema: function(rawImageDataArray) {
            return _.map(rawImageDataArray, function(rawData) {
                return {
                    description : rawData.description || "",
                    height      : rawData.height,
                    title       : rawData.title,
                    uri         : rawData.fileName,
                    width       : rawData.width,
                    mediaType   : rawData.mediaType,
                    type        : this._getSchemaNameByMediaType(rawData.mediaType)
                };
            }, this);
        }
    });


});
