define([
    'imageClientApi/helpers/utils',
    'imageClientApi/helpers/imageServiceConstants',
    'imageClientApi/helpers/imageServiceUtils'
], function (utils, constants, imageServiceUtils) {
    'use strict';

    /**
     * returns image filters part of the image transform uri
     * @param {object}                  transformsObj    transform parts object
     * @param {ImageTransformOptions}   options
     */
    function setTransformOptions(transformsObj, options) {
        options = options || {};

        transformsObj.quality = getQuality(transformsObj, options);
        transformsObj.unsharpMask = getUnsharpMask(transformsObj, options);
        transformsObj.progressive = getProgressive(options);
    }

    /**
     * returns progressive if required
     * @param {ImageTransformOptions}   options
     *
     * @returns {boolean}
     */
    function getProgressive(options) {
        return options.progressive !== false;
    }

    /**
     * returns image filters part of the image transform uri
     * @param {object}                  transformsObj    transform parts object
     * @param {ImageTransformOptions}   options
     *
     * @returns {number}
     */
    function getQuality(transformsObj, options) {
        var transformData = utils.last(transformsObj.parts);

        var defaultQuality = imageServiceUtils.getPreferredImageQuality(transformData.width, transformData.height);
        var quality = options.quality && (options.quality >= 0 && options.quality <= 100) ? options.quality : defaultQuality;

        // return quality
        return parseInt(quality, 10);
    }

    /**
     * returns the desired transformed image unSharpMask values
     * @param {object}                  transformsObj    transform parts object
     * @param {ImageTransformOptions}   options
     *
     * @returns {object}
     */
    function getUnsharpMask(transformsObj, options) {
        // construct usm values
        var usm;

        // If options.unsharpMask is a valid value, use it
        if (isUSMValid(options.unsharpMask)) {
            usm = {
                radius: options.unsharpMask.radius,
                amount: options.unsharpMask.amount,
                threshold: options.unsharpMask.threshold
            };
        // if options.unsharpMask is not all zeros and not valid and usm should be used, use default
        } else if (!isZeroUSM(options.unsharpMask)) {
            if (isUSMNeeded(transformsObj)) {
                usm = constants.defaultUSM;
            }
        }
        // If we got usm, change values to have trailing zeros (.00), else return undefined
        if (usm) {
            usm.radius = roundToFixed(usm.radius, 2);
            usm.amount = roundToFixed(usm.amount, 2);
            usm.threshold = roundToFixed(usm.threshold, 2);
        }

        return usm;
    }

    /**
     * indicates if usm is needed
     * @param {object}      transformsObj   transform parts object
     *
     * @returns {boolean}
     */
    function isUSMNeeded(transformsObj) {
        // ---------------------------------------------------------------------------------------
        // do not apply usm if transformed image width & height is same as source image or larger
        // and no force usm is desired
        // ---------------------------------------------------------------------------------------
        var transformPart = utils.last(transformsObj.parts);
        var upscale = transformPart.scaleFactor >= 1;

        // return if usm is needed
        return !upscale || transformPart.forceUSM;
    }


    /**
     * indicates if all usm values are presented and in range
     * @param {object}  usm     unsharp mask
     *
     * @returns {boolean}
     */
    function isUSMValid(usm) {
        usm = usm || {};
        var radius = typeof usm.radius !== 'undefined' && (usm.radius >= 0.1 && usm.radius <= 500);
        var amount = typeof usm.amount !== 'undefined' && (usm.amount >= 0 && usm.amount <= 10);
        var threshold = typeof usm.threshold !== 'undefined' && (usm.threshold >= 0 && usm.threshold <= 255);

        // return is a valid USM data
        return radius && amount && threshold;
    }

    /**
     * indicates if all usm values are presented and are zero. an explicit request to not apply usm
     * @param {object}  usm     unsharp mask
     *
     * @returns {boolean}
     */
    function isZeroUSM(usm) {
        usm = usm || {};
        return (typeof usm.radius !== 'undefined' && usm.radius === 0) &&
            (typeof usm.amount !== 'undefined' && usm.amount === 0) &&
            (typeof usm.threshold !== 'undefined' && usm.threshold === 0);

    }

    /**
     * rounds number n digit precision and converts to string
     * @param {number}      value
     * @param {number}      precision
     *
     * @returns {string}
     */
    function roundToFixed(value, precision) {
        var truncatePrecision = Math.pow(10, precision || 0);
        return ((value * truncatePrecision) / truncatePrecision).toFixed(parseInt(precision, 10));
    }

    return {
        setTransformOptions: setTransformOptions
    };
});
