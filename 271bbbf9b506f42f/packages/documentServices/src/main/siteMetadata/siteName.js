define(['lodash', 'documentServices/siteMetadata/dataManipulation'], function (_, dataManipulation) {
    'use strict';
    /**
     * Enum for siteName possible errors
     * @enum {string} documentServices.siteName.ERRORS
     * @readonly
     */
    var ERRORS = {
        /** @property {string}*/
        SITE_NAME_IS_EMPTY: 'SITE_NAME_IS_EMPTY',
        /** @property {string}*/
        SITE_NAME_IS_NOT_STRING: 'SITE_NAME_IS_NOT_STRING',
        /** @property {string}*/
        SITE_NAME_INVALID_CHARS: 'SITE_NAME_INVALID_CHARS',
        /** @property {string}*/
        SITE_NAME_ENDS_WITH_HYPHEN: 'SITE_NAME_ENDS_WITH_HYPHEN',
        /** @property {string}*/
        SITE_NAME_TOO_SHORT: 'SITE_NAME_TOO_SHORT',
        /** @property {string}*/
        SITE_NAME_TOO_LONG: 'SITE_NAME_TOO_LONG',
        /** @property {string}*/
        SITE_NAME_ALREADY_EXISTS: 'SITE_NAME_ALREADY_EXISTS'
    };

    var VALIDATIONS = {
        MIN_LENGTH: 4,
        MAX_LENGTH: 20
    };

    function setSiteName(ps, siteName) {
        var result = isSiteNameValid(ps, siteName);
        if (!result.success) {
            throw new Error(result.errorCode);
        }
        var oldSiteName = getSiteName(ps);
        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.SITE_NAME, sanitizeSiteName(siteName));

        if (validateNameForSite(oldSiteName).success) {
            removeSiteNameFromUsedSiteNames(ps, oldSiteName);
        }
    }

    function removeSiteNameFromUsedSiteNames(ps, siteNameToRemove) {
        var usedMetaSiteNames = getUsedMetaSiteNames(ps);
        usedMetaSiteNames = _.without(usedMetaSiteNames, siteNameToRemove);
        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.USED_META_SITE_NAMES, usedMetaSiteNames);
    }

    function isSiteNameValid(ps, siteName) {
        var siteNameValidation = validateNameForSite(siteName);
        if (!siteNameValidation.success) {
            return siteNameValidation;
        }

        if (isDuplicate(ps, siteName)) {
            return {success: false, errorCode: ERRORS.SITE_NAME_ALREADY_EXISTS};
        }

        return {success: true, extraInfo: sanitizeSiteName(siteName)};
    }

    function validateNameForSite(siteName) {
        if (!_.isString(siteName)) {
            return {success: false, errorCode: ERRORS.SITE_NAME_IS_NOT_STRING};
        }

        if (_.isEmpty(siteName)) {
            return {success: false, errorCode: ERRORS.SITE_NAME_IS_EMPTY};
        }

        var invalidChars = getInvalidChars(siteName);

        if (invalidChars && invalidChars.length) {
            return {success: false, errorCode: ERRORS.SITE_NAME_INVALID_CHARS, errorContent: invalidChars};
        }

        if (isEndingWithHyphen(siteName)){
            return {success: false, errorCode: ERRORS.SITE_NAME_ENDS_WITH_HYPHEN};
        }

        siteName = sanitizeSiteName(siteName);

        if (siteName.length < VALIDATIONS.MIN_LENGTH) {
            return {success: false, errorCode: ERRORS.SITE_NAME_TOO_SHORT};
        }

        if (siteName.length > VALIDATIONS.MAX_LENGTH) {
            return {success: false, errorCode: ERRORS.SITE_NAME_TOO_LONG};
        }

        return {success: true, extraInfo: sanitizeSiteName(siteName)};
    }

    /**
     * @param siteName
     * @returns {Array} match result for the unique invalid chars
     */
    function getInvalidChars(siteName) {
        return _.uniq(siteName.match(/[^a-zA-Z0-9\s\-]/g));
    }

    /**
     * @param siteName
     * @returns {boolean}
     */
    function isEndingWithHyphen(siteName) {
        return siteName.slice(-1) === '-';
    }

    function getSiteName(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.SITE_NAME);
    }

    /**
     * @param {Object} ps
     * @param siteName
     * @returns {boolean}
     */
    function isDuplicate(ps, siteName) {
        siteName = sanitizeSiteName(siteName);
        return _.includes(_.invoke(getUsedMetaSiteNames.call(this, ps), 'toLowerCase'), siteName);
    }

    function getUsedMetaSiteNames(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.USED_META_SITE_NAMES);
    }

    function markSiteNameAsUsed(ps, newSiteName){
        var usedSiteNames = dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.USED_META_SITE_NAMES);
        usedSiteNames.push(newSiteName);
        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.USED_META_SITE_NAMES, usedSiteNames);
    }

    /**
     * @param {string} siteName
     * @returns {string}
     */
    function sanitizeSiteName(siteName) {
        return siteName.replace(/([^\s\w\d_\-])/g, '').replace(/\s+/g, '-').replace(/-+$/g, '').toLowerCase();
    }

    /** @class documentServices.siteName */
    return {
        /**
         * Sets the site name
         *
         * @param {string} siteName the site's name
         */
        set: setSiteName,

        /**
         * Retrieves the site name
         *
         * @returns {string} the site's name
         */
        get: getSiteName,

        sanitize: function(ps, name) {
            return sanitizeSiteName(name);
        },

        /**
         * Validates a site name
         *
         * @param {string} siteName a site name candidate
         * @returns {ValidationResult} validation result object {success: {boolean}, errorCode: {ERRORS}, errorContent: {string}}
         */
        validate: isSiteNameValid,

        /**
         * Retrieves the user's already used site names
         *
         * @returns {[string]} an array of the already used site names
         */
        getUsedSiteNames: getUsedMetaSiteNames,

        markSiteNameAsUsed: markSiteNameAsUsed,

        ERRORS: ERRORS
    };
});
