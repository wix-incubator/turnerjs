define([
    'lodash',
    'wixappsClassics/blog/functionLibrary',
    'wixappsClassics/blog/blogSettings'
], function (_, functionLibrary, blogSettings) {
    'use strict';

    function getRequests(siteData, compData, appService) {
        return [].concat(blogSettings.getRequest(siteData, compData, appService));
    }

    return {
        functionLibrary: functionLibrary,
        getRequests: getRequests
    };
});
