define(['utils'], function (utils) {
    'use strict';

    return {
        rotatable: true,
        layoutLimits: function (ps, compPointer) {
            var measureMap = ps.siteAPI.getSiteMeasureMap();

            return {
                minWidth: measureMap.minWidth[compPointer.id] || utils.siteConstants.COMP_SIZE.MIN_WIDTH
            };
        }
    };
});
