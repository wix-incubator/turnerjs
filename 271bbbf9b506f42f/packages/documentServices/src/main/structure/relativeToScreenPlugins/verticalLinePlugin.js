define([], function() {
    'use strict';

    var VERTICAL_LINE_MIN_WIDTH = 25;

    function pluginFn(siteAPI, compLayoutRelativeToStructure) {
        var pluginResult = { };

        if (compLayoutRelativeToStructure.width < VERTICAL_LINE_MIN_WIDTH) {
            pluginResult.x = compLayoutRelativeToStructure.x - (VERTICAL_LINE_MIN_WIDTH / 2);
            pluginResult.width = VERTICAL_LINE_MIN_WIDTH;
        }

        return pluginResult;
    }

    return pluginFn;
});
