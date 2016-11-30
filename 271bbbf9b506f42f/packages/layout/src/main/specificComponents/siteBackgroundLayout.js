define(['lodash', 'layout/util/layout', 'imageClientApi', 'layout/util/optimizedCssImageLayout'], function (_, layout, imageClientApi, optimizedCssImageLayout) {
    'use strict';

    var DEFAULT_SIZE = 1920;
    var DEFAULT_MOBILE_SIZE = 1000;


    var SITE_BACKGROUND_CURRENT_IMAGE = 'siteBackgroundcurrentImage';
    function patchSiteBackground(id, patchers, measureMap, structureInfo, siteData) {
        // DO NOT REMOVE THESE MEASURES!!
        // These measures does not access the DOM!
        // must be here, due to dependency between wixAds measure and siteBackground,
        // and because background is loaded before anchors so measure stage is too early.
        // and the fact that enforceAnchors clears the measure for the background anyway :(
        measureMap.top[id] = getBackgroundTopFromWixAds(measureMap);
        measureMap.width[id] = getBackgroundWidth(measureMap, siteData);
        measureMap.height[id] = getBackgroundHeight(measureMap, siteData);

        //TODO: this is a bit dirty, but we need currentImage in the measuremap for parallax animation.
        measureMap.height.currentImage = measureMap.height.masterPage;

        patchers.css(id, {
            'top': measureMap.top[id] + 'px',
            'height': measureMap.height[id] + 'px',
            'width': measureMap.width[id] + 'px'
        });
        var customMeasure = measureMap.custom[id];
        var imageCssData = getCssImageData(customMeasure.bgData, siteData);

        optimizedCssImageLayout.patchCssImage(customMeasure, SITE_BACKGROUND_CURRENT_IMAGE, patchers, imageCssData.css, imageCssData.uri, siteData);

        if (customMeasure.hasVideo) {
            var bgData = customMeasure.bgData;
            var backgroundVideoCss = getBackgroundVideoValues(bgData, measureMap, siteData, customMeasure.quality);
            patchers.css('siteBackgroundcurrentVideo', backgroundVideoCss);
        }

    }

    /**
     * Get BackgroundMedia data item.
     * this will happen also in siteBackground
     * @param siteData
     * @param pageId
     * @returns {*}
     */
    function getBgData(siteData, pageId) {
        var pageData = siteData.getDataByQuery(pageId);
        var device = siteData.isMobileView() ? 'mobile' : 'desktop';
        return pageData.pageBackgrounds[device].ref;
    }


    /**
     *
     * @param bgData
     * @param measureMap
     * @param siteData
     * @param videoQuality
     * @returns {{position: string, minWidth: number, minHeight: number, top: number, left: number}}
     */
    function getBackgroundVideoValues(bgData, measureMap, siteData, videoQuality) {

        var bgStyle = {
            position: 'relative',
            minWidth: 0,
            minHeight: 0,
            top: 0,
            left: 0
        };

        var mediaData = bgData.mediaRef;

        if (_.get(mediaData, 'type') !== 'WixVideo' || siteData.isTouchDevice()) {
            return bgStyle;
        }
        // video height cant exceed screen height (scrollAttachment is fixed)
        var selectedQuality = _.find(mediaData.qualities, {quality: videoQuality});
        var scaleFactor = getVideoFillScale(measureMap.width.screen, measureMap.height.screen, selectedQuality.width, selectedQuality.height);

        var dimension = getVideoDimension(bgData.fittingType, scaleFactor, selectedQuality.width, selectedQuality.height);
        var position = getVideoPosition(bgData.alignType, scaleFactor, dimension, measureMap.width.screen, measureMap.height.screen);


        bgStyle = {
            position: 'relative',
            minWidth: dimension.width,
            minHeight: dimension.height,
            top: position.top,
            left: position.left
        };

        return bgStyle;
    }


    /**
     *
     * @param bgData
     * @param siteData
     * @returns {{backgroundImage: string, backgroundSize: string, backgroundPosition: string, backgroundRepeat: string}}
     */
    function getCssImageData(bgData, siteData) {

        var imageData = bgData.mediaRef;

        var imageCss = {
            backgroundSize: '',
            backgroundPosition: '',
            backgroundRepeat: ''
        };

        var uri = '';

        if (imageData) {
            if (imageData.type === 'WixVideo') {
                imageData = imageData.posterImageRef;
            }
            var src = {id: imageData.uri, width: imageData.width, height: imageData.height};
            var size = siteData.isMobileView() ? DEFAULT_MOBILE_SIZE : DEFAULT_SIZE;

            var targetWidth = Math.min(size, src.width);
            var targetHeight = Math.min(size, Math.round(targetWidth / (src.width / src.height)));
            var target = {width: targetWidth, height: targetHeight, htmlTag: 'bg', alignment: bgData.alignType};
            var imageQualityFilters = _.defaults({quality: 85}, imageData.quality || {});
            var bgDetails = imageClientApi.getData(bgData.fittingType, src, target, imageQualityFilters, siteData.browser);
            uri = bgDetails.uri;


            imageCss = {
                backgroundSize: bgDetails.css.container.backgroundSize,
                backgroundPosition: bgDetails.css.container.backgroundPosition,
                backgroundRepeat: bgDetails.css.container.backgroundRepeat
            };
        }

        return {
            css: imageCss,
            uri: uri
        };
    }

    function getVideoFillScale(containerWidth, containerHeight, videoWidth, videoHeight) {
        return {wScale: containerWidth / videoWidth, hScale: containerHeight / videoHeight};
    }

    function getVideoDimension(fittingType, videoScale, videoWidth, videoHeight) {
        var width, height, scale;
        var fittingTypes = imageClientApi.fittingTypes;
        switch (fittingType) {
            case fittingTypes.SCALE_TO_FILL:
                scale = Math.max(videoScale.wScale, videoScale.hScale);
                width = Math.round(videoWidth * scale);
                height = Math.round(videoHeight * scale);
                break;
            case fittingTypes.SCALE_TO_FIT:
                scale = Math.min(videoScale.wScale, videoScale.hScale);
                width = Math.round(videoWidth * scale);
                height = Math.round(videoHeight * scale);
                break;
        }
        return {width: width, height: height};
    }

    function getVideoPosition(alignType, videoScale, videoSize, containerWidth, containerHeight) {
        var pos = {};
        var alignTypes = imageClientApi.alignTypes;
        switch (alignType) {
            case alignTypes.CENTER:
                pos.left = (videoScale.wScale >= videoScale.hScale) ? 0 : Math.floor((containerWidth - videoSize.width) / 2);
                pos.top = (videoScale.wScale <= videoScale.hScale) ? 0 : Math.floor((containerHeight - videoSize.height) / 2);
                break;
            case alignTypes.LEFT:
                pos.left = 0;
                pos.top = (videoScale.wScale <= videoScale.hScale) ? 0 : Math.floor((containerHeight - videoSize.height) / 2);
                break;
            case alignTypes.RIGHT:
                pos.left = Math.floor(containerWidth - videoSize.width);
                pos.top = (videoScale.wScale <= videoScale.hScale) ? 0 : Math.floor((containerHeight - videoSize.height) / 2);
                break;
            case alignTypes.TOP:
                pos.left = (videoScale.wScale >= videoScale.hScale) ? 0 : Math.floor((containerWidth - videoSize.width) / 2);
                pos.top = 0;
                break;
            case alignTypes.BOTTOM:
                pos.left = (videoScale.wScale >= videoScale.hScale) ? 0 : Math.floor((containerWidth - videoSize.width) / 2);
                pos.top = Math.floor(containerHeight - videoSize.height);
                break;
            case alignTypes.TOP_LEFT:
                pos.left = 0;
                pos.top = 0;
                break;
            case alignTypes.TOP_RIGHT:
                pos.left = Math.floor(containerWidth - videoSize.width);
                pos.top = 0;
                break;
            case alignTypes.BOTTOM_LEFT:
                pos.left = 0;
                pos.top = Math.floor(containerHeight - videoSize.height);
                break;
            case alignTypes.BOTTOM_RIGHT:
                pos.left = Math.floor(containerWidth - videoSize.width);
                pos.top = Math.floor(containerHeight - videoSize.height);
                break;
        }
        return pos;
    }

    function getBackgroundHeight(measureMap, siteData) {
        var siteStructureHeight = measureMap.height[siteData.getStructureCompId()];
        var availableScreenHeight = measureMap.height.screen - getBackgroundTopFromWixAds(measureMap);
        return Math.max(availableScreenHeight, siteStructureHeight);
    }

    function getBackgroundTopFromWixAds(measureMap) {
        var wixAdsHeight = parseInt(measureMap.height.WIX_ADS, 10);
        wixAdsHeight = isNaN(wixAdsHeight) ? 0 : wixAdsHeight;
        var wixAdsTop = parseInt(measureMap.top.WIX_ADS, 10);
        wixAdsTop = isNaN(wixAdsTop) ? 0 : wixAdsTop;
        return wixAdsHeight + wixAdsTop;
    }

    function getBackgroundWidth(measureMap, siteData) {
        var siteStructureWidth = measureMap.width[siteData.getStructureCompId()];
        return Math.ceil(Math.max(measureMap.width.screen, siteStructureWidth));
        // removing this extra pixel fix since its generating wrong with of 321 pixel
        //var mobilePixelFix = siteData.isMobileView() ? 1 : 0;
        //return Math.ceil(Math.max(measureMap.width.screen, siteStructureWidth) + mobilePixelFix);
    }

    function requestBackgroundToMeasureChildren(siteData) {
        return [[siteData.getPrimaryPageId()]];
    }

    function measureSiteBackground(id, measureMap, nodesMap, siteData/*, structureInfo*/) {
        nodesMap[SITE_BACKGROUND_CURRENT_IMAGE] = window.document.querySelector('.siteBackgroundcurrentImage');
        nodesMap.siteBackgroundcurrentVideo = window.document.querySelector('.siteBackgroundcurrentVideo');

        var pageId = siteData.getPrimaryPageId();
        var bgData = getBgData(siteData, pageId);

        var videoNode = nodesMap.siteBackgroundcurrentVideo;
        measureMap.custom[id] = {
            bgData: bgData,
            hasVideo: Boolean(videoNode),
            quality: videoNode && videoNode.getAttribute('data-quality')
        };
        optimizedCssImageLayout.cacheCssImageMeasureData(measureMap.custom[id], nodesMap[SITE_BACKGROUND_CURRENT_IMAGE]);
    }

    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.SiteBackground");
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.SiteBackground", requestBackgroundToMeasureChildren);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.SiteBackground", patchSiteBackground);
    layout.registerCustomMeasure("wysiwyg.viewer.components.SiteBackground", measureSiteBackground);
});
