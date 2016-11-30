define(['zepto', 'lodash', 'coreUtils', 'imageClientApi'], function ($, _, utils, imageClientApi) {
    'use strict';

    var containerUtils = utils.containerBackgroundUtils;
    var balataConsts = utils.balataConsts;

    /**
     *
     * @param bgData
     * @param compMeasure
     * @param siteData
     * @param videoQuality
     * @returns {{position: string, minWidth: number, minHeight: number, top: number, left: number}}
     * @param effectName
     */
    function getBackgroundVideoValues(bgData, compMeasure, siteData, videoQuality, effectName) {

        var bgStyle = {
            position: 'relative',
            minWidth: 0,
            minHeight: 0,
            top: 0,
            left: 0
        };

        var mediaData = bgData.mediaRef;

        if (!mediaData || mediaData.type !== 'WixVideo' || siteData.isTouchDevice()) {
            return bgStyle;
        }

        var selectedQuality = _.find(mediaData.qualities, {quality: videoQuality});
        var scaleFactor = getVideoFillScale(compMeasure.width, compMeasure.height, selectedQuality.width, selectedQuality.height);

        var dimension = getVideoDimension(bgData.fittingType, scaleFactor, selectedQuality.width, selectedQuality.height);
        var position = getVideoPosition(bgData.alignType, scaleFactor, dimension, compMeasure);


        bgStyle = {
            position: 'relative',
            minWidth: dimension.width,
            minHeight: dimension.height,
            left: position.left,
            top: containerUtils.isFullScreenByEffect(effectName, siteData.renderFlags.renderFixedPositionBackgrounds) ? '' : position.top
        };

        return bgStyle;
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

    function getVideoPosition(alignType, videoScale, videoSize, videoContainerSize) {
        var containerWidth = videoContainerSize.width;
        var containerHeight = videoContainerSize.compRootHeight;
        var pos = {};
        var alignTypes = imageClientApi.alignTypes;
        switch (alignType) {
            case alignTypes.CENTER:
                pos.left = (videoScale.wScale >= videoScale.hScale) ? 0 : ((containerWidth - videoSize.width) / 2);
                pos.top = (videoScale.wScale <= videoScale.hScale) ? 0 : ((containerHeight - videoSize.height) / 2);
                break;
            case alignTypes.LEFT:
                pos.left = 0;
                pos.top = (videoScale.wScale <= videoScale.hScale) ? 0 : ((containerHeight - videoSize.height) / 2);
                break;
            case alignTypes.RIGHT:
                pos.left = (containerWidth - videoSize.width);
                pos.top = (videoScale.wScale <= videoScale.hScale) ? 0 : ((containerHeight - videoSize.height) / 2);
                break;
            case alignTypes.TOP:
                pos.left = (videoScale.wScale >= videoScale.hScale) ? 0 : ((containerWidth - videoSize.width) / 2);
                pos.top = 0;
                break;
            case alignTypes.BOTTOM:
                pos.left = (videoScale.wScale >= videoScale.hScale) ? 0 : ((containerWidth - videoSize.width) / 2);
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

    function getUrl(mediaData, quality, siteData) {
        var urls = '';
        if (!quality) {
            return urls;
        }
        return utils.urlUtils.joinURL(siteData.getStaticVideoUrl(), mediaData.videoId, quality, 'mp4', 'file.mp4');
    }

    function getBgData(structureInfo) {
        if (structureInfo.designDataItem && structureInfo.designDataItem.background) {
            return structureInfo.designDataItem.background;
        }
        return structureInfo.dataItem.background;
    }

    function patchBgVideo(parentId, patchers, measureMap, structureInfo, siteData, videoHeight, parentDimensions) {
        var id = parentId + balataConsts.MEDIA + balataConsts.VIDEO;
        var bgData = getBgData(structureInfo);
        var isDesktopDevice = !siteData.isTouchDevice();
        var effectName = containerUtils.getBgEffectName(structureInfo.behaviorsItem, isDesktopDevice, siteData.isMobileView());

        var width = parentDimensions.width;
        var height = parentDimensions.height;

        var customMeasure = measureMap.custom[id];
        var quality = customMeasure.quality;

        var videoStyleAndPosition = getBackgroundVideoValues(bgData, {
            width: width,
            height: videoHeight,
            compRootHeight: height
        }, siteData, quality, effectName);

        patchers.attr(id + 'video', {'width': videoStyleAndPosition.minWidth});
        patchers.attr(id + 'video', {'height': videoStyleAndPosition.minHeight});
        patchers.css(id + 'video', videoStyleAndPosition);

        var url = getUrl(bgData.mediaRef, quality, siteData);

        if (customMeasure.src !== url) {
            patchers.attr(id + 'mp4', {src: url});
            customMeasure.videoNode.load();
        }
    }

    function measureBgVideo(parentId, measureMap, nodesMap){
        var id = parentId + balataConsts.MEDIA + balataConsts.VIDEO;
        var videoWrapper = nodesMap[id];
        var videoNode = nodesMap[id + 'video'] = videoWrapper.firstChild;
        var videoSource = nodesMap[id + 'mp4'] = videoNode.firstChild;

        measureMap.custom[id] = {
            quality: $(videoWrapper).data('quality'),
            src: videoSource.src,
            videoNode: videoNode
        };
    }

    return {
        patchBgVideo: patchBgVideo,
        measureBgVideo: measureBgVideo
    };
});
