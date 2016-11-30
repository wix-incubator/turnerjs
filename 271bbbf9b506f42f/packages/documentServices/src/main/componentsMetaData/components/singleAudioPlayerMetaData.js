define(['documentServices/constants/constants'], function (constants) {
    'use strict';

    return {
        styleCanBeApplied:true,
        resizableSides: [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT],
        layoutLimits: {
            minWidth: 250
        }
    };
});
