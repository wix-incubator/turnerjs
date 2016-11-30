define([
    'backgroundCommon/mixins/bgVideoMixin',
    'backgroundCommon/mixins/backgroundDetectionMixin',
    'backgroundCommon/components/bgImage',
    'backgroundCommon/components/bgMedia',
    'backgroundCommon/components/bgOverlay',
    'backgroundCommon/components/bgVideo'],
    function(
        bgVideoMixin,
        backgroundDetectionMixin,
        bgImage,
        bgMedia,
        bgOverlay,
        bgVideo) {
    'use strict';

    return {
        mixins: {
            bgVideoMixin: bgVideoMixin,
            backgroundDetectionMixin: backgroundDetectionMixin
        },
        components: {
            bgImage: bgImage,
            bgMedia: bgMedia,
            bgOverlay: bgOverlay,
            bgVideo: bgVideo
        }
    };
});
