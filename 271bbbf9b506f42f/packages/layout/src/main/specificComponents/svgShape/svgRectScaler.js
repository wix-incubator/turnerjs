/**
 * Created by eitanr on 6/25/14.
 */
define(['layout/specificComponents/svgShape/svgBasicScaler'], function (basic) {
    'use strict';
    var scaleAttribute = function (rectElement, attributeName, originalValue, scale) {
            if (originalValue) {
                rectElement.setAttribute(attributeName, basic.scaleSingleValue(originalValue, scale));
            }
        };

    return {
        scale: function (rectElement, scaleX, scaleY) {
            var width = rectElement.getAttribute('width'),
                height = rectElement.getAttribute('height'),
                rx = rectElement.getAttribute('rx'),
                ry = rectElement.getAttribute('ry'),
                x = rectElement.getAttribute('x'),
                y = rectElement.getAttribute('y');

            scaleAttribute(rectElement, 'width', width, scaleX);
            scaleAttribute(rectElement, 'height', height, scaleY);
            scaleAttribute(rectElement, 'rx', rx, scaleX);
            scaleAttribute(rectElement, 'ry', ry, scaleY);
            scaleAttribute(rectElement, 'x', x, scaleX);
            scaleAttribute(rectElement, 'y', y, scaleY);
        }
    };
});