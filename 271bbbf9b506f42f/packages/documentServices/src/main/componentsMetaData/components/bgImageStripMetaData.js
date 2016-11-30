define(['documentServices/componentsMetaData/metaDataUtils', 'documentServices/constants/constants'], function (metaDataUtils, constants) {
    'use strict';

    var metaData = {
        moveDirections: [constants.MOVE_DIRECTIONS.VERTICAL],
        resizableSides: [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM],
        fullWidth: true,
        fullWidthByStructure: true,
        styleCanBeApplied: true,
        mobileConversionConfig: {
            filterChildrenWhenHidden: true,
            preserveAspectRatio: false
        }
    };

    return metaData;
});
