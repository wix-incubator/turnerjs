define([
    'loggingUtils', 'coreUtils', 'lodash', 'wixUrlParser/utils/urlParserUtils'
], function (loggingUtils, coreUtils, _, urlParserUtils) {
    'use strict';

    var BLOG_SINGLE_POST_APP_ID = '7326bfbb-4b10-4a8e-84c1-73f776051e10';

    function getSimplyParsedUrl(url) {
        var urlObject;
        if (typeof url === 'string') {
            urlObject = coreUtils.urlUtils.parseUrl(url);
        } else if (url.full) {
            urlObject = url;
        } else {
            loggingUtils.log.error("url to parse has to be either a string or an object");
        }
        return urlObject;
    }

    function isPage(siteData, pageId) {
        return _.includes(siteData.allPageIds, pageId);
    }

    function getPageInfoFromHash(hashString, siteData) {
        var pageInfo = {};
        var imageZoomMatch = hashString.match(/#!(.*?)\/zoom[\/\|](.+?)\/([^\/]+)$/i);

        if (imageZoomMatch) {
            if (imageZoomMatch[1]) {
                pageInfo.title = imageZoomMatch[1];
            }
            pageInfo.pageId = imageZoomMatch[2];
            pageInfo.pageItemId = imageZoomMatch[3];
            pageInfo.imageZoom = true;
        } else {
            var match = hashString.match(/#!(.*?)[\/\|]([^\/]+)\/?(.*$)/i);

            if (match) {
                var title = match[1];
                var itemId = match[2];
                var extraData = match[3];

                if (title) {
                    pageInfo.title = title;
                }

                if (isPage(siteData, itemId)) {
                    pageInfo.pageId = itemId;
                } else {  //wixapps zoom
                    pageInfo.pageId = siteData.primaryPageId || siteData.mainPageId; // if old eCom gallery is placed inside a popup, the popup will close
                    pageInfo.pageItemId = itemId;
                }

                if (extraData) {
                    pageInfo.pageAdditionalData = extraData;
                }

                return pageInfo;
            }

            return {pageId: siteData.mainPageId};
        }

        return pageInfo;
    }

    function concatUrl(siteData, navigationInfo, cleanQuery, baseUrl) {
        var currentUrl = siteData.currentUrl;
        var url = baseUrl || siteData.externalBaseUrl;
        url = url.replace('.' + coreUtils.siteConstants.FREE_DOMAIN.WIXSITE + '/', '.' + coreUtils.siteConstants.FREE_DOMAIN.WIX + '/');
        var query = currentUrl.query;


        if (!cleanQuery && !_.isEmpty(query)) {
            url += '?' + coreUtils.urlUtils.toQueryString(query);
        }

        currentUrl.url = url;

        if (navigationInfo.id) {
            url += '#!' + navigationInfo.title + '/' + navigationInfo.id;
        }

        if (navigationInfo.additionalData) {
            url += '/' + navigationInfo.additionalData;
        }

        return url;
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
        if (!url) {
            return null;
        }

        var urlObject = (url === '#') ? getSimplyParsedUrl(siteData.currentUrl) : getSimplyParsedUrl(url);
        var isLocalDevMode = (urlObject.hostname === 'localhost');

        if (isExternalUrl(siteData, urlObject) && !isLocalDevMode) {
            if (siteData.currentUrl.full === urlObject.full && !_.includes(urlObject.full, '#')) { //support for !Wix! landing pages with aliases
                return {
                    pageId: siteData.mainPageId
                };
            }
            return null; // external url
        }

        if (_.isString(url) && url.indexOf('#!') === 0) {
            urlObject = _.clone(siteData.currentUrl);
            urlObject.hash = url;
        }

        return getPageInfoFromHash(urlObject.hash, siteData);
    }

    function isExternalUrl(siteData, urlObject) {
        return !(coreUtils.urlUtils.isHostnameYandexWebvisor(urlObject.hostname) || isUrlOnSameDomain(siteData, urlObject));
    }

    function isBlogSinglePostPage(siteData, pageId) {
        var pageDataItem = siteData.pagesDataItemsMap[pageId];
        return pageDataItem && pageDataItem.type === 'AppPage' &&
            pageDataItem.appPageType === 'AppPage' &&
            pageDataItem.appPageId === BLOG_SINGLE_POST_APP_ID;
    }

    /**
     * Checks if provided url belongs to the same Wix site
     * @param {core.SiteData} siteData
     * @param {object} candidateUrlObj Parsed url Object
     * @returns {Boolean}
     */

    function isUrlOnSameDomain(siteData, candidateUrlObj) {
        var candidateSiteUrlBase = candidateUrlObj.protocol + '//' + candidateUrlObj.hostname + candidateUrlObj.path;
        return coreUtils.urlUtils.isSame(candidateSiteUrlBase, siteData.externalBaseUrl) ||
            coreUtils.urlUtils.isSame(candidateSiteUrlBase, siteData.unicodeExternalBaseUrl);

    }

    /**
     *
     * @param {core.SiteData} siteData
     * @param {{
     *      pageId: string,
     *      title: string,
     *      pageItemId: ?string,
     *      pageAdditionalData: ?string
     * }} pageInfo there can be pageId and pageItemId only if image zoom
     * @param {bool} forceAddHash - force add to the url the string after the #
     * @returns {string}
     */
    function getUrl(siteData, pageInfo, forceAddHash, cleanQuery, baseUrl, urlMapping) {
        var navigationInfo = {
            title: pageInfo.title || coreUtils.siteConstants.DEFAULT_PAGE_URI_SEO
        };

        if (pageInfo.pageItemId && !pageInfo.pageAdditionalData && pageInfo.imageZoom) {
            navigationInfo.id = 'zoom';
            navigationInfo.additionalData = pageInfo.pageId + '/' + pageInfo.pageItemId;
        } else if (pageInfo.pageId !== siteData.mainPageId || pageInfo.pageAdditionalData || forceAddHash) {
            navigationInfo.id = pageInfo.pageItemId || pageInfo.pageId;
            navigationInfo.additionalData = pageInfo.pageAdditionalData;
        }

        if (isBlogSinglePostPage(siteData, pageInfo.pageId) && urlMapping) {
            var pageAdditionalData = pageInfo.pageAdditionalData || '';
            var map = urlMapping[pageAdditionalData] || urlMapping[decodeURIComponent(pageAdditionalData)] || {};
            navigationInfo.id = pageInfo.pageId;
            navigationInfo.title = map.title;
            navigationInfo.additionalData = map.id;
        }

        return concatUrl(siteData, navigationInfo, cleanQuery, baseUrl);
    }


    function parseUrlWithResolvedSiteData(siteData, url) {
        var resolvedSiteData = urlParserUtils.getResolvedSiteData(siteData);

        return parseUrl(resolvedSiteData, url);
    }

    function getUrlWithResolvedSiteData(siteData, pageInfo, forceAddHash, cleanQuery, baseUrl, urlMapping) {
        var resolvedSiteData = urlParserUtils.getResolvedSiteData(siteData);

        return getUrl(resolvedSiteData, pageInfo, forceAddHash, cleanQuery, baseUrl, urlMapping);
    }

    /** @class core.wixUrlParser */
    return {
        parseUrl: parseUrlWithResolvedSiteData,
        getUrl: getUrlWithResolvedSiteData
    };

});
