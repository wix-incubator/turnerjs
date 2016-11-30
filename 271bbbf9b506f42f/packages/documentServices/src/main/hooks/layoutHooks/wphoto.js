define(['lodash', 'utils', 'imageClientApi', 'documentServices/component/component',
    'documentServices/component/componentStylesAndSkinsAPI'], function
    (_, utils, imageClientApi, component, componentStylesAndSkinsAPI) {
    'use strict';

    function parseSkinParams(privateServices, compPointer, skinExports) {
        var paddingLeft = parseInt(componentStylesAndSkinsAPI.skin.getCompSkinParamValue(privateServices, compPointer, 'contentPaddingLeft'), 10) || 0;
        var paddingRight = parseInt(componentStylesAndSkinsAPI.skin.getCompSkinParamValue(privateServices, compPointer, 'contentPaddingRight'), 10) || 0;
        var paddingTop = parseInt(componentStylesAndSkinsAPI.skin.getCompSkinParamValue(privateServices, compPointer, 'contentPaddingTop'), 10) || 0;
        var paddingBottom = parseInt(componentStylesAndSkinsAPI.skin.getCompSkinParamValue(privateServices, compPointer, 'contentPaddingBottom'), 10) || 0;
        var parsedParams = {};
        var contentPaddingLeft = paddingLeft + parseInt(skinExports.contentPaddingLeft || 0, 10);
        var contentPaddingRight = paddingRight + parseInt(skinExports.contentPaddingRight || 0, 10);
        var contentPaddingTop = paddingTop + parseInt(skinExports.contentPaddingTop || 0, 10);
        var contentPaddingBottom = paddingBottom + parseInt(skinExports.contentPaddingBottom || 0, 10);

        parsedParams.contentPaddingHorizontal = contentPaddingLeft + contentPaddingRight;
        parsedParams.contentPaddingVertical = contentPaddingTop + contentPaddingBottom;

        return parsedParams;
    }

    function getImageCompSizeBySkinParams(photoOriginalSize, parsedSkinParams) {
        var width = photoOriginalSize.width - parsedSkinParams.contentPaddingHorizontal,
            height = photoOriginalSize.height - parsedSkinParams.contentPaddingVertical;
        return {
            width: width > 0 ? width : 16,
            height: height > 0 ? height : 16
        };
    }

    function isImageSizeChanged(privateServices, compPointer, newLayout) {
        if (_.isUndefined(newLayout.height) && _.isUndefined(newLayout.width)) {
            return false;
        }
        var layoutPointer = privateServices.pointers.getInnerPointer(compPointer, 'layout');
        var currentLayout = privateServices.dal.get(layoutPointer);
        return (!_.isUndefined(newLayout.height) && newLayout.height !== currentLayout.height) || (!_.isUndefined(newLayout.width) && newLayout.width !== currentLayout.width);
    }

    return function (privateServices, compPointer, /** layoutObject */ newLayout) {

        if (!isImageSizeChanged(privateServices, compPointer, newLayout)) {
            return;
        }
        var compProperties = component.properties.get(privateServices, compPointer);
        var compData = component.data.get(privateServices, compPointer);
        var compLayout = component.layout.get(privateServices, compPointer);
        if (compProperties.displayMode === 'fitWidth') {
            var componentOriginalSize = {
                width: newLayout.width ? newLayout.width : compLayout.width,
                height: newLayout.height ? newLayout.height : compLayout.height
            };
            var imageOriginalSize = {width: compData.width, height: compData.height};
            var parsedSkinParams = parseSkinParams(privateServices, compPointer, componentStylesAndSkinsAPI.skin.getComponentSkinExports);
            if (newLayout.height) {
                var resFitHeight = utils.imageUtils.getContainerSize(
                    getImageCompSizeBySkinParams(componentOriginalSize, parsedSkinParams),
                    imageOriginalSize,
                    imageClientApi.fittingTypes.LEGACY_FIT_HEIGHT);
                newLayout.width = resFitHeight.width + parsedSkinParams.contentPaddingHorizontal;
            } else {
                var resFitWidth = utils.imageUtils.getContainerSize(
                    getImageCompSizeBySkinParams(componentOriginalSize, parsedSkinParams),
                    imageOriginalSize,
                    imageClientApi.fittingTypes.LEGACY_FIT_WIDTH);
                newLayout.height = resFitWidth.height + parsedSkinParams.contentPaddingVertical;
            }
        }
    };
});
