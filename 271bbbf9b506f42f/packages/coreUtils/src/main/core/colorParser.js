define(['lodash', 'color', 'coreUtils/core/cssUtils'], function (_, Color, cssUtils) {
    'use strict';

    /**
     * Get color value, use color from theme if value is a pointer, normalize color to use rgba() syntax
     * @param {obeject} colorsMap
     * @param {string} color
     * @param {number} [alphaOverride]
     * @returns {string}
     */
    function getParsedColor(colorsMap, color, alphaOverride) {
        var parsedColor, colorObj;

        // Get color from theme if the color value is represented as {color_X}
        if (/color_/.test(color)) {
            color = color.replace(/[\[\]{}]/g, '');
            color = getColorValueFromColorsMap(colorsMap, color);
            color = cssUtils.normalizeColorStr(color);
        }

        if (color === 'none') {
            parsedColor = 'transparent';
        } else {
            colorObj = new Color(color);
            if (_.isNumber(alphaOverride)) {
                colorObj.setValues('alpha', alphaOverride);
            }
            if (colorObj.alpha() === 0) {
                parsedColor = 'transparent';
            } else {
                parsedColor = colorObj.rgbaString();
            }
        }

        return parsedColor;
    }

    function getColorValueFromColorsMap(colorsMap, colorClassName) {
        var colorNumber = colorClassName.split('_')[1];

        return colorsMap[colorNumber] || colorClassName;
    }

    function getColorValue(theme, colorClassName) {
        return getColorValueFromColorsMap(theme.color, colorClassName);
    }

    return {
        getColor: getParsedColor,

        /**
         *  Get the color value by theme
         * @param {Object} theme - current theme
         * @param {string} colorClassName
         *  @returns {String} color rgb/rgba value
         */
        getColorValue: getColorValue
    };
});
