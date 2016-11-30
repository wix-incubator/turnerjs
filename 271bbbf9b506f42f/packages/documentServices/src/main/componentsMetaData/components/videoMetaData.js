define(['documentServices/dataModel/dataModel'], function (dataModel) {
    'use strict';

    var DIMENSIONS = {
        VIMEO: {
            minWidth: 100,
            minHeight: 100
        },
        YOUTUBE: {
            minWidth: 200,
            minHeight: 200
        }
    };

    var FALLBACK = {
        minWidth: 10,
        minHeight: 10
    };

    return {
        styleCanBeApplied: true,
        layoutLimits: function (ps, compPointer) {
            var compData = dataModel.getDataItem(ps, compPointer);
            return DIMENSIONS[compData.videoType] || FALLBACK;
        },
        defaultMobileProperties: {
            autoplay: false
        },
        mobileConversionConfig: {
            category: 'visual'
        }
    };
});
