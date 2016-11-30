define(['lodash', 'coreUtils', 'experiment', 'wixUrlParser/utils/urlParserUtils'], function (_, coreUtils, experiment, urlParserUtils) {
    'use strict';

    var LIGHT_BOX = 'lightbox';
    var RESERVED_QUERY_WORDS = [LIGHT_BOX];
    var BLOG_SINGLE_POST_APP_ID = '7326bfbb-4b10-4a8e-84c1-73f776051e10';
    var BLOG_POSTS_LIST_APP_ID = '79f391eb-7dfc-4adf-be6e-64434c4838d9';
    var PERMALINK_PREFIX = '_p';
    var URL_SEGMENTS_BEFORE_INNER_URL = {
        PREVIEW: 7,
        WIX_INTERNAL: 2,
        FREE_SITE: 1,
        PREMIUM: 0,
        REVIEW: 3,
        BEAKER: 3
    };
    var GOOGLE_CACHE_HOSTNAME = 'webcache.googleusercontent.com';


    function isFreeOrWixSite(siteData) {
        var host = coreUtils.urlUtils.parseUrl(siteData.externalBaseUrl).host;
        return _.endsWith(host, '.' + coreUtils.siteConstants.FREE_DOMAIN.WIXSITE) || _.endsWith(host, '.' + siteData.serviceTopology.baseDomain);
    }

    function isPremiumDomainConnected(siteData) {
        return siteData.isPremiumDomain && !isFreeOrWixSite(siteData);
    }

    function isWixSiteTemplateAddress(siteData) {
        var fullUrl = _.isObject(siteData.currentUrl) ? siteData.currentUrl.full : coreUtils.urlUtils.parseUrl(siteData.currentUrl).full;
        return siteData.isTemplate && _.startsWith(fullUrl, siteData.serviceTopology.basePublicUrl);
    }

    function getPathPartsCount(siteData) {
        if (window.karmaIntegration) {
            return URL_SEGMENTS_BEFORE_INNER_URL.BEAKER;
        }

        if (siteData.isFeedbackEndpoint) {
            return URL_SEGMENTS_BEFORE_INNER_URL.REVIEW;
        }

        if (!siteData.isViewerMode) {
            return URL_SEGMENTS_BEFORE_INNER_URL.PREVIEW;
        }

        if (isPremiumDomainConnected(siteData)) {
            return URL_SEGMENTS_BEFORE_INNER_URL.PREMIUM;
        }

        if (siteData.isWixSite || (isWixSiteTemplateAddress(siteData))) {
            return URL_SEGMENTS_BEFORE_INNER_URL.WIX_INTERNAL;
        }

        return URL_SEGMENTS_BEFORE_INNER_URL.FREE_SITE;
    }

    function encodeEachUriComponent(uriParts) {
        return _.map(uriParts, encodeURIComponent);
    }

    function decodeEachUriComponent(uriParts) {
        return _.map(uriParts, decodeURIComponent);
    }

    function getPageIdByUriSeoFromData(siteData, pageUriSeo) {
        var pageData = _.find(siteData.pagesDataItemsMap, {pageUriSEO: pageUriSeo});

        return pageData && pageData.id;
    }

    function getPageIdByUriSeo(siteData, pageUriSeo) {
        var pageIdFromMap = _.get(siteData.mapFromPageUriSeoToPageId, pageUriSeo);

        if (experiment.isOpen('sv_dpages')) {
            return pageIdFromMap || getPageIdByUriSeoFromData(siteData, pageUriSeo) || coreUtils.errorPages.IDS.NOT_FOUND;
        }

        return pageIdFromMap || getPageIdByUriSeoFromData(siteData, pageUriSeo) || siteData.mainPageId;
    }

    function getRelevantPathParts(siteData, path) {
        var baseUrlParts = coreUtils.urlUtils.parseUrl(siteData.externalBaseUrl);
        var drop = baseUrlParts.path.replace(/\/$/, '').split('/').length;

        return path ? _.drop(path.split('/'), drop) : [];
    }

    function isPermalinkPrefix(prefix) {
        return prefix === PERMALINK_PREFIX;
    }

    function isPermalink(siteData, id) {
        if (!id) {
            return false;
        }

        return !!siteData.permalinksMap[id];
    }

    function isTpaPage(siteData, pageId) {
        var pageDataItem = siteData.pagesDataItemsMap[pageId];
        return pageDataItem && pageDataItem.type === 'Page' && pageDataItem.tpaApplicationId > 0;
    }

    function isListBuilderPage(siteData, pageId) {
        var pageDataItem = siteData.pagesDataItemsMap[pageId];
        return pageDataItem && pageDataItem.type === 'AppPage' && pageDataItem.appPageType === 'AppBuilderPage';
    }

    function isBlogSinglePostPage(siteData, pageId) {
        var pageDataItem = siteData.pagesDataItemsMap[pageId];
        return pageDataItem && pageDataItem.type === 'AppPage' &&
            pageDataItem.appPageType === 'AppPage' &&
            pageDataItem.appPageId === BLOG_SINGLE_POST_APP_ID;
    }

    function isBlogPostsListPage(siteData, pageId) {
        var pageDataItem = siteData.pagesDataItemsMap[pageId];
        return pageDataItem && pageDataItem.type === 'AppPage' &&
            pageDataItem.appPageType === 'AppPage' &&
            pageDataItem.appPageId === BLOG_POSTS_LIST_APP_ID;
    }

    function isBlogPage(siteData, pageId) {
        return isBlogPostsListPage(siteData, pageId) || isBlogSinglePostPage(siteData, pageId);
    }

    function isUrlOnSameWixSite(siteData, candidateUrlObj) {
        var candidateSiteUrlBase = coreUtils.urlUtils.getBaseUrlWithPath(candidateUrlObj, getPathPartsCount(siteData));
        return coreUtils.urlUtils.isSame(candidateSiteUrlBase, siteData.externalBaseUrl) ||
            coreUtils.urlUtils.isSame(candidateSiteUrlBase, siteData.unicodeExternalBaseUrl) ||
            coreUtils.urlUtils.isHostnameYandexWebvisor(candidateSiteUrlBase);

    }

    function getDynamicRouterByPrefix(siteData, firstPathPart) {
        if (!firstPathPart) {
            return;
        }
        return _.find(siteData.routersConfigMap, {prefix: firstPathPart});
    }

    function getCachedUrlParts(urlParts) {
        var cacheQuery = urlParts.query.q;
        var match = /\:([^\:]+)\+$/.exec(cacheQuery);
        return match && match[1] && coreUtils.urlUtils.parseUrl(match[1]) || urlParts;
    }

    function parseUrl(siteData, url) {
        var urlParts = _.isObject(url) ? url : coreUtils.urlUtils.parseUrl(url);
        if (urlParts.hostname === GOOGLE_CACHE_HOSTNAME) {
            urlParts = getCachedUrlParts(urlParts);
        }
        if (!isUrlOnSameWixSite(siteData, urlParts)) {
            return null;
        }
        var pathParts = getRelevantPathParts(siteData, urlParts.path);
        var firstPathPart = _.first(pathParts);
        var remainingPathParts = _.drop(pathParts, 1);
        var result = {
            format: coreUtils.siteConstants.URL_FORMATS.SLASH
        };

        if (experiment.isOpen('sv_dpages')) {
            var dynamicRouter = getDynamicRouterByPrefix(siteData, firstPathPart);
            if (dynamicRouter) {
                result.routerDefinition = dynamicRouter;
                result.pageAdditionalData = firstPathPart + "/" + remainingPathParts.join('/');
            }
        }

        if (experiment.isOpen('sv_dpages') && result.routerDefinition) {
            result.innerRoute = remainingPathParts.join('/'); //todo - check if it includes the query params, if not send them as well
            var cachedResultForUrl = siteData.pageResponseForUrl;
            if (cachedResultForUrl && cachedResultForUrl.pageId) {
                result.pageId = cachedResultForUrl.pageId;
                result.title = cachedResultForUrl.title;
            }
        } else if (firstPathPart) {
            if (isPermalinkPrefix(firstPathPart)) {
                result.pageItemId = _.first(remainingPathParts);
                result.pageId = siteData.currentUrlPageId || siteData.mainPageId;
            } else {
                result.pageId = getPageIdByUriSeo(siteData, firstPathPart);
                if (isListBuilderPage(siteData, result.pageId)) {
                    result.title = pathParts[2];
                } else {
                    result.title = firstPathPart;
                }

            }
        } else {
            result.pageId = siteData.mainPageId;
            result.title = getPageUriSeo(siteData, result.pageId);
        }

        if (urlParts.query[LIGHT_BOX]) {
            result.pageItemId = urlParts.query[LIGHT_BOX];
            result.imageZoom = true;
        }

        if (pathParts.length > 1 && !(experiment.isOpen('sv_dpages') && result.routerDefinition)) {
            //todo - check if we are comming back to here when the real page is loading
            //if not maybe we are missing something - related to SE-16613
            //we probably need some kind of page id provider that is not using the url
            if (isListBuilderPage(siteData, result.pageId)) {
                result.pageAdditionalData = _.first(remainingPathParts);
            } else if (isPermalinkPrefix(firstPathPart)) {
                result.pageAdditionalData = _.drop(remainingPathParts, 1).join('/');
            } else if (isTpaPage(siteData, result.pageId)) {
                result.pageAdditionalData = decodeEachUriComponent(remainingPathParts).join('/');
            } else {
                result.pageAdditionalData = remainingPathParts.join('/');
            }
        }

        return result;
    }

    function getPageUriSeo(siteData, pageId) {
        var pageDataItem = siteData.pagesDataItemsMap[pageId];
        return _.get(pageDataItem, 'pageUriSEO') || coreUtils.siteConstants.DEFAULT_PAGE_URI_SEO;
    }

    function getQueryParams(siteData) {
        return _.omit(siteData.currentUrl.query, RESERVED_QUERY_WORDS);
    }

    function getUrl(siteData, pageInfo, forceAddPageInfo, cleanQuery, baseUrl) {
        var query = getQueryParams(siteData);
        var url = baseUrl || siteData.externalBaseUrl;
        url = url.replace(/\/$/, '');
        var permalink = isPermalink(siteData, pageInfo.pageItemId);

        if (experiment.isOpen('sv_dpages') && (pageInfo.routerId || pageInfo.routerDefinition)) {
            var routerInfoPrefix = pageInfo.routerId ? _.get(siteData.routersConfigMap, pageInfo.routerId + '.prefix') : pageInfo.routerDefinition.prefix;
            url += '/' + routerInfoPrefix;
            if (pageInfo.innerRoute && pageInfo.innerRoute !== '/') {
                url += '/' + pageInfo.innerRoute;
            }
        } else if (pageInfo.pageId && !permalink && (pageInfo.pageId !== siteData.mainPageId || forceAddPageInfo || pageInfo.pageAdditionalData)) {
            url += '/' + getPageUriSeo(siteData, pageInfo.pageId);
        }

        if (isListBuilderPage(siteData, pageInfo.pageId) && pageInfo.pageAdditionalData) {
            url += '/' + pageInfo.pageAdditionalData + (pageInfo.title ? '/' + pageInfo.title : '');
        } else if (isTpaPage(siteData, pageInfo.pageId) && pageInfo.pageAdditionalData) {
            url += '/' + encodeEachUriComponent(pageInfo.pageAdditionalData.split('/')).join('/');
        } else if (isBlogPage(siteData, pageInfo.pageId) && pageInfo.pageAdditionalData) {
            url += '/' + pageInfo.pageAdditionalData;
        }

        if (pageInfo.pageItemId) {
            if (permalink) {
                if (pageInfo.pageAdditionalData) {
                    url += '/' + PERMALINK_PREFIX + '/' + pageInfo.pageItemId + '/' + pageInfo.pageAdditionalData;
                } else {
                    //todo console something
                    //todo console something
                }
            } else if (pageInfo.imageZoom) {
                query[LIGHT_BOX] = pageInfo.pageItemId;
            }
        }

        if (!cleanQuery && !_.isEmpty(query) && siteData.currentUrl.hostname !== GOOGLE_CACHE_HOSTNAME) {
            url += '?' + coreUtils.urlUtils.toQueryString(query);
        }

        return url;
    }

    function parseUrlWithResolvedSiteData(siteData, url) {
        var resolvedSiteData = urlParserUtils.getResolvedSiteData(siteData);

        return parseUrl(resolvedSiteData, url);
    }

    function getUrlWithResolvedSiteData(siteData, pageInfo, forceAddPageInfo, cleanQuery, baseUrl) {
        var resolvedSiteData = urlParserUtils.getResolvedSiteData(siteData);

        return getUrl(resolvedSiteData, pageInfo, forceAddPageInfo, cleanQuery, baseUrl);
    }

    return {
        parseUrl: parseUrlWithResolvedSiteData,
        getUrl: getUrlWithResolvedSiteData
    };
});
