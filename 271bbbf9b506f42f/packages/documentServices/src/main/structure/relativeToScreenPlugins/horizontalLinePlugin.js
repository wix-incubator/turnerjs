define(['lodash', 'documentServices/structure/relativeToScreenPlugins/screenWidthPlugin'], function(_, screenWidthPlugin) {
    'use strict';

    var HORIZONTAL_LINE_MIN_HEIGHT = 25;

    function pluginFn(siteAPI, compLayoutRelativeToStructure, compProperties) {
        var pluginResult = { };

        if (compLayoutRelativeToStructure.height < HORIZONTAL_LINE_MIN_HEIGHT) {
            pluginResult.y = compLayoutRelativeToStructure.y - (HORIZONTAL_LINE_MIN_HEIGHT / 2);
            pluginResult.height = HORIZONTAL_LINE_MIN_HEIGHT;
        }

        if (compProperties && compProperties.fullScreenModeOn) {
            _.merge(pluginResult, screenWidthPlugin(siteAPI, compLayoutRelativeToStructure, compProperties));
        }

        return pluginResult;
    }

    return pluginFn;
});
