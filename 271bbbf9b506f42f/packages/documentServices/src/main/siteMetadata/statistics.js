define(['lodash', 'documentServices/siteMetadata/dataManipulation'], function (_, dataManipulation) {
    'use strict';

    function enableCookies(ps, isEnabled) {
        if (!_.isBoolean(isEnabled)) {
            throw new Error('argument isEnabled must be boolean');
        }

        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.SUPPRESS_COOKIES, !isEnabled);
    }

    function areCookiesEnabled(ps) {
        return !dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.SUPPRESS_COOKIES);
    }

    /** @class documentServices.statistics */
    return {
        /** @class documentServices.statistics.cookies */
        cookies: {
            /**
             * Enable/disable the usage of cookies for the site users
             *
             * @function
             * @param {boolean} isEnabled true if cookies should be used with the site users, false otherwise
             */
            enable: enableCookies,

            /**
             * Retrieves the status of the usage of cookies with the site's users
             *
             * @function
             * @returns {boolean} true if cookies are enabled for the site users, false otherwise
             */
            isEnabled: areCookiesEnabled
        }
    };
});
