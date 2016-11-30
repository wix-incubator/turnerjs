define([
    'lodash',
    'coreUtils',
    'wixUrlParser/parsers/slashUrlParser',
    'wixUrlParser/parsers/hashBangUrlParser',
    'wixUrlParser/utils/urlParserUtils'
], function (_, coreUtils, slashUrlParser, hashBangUrlParser, urlParserUtils) {
    'use strict';

    var FORMAT_PARSERS = {
        slash: slashUrlParser,
        hashBang: hashBangUrlParser
    };


    function useSlashFormat(siteData, url) {
        var urlObj = _.isObject(url) ? url : coreUtils.urlUtils.parseUrl(url);
        //var path = urlObj.path || urlObj.pathname || '';

        if (coreUtils.stringUtils.startsWith(urlObj.hash, '#!')) {
            return false;
        }

        //return path.split('/').length > 2;
        return siteData.isUsingSlashUrlFormat;
    }

    function getFormatParser(siteData, requestedFormat) {
        return FORMAT_PARSERS[requestedFormat || siteData.urlFormat] || FORMAT_PARSERS[siteData.urlFormat];
    }

    function isWixMobileApp(externalBaseUrl, url){
        return url === (externalBaseUrl.replace(/\/$/, '') + '/app');
    }

    /**
     *
     * @param {core.SiteData} siteData
     * @param {string|object} url
     * @returns {{
     *      pageTitle: string,
     *      pageId: string,
     *      pageItemId: ?string,
     *      pageAdditionalData: ?string
     * }}
     */
    function parseUrl(siteData, url) {
        var resolvedSiteData = urlParserUtils.getResolvedSiteData(siteData);

        if (!url || isWixMobileApp(resolvedSiteData.externalBaseUrl, url)) {
            return null;
        }

        if (url === '#') {
            return parseUrl(resolvedSiteData, resolvedSiteData.currentUrl.full);
        }

        if (useSlashFormat(resolvedSiteData, url)) {
            return slashUrlParser.parseUrl(resolvedSiteData, url);
        }

        return hashBangUrlParser.parseUrl(resolvedSiteData, url);
    }

    function getUrl(siteData, pageInfo, forceAddPageInfo, cleanQuery, baseUrl, urlMapping) {
        var resolvedSiteData = urlParserUtils.getResolvedSiteData(siteData);

        var parser = getFormatParser(resolvedSiteData, pageInfo.format);
        return parser.getUrl(resolvedSiteData, pageInfo, forceAddPageInfo, cleanQuery, baseUrl, urlMapping);
    }

    /** @class core.wixUrlParser */
    return {
        getUrl: getUrl,
        parseUrl: parseUrl,
        utils: urlParserUtils
    };
});
