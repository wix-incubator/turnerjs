define([], function() {
    'use strict';

    var ANCHOR_WIDTH = 141;
    var MARGINS_FROM_RIGHT = 68;

    function pluginFn(siteAPI, compLayoutRelativeToStructure) {
        var width = compLayoutRelativeToStructure.width;
        var left = siteAPI.getSiteMeasureMap().clientWidth - (ANCHOR_WIDTH + MARGINS_FROM_RIGHT);

        if (siteAPI.isMobileView()) {
            left = left - ((siteAPI.getSiteMeasureMap().clientWidth - siteAPI.getSiteWidth()) / 2) - 13;
            width = 140;
        }

        return {
            x: left,
            y: compLayoutRelativeToStructure.y,
            height: 0,
            width: width
        };
    }

    return pluginFn;
});
