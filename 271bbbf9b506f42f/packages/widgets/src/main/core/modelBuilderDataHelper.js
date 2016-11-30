define(['lodash'], function(_){
    'use strict';

    var WIDGET_TYPES = {
        PAGE: 'Page',
        POPUP: 'Popup'
    };

    function getApi(siteData) {
        return {
            fetchData: siteData.getDataByQuery.bind(siteData),
            fetchPagesData: siteData.getPagesDataForRmi.bind(siteData)
        };
    }

    function getWidgetType(widgetDataItem) {
        if (_.get(widgetDataItem, 'type') !== 'Page') {
            return;
        }
        return _.get(widgetDataItem, 'isPopup') ? WIDGET_TYPES.POPUP : WIDGET_TYPES.PAGE;
    }

    return {
        getApi: getApi,
        getWidgetType: getWidgetType,
        WIDGET_TYPES: WIDGET_TYPES
    };
});
