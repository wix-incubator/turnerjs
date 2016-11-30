define([], function(){
    'use strict';

    return {
        getBaseUrl: function () {
            var appData = this.getAppData();
            if (appData.widgets) {
                var widgetId = this.props.compData.widgetId;
                var widgetData = appData.widgets[widgetId];

                if (widgetData) {
                    var isInDevMode = this.isInMobileDevMode && this.isInMobileDevMode();

                    if (this.isUnderMobileView()) {
                        var mobileReady = widgetData.mobileUrl && (isInDevMode || widgetData.mobilePublished);
                        return mobileReady ? widgetData.mobileUrl : widgetData.widgetUrl;
                    }

                    return widgetData.widgetUrl;
                }
            }
            //TODO - report data error bi
            return '';
        }
    };
});

