define([
    'imageClientApi/helpers/utils',
    'imageClientApi/helpers/imageServiceConstants',
    'imageClientApi/helpers/imageServiceUtils',
    'imageClientApi/helpers/imageTransformParts',
    'imageClientApi/helpers/imageTransformOptions',
    'imageClientApi/engines/transforms',
    'imageClientApi/engines/attributes'
], function (utils, constants, imageServiceUtils, transformParts, transformOptions, transforms, attributes) {
    'use strict';

    /**
     * returns image transform uri and the
     * needed css for alignment and positioning
     * @param {string}                  fittingType         imageServicesTypes.fittingTypes
     * @param {ImageTransformSource}    src                 source image
     * @param {ImageTransformTarget}    target              target component
     * @param {ImageTransformOptions}   options           transform options
     *
     * @returns {{uri: string, css: {img: {}, container: {}}} | {uri: string, attr: {img: {}, container: {}}} | {}}
     */
    function getData(fittingType, src, target, options) {
        var data = {},
            fileType = imageServiceUtils.getFileType(src.id),
            fileName = imageServiceUtils.getFileName(src.id),
            fileExtension = imageServiceUtils.getFileExtension(src.id),
            isWEBPSupport = imageServiceUtils.isWEBPBrowserSupport(fileType);

        var transformsObj = {
            fileName: fileName,
            fileExtension: fileExtension,
            fileType: fileType,
            isWEBPSupport: isWEBPSupport,
            fittingType: fittingType,
            src: {
                id: src.id,
                width: src.width,
                height: src.height,
                isCropped: false
            },
            quality: 0,
            progressive: true,
            unsharpMask: {},
            parts: []
        };

        // check if valid request
        if (imageServiceUtils.isValidRequest(fittingType, src, target)) {

            // check if image transformation is applicable (e.g. .gif, .wix_mp)
            if (imageServiceUtils.isImageTransformApplicable(src.id)) {
                transformParts.setTransformParts(transformsObj, src, target);
                transformOptions.setTransformOptions(transformsObj, options);

                // set the uri property
                data.uri = transforms.getImageURI(transformsObj);

            } else {
                data.uri = src.id;
            }

            //set the CSS or the SVG property
            utils.assign(data, attributes.getAttributes(transformsObj, target));

        } else {
            // empty data
            data = constants.emptyData;
        }

        // return data to be used in html
        return data;
    }

    /**
     * @class
     */
    return {
        getData: getData,
        fittingTypes: constants.fittingTypes,
        alignTypes: constants.alignTypes,
        htmlTag: constants.htmlTag
    };

    /**
     * the source image to transform
     * @typedef  {object} ImageTransformSource
     * @property {string}  id           source image uri
     * @property {number}  width        source image width
     * @property {number}  height       source image height
     * @property {object}  [crop]       source image crop values
     * @property {number}  crop.x       crop x
     * @property {number}  crop.y       crop y
     * @property {number}  crop.width   crop width
     * @property {number}  crop.height  crop height
     */

    /**
     * the destination container
     * @typedef  {object}  ImageTransformTarget
     * @property {number}  width                destination container width
     * @property {number}  height               destination container height
     * @property {number}  [pixelAspectRatio]   for retina and mobile displays, 1 (default)
     * @property {string}  [alignment]          how to align the image in the container, imageService.alignTypes  CENTER(default)
     * @property {string}  [htmlTag]            the css style, imageService.htmlTag IMG(default)
     */

    /**
     * the transform options
     * @typedef  {object}   ImageTransformOptions
     * @property {boolean}   [progressive]              image transform progressive
     * @property {number}   [quality]                   image transform quality
     * @property {object}   [unsharpMask]               unsharpMask filter
     * @property {number}   [unsharpMask.radius]        unsharpMask radius
     * @property {number}   [unsharpMask.amount]        unsharpMask amount
     * @property {number}   [unsharpMask.threshold]     unsharpMask threshold
     */

    /**
     * the transform results
     * @typedef {object} ImageTransformResult
     * @property {string} uri the generated image uri, *without* base path
     * @property {object} css CSS properties for the image and it's parent container, empty object for SVG
     * @property {object} css.img CSS for the image element
     * @property {object} css.container CSS for the image container
     * @property {object} attr HTML Attributes for the image and it's parent container, empty object for bg and img types
     * @property {object} attr.img HTML Attributes for the image element
     * @property {object} attr.container HTML Attributes for the image container
     *
     */
});
