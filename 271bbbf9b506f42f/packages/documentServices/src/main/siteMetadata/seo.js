define(['lodash', 'utils', 'documentServices/siteMetadata/dataManipulation'], function (_, utils, dataManipulation) {
    'use strict';

    var ajaxLibrary = utils.ajaxLibrary;

    /**
     * Enum for SEO possible errors
     * @enum {String} documentServices.seo.ERRORS
     */
    var ERRORS = {
        /** @property {string}*/
        SE_ENABLE_INDEX_PARAM_IS_NOT_BOOLEN: 'SE_ENABLE_INDEX_PARAM_IS_NOT_BOOLEN',
        /** @property {string}*/
        TEXT_IS_NOT_STRING: 'TEXT_IS_NOT_STRING',
        /** @property {string}*/
        TEXT_TOO_LONG: 'TEXT_TOO_LONG',
        /** @property {string}*/
        TEXT_INVALID_CHARS: 'TEXT_INVALID_CHARS',
        /** @property {string}*/
        KEYWORDS_INVALID_CHARS: 'KEYWORDS_INVALID_CHARS',
        /** @property {string}*/
        METATAGS_INVALID_FORMAT: 'METATAGS_INVALID_FORMAT',
        /** @property {string}*/
        METATAGS_INVALID_CHARS: 'METATAGS_INVALID_CHARS',
        /** @property {string}*/
        METATAGS_SERVER_INVALID_CODE: 'METATAGS_SERVER_INVALID_CODE',
        /** @property {string}*/
        METATAGS_SERVER_INVALID_TAG: 'METATAGS_SERVER_INVALID_TAG',
        /** @property {string}*/
        REDIRECT_INVALID_CHARS: 'REDIRECT_INVALID_CHARS',
        /** @property {string}*/
        REDIRECT_URI_MAPPING_IS_NOT_OBJECT: 'REDIRECT_URI_MAPPING_IS_NOT_OBJECT',
        /** @property {string}*/
        REDIRECT_FROM_URIS_IS_NOT_ARRAY: 'REDIRECT_FROM_URIS_IS_NOT_ARRAY',
        /** @property {string}*/
        REDIRECT_MAPPING_INVALID_FORMAT: 'REDIRECT_MAPPING_INVALID_FORMAT',
        /** @property {string}*/
        REDIRECT_MAPPING_URIS_NOT_STRING: 'REDIRECT_MAPPING_URIS_NOT_STRING',
        /** @property {string}*/
        SERVER_VALIDATION_TIMEOUT: 'SERVER_VALIDATION_TIMEOUT'
    };

    var VALIDATIONS = {
        TITLE_MAX_LENGTH: 70,
        DESCRIPTION_MAX_LENGTH: 160,
        KEYWORDS_MAX_LENGTH: 250,
        METATAGS_MAX_LENGTH: 2000,
        REDIRECT_MAX_LENGTH: 149
    };

    var META_OR_LINK_OR_COMMENT_TAG_REGEX = /^\s*((((<meta|<link)\s[^>]*>*[\s\n]*)*>)|[\s\n]*(<!--[^<>]*-->)[\s\n]*)*[\s\n]*$/i;

    var VALIDATIONS_REGEX = {
        HTML_CHARS: /[<>]/g,
        KEYWORD_CHARS: /[!#$%^&()+=\]\[}{";:\/><~]/g,
        META_TAG: META_OR_LINK_OR_COMMENT_TAG_REGEX,
        URI_CHARS: /[^.,';()%@!?$&*+~a-zA-Z0-9\[\]_:\/\"\n=-]/gi
    };

    function validateTitle(ps, title) {
        if (!_.isString(title)) {
            return {success: false, errorCode: ERRORS.TEXT_IS_NOT_STRING};
        }

        if (title.length > VALIDATIONS.TITLE_MAX_LENGTH) {
            return {success: false, errorCode: ERRORS.TEXT_TOO_LONG};
        }

        var invalidHTMLChars = getInvalidHTMLChars(title);

        if (invalidHTMLChars && invalidHTMLChars.length) {
            return {success: false, errorCode: ERRORS.TEXT_INVALID_CHARS, errorContent: invalidHTMLChars};
        }

        return {success: true};
    }

    /**
     *
     * @param {string} description
     * @returns {Object}
     */
    function validateDescription(ps, description) {
        if (!_.isString(description)) {
            return {success: false, errorCode: ERRORS.TEXT_IS_NOT_STRING};
        }

        if (description.length > VALIDATIONS.DESCRIPTION_MAX_LENGTH) {
            return {success: false, errorCode: ERRORS.TEXT_TOO_LONG};
        }

        var invalidHTMLChars = getInvalidHTMLChars(description);

        if (invalidHTMLChars && invalidHTMLChars.length) {
            return {success: false, errorCode: ERRORS.TEXT_INVALID_CHARS, errorContent: invalidHTMLChars};
        }

        return {success: true};
    }

    /**
     * @param {string} keywords
     * @returns {Object}
     */
    function validateKeywords(ps, keywords) {
        if (!_.isString(keywords)) {
            return {success: false, errorCode: ERRORS.TEXT_IS_NOT_STRING};
        }

        if (keywords.length > VALIDATIONS.KEYWORDS_MAX_LENGTH) {
            return {success: false, errorCode: ERRORS.TEXT_TOO_LONG};
        }

        var invalidChars = getInvalidKeywordChars(keywords);

        if (invalidChars && invalidChars.length) {
            return {success: false, errorCode: ERRORS.KEYWORDS_INVALID_CHARS, errorContent: invalidChars};
        }

        return {success: true};
    }

    /**
     *
     * @param ps
     * @param metaTags
     * @param onSuccess
     * @param onFailure
     * @return {*}
     */
    function validateCustomHeadTags(ps, metaTags, onSuccess, onFailure) {
        if (!_.isString(metaTags)) {
            onFailure({success: false, errorCode: ERRORS.TEXT_IS_NOT_STRING});
            return;
        }

        if (_.isEmpty(metaTags)) {
            onSuccess({success: true});
        }

        if (metaTags.length > VALIDATIONS.METATAGS_MAX_LENGTH) {
            onFailure({success: false, errorCode: ERRORS.TEXT_TOO_LONG});
            return;
        }

        if (!isLegalMetaTag(metaTags)) {
            onFailure({success: false, errorCode: ERRORS.METATAGS_INVALID_FORMAT});
            return;
        }

        validateMetaTagsOnServer(metaTags, onSuccess, onFailure);
    }

    function onMetaTagsServerValidationSuccess(onSuccess, onFailure, response) {
        if (response.success) {
            onSuccess({success: true});
        } else {
            var errorCode = response.errorCode;
            var errorDescription = response.errorDescription;
            var formattedErrorCode = '';
            var formattedErrorContent;

            if (errorCode === 0) {
                formattedErrorCode = ERRORS.SERVER_VALIDATION_TIMEOUT;
            } else {
                //todo Shimi_Liderman 1/4/15 17:37 Talk to server to separate these to 2 different errorCodes, and to
                //return the invalid tag as an extra parameter instead of us having to parse the description
                var matchedErrors = errorDescription.match(/'(.*)' tags are not allowed/);
                var invalidPartIndicator = matchedErrors && _.size(matchedErrors) >= 1 ? matchedErrors[1] : '';
                switch (invalidPartIndicator) {
                    case '':
                    case '#text':
                        formattedErrorCode = ERRORS.METATAGS_SERVER_INVALID_CODE;
                        break;
                    default:
                        formattedErrorCode = ERRORS.METATAGS_SERVER_INVALID_TAG;
                        formattedErrorContent = invalidPartIndicator;
                        break;
                }
            }
            onFailure({success: false, errorCode: formattedErrorCode, errorContent: formattedErrorContent});
        }
    }

    function onMetaTagsServerValidationError(callback) {
        callback({success: false});
    }

    function validateMetaTagsOnServer(metaTags, onSuccess, onFailure) {
        ajaxLibrary.ajax({
            type: 'POST',
            url: '//editor.wix.com/html/head-tags/validate', //the '//' prefix will select the current protocol (http/https/file)
            contentType: 'text/plain; charset=utf-8',
            data: metaTags,
            success: onMetaTagsServerValidationSuccess.bind(null, onSuccess, onFailure),
            error: onMetaTagsServerValidationError.bind(null, onFailure)
        });
    }

    /**
     * @param {Object.<String, String>}uriMappings
     * @returns {Object}
     */
    function validateRedirectUrls(ps, uriMappings) {
        if (!_.isObject(uriMappings)) {
            return {success: false, errorCode: ERRORS.REDIRECT_URI_MAPPING_IS_NOT_OBJECT};
        }

        var errorResult = null;
        _.forEach(uriMappings, function (toUri, fromUri) {
            if (!_.isString(fromUri) || !_.isString(toUri)) {
                errorResult = errorResult || {success: false, errorCode: ERRORS.REDIRECT_MAPPING_URIS_NOT_STRING};
                return;
            }

            if (fromUri.length > VALIDATIONS.REDIRECT_MAX_LENGTH) {
                errorResult = errorResult || {success: false, errorCode: ERRORS.TEXT_TOO_LONG};
                return;
            }

            var invalidFromUriChars = getInvalidUriChars(fromUri);

            if (invalidFromUriChars && invalidFromUriChars.length) {
                errorResult = errorResult || {success: false, errorCode: ERRORS.REDIRECT_INVALID_CHARS, errorContent: invalidFromUriChars};
                return;
            }
        });

        return errorResult || {success: true};
    }

    /**
     * @param {String} str
     * @returns {Array}
     */
    function getInvalidUriChars(str) {
        return _.uniq(str.match(VALIDATIONS_REGEX.URI_CHARS));
    }

    /**
     * @param {String} str
     * @returns {Array}
     */
    function getInvalidHTMLChars(str) {
        return _.uniq(str.match(VALIDATIONS_REGEX.HTML_CHARS));
    }

    /**
     * @param {String} str
     * @returns {Array}
     */
    function getInvalidKeywordChars(str) {
        return _.uniq(str.match(VALIDATIONS_REGEX.KEYWORD_CHARS));
    }

    /**
     * @param {String} str
     * @returns {boolean}
     */
    function isLegalMetaTag(str) {
        return !_.isEmpty(str) && VALIDATIONS_REGEX.META_TAG.test(str);
    }

    function enableIndexing(ps, isEnabled) {
        if (!_.isBoolean(isEnabled)) {
            throw new Error(ERRORS.SE_ENABLE_INDEX_PARAM_IS_NOT_BOOLEN);
        }
        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.SE_INDEXABLE, isEnabled);
    }

    function isIndexingEnabled(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.SE_INDEXABLE);
    }

    function setTitle(ps, title) {
        var result = validateTitle(ps, title);
        if (!result.success) {
            throw new Error(result.errorCode);
        }

        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.SEO_TITLE, title);
    }

    function getTitle(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.SEO_TITLE);
    }

    function createSeoMetaTag(tagName){
        return {
            name: tagName,
            value: '',
            isProperty: false //seo meta tags are <meta name= ... > and not <meta property= ... >
        };
    }

    function updateSeoMetaTag(ps, tagName, value){
        var metaTags = dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.META_TAGS);
        var seoMetaTag = _.find(metaTags, {name: tagName});
        if (!seoMetaTag){
            seoMetaTag = createSeoMetaTag(tagName);
            metaTags.push(seoMetaTag);
        }
        seoMetaTag.value = value;
        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.META_TAGS, metaTags);
    }

    function setDescription(ps, description) {
        var result = validateDescription(ps, description);
        if (!result.success) {
            throw new Error(result.errorCode);
        }
        updateSeoMetaTag(ps, 'description', description);
    }

    function getDescription(ps) {
        var metaTags = dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.META_TAGS);
        var description = _.find(metaTags, {name: 'description'});
        return description && description.value || '';
    }

    function setKeywords(ps, keywords) {
        var result = validateKeywords(ps, keywords);
        if (!result.success) {
            throw new Error(result.errorCode);
        }

        updateSeoMetaTag(ps, 'keywords', keywords);
    }

    function getKeywords(ps) {
        var metaTags = dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.META_TAGS);
        var keywords = _.find(metaTags, {name: 'keywords'});
        return keywords && keywords.value || '';
    }

    function setCustomHeadTags(ps, metaTags, onSuccess, onError) {
        validateCustomHeadTags(
            ps,
            metaTags,
            function () {
                dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.CUSTOM_HEAD_TAGS, metaTags);
                onSuccess();
            },
            function (validationResult) {
                onError(validationResult.errorCode);
            });
    }

    function getCustomHeadTags(ps) {
        return dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.CUSTOM_HEAD_TAGS);
    }

    function updateRedirectUrls(ps, uriMappings) {
        var result = validateRedirectUrls(ps, uriMappings);
        if (!result.success) {
            throw new Error(result.errorCode);
        }

        var currentMappings = dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.EXTERNAL_URI_MAPPINGS);
        var formattedCurrentMappings = {};
        _.forEach(currentMappings, function (mapping) {
            var fromUri = mapping.fromExternalUri;
            var toUri = mapping.toWixUri;

            formattedCurrentMappings[fromUri] = toUri;
        });
        var mergedMappings = _.merge(formattedCurrentMappings, uriMappings, function (oldToUrl, newToUrl) {
            return _.isEmpty(newToUrl) ? oldToUrl : newToUrl;
        });
        var formattedMergedMappings = _.map(mergedMappings, function (toUri, fromUri) {
            return {
                fromExternalUri: fromUri,
                toWixUri: toUri
            };
        });

        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.EXTERNAL_URI_MAPPINGS, formattedMergedMappings);
    }

    function getRedirectUrls(ps) {
        var existingUrls = dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.EXTERNAL_URI_MAPPINGS);
        var formattedUrls = {};
        _.forEach(existingUrls, function (mapping) {
            formattedUrls[mapping.fromExternalUri] = mapping.toWixUri;
        });
        return formattedUrls;
    }

    function removeRedirectUrls(ps, fromUris) {
        if (!_.isArray(fromUris)) {
            throw new Error(ERRORS.REDIRECT_FROM_URIS_IS_NOT_ARRAY);
        }

        var currentMappings = dataManipulation.getProperty(ps, dataManipulation.PROPERTY_NAMES.EXTERNAL_URI_MAPPINGS);
        var newMappings = _.filter(currentMappings, function (mapping) {
            var fromUri = mapping.fromExternalUri;
            return !_.includes(fromUris, fromUri);
        });
        dataManipulation.setProperty(ps, dataManipulation.PROPERTY_NAMES.EXTERNAL_URI_MAPPINGS, newMappings);
        return true;
    }

    /** @class documentServices.seo */
    return {
        ERRORS: ERRORS,

        /** @class documentServices.seo.indexing */
        indexing: {
            /**
             * Enables/disables Search Engine indexing of the site
             *
             * @param {boolean} isEnabled should the indexing be enabled
             */
            enable: enableIndexing,
            /**
             * Checks if Search Engine indexing is enabled for the site
             *
             * @returns {boolean} true if the site is Search Engine indexable, else false
             */
            isEnabled: isIndexingEnabled
        },
        /** @class documentServices.seo.title */
        title: {
            /**
             * Sets the site title
             *
             * @param {string} title the site title
             */
            set: setTitle,

            /**
             * Retrieves the site title
             *
             * @returns {string} the site title
             */
            get: getTitle,

            /**
             * Validates a site title
             *
             * @param {string} title a site title candidate
             * @returns {ValidationResult} validation result object {success: {boolean}, errorCode: {ERRORS}, errorContent: {string}}
             */
            validate: validateTitle
        },
        /** @class documentServices.seo.description */
        description: {

            /**
             * Sets the site description
             *
             * @param {string} description the site description
             */
            set: setDescription,

            /**
             * Retrieves the site description
             *
             * @returns {string} the site description
             */
            get: getDescription,

            /**
             * Validates a site description
             *
             * @param {string} title a site description candidate
             * @returns {ValidationResult} validation result object {success: {boolean}, errorCode: {ERRORS}, errorContent: {string}}
             */
            validate: validateDescription
        },
        /** @class documentServices.seo.keywords */
        keywords: {

            /**
             * Sets the site SEO keywords
             *
             * @param {string} keywords the site SEO keywords
             */
            set: setKeywords,

            /**
             * Retrieves the site SEO keywords
             *
             * @function
             * @returns {string} the site SEO keywords
             */
            get: getKeywords,

            /**
             * Validate SEO keywords of a site
             *
             * @param {string} keywords a site SEO keywords candidate
             * @returns {ValidationResult} validation result object {success: {boolean}, errorCode: {ERRORS}, errorContent: {string}}
             */
            validate: validateKeywords
        },
        /** @class documentServices.seo.metaTags */
        headTags: {
            /**
             * Sets the site's custom Head Meta Tags
             *
             * @param {string} metaTags the site Meta Tags
             * @param {function()} onSuccess will be called on success
             * @param {function()} onError will be called on error
             */
            set: setCustomHeadTags,

            /**
             * Retrieves the site custom Head Meta Tags
             *
             * @returns {string} the site Meta Tags
             */
            get: getCustomHeadTags,

            /**
             * Validates custom Head Meta Tags of a site
             *
             * @param {string} keywords a site Meta Tags candidate
             * @param {function(ValidationResult)} onSuccess will be called on validation success, with the following-formatted object { success: true }
             * @param {function(ValidationResult)} onFailure will be called on validation failure, with the following-formatted object { success: false, errorCode: {ERRORS}, errorContent: {string} }
             */
            validate: validateCustomHeadTags
        },
        /** @class documentServices.seo.redirectUrls */
        redirectUrls: {
            /**
             * Updates site's URL Redirection mapping
             *
             * @function
             * @param {Object.<string, string>} uriMappings an object with mappings between "from-uri"s and "to-uri"s
             */
            update: updateRedirectUrls,

            /**
             * Removes Redirect URLs for the site
             *
             * @function
             * @param {Array.<string>} fromUris an array of "from-uri"s to be removed from the redirections list
             */
            remove: removeRedirectUrls,

            /**
             * Retrieves the site's URL Redirection mapping
             *
             * @function
             * @returns {Object.<string, string>} an object with mappings between "from-uri"s and "to-uri"s
             */
            get: getRedirectUrls,

            /**
             * Validates URL Redirection mapping of a site
             *
             * @function
             * @param {Object.<string, string>} uriMappings an object with mappings between "from-uri"s and "to-uri"s
             * @returns {ValidationResult} validation result object {success: {boolean}, errorCode: {ERRORS}, errorContent: {string}}
             */
            validate: validateRedirectUrls
        }
    };
});
