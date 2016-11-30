define([], function () {
    'use strict';

    function toNumber(measure) {
        var parsedMeasure = parseInt(measure, 10);
        return isNaN(parsedMeasure) ? 0 : parsedMeasure;
    }

    function getFirstVisibleTopCoordinate(measureMap) {
        return toNumber(measureMap.height.WIX_ADS) + toNumber(measureMap.top.WIX_ADS);
    }

    function getFirstUnoccupiedTopCoordinate(measureMap) {
        if (measureMap.height.WIX_ADSdesktopWADTop || measureMap.top.WIX_ADSdesktopWADTop) {
            return toNumber(measureMap.height.WIX_ADSdesktopWADTop) + toNumber(measureMap.top.WIX_ADSdesktopWADTop);
        }

        return toNumber(measureMap.height.WIX_ADS) + toNumber(measureMap.top.WIX_ADS);
    }

    function getScreenHeightExcludingAds(measureMap) {
        var totalScreenHeight = measureMap.height.screen;
        var topAdSpace, bottomAdSpace;

        if (measureMap.height.WIX_ADSdesktopWADTop || measureMap.height.WIX_ADSdesktopWADBottom) {
            topAdSpace = toNumber(measureMap.height.WIX_ADSdesktopWADTop) + toNumber(measureMap.top.WIX_ADSdesktopWADTop);
            bottomAdSpace = toNumber(measureMap.height.WIX_ADSdesktopWADBottom);
            return totalScreenHeight - topAdSpace - bottomAdSpace;
        }

        topAdSpace = toNumber(measureMap.height.WIX_ADS) + toNumber(measureMap.top.WIX_ADS);
        return totalScreenHeight - topAdSpace;
    }


    return {
        getFirstVisibleTopCoordinate: getFirstVisibleTopCoordinate,
        getFirstUnoccupiedTopCoordinate: getFirstUnoccupiedTopCoordinate,
        getScreenHeightExcludingAds: getScreenHeightExcludingAds
    };

});



