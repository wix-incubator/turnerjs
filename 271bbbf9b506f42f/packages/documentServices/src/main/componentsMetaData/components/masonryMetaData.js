define(['documentServices/constants/constants'], function (constants) {
    'use strict';

    return {
        canBeStretched: true,
        defaultMobileProperties: function (ps, comp, desktopProps) {
            return {
                numCols: 2,
                margin: desktopProps.margin <= 3 ? desktopProps.margin : 15,
                textMode: {titleAndDescription: 'titleOnly', descriptionOnly: 'noText'}[desktopProps.textMode] || desktopProps.textMode
            };
        },
        resizableSides: [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT]
    };
});
