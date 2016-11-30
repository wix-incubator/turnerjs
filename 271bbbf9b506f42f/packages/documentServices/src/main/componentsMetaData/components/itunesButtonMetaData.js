define(['documentServices/constants/constants'], function(constants) {
    'use strict';
    var metaData = {
        resizableSides: [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT],
        layoutLimits: {
            minWidth: 110,
            maxWidth: 400
        }
    };

    return metaData;
});
