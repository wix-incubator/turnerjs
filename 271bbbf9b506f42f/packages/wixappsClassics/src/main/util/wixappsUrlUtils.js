define(['utils'], function (utils) {
    'use strict';

    function resolveImageData(data, serviceTopology, packageName) {
        var url = data.src;
        var scriptsLocationMap = serviceTopology.scriptsLocationMap;
        if (!scriptsLocationMap || !url) {
          return data;
        }
        var appBasedPath = packageName === 'ecommerce' ?
                            scriptsLocationMap.ecommerce :
                            scriptsLocationMap.wixapps + "/javascript/wixapps/apps/" + packageName + "/";

        var match = url.match(/^(http:\/\/)?(images\/.*)/);
        data.src = match ? utils.urlUtils.joinURL(appBasedPath, match[2]) : url;

        return data;
    }

    return {
        resolveImageData: resolveImageData
    };

});
