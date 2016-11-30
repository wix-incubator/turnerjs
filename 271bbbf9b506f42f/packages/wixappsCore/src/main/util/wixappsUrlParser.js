define(['lodash', 'utils', 'wixappsCore/core/wixappsLogger'], function (_, /** utils */ utils, /** wixappsCore.wixappsLogger */wixappsLogger) {
    "use strict";

    var appPages = {
        "79f391eb-7dfc-4adf-be6e-64434c4838d9": {
            parse: function (siteData, urlExtraData) {
                var splitUri = urlExtraData.split('/');
                var params = {};
                params.filter = {};
                if (splitUri[0] === 'Featured') {
                    params.filter.featured = true;
                    splitUri.shift();
                }
                for (var i = 0; i < splitUri.length; i += 2) {
                    switch (splitUri[i]) {
                        case 'Type':
                            params.filter._type = splitUri[i + 1];
                            break;
                        case 'Tag':
                        case 'tag':
                            var tagsFilter = decodeURIComponent(splitUri[i + 1]);
                            if (_.includes(tagsFilter, '-')) {
                                params.filter.tags = {$in : [tagsFilter, tagsFilter.replace(/-/g, ' ')]};
                            } else {
                                params.filter.tags = tagsFilter;
                            }
                            break;
                        case 'Category':
                        case 'category':
                            var categoryNameWithDashes = decodeURIComponent(splitUri[i + 1]);
                            var categoryNameWithSpaces = categoryNameWithDashes.replace(/-/g, ' ');
                            params.categoryNames = JSON.stringify([
                                categoryNameWithDashes,
                                categoryNameWithSpaces
                            ]);
                            break;
                        case 'Page':
                        case 'page':
                            params.page = splitUri[i + 1];
                            break;
                        case 'Author':
                        case 'author':
                            var authorFilter = decodeURIComponent(splitUri[i + 1]);
                            if (_.includes(authorFilter, '-')) {
                                params.filter.author = {$in : [authorFilter, authorFilter.replace(/-/g, ' ')]};
                            } else {
                                params.filter.author = authorFilter;
                            }
                            break;
                        case 'Sort':
                            params.sort = splitUri[i + 1];
                            break;
                        case 'Date':
                        case 'date':
                            var date = splitUri[i + 1];
                            params.filter["date.iso"] = {"$regex": "^" + date};
                    }
                }
                return params;
            }
        },
        '7326bfbb-4b10-4a8e-84c1-73f776051e10': {
            parse: function (siteData, urlExtraData) {
                var params = {};
                params.limit = 1;

                params.filter = {};
                params.filter.permalink = {$in : [urlExtraData, decodeURIComponent(urlExtraData)]};

                if (utils.stringUtils.isTrue(_.get(siteData, ['currentUrl', 'query', 'draft']))) {
                    params.filter.draft = true;
                }

                return params;
            }
        }
    };

    /**
     * @class wixappsCore.wixappsUrlParser
     */
    return {

        /**
         *
         * @param {core.SiteData} siteData
         * @param {site.pageUrlInfo} [urlData]
         * @returns {object}
         */
        getAppPageParams: function (siteData, urlData) {
            //will work as long as no item pages in popup
            var pageInfo = urlData || siteData.getExistingRootNavigationInfo(siteData.getPrimaryPageId());
            var pageDataItem = siteData.getDataByQuery(pageInfo.pageId);

            if (pageDataItem.type === 'AppPage' && appPages[pageDataItem.appPageId]) {
                var urlExtraData = pageInfo.pageAdditionalData || "";
                return appPages[pageDataItem.appPageId].parse(siteData, urlExtraData);
            }
            return null;
        },

        /**
         *
         * @param {core.SiteData} siteData
         * @param {site.pageUrlInfo} [urlData]
         */
        getPageSubItemId: function (siteData, urlData) {
            //will work as long as no item pages in popup
            var primaryRootInfo = siteData.getExistingRootNavigationInfo(siteData.getPrimaryPageId());
            var pageInfo = urlData || primaryRootInfo;
            if (!pageInfo.pageAdditionalData) {
                return null;
            }
            var pageDataItem = siteData.getDataByQuery(pageInfo.pageId);
            var pageItemDataItem = pageInfo.pageItemId && siteData.getDataByQuery(pageInfo.pageItemId);

            if (pageDataItem.type === 'AppPage' || (pageItemDataItem && pageItemDataItem.type === "PermaLink")) {
                var match = pageInfo.pageAdditionalData.match(/(.+?)($|\/.*$)/i);
                return match[1];
            }
            return null;
        },

        getAppPartZoomAdditionalDataPart: function (siteData, itemId, itemTitle, mutableSeoTitle) {
            var encodedTitle = encodeURIComponent(itemTitle.toLowerCase().replace(/[\s|\/]+/ig, "-")); //replace spaces and slashes with dash
            if (siteData.isUsingUrlFormat(utils.siteConstants.URL_FORMATS.SLASH)) {
                return [itemId, mutableSeoTitle, encodedTitle].join('/');
            }
            return itemId + '/' + encodedTitle;
        },

        /**
         *
         * @param {core.SiteData} siteData
         * @param permaLinkId
         * @param itemId
         * @param itemTitle
         */
        getAppPartZoomUrl: function (siteData, permaLinkId, itemId, itemTitle) {
            var permaLink = siteData.getDataByQuery(permaLinkId);
            if (!permaLink) {
                wixappsLogger.reportError(siteData, wixappsLogger.errors.MISSING_PERMALINK);
                return siteData.currentUrl.full;
            }
            var pageInfo = {
                pageItemId: permaLinkId,
                pageAdditionalData: this.getAppPartZoomAdditionalDataPart(siteData, itemId, itemTitle, permaLink.mutableSeoTitle)
            };

            if (!siteData.isUsingUrlFormat(utils.siteConstants.URL_FORMATS.SLASH)) {
                pageInfo.title = permaLink.mutableSeoTitle;
            }

            return utils.wixUrlParser.getUrl(siteData, pageInfo);
        },

        /**
         *
         * @param {core.SiteData} siteData
         * @param pageId
         * @param itemId
         * @param itemTitle
         */
        getAppPageUrl: function (siteData, pageId, itemId, itemTitle) {
            var pageInfo = {
                pageId: pageId,
                title: itemTitle,
                pageAdditionalData: itemId
            };

            return utils.wixUrlParser.getUrl(siteData, pageInfo);
        }
    };
});
