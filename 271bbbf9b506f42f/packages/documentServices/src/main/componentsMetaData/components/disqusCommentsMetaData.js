define(['documentServices/constants/constants'], function(constants) {
    'use strict';

    return {
        resizableSides: [
            constants.RESIZE_SIDES.LEFT,
            constants.RESIZE_SIDES.RIGHT
        ],
        layoutLimits: {
            minWidth: 500
        }
    };
});