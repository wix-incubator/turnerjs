define([
    'imageClientApi/helpers/imageServiceConstants',
    'imageClientApi/helpers/imageServiceUtils'
], function (constants, imageServiceUtils) {
    'use strict';


    /**
     * get CSS or SVG attributes to be used in the browser
     * @param {object}                  transformsObj    transform parts object
     * @param {ImageTransformTarget}    target
     *
     * @returns {{attr:{img: {}, container: {}}, css:{container:{}}}}
     */
    function getSvgAttr(transformsObj, target) {
        var attributes = {
            css: {
                container: {}
            },
            attr: {
                container: {},
                img: {}
            }
        };
        var css = attributes.css;
        var attr = attributes.attr;
        var fittingType = transformsObj.fittingType;
        var fittingTypes = constants.fittingTypes;
        var sourceWidth = transformsObj.src.width;
        var sourceHeight = transformsObj.src.height;
        var imageScale;

        css.container.position = 'relative';

        // populate SVG attributes object
        switch (fittingType) {
            case fittingTypes.ORIGINAL_SIZE:
            case fittingTypes.LEGACY_ORIGINAL_SIZE:
                attr.img.width = transformsObj.src.width;
                attr.img.height = transformsObj.src.height;
                attr.img.x = '50%';
                attr.img.y = '50%';
                attr.img.transform = 'translate(' + -transformsObj.src.width / 2 + ',' + -transformsObj.src.height / 2 + ')';
                attr.img.preserveAspectRatio = 'xMidYMid slice';
                break;

            case fittingTypes.SCALE_TO_FIT:
            case fittingTypes.LEGACY_FIT_WIDTH:
            case fittingTypes.LEGACY_FIT_HEIGHT:
            case fittingTypes.LEGACY_FULL:
                imageScale = imageServiceUtils.getDimension(sourceWidth, sourceHeight, target.width, target.height, constants.transformTypes.FIT);
                attr.img.width = '100%';
                attr.img.height = '100%';
                attr.img.transform = '';
                attr.img.preserveAspectRatio = '';
                break;

            case fittingTypes.STRETCH:
                attr.img.width = target.width;
                attr.img.height = target.height;
                attr.img.x = 0;
                attr.img.y = 0;
                attr.img.transform = '';
                attr.img.preserveAspectRatio = 'none';
                break;

            case fittingTypes.SCALE_TO_FILL:
                if (!imageServiceUtils.isImageTransformApplicable(transformsObj.src.id)) {
                    imageScale = imageServiceUtils.getDimension(sourceWidth, sourceHeight, target.width, target.height, constants.transformTypes.FILL);
                    attr.img.width = imageScale.width;
                    attr.img.height = imageScale.height;
                } else {
                    attr.img.width = target.width;
                    attr.img.height = target.height;
                }
                attr.img.x = 0;
                attr.img.y = 0;
                attr.img.transform = '';
                attr.img.preserveAspectRatio = 'xMidYMid slice';
                break;
        }
        //attr.container.position = 'relative';
        attr.container.width = target.width;
        attr.container.height = target.height;
        attr.container.viewBox = [0, 0, target.width, target.height].join(' ');

        //todo: currently all svg images are center aligned , needs to implement alignment when needed.
        // return attributes object
        return attributes;
    }


    return {
        get: getSvgAttr
    };

});
