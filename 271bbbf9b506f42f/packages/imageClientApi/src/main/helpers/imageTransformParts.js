define([
    'imageClientApi/helpers/utils',
    'imageClientApi/helpers/imageServiceConstants',
    'imageClientApi/helpers/imageServiceUtils'
], function (utils, constants, imageServiceUtils) {
    'use strict';

    /**
     * request analysis, returns parsed transforms object
     * @param {object}                  transformsObj
     * @param {ImageTransformSource}    src
     * @param {ImageTransformTarget}    target
     */
    function setTransformParts(transformsObj, src, target) {
        var rect;

        // crop source image if needed
        // set crop part and adjust source dimensions
        if (src.crop) {
            rect = imageServiceUtils.getOverlappingRect(src, src.crop);
            if (rect) {
                transformsObj.src.width = rect.width;
                transformsObj.src.height = rect.height;
                transformsObj.src.cropped = true;
                transformsObj.parts.push(getCropPart(rect));
            }

        }

        // set additional transform part
        switch (transformsObj.fittingType) {
            case constants.fittingTypes.SCALE_TO_FIT:
            case constants.fittingTypes.LEGACY_FIT_WIDTH:
            case constants.fittingTypes.LEGACY_FIT_HEIGHT:
            case constants.fittingTypes.LEGACY_FULL:
            case constants.fittingTypes.FIT_AND_TILE:
            case constants.fittingTypes.LEGACY_BG_FIT_AND_TILE:
            case constants.fittingTypes.LEGACY_BG_FIT_AND_TILE_HORIZONTAL:
            case constants.fittingTypes.LEGACY_BG_FIT_AND_TILE_VERTICAL:
            case constants.fittingTypes.LEGACY_BG_NORMAL:
                // fit
                transformsObj.parts.push(getFitPart(transformsObj, target));
                break;

            case constants.fittingTypes.SCALE_TO_FILL:
                // fill
                transformsObj.parts.push(getFillPart(transformsObj, target));
                break;

            case constants.fittingTypes.STRETCH:
                // stretch
                transformsObj.parts.push(getStretchPart(transformsObj, target));
                break;

            case constants.fittingTypes.TILE_HORIZONTAL:
            case constants.fittingTypes.TILE_VERTICAL:
            case constants.fittingTypes.TILE:
            case constants.fittingTypes.LEGACY_ORIGINAL_SIZE:
            case constants.fittingTypes.ORIGINAL_SIZE:
                // use crop transform
                // if crop of source image was requested adjust cropping rectangle
                rect = imageServiceUtils.getAlignedRect(transformsObj.src, target, target.alignment);
                if (transformsObj.src.isCropped) {
                    utils.assign(transformsObj.parts[0], rect);

                    // update source width & height accordingly
                    transformsObj.src.width = rect.width;
                    transformsObj.src.height = rect.height;
                } else {
                    transformsObj.parts.push(getCropPart(rect));
                }
                break;

            // ---------------------------------------------------------------------------------------
            // handles a legacy bug on bgImageStrip, background html tag
            // component Full Width Strip stored incorrect image source width and height
            // ---------------------------------------------------------------------------------------
            case constants.fittingTypes.LEGACY_STRIP_TILE_HORIZONTAL:
            case constants.fittingTypes.LEGACY_STRIP_TILE_VERTICAL:
            case constants.fittingTypes.LEGACY_STRIP_TILE:
            case constants.fittingTypes.LEGACY_STRIP_ORIGINAL_SIZE:
                // crop request of source image is not supported
                // use legacy crop
                transformsObj.parts.push(getLegacyCropPart(target));
                break;

            case constants.fittingTypes.LEGACY_STRIP_SCALE_TO_FIT:
            case constants.fittingTypes.LEGACY_STRIP_FIT_AND_TILE:
                // legacy fit
                transformsObj.parts.push(getLegacyFitPart(target));
                break;

            case constants.fittingTypes.LEGACY_STRIP_SCALE_TO_FILL:
                // legacy fill
                transformsObj.parts.push(getLegacyFillPart(target));
                break;
        }
    }

    /**
     * returns fit part of the image transform uri
     * @param {object}                  transformsObj
     * @param {ImageTransformTarget}    target
     *
     * @returns {object}
     */
    function getFitPart(transformsObj, target) {
        // calculate the transformed image size needed
        var transformedData = imageServiceUtils.getCalculatedTransformedData(transformsObj.src.width, transformsObj.src.height, target, constants.transformTypes.FIT);

        // return fit transform data
        return {
            transformType: constants.transformTypes.FILL,
            width: Math.round(transformedData.width),
            height: Math.round(transformedData.height),
            alignment: constants.alignTypesMap.center,
            upscale: transformedData.scaleFactor > 1,

            forceUSM: false,
            scaleFactor: transformedData.scaleFactor,
            cssUpscaleNeeded: transformedData.cssUpscaleNeeded
        };
    }

    /**
     * returns fill part of the image transform uri
     * @param {object}                  transformsObj
     * @param {ImageTransformTarget}    target
     *
     * @returns {object}                {transformType, width, height, alignment, upscale, scaleFactor}
     */
    function getFillPart(transformsObj, target) {
        // calculate the transformed image size needed
        var transformedData = imageServiceUtils.getCalculatedTransformedData(transformsObj.src.width, transformsObj.src.height, target, constants.transformTypes.FILL);

        // return fill transform data
        return {
            transformType: constants.transformTypes.FILL,
            width: Math.round(transformedData.width),
            height: Math.round(transformedData.height),
            alignment: imageServiceUtils.getAlignment(target),
            upscale: transformedData.scaleFactor > 1,

            forceUSM: false,
            scaleFactor: transformedData.scaleFactor,
            cssUpscaleNeeded: transformedData.cssUpscaleNeeded
        };
    }

    /**
     * returns fill part of the image transform uri
     * @param {object}                  transformsObj
     * @param {ImageTransformTarget}    target
     *
     * @returns {object}
     */
    function getStretchPart(transformsObj, target) {
        // stretch data
        var scaleFactor = imageServiceUtils.getScaleFactor(transformsObj.src.width, transformsObj.src.height, target.width, target.height, constants.transformTypes.FILL);
        var clonedTarget = utils.assign({}, target);
        clonedTarget.width = transformsObj.src.width * scaleFactor;
        clonedTarget.height = transformsObj.src.height * scaleFactor;

        // return stretch part
        return getFitPart(transformsObj, clonedTarget);
    }

    /**
     * returns crop part of the image transform uri
     * @param {Object}  rect     x, y, width, height
     *
     * @returns {object}
     */
    function getCropPart(rect) {
        // crop data
        return {
            transformType: constants.transformTypes.CROP,
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            upscale: false,

            forceUSM: false,
            scaleFactor: 1,
            cssUpscaleNeeded: false
        };
    }

    // ---------------------------------------------------------------------------------------
    // handles a legacy bug on bgImageStrip, background html tag
    // component Full Width Strip stored incorrect image source width and height
    // ---------------------------------------------------------------------------------------

    /**
     * returns fit part of the image transform uri
     * @param {ImageTransformTarget}    target
     *
     * @returns {object}
     */
    function getLegacyFitPart(target) {
        // return fit part
        return {
            transformType: constants.transformTypes.FIT,
            width: Math.round(target.width),
            height: Math.round(target.height),
            upscale: false,

            forceUSM: true,
            scaleFactor: 1,
            cssUpscaleNeeded: false
        };
    }


    /**
     * returns fill part of the image transform uri
     * @param {ImageTransformTarget}    target
     *
     * @returns {object}
     */
    function getLegacyFillPart(target) {
        // return fill part
        return {
            transformType: constants.transformTypes.FILL,
            width: Math.round(target.width),
            height: Math.round(target.height),
            alignment: imageServiceUtils.getAlignment(target),
            upscale: false,

            forceUSM: true,
            scaleFactor: 1,
            cssUpscaleNeeded: false
        };
    }

    /**
     * returns legacy crop part of the image transform uri
     * @param {ImageTransformTarget}     target
     *
     * @returns {object}
     */
    function getLegacyCropPart(target) {
        // return crop part
        return {
            transformType: constants.transformTypes.LEGACY_CROP,
            width: Math.round(target.width),
            height: Math.round(target.height),
            alignment: imageServiceUtils.getAlignment(target),
            upscale: false,

            forceUSM: false,
            scaleFactor: 1,
            cssUpscaleNeeded: false
        };
    }


    return {
        setTransformParts: setTransformParts
    };
});
