/**@type wysiwyg.viewer.components.background.MobileBackground */
define.component("wysiwyg.viewer.components.background.MobileBackground", function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.viewer.components.background.AbstractBackground") ;

    def.statics({
        CUSTOM_PAGE_BG_PROPERTY: 'mobileBg',
        MOBILE_TOP_MARGIN_IN_EDITOR: 0,
        MOBILE_BOTTOM_DECORATION_IN_EDITOR_HEIGHT: 65
    }) ;

    def.dataTypes(['BackgroundImage']);

    def.methods({
        _getDeviceWidth: function () {
            return this.resources.W.Viewer.getDocWidth();
        },

        _calculateWidth: function () {
            return this._getDeviceWidth() + 'px' ;
        },

        _calculateHeight: function() {
            var height = parseInt(this._siteHeight) ;
            if(isNaN(height)) {
                height = 0 ;
            }
            if(this._isInEditorViewerFrame()) {
                height = Math.max(this._getDeviceHeight() - this.MOBILE_BOTTOM_DECORATION_IN_EDITOR_HEIGHT, height) ;
            } else {
                height = Math.max(this._getDeviceHeight(), height) ;
            }
            return height + 'px' ;
        },

        _getDeviceHeight: function() {
            return document.getSize().y ;
        },

        _isInEditorViewerFrame: function() {
            return this.resources.W.Config.env.$isEditorViewerFrame ;
        },

        _isMobile: function () {
            return true ;
        },

        _getBgDeviceType: function() {
            return 'mobileBg' ;
        },

        _runTransition: function () {
            if(this._arePageBGsDifferent()) {
                this._onTransitionComplete();
            }
        },

        _updateBgDefinitionPosition: function (bgStyle) {
            if(!bgStyle) {
                return ;
            }
            if(this.resources.W.Config.env.$isEditorViewerFrame && !this.resources.W.Config.env.isEditorInPreviewMode()) {
                bgStyle.top = this.MOBILE_TOP_MARGIN_IN_EDITOR + "px" ;
            } else {
                bgStyle.top = ((this._isBgAttachmentFixed) ? $(document.body).scrollTop : 0) + "px";
            }

            if(this._isOnPublicMobileDevice()) {
                bgStyle.left = "0px";
            } else {
                var windowWidth = $(document.body).getSize().x;
                var deviceWidth = this._getDeviceWidth();
                bgStyle.left = 0.5 * (windowWidth - deviceWidth) + "px";
            }
        },

        _isOnPublicMobileDevice: function() {
            return this.resources.W.Config.env.isPublicViewer() && !this.resources.W.Config.forceMobileOptimizedViewOn();
        },

        _handleViewerStateChanged: function(event, command) {
            if((event && event.viewerMode !== "DESKTOP") || (!event && this._isMobileView())) {
                this.setState("VISIBLE", 'visibility') ;
                this._renderBackground() ;
                this.updateRenderedBGWithHeight(this._calculateHeight()) ;
                this._handleResize() ;
            } else {
                this.setState("INVISIBLE", 'visibility') ;
            }
        },

        _handlePreviewModeChangeToEditor: function(newEditingMode) {
            this._handleResize() ;
            if(newEditingMode === "PREVIEW") {
                this._handleViewerStateChanged() ;
                this._resetShowingBgPartPosition() ;
                this._bgViewPort.setStyle("top", "0") ;
            } else {
                var leftTop = {} ;
                this._updateBgDefinitionPosition(leftTop) ;
                this._bgViewPort.setStyle("left", leftTop.left) ;
                this._bgViewPort.setStyle("top", leftTop.top) ;
            }
        },

        _getCustomBackground: function(customBackgrounds) {
            if(!customBackgrounds) {
                return null ;
            }
            if(customBackgrounds.mobile.ref) {
                return customBackgrounds.mobile ;
            } else {
                return customBackgrounds.desktop ;
            }
        }
    }) ;
}) ;