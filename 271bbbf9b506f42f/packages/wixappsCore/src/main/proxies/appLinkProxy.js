define([
    "lodash",
    "utils",
    "wixappsCore/proxies/mixins/zoomProxy",
    "wixappsCore/util/wixappsUrlParser"
], function (
    _,
    utils,
    zoomProxy,
    wixappsUrlParser
) {
    'use strict';

    var socialCounterDatabaseAPI = utils.socialCounterDatabaseAPI;
    var wixappsClassicsLogger = utils.wixappsClassicsLogger;

    function urlToObject(url) {
        if (!url) {
            return {};
        }
        var keys = _.filter(url.split("/"), function (v, i) {
            return i % 2 === 0;
        });
        var values = _.filter(url.split("/"), function (v, i) {
            return i % 2 === 1;
        });
        return _.zipObject(keys, values);
    }

    function objectToUrl(obj) {
        return _.reduce(obj, function (cur, val, key) { return cur + "/" + key + "/" + val; }, "").substring(1);
    }

    function getPageTitle(pageData) {
        return pageData.pageUriSEO || pageData.title;
    }

    function generateUrlFromTitleAndDate(siteData, pageId, proxyData, title) {
        var titleTemplate = _.template('<%= year %>/<%= month %>/<%= day %>/<%= title %>');
        var date = new Date(proxyData.date.iso);

        return wixappsUrlParser.getAppPageUrl(siteData, pageId, titleTemplate({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            title: title
        }), '');
    }

    function isBlogSinglePostPage(pageDataItem) {
        var BLOG_SINGLE_POST_APP_ID = '7326bfbb-4b10-4a8e-84c1-73f776051e10';

        return pageDataItem && pageDataItem.type === 'AppPage' &&
            pageDataItem.appPageType === 'AppPage' &&
            pageDataItem.appPageId === BLOG_SINGLE_POST_APP_ID;
    }

    function getBlogSinglePostUrl(siteData, pageData, proxyData, title) {
        var href;

        if (siteData.isUsingUrlFormat(utils.siteConstants.URL_FORMATS.SLASH)) {
            if (proxyData.permalink) {
                href = wixappsUrlParser.getAppPageUrl(siteData, pageData.id, proxyData.permalink);
            } else {
                href = generateUrlFromTitleAndDate(siteData, pageData.id, proxyData, encodeURIComponent(title));
            }
        } else {
            href = wixappsUrlParser.getAppPageUrl(siteData, pageData.id, proxyData._iid, title);
        }

        return href;
    }

    function reportBlogCounter(siteData, counterType, counterName) {
        var blogAppDefId = "61f33d50-3002-4882-ae86-d319c1a249ab";
        var storeId = siteData.getClientSpecMapEntryByAppDefinitionId(blogAppDefId);
        socialCounterDatabaseAPI.updateCounter(counterType, counterName, 1, storeId);
    }

    function tagClickedHandler(siteData, tagName) {
        wixappsClassicsLogger.reportEvent(siteData, wixappsClassicsLogger.events.TAG_CLICKED);
        var reportTag = _.unescape(tagName);
        reportBlogCounter(siteData, "tag", reportTag);
    }

    function categoryClickedHandler(siteData, categoryName) {
        wixappsClassicsLogger.reportEvent(siteData, wixappsClassicsLogger.events.CATEGORY_CLICKED);
        var reportCategory = _.unescape(categoryName);
        reportBlogCounter(siteData, "category", reportCategory);
    }

    function appPageLinkClickedHandler(siteData, postId) {
        wixappsClassicsLogger.reportEvent(siteData, wixappsClassicsLogger.events.SINGLE_POST_LINK_CLICKED, {
            post_id: postId
        });
    }

    var resolvers = {
        appPageLink: function (siteData, pageData, proxyData) {
            var title = _.unescape(proxyData.title).replace(/(?![a-z0-9])(?!\s)[\x00-\x7F]/gi, '').replace(/\s+/g, '-'); //eslint-disable-line no-control-regex
            var isBlogSinglePostLink = isBlogSinglePostPage(pageData);
            return {
                href: isBlogSinglePostLink ?
                    getBlogSinglePostUrl(siteData, pageData, proxyData, title) :
                    wixappsUrlParser.getAppPageUrl(siteData, pageData.id, proxyData._iid, title),
                onClick: isBlogSinglePostLink ? appPageLinkClickedHandler.bind(this, siteData, proxyData._iid) : undefined
            };
        },
        date: function (siteData, pageData, proxyData) {
            var filter = "date/" + proxyData.value;
            return {
                href: wixappsUrlParser.getAppPageUrl(siteData, pageData.id, filter, getPageTitle(pageData))
            };
        },
        tag: function (siteData, pageData, proxyData) {
            var tagRawName = (proxyData.key || proxyData);
            var tagName = tagRawName.replace(/\s+/g, '-');
            var filter = "tag/" + encodeURIComponent(tagName);
            return {
                href: wixappsUrlParser.getAppPageUrl(siteData, pageData.id, filter, getPageTitle(pageData)),
                onClick: tagClickedHandler.bind(this, siteData, tagRawName)
            };
        },
        category: function (siteData, pageData, proxyData) {
            var category = proxyData;
            var filter = "category/" + encodeURIComponent(category.name.replace(/\s+/g, '-'));
            return {
                href: wixappsUrlParser.getAppPageUrl(siteData, pageData.id, filter, getPageTitle(pageData)),
                onClick: categoryClickedHandler.bind(this, siteData, category.name)
            };
        },
        author: function (siteData, pageData, proxyData) {
            var filter = "author/" + encodeURIComponent(proxyData.author.replace(/\s+/g, '-'));
            return {
                href: wixappsUrlParser.getAppPageUrl(siteData, pageData.id, filter, getPageTitle(pageData))
            };
        },
        //all of these will work as long as we don't have blog page in popup
        prevPage: function (siteData, pageData, proxyData, rootNavigationInfo) {
            var filter = rootNavigationInfo.pageAdditionalData || "";
            var filterParts = urlToObject(filter);
            uniformPageKeyInFilterParts(filterParts);
            if (filterParts.page && Number(filterParts.page)) {
                filterParts.page = Number(filterParts.page) - 1;
            }
            if (Number(filterParts.page) === 0) {
                delete filterParts.page;
            }
            return {
                href: wixappsUrlParser.getAppPageUrl(siteData, pageData.id, objectToUrl(filterParts), getPageTitle(pageData))
            };
        },
        nextPage: function (siteData, pageData, proxyData, rootNavigationInfo) {
            var filter = rootNavigationInfo.pageAdditionalData || "";
            var filterParts = urlToObject(filter);
            uniformPageKeyInFilterParts(filterParts);
            if (filterParts.page && Number(filterParts.page)) {
                filterParts.page = Number(filterParts.page) + 1;
            } else {
                filterParts.page = 1;
            }
            return {
                href: wixappsUrlParser.getAppPageUrl(siteData, pageData.id, objectToUrl(filterParts), getPageTitle(pageData))
            };
        },
        numberedPage: function (siteData, pageData, proxyData, rootNavigationInfo) {
            var filter = rootNavigationInfo.pageAdditionalData || "";
            var filterParts = urlToObject(filter);
            uniformPageKeyInFilterParts(filterParts);
            filterParts.page = parseInt(proxyData, 10);
            if (Number(filterParts.page) === 0) {
                delete filterParts.page;
            }
            return {
                href: wixappsUrlParser.getAppPageUrl(siteData, pageData.id, objectToUrl(filterParts), getPageTitle(pageData))
            };
        }
    };

    // Without the uniforming "#!blog/cy8xy/Page/1" will be changed to "#!blog/cy8xy/Page/1/page/2".
    function uniformPageKeyInFilterParts(filterParts) {
        if (_.has(filterParts, 'Page')) {
            filterParts.page = filterParts.Page;
            delete filterParts.Page;
        }
    }

    /**
     * get the data of the page which matches the appPageId on the proxy data
     * @param appPageId
     * @param pages
     * @returns {*}
     */
    function getPageData(appPageId, pages) {
        if (appPageId === "samePage") {
            var pageId = this.props.viewProps.rootNavigationInfo.pageId;
            return _.find(pages, {id: pageId});
        }
        return _.find(pages, function(pageData){
            return pageData.appPageId && pageData.appPageId === appPageId;
        });
    }


    /**
     * @class proxies.AppLink
     * @extends proxies.mixins.zoomProxy
     */
    return {
        mixins: [zoomProxy],

        getCustomProps: function() {
            var linkType = this.getCompProp("linkType") || "appPageLink";

            var pages = this.props.viewProps.siteData.getPagesDataItems();
            var pageId = this.getCompProp("pageId");
            var pageData = getPageData.call(this, pageId, pages);

            if (pageData && linkType && resolvers[linkType]) {
                var navInfo = this.props.viewProps.rootNavigationInfo;
                return resolvers[linkType](this.props.viewProps.siteData, pageData, this.proxyData, navInfo);
            }

            return {};
        }
    };
});
