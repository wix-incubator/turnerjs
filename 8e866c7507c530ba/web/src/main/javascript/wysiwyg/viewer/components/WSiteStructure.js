/**
 * @class wysiwyg.viewer.components.WSiteStructure
 */
define.component('wysiwyg.viewer.components.WSiteStructure', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("core.components.ContainerOBC");

    def.binds(['_onThemePropertyChange', '_updateSiteBgPosition', '_updateSiteBgSize', '_delayedInvalidateBg', '_setBgAsImageViewMode']);

    def.resources(['W.Utils', 'W.Viewer', 'W.Theme', 'W.Components', 'W.Data', 'W.Config', 'W.Commands']);

    def.utilize(['core.utils.css.Background']);

    def.statics({
        MAX_SITE_HEIGHT: 100000
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._structureState = this.resources.W.Config.env.$viewingDevice;
            this._mobileConfig = this.resources.W.Config.mobileConfig;

            this._bgStyles = {};

            this._handleMobileAndTablet();
            this._handlePreviewAttribute();

            this.setMaxH(this.MAX_SITE_HEIGHT); //Page Component height + Footer height + Header height + some change.

            this._updateBottomPadding(this.resources.W.Config.env.$editorMode);
            if (this.resources.W.Config.env.$isEditorViewerFrame && this._structureState === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._updateBottomPadding);
            }
        },

        _updateBottomPadding: function(currentMode) {
            var padding = this._getBottomPadding(currentMode);
            this._view.setStyle('padding-bottom', padding);
        },

        _getBottomPadding: function(currentMode) {
            if (this.resources.W.Config.env.$isPublicViewerFrame) {
                return 0;
            }

            if (this._structureState === Constants.ViewerTypesParams.TYPES.DESKTOP) {
                return 100;
            }
            else if (this.resources.W.Config.env.$isEditorViewerFrame &&
                this._structureState === Constants.ViewerTypesParams.TYPES.MOBILE) {
                if (currentMode === "PREVIEW") {
                    return 0;
                }
                else {
                    return 100;
                }
            }
        },

        /**
         * Adds an attribute preview=public to body when in public mode,
         * we need it only for animations, preview=view is what we have in editor, but mobile assumes
         * preview=view is editor mode, so we needed a new value and 'public' is that value.
         * @private
         */
        _handlePreviewAttribute: function() {
            if (this.resources.W.Config.env.$isPublicViewerFrame ||
                this.resources.W.Config.env.isInEditorlessPreview()) {
                document.body.setAttribute('preview', 'public');
            }
            //will cause scroll bar bug if editorless preview is opened from mobile
        },

        _handleMobileAndTablet: function() {
            if (this._mobileConfig.isMobileOrTablet()) {
                window.addEvent('orientationchange', this._delayedInvalidateBg);

                document.body.setAttribute('device', 'mobile');

                if (this._mobileConfig.isAndroidMobileDevice()) {
                    //this is a HACK to solve the android bug that text inflation cant be disabled by -webkit-text-size-adjust
                    this._view.setStyle('max-height', '10000000000px');
                }

                this._view.setStyle('-webkit-text-size-adjust', 'none');
                this._view.setStyle('-moz-text-size-adjust', 'none');
                this._view.setStyle('-ms-text-size-adjust', 'none');
            }
            else if (this.resources.W.Config.env.$isPublicViewerFrame || this.resources.W.Config.env.isInEditorlessPreview()) {
                document.body.setAttribute('device', 'desktop');
            }
        },

        _onAllSkinPartsReady: function() {
            var width = this.resources.W.Viewer.getDocWidth() ;
            this.setWidth(width);
            this._initBackgroundNode();
        },

        _initBackgroundNode: function () {
            this._bgNodes = $("bgNodes");
            if (!this._bgNodes) {
                this._createBgNodesHook();
            }
            if(!this._isIE8()) {
                if (!this._bgNode) {
                    this._createBackground();
                }
            } else {
                this._renderBgForIE8();
            }
        },

        _createBgNodesHook: function() {
            this._bgNodes = new Element('div', {'id': "bgNodes", 'style': "position:relative; margin: 0 auto;"}) ;
            document.body.insertBefore(this._bgNodes, document.body.firstChild);
        },

        _createBackground: function() {
            if (this._structureState === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this._createMobileBackgroundNode() ;
            } else {
                this._createDesktopBackgroundNode() ;
            }
        },

        _createMobileBackgroundNode: function () {
            // Create a background holder node and inject it into the body
            var bgNodeAttributes = {
                'id': 'mobileBgNode',
                'comp': 'wysiwyg.viewer.components.background.MobileBackground',
                'skin': 'wysiwyg.viewer.skins.background.BackgroundSkin'
            } ;
            this._bgNode = this._createBgNode(bgNodeAttributes);
        },

        _createDesktopBackgroundNode: function () {
            var bgNodeAttributes = {
                'id': 'desktopBgNode',
                'comp': 'wysiwyg.viewer.components.background.DesktopBackground',
                'skin': 'wysiwyg.viewer.skins.background.BackgroundSkin'
            } ;
            this._bgNode = this._createBgNode(bgNodeAttributes);
        },

        _createBgNode: function (bgNodeAttributes) {
            var bgNode = this._getBgNodeByCompId(bgNodeAttributes.id) ;
            if(!bgNode) {
                bgNode = new Element('div', bgNodeAttributes);
                var bgNodeWidth = this.resources.W.Config.mobileConfig.isMobile() ? this.resources.W.Viewer.getDocWidth() + "px" : "100%";
                bgNode.setStyles({'position': 'relative', 'width': bgNodeWidth, 'margin': '0 auto'});
                // wixify the BG node!
                bgNode.wixify() ;
                this._bgNodes.appendChild(bgNode);
            }
            return bgNode ;
        },

        _getBgNodeByCompId: function (componentId) {
            return this._bgNodes.querySelector("#" + componentId) ;
        },

        _renderBgForIE8: function () {
            this._bgNodes.setStyle("position", "absolute") ;
            this._bgNodes.setStyle("width", "100%") ;
            var themeBgProperty = 'siteBg';
            if (this._structureState === Constants.ViewerTypesParams.TYPES.MOBILE) {
                themeBgProperty = 'mobileBg';
            }
            if (this.resources.W.Theme._data) {
                this._updateBgFromTheme(themeBgProperty);
            } else {
                this.resources.W.Theme.addEvent("dataReady", function () {
                    this._updateBgFromTheme(themeBgProperty);
                }.bind(this));
            }
        },

        _updateBgFromTheme: function(themeBgProperty) {
            var backgroundData = this.resources.W.Theme.getProperty(themeBgProperty);
            var background = new this.imports.Background(backgroundData, this.resources.W.Theme);

            this._bgNodes.setStyle('background-color', background.getColor(false)) ;
            this._bgNodes.setStyle('background-image', background.getUrl()) ;
            this._bgNodes.setStyle('background-attachment', background.getAttachment()) ;
            var repeatXValue = background.getRepeatX() ;
            var repeatYValue = background.getRepeatY() ;
            var repeatValue = 'no-repeat' ;
            if(repeatXValue === 'repeat' && repeatYValue === 'repeat') {
                repeatValue = 'repeat' ;
            } else if(repeatXValue === 'no-repeat' && repeatYValue === 'repeat') {
                repeatValue = 'repeat-y' ;
            } else if(repeatXValue === 'repeat' && repeatYValue === 'no-repeat') {
                repeatValue = 'repeat-x' ;
            }
            this._bgNodes.setStyle('background-repeat', repeatValue) ;
            this._bgNodes.setStyle('background-size', background.getWidth(false)) ;
            this._bgNodes.setStyle('background-position', background.getPosition(false)) ;
        },

        setMinHeightFromMenu: function(height) {
            if (W.Layout.getComponentMinResizeHeight(this) < height) {
                this.setHeight(height);
                this.resources.W.Viewer.siteHeightChanged(true);
            }
        },

        resetMinHeightFromMenu: function() {
            this.setHeight(W.Layout.getComponentMinResizeHeight(this));
            this.resources.W.Viewer.siteHeightChanged(true);

        },

        getSiteStructureHeightWithMenu: function() {
            return Math.max(W.Layout.getComponentMinResizeHeight(this), this._$height);
        },

        render: function() {
            var width = this.resources.W.Viewer.getDocWidth();
            this.setWidth(width);
            this.parent();
        },

        dispose: function() {
            this.parent();
            if (this.resources.W.Config.env.$isEditorViewerFrame && this._structureState === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this.resources.W.Commands.unregisterListener(this._updateBottomPadding);
            }
        },

        _getReformattedBgColor: function() {
            return this.parent();
        },

        _onThemePropertyChange: function() {
            if(!this._isIE8()) {
                this._bgNode.$logic._handleViewerStateChanged() ;
            }
        },

        _updateSiteBgSize: function() {
            if (this._mobileConfig.isMobileOrTablet()) {
                if (this._bgFixed) {
                    this._bgStyles.height = window.innerHeight;
                }
                else {
                    this._bgStyles.height = Math.max(this._siteHeight, document.getHeight()) + 'px';
                }
            }
            else {
                if (this._bgFixed) {
                    this._bgStyles.height = $(document.body).getSize().y + 'px';
                }
                else {
                    this._bgStyles.height = Math.max((this._siteHeight || 50), $(document.body).getSize().y) + 'px';
                }
            }

        },

        _updateSiteBgPosition: function() {
            if (this._mobileConfig.isMobileOrTablet()) {
                this._handleMobileBgPosition();
                return;
            }
            if (Modernizr.positionfixed) {
                this._bgStyles.position = (this._bgFixed) ? 'fixed' : 'absolute';
            }
            else {
                this._bgStyles.top = (this._bgFixed) ? document.body.scrollTop + 'px' : 0;
            }
        },

        _handleMobileBgPosition: function() {
            if (this._structureState === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this._bgStyles.position = 'absolute';
            }
            else {
                this._bgStyles.top = (this._bgFixed) ? document.body.scrollTop + 'px' : 0;
            }
        },

        /**
         * Delayed invalidate action to prevent background flickers on resize
         */
        _delayedInvalidateBg: function() {
            if (this._delayedInvalidateBgTimeout) {
                clearTimeout(this._delayedInvalidateBgTimeout);
            }
            this._delayedInvalidateBgTimeout = this.resources.W.Utils.callLater(this._invalidateBg, null, this, 150);
        },

        _adjustBackgroundSizeToPadding: function() {
            if (!this._bgNode || this.resources.W.Config.env.$isPublicViewerFrame || !this._view) {
                return;
            }

            var initialHeight = parseInt(this._bgStyles.height);
            var paddingHeight = parseInt(this._view.getStyle('padding-bottom'));
            if (!initialHeight) {
                return;
            }

            if (this._structureState === Constants.ViewerTypesParams.TYPES.DESKTOP) {
                this._bgNode.setStyle("height", (initialHeight + paddingHeight) + "px");
            }
            else if (this.resources.W.Config.env.$isEditorViewerFrame &&
                this._structureState === Constants.ViewerTypesParams.TYPES.MOBILE) {
                if (!W.Config.env.$isEditorViewerFrame) {
                    this._bgNode.setStyle("height", (initialHeight + paddingHeight) + "px");
                }
            }
        },

        /**
         * Polyfill browser(s) that does not support background-size
         */
        _setBgAsImage: function() {
            if (!this._bgAsImage) {
                //create a new image data item
                this._bgAsImageDataItem = this.resources.W.Data.createDataItem({
                    type: 'Image',
                    uri: this._siteBgDef.getImageId(),
                    width: this._siteBgDef.getImageSize()[0],
                    height: this._siteBgDef.getImageSize()[1],
                    borderSize: 0,
                    title: '',
                    description: '',
                    alt: ''
                });
                //create an empty image component
                this._bgAsImage = this.resources.W.Components.createComponent(
                    'core.components.Image',
                    'mobile.core.skins.ImageSkin',
                    this._bgAsImageDataItem,
                    {width: '100', height: '100', unit: '%'},
                    null,
                    this._setBgAsImageViewMode
                );
                this._bgAsImage.insertInto(this._bgNode);
            }
            else {
                this._setBgAsImageDataItemValues(this._siteBgDef.getImageId(), this._siteBgDef.getImageSize());
                this._setBgAsImageViewMode(this._bgAsImage.getLogic());
            }

        },
        /**
         * Set new image to exsiting data item
         * @param uri
         * @param size
         */
        _setBgAsImageDataItemValues: function(uri, size) {
            if (this._bgAsImageDataItem) {
                this._bgAsImageDataItem.setFields({uri: uri, width: size[0], height: size[1]});
            }
        },
        /**
         * set image crop mode and visibility
         * @param imageComp
         */
        _setBgAsImageViewMode: function(imageComp) {
            var crop = (this._bgStyles['background-size'] === 'contain') ? 'full' : 'fill';
            var position = this._bgStyles['background-position'].split(' ');
            imageComp.setCropMode(crop);
            imageComp.setAlign(position[0], position[1]);
            //imageComp.setSize()
            imageComp.uncollapse();

        },

        setHeight:function(newVal) {
            if(this._siteHeight === newVal) {
                return;
            }

            this._siteHeight = newVal;
            this.parent(newVal);
            this.resources.W.Viewer.siteHeightChanged(true);
            var bgHeightVal = newVal ;

            if(!this._isIE8()) {
                this._bgNode.$logic.updateRenderedBGWithHeight(bgHeightVal,
                    this._getBottomPadding(this.resources.W.Config.env.$editorMode)) ;
            } else {
                this._bgNodes.setStyle('height', bgHeightVal) ;
            }
        },

        _isIE8: function() {
            return !window.addEventListener ;
        },

        _getBestFit: function(windowSize, options) {
            return this.parent(windowSize, options);
        },

        _getWantedBgSize: function() {
            return this.parent();
        },
        getChildComponents: function() {
            return this.getViewNode().getChildren('[comp]');
        },
        isAnchorable: function() {
            return {to: {allow: true, lock: Constants.BaseComponent.AnchorLock.ALWAYS, distance: 0}, from: {allow: false, lock: Constants.BaseComponent.AnchorLock.NEVER}};
        },
        layoutMinHeight: function() {
            return 0;
        }

    });

});