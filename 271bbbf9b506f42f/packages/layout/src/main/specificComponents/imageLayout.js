define(['lodash', 'utils', 'layout/util/layout'], function (_, /** utils */ utils, layout) {
    'use strict';

    var IMAGE_REF = 'image';
    var SVG_REF = 'svg';
    var RESIZE_DELAY = 250;

    function getNewImageProperties(id, imageId, svgId, patchers, imageData, containerSize, measureMap, siteData, alignType) {
        var imageComputedProperties;
        var isZoomed = measureMap.custom[id] && measureMap.custom[id].isZoomed;
        var isSvgImage = measureMap.custom[id] && measureMap.custom[id].isSvgImage;
        var filterId = measureMap.custom[id] && measureMap.custom[id].filterId;
        var imageInfo = {
            imageData: imageData,
            containerWidth: isZoomed ? imageData.width : containerSize.width,
            containerHeight: isZoomed ? imageData.height : containerSize.height,
            displayMode: imageData.displayMode,
            alignType: alignType
        };
        if (!imageInfo.containerWidth || !imageInfo.containerHeight || !imageData.uri){
            return null;
        }

        if (measureMap.custom[id].hasSvgNode) {
            imageComputedProperties = utils.imageUtils.getImageComputedProperties(imageInfo, siteData.getMediaFullStaticUrl.bind(siteData), siteData.currentUrl, siteData.mobile.getDevicePixelRatio(), 'svg');
            patchers.css(svgId, {
               width: imageInfo.containerWidth,
               height: imageInfo.containerHeight
            });
            if (isSvgImage) {
                patchers.attr(svgId, imageComputedProperties.attr.container);
                patchers.attr(imageId, imageComputedProperties.attr.img);
                patchers.attr(imageId, {
                    'xlink:href': imageComputedProperties.uri,
                    filter: 'url(#' + filterId + ')'
                });
                return null;
            }
            return imageComputedProperties;
        }
        imageComputedProperties = utils.imageUtils.getImageComputedProperties(imageInfo, siteData.getMediaFullStaticUrl.bind(siteData), siteData.currentUrl, siteData.mobile.getDevicePixelRatio(), 'img');
        return imageComputedProperties;
    }

    function setImageSrc(patchers, imageId, currentSrc, newSrc) {
        if (newSrc && newSrc !== currentSrc) {
            patchers.attr(imageId, {src: newSrc});
        }
    }

    function debounceImageReloadOnResize(siteData, id, patchers, measureMap, imageData, containerSize, alignType) {
        var imageTransformProps = getNewImageProperties(id, id + IMAGE_REF, id + SVG_REF, patchers, imageData, containerSize, measureMap, siteData, alignType);
        patchers.css(id + IMAGE_REF, _.get(imageTransformProps, ['css', 'img']));
        if (!_.has(siteData, ['imageResizeHandlers', id])) {
            //invoke patch immediately, so first layout will run and won't wait
            setImageSrc(patchers, id + IMAGE_REF, measureMap.custom[id].imgSrc, _.get(imageTransformProps, 'uri'));
            _.set(siteData, ['imageResizeHandlers', id], _.debounce(setImageSrc, RESIZE_DELAY, {trailing: true}));
        } else {
            siteData.imageResizeHandlers[id](patchers, id + IMAGE_REF, measureMap.custom[id].imgSrc, _.get(imageTransformProps, 'uri'));
        }
    }

    /**
     *
     * @param id
     * @param patchers
     * @param measureMap
     * @param {core.SiteData} siteData
     * @param imageData
     * @param containerSize
     */
    function patchNodeImage(id, patchers, measureMap, siteData, imageData, containerSize, alignType) {
        patchers.css(id, containerSize);
        debounceImageReloadOnResize(siteData, id, patchers, measureMap, imageData, containerSize, alignType);
    }

    function measureNodeImage(id, measureMap, nodesMap) {
        var filterId,
            isSvgImage = false;
        nodesMap[id + IMAGE_REF] = nodesMap[id].querySelector('img') || nodesMap[id].querySelector('image');
        nodesMap[id + SVG_REF] = nodesMap[id].querySelector('svg');

        // <image> is for SVG IE/Edge fallback
        if (nodesMap[id + IMAGE_REF] && nodesMap[id + IMAGE_REF].nodeName.toLowerCase() === 'image') {
            isSvgImage = true;
            filterId = _.get(nodesMap[id].querySelector('filter'), 'id');
        }
        measureMap.custom[id] = {
            isZoomed: nodesMap[id].getAttribute('data-image-zoomed'),
            isSvgImage: isSvgImage,
            filterId: filterId,
            hasSvgNode: Boolean(nodesMap[id + SVG_REF]),
            imgSrc: nodesMap[id + IMAGE_REF].getAttribute('src')
        };
    }

    layout.registerCustomMeasure('core.components.Image', measureNodeImage);

    return {
        patchNodeImage: patchNodeImage,
        measureNodeImage: measureNodeImage
    };
})
;
