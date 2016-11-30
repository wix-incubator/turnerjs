define(['lodash', 'zepto', 'tpa/services/clientSpecMapService'], function (_, $, clientSpecMapService) {
    'use strict';

    function handleMobileFullPage (style, measureMap, siteData) {
        var height = measureMap.height.screen - measureMap.siteOffsetTop;
        style.height = height + 'px';
        style.minHeight = height + 'px';
        style.top = measureMap.siteOffsetTop + 'px';
        if (!siteData.isViewerMode()) {
            style.left = undefined;
            style.right = undefined;
        }

        return style;
    }

    function isFullPage (compData, appData) {
        var widgetId = _.get(compData, 'widgetId');
        var widgetData = widgetId ? _.get(appData.widgets, widgetId) : clientSpecMapService.getMainSectionWidgetData(appData);
        return _.get(widgetData, 'appPage.fullPage', false);
    }

    return {
        patchTPASection: function (id, patchers, measureMap, flatStructure, siteData) {
            var compData = flatStructure.dataItem;
            var clientSpecMap = siteData.rendererModel.clientSpecMap;
            var appData = clientSpecMap[compData.applicationId];
            var tpaSectionCompHeight = measureMap.height[id];
            if (appData && isFullPage(compData, appData)) {
                var css = {};
                css.position = 'fixed';
                css.left = '0px';
                css.top = '0px';
                css.right = '0px';
                css.bottom = '0px';

                if (siteData.isMobileView()) {
                    tpaSectionCompHeight = measureMap.height.screen - measureMap.siteOffsetTop;
                    css = handleMobileFullPage(css, measureMap, siteData);
                }

                patchers.css(id, css);
            }

            var tpaSectionCompWidth = measureMap.width[id];
            var isIOSSafari = siteData.os.ios && siteData.browser.safari;

            if (isIOSSafari && measureMap.custom[id].hasIframe) {
                patchers.css(id + 'iframe', {
                    width: tpaSectionCompWidth,
                    height: tpaSectionCompHeight
                });
            }
        }
    };
});
