define([
    'lodash',
    'documentServices/constants/constants',
    'documentServices/page/popupUtils',
    'documentServices/componentsMetaData/metaDataUtils'
], function(
    _,
    constants,
    popupUtils,
    metaDataUtils
) {
    'use strict';

    return {
        resizableSides: [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM],
        moveDirections: [constants.MOVE_DIRECTIONS.VERTICAL],
        fullWidth: true,
        fullWidthByStructure: true,
        canBeFixedPosition: false,
        containableByStructure: metaDataUtils.containableByFullWidthPopup,
        mobileConversionConfig: {
            isScreenWidth: true,
            filterChildrenWhenHidden: true,
            minHeight: 200,
            preserveAspectRatio: false
        }
    };
});
