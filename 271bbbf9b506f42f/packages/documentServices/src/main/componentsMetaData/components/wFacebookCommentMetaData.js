define(['documentServices/documentMode/documentModeInfo', 'documentServices/constants/constants'], function(documentModeInfo, constants) {
    'use strict';

    return {
        resizableSides: function(ps/*, compPath*/) {
            if (documentModeInfo.getViewMode(ps) === 'MOBILE') { // todo use consts, align with getViewNode signature
                return [];
            }

            return [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];
        },

        layoutLimits: function(ps) {
            return documentModeInfo.getViewMode(ps) === 'MOBILE' ? {} : {minWidth: 400};
        },
        mobileConversionConfig: {
            stretchHorizontally: true
        }

    };
});