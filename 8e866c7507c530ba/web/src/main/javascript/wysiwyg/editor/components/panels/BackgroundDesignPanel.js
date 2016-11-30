define.component('wysiwyg.editor.components.panels.BackgroundDesignPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;


    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

    def.resources(['W.UndoRedoManager', 'W.Commands', 'W.Preview', 'W.Utils', 'W.Config',
                   'W.Components', 'W.BackgroundManager']);

    def.skinParts({
        scrollableArea      : { type : 'htmlElement'},
        content             : { type : 'htmlElement'},
        actions             : { type : 'htmlElement'},
        customize           : { type : 'core.components.Button', autoBindDictionary: "BACKGROUND_DESIGN_CUSTOMIZE", command : 'WEditorCommands.ShowBackgroundEditorPanel'},
        cancel              : { type : 'wysiwyg.editor.components.WButton', autoBindDictionary:'DISCARD_CHANGES'},
        beforeHelp          : { type : 'htmlElement'},
        customBGContainer   : { type : 'htmlElement'},
        copyCustomBgLabel   : { type : 'htmlElement'},
        copyCustomBgLabelTip: { type : 'htmlElement'}
    });

    def.binds(['_cancelPalletApply','_onThemeDataChanged', '_onClick',
               '_handleCustomBGStateOnPageChange', '_updatePanelState', '_openPagesBackgroundCustomizer']);

    def.states({
        background: ['site', 'custom'],
        site: ['multipage', 'singlepage']
    });

    def.statics({
        PANEL_MAX_HEIGHT: 311
    });

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._titleKey  = "BACKGROUND_DESIGN_TITLE_BGPP";
            this._descriptionKey = "BACKGROUND_DESIGN_DESCRIPTION_BGPP";
            this._panelName = "BACKGROUND_DESIGN_TITLE_BGPP";

            this._themeManagerData = this._getPreviewManagers().Theme.getDataItem();
            this._customBGHeight = 50 ;
            this._initialBackground = {} ;
        },

        _onThemeDataChanged: function() {
            this._skinParts.cancel.enable();

            //report bi event
            LOG.reportEvent(wixEvents.BACKGROUND_CHANGED);
        },


        _onAllSkinPartsReady: function() {
            this.parent();
            this._skinParts.cancel.addEvent(Constants.CoreEvents.CLICK, this._cancelPalletApply);
            this.resources.W.Utils.preventMouseDownOn(this.$view) ;
            this.resources.W.Utils.preventMouseDownOn(this._skinParts.content) ;
            this._setCustomBackgroundLabel() ;
            this._bindCustomBGCopyListener() ;
            this._updatePanelState() ;
        },

        _setCustomBackgroundLabel: function () {
            var copyCustomBgLabel           = this._skinParts.copyCustomBgLabel;
            var defaultValue                = 'Add to Other Pages';
            $(copyCustomBgLabel).innerHTML  = this._translate("BACKGROUND_EDITOR_CUSTOM_COPY_TO_OTHER_PAGES", defaultValue) ;

            this._addToolTipToSkinPart(this._skinParts.copyCustomBgLabelTip, 'BACKGROUND_PER_PAGE_COPY_TO_OTHER_PAGES_TT');
        },

        _bindCustomBGCopyListener: function() {
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._handleCustomBGStateOnPageChange) ;

            var previewManagers = this._getPreviewManagers() ;
            previewManagers.Viewer.addEvent('pageTransitionStarted', this._handleCustomBGStateOnPageChange) ;
            previewManagers.Commands.registerCommandListenerByName('WPreviewCommands.CustomBackgroundChanged', this, this._updatePanelState) ;

            this._skinParts.copyCustomBgLabel.addEvent(Constants.CoreEvents.CLICK, this._openPagesBackgroundCustomizer) ;
        },

        _openPagesBackgroundCustomizer: function() {
            if(!this._isSinglePageSite()) {
                LOG.reportEvent(wixEvents.BGPP_ADD_TO_OTHER_PAGES_LINK) ;
                var offsets = this._skinParts.copyCustomBgLabel.getBoundingClientRect() ;
                this.resources.W.Commands.executeCommand('WEditorCommands.OpenPagesBackgroundCustomizer', {relativePosition: {x: offsets.left, y: offsets.top}}) ;
            }
        },

        _handleCustomBGStateOnPageChange: function() {
            this._updateBgToRevertTo() ;
            this._updatePanelState() ;
            this._disableCancel() ;
        },

        onBeforeShow: function() {
            this._updatePanelState();
        },

        _updatePanelState: function () {
            var pageId  = this._getPreviewManagers().Viewer.getCurrentPageId() ;
            var device  = this.resources.W.Config.env.getCurrentFrameDevice() ;
            var isCustomBackground = this.resources.W.BackgroundManager.isPageCustomBGEnabled(pageId, device);
            if (isCustomBackground) {
                this.setState("custom", "background");
            } else {
                this.setState("site", "background");
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

        canGoBack : function() {
            return true;
        },

        canCancel : function() {
            return true;
        },

        _createFields: function() {
            var bgData = W.Data.getDataByQuery('#BACKGROUND_STYLES');
            var bgItems = bgData.get('items');
            var bgItem = null;

            this.setNumberOfItemsPerLine(3, 2);

            for(var i = 0; i < bgItems.length; i++){
                bgItem = bgItems[i];
                var buttonData = W.Data.createDataItem(bgItem);
                this.addBgPresetSelector(bgItem.thumbnail, i) // added index
                    .bindToDataItem(buttonData)
                    .addEvent('inputChanged', this._onClick);
            }

            this.resizeContentArea() ; // copied from BackgroundPerPage that strategy.befores this method
        },

        resizeContentArea: function(limit) {
            if(limit <= this.PANEL_MAX_HEIGHT) {
                this.parent(limit) ;
            } else {
                this.parent(this.PANEL_MAX_HEIGHT) ;
            }
        },

        _getCustomBGAreaHeight: function() {
            return this._customBGHeight ;
        },

        _onClick: function(event){
            this._onBackgroundSelection(event) ;
            LOG.reportCustomEvent(wixEvents.BACKGROUND_CHANGED, this.resources.W.Utils.getBgData('bg_presets', event.compLogic.getIndex()));
        },

        _onBackgroundSelection: function (event) {
            var currentPageId = this._getPreviewManagers().Viewer.getCurrentPageId();
            var device = this.resources.W.Config.env.getCurrentFrameDevice();
            this._setCustomBg(event, currentPageId, device);
            this._enableCancel() ;
        },

        _enableCancel: function() {
            this._skinParts.cancel.enable() ;
        },

        _setCustomBg: function (event, currentPageId, device) {
            this.resources.W.UndoRedoManager.startTransaction();
            var bgCssValue = this._createSelectedBgCssValue(event);
            if(bgCssValue) {
                this.resources.W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI(currentPageId, device, bgCssValue);
            }
            this.resources.W.UndoRedoManager.endTransaction();
        },

        _createSelectedBgCssValue: function (event) {
            var result = null ;
            if(event && event.value && event.value.siteBg && event.value.color_0) {
                var siteBg  = event.value.siteBg ;
                var bgColor = event.value.color_0 ;
                result  = siteBg.replace("[color_0]", bgColor) ;
            }
            return result ;
        },

        saveCurrentState: function() {
            this._updateBgToRevertTo();
        },

        _updateBgToRevertTo: function () {
            var bgMemento = this._createPanelMemento();
            var device = this.resources.W.Config.env.$viewingDevice;
            var isPageBgCustom = this.resources.W.BackgroundManager.isCurrentPageCustomBgEnabled(device);
            if (isPageBgCustom) {
                this._initialBackground.custom = bgMemento;
            } else {
                this._initialBackground.site = bgMemento;
            }

            this._disableCancel();
        },

        _disableCancel: function() {
            this._skinParts.cancel.disable() ;
        },

        _createPanelMemento: function() {
            var themeManager    = this._getPreviewManagers().Theme;
            var color0          = themeManager.getRawProperty('color_0');

            var bgMemento = {
                'color_0': color0
            } ;

            var deviceName = this._getDeviceName();
            var currentlyShowingBackground = this.resources.W.BackgroundManager.getCurrentlyShowingBackground();
            bgMemento[deviceName] = currentlyShowingBackground ? currentlyShowingBackground.toString() : "";
            return bgMemento ;
        },

        _cancelPalletApply:function() {
            this.resources.W.UndoRedoManager.startTransaction() ;
            var deviceName  = this._getDeviceName();
            var isCustomBgOnPage = this.resources.W.BackgroundManager.isCurrentPageCustomBgEnabled(deviceName) ;
            if(isCustomBgOnPage) {
                this._revertCustomBg();
            } else {
                this._revertCrossSiteBg();
            }
            this._disableCancel() ;
            this.resources.W.Commands.executeCommand(Constants.EditorUI.CLOSE_ALL_PANELS);
            if(isCustomBgOnPage) {
                this.resources.W.UndoRedoManager.endTransaction() ;
            }
            LOG.reportCustomEvent(wixEvents.BACKGROUND_CHANGED, this.resources.W.Utils.getBgData('bg_design_discard'));
        },

        _revertCustomBg: function() {
            var currentPageId   = this._getPreviewManagers().Viewer.getCurrentPageId() ;
            var device          = this.resources.W.Config.env.getCurrentFrameDevice() ;
            var bgCssValue      = this._initialBackground.custom[this._getDeviceName()] ;
            var sender          = this._getCommandSender() ;
            this.resources.W.BackgroundManager.setCustomBGOnDevicePageAndUpdateUI(currentPageId, device, bgCssValue, false, sender);
            LOG.reportCustomEvent(wixEvents.BACKGROUND_CHANGED, this.resources.W.Utils.getBgData('bg_customize_discard'));
        },

        _getCommandSender: function() {
            return this ;
        },

        _revertCrossSiteBg: function () {
            var themeManager = this._getPreviewManagers().Theme ;
            var initialSiteBackground = this._initialBackground.site ;
            var valuesToSet = {
                "siteBg" : initialSiteBackground[this._getDeviceName()],
                "color_0": initialSiteBackground.color_0
            };

            themeManager.getDataItem().setFields(valuesToSet, this);
        },

        _getPreviewManagers: function () {
            return this.resources.W.Preview.getPreviewManagers();
        },

        _getDeviceName: function () {
            var deviceName = Constants.ViewerTypesParams.TYPES.DESKTOP ;
            if (this._isSecondaryDevice()) {
                deviceName = Constants.ViewerTypesParams.TYPES.MOBILE ;
            }
            return deviceName;
        },

        _isSecondaryDevice: function() {
            return this.resources.W.Config.env.isViewingSecondaryDevice() ;
        }
    });
});