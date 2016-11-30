/**@class wysiwyg.viewer.components.FlickrBadgeWidget */
define.component('wysiwyg.viewer.components.FlickrBadgeWidget', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.utilize(['core.utils.css.Color']);

    def.inherits("mobile.core.components.base.BaseComponent");

    def.skinParts({
        iframe:{type:'htmlElement'},
        overlay:{type:'htmlElement'},
        overlayClick:{type:'htmlElement'}
    });

    def.binds(["_applyThemeColors", "_updateIframeDimensions"]);

    def.states([]);

    def.dataTypes(['FlickrBadgeWidget']);

    def.traits(['wysiwyg.viewer.components.traits.IframeUtils']);

    def.fields({
        _renderTriggers:[
            Constants.DisplayEvents.MOVED_IN_DOM,
            Constants.DisplayEvents.ADDED_TO_DOM,
            Constants.DisplayEvents.DISPLAYED,
            Constants.DisplayEvents.DISPLAY_CHANGED,
            Constants.DisplayEvents.SKIN_CHANGE],

        _backgroundColor:undefined,
        _backgroundAlpha:undefined,
        _borderColor:undefined,
        _borderAlpha:undefined,
        _currentDimensions:{w:-1, h:-1},
        _totalSizeSamplingAttempts:10,
        _sizeSamplingAttemptsCount:0
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings:true,
                design:false
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    /**
     * @lends wysiwyg.viewer.components.FlickrBadgeWidget
     */
    def.methods({
        initialize:function (compId, viewNode, args) {
            args = args || {};
            this.parent(compId, viewNode, args);
            this.addEvent("resizeEnd", this._onResizeEnd);
            this._minimumTimeBetweenRenders = 1000;
            this._disableResizeHandlers();
            this._resizableSides = [];
            this._iframeDimensions = {w:0, h:0};
        },

        _disableResizeHandlers:function () {
            this._resizableSides = [];
        },

        _onStyleReady:function () {
            this.parent();
            this._applyThemeColors({propName:"borderColor"});
            this._applyThemeColors({propName:"backgroundColor"});
            this._style.addEvent(Constants.StyleEvents.PROPERTY_CHANGED, this._applyThemeColors);
        },

        _applyThemeColors:function (changeEvent) {
            var colorClass;
            var newColor;
            var newAlpha;

            for (var propertyId in changeEvent.properties) {
                colorClass = this.injects().Skins.getSkinParamValue(this._skin.className, propertyId, this._style);
                newColor = colorClass.getHex(false);
                newAlpha = colorClass.getAlpha();

                if (propertyId == "borderColor") {
                    this._borderColor = newColor;
                    this._borderAlpha = newAlpha;
                }
                if (propertyId == "backgroundColor") {
                    this._backgroundColor = newColor;
                    this._backgroundAlpha = newAlpha;
                }
            }

            this._tryRender();
        },

        isInvisibleInStaticHtml: function(){
            return true;
        },

        render:function () {
            this._updateFrameSize();
            this._clearFrame();
            this.callLater(this._fillFrame, [], 100);
        },

        _onResizeEnd:function () {
            this._tryRender();
        },

        _clearFrame:function () {
            try{
                var iframe = this._getFrame();
                if (iframe !== undefined) {
                    this.setIFrameSrc(iframe, 'about:blank');
                    var doc = iframe.contentWindow.document || iframe.contentWindow.document;
                    if(doc){
                        iframe.src='javascript:(function () {' +'document.open();document.clear();document.close()' + '})();';
                    }
                }
            }catch(e){}
        },

        _getFrame:function () {
            if (this._skinParts) {
                return this._skinParts.iframe;
            }
            return undefined;
        },

        _getOverlay:function () {
            if (this._skinParts) {
                return this._skinParts.overlayClick;
            }
            return undefined;
        },

        _updateFrameSize:function (w, h) {
            var iframe;
            w = w || this._view.getWidth() - 1;
            h = h || this._view.getHeight() - 1;
            iframe = this._getFrame();
            if (iframe) {
                iframe.set({
                    width:w,
                    height:h
                });
            }
        },

        _fillFrame:function () {
            var params = {};
            var streamURL;
            // TBD: extract default options
            params.userID = this._data.get("userId");
            params.userName = this._data.get("userName");
            params.tag = this._data.get("tag");
            params.imageCount = this._data.get("imageCount");
            params.whichImages = this._data.get("whichImages");
            params.imageSize = this._data.get("imageSize");
            params.layoutOrientation = this._data.get("layoutOrientation");

            var flickrCode = this._getFlickrEmbedCode(params);
            var iframe = this._getFrame();
            if (iframe !== undefined) {
                this.injects().Utils.prepareIFrameForWrite(iframe, function (iframe, doc) {
                    doc.write(flickrCode);
                }.bind(this));
                //iframe.contentDocument.write(flickrCode);
                // Add hit area over the iframe to capture clicks
                streamURL = "http://www.flickr.com/photos/" + params.userID + "/";
                this._getOverlay().set("href", streamURL);
                this._sizeSamplingAttemptsCount = 0;
                this.callLater(this._updateIframeDimensions, [], 1000);
            }
        },

        _updateIframeDimensions:function () {
            this._sizeSamplingAttemptsCount++;
            var currentDimensions = this._sampleIframeDimensions();
            if (currentDimensions) {
                if (currentDimensions.w != this._currentDimensions.w || currentDimensions.h != this._currentDimensions.h) {
                    this._currentDimensions.w = currentDimensions.w;
                    this._currentDimensions.h = currentDimensions.h;
                    this.setWidth(this._currentDimensions.w + 5);
                    this.setHeight(this._currentDimensions.h + 5);
                    this._updateFrameSize(this._currentDimensions.w + 5, this._currentDimensions.h + 5);
                    this._wCheckForSizeChangeAndFireAutoSized(0);
                }
            }
            if (this._sizeSamplingAttemptsCount < this._totalSizeSamplingAttempts) {
                this.callLater(this._updateIframeDimensions, [], 500);
            }
        },

        _sampleIframeDimensions:function () {
            var bodyWidth;
            var bodyHeight;
            var frame = this._getFrame();
            if (frame != undefined) {
                if (Browser.ie) {
                    // For IE we manually calculate the target size from the parameters.
                    // Relevant parameters are: # of images, size of images, layout.
                    // The values used below are magic numbers obtained via trial & error.
                    var dimensionCombo = this._data.get("imageSize") + this._data.get("layoutOrientation");
                    switch (dimensionCombo) {
                        case "sv":
                            bodyWidth = 130;
                            bodyHeight = 83 + this._data.get("imageCount") * 75;
                            break;
                        case "tv":
                            bodyWidth = 130;
                            bodyHeight = 83 + this._data.get("imageCount") * 67;
                            break;
                        case "mv":
                            bodyWidth = 260;
                            bodyHeight = 83 + this._data.get("imageCount") * 160;
                            break;
                        case "sh":
                            bodyWidth = 55 + this._data.get("imageCount") * 75;
                            bodyHeight = 130;
                            break;
                        case "th":
                            bodyWidth = 55 + this._data.get("imageCount") * 100;
                            bodyHeight = 55 + 106;
                            break;
                        case "mh":
                            bodyWidth = 55 + this._data.get("imageCount") * 240;
                            bodyHeight = 55 + 242;
                            break;
                    }
                } else {
                    var innerBody = frame.contentWindow.document.getElementById("flickr_badge_uber_wrapper");
                    if (innerBody) {
                        bodyWidth = innerBody.clientWidth;
                        bodyHeight = innerBody.clientHeight;
                    }
                }
                if (isNaN(bodyWidth) == false && isNaN(bodyHeight) == false) {
                    this._iframeDimensions.w = bodyWidth;
                    this._iframeDimensions.h = bodyHeight;
                }
            }
            return this._iframeDimensions;
        },

        _rgbToHex:function (rgb) {
            var color;
            color = new this.imports.Color(rgb);
            return color.getHex(false);
        },
        _getFlickrEmbedCode:function (params) {
            var tagParam;
            var source;
            var ieStyle = "";

            if (params.tag !== undefined && params.tag !== "") {
                source = "user_tag";
                tagParam = "&tag=" + params.tag;
            }
            else {
                source = "user";
                tagParam = "";
            }
            if (Browser.ie) {
                ieStyle = "a:link{color:" + this._backgroundColor + "}a:visited{color:" + this._backgroundColor + "}";
            }
            return  '<style type="text/css">#flickr_badge_source_txt {padding:0; font: 11px Arial, Helvetica, Sans serif; color:#666666;}' +
                '#flickr_badge_source_txt {padding:0; font: 11px Arial, Helvetica, Sans serif; color:#666666;}' +
                '#flickr_badge_icon {display:block !important; margin:0 !important; border: 1px solid rgb(0, 0, 0) !important;}' +
                '#flickr_icon_td {padding:0 5px 0 0 !important;}' +
                '.flickr_badge_image {text-align:center !important;}' +
                '.flickr_badge_image img {border: 1px solid black !important;}' +
                '#flickr_badge_uber_wrapper {width:150px;}' +
                '#flickr_www {display:block; text-align:center; padding:0 10px 0 10px !important; font: 11px Arial, Helvetica, Sans serif !important; color:#3993ff !important;}' +
                '#flickr_badge_uber_wrapper a:hover,' +
                '#flickr_badge_uber_wrapper a:link,' +
                '#flickr_badge_uber_wrapper a:active,' +
                '#flickr_badge_uber_wrapper a:visited {text-decoration:none !important; background:inherit !important;}' +
                '#flickr_badge_wrapper {opacity: ' + this._backgroundAlpha + ';background-color: ' + this._backgroundColor + ';border: solid 1px ' + this._borderColor + '}' +

                '#flickr_badge_source {padding:0 !important; font: 11px Arial, Helvetica, Sans serif !important; }' +
                'body {overflow: hidden;}' +
                ieStyle +
                '</style>' +
                '<table id="flickr_badge_uber_wrapper" cellpadding="0" cellspacing="10" border="0"><tr><td><a href="http://www.flickr.com" id="flickr_www">www.<strong style="color:#3993ff">flick<span style="color:#ff1c92">r</span></strong>.com</a><table cellpadding="0" cellspacing="10" border="0" id="flickr_badge_wrapper">' +
                '<script type="text/javascript" src="http://www.flickr.com/badge_code_v2.gne?show_name=1&count=' + params.imageCount + '&display=' + params.whichImages + '&size=' + params.imageSize + '&layout=' + params.layoutOrientation + '&source=' + source + '&user=' + params.userID + tagParam + '"></script>' +
                '</table>' +
                '</td>' +
                '</tr>' +
                '</table>' +
                '</td></tr></table>';
        }
    });

});


