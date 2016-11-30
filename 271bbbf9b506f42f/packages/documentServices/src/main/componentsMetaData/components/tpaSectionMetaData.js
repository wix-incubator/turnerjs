define(['lodash',
    'documentServices/constants/constants',
    'documentServices/dataModel/dataModel'], function (_, consts, dataModel) {
    'use strict';

    function getWidgetData(ps, compData) {
        if (!_.has(compData, 'applicationId')) {
            return {};
        }
        var clientSpecMapPtr = ps.pointers.general.getClientSpecMap();
        var csm = ps.dal.get(clientSpecMapPtr);
        var appData = _.get(csm, compData.applicationId);
        return compData.widgetId ? _.get(appData, ['widgets', compData.widgetId]) : getMainSectionWidgetData(appData);
    }

    function getCompData(component, ps, pageId) {
        var dataQuery = component.dataQuery.replace('#', '');
        var dataPointer = ps.pointers.data.getDataItem(dataQuery, pageId);
        return ps.dal.get(dataPointer);
    }

    function getMainSectionWidgetData(appData) {
        var widgets = _.get(appData, 'widgets');
        if (widgets) {
            return _.find(widgets, function (widget) {
                return (widget.appPage && widget.appPage.name && !widget.appPage.hidden);
            });
        }
        return undefined;
    }

    return {
        mobileConversionConfig: {
            convertFixedPositionToAbsolute: true,
            stretchHorizontally: function (ps, component, pageId) {
                var compData = getCompData(component, ps, pageId);
                var widgetData = getWidgetData(ps, compData);
                return _.get(widgetData, 'shouldBeStretchedByDefaultMobile') === true;
            }
        },
        anchors: {
            to: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.NEVER},
            from: {allow: true}
        },
        removable: false,
        duplicatable: false,
        containable: false,
        canBeFixedPosition: false,
        canBeStretched: function (ps, compPointer) {
            var compData = dataModel.getDataItem(ps, compPointer);
            var widgetData = getWidgetData(ps, compData);
            return _.get(widgetData, 'canBeStretched') === true;
        }
    };
});
