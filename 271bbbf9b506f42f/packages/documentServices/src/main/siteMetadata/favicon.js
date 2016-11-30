define(['lodash', 'documentServices/siteMetadata/dataManipulation'], function (_, dataManipulation) {
    'use strict';

    /**
     * Enum for Favicon possible errors
     * @enum {string} documentServices.favicon.ERRORS
     * @readonly
     */
    var ERRORS = {
        /** @property {string}*/
        FAVICON_IS_NOT_STRING: 'FAVICON_IS_NOT_STRING'
    };

    function setFavicon(ps, faviconUri) {
        var result = validateFaviconUri(faviconUri);
        if (!result.success) {
            throw new Error(result.errorCode);
        }

        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.FAVICON, faviconUri || '');
    }

    function getFavicon(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.FAVICON);
    }

    function validateFaviconUri(faviconUri) {
        if (!_.isString(faviconUri)) {
            return {success: false, errorCode: ERRORS.FAVICON_IS_NOT_STRING};
        }

        return {success: true};
    }

    /** @class documentServices.favicon */
    return {
        /**
         * Retrieves the site's current Favicon
         *
         * @returns {string} the site's current Favicon
         */
        get: getFavicon,

        /**
         * Sets the site's Favicon
         *
         * @param {string} faviconUri the URI of the requested Favicon
         */
        set: setFavicon,

        ERRORS: ERRORS
    };
});
