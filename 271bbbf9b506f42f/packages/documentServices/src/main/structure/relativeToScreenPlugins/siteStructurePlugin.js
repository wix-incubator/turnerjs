define(['documentServices/constants/constants'], function(constants) {
    'use strict';

    function pluginFn(siteAPI, compLayoutRelativeToStructure) {
        var isMobile = siteAPI.isMobileView();

        return {
            x: isMobile ? compLayoutRelativeToStructure.x : 0,
            y: compLayoutRelativeToStructure.y,
            width: isMobile ? siteAPI.getSiteWidth() : siteAPI.getSiteMeasureMap().clientWidth,
            height: siteAPI.getSiteMeasureMap().height[constants.MASTER_PAGE_ID]
        };
    }

    return pluginFn;
});
