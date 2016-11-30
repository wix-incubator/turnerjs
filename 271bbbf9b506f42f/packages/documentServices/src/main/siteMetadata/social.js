define(['lodash', 'documentServices/siteMetadata/dataManipulation'], function (_, dataManipulation) {
    'use strict';

    /**
     * Enum for social possible errors
     * @enum {string} documentServices.social.ERRORS
     * @readonly
     */
    var FB_ERRORS = {
        /** @property {string}*/
        FB_USERNAME_IS_NOT_STRING: 'FB_USERNAME_IS_NOT_STRING',
        /** @property {string}*/
        FB_USERNAME_INVALID_CHARS: 'FB_USERNAME_INVALID_CHARS',
        /** @property {string}*/
        FB_USERNAME_TOO_LONG: 'FB_USERNAME_TOO_LONG',
        /** @property {string}*/
        FB_THUMBNAIL_IS_NOT_STRING: 'FB_THUMBNAIL_IS_NOT_STRING'
    };

    var VALIDATIONS = {
        FB_USERNAME_MAX_LENGTH: 250
    };

    function setFacebookThumbnail(ps, thumbnailUri) {
        var result = validateFacebookThumbnail(thumbnailUri);
        if (!result.success) {
            throw new Error(result.errorCode);
        }

        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.SOCIAL_THUMBNAIL, thumbnailUri || '');
    }

    function getFacebookThumbnail(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.SOCIAL_THUMBNAIL);
    }

    function setFacebookUsername(ps, userName) {
        var result = validateFacebookUsername(ps, userName);
        if (!result.success) {
            throw new Error(result.errorCode);
        }

        var metaTags = dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.META_TAGS);
        _.find(metaTags, {name: 'fb_admins_meta_tag'}).value = userName || '';

        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.META_TAGS, metaTags);
    }

    function getFacebookUsername(ps) {
        var metaTags = dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.META_TAGS);
        return _.find(metaTags, {name: 'fb_admins_meta_tag'}).value;
    }

    function validateFacebookThumbnail(thumbnailUri) {
        if (!_.isString(thumbnailUri)) {
            return {success: false, errorCode: FB_ERRORS.FB_THUMBNAIL_IS_NOT_STRING};
        }

        return {success: true};
    }

    function validateFacebookUsername(ps, userName) {
        if (!_.isString(userName)) {
            return {success: false, errorCode: FB_ERRORS.FB_USERNAME_IS_NOT_STRING};
        }

        if (userName.length > VALIDATIONS.FB_USERNAME_MAX_LENGTH) {
            return {success: false, errorCode: FB_ERRORS.FB_USERNAME_TOO_LONG};
        }

        var invalidChars = getInvalidChars(userName);

        if (invalidChars && invalidChars.length) {
            return {success: false, errorCode: FB_ERRORS.FB_USERNAME_INVALID_CHARS, errorContent: invalidChars};
        }

        return {success: true};
    }


    /**
     * @param siteName
     * @returns {Array} match result for the unique invalid chars
     */
    function getInvalidChars(siteName) {
        return _.uniq(siteName.match(/[^a-zA-Z0-9\.]/g));
    }

    /** @class documentServices.social */
    return {
        /** @class documentServices.social.facebook */
        facebook: {
            /**
             * Sets the site's Facebook thumbnail
             *
             * @param {string} thumbnailUri the URL of the requested thumbnail
             */
            setThumbnail: setFacebookThumbnail,

            /**
             * Retrieves the site's Facebook thumbnail
             *
             * @returns {string} the site's Facebook thumbnail URL
             */
            getThumbnail: getFacebookThumbnail,

            /**
             * Sets the site's Facebook username
             *
             * @param {string} userName the requested Facebook username (can only contain alphanumeric chars and the dot)
             */
            setUsername: setFacebookUsername,

            /**
             * Retrieves the site's Facebook username
             *
             * @returns {string} the site's Facebook username
             */
            getUsername: getFacebookUsername,

            /**
             * Validates a Facebook username
             *
             * @param {string} userName a Facebook username candidate
             * @returns {ValidationResult} validation result object {success: {boolean}, errorCode: {ERRORS}, errorContent: {string}}
             */
            validateUsername: validateFacebookUsername,

            ERRORS: FB_ERRORS
        }
    };
});
