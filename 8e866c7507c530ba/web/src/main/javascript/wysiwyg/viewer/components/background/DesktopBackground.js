/**@type wysiwyg.viewer.components.background.DesktopBackground */
define.component("wysiwyg.viewer.components.background.DesktopBackground", function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.viewer.components.background.AbstractBackground") ;

    def.statics({
        CUSTOM_PAGE_BG_PROPERTY: "desktopBg"
    }) ;

    def.dataTypes(['BackgroundImage']);

    def.methods({
        _calculateWidth: function () {
            var width = 0 ;
            if(this._isTablet()) {
                width = document.getScrollWidth() + 'px' ;
            } else {
                width = document.body.clientWidth + 'px' ;
            }
            return width ;
        },

        _calculateHeight: function() {
            var height = 0 ;
            if(this._isBgAttachmentFixed) {
                height = document.getSize().y ;
            } else {
                // scroll with site mode... -> stretches itself on the entire site.
                height = Math.max(document.getSize().y, this._siteHeight) ;
            }
            return height + this._additionalSiteHeight + "px" ;
        },

        _runTransition: function () {
            if (this._arePageBGsDifferent()) {
                this._beforeTransition() ;
                var transition = this._getPageTransition() ;
                this._resetBgPartsStyles(transition) ;
                if (transition.anim) {
                    this._runAnimation(transition) ;
                } else {
                    console.error("Page transition '%s' not found.", transition.name) ;
                    this._onTransitionComplete() ;
                }
            }
        },

        _beforeTransition: function() {
            var bgAttachmentProperty    = "background-attachment";
            var bgPartsHeight           = this._additionalSiteHeight + document.getSize().y ;
            if(this._showingBgPart.getStyle(bgAttachmentProperty) === "fixed") {
                this._showingBgPart.setStyle('height', bgPartsHeight) ;
                this._showingBgPart.setStyle(bgAttachmentProperty, "") ;
            }
            if(this._hiddenBgPart.getStyle(bgAttachmentProperty) === "fixed") {
                this._hiddenBgPart.setStyle('height', bgPartsHeight) ;
                this._hiddenBgPart.setStyle(bgAttachmentProperty, "") ;
            }
            this._bgViewPort.setStyle("position", "fixed") ;
        },

        _afterTransition: function() {
            this.parent();
            this._restoreBackgroundAttachmentValue(this._showingBgPart) ;
            this._restoreBackgroundAttachmentValue(this._hiddenBgPart) ;
        },

        _restoreBackgroundAttachmentValue: function(bgPart) {
            var bgAttachmentValue = this._getNodeBgStyle(bgPart)["background-attachment"];
            bgPart.setStyle("background-attachment", bgAttachmentValue) ;
        },

        _getPageTransition: function() {
            var transitionType = this.resources.W.Viewer.getPageGroup().getComponentProperty("transition") ;
            return {
                name: transitionType,
                anim: this._transitionUtils.getTransition(transitionType)
            } ;
        },

        _runAnimation: function(transition) {
            var transitionName      = transition.name ;
            var transitionAnimation = transition.anim ;
            var animDuration        = this._getAnimationDuration(transitionName);
            var animDirection       = this._getAnimationDirection(transitionName);

            transitionAnimation(this._showingBgPart, this._hiddenBgPart, animDirection,
                animDuration, this._onTransitionComplete);
        },

        _getAnimationDuration: function(transitionName) {
            var transitionKey = this._transitionNameToKey[transitionName] ;
            if(transitionKey) {
                return Constants.TransitionDefaults[transitionKey].durationInSec ;
            } else {
                return Constants.TransitionDefaults.NONE.durationInSec ;
            }
        },

        _getAnimationDirection: function (transitionName) {
            if(Constants.TransitionTypes.SWIPE_VERTICAL_FULLSCREEN !== transitionName) {
                return this.DEFAULT_TRANSITION_DIRECTION ;
            } else {
                return this.VERTICAL_TRANSITION_DIRECTION ;
            }
        },

        _getBgDeviceType: function() {
            return "siteBg" ;
        },

        _updateBgDefinitionPosition: function (bgStyle) {
            if(!bgStyle) {
                return ;
            }
            bgStyle.left = 0 ;
            bgStyle.top = 0 ;
        },

        _handleViewerStateChanged: function(event, command) {
            if((event && event.viewerMode === "DESKTOP") || (!event && this._isDesktopView())) {
                this.setState("VISIBLE", 'visibility') ;
                this._renderBackground() ;
                this._handleResize();
            } else {
                this.setState("INVISIBLE", 'visibility') ;
            }
        },

        _getCustomBackground: function(customBackgrounds) {
            if(!customBackgrounds) {
                return null ;
            }
            return customBackgrounds.desktop ;
        },

        _updateBgAttachmentProperty: function (bgDefinition) {
            var isBgAttachmentFixed = this._isBackgroundFixed(bgDefinition);
            if (this._isBgAttachmentFixed !== isBgAttachmentFixed) {
                this._isBgAttachmentFixed = isBgAttachmentFixed;
                if(this._isBgAttachmentFixed) {
                    this._bgViewPort.setStyle("top", "0") ;
                }
            }
        },

        _isMobile: function () {
            return false ;
        }
    }) ;
}) ;