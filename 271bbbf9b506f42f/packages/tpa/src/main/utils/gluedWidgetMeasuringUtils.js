define([
    'lodash',
    'tpa/layout/tpaGluedWidgetPlacement'
], function (
    _,
    tpaGluedWidgetPlacement
) {
    'use strict';

    var SIDE_STICKY_AREA = 300,
        TOP_AND_BOTTOM_STICKY_AREA = 120;

    function normalizeStringValue(v) {
        if (typeof v === 'number') {
            return v;
        }

        if (!v) {
            return 0;
        }

        return parseFloat(v) || 0;
    }

    function getCssPositioningAttributes(width, height, windowWidth, windowHeight, placement, verticalMargin, horizontalMargin) {
        verticalMargin = normalizeStringValue(verticalMargin);
        horizontalMargin = normalizeStringValue(horizontalMargin);

        var result = {};
        var normalizedMargin;

        function calcVerticalPosition() {
            if (verticalMargin >= -1 && verticalMargin <= 1) {
                var marginWhenCentered = (windowHeight / 2) - (height / 2);
                var middleWindowHeight = windowHeight - TOP_AND_BOTTOM_STICKY_AREA * 2;
                var fullCompensation = (middleWindowHeight / 2) - (height / 2);
                var relativeCompensation = verticalMargin * fullCompensation;
                result.top = marginWhenCentered + relativeCompensation;
            } else if (verticalMargin < -1 && verticalMargin >= -2) {
                normalizedMargin = 2 + verticalMargin;
                result.top = normalizedMargin * TOP_AND_BOTTOM_STICKY_AREA;
            } else if (verticalMargin > 1 && verticalMargin <= 2) {
                normalizedMargin = 2 - verticalMargin;
                var bottom = Math.floor(normalizedMargin * TOP_AND_BOTTOM_STICKY_AREA);
                result.top = windowHeight - bottom - height;
            }
        }

        function calcHorizontalPosition() {
            if (horizontalMargin >= -1 && horizontalMargin <= 1) {
                var marginWhenCentered = (windowWidth / 2) - (width / 2);
                var middleWindowWidth = windowWidth - SIDE_STICKY_AREA * 2;
                var fullCompensation = (middleWindowWidth / 2) - (width / 2);
                var relativeCompensation = horizontalMargin * fullCompensation;
                result.left = marginWhenCentered + relativeCompensation;
            } else if (horizontalMargin > 1 && horizontalMargin <= 2) {
                normalizedMargin = 2 - horizontalMargin;
                var right = Math.floor(normalizedMargin * SIDE_STICKY_AREA);
                result.left = windowWidth - right - width;
            } else if (horizontalMargin < -1 && horizontalMargin >= -2) {
                normalizedMargin = 2 + horizontalMargin;
                result.left = normalizedMargin * SIDE_STICKY_AREA;
            }
        }

        switch (placement) {
            case 'TOP_LEFT':
                result.top = 0;
                result.left = 0;
                result.bottom = 'auto';
                break;

            case 'TOP_RIGHT':
                result.top = 0;
                result.right = 0;
                result.bottom = 'auto';
                break;

            case 'TOP_CENTER':
                result.top = 0;
                result.bottom = 'auto';
                calcHorizontalPosition();
                break;

            case 'CENTER_RIGHT':
                result.right = 0;
                calcVerticalPosition();
                break;

            case 'CENTER_LEFT':
                result.left = 0;
                calcVerticalPosition();
                break;

            case 'BOTTOM_LEFT':
                result.bottom = 0;
                result.left = 0;
                result.top = 'auto';
                break;

            case 'BOTTOM_CENTER':
                result.bottom = 0;
                result.top = 'auto';
                calcHorizontalPosition();
                break;

            case 'BOTTOM_RIGHT':
            default:
                result.bottom = 0;
                result.right = 0;
                result.top = 'auto';
                break;
        }

        return _.defaults(result, {
            position: 'fixed',
            top: '',
            left: ''
        });
    }

    function adjustBottomWixAd(css, siteMarginBottom) {
        var adjustedStyle = {};

        if (siteMarginBottom && siteMarginBottom > 0) {
            if (_.isNumber(css.bottom) && css.bottom < siteMarginBottom) {
                adjustedStyle.bottom = siteMarginBottom;
            }
        }

        return adjustedStyle;
    }

    function getValidMarginOrDefault(margin){
        if (margin > 2 || margin < -2){
            margin = 0;
        }
        return margin;
    }

    function getGluedWidgetMeasurements(clientSpecMap, compMeasuringInfo, windowWidth, windowHeight, siteMarginBottom) {
        var horizontalMargin = getValidMarginOrDefault(compMeasuringInfo.props.horizontalMargin);
        var verticalMargin = getValidMarginOrDefault(compMeasuringInfo.props.verticalMargin);
        var gluedPlacement = compMeasuringInfo.props.placement || tpaGluedWidgetPlacement.getDefaultPlacement(compMeasuringInfo.data, clientSpecMap);
        var cssPositionStyles = getCssPositioningAttributes(
            compMeasuringInfo.layout.width, compMeasuringInfo.layout.height, windowWidth, windowHeight, gluedPlacement, verticalMargin, horizontalMargin
        );
        var bottomAdPositionAdjustments = adjustBottomWixAd(cssPositionStyles, siteMarginBottom || 0);
        var measurements = _.assign(cssPositionStyles, bottomAdPositionAdjustments);

        if (measurements.right === 0) {
            measurements.left = windowWidth - compMeasuringInfo.layout.width;
        }

        if (measurements.bottom === 0) {
            measurements.top = windowHeight - compMeasuringInfo.layout.height - (siteMarginBottom || 0);
        }

        return measurements;
    }

    return {
        getGluedWidgetMeasurements: getGluedWidgetMeasurements
    };
});