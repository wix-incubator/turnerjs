define(['lodash'], function(_) {
    'use strict';

    var candidatePhoneNumberPattern = /(?:\+|\()?\d(?:[\-\.\(\) \t\u00a0\u1680\u180e\u2000\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]{0,5}\d){6,16}\)?|\*\d{4}/g;
    var emailPattern = /(^|[\s:;,<>])([A-Z0-9][A-Z0-9._%+-]+@[A-Z0-9][A-Z0-9.-]+\.[A-Z]{2,})(?=$|[\s:;,<>])/ig; //http://www.regular-expressions.info/email.html
    var urlPattern = /(^|[\s:;,<>])((?:https?:\/\/|www\.)[a-z0-9](?:\.?[a-z0-9\-%_])*(?:(?:\\|\/)[a-z0-9\-._~:/\\?#\[\]@!$&'()*+,;=%]*)?)(?=$|[^a-z0-9\-._~:/\\?#\[\]@!$&'()*+,;=%])/ig;

    var Pattern = {
        "PHONE": "PHONE",
        "MAIL": "MAIL",
        "URL": "URL"
    };

    function findAll(text, includedPatterns) {
        var results = _.flatten([
            _.get(includedPatterns, 'PHONE') ? findPhoneNumbers(text) : [],
            _.get(includedPatterns, 'MAIL') ? findEmails(text) : [],
            _.get(includedPatterns, 'URL') ? findUrls(text) : []
        ]);

        return resolveCollisions(results);
    }

    function findPhoneNumbers(text) {
        var results = [];
        var singleRegexExec;
        while ((singleRegexExec = candidatePhoneNumberPattern.exec(text))) {
            var value = singleRegexExec[0].match(/[*\d]/g).join("");
            results.push(
                {
                    key: singleRegexExec[0],
                    value: value,
                    index: singleRegexExec.index,
                    pattern: Pattern.PHONE
                }
            );
        }

        return results;
    }

    function findEmails(text) {
        var results = [];
        var singleRegexExec;
        while ((singleRegexExec = emailPattern.exec(text))) {
            var mainCapture = singleRegexExec[2];
            var prefixSize = singleRegexExec[1].length;
            results.push(
                {
                    key: mainCapture,
                    value: mainCapture,
                    index: singleRegexExec.index + prefixSize,
                    pattern: Pattern.MAIL
                }
            );
        }
        return results;
    }

    function findUrls(text) {
        var results = [];
        var singleRegexExec;
        while ((singleRegexExec = urlPattern.exec(text))) {
            var mainCapture = singleRegexExec[2];
            var prefixSize = singleRegexExec[1].length;
            var beginsWithHttp = singleRegexExec[2].toLowerCase().indexOf("http") === 0;
            var value = beginsWithHttp ? mainCapture : "http://" + mainCapture;
            results.push(
                {
                    key: mainCapture,
                    value: value,
                    index: singleRegexExec.index + prefixSize,
                    pattern: Pattern.URL
                }
            );
        }
        return results;
    }

    function resolveCollisions(resultList) {
        return _(resultList)
            .sortByOrder('index', 'asc')
            .transform(function (result, item) {
                var lastItem = _.last(result);
                if (!lastItem || item.index > lastItem.index + lastItem.key.length) {
                    result.push(item);
                }
            }, [])
            .value();
    }

    return {
        Pattern: Pattern,
        findAll: findAll
    };
});
