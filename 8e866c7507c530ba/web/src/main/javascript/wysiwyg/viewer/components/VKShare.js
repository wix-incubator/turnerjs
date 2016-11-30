define.component('wysiwyg.viewer.components.VKShareButton', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.traits(["wysiwyg.viewer.components.traits.CustomPreviewBehavior"]);

    def.resources(['W.Config', 'W.Utils', 'W.Viewer', 'W.Commands', 'topology']);

    def.propertiesSchemaType('VKShareProperties');

    def.dataTypes(['VKShareButton']);

    def.skinParts({
        iframe: {type: 'htmlElement'}
    });

    def.binds(['_onPostMessageChangeWidth']);

    def.statics({
        LayoutSize: {
            Button: {w: 100, h: 21},
            ButtonWithoutCounter: {w: 64, h: 21},
            Link: {w: 50, h: 21},
            LinkWithoutIcon: {w: 30, h: 21},
            Icon: {w: 36, h: 36}
        },
        EDITOR_META_DATA:{
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

        initialize: function (compId, viewNode, extraArgs) {
            this._resizableSides = [];
            //Listen to messages from our own iframe (sends the width)
            window.addNativeListener('message', this._onPostMessageChangeWidth);

            this.parent(compId, viewNode, extraArgs);
        },

        _onRender: function (renderEvent) {
            var data,
                size;

            //Waiting for SiteReady event in order get page data
            if(!this.resources.W.Viewer.isSiteReady()) {
                this.invalidate('siteNotReady');
                return;
            }

            //This flag will be true once the iframe sends a post message with real width
            this._measured = false;

            data = this.getDataItem();
            size = this.LayoutSize[data.get('style')] || this.LayoutSize.Button;

            this._createClickOverlayForPreviewMode('Social_Widgets_Only_On_Public');
            this._changeSize(size.w, size.h);
            this._skinParts.iframe.setAttribute('src', this._getIframeUrl());
        },

        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.DISPLAY,
                'siteNotReady'
            ];

            return invalidations.isInvalidated(renderTriggers);
        },

        _onPostMessageChangeWidth: function (e) {
            var width,
                height,
                msgData,
                id = this.getComponentUniqueId();

            try {
                msgData = JSON.parse(e.data);
            } catch(e) {
                return;
            }

            if (id !== msgData.id) {
                return;
            }

            width = msgData.width;
            height = this.getHeight();
            this._changeSize(width, height);
        },

        _getIframeUrl: function () {
            var baseURL = this.resources.topology.wysiwyg + "/html/external/VKShare.html";
            var urlParams = this._getUrlParams();

            return baseURL + "?" + Object.toQueryString(urlParams);
        },

        _getUrlParams: function () {
            var data = this.getDataItem();
            var pageInfo = this._getPageInfo();

            return {
                'id': this.getComponentUniqueId(),
                'url': pageInfo.url || '',
                'style': data.get('style'),
                'text': data.get('text') || 'Share'
            };
        },

        _getPageInfo: function() {
            var viewer = this.resources.W.Viewer;
            var pageInfo = {};
            var pageId;
            var pageData;

            if (!this._isPublicViewerFrame()) {
                return pageInfo;
            }

            pageId = viewer.getCurrentPageId();
            if(!pageId) {
                return pageInfo;
            }
            pageData = viewer.getPageData(pageId);

            pageInfo = {
                url: this._getPageUrl(pageData, pageId)  //,

//                /*
//                  Product decided not to pass these parameters to the share window
//                  Title - _getPageTitle is working (combines site + page titles)
//                  Description - _getPageDescription takes only the page description (no fallback to site description)
//                  Image -  _getImage not doing anything, need to figure out which image to take and from where
//                */
//                title: this._getPageTitle(pageData, pageId),
//                description: this._getPageDescription(pageData),
//                image: this._getImage()
            };

            return pageInfo;
        },

        _getPageUrl: function (pageData, pageId) {
            var url,
                viewer = this.resources.W.Viewer,
                pageName;


            url = this.resources.W.Config.getExternalBaseUrl() || '';

            if (!this._isHomePage(pageId, viewer) && !this._isComponentInHeader()) {
                pageName = pageData.get('pageUriSEO');
                url += '#!' + pageName + '/' + pageId;
            }

            return url;
        },

        _isPublicViewerFrame: function () {
            return this.resources.W.Config.env.$isPublicViewerFrame;
        },

        _isComponentInHeader: function() {
            var parentComp = this.getParentComponent();
            var parentCompClassName;

            while(parentComp) {
                parentCompClassName = parentComp.className;

                if(parentCompClassName.indexOf('.Page') !== -1) {
                    return false;
                }
                else if(parentCompClassName.indexOf('HeaderContainer') !== -1) {
                    return true;
                }

                parentComp = parentComp.getParentComponent();
            }

            return true;
        },

        _isHomePage: function(pageId, viewerManager) {
            var pageIdWithoutHash = (pageId.indexOf('#') === 0) ? pageId.substr(1) : pageId;

            return (viewerManager.getHomePageId() === pageIdWithoutHash);
        },

        _changeSize: function (width, height) {
            this.setWidth(width);
            this.setHeight(height);
        },

        onPageVisibilityChange: function(isVisible) {
            if(isVisible && !this._measured) {
                this._measured = true;

                this._skinParts.iframe.setAttribute('src', this._getIframeUrl());
            }
        },

        setWidth: function (width){
            this.parent(width);
            this._skinParts.iframe.setStyle("width", width + "px");
        },

        setHeight: function (height){
            this.parent(height);
            this._skinParts.iframe.setStyle("height", height + "px");
        },

        exterminate: function () {
            window.removeNativeListener('message', this._onPostMessageChangeWidth);
            this.parent();
        }

        /**************************************************************
         * The following functions are not in use at the moment       *
         * The will be used in the future to enhance the share dialog *
         **************************************************************/
//        _getPageTitle: function(pageData, pageId){
//            var viewer = this.resources.W.Viewer;
//            var pageTitle = '';
//            var pageTitleSEO = pageData.get('pageTitleSEO') || '';
//            var pageName = pageData.get('title') || '';
//            var siteTitle = this.resources.W.Config.getSiteTitleSEO();
//            var isHomePage = viewer.isHomePage(pageId);
//
//            if (pageTitleSEO) { //if the user defined a title in the page settings, that rules
//                pageTitle = pageTitleSEO;
//            } else {
//                pageTitle = siteTitle;
//                if (!isHomePage) { //only if it's an inner page, we also add the page name
//                    pageTitle += (pageTitle) ? ' | ' : '';
//                    pageTitle += pageName;
//                }
//            }
//
//            return pageTitle;
//        },
//
//        _getPageDescription: function(pageData){
//            var pageDescription = pageData.get('descriptionSEO') || '';
//            if(!pageDescription) {
//                //TODO: Get site description
//                pageDescription = '';
//            }
//
//            return pageDescription;
//        },
//
//        _getImage: function (){
//            //TODO: Get site image
//            return '';
//        }
    });
});