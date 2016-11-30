define(['documentServices/constants/constants'], function(constants) {
    'use strict';

    return {
        mobileConversionConfig: {
            isSuitableForProportionGrouping: true,
            hideByDefault:  true
        },
        rotatable: true,
        styleCanBeApplied:true,
        resizableSides: [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM]
    };
});