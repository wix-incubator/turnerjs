define(['zepto', 'lodash', "core", "react", 'utils', 'reactDOM', 'santaProps'], function($, _, /** core */ core, React, utils, ReactDOM, santaProps) {
    "use strict";
    var mixins = core.compMixins;

    function getVideoHeight(videoType, showControls, styleHeight) {
        if (styleHeight === "100%") {
            return "100%";
        }
        var services = getServices();
        var minSize = videoType ? services[videoType].hMinSize : 0;
        if (videoType === "YOUTUBE" && showControls === "always_show") {
            minSize += 20;
        }
        return (Math.max(styleHeight, minSize));
    }

    function getVideoWidth(videoType, styleWidth) {
        if (styleWidth === "100%") {
            return "100%";
        }
        var services = getServices();
        var minSize = videoType ? services[videoType].wMinSize : 0;
        return (Math.max(styleWidth, minSize));
    }

    function getServices() {
        return {
            "YOUTUBE": {
                url: '//www.youtube.com/embed/',
                getParams: getYouTubeParams,
                hMinSize: 200,
                wMinSize: 200
            },
            "VIMEO": {
                url: '//player.vimeo.com/video/',
                getParams: getVimeoParams,
                hMinSize: 100,
                wMinSize: 100
            },
            "DAILYMOTION": {
                url: '//www.dailymotion.com/embed/video/',
                getParams: getDailyMotionParams,
                hMinSize: 100,
                wMinSize: 100
            }
        };
    }

    function getYouTubeParams(compProp, compData, isPlayingAllowed) {
        var showControlsOption = compProp.showControls;
        var isFacebookSite = false; // this.resources.W.Config.isFacebookSite();
        var isAutoPlay = compProp.autoplay && !isFacebookSite;
        var enablejsapi = compProp.enablejsapi || 0;

        var isLightTheme = compProp.lightTheme;
        var isLoop = compProp.loop;
        var isShowInfo = compProp.showinfo;
        var playlist = compData.videoId || "";

        return {
            wmode: "transparent",
            autoplay: (isAutoPlay && isPlayingAllowed) ? "1" : "0",
            theme: isLightTheme ? "light" : "dark",
            controls: showControlsOption !== "always_hide" ? "1" : "0",
            autohide: showControlsOption === "temp_show" ? "1" : "0",
            loop: isLoop ? "1" : "0",
            showinfo: isShowInfo ? "1" : "0",
            rel: "0",
            playlist: isLoop ? playlist : false,
            enablejsapi: enablejsapi
        };
    }

    function getVimeoParams(compProp, compData, isPlayingAllowed) {
        return {
            autoplay: compProp.autoplay && isPlayingAllowed,
            loop: compProp.loop,
            byline: compProp.showinfo,
            portrait: compProp.showinfo,
            title: compProp.showinfo
        };
    }

    function getDailyMotionParams(compProp, compData, isPlayingAllowed) {
        return {
            autoplay: compProp.autoplay && isPlayingAllowed,
            'ui-start-screen-info': compProp.showinfo ? '1' : '0',
            controls: compProp.showControls === 'temp_show' ? '1' : '0',
            'sharing-enable': '0',
            'ui-logo': '0'
            //  https://jira.wixpress.com/browse/SE-18956  on some videos on dailymotion requesting 'light' theme doesn't work
            //'ui-theme': compProp.lightTheme ? 'light' : 'dark'
        };
    }


    function getVideoUrl(compData, compProp, isPlayingAllowed) {
        var videoId = compData.videoId;
        var videoType = compData.videoType;
        if (!videoType || !videoId) {
            return "";
        }
        var services = getServices();

        var service = services[videoType];
        var params = service.getParams(compProp, compData, isPlayingAllowed);
        return service.url + videoId + '?' + (_.map(params, function (val, key) {
            return key + "=" + val;
        })).join("&");
    }

    /**
     * @class components.Video
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "Video",
        mixins: [mixins.skinBasedComp],

        statics: {
            useSantaTypes: true
        },
        propTypes: {
            isPlayingAllowed: santaProps.Types.RenderFlags.isPlayingAllowed.isRequired,
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            style: santaProps.Types.Component.style.isRequired
        },
        componentWillMount: function () {
            this.canPlayVideo = this.props.isPlayingAllowed;
        },
        componentDidUpdate: function () {
            if (this.canPlayVideo !== this.props.isPlayingAllowed) {
                this.canPlayVideo = this.props.isPlayingAllowed;
                var videoFrame = $(ReactDOM.findDOMNode(this.refs.videoFrame));
                var videoIframe = videoFrame.find('iframe')[0];
                videoIframe.src = "";
                videoIframe.src = getVideoUrl(this.props.compData, this.props.compProp, this.props.isPlayingAllowed);
            }
        },
        getSkinProperties: function () {
            var videoHeight = getVideoHeight(this.props.compData.videoType, this.props.compProp.showControls, this.props.style.height);
            var videoWidth = getVideoWidth(this.props.compData.videoType, this.props.style.width);
            var videoSrc = getVideoUrl(this.props.compData, this.props.compProp, this.props.isPlayingAllowed);

            var frameProps = {
                height: "100%",
                width: "100%",
                allowFullScreen: true,
                frameBorder: '0'
            };

            if (utils.validationUtils.isValidUrl(videoSrc)) {
                frameProps.src = videoSrc;
            }
            if (this.props.addItemProp) {
                frameProps.itemProp = "image";
            }
            var refData = {
                "": {
                    style: {
                        height: videoHeight,
                        width: videoWidth
                    }
                },
                videoFrame: {
                    children: React.DOM.iframe(frameProps)
                },
                preview: {style: {display: "none"}}
            };

            return refData;
        }
    };
});
