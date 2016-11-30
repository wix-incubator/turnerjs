define(['lodash', 'previewExtensionsCore', 'utils', 'wixappsClassics'], function (_, previewExtensionsCore, utils, wixappsClassics) {

    'use strict';

    var blogAppPartNames = utils.blogAppPartNames;

    function showPreviewTooltip(evt) {
        var previewTooltipCallback = this.partApi.getSiteData().renderRealtimeConfig.previewTooltipCallback;

        if (previewTooltipCallback) {
            previewTooltipCallback(evt.target.getBoundingClientRect(), "PREVIEW_TOOLTIP_GOTO_LIVE_SITE");
        }
    }

    function isReady() {
        var post = wixappsClassics.blogSinglePostPageLogicUtils.getSinglePost(this.partApi);
        if (!_.isEmpty(post)) {
            post = wixappsClassics.blogSinglePostPageLogicUtils.transformPostIfPreview.call(this, post, this.partApi);
            wixappsClassics.blogSinglePostPageLogicUtils.updatePageTitleAndMetaTags.call(this, post, this.partApi);
        }
        return true;
    }

    previewExtensionsCore.registrar.registerLogicExtension(blogAppPartNames.SINGLE_POST, {
        toggleLikeForPost: showPreviewTooltip,
        sharePost: showPreviewTooltip,
        isReady: isReady
    });

});
