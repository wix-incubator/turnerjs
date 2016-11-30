define([
    'imageClientApi/helpers/utils',
    'imageClientApi/helpers/imageServiceConstants',
    'imageClientApi/helpers/imageServiceFeatureSupportObject',
    'experiment'
], function (utils, constants, globalFeatureSupportObject, experiment) {
    'use strict';

    /**
     * Check once for browser support and store on global features support object
     * https://developers.google.com/speed/webp/faq#how_can_i_detect_browser_support_using_javascript
     */
    function checkWEBPSupport(type) {
        var webpTypes = {
            lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
            lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
            alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
            animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
        };

        var webpImg = new window.Image();
        webpImg.onload = function () {
            var isWebpFeature = globalFeatureSupportObject.getFeature('isWEBP');
            isWebpFeature[type] = (webpImg.width > 0) && (webpImg.height > 0);
            globalFeatureSupportObject.setFeature('isWEBP', isWebpFeature);
        };

        webpImg.src = "data:image/webp;base64," + webpTypes[type];
    }

    /**
     * Populate the global feature support object with browser specific values
     */
    function populateGlobalFeatureSupport() {
        if (typeof window !== 'undefined') {
            // jpg 2 webp
            if (experiment.isOpen('sv_webpJPGSupport')) {
                checkWEBPSupport(constants.webp.LOSSY);
            }
            // png 2 webp
            if (experiment.isOpen('sv_webpPNGSupport')) {
                checkWEBPSupport(constants.webp.LOSSLESS);
                checkWEBPSupport(constants.webp.ALPHA);
            }
            // 2 animation
            checkWEBPSupport(constants.webp.ANIMATION);

            // objectfit support
            globalFeatureSupportObject.setFeature('isObjectFitBrowser', isPropertySupported('objectFit'));
        }
    }

    populateGlobalFeatureSupport();

    /**
     * check if the browser supports webp image display
     * for the image source type
     * @param {string}    fileType
     *
     * @returns {boolean}
     */
    function isWEBPBrowserSupport(fileType) {
        var isWebpFeature = globalFeatureSupportObject.getFeature('isWEBP');
        var isLosssyJPG = fileType === constants.fileType.JPG && isWebpFeature[constants.webp.LOSSY];
        var isLosslessPNG = fileType === constants.fileType.PNG && isWebpFeature[constants.webp.LOSSLESS];
        var isAlphaPNG = fileType === constants.fileType.PNG && isWebpFeature[constants.webp.ALPHA];

        return isLosssyJPG || (isLosslessPNG && isAlphaPNG);
    }

    /**
     * check if the browser supports ObjectFit css attribute
     *
     * @returns {boolean}
     */
    function isObjectFitBrowserSupport() {
        return globalFeatureSupportObject.getFeature('isObjectFitBrowser');
    }

    /**
     * returns if a css property is supported
     * @param property
     *
     * @returns {boolean}
     */
    function isPropertySupported(property) {
        return property in window.document.documentElement.style;
    }

    /**
     * checks if image type is supported
     * @param {string}     uri      image source uri
     *
     * @returns {boolean}
     */
    function isImageTypeSupported(uri) {
        var supportedImageExtensions = [
            constants.fileType.PNG,
            constants.fileType.JPEG,
            constants.fileType.JPG,
            constants.fileType.WIX_ICO_MP,
            constants.fileType.WIX_MP
        ];
        return utils.includes(supportedImageExtensions, getFileExtension(uri));
    }

    /**
     * check request integrity
     * @param {string}                  fittingType         imageService.fittingTypes
     * @param {ImageTransformSource}    src
     * @param {ImageTransformTarget}    target
     *
     * @returns {boolean}
     */
    function isValidRequest(fittingType, src, target) {
        return (target) && (src && !isUrlEmptyOrNone(src.id)) && (utils.includes(constants.fittingTypes, fittingType));
    }

    /**
     * check if image transform is supported for source image
     * @param {string}     uri
     *
     * @returns {boolean}
     */
    function isImageTransformApplicable(uri) {
        return isImageTypeSupported(uri) && !isExternalUrl(uri);
    }

    /**
     * returns true if image is of JPG type
     * @param {string}  uri
     *
     * @returns {boolean}
     */
    function isJPG(uri) {
        return utils.includes(['jpg', 'jpeg'], getFileExtension(uri));
    }

    /**
     * returns true if image is of PNG type
     * @param {string}  uri
     *
     * @returns {boolean}
     */
    function isPNG(uri) {
        return utils.includes(['png'], getFileExtension(uri));
    }

    /**
     * returns true if image is of webP type
     * @param {string}  uri
     *
     * @returns {boolean}
     */
    function isWEBP(uri) {
        return utils.includes(['webp'], getFileExtension(uri));
    }

    /**
     * returns true if the url starts with http, https, // or data
     * @param {string}  url
     *
     * @returns {boolean}
     */
    function isExternalUrl(url) {
        return (/(^https?)|(^data)|(^\/\/)/).test(url);
    }

    /**
     * returns true if the url empty or none string
     * @param {string}  url
     *
     * @returns {boolean}
     */
    function isUrlEmptyOrNone(url) {
        return (!url || !url.trim() || url.toLowerCase() === 'none');
    }

    /**
     * returns source image file name (no extension)
     * @param {string}     uri      image source uri
     *
     * @returns {string}
     */
    function getFileName(uri) {
        var fileName = uri;
        var beforeLeadingSlashRegexp = /\/(.*?)$/;
        var fileExtensionRegexp = /\.[^.]*$/;

        var trimmedFileName = beforeLeadingSlashRegexp.exec(uri);
        if (trimmedFileName && trimmedFileName[1]) {
            fileName = trimmedFileName[1];
        }
        return fileName.replace(fileExtensionRegexp, '');
    }

    /**
     * returns source image file name (no extension)
     * @param {string}     uri      image source uri
     *
     * @returns {string}
     */
    function getFileType(uri) {
        if (isJPG(uri)) {
            return constants.fileType.JPG;
        } else if (isPNG(uri)) {
            return constants.fileType.PNG;
        } else if (isWEBP(uri)) {
            return constants.fileType.WEBP;
        }
    }

    /**
     * returns source image file extension
     * @param {string}     uri      image source uri
     *
     * @returns {string}
     */
    function getFileExtension(uri) {
        var splitURI = /[.]([^.]+)$/.exec(uri);
        return (splitURI && /[.]([^.]+)$/.exec(uri)[1] || "").toLowerCase();
    }

    /**
     * returns scale factor needed if FIT fitting
     * @param {number}  sWidth
     * @param {number}  sHeight
     * @param {number}  dWidth
     * @param {number}  dHeight
     *
     * @returns {number}
     */
    function getFitScaleFactor(sWidth, sHeight, dWidth, dHeight) {
        return Math.min(dWidth / sWidth, dHeight / sHeight);
    }

    /**
     * returns scale factor needed if FILL fitting
     * @param {number}  sWidth
     * @param {number}  sHeight
     * @param {number}  dWidth
     * @param {number}  dHeight
     *
     * @returns {number}
     */
    function getFillScaleFactor(sWidth, sHeight, dWidth, dHeight) {
        return Math.max(dWidth / sWidth, dHeight / sHeight);
    }

    /**
     * returns scale factor source target
     * @param {number}  sWidth
     * @param {number}  sHeight
     * @param {number}  dWidth
     * @param {number}  dHeight
     * @param {string}  transformType
     *
     * @returns {number}
     */
    function getScaleFactor(sWidth, sHeight, dWidth, dHeight, transformType) {
        var scaleFactor;

        if (transformType === constants.transformTypes.FILL) {
            scaleFactor = getFillScaleFactor(sWidth, sHeight, dWidth, dHeight);
        } else if (transformType === constants.transformTypes.FIT) {
            scaleFactor = getFitScaleFactor(sWidth, sHeight, dWidth, dHeight);
        } else {
            scaleFactor = 1;
        }

        return scaleFactor;
    }

    /**
     * returns the destination rectangle
     * @param {number}                  sWidth
     * @param {number}                  sHeight
     * @param {ImageTransformTarget}    target
     * @param {string}                  transformType
     *
     * @returns {object}                {with, height, scaleFactor}
     */
    function getCalculatedTransformedData(sWidth, sHeight, target, transformType) {
        // device pixel aspect ratio
        var PAR = getPixelAspectRatio(target);
        // target rectangle
        var transformedData = {
            width: 0,
            height: 0,
            scaleFactor: 0,
            cssUpscaleNeeded: false
        };

        // adjust target rectangle
        var scaleFactor = getScaleFactor(sWidth, sHeight, target.width * PAR, target.height * PAR, transformType);
        var imageMaxAllowedUpscaleFactor = getPreferredUpscaleFactor(sWidth, sHeight);

        if (scaleFactor > imageMaxAllowedUpscaleFactor) {
            // server side image upscale is not allowed
            switch (transformType) {
                case constants.transformTypes.FILL:
                    transformedData.width = target.width * PAR * (imageMaxAllowedUpscaleFactor / scaleFactor);
                    transformedData.height = target.height * PAR * (imageMaxAllowedUpscaleFactor / scaleFactor);
                    break;
                case constants.transformTypes.FIT:
                    transformedData.width = sWidth * imageMaxAllowedUpscaleFactor;
                    transformedData.height = sHeight * imageMaxAllowedUpscaleFactor;
                    break;
                default:
                    break;
            }
            // adjust scale factor value
            transformedData.scaleFactor = imageMaxAllowedUpscaleFactor;
            transformedData.cssUpscaleNeeded = true;

        } else {
            // server side image upscale is allowed
            switch (transformType) {
                case constants.transformTypes.FILL:
                    transformedData.width = target.width * PAR;
                    transformedData.height = target.height * PAR;
                    break;
                case constants.transformTypes.FIT:
                    transformedData.width = sWidth * scaleFactor;
                    transformedData.height = sHeight * scaleFactor;
                    break;
                default:
                    break;
            }
            // adjust scale factor value
            transformedData.scaleFactor = scaleFactor;
            transformedData.cssUpscaleNeeded = false;
        }

        // return calculated transform size
        return transformedData;
    }

    /**
     * returns overlapping rectangle where sRect
     * id aligned (according to alignment) within dRect
     * @param {object}      sRect         rect 1
     * @param {object}      dRect         rect 2
     * @param {string}      alignment
     *
     * @returns {{x:number,y:number,width:number, height:number}}
     */
    function getAlignedRect(sRect, dRect, alignment) {
        var x, y;

        // calculate cropping x,y
        switch (alignment) {
            case constants.alignTypes.CENTER:
                x = Math.max(0, (sRect.width - dRect.width) / 2);
                y = Math.max(0, (sRect.height - dRect.height) / 2);
                break;
            case constants.alignTypes.TOP:
                x = Math.max(0, (sRect.width - dRect.width) / 2);
                y = 0;
                break;
            case constants.alignTypes.TOP_LEFT:
                x = 0;
                y = 0;
                break;
            case constants.alignTypes.TOP_RIGHT:
                x = Math.max(0, sRect.width - dRect.width);
                y = 0;
                break;
            case constants.alignTypes.BOTTOM:
                x = Math.max(0, (sRect.width - dRect.width) / 2);
                y = Math.max(0, sRect.height - dRect.height);
                break;
            case constants.alignTypes.BOTTOM_LEFT:
                x = 0;
                y = Math.max(0, sRect.height - dRect.height);
                break;
            case constants.alignTypes.BOTTOM_RIGHT:
                x = Math.max(0, sRect.width - dRect.width);
                y = Math.max(0, sRect.height - dRect.height);
                break;
            case constants.alignTypes.LEFT:
                x = 0;
                y = Math.max(0, (sRect.height - dRect.height) / 2);
                break;
            case constants.alignTypes.RIGHT:
                x = Math.max(0, sRect.width - dRect.width);
                y = Math.max(0, (sRect.height - dRect.height) / 2);
                break;
        }

        // rect
        return {
            x: sRect.x ? sRect.x + x : x,
            y: sRect.y ? sRect.y + y : y,
            width: Math.min(sRect.width, dRect.width),
            height: Math.min(sRect.height, dRect.height)
        };
    }

    /**
     * returns overlapping rectangle between sRect and dRect
     * @param {object}      sRect         rect 1
     * @param {object}      dRect         rect 2
     *
     * @returns {{x:number,y:number,width:number, height:number} || null}
     */
    function getOverlappingRect(sRect, dRect) {
        var width = Math.max(0, Math.min(sRect.width, dRect.x + dRect.width) - Math.max(0, dRect.x));
        var height = Math.max(0, Math.min(sRect.height, dRect.y + dRect.height) - Math.max(0, dRect.y));


        var isValidRect = width && height && (sRect.width !== width || sRect.height !== height);

        // return overlapping sRect/dRect rectangle(x, y, width, height)
        return isValidRect ? {
            x: Math.max(0, dRect.x),
            y: Math.max(0, dRect.y),
            width: width,
            height: height
        } : null;
    }

    /**
     * returns pixel aspect ratio value
     * @param {ImageTransformTarget}    target
     *
     * @returns {number}
     */
    function getPixelAspectRatio(target) {
        return target.pixelAspectRatio || 1;
    }

    /**
     * returns target alignment value
     * @param {ImageTransformTarget}    target
     *
     * @returns {string}
     */
    function getAlignment(target) {
        return constants.alignTypesMap[target.alignment] || constants.alignTypesMap[constants.alignTypes.CENTER];
    }

    /**
     * returns preferred image quality value
     * @param {number}    imageWidth
     * @param {number}    imageHeight
     *
     * @returns {number}
     */
    function getPreferredImageQuality(imageWidth, imageHeight) {
        return constants.imageQualityMap[getImageQualityKey(imageWidth, imageHeight)].quality;

    }

    /**
     * returns permitted upscale factor
     * @param {number}    imageWidth
     * @param {number}    imageHeight
     *
     * @returns {number}
     */
    function getPreferredUpscaleFactor(imageWidth, imageHeight) {
        return constants.imageQualityMap[getImageQualityKey(imageWidth, imageHeight)].maxUpscale;

    }

    /**
     * returns image quality key
     * @param {number}    imageWidth
     * @param {number}    imageHeight
     *
     * @returns {string}
     */
    function getImageQualityKey(imageWidth, imageHeight) {
        var size = imageWidth * imageHeight;

        if (size > constants.imageQualityMap[constants.imageQuality.HIGH].size) {
            return constants.imageQuality.HIGH;
        } else if (size > constants.imageQualityMap[constants.imageQuality.MEDIUM].size) {
            return constants.imageQuality.MEDIUM;
        } else if (size > constants.imageQualityMap[constants.imageQuality.LOW].size) {
            return constants.imageQuality.LOW;
        }
        return constants.imageQuality.TINY;
    }

    /**
     * return the actual rounded dimension of a scaled rectangle
     * @param sWidth
     * @param sHeight
     * @param tWidth
     * @param tHeight
     * @param transformType
     * @returns {{width: number, height: number}}
     */
    function getDimension(sWidth, sHeight, tWidth, tHeight, transformType) {
        var scaleFactor = getScaleFactor(sWidth, sHeight, tWidth, tHeight, transformType);
        return {
            width: Math.round(sWidth * scaleFactor),
            height: Math.round(sHeight * scaleFactor)
        };

    }

    return {
        isWEBPBrowserSupport: isWEBPBrowserSupport,
        isObjectFitBrowserSupport: isObjectFitBrowserSupport,
        isImageTransformApplicable: isImageTransformApplicable,
        isValidRequest: isValidRequest,
        isImageTypeSupported: isImageTypeSupported,
        isJPG: isJPG,
        isPNG: isPNG,
        isWEBP: isWEBP,
        getFileType: getFileType,
        getFileExtension: getFileExtension,
        getFileName: getFileName,
        getAlignedRect: getAlignedRect,
        getOverlappingRect: getOverlappingRect,
        getFitScaleFactor: getFitScaleFactor,
        getFillScaleFactor: getFillScaleFactor,
        getScaleFactor: getScaleFactor,
        getCalculatedTransformedData: getCalculatedTransformedData,
        getPixelAspectRatio: getPixelAspectRatio,
        getAlignment: getAlignment,
        getPreferredImageQuality: getPreferredImageQuality,
        getPreferredUpscaleFactor: getPreferredUpscaleFactor,
        getDimension: getDimension
    };
});
