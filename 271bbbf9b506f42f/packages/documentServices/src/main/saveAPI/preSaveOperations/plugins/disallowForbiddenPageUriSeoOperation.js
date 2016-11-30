define(['lodash', 'utils', 'documentServices/page/pageData'], function (_, utils, pageData) {
    'use strict';

    return function (ps) {
        var urlFormatPointer = ps.pointers.general.getUrlFormat();
        var urlFormat = ps.dal.get(urlFormatPointer);

        if (urlFormat === utils.siteConstants.URL_FORMATS.HASH_BANG) {
            return;
        }

        var pageIds = pageData.getPagesList(ps);
        var forbidden = pageData.getForbiddenPageUriSEOs(ps);

        var forbiddenPageUriSEO = _.reduce(pageIds, function (res, pageId) {
            var pageUriSEO = pageData.getPageUriSEO(ps, pageId);
            if (pageUriSEO && forbidden[pageUriSEO.toLowerCase()]) {
                res.push(pageUriSEO);
            }
            return res;
        }, []);

        if (!_.isEmpty(forbiddenPageUriSEO)) {
            throw new Error('Found pages with forbidden url title: ' + JSON.stringify(forbiddenPageUriSEO));
        }
    };
});
