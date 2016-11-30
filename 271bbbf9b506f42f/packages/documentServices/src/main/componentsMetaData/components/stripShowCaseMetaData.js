define([
    'documentServices/constants/constants',
    'documentServices/componentsMetaData/metaDataUtils'
], function(
    constants,
    metaDataUtils
) {
    'use strict';

    return {
        moveDirections: [constants.MOVE_DIRECTIONS.VERTICAL],
        resizableSides: [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM],
        fullWidth: true,
        fullWidthByStructure: true,
        canBeFixedPosition: false,
        containableByStructure: metaDataUtils.containableByFullWidthPopup
    };
});
