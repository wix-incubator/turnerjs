define(['lodash', 'utils', 'tpa/utils/tpaUtils'], function (_, utils, tpaUtils) {
    'use strict';

    var getSitePagesInfoData = function (siteData, options) {
        var siteMenu = utils.menuUtils.getSiteMenuWithoutRenderedLinks(siteData, false);
        if (options && options.filterHideFromMenuPages) {
            siteMenu = filterHiddenFromMenuPages(siteMenu, siteData.getClientSpecMap());
        }
        var sitePages = _getSitePagesFromMenuItems(siteMenu);
        var homePageId = siteData.getMainPageId();
        var sitePagesWithHomepageInfo = addIsHomePageParameter(sitePages, homePageId);

        if (options && options.includePagesUrl) {
            sitePagesWithHomepageInfo = addUrlParameter(siteData, sitePages, _.get(options, 'baseUrl'));
        }
        return sitePagesWithHomepageInfo;
    };

    var filterHiddenFromMenuPages = function (siteMenu, clientSpecMap) {
        return _.filter(siteMenu, function (item) {
            return !isPageMarkedAsHideFromMenu(clientSpecMap, item.link);
        });
    };

    var addUrlParameter = function(siteData, sitePages, baseUrl) {
        return _.map(sitePages, function(sitePage){
            var pageData = siteData.getDataByQuery(sitePage.id, 'masterPage');
            if (pageData && pageData.pageUriSEO) {
                sitePage.url = utils.wixUrlParser.getUrl(siteData, {
                    pageId: sitePage.id,
                    title: pageData.pageUriSEO
                }, undefined, true, baseUrl);
            }

            if (sitePage.subPages){
                sitePage.subPages = addUrlParameter(siteData, sitePage.subPages, baseUrl);
            }
            return sitePage;
        });
    };

    var isPageMarkedAsHideFromMenu = function (clientSpecMap, linkObject) {
        if (_.get(linkObject, 'type') === 'PageLink') {
            var tpaApplicationId = _.get(linkObject, 'pageId.tpaApplicationId');
            var tpaPageId = _.get(linkObject, 'pageId.tpaPageId');
            var appData = _.get(clientSpecMap, tpaApplicationId);
            return tpaUtils.isPageMarkedAsHideFromMenu(appData, tpaPageId);
        }
        return false;
    };

    var addIsHomePageParameter = function(sitePages, homePageId){
        return _.map(sitePages, function(sitePage){
            sitePage.isHomepage = isHomePage(sitePage, homePageId);
            if (sitePage.subPages){
                sitePage.subPages = addIsHomePageParameter(sitePage.subPages, homePageId);
            }
            return sitePage;
        });
    };

    var isHomePage = function(pageData, homePageId){
        return !_.isUndefined(pageData) &&
            pageData.id === homePageId;
    };

    var getSitePagesData = function (siteData) {
        var pages = getSitePagesInfoData(siteData);
        return _getPagesData(pages, siteData);
    };

    var _getSitePagesFromMenuItems = function(menuItems) {
        var pages = [];
        _.forEach(menuItems, function (item) {
            var pageInfo = _getPageInfo(item);
            var subItems = item.items;
            _.forEach(subItems, function (subItem) {
                var subPageInfo = _getPageInfo(subItem);
                pageInfo.subPages = pageInfo.subPages || [];
                pageInfo.subPages.push(subPageInfo);
            });
            pages.push(pageInfo);
        });
        return pages;
    };

    var _getPageInfo = function (pageData) {
        if (pageData.link) {
            var pageId = _.get(pageData.link, 'pageId.id');
            return {
                title: pageData.label || '',
                id: utils.stringUtils.startsWith(pageId, '#') ? pageId.substr(1) : pageId,
                hide: !pageData.isVisible || false
            };
        }
        return {};
    };

    var _getPageData = function (id, siteData) {
        return siteData.getDataByQuery(id, 'masterPage');
    };

    var _getPagesData = function (pages, siteData) {
        var pagesFullData = [];
        _.forEach(pages, function (pageData) {
            _.forEach(pageData.subPages, function (subPageData) {
                pagesFullData.push(_getPageData(subPageData.id, siteData));
            });
            pagesFullData.push(_getPageData(pageData.id, siteData));
        });
        return pagesFullData;
    };

    return {
        getSitePagesInfoData: getSitePagesInfoData,
        getSitePagesData: getSitePagesData
    };
});
