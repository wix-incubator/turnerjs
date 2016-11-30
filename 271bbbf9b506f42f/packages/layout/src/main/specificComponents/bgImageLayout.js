define([
    'zepto',
    'lodash',
    'layout/util/layout',
    'coreUtils',
    'imageClientApi',
    'layout/util/optimizedCssImageLayout',
    'layout/specificComponents/imageLayout'
], function ($, _, layout, utils, imageClientApi, optimizedCssImageLayout, imageLayout) {
    'use strict';

    var balataConsts = utils.balataConsts;

    function isEmptyOrExternalUri(uri) {
        return !uri || utils.urlUtils.isExternalUrl(uri);
    }

    function getImageTransformData(fittingType, alignType, imageData, targetDimensions, siteData, htmlTag) {
        var pixelAspectRatio = siteData.mobile.getDevicePixelRatio();
        var target = {
            width: targetDimensions.width,
            height: targetDimensions.height,
            alignment: alignType,
            htmlTag: htmlTag || 'bg',
            pixelAspectRatio: pixelAspectRatio
        };
        var src = {id: imageData.uri, width: imageData.width, height: imageData.height};
        var imageQualityFilters = _.defaults({quality: 85}, imageData.quality || {});
        return imageClientApi.getData(fittingType, src, target, imageQualityFilters, siteData.browser);
    }

    function measureLegacyBgImageStrip(id, measureMap, nodesMap/*, siteData, structureInfo*/) {
        var legacyBgImageId = id + 'bg';
        if (!nodesMap[legacyBgImageId]) {
            return;
        }
        measureMap.custom[id] = {};
        optimizedCssImageLayout.cacheCssImageMeasureData(measureMap.custom[id], nodesMap[legacyBgImageId]);
    }

    function measureBgImageBalata(balataNodeId, measureMap, nodesMap) {
        var imageCompNodeId = balataNodeId + balataConsts.MEDIA + balataConsts.IMAGE;
        var nodeType = nodesMap[imageCompNodeId].getAttribute('data-type');
        measureMap.custom[balataNodeId] = measureMap.custom[balataNodeId] || {};
        measureMap.custom[balataNodeId].type = nodeType;

        if (nodeType === balataConsts.IMAGE) {
            imageLayout.measureNodeImage(imageCompNodeId, measureMap, nodesMap);
        } else {
            var innerImageId = imageCompNodeId + 'image';
            //TODO: innerImageId should be added to node map (balata)
            nodesMap[innerImageId] = $(nodesMap[imageCompNodeId]).find('#' + innerImageId)[0];
            var innerImageNode = nodesMap[innerImageId];
            measureMap.custom[imageCompNodeId] = {};
            optimizedCssImageLayout.cacheCssImageMeasureData(measureMap.custom[imageCompNodeId], innerImageNode);

        }
    }

    function getImageProperties(balataData, nodeType, parentDimensions, innerImageHeight, siteData) {

        var width = parentDimensions.width;
        var height = innerImageHeight || parentDimensions.height;

        var imageData = getImageData(balataData);
        if (!imageData || isEmptyOrExternalUri(imageData.uri)) {
            return;
        }
        var fittingType = balataData.fittingType;
        var alignType = balataData.alignType;
        return getImageTransformData(fittingType, alignType, imageData, {
            width: width,
            height: height
        }, siteData, nodeType);

    }

    function patchBgImage(balataNodeId, imageCompNodeId, patchers, measureMap, structureInfo, siteData, innerImageHeight, parentDimensions) {

        var nodeType = measureMap.custom[balataNodeId].type;
        var balataData = getBalataData(structureInfo);
        if (nodeType === balataConsts.IMAGE) {

            var containerSize = {
                width: parentDimensions.width,
                height: innerImageHeight
            };

            var imageData = _.assign({displayMode: balataData.fittingType}, getImageData(balataData));

            imageLayout.patchNodeImage(imageCompNodeId, patchers, measureMap, siteData, imageData, containerSize, balataData.alignType);
        } else {
            var innerImageId = imageCompNodeId + 'image';
            var imageTransformData = getImageProperties(balataData, 'bg', parentDimensions, innerImageHeight, siteData);
            var cssValues = _.assign({height: innerImageHeight}, imageTransformData.css.container);
            optimizedCssImageLayout.patchCssImage(measureMap.custom[imageCompNodeId], innerImageId, patchers, cssValues, imageTransformData.uri, siteData);
        }
    }


    function getBalataData(structureInfo) {
        if (_.isUndefined(structureInfo.designDataItem)) {
            return structureInfo.dataItem.background;
        }
        return structureInfo.designDataItem.background;
    }

    function getImageData(balataData) {
        var imageData = balataData.mediaRef;
        // If media is not image but video, go another level deeper to posterImage
        if (imageData && imageData.type === 'WixVideo') {
            imageData = imageData.posterImageRef;
        }
        return imageData;
    }

    function patchLegacyBgImageStrip(id, patchers, measureMap, structureInfo, siteData, parentDimensions) {
        var customMeasureData = measureMap.custom[id];
        var legacyBgImageId = id + 'bg';
        if (customMeasureData) {
            var imageData = structureInfo.dataItem;
            if (!imageData || isEmptyOrExternalUri(imageData.uri)) {
                return;
            }
            var fittingType = structureInfo.propertiesItem.fittingType;
            var alignType = structureInfo.propertiesItem.alignType;
            var imageTransformData = getImageTransformData(fittingType, alignType, imageData, parentDimensions, siteData);
            optimizedCssImageLayout.patchCssImage(customMeasureData, legacyBgImageId, patchers, imageTransformData.css.container, imageTransformData.uri, siteData);
        }
    }

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.background.bgImage', [['image']]);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.BgImageStrip", [["bg"]]);

    return {
        measureLegacyBgImageStrip: measureLegacyBgImageStrip,
        measureBgImageBalata: measureBgImageBalata,
        patchBgImage: patchBgImage,
        patchLegacyBgImageStrip: patchLegacyBgImageStrip
    };
})
;
