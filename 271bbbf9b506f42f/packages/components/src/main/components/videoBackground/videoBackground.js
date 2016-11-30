define(['lodash', 'core', 'utils', 'backgroundCommon'], function(_, core, utils, backgroundCommon) {
    'use strict';

    function getUrls(videoData, quality, siteData) {
        var urls = {};
        if (!quality) {
            return urls;
        }
        _.forEach(quality.formats, function (format) {
            urls[format] = utils.urlUtils.joinURL(siteData.getStaticVideoUrl(), videoData.videoId, quality.quality, format, 'file.' + format);
        });
        return urls;
    }

    function getVideoControls(videoData) {
        return {
            loop: videoData.loop ? 'loop' : '',
            //autoplay: videoData.autoplay ? 'autoplay' : '',
            muted: videoData.mute ? 'muted' : '',
            //preload: 'none'
            preload: videoData.preload || 'auto'
        };
    }

    /**
     * @class components.videoBackground
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "VideoBackground",
        mixins: [core.compMixins.skinBasedComp, backgroundCommon.mixins.bgVideoMixin],

        componentWillReceiveProps: function (nextProps) {
            if (nextProps.refInParent === 'previousVideo') {
                //un-register current video before it moves to previous CLNT-5061
                this.videoBackgroundAspect.unregisterVideo(this.props.refInParent);
                //this.videoBackgroundAspect.registerVideo(nextProps.refInParent, this.props.parentId, nextProps.compData.id, this.qualityReady, this);
            }
        },

        getDefaultSkinName: function () {
            return 'wysiwyg.viewer.skins.videoBackgroundSkin';
        },

        getSkinProperties: function () {
            var videoData;
            var urls = {};
            var controls = {};
            var selectedQuality;

            if (this.state.active) {
                videoData = this.getVideoData();
                selectedQuality = this.state.videoQuality;
                urls = getUrls(videoData, selectedQuality, this.props.siteData);
                controls = getVideoControls(videoData);
            }

            var compStyle = {
                "": {
                    'data-quality': selectedQuality && selectedQuality.quality,
                    style: {
                        position: 'relative',
                        top: 0,
                        left: 0
                    }
                },
                "video": {
                    loop: controls.loop,
                    autoPlay: controls.autoplay,
                    muted: controls.muted,
                    preload: controls.preload,
                    width: '100%',
                    height: '100%',

                    style: {
                        visibility: 'hidden'
                    }
                },
                "mp4": {
                    src: urls.mp4 || '',
                    type: 'video/mp4'
                },
                "webm": {
                    src: urls.webm || '',
                    type: 'video/webm'

                }

            };

            return compStyle;
        }
    };
});
