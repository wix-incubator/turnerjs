define(['documentServices/constants/constants'], function(constants) {
    'use strict';

    return {
        resizableSides: [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM],
        moveDirections: [constants.MOVE_DIRECTIONS.VERTICAL],
        fullWidth: true,
        mobileConversionConfig: {
            isScreenWidth: true,
            preserveAspectRatio: false
        }
    };
});