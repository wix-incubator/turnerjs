define(['lodash', 'tpa/utils/tpaUtils'], function (_, tpaUtils) {
    'use strict';

    var getMainSectionWidgetData = function(appData) {
        var widgets = appData.widgets;
        if (widgets) {
            return _.find(widgets, function (widget) {
                return (widget.appPage && widget.appPage.name && !widget.appPage.hidden);
            });
        }

        return undefined;
    };

    var isSuperAppByCompId = function(siteAPI, compId) {
        var appData = tpaUtils.getAppData(siteAPI, compId);
        return _.get(appData, 'isWixTPA');
    };

    return {
        getMainSectionWidgetData: getMainSectionWidgetData,
        isSuperAppByCompId: isSuperAppByCompId
    };
});
