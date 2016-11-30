define([
    'documentServices/errors/constants/saveErrors',
    'documentServices/siteMetadata/siteMetadata'
], function(saveErrors, siteMetaData) {
    'use strict';

    return {
        save: saveErrors,
        seo: siteMetaData.seo.ERRORS,
        social: {
            facebook: siteMetaData.social.facebook.ERRORS
        },
        favicon: siteMetaData.favicon.ERRORS,
        siteName: siteMetaData.siteName.ERRORS
    };
});
