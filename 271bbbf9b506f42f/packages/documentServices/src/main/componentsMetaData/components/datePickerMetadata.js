define(['utils'], function (utils) {
    'use strict';

    return {
        layoutLimits: function (ps, compPointer) {
            var measureMap = ps.siteAPI.getSiteMeasureMap() || {};
            var id = compPointer.id;

            return {
                minWidth: measureMap.minWidth[id] || utils.siteConstants.COMP_SIZE.MIN_WIDTH,
                minHeight: measureMap.minHeight[id] || utils.siteConstants.COMP_SIZE.MIN_HEIGHT
            };
        },
        disableable: true
    };
});
