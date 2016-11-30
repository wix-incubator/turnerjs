define([], function() {
    'use strict';

    function pluginFn(siteAPI, compLayoutRelativeToScreen, compProperties, compPointer) {
        var isMobile = siteAPI.isMobileView();
        var compId = compPointer.id;
        var customMeasure = siteAPI.getSiteMeasureMap().custom[compId];

        return customMeasure ? {
            x: compLayoutRelativeToScreen.x + customMeasure.backgroundLeft,
            width: isMobile ? siteAPI.getSiteWidth() : customMeasure.backgroundWidth
        } : {};
    }

    return pluginFn;
});
