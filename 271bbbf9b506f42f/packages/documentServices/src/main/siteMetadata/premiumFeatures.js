define(['documentServices/siteMetadata/dataManipulation'], function (dataManipulation) {
    'use strict';

    function getFeatures(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.PREMIUM_FEATURES);
    }

    function setFeatures(ps, features) {
        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.PREMIUM_FEATURES, features);
    }

    /** @class documentServices.premiumFeatures */
    return {
        /**
         * Retrieves the site's premium features
         *
         * @returns {Array.<string>} the site's premium features
         */
        getFeatures: getFeatures,
        /**
         * Set the site's premium features
         *
         * @param {Array.<string>} premiumFeatures the site's premium features
         */
        setFeatures: setFeatures
    };
});
