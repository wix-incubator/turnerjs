define(['lodash', 'zepto', 'coreUtils/core/stringUtils'], function (_, $, stringUtils) {
    'use strict';

    function getContainerSize(imageWrapperSize, displayerNode) {
        var $node = $(displayerNode);
        var containerWidth = imageWrapperSize.imageWrapperWidth - parseInt($node.attr('data-image-wrapper-right'), 10) - parseInt($node.attr('data-image-wrapper-left'), 10);
        var containerHeight = imageWrapperSize.imageWrapperHeight - parseInt($node.attr('data-image-wrapper-bottom'), 10) - parseInt($node.attr('data-image-wrapper-top'), 10);
        if (stringUtils.isTrue($node.attr('data-margin-to-container'))) {
            containerWidth += imageWrapperSize.imageWrapperMarginLeft + imageWrapperSize.imageWrapperMarginRight;
            containerHeight += imageWrapperSize.imageWrapperMarginTop + imageWrapperSize.imageWrapperMarginBottom;
        }
        return {
            width: containerWidth,
            height: containerHeight
        };
    }

    function updateImageWrapperSizes(patchers, imageWrapperId, sizeAfterScaling) {
        patchers.css(imageWrapperId, {
            "height": sizeAfterScaling.imageWrapperSize.imageWrapperHeight,
            "width": sizeAfterScaling.imageWrapperSize.imageWrapperWidth,
            "marginLeft": sizeAfterScaling.imageWrapperSize.imageWrapperMarginLeft,
            "marginRight": sizeAfterScaling.imageWrapperSize.imageWrapperMarginRight,
            "marginTop": sizeAfterScaling.imageWrapperSize.imageWrapperMarginTop,
            "marginBottom": sizeAfterScaling.imageWrapperSize.imageWrapperMarginBottom
        });
    }

    function updateSkinPropsForFlexibleHeightGallery(gallerySkinProps) {
        var attributesForLayout = {'data-should-add-min-height': true};
        _.assign(gallerySkinProps[""], attributesForLayout);
    }

    function measureFlexibleHeightGallery(id, measureMap, nodesMap) {
        measureMap.height[id] = nodesMap[id].offsetHeight;
        var shouldAddMinHeight = $(nodesMap[id]).data('should-add-min-height');
        if (shouldAddMinHeight) {
            measureMap.minHeight[id] = measureMap.height[id];
        } else {
            delete measureMap.minHeight[id];
        }
    }

    return {
        getContainerSize: getContainerSize,
        updateImageWrapperSizes: updateImageWrapperSizes,
        updateSkinPropsForFlexibleHeightGallery: updateSkinPropsForFlexibleHeightGallery,
        measureFlexibleHeightGallery: measureFlexibleHeightGallery
    };
});
