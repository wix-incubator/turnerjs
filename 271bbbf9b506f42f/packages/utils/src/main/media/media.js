define(['coreUtils'], function (coreUtils) {
    'use strict';

    return {
        getMediaUrl: function (serviceTopology, mediaPath) {
            var baseUrl = (serviceTopology && serviceTopology.scriptsDomainUrl) || "http://static.parastorage.com/";
            return coreUtils.urlUtils.joinURL(baseUrl, 'services', 'santa-resources', 'resources', 'viewer', mediaPath);
        }
    };
});
