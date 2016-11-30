define(['lodash', 'documentServices/page/page'], function(_, pages) {
    'use strict';

    function markAsPreset(ps, pageDataItems, pageId) {
        _.forEach(pageDataItems, function(dataItem) {
            dataItem.metaData.isPreset = true;
            var dataItemPointer = ps.pointers.data.getDataItem(dataItem.id, pageId);
            ps.dal.set(dataItemPointer, dataItem);
        });
    }

    return function markDataItemsAsPreset(ps) {
        var pageIdToDataItemsMap = _(pages.getPageIdList(ps, true))
            .transform(function(acc, pageId) {
                acc[pageId] = ps.pointers.page.getPageData(pageId);
            }, {})
            .mapValues(ps.dal.get, ps.dal)
            .mapValues(function(dataItems) {
                return _.pick(dataItems, function(dataItem) {
                    return dataItem.metaData;
                });
            }).value();

        _.forEach(pageIdToDataItemsMap, markAsPreset.bind(null, ps));
    };
});
