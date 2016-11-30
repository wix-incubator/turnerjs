/**
 * Created by talm on 17/08/15.
 */
define([], function () {
    'use strict';

    return {
        enforceContainerChildLimitsByWidth: false,
        enforceContainerChildLimitsByHeight: false,

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
            filterChildrenWhenHidden: true,
            marginX: 0
        }
    };
});
