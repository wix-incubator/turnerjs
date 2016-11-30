define([], function() {
    'use strict';

    var PLATFORM_APPLICATIONS_TYPE = 'siteextension';

    function getAppSpec(clientSpecMap) {
        for (var appId in clientSpecMap){
            if (clientSpecMap.hasOwnProperty(appId) && clientSpecMap[appId].type === PLATFORM_APPLICATIONS_TYPE) {
                return clientSpecMap[appId];
            }
        }
    }

    return {
        getAppSpec: getAppSpec
    };
});
