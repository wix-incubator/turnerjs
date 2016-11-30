/**
 * @class wysiwyg.viewer.components.Video
 */
define.component('wysiwyg.viewer.components.Video', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Utils', 'W.Config', 'W.Commands', 'topology']);

    def.skinParts( {
        videoFrame:{type:'htmlElement'},
        preview:{type:'htmlElement'}
    });

    def.binds(['_stopVideo', '_getYouTubeParams', '_getVimeoParams', '_onResize', '_onResizeEnd', '_getYouTubePreview', '_getViemoPreviewUrl']);

    def.states([]);

    def.dataTypes(['Video']);

    def.propertiesSchemaType('VideoProperties');

    def.traits(['wysiwyg.viewer.components.traits.IframeUtils']);

    def.fields({
        _renderTriggers:[ Constants.DisplayEvents.DISPLAY_CHANGED ],

        _defaultPlayerParams:{
            wmode:'transparent'
        },

        _options:{
            videoType:"",
            videoId:"",
            resize:[]
        }
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings:true,
                design:true
            }
        }
    });

    /**
     * @lends wysiwyg.viewer.components.Video
     */
    def.methods({
        _getServices:function () {
            return  {
                "YOUTUBE":{
                    url:'//www.youtube.com/embed/',
                    preview:this._getYouTubePreview,
                    getParams:this._getYouTubeParams,
                    hMinSize:200,
                    wMinSize:200
                },
                "VIMEO":{
                    url:'http://player.vimeo.com/video/',
                    preview:this._getViemoPreviewUrl,
                    getParams:this._getVimeoParams,
                    hMinSize:100,
                    wMinSize:100
                }
            };
        },

        initialize:function (compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);
            this._iframe = null;

            this.addEvent("resizeEnd", this._onResizeEnd);
            this.resources.W.Commands.registerCommandListenerByName("WPreviewCommands.WEditModeChanged", this, this._onEditorModeChanged);
            this._view.addEvent(Constants.DisplayEvents.COLLAPSED, this._stopVideo);
        },

        _stopVideo:function () {
            if (this._iframe) {
                this.setIFrameSrc(this._iframe, 'about:blank');
            }
        },

        render:function () {
            this._renderIframe();
            this.setMinW(this._getWMinSize());
            this.setMinH(this._getHMinSize());
        },

        /**
         * @override
         */
        _onResize:function () {
            this.parent();
        },

        _onResizeEnd:function () {
            this._renderIframe();
        },

        _onEditorModeChanged:function (newMode, oldMode) {
            if (this.resources.W.Config.env.$isPublicViewerFrame) {
                return;
            }

            var previewMode = "PREVIEW";
            if (oldMode === previewMode || newMode === previewMode) {
                this._renderIframe();
            }

        },

        /**
         * @override
         * @param value
         */
        setHeight:function (value, forceUpdate, triggersOnResize) {
            value = Math.max(value, this._getHMinSize());
            this._view.setStyle("height", parseInt(value, 10) + "px");
            this.parent(value, true, triggersOnResize);
        },

        /**
         * @override
         * @param value
         */
        setWidth:function (value, forceUpdate, triggersOnResize) {
            value = Math.max(value, this._getWMinSize());
            this._view.setStyle("width", parseInt(value, 10) + "px");
            this.parent(value, forceUpdate, triggersOnResize);
        },

        _getHMinSize:function () {
            // Youtube limitation is video size of 200x200 (http://apiblog.youtube.com/2012/03/minimum-embeds-200px-x-200px.html) //
            // apparently - not including the control bar....

            var videoType = this._getVideoType();
            var minSize = this._getServices()[ videoType ]['hMinSize'];

            var showControlsValue = this.getComponentProperty("showControls");
            if (videoType === "YOUTUBE" && showControlsValue === "always_show") {
                minSize += 20;
            }

            return minSize;
        },

        _getWMinSize:function () {
            var videoType = this._getVideoType();
            return this._getServices()[ videoType ]['hMinSize'];
        },

        _renderIframe:function () {
            this._options.videoType = this._getVideoType();
            this._options.videoId = this._getVideoId();

            if (!this._options.videoId || !this._options.videoType) {
                return;
            }

            if (!this.resources.W.Config.env.isInInteractiveViewer()) {
                if (Browser.firefox && Browser.Platform.mac) {
                    this._createPreview();
                    return;
                }
            }

            this._skinParts.videoFrame.uncollapse();
            this._skinParts.preview.collapse();

            if (!this._iframe || !this._skinParts.videoFrame.hasChildNodes()) {
                // If no iframe, create it
                this._createIframe(this._getUrl(), this.getWidth(), this.getHeight());
            } else {
                // Else update url (if changed) and dimensions of the iframe
                this._updateIframe(this._getUrl(), this.getWidth(), this.getHeight());
            }

            this._iframe.setStyles({
                "height":"100%",
                "width":"100%"
            });

        },

        _getContainerIframe:function () {
            return this.resources.topology.wysiwyg + "/html/external/video.html";
        },

        _createIframe:function (url, width, height) {
            /* params for the internal real video iframe */
            var fullUrl = this._getContainerIframe() + "?url=" + encodeURIComponent(url) + "&width=" + width + "&height=" + height;
            /* outer iframe */
            this._iframe = new IFrame({
                src:fullUrl,
                webkitAllowFullScreen:'true',
                mozallowfullscreen:'true',
                allowfullscreen:'allowfullscreen',
                frameborder:'0'
            });
            this._iframe.insertInto(this._skinParts.videoFrame);
            // this._options.resize.push(this._iframe);
        },

        _updateIframe:function (url, width, height) {
            var fullUrl = this._getContainerIframe() + "?url=" + encodeURIComponent(url);
            this.setIFrameSrc(this._iframe, fullUrl);
        },

        _getPlayerParamsAsQueryString:function () {
            /* get services */
            var params = this._getServices()[this._options.videoType]['getParams']();
            var paramsArray = [];
            Object.forEach(params, function (value, key) {
                paramsArray.push(key + '=' + value);
            });
            return  paramsArray.join('&');
        },

        _getYouTubeParams:function () {
            var params = {};
            var showControlsOption = this.getComponentProperty("showControls");
            var isFacebookSite = this.resources.W.Config.isFacebookSite();
            var isAutoPlay = this.getComponentProperty('autoplay') && !isFacebookSite;

            var isLightTheme = this.getComponentProperty('lightTheme');
            var isLoop = this.getComponentProperty('loop');
            var isShowInfo = this.getComponentProperty('showinfo');

            params["wmode"] = "transparent";
            if (this.resources.W.Config.env.isInInteractiveViewer()) {
                params['autoplay'] = ( (isAutoPlay && this.getIsDisplayed()) ? "1" : "0" );
            }

            if (isLightTheme) {
                params['theme'] = "light";
            } else {
                params['theme'] = "dark";
            }

            switch (showControlsOption) {
                case "always_show" :
                    params['controls'] = "1";
                    params['autohide'] = "0";
                    break;
                case "always_hide" :
                    params['controls'] = "0";
                    break;
                case "temp_show" :
                    params['autohide'] = "1";
                    break;
                default:
                    break;
            }


            if (isLoop) {
                params['loop'] = "1";
                params['playlist'] = this._options.videoId;
            }
            else {
                params['loop'] = "0";
            }

            params['showinfo'] = (isShowInfo ? "1" : "0");

            params['rel'] = "0";

            return params;
        },

        _getVimeoParams:function () {
            var params = {};
            //Don't autoplay while editing.
            if (this.resources.W.Config.env.isInInteractiveViewer()) {
                params['autoplay'] = this.getIsDisplayed() ? ( this.getComponentProperty('autoplay')) : 0;
            }
            params['loop'] = (this.getComponentProperty('loop'));
            params['byline'] = (this.getComponentProperty('showinfo'));
            params['portrait'] = (this.getComponentProperty('showinfo'));
            params['title'] = (this.getComponentProperty('showinfo'));

            return params;
        },

        _getUrl:function () {
            var url = this._getServices()[ this._options.videoType ]['url'] + this._options.videoId + '?' + this._getPlayerParamsAsQueryString();

            if (!W.Utils.isValidUrl(url)) {
                return '';
            }

            return url;
        },

        _getVideoType:function () {
            return  this._data && this._data.get('videoType');
        },

        _getVideoId:function () {
            return this._data && this._data.get('videoId');
        },

        /* PREVIEW */
        _createPreview:function () {
            var serviceMap = this._getServices();
            var serviceName = this._options.videoType;
            var previewFunction = serviceMap[serviceName]['preview'];

            previewFunction();
        },

        _renderPreviewImage:function (url) {
            var width = this._view.getWidth();
            var height = this._view.getHeight();
            if (this._image) {
                this._updatePreviewImage(url, height, width);
            } else {
                this._createPreviewImage(url, height, width);
            }
        },

        _createPreviewImage:function (url, height, width) {
            this._image = new Image();
            this._image.src = url;
            this._image.setStyles({
                height:height,
                width:width
            });
            this._image.insertInto(this._skinParts.preview);
            this._options.resize.push(this._image);
            this._skinParts.videoFrame.collapse();
            this._skinParts.preview.uncollapse();
        },

        _updatePreviewImage:function (url, height, width) {
            if (this._image.get('src') != url) {
                this._image.set('src', url);
            }
            this._image.setStyles({
                'height':height,
                'width':width
            });

            this._skinParts.videoFrame.collapse();
            this._skinParts.preview.uncollapse();
        },

        _getYouTubePreview:function () {
            var url = 'http://img.youtube.com/vi/[repLace]/0.jpg';
            var strToUrl = url.replace("[repLace]", this._options.videoId);
            this._renderPreviewImage(strToUrl);
        },

        _getViemoPreviewUrl:function () {
            var apiUrl = "http://vimeo.com/api/v2/video/[repLace].json";
            var strToUrl = apiUrl.replace("[repLace]", this._options.videoId);
            var jsonp = new Request.JSONP({
                url:strToUrl + '?' + 'r=' + Math.random(),
                onComplete:this.onVimeoRetrun.bind(this)
            });
            jsonp.send();
        },

        onVimeoRetrun:function (obj) {
            var previewURl = obj && obj[0] && obj[0]['thumbnail_large'];
            this._renderPreviewImage(previewURl);
        }
    });

});