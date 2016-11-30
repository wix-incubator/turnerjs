define([
    'imageClientApi/helpers/imageServiceConstants'
], function (constants) {
    'use strict';

    /**
     * returns BG tag CSS data
     * @param {object}                  transformsObj    transform parts object
     * @param {ImageTransformTarget}    target
     *
     * @returns {{css: {container: {}}}}
     */
    function getCSS(transformsObj, target) {
        var attributes = {
            css: {
                container: {}
            }
        };
        var css = attributes.css;
        var alignTypes = constants.alignTypes;
        var fittingType = transformsObj.fittingType;
        var fittingTypes = constants.fittingTypes;

        //set fitting
        switch (fittingType) {
            case fittingTypes.ORIGINAL_SIZE:
            case fittingTypes.LEGACY_ORIGINAL_SIZE:
            case fittingTypes.LEGACY_STRIP_ORIGINAL_SIZE:
                css.container.backgroundSize = "auto";
                css.container.backgroundRepeat = "no-repeat";
                break;

            case fittingTypes.SCALE_TO_FIT:
            case fittingTypes.LEGACY_STRIP_SCALE_TO_FIT:
                css.container.backgroundSize = "contain";
                css.container.backgroundRepeat = "no-repeat";
                break;

            case fittingTypes.STRETCH:
                css.container.backgroundSize = "100% 100%";
                css.container.backgroundRepeat = "no-repeat";
                break;

            case fittingTypes.SCALE_TO_FILL:
            case fittingTypes.LEGACY_STRIP_SCALE_TO_FILL:
                css.container.backgroundSize = "cover";
                css.container.backgroundRepeat = "no-repeat";
                break;

            case fittingTypes.TILE_HORIZONTAL:
            case fittingTypes.LEGACY_STRIP_TILE_HORIZONTAL:
                css.container.backgroundSize = "auto";
                css.container.backgroundRepeat = "repeat-x";
                break;

            case fittingTypes.TILE_VERTICAL:
            case fittingTypes.LEGACY_STRIP_TILE_VERTICAL:
                css.container.backgroundSize = "auto";
                css.container.backgroundRepeat = "repeat-y";
                break;

            case fittingTypes.TILE:
            case fittingTypes.LEGACY_STRIP_TILE:
                css.container.backgroundSize = "auto";
                css.container.backgroundRepeat = "repeat";
                break;

            case fittingTypes.FIT_AND_TILE:
            case fittingTypes.LEGACY_STRIP_FIT_AND_TILE:
                css.container.backgroundSize = "contain";
                css.container.backgroundRepeat = "repeat";
                break;

            // Legacy old editor bg types.
            case fittingTypes.LEGACY_BG_FIT_AND_TILE:
                css.container.backgroundSize = "auto";
                css.container.backgroundRepeat = "repeat";
                break;

            case fittingTypes.LEGACY_BG_FIT_AND_TILE_HORIZONTAL:
                css.container.backgroundSize = "auto";
                css.container.backgroundRepeat = "repeat-x";
                break;

            case fittingTypes.LEGACY_BG_FIT_AND_TILE_VERTICAL:
                css.container.backgroundSize = "auto";
                css.container.backgroundRepeat = "repeat-y";
                break;

            case fittingTypes.LEGACY_BG_NORMAL:
                css.container.backgroundSize = "auto";
                css.container.backgroundRepeat = "no-repeat";
                break;
        }

        // set alignment
        switch (target.alignment) {
            case alignTypes.CENTER:
                css.container.backgroundPosition = "center center"; //50% 50%
                break;

            case alignTypes.LEFT:
                css.container.backgroundPosition = "left center";   //0% 50%
                break;

            case alignTypes.RIGHT:
                css.container.backgroundPosition = "right center";  //100% 50%
                break;

            case alignTypes.TOP:
                css.container.backgroundPosition = "center top";    //50% 0%
                break;

            case alignTypes.BOTTOM:
                css.container.backgroundPosition = "center bottom"; //50% 100%
                break;

            case alignTypes.TOP_RIGHT:
                css.container.backgroundPosition = "right top";     //100% 0%
                break;

            case alignTypes.TOP_LEFT:
                css.container.backgroundPosition = "left top";      //0% 0%
                break;

            case alignTypes.BOTTOM_RIGHT:
                css.container.backgroundPosition = "right bottom";  //100% 100%
                break;

            case alignTypes.BOTTOM_LEFT:
                css.container.backgroundPosition = "left bottom";   //0% 100%
                break;

        }

        // return background CSS
        return attributes;
    }

    return {
        get: getCSS
    };
});


