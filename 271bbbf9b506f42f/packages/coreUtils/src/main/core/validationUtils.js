/**
 * Created by eitanr on 6/12/14.
 */
define(function () {
    'use strict';

    /**
     *  Function: validateUrl
     *      checks if the urlToTest is a valid URL. NOTE: existence (404 check) is not tested for!.
     *
     *  Parameters:
     *      urlToTest - (string) a url to validate.
     *
     *  Returns:
     *      true if valid.
     */
    function isValidUrl(urlToTest) {
        var regexp = /^(?:(?:ftps?:|https?:)?\/\/)?(?:(?:[\u0400-\uA69F\w][\u0400-\uA69F\w-]*)?[\u0400-\uA69F\w]\.)+(?:[\u0400-\uA69Fa-z]+|\d{1,3})(?::[\d]{1,5})?(?:[/?#].*)?$/i;
        return regexp.test(urlToTest);
    }

    function isValidEmail(emailToTest) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(emailToTest);
    }

    function isValidUrlNoProtocol(urlToTest) {
        var regexp = new RegExp("^[\\w\\-_]+(\\.[\\w\\-_]+)+([\\w\\-\\.,@?^=%&*;:/~\\+#!|]*[\\w\\-\\@?^=%&*;/~\\+#!|])?$");
        return regexp.test(urlToTest);
    }

    function isValidTwitterUser(twitterUser) {
        var re = /^@?[a-zA-Z0-9_%]+$/;
        return re.test(twitterUser);
    }

    return {
        isValidEmail: isValidEmail,
        isValidUrl : isValidUrl,
        isValidUrlNoProtocol: isValidUrlNoProtocol,
        isValidTwitterUser: isValidTwitterUser
    };
});
