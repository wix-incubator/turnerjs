define(['documentServices/constants/constants'], function (constants) {
    'use strict';

    return {
        layoutLimits: {
            minWidth: 40
        },
        isProportionallyResizable: true,
        resizableSides: [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT],
        defaultMobileProperties: {
            packed: false
        },
        mobileConversionConfig: {
            isSuitableForProportionGrouping: true,
            category: 'text',
            preserveAspectRatio: false,
            shouldEnlargeToFitWidth: true
        }
    };
});
