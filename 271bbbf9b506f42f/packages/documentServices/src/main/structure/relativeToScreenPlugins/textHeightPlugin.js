define([], function () {
    'use strict';

    function pluginFn(siteAPI, compLayoutRelativeToStructure, compProps, compPointer) {
        return {
            height: siteAPI.getSiteMeasureMap().minHeight[compPointer.id]
        };
    }

    return pluginFn;
});
