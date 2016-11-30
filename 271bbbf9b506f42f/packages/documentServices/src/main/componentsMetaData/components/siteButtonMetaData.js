define(['utils'], function (utils) {
    'use strict';

    return {
        rotatable: true,
        styleCanBeApplied: true,
        layoutLimits: function (ps, compPointer) {
            var measureMap = ps.siteAPI.getSiteMeasureMap() || {};

            return {
                minWidth: measureMap.minWidth[compPointer.id] || utils.siteConstants.COMP_SIZE.MIN_WIDTH,
                minHeight: measureMap.minHeight[compPointer.id] || utils.siteConstants.COMP_SIZE.MIN_HEIGHT
            };
        },
        disableable: true
    };
});
