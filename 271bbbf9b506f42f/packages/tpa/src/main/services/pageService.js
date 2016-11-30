define(['lodash', 'tpa/utils/sitePages'], function (_, sitePages) {
    'use strict';

    var tpaToPageMap = {};

    var mapPageToWidgets = function (siteAPI) {
        if (_.size(tpaToPageMap) > 0) {
            return tpaToPageMap;
        }

        var pages = sitePages.getSitePagesData(siteAPI.getSiteData());
        _.forEach(pages, function (pageData) {
            if (pageData && pageData.tpaApplicationId > 0) {
                var data = {
                    pageId: pageData.id,
                    tpaId: pageData.tpaApplicationId,
                    tpaPageId: pageData.tpaPageId
                };
                if (_.isUndefined(tpaToPageMap[data.tpaId])) {
                    tpaToPageMap[data.tpaId] = [];
                }
                tpaToPageMap[data.tpaId].push(data);
            }
        });
        return tpaToPageMap;

    };

    return {
        mapPageToWidgets: mapPageToWidgets
    };
});