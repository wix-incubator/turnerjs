define(['lodash'], function (_) {
    'use strict';

    var prefetchPages = function(behavior, siteAPI) {
        var siteData = siteAPI.getSiteData();
        var pagesData = siteData.getPagesDataItems();
        var filters = behavior.params.prefetchFilters;

        var pageIdsToFetch = _(pagesData)
            .filter(function(pageData) {
               return _.every(filters, function(ids, key) {
                    return _.includes(ids, pageData[key]);
                });

            })
            .map('id')
            .value();

        if (_.isEmpty(pageIdsToFetch)) { return; }

        var siteDataAPI = siteAPI.getSiteDataAPI();
        var loadedPages = 0;

        _.forEach(pageIdsToFetch, function(pageId) {
            var pageInfo = {
                pageId: pageId
            };
            siteDataAPI.loadPage(pageInfo, function() {
                ++loadedPages;
                if (loadedPages === pageIdsToFetch.length) {
                    siteData.addPrefetchPages(pageIdsToFetch);
                    siteAPI.forceUpdate();
                }
            });
        });

    };

    var isEnabled = function() {
        return true;
    };

    return {
        prefetchPages: prefetchPages,
        isEnabled: isEnabled
    };
});
