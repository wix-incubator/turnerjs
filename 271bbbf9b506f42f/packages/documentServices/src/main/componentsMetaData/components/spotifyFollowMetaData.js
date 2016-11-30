define(['documentServices/dataModel/dataModel', 'documentServices/constants/constants'], function (dataModel, constants) {
    'use strict';

    return {
        resizableSides: function (ps, compPointer) {
            var uri = dataModel.getPropertiesItem(ps, compPointer).uri;

            if (!uri) {
                return [];
            }

            return [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];
        },

        mobileConversionConfig: {
            preserveAspectRatio: false
        }
    };
});