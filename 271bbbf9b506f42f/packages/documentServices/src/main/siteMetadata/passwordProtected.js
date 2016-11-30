define(['lodash', 'utils', 'documentServices/siteMetadata/siteMetadata'], function (_, utils, siteMetadata) {
    'use strict';

    function getPasswordProtectedPages(privateServices) {
        return siteMetadata.getProperty(privateServices, siteMetadata.PROPERTY_NAMES.PASSWORD_PROTECTED_PAGES) || [];
    }

    function updatePasswordProtectedPages(privateServices, pageId, hasPassword) {
        var currentProtectedPages = getPasswordProtectedPages(privateServices);
        var nextProtectedPages = hasPassword ? _.union(currentProtectedPages, [pageId]) : _.difference(currentProtectedPages, [pageId]);
        siteMetadata.setProperty(privateServices, siteMetadata.PROPERTY_NAMES.PASSWORD_PROTECTED_PAGES, nextProtectedPages);
    }

    function isPageProtected(privateServices, pageId) {
        var passwordProtectedPages = getPasswordProtectedPages(privateServices);
        return _.includes(passwordProtectedPages, pageId);
    }

    function setPagePassword(privateServices, pageId, password) {
        var passwordToSet;
        var pagesToHash = siteMetadata.getProperty(privateServices, siteMetadata.PROPERTY_NAMES.SESSION_PAGES_TO_HASH_PASSWORD) || {};
        if (_.isNull(password.value) || password.isHashed) {
            passwordToSet = password.value;
        } else {
            passwordToSet = utils.hashUtils.SHA256.b64_sha256(password.value);
        }

        pagesToHash[pageId] = passwordToSet;
        updatePasswordProtectedPages(privateServices, pageId, passwordToSet);
        siteMetadata.setProperty(privateServices, siteMetadata.PROPERTY_NAMES.SESSION_PAGES_TO_HASH_PASSWORD, pagesToHash);
    }

    function setPageToNoRestriction(privateServices, pageId) {
        setPagePassword(privateServices, pageId, {
            value: null
        });
    }

    function isPagesProtectionOnServerOn () {
        return true;
    }

    return {
        getPasswordProtectedPages: getPasswordProtectedPages,
        isPageProtected: isPageProtected,
        setPagePassword: setPagePassword,
        setPageToNoRestriction: setPageToNoRestriction,
        isPagesProtectionOnServerOn: isPagesProtectionOnServerOn
    };
});
