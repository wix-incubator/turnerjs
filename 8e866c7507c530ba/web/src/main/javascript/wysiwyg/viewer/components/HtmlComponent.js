define.component('wysiwyg.viewer.components.HtmlComponent', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;


    def.inherits("mobile.core.components.base.BaseComponent");
    def.utilize(['core.components.base.SizeLimits']);
    def.resources(['W.Config', 'W.Viewer', 'W.Commands']);
    def.binds(['_onPageTransitionStarted'/*, '_onPageTransitionEnded'*/]);
    def.traits(['wysiwyg.viewer.components.traits.IframeUtils']);

    def.skinParts({
        iFrameHolder: {type: 'htmlElement'}
    });
    def.dataTypes(['HtmlComponent']);
    def.states([ 'hasContent', 'noContent' ]);
    def.propertiesSchemaType("");
    def.statics({
        MAX_HTML_COMPONENT_HEIGHT_DEFAULT: 5000,
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });
    def.methods({
        initialize: function (compId, viewNode, argsObject, shlomo) {
            this.parent(compId, viewNode, argsObject);
            this.addEvent("resizeEnd", this._onResizeEnd);
            this._iframe = null;
            this._renderOnResize = false;
            this._renderFrame = false;
            if (this.resources.W.Config.env.$isEditorViewerFrame) {
                this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onViewModeChanged);
            }
            if (this.resources.W.Config.getSafeMode('htmlcomponent')){
                this._IsInSafeMode = true;
            }
        },

        _onViewModeChanged: function () {
            if (this.resources.W.Config.env.isEditorInPreviewMode() && !this.resources.W.Config.env.isInDeactivatedViewer()) {
                this._renderFrame = true;
            } else if (this._renderFrame && this._iframe !== null) {
                this._setFrameWithSrc(this._iframe);
                this._renderFrame = false;
            }
        },

        _onResizeEnd: function () {
            // resize the iFrame itself
            if (this._iframe) {
                this._iframe.width = this._view.getWidth();
                this._iframe.height = this._view.getHeight();
            }

            // re-render if needed
            if (this._renderOnResize) {
                this._renderIfReady();
            }
        },

        // when overriding, you should call this.parent()
        render: function () {
            this.resources.W.Viewer.removeEvent("pageTransitionStarted", this._onPageTransitionStarted);
            if (this.getDataItem().getData().freezeFrame && !this._isInMasterpageScope()) {
                this.resources.W.Viewer.addEvent("pageTransitionStarted", this._onPageTransitionStarted);
                this._renderTriggers = [Constants.DisplayEvents.DISPLAY_CHANGED];
            }

            this._createIFrame(this._view.getWidth(), this._view.getHeight());
            // set the status to having or not having content
            this.setState(this.hasContent() ? 'hasContent' : 'noContent');
            if (this.hasContent()) {
                this._setFrameWithSrc(this._iframe);
            }
        },

        _onPageTransitionStarted: function (pageId) {
            if(pageId !== this.$view.$pageId){
                this.setIFrameSrc(this._iframe, 'about:blank');
            }
        },


        // this function was overridden in order to change value of MAXIMUM_HEIGHT_DEFAULT
        // because it can`t be possible to override static member from basicComponent class
        getSizeLimits: function () {
            if (this._sizeLimits === undefined) {
                this._sizeLimits = new this.imports.SizeLimits();
                this._sizeLimits.minW = this._sizeLimits.minW || this.MINIMUM_WIDTH_DEFAULT;
                this._sizeLimits.minH = this._sizeLimits.minH || this.MINIMUM_HEIGHT_DEFAULT;
                this._sizeLimits.maxW = this._sizeLimits.maxW || this.MAXIMUM_WIDTH_DEFAULT;
                this._sizeLimits.maxH = this._sizeLimits.maxH || this.MAX_HTML_COMPONENT_HEIGHT_DEFAULT;
                this._originalSizeLimits = this._sizeLimits.clone();
            }
            return this._sizeLimits;
        },

        addProtocolIfMissing: function (url) {
            var protocolRegex = /^(ftps|ftp|http|https):.*$/;

            return !protocolRegex.test(url) ? 'http://' + url : url;
        },

        getIFrameSrc: function () {
            var url = this._data.get('url'),
                isExternal = this._data.get('sourceType') === 'external',
                htmlComponentTopologyUrl = this.resources.W.Config.getServiceTopologyProperty('staticHTMLComponentUrl');

            if (!isExternal && url.indexOf('html/') === 0) {
                url = htmlComponentTopologyUrl + url;
            }

            url = this.addProtocolIfMissing(url);
            htmlComponentTopologyUrl = this.addProtocolIfMissing(htmlComponentTopologyUrl);

            if (!isExternal) {
                url = url.replace('//static.wixstatic.com', htmlComponentTopologyUrl);
            }

            return url;
        },
        _onPageTransitionEnded: function () {
            if (this.getIsDisposed()) {
                return;
            }
            this._setFrameWithSrc(this._iframe);
        },

        // override to notify if a placeholder should be placed instead
        hasContent: function () {
            return !!this._data.get('url');
        },

        _isFreeSite: function(){
            return _.isEmpty(window.rendererModel && window.rendererModel.premiumFeatures);
        },

        _createIFrame: function (width, height) {
            var newIFrame = null;

            if (W.Experiments.isExperimentOpen('SandboxIframeInEditor')) {
                newIFrame = this._isFreeSite() ?
                    new IFrame({sandbox:'allow-same-origin allow-forms allow-popups allow-scripts allow-pointer-lock'}) :
                    new IFrame();
            } else {
                newIFrame = new IFrame();
            }

            newIFrame.width = width;
            newIFrame.height = height;

            // on mobile safari, don't show scrolling
            if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
                this._view.setStyles({overflow: 'scroll', '-webkit-overflow-scrolling': 'touch'});
            }

            // insert or replace
            if (this._iframe) {
                newIFrame.replaces(this._iframe);
            } else {
                newIFrame.insertInto(this._skinParts.iFrameHolder);
            }

            // store the frame for future reference
            this._iframe = newIFrame;
        },

        _setFrameWithSrc: function (iFrame) {
            var newSrc = this.getIFrameSrc(),
                oldSrc = iFrame.src;

            if (this._IsInSafeMode) {
                var html = this._getSafeModeHTML(newSrc);
                iFrame.contentWindow.document.open();
                iFrame.contentWindow.document.write(html);
                iFrame.contentWindow.document.close();
            } else {
                if (oldSrc !== newSrc) {
                    this.setIFrameSrc(iFrame, newSrc);
                }
            }
        },

        _getSafeModeHTML: function(originalIFrameSrc){
            var html = '<!DOCTYPE html><html><head><style>.wholepage {background-color: #f984ef; height: 100%;width:100%;}</style></head>' +
                '<body class="wholepage"><div>' +
                '<button onClick=\'window.location.href="' + originalIFrameSrc + '"\'>Reset</button></div>' +
                '<div>' + originalIFrameSrc + '</div>' +
                '</body></html>';
            return html;
        },

        _isInMasterpageScope: function(){
            var parentSiteSegment = this.getParentSiteSegmentContainer();
            return !parentSiteSegment ||
                    parentSiteSegment.$className === 'wysiwyg.viewer.components.HeaderContainer' ||
                    parentSiteSegment.$className === 'wysiwyg.viewer.components.FooterContainer';
        },

        dispose: function() {
            this.resources.W.Viewer.removeEvent("pageTransitionStarted", this._onPageTransitionStarted);
            this.parent();
        }
    });
});
