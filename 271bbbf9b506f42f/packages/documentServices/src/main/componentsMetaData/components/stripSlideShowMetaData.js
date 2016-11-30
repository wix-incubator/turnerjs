define([
    'documentServices/constants/constants',
    'documentServices/componentsMetaData/metaDataUtils'
], function (
    constants,
    metaDataUtils
) {
    'use strict';

    return {
        enforceContainerChildLimitsByWidth: false,
        enforceContainerChildLimitsByHeight: false,
        moveDirections: [constants.MOVE_DIRECTIONS.VERTICAL],
        resizableSides: [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM],
        fullWidth: true,
        fullWidthByStructure: true,
        containableByStructure: metaDataUtils.containableByFullWidthPopup,
        defaultMobileProperties: {
            flexibleBoxHeight: false,
            shouldHideOverflowContent: true,
            navigationButtonMargin: 22,
            navigationButtonSize: 15,
            navigationDotsGap: 15,
            navigationDotsMargin: 24,
            navigationDotsSize: 6
        },
        mobileConversionConfig: {
            isScreenWidth: true,
            filterChildrenWhenHidden: true,
            marginX: 0,
            preserveAspectRatio: false
        }
    };
});
