define([
    'lodash',
    'coreUtils',
    'layout/specificComponents/bgImageLayout',
    'layout/specificComponents/bgVideoLayout'
], function (_, /** utils */ utils, bgImageLayout, bgVideoLayout) {
    'use strict';

    var consts = utils.balataConsts;
    var containerBackgroundUtils = utils.containerBackgroundUtils;

    var BALATA_PATHS_TO_REQUEST_MEASURE = [
        [consts.BALATA],
        [consts.BALATA, consts.MEDIA],
        [consts.BALATA, consts.MEDIA, consts.IMAGE],
        [consts.BALATA, consts.MEDIA, consts.VIDEO],
        [consts.BALATA, consts.OVERLAY],
        [consts.BALATA, consts.OVERLAY, consts.OVERLAY]
    ];

    function getOneOfValues(measureMap, nodesMap, balataId, valueName, fallbackName) {
        var val = measureMap[valueName][balataId];
        if (_.isNumber(val)) {
            return val;
        }
        val = nodesMap[balataId][fallbackName];
        if (_.isNumber(val)) {
            return val;
        }
        return 0;
    }

    function measureBalata(parentId, measureMap, nodesMap, siteData, structureInfo, parentDimensions) {
        var balataId = getBalataId(parentId);

        var customMeasure = measureMap.custom[balataId] = {};

        var mediaId = balataId + consts.MEDIA;
        var imageId = mediaId + consts.IMAGE;
        var videoId = mediaId + consts.VIDEO;
        var overlayId = balataId + consts.OVERLAY;

        customMeasure.hasBalata = Boolean(nodesMap[balataId]);
        customMeasure.hasMedia = Boolean(nodesMap[mediaId]);
        customMeasure.hasImage = Boolean(nodesMap[imageId]);
        customMeasure.hasVideo = Boolean(nodesMap[videoId]);
        customMeasure.hasOverlay = Boolean(nodesMap[overlayId]);

        if (!customMeasure.hasBalata) {
            return;
        }
        _.forEach(parentDimensions, function (value, key) {
            measureMap[key][balataId] = value;
        });

        measureMap.left[balataId] = getOneOfValues(measureMap, nodesMap, balataId, 'left', 'offsetLeft');
        measureMap.top[balataId] = getOneOfValues(measureMap, nodesMap, balataId, 'top', 'offsetTop');
        measureBalataBackground(balataId, measureMap, nodesMap, structureInfo);
    }

    function measureBalataBackground(balataId, measureMap, nodesMap, structureInfo) {
        var balataData = getBalataData(structureInfo);
        var mediaRef = balataData.mediaRef;
        var customMeasure = measureMap.custom[balataId];
        if (customMeasure.hasImage && mediaRef) {
            bgImageLayout.measureBgImageBalata(balataId, measureMap, nodesMap);
        }
        if (customMeasure.hasVideo && mediaRef && mediaRef.type === 'WixVideo') {
            bgVideoLayout.measureBgVideo(balataId, measureMap, nodesMap);
        }
    }

    function patchBalata(parentId, patchers, measureMap, structureInfo, siteData, parentDimensions, avoidChangingXAxis) {
        var balataId = getBalataId(parentId);

        if (!measureMap.custom[balataId].hasBalata) {
            return;
        }
        var customMeasure = measureMap.custom[balataId];

        var mediaId = balataId + consts.MEDIA;

        var isDesktopDevice = !siteData.isTouchDevice();
        var effectName = containerBackgroundUtils.getBgEffectName(structureInfo.behaviorsItem, isDesktopDevice, siteData.isMobileView());
        var mediaHeight = containerBackgroundUtils.getHeightByEffect(effectName, measureMap, parentDimensions.height);

        var balataStyle = {
            overflow: 'hidden',
            left: parentDimensions.left,
            width: parentDimensions.width,
            clip: 'rect(0px,' + parentDimensions.width + 'px,' +
            parentDimensions.height + 'px,0px)'
        };

        if (avoidChangingXAxis) {
            balataStyle = _.omit(balataStyle, ['left', 'width']);
        }

        patchers.css(balataId, balataStyle);

        if (customMeasure.hasMedia) {
            patchers.css(mediaId, {
                width: parentDimensions.width + 'px',
                left: getLeftPosition(effectName, parentDimensions, siteData),
                height: mediaHeight + 'px'
            });

            patchBalataMedia(balataId, patchers, measureMap, structureInfo, siteData, mediaHeight, parentDimensions);
        }

    }

    function getLeftPosition(effectName, parentMeasures, siteData) {
        if (containerBackgroundUtils.isFullScreenByEffect(effectName, siteData.renderFlags.renderFixedPositionBackgrounds)) {
            return parentMeasures.absoluteLeft || 0;
        }
        return 0;
    }

    function patchBalataMedia(balataId, patchers, measureMap, structureInfo, siteData, mediaHeight, parentDimensions) {
        var mediaId = balataId + consts.MEDIA;
        var imageId = mediaId + consts.IMAGE;
        var customMeasureData = measureMap.custom[balataId];
        var mediaRef = getBalataData(structureInfo).mediaRef;
        if (customMeasureData.hasImage && mediaRef) {
            bgImageLayout.patchBgImage(balataId, imageId, patchers, measureMap, structureInfo, siteData, mediaHeight, parentDimensions);
        }
        if (customMeasureData.hasVideo && mediaRef && mediaRef.type === 'WixVideo') {
            bgVideoLayout.patchBgVideo(balataId, patchers, measureMap, structureInfo, siteData, mediaHeight, parentDimensions);
        }
    }

    function getBalataId(parentId) {
        return parentId + consts.BALATA;
    }

    function getBalataData(structureInfo) {
        if (_.isUndefined(structureInfo.designDataItem)) {
            return structureInfo.dataItem.background;
        }
        return structureInfo.designDataItem.background;
    }

    return {
        BALATA_PATHS_TO_REQUEST_MEASURE: BALATA_PATHS_TO_REQUEST_MEASURE,
        measure: measureBalata,
        patch: patchBalata
    };
});
