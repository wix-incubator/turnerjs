define(['documentServices/dataModel/dataModel', 'documentServices/constants/constants'], function (dataModel, constants) {
    'use strict';

    var resizeOptions = [
        constants.RESIZE_SIDES.TOP,
        constants.RESIZE_SIDES.LEFT,
        constants.RESIZE_SIDES.BOTTOM,
        constants.RESIZE_SIDES.RIGHT];

    return {
        mobileConversionConfig: {
            hideByDefault: true
        },
        resizableSides: function (ps, compPointer) {
            var displayMode = dataModel.getPropertiesItem(ps, compPointer).displayMode;

            if (displayMode === 'original') {
                return [];
            }

            return resizeOptions;
        }
    };
});
