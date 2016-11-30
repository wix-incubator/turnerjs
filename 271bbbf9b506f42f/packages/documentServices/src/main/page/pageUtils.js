define(['speakingurl'], function (speakingUrl) {
    'use strict';

    var pageDataChangedCallback;

    function registerPageDataChangedCallback(callback) {
        pageDataChangedCallback = callback;
    }

    function executePageDataChangedCallback(ps, pageId, data) {
        pageDataChangedCallback(ps, pageId, data);
    }

    function getHomepageId(ps) {
        return ps.siteAPI.getMainPageId();
    }

    function isHomepage(ps, pageId) {
        return pageId === getHomepageId(ps);
    }

    function isMasterPage(ps, pageId) {
        return pageId === 'masterPage';
    }

    function convertPageNameToUrl(ps, title) {
        // fix for Thursday 4/8/16 URGENT bug #ICUOP-160
        return speakingUrl(title, {custom: {'_': '-'}, symbols: false}) || 'blank';
    }

    function getCurrentUrl (ps, urlFormat, baseUrl) {
        return getPageUrl(ps, {pageId: ps.siteAPI.getCurrentUrlPageId()}, urlFormat, baseUrl);
    }

    function getMainPageUrl(ps, urlFormat, baseUrl) {
        return getPageUrl(ps, {pageId: getHomepageId(ps)}, urlFormat, baseUrl);
    }

    function getPageUrl(ps, pageInfo, urlFormat, baseUrl) {
        return ps.siteAPI.getPageUrl(pageInfo, urlFormat, baseUrl);
    }

    return {
        getHomepageId: getHomepageId,
        isMasterPage: isMasterPage,
        isHomepage: isHomepage,
        registerPageDataChangedCallback: registerPageDataChangedCallback,
        executePageDataChangedCallback: executePageDataChangedCallback,
        convertPageNameToUrl: convertPageNameToUrl,
        getCurrentUrl: getCurrentUrl,
        getMainPageUrl: getMainPageUrl,
        getPageUrl: getPageUrl
    };
});
