define([
    'imageClientApi/helpers/imageServiceConstants'
], function (constants) {
    'use strict';

    /**
     * returns image tag CSS data
     * @param {object}                  transformsObj    transform parts object
     * @param {ImageTransformTarget}    target
     *
     * @returns {{css: {img: {}, container: {}}}}
     */
    function getCSS(transformsObj, target) {
        var attributes = {
            css: {
                container: {},
                img: {}
            }
        };
        var css = attributes.css;
        var fittingType = transformsObj.fittingType;
        var alignType = target.alignment;

        var fittingTypes = constants.fittingTypes;
        var alignTypes = constants.alignTypes;

        css.container.position = 'relative';


        switch (fittingType) {
            case fittingTypes.ORIGINAL_SIZE:
            case fittingTypes.LEGACY_ORIGINAL_SIZE:
                if (transformsObj.parts && transformsObj.parts.length){
                    css.img.width = transformsObj.parts[0].width;
                    css.img.height = transformsObj.parts[0].height;
                } else {
                    css.img.width = transformsObj.src.width;
                    css.img.height = transformsObj.src.height;
                }
                break;

            case fittingTypes.SCALE_TO_FIT:
            case fittingTypes.LEGACY_FIT_WIDTH:
            case fittingTypes.LEGACY_FIT_HEIGHT:
            case fittingTypes.LEGACY_FULL:
                css.img.width = target.width;
                css.img.height = target.height;
                css.img.objectFit = 'contain';
                break;

            case fittingTypes.STRETCH:
                css.img.width = target.width;
                css.img.height = target.height;
                css.img.objectFit = 'fill';
                break;

            case fittingTypes.SCALE_TO_FILL:
                css.img.width = target.width;
                css.img.height = target.height;
                css.img.objectFit = 'cover';
                break;
        }

        // set alignment in a private case where the image src is smaller than the image element,
        if (css.img.width !== target.width || css.img.height !== target.height) {
            var verticalMiddle = Math.round((target.height - css.img.height) / 2);
            var horizontalMiddle = Math.round((target.width - css.img.width) / 2);
            css.img.position = 'absolute';
            css.img.top = 'auto';
            css.img.right = 'auto';
            css.img.bottom = 'auto';
            css.img.left = 'auto';

            switch (alignType) {
                default:
                case alignTypes.CENTER:
                    css.img.width = target.width;
                    css.img.height = target.height;
                    css.img.objectFit = 'none';
                    break;

                case alignTypes.LEFT:
                    css.img.left = 0;
                    css.img.top = verticalMiddle;
                    //0% 50%
                    break;

                case alignTypes.RIGHT:
                    css.img.right = 0;
                    css.img.top = verticalMiddle;
                    //100% 50%
                    break;

                case alignTypes.TOP:
                    css.img.left = horizontalMiddle;
                    css.img.top = 0;
                    //50% 0%
                    break;

                case alignTypes.BOTTOM:
                    css.img.left = horizontalMiddle;
                    css.img.bottom = 0;
                    //50% 100%
                    break;

                case alignTypes.TOP_RIGHT:
                    css.img.right = 0;
                    css.img.top = 0;
                    //100% 0%
                    break;

                case alignTypes.TOP_LEFT:
                    css.img.left = 0;
                    css.img.top = 0;
                    //0% 0%
                    break;

                case alignTypes.BOTTOM_RIGHT:
                    css.img.right = 0;
                    css.img.bottom = 0;
                    //100% 100%
                    break;

                case alignTypes.BOTTOM_LEFT:
                    css.img.left = 0;
                    css.img.bottom = 0;
                    //0% 100%
                    break;

            }
        }

        return attributes;
    }

    return {
        get: getCSS
    };
});
