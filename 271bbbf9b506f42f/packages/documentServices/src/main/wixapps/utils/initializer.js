define([
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/wixapps/utils/appPart2ComponentHooks',
    'documentServices/wixapps/utils/blogPaginationSwitch',
    'documentServices/wixapps/utils/pathUtils',
    'documentServices/wixapps/utils/useNewBlogSocialShareButtons'
], function (
    siteMetadata,
    appPart2ComponentHooks,
    blogPaginationSwitch,
    pathUtils,
    useNewBlogSocialShareButtons
) {
    'use strict';

    function initialize(ps) {
        pathUtils.initBasePaths(ps);
        appPart2ComponentHooks.registerHooks();

        blogPaginationSwitch.switchOnBlogPaginationIfSiteIsNew(ps);

        if (siteMetadata.generalInfo.isFirstSave(ps)) {
            useNewBlogSocialShareButtons(ps);
        }
    }

    return {
        initialize: initialize
    };

});
