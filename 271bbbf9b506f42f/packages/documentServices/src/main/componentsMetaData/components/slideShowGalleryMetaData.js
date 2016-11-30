define(['documentServices/dataModel/dataModel', 'documentServices/constants/constants'], function(dataModel, constants) {
    'use strict';

    return {
        styleCanBeApplied:true,
        canBeStretched: true,
        resizableSides: function(ps, compPointer) {
            var imageMode = dataModel.getPropertiesItem(ps, compPointer).imageMode;

            if (imageMode === 'flexibleHeight') {
                return [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];
            }

            return [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.BOTTOM, constants.RESIZE_SIDES.RIGHT];
        },
        mobileConversionConfig: {
            category: 'visual',
            minHeight: 200
        }
    };
});