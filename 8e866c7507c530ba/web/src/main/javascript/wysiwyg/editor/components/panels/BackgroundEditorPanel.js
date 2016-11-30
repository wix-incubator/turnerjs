define.component('wysiwyg.editor.components.panels.BackgroundEditorPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

    def.utilize(['core.utils.css.Background']);

    def.traits(['core.editor.components.traits.DataPanel']);

    def.skinParts({
        scrollableArea: { type: 'htmlElement' },
        content: { type: 'htmlElement'},
        cancel: {type: 'wysiwyg.editor.components.WButton', autoBindDictionary: 'DISCARD_CHANGES'},
        copyCustomBgLabel   :   { type : 'htmlElement'},
        copyCustomBgLabelTip:   { type : 'htmlElement'}
    });

    def.binds(['_onPageChange',
        '_colorChangedHandler',
        '_imageChangeHandler',
        '_getBgCssPropertiesToPanel', '_tilingChangeHandler',
        '_changeAlignForCrossSiteBG', '_alignmentChangeHandler',
        '_attachmentChangeHandler',
        '_onThemeDataChanged', '_discardPanelChanges', '_enableCancel',
        '_openPagesBackgroundCustomizer', '_disableCancel']);

    def.resources(['W.UndoRedoManager', 'W.Commands', 'W.Preview', 'W.Config','W.Editor', 'W.Resources', 'W.BackgroundManager', 'W.Data']);

    def.dataTypes(['TransientCustomBG']);

    def.statics({
        TILE_IMAGE_WIDTH: 600,
        TILE_IMAGE_HEIGHT: 600,
        TEMP_BG_DATAITEM_ID: "TRANSIENT_CUSTOM_BG",
        TEMP_BG_DATA_TYPE: "TransientCustomBG",
        PANEL_MAX_HEIGHT: 372
    });

    def.fields({
        MOBILE_BG : 'mobileBg',
        DESKTOP_BG : 'siteBg'
    });

    def.states({
        structureState:['desktop', 'mobile'],
        site: ['multipage', 'singlepage']
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._themeManager      = this._getPreviewThemeManager() ;
            this._themeManagerData  = this._themeManager.getDataItem();

            this._initPanelLabels();
            this._initPanelState();
            this._setBgPropertyName();

            this._updatePanelDataItem() ;

            this._getPreviewManagers().Viewer.addEvent('pageTransitionStarted', this._disableCancel);
            this._getPreviewManagers().Viewer.addEvent('pageTransitionEnded', this._onPageChange);
            this._getPreviewManagers().Commands.registerCommandAndListener('WPreviewCommands.CustomBackgroundChanged', this, this._onBgUndoRedoChange) ;
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.SetCustomBackground', this, this._updatePanelDataItem);
            this._themeManagerData.addEvent(Constants.DataEvents.DATA_CHANGED, this._onThemeDataChanged);
        },

        _initPanelLabels: function () {
            if (this._isSecondaryDevice()) {
                this._titleKey = "MOBILE_BACKGROUND_EDITOR_TITLE";
                this._descriptionKey = "MOBILE_BACKGROUND_EDITOR_DESCRIPTION_BGPP";
                this._panelName = "MOBILE_BACKGROUND_EDITOR_TITLE";
            } else {
                this._titleKey = "BACKGROUND_EDITOR_TITLE";
                this._descriptionKey = "BACKGROUND_EDITOR_DESCRIPTION_BGPP";
                this._panelName = "BACKGROUND_EDITOR_TITLE";
            }
        },

        _initPanelState: function() {
            if (this._isSecondaryDevice()) {
                this.setState('mobile', 'structureState');
            } else {
                this.setState('desktop', 'structureState');
            }

            if(this._isSinglePageSite()) {
                this.setState('singlepage', 'site') ;
            } else {
                this.setState('multipage', 'site') ;
            }
        },

        _isSinglePageSite: function() {
            var previewManagers = this._getPreviewManagers() ;
            return _.toArray(previewManagers.Viewer.getPagesData()).length <= 1 ;
        },

        _isSecondaryDevice: function() {
            return this.resources.W.Config.env.isViewingSecondaryDevice() ;
        },

        _updatePanelDataItem: function() {
            var dataItem = this.resources.W.Data.getDataByQuery("#" + this.TEMP_BG_DATAITEM_ID) ;
            if(!dataItem) {
                this.resources.W.Data.addDataItem(this.TEMP_BG_DATAITEM_ID, {"type": this.TEMP_BG_DATA_TYPE});
                dataItem = this.resources.W.Data.getDataByQuery("#" + this.TEMP_BG_DATAITEM_ID) ;
                this.setDataItem(dataItem) ;
            }
            dataItem.set("bg", this._getBgCssPropertiesToPanel()) ;
        },

        _onThemeDataChanged: function(themeDataItem, data) {
            var device = this.resources.W.Config.env.$viewingDevice ;
            if(!this._isCustomBgOnPage(device)) {
                this._enableCancel() ;
                if(data) {
                    if(data.siteBg) {
                        this.getDataItem().set("bg", data.siteBg) ;
                    } else {
                        if(data.mobileBg) {
                            this.getDataItem().set("bg", data.mobileBg) ;
                        }
                    }
                }
            }
        },

        _onThemePropertyChange: function (event) {
            if ((event && event.type == 'propertyChange' && event.name != this.MOBILE_BG) || (this._bgPropName !== this.MOBILE_BG)) {
                return;
            }
            this._fixMobileBgData();
        },

        _onAllSkinPartsReady: function () {
            this.parent() ;
            this._disableCancel();
            this._addCancelAction();
            this._setCustomBackgroundLabel() ;
            this._bindCustomBGCopyListener() ;
        },

        _addCancelAction: function () {
            this._skinParts.cancel.addEvent(Constants.CoreEvents.CLICK, this._discardPanelChanges);
        },

        _discardPanelChanges: function() {
            this._cancelPalletApply() ;
        },

        _bindCustomBGCopyListener: function() {
            this._skinParts.copyCustomBgLabel.addEvent(Constants.CoreEvents.CLICK, this._openPagesBackgroundCustomizer) ;
            this._addToolTipToSkinPart(this._skinParts.copyCustomBgLabelTip, 'BACKGROUND_PER_PAGE_COPY_TO_OTHER_PAGES_TT');
        },

        _openPagesBackgroundCustomizer: function() {
            if(!this._isSinglePageSite()) {
                LOG.reportEvent(wixEvents.BGPP_ADD_TO_OTHER_PAGES_LINK) ;
                var offsets = this._skinParts.copyCustomBgLabel.getBoundingClientRect() ;
                this.resources.W.Commands.executeCommand('WEditorCommands.OpenPagesBackgroundCustomizer', {relativePosition: {x: offsets.left, y: offsets.top}}) ;
            }
        },

        _setCustomBackgroundLabel: function () {
            var copyCustomBgLabel           = this._skinParts.copyCustomBgLabel;
            var defaultValue                = 'Add to Other Pages';
            $(copyCustomBgLabel).innerHTML  = this._translate("BACKGROUND_EDITOR_CUSTOM_COPY_TO_OTHER_PAGES", defaultValue) ;
        },

        _fixMobileBgData: function () {
            if (this._themeManager.getRawProperty(this._bgPropName).indexOf('[') != -1) {
                return;
            }
            var mobileBg = this._themeManager.getProperty(this._bgPropName);
            var bgFixed = false;
            if (mobileBg.getAttachment() === 'fixed') {
                bgFixed = true;
                mobileBg.setAttachment('scroll');
            }
            if (bgFixed) {
                this._themeManager.setProperty(this._bgPropName, mobileBg.getThemeString());
            }
        },

        _createFields: function () {
            this._addBackgroundImagePicker() ;
            this._addBGRepeatAndAlignPicker() ;
            this._addScrollWithPagePicker() ;
            this._addBackgroundColorPicker() ;
        },

        _addBackgroundImagePicker: function () {
            var panel = this ;
            this.addInputGroupField(function () {
                var imgFieldProxy = this.addBgImageField();
                imgFieldProxy.bindToDataItemField(panel.getDataItem(), "bg") ;
                imgFieldProxy.bindHooks(panel._onChange(panel._imageChangeHandler), panel._getBgCssPropertiesToPanel);
            });
        },

        _imageChangeHandler: function (bgString) {
            var bg = new this.imports.Background(bgString, this._themeManager);
            var bgCssString = this._handleBgWidthAndRepeat(bg);
            this._setBgProps(bgCssString, this._changeImageForCrossSiteBG) ;
        },

        _changeImageForCrossSiteBG: function (bg, bgThemeProperty) {
            var crossSiteBg = this._themeManager.getProperty(bgThemeProperty);
            var bgImage     = bg.getImageId() ;
            if(bgImage) {
                crossSiteBg.setImage(bgImage);
            }
            this._setCrossBgToThemeManager(bgThemeProperty, crossSiteBg);
        },

        _handleBgWidthAndRepeat: function (background) {
            if (background.getImageSize()[0] < this.TILE_IMAGE_WIDTH && background.getImageSize()[1] < this.TILE_IMAGE_HEIGHT) {
                background.setWidth('auto') ;
                background.setRepeat('repeat') ;
            } else {
                background.setRepeat('no-repeat') ;
                background.setWidth('cover') ;
            }
            return background.toString();
        },

        _addBGRepeatAndAlignPicker: function () {
            var panel = this ;
            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(2);
                var repeatLabel = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_LABEL_REPEAT');
                var toolTipId = 'Customize_Background_Image_Scaling_ttid';
                this.addBgTileField(repeatLabel, toolTipId).bindToField("bg").bindHooks(panel._onChange(panel._tilingChangeHandler),
                    panel._getBgCssPropertiesToPanel);

                var alignLabel = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_LABEL_ALIGN');
                this.addBgAlignField(alignLabel).bindToField("bg").bindHooks(panel._onChange(panel._alignmentChangeHandler),
                    panel._getBgCssPropertiesToPanel);
            });
        },

        _tilingChangeHandler: function(bgString) {
            this._setBgProps(bgString, this._changeRepeatForCrossSiteBG) ;
        },

        _changeRepeatForCrossSiteBG: function (bg, bgThemeProperty) {
            var x       = bg.getPositionX() ;
            var y       = bg.getPositionY() ;
            var width   = bg.getWidth() ;
            var repeatX = bg.getRepeatX() ;
            var repeatY = bg.getRepeatY() ;

            var crossSiteBg = this.resources.W.BackgroundManager.getCurrentlyShowingBackground() ;
            crossSiteBg.setPosition(x, y);
            crossSiteBg.setWidth(width);
            crossSiteBg.setRepeat(repeatX, repeatY);
            // update the transient data item
            this._setCrossBgToThemeManager(bgThemeProperty, crossSiteBg);
        },

        _alignmentChangeHandler: function(bgString) {
            this._setBgProps(bgString, this._changeAlignForCrossSiteBG) ;
        },

        _changeAlignForCrossSiteBG: function (bg, bgThemeProperty) {
            var x       = bg.getPositionX() ;
            var y       = bg.getPositionY() ;

            var crossSiteBg = this.resources.W.BackgroundManager.getCurrentlyShowingBackground() ;
            crossSiteBg.setPosition(x, y);
            // update the transient data item
            this._setCrossBgToThemeManager(bgThemeProperty, crossSiteBg);
        },

        _addScrollWithPagePicker: function () {
            var panel = this ;
            if (panel.getState('structureState') !== 'mobile') {
                this.addInputGroupField(function () {
                    var scrollBgLabel = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_LABEL_SCROLL');
                    var toolTipId = 'Customize_Background_Scroll_ttid';
                    this.addBgScrollField(scrollBgLabel, toolTipId).bindToField("bg").bindHooks(panel._onChange(panel._attachmentChangeHandler),
                        panel._getBgCssPropertiesToPanel);
                });
            }
        },

        _attachmentChangeHandler: function(bgString) {
            this._setBgProps(bgString, this._changeAttachmentForCrossSiteBG) ;
        },

        _changeAttachmentForCrossSiteBG: function (bg, bgThemeProperty) {
            var attachment = bg.getAttachment() ;

            var crossSiteBg = this.resources.W.BackgroundManager.getCurrentlyShowingBackground() ;
            crossSiteBg.setAttachment(attachment);
            // update the transient data item
            this._setCrossBgToThemeManager(bgThemeProperty, crossSiteBg);
        },

        _addBackgroundColorPicker: function () {
            var panel = this ;
            this.addInputGroupField(function () {
                var bgColorLabel = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_BUTTON_COLOR');
                this.addBgColorField(bgColorLabel).bindToField("bg").bindHooks(panel._onChange(panel._colorChangedHandler),
                    panel._getBgCssPropertiesToPanel);
            });
        },

        _colorChangedHandler: function(bgString) {
            this._setBgProps(bgString, this._changeColorForCrossSiteBG) ;
        },

        _setBgProps: function(bgString, crossSiteBGPropertyHandler) {
            var device  = this._getViewingDevice() ;

            if(this._isCustomBgOnPage(device)) {
                this._setCustomBgProps(bgString, device) ;
            } else {
                var bg = new this.imports.Background(bgString, this._themeManager);
                if(device.toUpperCase() === Constants.ViewerTypesParams.TYPES.DESKTOP) {
                    this.resources.W.UndoRedoManager.startTransaction();
                    crossSiteBGPropertyHandler.apply(this, [bg, this.DESKTOP_BG]) ;
                } else if(device.toUpperCase() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                    this.resources.W.UndoRedoManager.startTransaction();
                    crossSiteBGPropertyHandler.apply(this, [bg, this.MOBILE_BG]) ;
                }

                this._getPreviewManagers().Commands.executeCommand('WPreviewCommands.CustomBackgroundChanged') ;
            }
        },

        _setCustomBgProps: function (bgString, device) {
            var pageId = this._getPreviewManagers().Viewer.getCurrentPageId() ;
            var oldCustomBgValue = this.resources.W.BackgroundManager.getCurrentlyShowingBackground() ;
            if(bgString === oldCustomBgValue) {
                return ;
            }

            this.resources.W.UndoRedoManager.startTransaction();
            var sender = this._getCommandSender();

            this._setDeviceBackgroundToNonPreset(pageId, device);
            this.resources.W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI(pageId, device, bgString, false, sender);

            this.resources.W.UndoRedoManager.endTransaction();
        },

        _setDeviceBackgroundToNonPreset: function (pageId, device) {
            if(pageId && device) {
                var previewDataManager = this._getPreviewManagers().Data;
                pageId = previewDataManager.normalizeQueryID(pageId) ;
                device = device.toLowerCase() ;
                var pageDataItem = previewDataManager.getDataByQuery(pageId) ;
                var pageBackgrounds = pageDataItem.get("pageBackgrounds");
                if (pageBackgrounds && pageBackgrounds[device]) {
                    pageBackgrounds[device].isPreset = false;
                    pageDataItem.set("pageBackgrounds", pageBackgrounds);
                }
            }
        },

        _getCommandSender: function() {
            return this ;
        },

        _getViewingDevice: function () {
            return this.resources.W.Config.env.$viewingDevice;
        },

        _changeColorForCrossSiteBG: function (bg, bgThemeProperty) {
            var crossSiteBg = this._themeManager.getProperty(bgThemeProperty);
            var bgColorRef = bg.getColorReference() ;
            if(bgColorRef) {
                crossSiteBg.setColorReference(bgColorRef);
            } else {
                crossSiteBg.setColor(bg.getColorThemeValue());
            }
            this._setCrossBgToThemeManager(bgThemeProperty, crossSiteBg);
        },

        _setCrossBgToThemeManager: function (bgThemeProperty, crossSiteBg) {
            var param = {};
            param[bgThemeProperty] = crossSiteBg.getThemeString();
            this._themeManager.getDataItem().setFields(param, this);
        },

        _onChange: function(funcToCall) {
            return function(bgString) {
                this._enableCancel() ;
                return funcToCall(bgString) ;
            }.bind(this) ;
        },

        canGoBack: function () {
            return true;
        },
        canCancel: function () {
            return true;
        },

        saveCurrentState: function() {
            var bgMemento = this._createPanelMemento();
            this._initialBackground = bgMemento ;
        },

        _createPanelMemento: function () {
            var color0 = this._getPreviewThemeManager().getRawProperty('color_0');
            var device = this.resources.W.Config.env.$viewingDevice;
            var isPageBgCustom = this._isCustomBgOnPage(device);

            var bgMemento = {
                'color_0': color0,
                'isCustom': isPageBgCustom
            };

            var deviceName = this._getDeviceName();
            bgMemento[deviceName] = this._getBgCssPropertiesToPanel();
            return bgMemento;
        },

        _isCustomBgOnPage: function(frameDevice) {
            return this.resources.W.BackgroundManager.isCurrentPageCustomBgEnabled(frameDevice) ;
        },

        _getBgCssPropertiesToPanel: function() {
            var result = this.resources.W.BackgroundManager.getCurrentlyShowingBackground();
            if(!result) {
                result = "" ;
            }
            return result.toString() ;
        },

        _getDeviceName: function () {
            var deviceName = Constants.ViewerTypesParams.TYPES.DESKTOP;
            if (this._isSecondaryDevice()) {
                deviceName = Constants.ViewerTypesParams.TYPES.MOBILE;
            }
            return deviceName;
        },

        _setBgPropertyName: function () {
            if (this._bgPropName) {
                return;
            }
            if (this.getState('structureState') === 'mobile') {
                this._bgPropName = this.MOBILE_BG;
            } else {
                this._bgPropName = this.DESKTOP_BG;
            }
        },

        _onBgUndoRedoChange: function(cmdParam) {
            if(cmdParam && cmdParam.isFromUndoRedo === true) {
                this._updatePanelDataItem() ;
            }
        },

        _onPageChange: function() {
            this._updatePanelDataItem() ;
            this.saveCurrentState() ;
        },

        _getPreviewThemeManager: function () {
            return this._getPreviewManagers().Theme ;
        },

        _cancelPalletApply: function() {
            this.resources.W.UndoRedoManager.startTransaction() ;
            var deviceName  = this._getDeviceName();
            if(this._initialBackground.isCustom) {
                this._revertCustomBg(deviceName);
            } else {
                this._revertCrossSiteBg(deviceName);
            }
            this._updatePanelDataItem() ;
            this._disableCancel() ;
            if(this._initialBackground.isCustom) {
                this.resources.W.UndoRedoManager.endTransaction() ;
            }
        },

        _revertCustomBg: function (deviceName) {
            var currentPageId       = this._getPreviewManagers().Viewer.getCurrentPageId() ;
            var bgCssValue          = this._initialBackground[deviceName] ;
            var backgroundManager   = this.resources.W.BackgroundManager ;
            var sender              = this._getCommandSender() ;
            backgroundManager.setCustomBGOnDevicePageAndUpdateUI(currentPageId, deviceName, bgCssValue, false, sender) ;
            LOG.reportCustomEvent(wixEvents.BACKGROUND_CHANGED, this.resources.W.Utils.getBgData('bg_customize_discard'));
        },

        _revertCrossSiteBg: function (deviceName) {
            var themeManager = this._getPreviewManagers().Theme ;
            var valueMap = {} ;
            valueMap.color_0 = this._initialBackground.color_0 ;
            valueMap[this._bgPropName] = this._initialBackground[deviceName] ;
            themeManager.getDataItem().setFields(valueMap, this) ;
        },

        _getPreviewManagers: function () {
            return this.resources.W.Preview.getPreviewManagers();
        },

        dispose: function () {
            this._themeManagerData.removeEvent(Constants.DataEvents.DATA_CHANGED, this._onThemeDataChanged);
            this.parent();
        },

        _enableCancel: function() {
            this._skinParts.cancel.enable() ;
        },

        _disableCancel: function () {
            this._skinParts.cancel.disable();
        },

        resizeContentArea: function(limit) {
            if(limit <= this.PANEL_MAX_HEIGHT) {
                this.parent(limit) ;
            } else {
                this.parent(this.PANEL_MAX_HEIGHT) ;
            }
        }
    });
});