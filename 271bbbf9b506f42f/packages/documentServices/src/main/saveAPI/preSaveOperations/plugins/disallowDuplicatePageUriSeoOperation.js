define(['lodash', 'utils', 'documentServices/page/pageData'], function (_, utils, pageData) {
    'use strict';

    function largerThanOne(value) {
        return value > 1;
    }

    return function (ps) {
        var urlFormatPointer = ps.pointers.general.getUrlFormat();
        var urlFormat = ps.dal.get(urlFormatPointer);

        if (urlFormat === utils.siteConstants.URL_FORMATS.HASH_BANG) {
            return;
        }

        var pageIds = pageData.getPagesList(ps);
        var duplicateUriSEO = _(pageIds).map(pageData.getPageUriSEO.bind(null, ps)).countBy().pick(largerThanOne).value();
        if (!_.isEmpty(duplicateUriSEO)) {
            throw new Error('Found pages with duplicate url title: ' + JSON.stringify(duplicateUriSEO));
        }
    };
});
