define(['lodash'], function (_) {
    'use strict';

    var FIXED_PREFIX = 'fixed';

    function getStylesFromMeasureMap(id, measureMap, styles) {
        var stylesFromMeasureMap = {};

        _.forEach(styles, function (style) {
            var cssStyleValue = measureMap[style] && measureMap[style][id];
            var cssStyleName = style;

            if (_.isUndefined(cssStyleValue)) {
                return;
            }

            if (style.indexOf(FIXED_PREFIX) === 0) {
                cssStyleName = cssStyleName.slice(FIXED_PREFIX.length).toLowerCase();
            }

            stylesFromMeasureMap[cssStyleName] = cssStyleValue;
        });

        return stylesFromMeasureMap;
    }

    function getBoundingRect(css, windowWidth, windowHeight) {
        return {
            top: _.isNumber(css.top) ? _.parseInt(css.top) : windowHeight - css.height,
            bottom: _.isNumber(css.bottom) ? windowHeight - _.parseInt(css.bottom) : _.parseInt(css.top) + css.height,
            right: _.isNumber(css.right) ? windowWidth - _.parseInt(css.right) : _.parseInt(css.left) + css.width,
            left: _.isNumber(css.left) ? _.parseInt(css.left) : windowWidth - css.width
        };
    }

    function isOverlapping(rect1, rect2) {
        // taken from: http://stackoverflow.com/a/12067046
        return !(rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom);
    }

    function adjustForAd(result, widgetRect, adRect) {
        if (isOverlapping(adRect, widgetRect) && _.isNumber(result.top)) {
            result.top = (result.top || 0) + (adRect.bottom - widgetRect.top);
        }

        return result;
    }

    function adjustTopWixAd(css, measureMap, siteData) {
        var adjustedStyle = css;
        var windowHeight = measureMap.height.screen;
        var windowWidth = measureMap.width.screen;
        var adRect = measureMap.custom && measureMap.custom[siteData.WIX_ADS_ID] && measureMap.custom[siteData.WIX_ADS_ID].topAd;

        if (adRect) {
            var widgetRect = getBoundingRect(adjustedStyle, windowWidth, windowHeight);
            adjustedStyle = adjustForAd(adjustedStyle, widgetRect, adRect);
        }

        return adjustedStyle;
    }

    function patchGluedWidget(id, patchers, measureMap, compStructure, siteData) {
        var gluedWidgetStyles = [
            'position',
            'fixedTop',
            'fixedLeft',
            'right',
            'bottom',
            'width',
            'height'
        ];
        var css = getStylesFromMeasureMap(id, measureMap, gluedWidgetStyles);
        css = adjustTopWixAd(css, measureMap, siteData);
        css = _.omit(css, 'width', 'height'); // Were only used for adjusting to ad

        patchers.css(id, css);
    }

    function GluedWidgetPatcher() {
        this.patchGluedWidget = patchGluedWidget;
    }

    return GluedWidgetPatcher;
});
