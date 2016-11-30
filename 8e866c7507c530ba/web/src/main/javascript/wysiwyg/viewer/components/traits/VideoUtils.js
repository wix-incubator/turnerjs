define.Class('wysiwyg.viewer.components.traits.VideoUtils', function(def){
    def.fields({
        _videoUrl: {
            "YOUTUBE": 'http://youtu.be/',
            "VIMEO": 'http://vimeo.com/'
        },
        _defualtPreviewImagePath: 'images/wysiwyg/core/themes/viewer/video-error.png'
    });

    def.resources(['W.Config']);

    def.methods({
        _getServices:function(){
            var services = {
                "YOUTUBE": {
                    url:'http://www.youtube.com/embed/',
                    getPreviewUrl: this._getYouTubePreviewUrl,
                    _validateImageExists: this._validateImageExists,
                    _defualtPreviewImage: this._getDefaultPreviewImage.bind(this)
                },
                "VIMEO":{
                    url:'http://player.vimeo.com/video/',
                    getPreviewUrl:this._getVimeoPreviewUrl,
                    _validateImageExists: this._validateImageExists,
                    _defualtPreviewImage: this._getDefaultPreviewImage.bind(this)
                }
            };
            return services;
        },
        _getYouTubePreviewUrl:function(videoId, cb){
            var url = 'http://img.youtube.com/vi/[repLace]/0.jpg';
            var strToUrl = url.replace("[repLace]", videoId);

            cb(strToUrl, true);
            return strToUrl;
        },
        _getVimeoPreviewUrl:function(videoId, cb, overrideDefaultImage){
            cb("82866b_e3ffa44812357aa9fe79a33c0a9b67d5.png_400");
            var apiUrl = "http://vimeo.com/api/v2/video/[repLace].json";
            var strToUrl = apiUrl.replace("[repLace]", videoId);
            var defaultImage = overrideDefaultImage || this._defualtPreviewImage();
            var isUrlValid = true;

            var now = new Date().getTime();
            var params = {
                callback: "vimeo_preview"+now.toString(36)
            };
            this._validateImageExists(strToUrl, params, function(res) {
                cb(res[0].thumbnail_large, isUrlValid);
            }, function() {
                cb(defaultImage, !isUrlValid);
            }.bind(this));
        },
        _getYoutubeId: function(url){
            var videoId = '';

            // Test for long youtube url: http://youtube.com/watch?[...&]v=[VIDEO_ID]
            var YTLongUrl = /(?:youtube\.com\/watch[^\s]*[\?&]v=)([\w-]+)/g;
            // Test for short youtube url: http://youtu.be/[VIDEO_ID]
            var YTShortUrl = /(?:youtu\.be\/)([\w-]+)/g;

            var match  = YTLongUrl.exec(url) || YTShortUrl.exec(url);
            if (match && match.length && match[1]){
                //if there is a match, the second group is the id we want
                videoId = match[1];
            }
            return videoId;
        },

        _getVimeoId: function(url){
            var videoId = '';

            var VimeoUrl =  /vimeo\.com\/(\d+)$/gi;

            var match  = VimeoUrl.exec(url);
            if (match && match.length && match[1]){
                //if there is a match, the second group is the id we want
                videoId = match[1];
            }
            return videoId;
        },

        _getVideoDataFromVideoUrl: function(url){
            var videoType = null;

            var videoId =   this._getYoutubeId(url);
            if (videoId){
                videoType = "YOUTUBE";
            } else {
                videoId = this._getVimeoId(url);
                if (videoId){
                    videoType = "VIMEO";
                }
            }

            if (videoId && videoType){
                return {videoId : videoId, videoType: videoType};
            }
            else {
                return {};
            }
        },
        _getVideoUrlFromVideoData: function( videoDataObj ){
            var videoId = videoDataObj.videoId;
            var videoType = videoDataObj.videoType;
            if (!videoId || !videoType) {
                return '';
            }

            return this._videoUrl[ videoType  ] + videoId;
        },

        _getDefaultPreviewImage: function() {
            return this.resources.W.Config.getServiceTopologyProperty("staticSkinUrl") + this._defualtPreviewImagePath;
        },

        _validateImageExists: function(url, params, onSuccess, onFailure) {
            var callbackName = params.callback;
            var qStr = Object.keys(params).length === 0 ? "" : ("?" + Object.toQueryString(params));
            var scriptUrl = url + qStr;
            // Add the callback method to the global scope.
            window[callbackName] = function (data) {
                onSuccess && onSuccess(data);
                delete window[callbackName];
            };

            // Create the script tag for the JSONP request.
            var script = new Element('script', {src: scriptUrl, type: 'text/javascript', charset: "UTF-8"});
            script.onerror = function () {
                onFailure && onFailure.apply(this, arguments);
                delete window[callbackName];
            };

            script.inject(document.head, 'bottom');
        }
    });
});
