define([], function() {
    'use strict';

    function pluginFn(siteAPI, compLayoutRelativeToStructure) {
        var isMobile = siteAPI.isMobileView();
        return {
            x: isMobile ? compLayoutRelativeToStructure.x : 0,
            width: isMobile ? siteAPI.getSiteWidth() : siteAPI.getSiteMeasureMap().clientWidth
        };
    }

    return pluginFn;
});
