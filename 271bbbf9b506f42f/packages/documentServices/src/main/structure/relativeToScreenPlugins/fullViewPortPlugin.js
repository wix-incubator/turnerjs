define(['lodash', 'documentServices/structure/relativeToScreenPlugins/screenWidthPlugin'], function(_, screenWidthPlugin) {
    'use strict';

    function pluginFn(siteAPI, compLayoutRelativeToStructure) {

        return _.assign(screenWidthPlugin.call(this, siteAPI, compLayoutRelativeToStructure), {
            height: Math.max(compLayoutRelativeToStructure.height, siteAPI.getScreenHeight())
        });
    }

    return pluginFn;
});
