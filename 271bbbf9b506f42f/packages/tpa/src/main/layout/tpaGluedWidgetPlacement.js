define([], function () {
    'use strict';

    function getDefaultPlacement(compData, clientSpecMap) {
        var applicationId = compData.applicationId;
        var widgetId = compData.widgetId;

        var appData = clientSpecMap[applicationId];
        if (appData) {
            var widgetData = appData.widgets[widgetId];
            if (widgetData) {
                var widgetDataGluedOptions = widgetData.gluedOptions || {
                        horizontalMargin: 0,
                        placement: "BOTTOM_RIGHT",
                        verticalMargin: 0
                    };
                return widgetDataGluedOptions.placement;
            }
        }
        //TODO - report data error bi
    }


    return {
        getDefaultPlacement: getDefaultPlacement
    };
});
