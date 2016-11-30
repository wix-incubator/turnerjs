define(['documentServices/dataModel/dataModel', 'documentServices/constants/constants'], function (dataModel, constants) {
    'use strict';

    return {
        resizableSides: function (ps, componentPointer) {
            var compProps = dataModel.getPropertiesItem(ps, componentPointer);
            var sides = [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];

            if (compProps.orientation === 'horizontal') {
                return sides.concat([constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM]);
            }

            return sides;
        }
    };
});