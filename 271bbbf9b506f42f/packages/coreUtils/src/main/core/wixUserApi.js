define([
    'lodash',
    'coreUtils/core/languages',
    'coreUtils/core/cookieUtils',
    'coreUtils/core/ajaxLibrary'
], function(_, languages, cookieUtils, ajaxLibrary) {
    "use strict";

    var LANGUAGE_COOKIE = "wixLanguage";
    var HELPER_COOKIE = "wixClient";


    function getClientParams(cookieStr) {
        var paramsCookie = cookieUtils.parseCookieString(cookieStr)[HELPER_COOKIE];

        if (paramsCookie) {
            var params = paramsCookie.split("|");
            return {
                "userName": params[0],
                "email": params[1],
                "mailStatus": params[2],
                "permissions": params[3],
                "isSessionNew": params[4],
                "isSessionValid": params[5],
                "userID": params[6]
            };
        }

        return null;
    }

    function getLanguageFromCookie(cookieStr) {
        return cookieUtils.parseCookieString(cookieStr)[LANGUAGE_COOKIE];
    }

    /** @class siteUtils.wixUserApi */
    var userApi = {
        /**
         * Get wix user's username
         * @param {SiteData} siteData
         * @returns {string|null} username if user is logged in, null otherwise
         */
        getUsername: function (siteData) {
            var cookieStr = siteData.requestModel.cookie;
            var clientParams = getClientParams(cookieStr);

            return clientParams ? clientParams.userName : null;
        },

        /**
         * Get wix user's language
         * @param {SiteData} siteData
         * @returns {string} user language (default 'en')
         */
        getLanguage: function (cookieStr, parsedUrl) {
            var fromCookie = getLanguageFromCookie(cookieStr);
            var fromUrl = parsedUrl.query && parsedUrl.query.lang;
            var fromDomain = function () {
                var parts = parsedUrl.host.split('.');
                return parts[0].length === 2 ? parts[0] : null;
            };
            var fromBrowser = function () {
                if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
                    return window.navigator.language || window.navigator.browserLanguage;
                }
            };

            var lng = fromUrl || fromDomain() || fromCookie || fromBrowser();
            if (lng) {
                lng = lng.substring(0, 2).toLowerCase();
            }

            return _.includes(languages, lng) ? lng : 'en';
        },

        /**
         * Check if the wix user is logged in with a valid session cookie
         * @param {SiteData} siteData
         * @returns {bool}
         */
        isSessionValid: function (cookieStr) {
            return !!getClientParams(cookieStr);
        },

        /**
         * Clear wix user cookies
         */
        logout: function (siteData) {
            var domain = window.document ? window.document.location.host : "";
            domain = domain.substring(domain.indexOf(".") + 1);
            cookieUtils.deleteCookie(HELPER_COOKIE, domain);

            if (typeof document !== 'undefined') {
                siteData.requestModel.cookie = window.document.cookie;
            }
        },

        setLanguage: function (lang, onError, onSuccess) {
            var options = {
                url: "https://users.wix.com//wix-users//user/setLanguage?language=" + lang,
                dataType:"jsonp",
                data: { },
                complete: onSuccess
            };
            ajaxLibrary.temp_jsonp(options);
        },

        getLanguages: function() {
            return languages;
        }
    };

    return userApi;
});
