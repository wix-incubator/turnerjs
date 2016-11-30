define(['lodash', 'utils', 'documentServices/siteMetadata/dataManipulation'], function (_, utils, dataManipulation) {
    'use strict';

    function getUserInfo(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.USER_INFO);
    }

    function getPublicUrl(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.PUBLIC_URL);
    }

    function setPublicUrl(ps, publicUrl) {
        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.PUBLIC_URL, publicUrl);
    }

    function getSiteId(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.SITE_ID);
    }

    function getDocumentType(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.DOCUMENT_TYPE);
    }

    function getMetaSiteId(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.META_SITE_ID);
    }

    function getSiteOriginalTemplateId(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.ORIGINAL_TEMPLATE_ID);
    }

    function getLanguage(ps) {
        //todo Shimi_Liderman 1/27/15 11:18 REMOVE HARD-CODED VALUE WHEN editorModel is provided
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.LANGUAGE_CODE) || 'en';
    }

    function getGeo(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.GEO);
    }

    function getUrlFormat(ps) {
        var urlFormatPointer = ps.pointers.general.getUrlFormat();
        var urlFormat = ps.dal.get(urlFormatPointer);
        return urlFormat || utils.siteConstants.URL_FORMATS.HASH_BANG;
    }

    function isUsingUrlFormat(ps, urlFormat){
        return getUrlFormat(ps) === urlFormat;
    }

    function isUsingSlashUrlFormat(ps) {
        return isUsingUrlFormat(ps, utils.siteConstants.URL_FORMATS.SLASH);
    }

    function getPossibleUrlFormats() {
        return _.clone(utils.siteConstants.URL_FORMATS);
    }

    function isFirstSave(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.NEVER_SAVED) || false;
    }

    function isTemplate(ps) {
        return getSiteId(ps) === getSiteOriginalTemplateId(ps);
    }

    function isSitePublished(ps) {
        var property = dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.IS_PUBLISHED);
        return property !== null ? property : true;
    }

    function pendingApps(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.PENDING_APPS);
    }

    function getUserPermissions(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.PERMISSIONS);
    }

    function isOwner(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.IS_OWNER);
    }

    function getSiteToken(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.SITE_TOKEN);
    }

    function isSiteFromOnBoarding(ps) {
        var clientSpecMap = ps.siteAPI.getClientSpecMap();
        var onBoardingSpec = _.find(clientSpecMap, {type: 'onboarding'});
        var isOnboardingInUse = _.get(onBoardingSpec, 'inUse', false) === true;

        var useOnboradingMetaSiteFlag = dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.USE_ONBOARDING);

        return isOnboardingInUse && (_.isUndefined(useOnboradingMetaSiteFlag) || useOnboradingMetaSiteFlag);
    }

    function setUseOnBoarding(ps, useOnboarding) {
        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.USE_ONBOARDING, useOnboarding);
    }

    /** @class documentServices.generalInfo */
    return {
        /**
         * Retrieves the site owner's user information
         *
         * @returns {Object} the site's owner user information {name: {String}, email: {String}}
         */
        getUserInfo: getUserInfo,

        /**
         * Retrieves the site's public URL
         *
         * @returns {string} the site's public URL
         */
        getPublicUrl: getPublicUrl,

        /**
         * Set the site's public URL
         * @param publicUrl the updated public URL
         */
        setPublicUrl: setPublicUrl,

        /**
         * Retrieves the site's ID
         *
         * @function
         * @returns {string} the site's ID
         */
        getSiteId: getSiteId,

        /**
         * Retrieves the site's MetaSite ID
         *
         * @function
         * @returns {string} the site's MetaSite ID
         */
        getMetaSiteId: getMetaSiteId,

        /**
         * Retrieve the ID of the template from which the site was created
         *
         * @function
         * @returns {string} the original template ID
         */
        getSiteOriginalTemplateId: getSiteOriginalTemplateId,

        /**
         * Retrieves the site's language code, i.e. "en" for "English" //todo Shimi_Liderman 1/1/15 18:57 IS THIS THE USER'S LANGUAGE OR THE SPECIFIC SITE?
         *
         * @returns {string} the site's language code
         */
        getLanguage: getLanguage,

        /**
         * Retrieves the site's owner GEO location identifier i.e. "ISR" for "Israel"
         *
         * @returns {string} the site's language code
         */
        getGeo: getGeo,

        /**
         * Checks if the site was never saved
         *
         * @returns {boolean} true if the site was never saved before, false otherwise
         */
        isFirstSave: isFirstSave,

        /**
         * Checks if the site is template
         *
         * @returns {boolean} true if the site is template, false otherwise
         */
        isTemplate: isTemplate,


        /**
         * Retrieves the document type - template/site
         *
         * @returns {string} document type (template/site)
         */
        getDocumentType: getDocumentType,

        /**
         * Checks if the site is published
         *
         * @returns {boolean} true if the site is published, false otherwise.
         */
        isSitePublished: isSitePublished,

        /**
         * Retrieves the site's url schema
         *
         * @returns {string} usually "hashBang" or "slash"
         */
        getUrlFormat: getUrlFormat,

        /**
         * Tests the site's url schema with user input
         *
         * @returns {boolean}
         */
        isUsingUrlFormat: isUsingUrlFormat,
        /**
         * Tests if site's url schema is "slash"
         *
         * @returns {boolean}
         */
        isUsingSlashUrlFormat: isUsingSlashUrlFormat,

        /**
         * Get an enum with possible url schemas
         *
         * @returns {enum}
         */
        getPossibleUrlFormats: getPossibleUrlFormats,

        pendingApps: pendingApps,

        /**
         * Returns true if the site was generated in ADI (On Boarding)
         * and wasn't saved in Editor1.4 before
         *
         * @returns {boolean}
         */
        isSiteFromOnBoarding: isSiteFromOnBoarding,

        /**
         * Set useOnboarding meta-site flag
         *
         * @param {boolean} useOnboarding
         */
        setUseOnBoarding: setUseOnBoarding,

        /**
         * Retrieves the current editor session user's permission information
         *
         * @returns {Object} the current editor session user's permission
         */
        getUserPermissions: getUserPermissions,

        /**
         * Returns true if the user is the owner of the site, false otherwise
         *
         * @returns {boolean}
         */
        isOwner: isOwner,

        /**
         * Get the site token
         *
         * @returns {string}
         */
        getSiteToken: getSiteToken
    };
});
