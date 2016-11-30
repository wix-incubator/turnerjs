/**
 * @class wysiwyg.viewer.components.WixAds
 */
define.component('wysiwyg.viewer.components.WixAds', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        'footerLabel': { type: 'htmlElement', optional: false },
        'topRectLabel': { type: 'htmlElement', optional: false },
        'topRectContent': { type: 'htmlElement', optional: false }
    });

    def.binds(['_getAdHeight', '_onViewerModeChange', '_onSiteReady', '_handleMobileRotation', '_onComponentDisposed']);

    def.fields({
        _renderTriggers: [ Constants.DisplayEvents.ADDED_TO_DOM, Constants.DisplayEvents.DISPLAYED, Constants.DisplayEvents.DISPLAY_CHANGED ]
    });

    def.states({
        viewerState: ["desktop", "mobile"],
        orientation: ["portrait", "landscape"]
    });

    def.resources(['W.Config', 'W.Viewer', 'W.Commands', 'W.Theme']);

    /**
     * @lends wysiwyg.viewer.components.WixAds
     */
    def.methods({
        initialize: function (compId, viewNode, argsObject) {
            this.parent(compId, viewNode, argsObject);
            var commands = this.injects().Commands;
            commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onModeChange);
            commands.registerCommandListenerByName("WViewerCommands.OpenZoom", this, function () {
                this._handleMediaZoom(true);
            });
            commands.registerCommandListenerByName("WViewerCommands.MediaZoom.Close", this, function () {
                this._handleMediaZoom(false);
            });
            commands.registerCommandListenerByName("WViewerCommands.MobileMediaZoom.Closed", this, function () {
                this._handleMediaZoom(false);
            });

            if (!this.resources.W.Config.env.$isPublicViewerFrame) {
                this.injects().Viewer.addHeightChangeCallback(this._getAdHeight);
            }
            commands.registerCommandAndListener("WPreviewCommands.ViewerStateChanged", this, this._onViewerModeChange);
            this.resources.W.Viewer._activeViewer_.addEvent('SiteReady', this._onSiteReady);

            window.addEvent("orientationchange", this._handleMobileRotation);
            this.addEvent(Constants.ComponentEvents.DISPOSED, this._onComponentDisposed);
        },

        _onAllSkinPartsReady: function () {
            this._showHideAds(this._shouldDisplay());
//            this.setCollapsed(this.resources.W.Config.env.$isEditorViewerFrame || this._isPremium());

            this._view.addClass('Z-WIX-ADS');

            this._skinParts.view.addEvent('click', function () {
                var _url = this._getLinkUrl(),
                    _linkTarget = this._getLinkTarget();
                if (_url) {
                    window.open(_url, _linkTarget);
                }
            }.bind(this));

            if (this.resources.W.Config.env.$isEditorViewerFrame) {
                this._addBiEvent();
            }
        },

        _onComponentDisposed: function () {
            this.resources.W.Viewer._activeViewer_.removeEvent('SiteReady', this._onSiteReady);
        },

        _onViewerModeChange: function (params) {
            this.setCollapsed(true);
            if (!this._shouldShowAds(null, null)) {
                return;
            }
            if (this.resources.W.Viewer._activeViewer_.isSiteReady()) {
                this._onSiteReady(W.Config.env.$viewingDevice);
            } else {
                this.resources.W.Viewer._activeViewer_.addEvent('SiteReady', this._onSiteReady);
            }
        },

        _onSiteReady: function (viewerMode) {
            this.resources.W.Viewer._activeViewer_.removeEvent('SiteReady', this._onSiteReady);
            this.validateDisplayState();

            this.$view.fireEvent("ready", this);
        },

        _getLinkUrl: function () {
            var linkUrl = '';
            if (!this.resources.W.Config.env.$isEditorlessPreview && !this.resources.W.Config.env.$isPublicViewerFrame) {
                return linkUrl;
            }
            var adData = this.resources.W.Viewer.getAdData();
            if (this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE) {
                if (adData[Constants.ViewerTypesParams.TYPES.MOBILE]) {
                    adData = adData[Constants.ViewerTypesParams.TYPES.MOBILE];
                }
            } else {
                if (adData[Constants.ViewerTypesParams.TYPES.DESKTOP]) {
                    adData = adData[Constants.ViewerTypesParams.TYPES.DESKTOP];
                }
            }

            var _isViewer = this.resources.W.Config.env.$isPublicViewerFrame;
            linkUrl = _isViewer ? adData.adUrl.replace('[site_id]', window.siteId) : adData.adUrl;

            return linkUrl;
        },

        _getLinkTarget: function () {
            var linkTarget = "";
            if (W.Config.env.$frameName !== "preview") {
                var _isViewer = this.resources.W.Config.env.$isPublicViewerFrame;
                var _openInNewWindow = !_isViewer || this._isFacebook();
                if (_openInNewWindow) {
                    linkTarget = '_blank';
                } else {
                    linkTarget = '_self';
                }
            }
            return linkTarget;
        },

        _addBiEvent: function () {
            this._addBiEventsToSkinPart(this._skinParts.topRectLabel, {c1: 'top-right'});
            this._addBiEventsToSkinPart(this._skinParts.topRectContent, {c1: 'top-right'});
            this._addBiEventsToSkinPart(this._skinParts.footerLabel, {c1: 'footer'});
        },

        _addBiEventsToSkinPart: function (skinPart, params) {
            var event = this.resources.W.Config.env.$isEditorlessPreview ?
                wixEvents.FEEDBACK_USER_CLICKED_WIX_ADS : wixEvents.WIXADS_CLICKED_IN_PREVIEW;

            skinPart.on(Constants.CoreEvents.CLICK, this, function () {
                LOG.reportEvent(event, params);
            });
        },

        validateDisplayState: function () {
            var viewerMode = W.Config.env.$viewingDevice;
            var siteNode;

            if (viewerMode === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this._view.parentNode.getElementById("mobile_SITE_STRUCTURE");
                siteNode = this.resources.W.Viewer.getSiteNode();
                siteNode.setStyle("margin-top", (this._shouldDisplay() && W.Config.env.$editorMode === "PREVIEW") ? "30px" : "0px");

                this.setState("mobile", "viewerState");
            } else {
                siteNode = this.resources.W.Viewer.getSiteNode();
                siteNode.setStyle("margin-top", "0px");

                this.setState("desktop", "viewerState");
            }

            if (this._skinParts) {
                this.setAdData();
            }
        },

        render: function () {
            this.validateDisplayState();
        },

        setAdData: function () {
            var shouldDisplay = this._shouldDisplay();
            if (shouldDisplay) {
                var adData = this.resources.W.Viewer.getAdData();
                this.setState(this.resources.W.Config.mobileConfig.isPortrait() ? "portrait" : "landscape", "orientation");
                if (this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE) {
                    this._removeHeaderAd();
                    if (this.resources.W.Config.env.$editorMode === "PREVIEW") {
                        this._setFooterAd(adData[Constants.ViewerTypesParams.TYPES.MOBILE]);
                    } else {
                        this._removeFooterAd();
                    }
                } else {
                    this._setHeaderAd(adData[Constants.ViewerTypesParams.TYPES.DESKTOP]);
                    this._setFooterAd(adData[Constants.ViewerTypesParams.TYPES.DESKTOP]);
                }
            }
            this._showHideAds(shouldDisplay);
            this._fixMobileBGPosition();
        },

        _setHeaderAd: function (adData) {
            this._skinParts.topRectLabel.set('html', adData.topLabel);
            this._skinParts.topRectContent.set('html', adData.topContent);
            this._skinParts.topRectLabel.uncollapse();
            this._skinParts.topRectContent.uncollapse();
        },

        _setFooterAd: function (adData) {
            var label = "";
            var viewerMode = W.Config.env.$viewingDevice;
            if (viewerMode === Constants.ViewerTypesParams.TYPES.MOBILE) {
                adData = adData || {footerLabel: "en", adUrl: "http://www.wix.com"};
                if (adData && adData.footerLabel) {
                    label = this._generateMobileAdHTML(adData.footerLabel);
                } else {
                    // TODO: REMOVE MOCKED DATA!!!!!!
                    label = this._generateMobileAdHTML("7c3dbd_67131d7bd570478689be752141d4e28a.jpg");
                }
            } else {
                label = adData.footerLabel;
            }
            this._skinParts.footerLabel.set('html', label);
            this._skinParts.footerLabel.uncollapse();
        },

        _fixMobileBGPosition: function () {
            var mobileBG;

            // Checking for both mobile_bgNode and bgNodes for backward compatibility
            mobileBG = document.getElementById('mobile_bgNode');
            if(mobileBG) {
                mobileBG.setStyle("top", this._shouldDisplay()? "30px" : "0px");
            }
        },

        _removeHeaderAd: function () {
            this._skinParts.topRectLabel.collapse();
            this._skinParts.topRectContent.collapse();
        },

        _removeFooterAd: function () {
            this._skinParts.footerLabel.collapse();
        },

        _generateMobileAdHTML: function (id) {
            var mediaDir = W.Config.getMediaStaticUrl();
            var linkUrl = this._getLinkUrl();
            var linkTarget = this._getLinkTarget();

            var html = "<div id='footerLabel'><div id='adContainer'>";
            if (linkUrl && linkTarget) {
                html += "<a id='adLink' href='" + linkUrl + "' target='" + linkTarget + "'>";
            }

            html += "<img id='adImg' src='" + mediaDir + id + "' />";
            if (linkUrl && linkTarget) {
                html += "</a>";
            }
            html += "</div></div>";
            return html;
        },

        _onModeChange: function (mode) {
//            this._showHideAds(this._shouldShowAds());
            this.validateDisplayState();
        },

        _handleMediaZoom: function (isOpen) {
            this._isMediaZoomOpen = isOpen;
            this._showHideAds(this._shouldDisplay());
        },

        _handleMobileRotation: function () {
            this._showHideAds(!this._isPremium() && !this._isMediaZoomOpen && this.resources.W.Config.mobileConfig.isPortrait());
            this.validateDisplayState();
            this._fixMobileBGPosition();
        },

        _showHideAds: function (isShow) {
            if (!this._view) {
                return;
            }
            var collapsed = this._view.isCollapsed();
            if (collapsed === isShow) {
                this.setCollapsed(!isShow);
                if (this.resources.W.Viewer.isSiteReady()) {
                    this.resources.W.Viewer.siteHeightChanged(false);
                }
            }
        },

        _shouldDisplay: function () {
            // will replace the shouldShowAds
            if (this.resources.W.Config.env.$editorMode.toUpperCase() !== "PREVIEW") {
                return false;
            }
            if (this._isPremium()) {
                return false;
            }
            if (this._isMediaZoomOpen) {
                return false;
            }
            if (this.resources.W.Config.env.$viewingDevice.toUpperCase() === Constants.ViewerTypesParams.TYPES.MOBILE) {
                var isLandscapeAndNotPreview = !this.resources.W.Config.env.$isEditorViewerFrame && !this.resources.W.Config.mobileConfig.isPortrait();
                if (isLandscapeAndNotPreview) {
                    return false;
                }
            }
            return true;
        },

        _shouldShowAds: function () {
            return (W.Config.env.$editorMode === "PREVIEW" && !this._isPremium());
        },

        _isInPreviewMode: function (mode) {
            return mode.toLowerCase() === Constants.ViewManager.VIEW_MODE_PREVIEW.toLowerCase();
        },

        _isPremium: function () {
            var premiumFeatures = this.resources.W.Config.getPremiumFeatures();
            if (!premiumFeatures || premiumFeatures.length === 0) {
                return false;
            }
            if (this._isFacebook()) {
                return premiumFeatures.contains('NoAdsInSocialSites');
            } else {
                return premiumFeatures.contains('AdsFree') || premiumFeatures.contains('ShowWixWhileLoading');
            }
        },

        _isFacebook: function () {
            var appType = this.resources.W.Config.getApplicationType();
            return appType === 'HtmlFacebook';
        },

        _getAdHeight: function () {
            if (this._view.isCollapsed()) {
                return 0;
            } else {
                return this._skinParts.footerLabel.getHeight();
            }
        },
        _getAdTopHeight: function () {
            if (this._view.isCollapsed()) {
                return 0;
            } else {
                return this._skinParts.topRect.getHeight();
            }
        },
        getAdHeight: function () {
            return {
                footer: this._getAdHeight(),
                top: this._getAdTopHeight()
            };
        }

    });

});