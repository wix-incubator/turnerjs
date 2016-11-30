define(['documentServices/dataModel/dataModel', 'documentServices/constants/constants'], function(dataModel, constants) {
    'use strict';
    var metaData = {
        resizableSides: function(ps, componentPointer) {
            var compData = dataModel.getDataItem(ps, componentPointer);
            var compact = !(compData.showStream);

            var resizableSides = compact ? [
                constants.RESIZE_SIDES.LEFT,
                constants.RESIZE_SIDES.RIGHT
            ] : [
                constants.RESIZE_SIDES.TOP,
                constants.RESIZE_SIDES.LEFT,
                constants.RESIZE_SIDES.BOTTOM,
                constants.RESIZE_SIDES.RIGHT
            ];
            return resizableSides;
        },
        layoutLimits: {
            minWidth: 280,
            minHeight: 575,
            maxWidth: 500
        }
    };

    return metaData;
});
