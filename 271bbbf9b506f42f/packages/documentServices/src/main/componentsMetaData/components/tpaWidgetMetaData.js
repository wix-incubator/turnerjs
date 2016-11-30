define(['lodash', 'documentServices/dataModel/dataModel'], function(_, dataModel) {
    'use strict';

    function getWidgetData(ps, compData) {
        if (!_.has(compData, 'applicationId') || !_.has(compData, 'widgetId')) {
            return {};
        }
        var clientSpecMapPtr = ps.pointers.general.getClientSpecMap();
        var csm = ps.dal.get(clientSpecMapPtr);
        return _.get(csm, [compData.applicationId, 'widgets', compData.widgetId]) || {};
    }

    function getCompData(component, ps, pageId) {
        var dataQuery = component.dataQuery.replace('#', '');
        var dataPointer = ps.pointers.data.getDataItem(dataQuery, pageId);
        return ps.dal.get(dataPointer);
    }

    return {
        mobileConversionConfig: {
            hideByDefault: function(ps, component, pageId) {
                var compData = getCompData(component, ps, pageId);
                var widgetData = getWidgetData(ps, compData);
                return _.isEmpty(widgetData.mobileUrl);
            },
            stretchHorizontally: function (ps, component, pageId) {
                var compData = getCompData(component, ps, pageId);
                var widgetData = getWidgetData(ps, compData);
                return _.get(widgetData, 'shouldBeStretchedByDefaultMobile') === true;
            }
        },
        canBeStretched: function (ps, compPointer) {
            var compData = dataModel.getDataItem(ps, compPointer);
            var widgetData = getWidgetData(ps, compData);
            return _.get(widgetData, 'canBeStretched') === true;
        }
    };
});
