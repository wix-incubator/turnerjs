define(['documentServices/constants/constants'], function(constants) {
    'use strict';
    var metaData = {
        resizableSides: [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT],
        layoutLimits: {
            minWidth: 180,
            maxWidth: 980,
            minHeight: 180,
            maxHeight: 1024
        },
        styleCanBeApplied:true
    };

    return metaData;
});
