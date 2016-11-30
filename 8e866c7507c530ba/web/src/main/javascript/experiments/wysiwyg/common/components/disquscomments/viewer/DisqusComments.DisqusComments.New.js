define.experiment.newComponent('wysiwyg.common.components.disquscomments.viewer.DisqusComments.DisqusComments.New', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.resources(['W.Data', 'W.Config']);

    def.inherits('core.components.base.BaseComp');

    def.dataTypes(['DisqusComments']);

    def.resources(['W.Utils', 'W.Viewer', 'W.Config', 'W.Commands']);

    def.skinParts({
        disqus: {
            type: 'htmlElement'
        },
        disqusDemoMessage : {
            type: 'htmlElement'
        }
    });

    def.fields({
        WIDTH: {
            MOBILE: 280,
            DESKTOP: 400
        }
    });

    def.statics({
        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: false,
                animation: false
            }
        }
    });

    def.methods({

        initialize: function (compId, viewNode) {
            this.parent(compId, viewNode);
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditorModeChanged);
            this._updateHeightInterval = null;

            this._resizableSides = [Constants.BaseComponent.ResizeSides.RIGHT, Constants.BaseComponent.ResizeSides.LEFT];
        },

        _onEditorModeChanged: function (newMode, oldMode) {
            if (newMode === "PREVIEW" || oldMode === "PREVIEW") {
                this._rebuildDisqusComponent();
            }
        },

        _isPublicViewerFrame: function () {
            return this.resources.W.Config.env.$isPublicViewerFrame;
        },

        setWidth: function (value, forceUpdate, triggersOnResize) {
            var minimumFacebookLikeWidth;
            if (this._isMobileView) {
                minimumFacebookLikeWidth = 280;
            } else {
                minimumFacebookLikeWidth = 400;
            }

            if (value >= minimumFacebookLikeWidth) {
                this.parent(value, forceUpdate, triggersOnResize);
            }
            else {
                this.parent(minimumFacebookLikeWidth, forceUpdate, triggersOnResize);
            }
        },

        _isComponentInHeader: function () {
            var parentComp = this.getParentComponent();
            var parentCompClassName;

            while (parentComp) {
                parentCompClassName = parentComp.className;

                if (parentCompClassName.indexOf('.Page') !== -1) {
                    return false;
                }
                else if (parentCompClassName.indexOf('HeaderContainer') !== -1) {
                    return true;
                }

                parentComp = parentComp.getParentComponent();
            }

            return true;
        },

        _isHomePage: function (pageId, viewerManager) {
            var pageIdWithoutHash = (pageId.indexOf('#') === 0) ? pageId.substr(1) : pageId;

            return (viewerManager.getHomePageId() === pageIdWithoutHash);
        },

        _getPageUrl: function (pageData, pageId) {
            var url,
                viewer = this.resources.W.Viewer,
                pageName;

            url = this.resources.W.Config.getUserPublicUrl() || '';

            if (!this._isHomePage(pageId, viewer) && !this._isComponentInHeader()) {
                pageName = pageData.get('pageUriSEO');
                url += '#!' + pageName + '/' + pageId;
            }

            return url;
        },

        _getPageInfo: function () {
            var viewer = this.resources.W.Viewer;
            var pageInfo = {};
            var pageId;
            var pageData;

            pageId = viewer.getCurrentPageId();
            if (!pageId) {
                return pageInfo;
            }

            pageData = viewer.getPageData(pageId);

            pageInfo = {
                url: this._getPageUrl(pageData, pageId)
            };

            return pageInfo;
        },


        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations,
                FIRST_RENDER = [this.INVALIDATIONS.FIRST_RENDER],
                DATA_CHANGE = [this.INVALIDATIONS.DATA_CHANGE];

            if (invalidations.isInvalidated(FIRST_RENDER)) {
                this._onFirstRender();
                this._onDataChange(this.getDataItem());
            } else if (invalidations.isInvalidated(DATA_CHANGE)) {
                this._onDataChange(this.getDataItem());
            }

            this._onEachRender();
        },

        _onEachRender: function () {
            //this._rebuildDisqusComponent();
        },

        _onFirstRender: function () {
            this._rebuildDisqusComponent();
        },

        _onDataChange: function (data) {
            this._rebuildDisqusComponent();
        },

        _updateFrameHeight: function () {

            if (!this._updateHeightInterval) {
                var previousValue = null;
                this._updateHeightInterval = setInterval((function () {

                    if (this._iframe &&
                        this._iframe.contentDocument &&
                        this._iframe.contentDocument.getElementById('disqus_thread') &&
                        this._iframe.contentDocument.getElementById('disqus_thread').offsetHeight !== previousValue) {
                        var bodyHeight = this._iframe.contentDocument.getElementById('disqus_thread').offsetHeight;

                        this._iframe.setStyle('height', bodyHeight + 20);
                        this._skinParts.disqus.setStyle('height', bodyHeight);

                        previousValue = bodyHeight;
                    }
                }).bind(this), 300);
            }

        },

        _isValidDisqusId: function(disqusId) {
            return /^[a-zA-Z0-9_-]*$/.test(disqusId);
        },


        _rebuildDisqusComponent: function () {

            var data = this.getDataItem();

            this._skinParts.disqus.empty();

            this._iframe = new Element('iframe');

            this._iframe.insertInto(this._skinParts.disqus);

            if(data.get('disqusId') && this._isValidDisqusId(data.get('disqusId'))){
                this._skinParts.disqusDemoMessage.setStyle('display', 'none');

                setTimeout((function(){
                    this._iframe.contentDocument.write('<div id="disqus_thread"></div> ' +
                        '<script type="text/javascript"> ' +
                        'var disqus_shortname = "'+ data.get('disqusId') +'";' +
                        'var disqus_identifier = "'+ this.$view.$pageId +'";' +
                        '(function() {' +
                        'var dsq = document.createElement("script"); dsq.type = "text/javascript"; dsq.async = true;' +
                        'dsq.src = "//" + disqus_shortname + ".disqus.com/embed.js";' +
                        '(document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]).appendChild(dsq);' +
                        '})();' +
                        '</script>' +
                        '<div style="position:absolute;height:100%;width:100%;opacity:0;top:0;left:0;"></div>');

                    this._updateFrameHeight();

                }).bind(this),0);



            }else{
                this._skinParts.disqus.empty();
                this._skinParts.disqus.setStyle('height', 0);

                this._skinParts.disqusDemoMessage.setStyle('display', 'block');
                this._skinParts.disqusDemoMessage.innerHTML = '<div style="text-align:center;color:#2b5672;font-family:Helvetica Neue,arial,sans-serif;font-size:16px;position:relative;z-index:1;top:48%;">' +
                    'Start using Disqus by connecting your account' +
                    '</div><div style="position:absolute;height:100%;width:100%;opacity:0.8;background-color:#fff;top:0;left:0;"></div>';
            }

            this._view.fireEvent(Constants.ComponentEvents.DOM_DISPLAY_READY);
        }

    });
});