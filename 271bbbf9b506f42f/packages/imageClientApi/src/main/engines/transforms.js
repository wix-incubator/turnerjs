define(['imageClientApi/helpers/utils',
    'imageClientApi/helpers/imageServiceConstants'
], function (utils, constants) {
    'use strict';

    // transform templates
    var fitTemplate = utils.template("fit/w_${width},h_${height}");
    var fillTemplate = utils.template("fill/w_${width},h_${height},al_${alignment}");
    var cropTemplate = utils.template("crop/x_${x},y_${y},w_${width},h_${height}");
    var legacyCropTemplate = utils.template("crop/w_${width},h_${height},al_${alignment}");
    var upscaleTemplate = utils.template(",lg_1");

    // options templates
    var qualityTemplate = utils.template(",q_${quality}");
    var unSharpMaskTemplate = utils.template(",usm_${radius}_${amount}_${threshold}");
    var nonProgressiveTemplate = utils.template(",bl");

    /**
     * returns image transform uri
     * @param {object}  transformsObj
     *
     * @returns {string}
     */
    function getImageURI(transformsObj) {
        // construct image transforms
        var transformsObjStrArr = [];

        // construct transform
        transformsObj.parts.forEach(function (transformPart) {
            switch (transformPart.transformType) {
                case constants.transformTypes.CROP:
                    transformsObjStrArr.push(cropTemplate(transformPart));
                    break;

                case constants.transformTypes.LEGACY_CROP:
                    transformsObjStrArr.push(legacyCropTemplate(transformPart));
                    break;

                case constants.transformTypes.FIT:
                    var fitStr = fitTemplate(transformPart);
                    if (transformPart.upscale) {
                        fitStr += upscaleTemplate(transformPart);
                    }
                    transformsObjStrArr.push(fitStr);
                    break;

                case constants.transformTypes.FILL:
                    var fillStr = fillTemplate(transformPart);
                    if (transformPart.upscale) {
                        fillStr += upscaleTemplate(transformPart);
                    }
                    transformsObjStrArr.push(fillStr);
                    break;
            }
        });

        var transformsStr = transformsObjStrArr.join("/");

        // construct transform options
        // quality
        if ((transformsObj.fileType === constants.fileType.PNG && transformsObj.isWEBPSupport) ||
            transformsObj.fileType === constants.fileType.JPG) {
            transformsStr += qualityTemplate(transformsObj);
        }
        // un-sharp mask
        if (transformsObj.unsharpMask) {
            transformsStr += unSharpMaskTemplate(transformsObj.unsharpMask);
        }
        // progressive
        if (!transformsObj.progressive) {
            transformsStr += nonProgressiveTemplate(transformsObj);
        }

        // image url string
        return transformsObj.src.id + '/' + constants.API_VERSION + '/' + transformsStr + '/' +
            transformsObj.fileName + '.' + (transformsObj.isWEBPSupport ? 'webp' : transformsObj.fileExtension);
    }

    return {
        getImageURI: getImageURI
    };
});
