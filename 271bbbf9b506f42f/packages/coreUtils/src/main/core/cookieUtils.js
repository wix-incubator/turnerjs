define(function () {
    "use strict";

    /**
     * Parse a cookie string into an object
     * @param {string} cookieStr - valid cookie string (; separated key=value pairs)
     */
    function parseCookieString(cookieStr) {
        var cookieObj = {};
        var cookiesArr = cookieStr.split(/;\s*/);
        for (var i = 0, n = cookiesArr.length; i < n; i++) {
            var cookie = cookiesArr[i].split('=');
            cookieObj[cookie[0]] = cookie[1];
        }

        return cookieObj;
    }

    /**
     * Get a cookie by name
     * @param name
     * @returns {string}
     */
    function getCookie(name) {
        if (typeof document === 'undefined') {
           return undefined;
        }
        var cookieAsObj = parseCookieString(window.document.cookie);
        return cookieAsObj[name];
    }

    /**
     * Set a cookie in the browser (client-side only)
     * @param name
     * @param value
     * @param time
     * @param domain
     * @param path
     * @param secure
     */
    function setCookie(name, value, time, domain, path, secure) {
        if (typeof document === 'undefined') {
            return;
        }

        var cookie = name + "=" + value;
        if (time) {
            cookie += ";expires=";
            if (typeof time === 'number'){
                cookie += (new Date((new Date()).getTime() + time)).toGMTString();
            } else {
                cookie += (new Date(time)).toGMTString();
            }

        }
        cookie += ";path=" + (path || "/");
        if (domain) {
            cookie += ";domain=" + domain;
        }
        if (secure) {
            cookie += ";secure";
        }
        window.document.cookie = cookie;
    }

    /**
     * Delete a cookie from the browser (client-side only)
     * @param {string} name - cookie name
     * @param {string} domain - should delete the cookie from the root domain and not the subdomain
     * @param {string} [path] - the path, if it exists
     */
    function deleteCookie(name, domain, path) {
        if (typeof document === 'undefined') {
            return;
        }
        domain = domain || (window.document ? window.document.location.host : "");
        setCookie(name, "", "Thu, 01-Jan-1970 00:00:01", domain, path || "/");
    }

    /**
     * @class utils.cookieUtils
     */
    return {
        parseCookieString: parseCookieString,
        setCookie: setCookie,
        getCookie: getCookie,
        deleteCookie: deleteCookie
    };
});
