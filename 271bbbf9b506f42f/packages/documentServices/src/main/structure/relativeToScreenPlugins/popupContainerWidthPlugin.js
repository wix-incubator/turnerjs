define(['documentServices/structure/relativeToScreenPlugins/screenWidthPlugin'], function(screenWidthPlugin) {
    'use strict';

    function pluginFn(siteAPI, compLayoutRelativeToStructure, compProps) {
        return compProps.alignmentType === 'fullWidth' ?
            screenWidthPlugin(siteAPI, compLayoutRelativeToStructure) :
            {};
    }

    return pluginFn;
});
