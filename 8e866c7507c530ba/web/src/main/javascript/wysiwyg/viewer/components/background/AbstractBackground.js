/** @type wysiwyg.viewer.components.background.AbstractBackground */
define.component("wysiwyg.viewer.components.background.AbstractBackground", function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("core.components.base.BaseComp") ;

    def.skinParts({
        bgViewPort  : {"type": "htmlElement" },
        primary     : {"type": "htmlElement" },
        secondary   : {"type": "htmlElement" }
    }) ;

    def.resources(['W.Config', 'W.Theme', 'W.Viewer', 'W.Commands', 'W.Data', 'W.Utils']) ;

    def.binds(['_handleViewerStateChanged', '_handleResize',
                '_renderBackground', '_onPageChange', '_onPageChangeEnded',
                '_onTransitionComplete', '_runTransition', '_initBgParts']) ;

    def.utilize(['core.managers.components.ComponentBuilder', 'core.utils.css.Background',
                 'core.utils.BackgroundHelper', 'wysiwyg.viewer.utils.TransitionUtils']) ;

    def.statics({
        DEFAULT_TRANSITION_DIRECTION: 0,
        VERTICAL_TRANSITION_DIRECTION: 1,
        LATEST_BGPP_VERSION: Number(Constants.Background.BGPP_LATEST_VERSION)
    }) ;

    def.states({
        'visibility': ["VISIBLE", "INVISIBLE"]
    }) ;

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args) ;
            this._areBgPartsInitialized = false ;
            this._isBgAttachmentFixed   = false;
            this._bgStyles              = {} ;
            this._lastBgStyles          = {} ;
            this._showingBgPart         = null ;
            this._hiddenBgPart          = null ;
            this._pageToChangeTo        = null ;
            this._siteHeight            = 0 ;
            this._additionalSiteHeight  = 0 ;
            this._isPageChanging        = false ;
            this._isDomDisplayReady     = false ;
            this._transitionUtils       = new this.imports.TransitionUtils();
            this._transitionNameToKey   = _.invert(Constants.TransitionTypes) ;
            this._backgroundHelper      = new this.imports.BackgroundHelper() ;
            // register listeners.
            this._registerBGListeners();
        },

        // Register a command of listening to the editor mode change, and render the site accordingly.
        _registerBGListeners: function () {
            var isEditorFrame = this._isInEditorFrame();
            if (!isEditorFrame) {
                // listen to SITE_PAGE_CHANGED event
                this.resources.W.Viewer.addEvent('pageTransitionStarted', this._onPageChange);
                this.resources.W.Viewer.addEvent('pageTransitionEnded', this._onPageChangeEnded);
                this.resources.W.Viewer.addEvent('SiteReady', this._initBgParts);
            }
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._handlePreviewModeChangeToEditor);
            this.resources.W.Theme.addEvent('propertyChange', this._renderBackground);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.ViewerStateChanged', this, this._handleViewerStateChanged);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.CustomBackgroundChanged', this, this._renderBackground);
            this._bindWindowEvents();
        },

        _bindWindowEvents: function () {
            var siteWindow ;
            if(this.resources.W.Config.env.isEditorInPreviewMode() ||
               this.resources.W.Config.env.isPublicViewer() ||
               this.resources.W.Config.env.$isEditorViewerFrame) {
                siteWindow = window ;
            } else {
                siteWindow = W.Preview.getPreviewSite() ;
            }
            siteWindow.addEvent('resize', this._handleResize) ;
            this._siteWindow = siteWindow ;
        },

        _handlePreviewModeChangeToEditor: function(newMode) {
            this._handleResize() ;
        },

        _handleResize: function() {
            var posAndSize = {} ;
            this._updateBgDefinitionPosition(posAndSize) ;
            this._updateSiteBgSize(posAndSize) ;
            this._setBGPositionAndDimension(posAndSize);
        },

        updateRenderedBGWithHeight: function(height, heightAddedForSiteStructure) {
            this._siteHeight = height ;
            this._additionalSiteHeight = heightAddedForSiteStructure ;
            if(!this._isPageChanging) {
                this._fitBackgroundHeightToSite() ;
            }
        },

        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.DATA_CHANGE
            ];

            return invalidations.isInvalidated(renderTriggers);
        },

        _onPageChange: function (pageId) {
            if(this._pageToChangeTo !== pageId) {
                this._isPageChanging = true ;
                this._fitBackgroundHeightToSite() ;
                this._renderPageBackground(pageId);
            }
        },

        _renderPageBackground: function (pageId) {
            var isFirstPageTransition = this._pageToChangeTo === null;
            this._pageToChangeTo = pageId;
            if (isFirstPageTransition || this._isBackgroundInvisible()) {
                this._renderBackground();
                this._notifyBGComponentReady() ;
            } else {
                this._renderSecondaryBg(this._pageToChangeTo);
                this._runTransition();
            }
        },

        _isBackgroundInvisible: function () {
            return this.getState('visibility') === "INVISIBLE";
        },

        _onPageChangeEnded: function(pageId) {
            if(this._pageToChangeTo === pageId) {
                this._isPageChanging = false ;
                this._fitBackgroundHeightToSite();
            }
        },

        _fitBackgroundHeightToSite: function () {
            if(this._areBgPartsInitialized) {
                var height = this._calculateHeight();
                this._bgViewPort.setStyle("height", height);
                this._showingBgPart.setStyle("height", height);
                this._hiddenBgPart.setStyle("height", height);
            }
        },

        _renderBackground: function() {
            var currentPageId = this.resources.W.Viewer.getCurrentPageId();
            this._onRenderBg(currentPageId, this._showingBgPart) ;
            this._ensureVisibilityStyles() ;
            this._resetShowingBgPartPosition() ;
            this._handleTabletBackgroundPos();
            // force paint on Windows Chrome to fix WOH-8881 (BG not painted on all of the page when scrolled).
            this.resources.W.Utils.forceBrowserRepaint(this.$view, 0, ['chrome']) ;
        },

        _arePageBGsDifferent: function() {
            var showingBgStyle = this._getNodeBgStyle(this._showingBgPart) ;
            var hiddenBgStyle = this._getNodeBgStyle(this._hiddenBgPart) ;
            return !_.isEqual(showingBgStyle, hiddenBgStyle) ;
        },

        _onTransitionComplete: function() {
            var tmp             = this._showingBgPart ;
            this._showingBgPart = this._hiddenBgPart ;
            this._hiddenBgPart  = tmp ;
            this._ensureVisibilityStyles() ;
            this._resetShowingBgPartPosition() ;
            this._afterTransition() ;
        },

        _ensureVisibilityStyles: function () {
            this._hiddenBgPart.setStyle("visibility", "hidden");
            this._hiddenBgPart.setStyle("display", "none");
            this._hiddenBgPart.setStyle("opacity", 0);

            this._showingBgPart.setStyle("visibility", "visible");
            this._showingBgPart.setStyle("display", "block");
            this._showingBgPart.setStyle("opacity", 1);
        },

        _resetBgPartsStyles: function (transition) {
            if (transition &&
                (transition.name === Constants.TransitionTypes.CROSS_FADE) ||
                (transition.name === Constants.TransitionTypes.SHRINK_FADE) ||
                (transition.name === Constants.TransitionTypes.OUT_IN)) {
                this._hiddenBgPart.setStyle("opacity", 0);
            } else {
                this._hiddenBgPart.setStyle("opacity", 1);
            }
            this._hiddenBgPart.setStyle("visibility", "visible");
            this._hiddenBgPart.setStyle("display", "block");
            this._hiddenBgPart.setStyle("left", 0);

            this._showingBgPart.setStyle("visibility", "visible");
            this._showingBgPart.setStyle("display", "block");
            this._showingBgPart.setStyle("opacity", 1);

            this._bgViewPort.setStyle("top", 0) ;
        },

        _renderSecondaryBg: function(pageId) {
            this._onRenderBg(pageId, this._hiddenBgPart) ;
        },

        _initBgParts: function() {
            this._bgViewPort    = this._skinParts.bgViewPort ;
            this._showingBgPart = this._skinParts.primary ;
            this._hiddenBgPart  = this._skinParts.secondary ;
            var width           = this._calculateWidth() ;
            var height          = this._calculateHeight() ;
            this._bgViewPort.setStyle("width", width) ;
            this._bgViewPort.setStyle("height", height) ;
            this._hiddenBgPart.setStyle("left", width) ;

            this.resources.W.Viewer.removeEvent('SiteReady', this._initBgParts);

            this._renderBackground();
            this._handleResize() ;

            this._areBgPartsInitialized = true ;
        },

        _isBgStyleChanged: function(node) {
            var bgStyle     = this._getNodeBgStyle(node) ;
            var lastBgStyle = this._getLastNodeBgStyle(node) ;
            return true || !_.isEqual(bgStyle, lastBgStyle) ;
        },

        _onRender: function(invalidations) {
            if(this._showingBgPart) {
                var currentPageId = this.resources.W.Viewer.getCurrentPageId();
                this._onRenderBg(currentPageId, this._showingBgPart) ;
            }
        },

        isDomDisplayReadyOnReady: function(){
            return this._isDomDisplayReady;
        },

        _notifyBGComponentReady: function() {
            this._isDomDisplayReady = true ;
            this.$view.fireEvent(Constants.ComponentEvents.DOM_DISPLAY_READY);
        },

        _updateSiteBgSize: function(bgStyle) {
            bgStyle.height  = this._calculateHeight() ;
            bgStyle.width   = this._calculateWidth() ;
        },

        _onRenderBg: function(pageID, node) {
            if(!node || !pageID) {
                return ;
            }
            var pageBackground = this._getPageCustomBGDataItem(pageID) ;
            if(this._isPageBackgroundCustom(pageBackground)) {
                var customBgRef     = pageBackground.ref ;
                if(customBgRef) {
                    var dataWithSchema  = this.resources.W.Data.getDataByQuery(customBgRef);
                    var bgDataItem      = dataWithSchema.getData() ;
                    this._renderCustomPageBG(bgDataItem, node) ;
                } else {
                    this._renderCrossSiteBG(node) ;
                }
            } else {
                this._renderCrossSiteBG(node) ;
            }
        },

        _isPageBackgroundCustom: function(pageBackgroundData) {
            return (pageBackgroundData && pageBackgroundData.custom && this._isBGPP(pageBackgroundData.ref));
        },

        _isBGPP: function(pageBackgroundQueryId) {
            if(!pageBackgroundQueryId) {
                return false ;
            }
            var pageBackgroundDataItem = this.resources.W.Data.getDataByQuery(pageBackgroundQueryId) ;
            return pageBackgroundDataItem &&
                Number(pageBackgroundDataItem.getMeta("schemaVersion")) === this.LATEST_BGPP_VERSION ;
        },

        _getPageDataItem: function (pageID) {
            var dataManager = this.resources.W.Data;
            var idQuery = dataManager.normalizeQueryID(pageID);
            return dataManager.getDataByQuery(idQuery);
        },

        _renderCustomPageBG: function(bgDataItem, node) {
            var bgCssValue = this._backgroundHelper.createBgCssValueFromDataItem(bgDataItem) ;
            var background = new this.imports.Background(bgCssValue, this.resources.W.Theme);
            this._updatePositionAndStyles(node, background) ;
        },

        _renderCrossSiteBG: function(node) {
            var siteBgDef = this.resources.W.Theme.getProperty(this._getBgDeviceType());
            this._updatePositionAndStyles(node, siteBgDef) ;
        },

        _updatePositionAndStyles: function(node, background) {
            this._updateBgStyleFromBgDefinition(node, background) ;
            this._updateBgDefinitionPosition(this._getNodeBgStyle(node)) ;
            this._applyBackgroundStyles(node) ;
        },

        _applyBackgroundStyles: function(node) {
            var bgStyle = this._getNodeBgStyle(node);
            this._setLastBgStyle(node, Object.clone(bgStyle)) ;
            this._setBGPositionAndDimension(bgStyle);
            delete bgStyle.left ;
            node.setStyles(bgStyle) ;
        },

        _getNodeBgStyle: function(node) {
            return this._getNodeBgFromStyles(node, this._bgStyles) ;
        },

        _getLastNodeBgStyle: function(node) {
            return this._getNodeBgFromStyles(node, this._lastBgStyles) ;
        },

        _getNodeBgFromStyles: function(node, bgStyles) {
            var bgStyle = null ;
            if(node && bgStyles) {
                var nodePart = node.getAttribute("skinPart") ;
                bgStyle = bgStyles[nodePart] ;
                if(!bgStyle) {
                    bgStyle = {} ;
                    bgStyles[nodePart] = bgStyle ;
                }
            }
            return bgStyle ;
        },

        _setLastBgStyle: function(node, bgStyle) {
            if(node && bgStyle) {
                var nodePart = node.getAttribute("skinPart") ;
                this._lastBgStyles[nodePart] = bgStyle ;
            }
        },

        _setBGPositionAndDimension: function (bgStyle) {
            var backgroundNodes = [this._showingBgPart, this._hiddenBgPart, this._bgViewPort] ;
            for(var i=0; i < backgroundNodes.length; i++) {
                var bg = backgroundNodes[i] ;
                if(bg) {
                    bg.setStyle("height", bgStyle.height) ;
                    bg.setStyle("width", bgStyle.width) ;
                }
            }
            this._hiddenBgPart && this._hiddenBgPart.setStyle("left", bgStyle.width);
            this._bgViewPort && this._bgViewPort.setStyle("left", bgStyle.left);
            this._bgViewPort && this._bgViewPort.setStyle("top", bgStyle.top);
        },

        _updateBgStyleFromBgDefinition: function(node, bgDefinition) {
            if(!bgDefinition) {
                return ;
            }
            this._updateBgAttachmentProperty(bgDefinition);
            var bgStyle                         = this._getNodeBgStyle(node) ;
            bgStyle['background-attachment']    = this._resolveBgAttachment(bgDefinition);
            if (this._isAndroidNativeBrowser()) {
                bgStyle['background']           = bgDefinition.getUrl(); // Fix for WOH-9973 Android Native Browsers full screen BGs.
            }
            bgStyle['background-image']         = bgDefinition.getUrl();
            bgStyle['background-size']          = bgDefinition.getCssSizeValue();
            bgStyle['background-position']      = bgDefinition.getPositionX() + ' ' + bgDefinition.getPositionY(); // FF convention.
            bgStyle['background-position-x']    = bgDefinition.getPositionX(); // IE, Chrome & Safari convention
            bgStyle['background-position-y']    = bgDefinition.getPositionY(); // IE, Chrome & Safari convention
            bgStyle['background-repeat']        = bgDefinition.getRepeatX() + ' ' + bgDefinition.getRepeatY();
            bgStyle['background-color']         = this._resolveBackgroundThemeColor(bgDefinition);
            // image sizes
            this._updateSiteBgSize(this._getNodeBgStyle(this._showingBgPart)) ;
            this._updateSiteBgSize(this._getNodeBgStyle(this._hiddenBgPart)) ;
        },

        _isAndroidNativeBrowser: function() {
            return this.resources.W.Config.mobileConfig.isAndroidMobileDevice();
        },

        _resolveBgAttachment: function (bgDefinition) {
            var attachmentValue = "" ;
            if(this._isMobile() || this._isAndroidNativeBrowser()) {
                attachmentValue = 'scroll' ;
            } else if(this._isTablet()){
                attachmentValue = '' ;
            } else {
                attachmentValue = bgDefinition.getAttachment() ;
            }
            return attachmentValue ;
        },

        _isTablet: function() {
            return this.resources.W.Config.mobileConfig.isTablet() ;
        },

        _resolveBackgroundThemeColor: function (bgDefinition) {
            var bgColor;
            if (bgDefinition.getColorReference()) {
                bgColor = this.resources.W.Theme.getProperty(bgDefinition.getColorReference());
                bgColor = bgColor.getHex();
            } else {
                bgColor = bgDefinition.getColor();
            }
            return bgColor ;
        },

        _updateBgAttachmentProperty: function (bgDefinition) {
            var isBgAttachmentFixed = this._isBackgroundFixed(bgDefinition);
            if (this._isBgAttachmentFixed !== isBgAttachmentFixed) {
                this._isBgAttachmentFixed = isBgAttachmentFixed;
            }
        },

        _getPageCustomBGDataItem: function(pageId) {
            var pageBg = null ;
            if(pageId) {
                var pageDataItem = this._getPageDataItem(pageId);
                var pageBackgrounds = pageDataItem.get("pageBackgrounds") ;
                pageBg = this._getCustomBackground(pageBackgrounds) ;
            }
            return pageBg ;
        },

        _isInEditorFrame: function () {
            return this.resources.W.Config.env.$isEditorFrame;
        },

        _isMobileView: function() {
            return this.resources.W.Config.env.isViewingSecondaryDevice() ;
        },

        _isDesktopView: function() {
            return this.resources.W.Config.env.isViewingDesktopDevice() ;
        },

        _isBackgroundFixed: function(siteBgDefinition) {
            return (!this._isMobile() && siteBgDefinition && siteBgDefinition.getAttachment() !== 'scroll') ;
        },

        _resetShowingBgPartPosition: function() {
            this._showingBgPart.setStyle("top",  "0") ;
            this._showingBgPart.setStyle("left",  "0") ;
        },

        _afterTransition: function() {
            this._handleTabletBackgroundPos();
        },

        _handleTabletBackgroundPos: function () {
            if (this._isBgAttachmentFixed && !this._isMobile()) {
                this._bgViewPort.setStyle("position", "fixed");
            } else {
                this._bgViewPort.setStyle("position", "absolute");
            }
        },

        _isMobile: function () {
            // Abstract method to override.
        },

        _beforeTransition: function() {
            // Abstract method to override.
        },

        _runTransition: function () {
            // Abstract method to override.
        },

        _handleViewerStateChanged: function() {
            // Abstract method to override.
        },

        _updateBgDefinitionPosition: function (bgStyle) {
            // Abstract method to override.
        },

        _calculateWidth: function () {
            // Abstract method to override
        },

        _calculateHeight: function() {
            // Abstract method to override
        },

        _getCustomBackground: function(customBackgrounds) {
            // Abstract method to override.
        }
    });
});