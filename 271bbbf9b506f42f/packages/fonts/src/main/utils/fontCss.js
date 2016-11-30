define(['lodash', 'fonts/utils/fontUtils'], function (_, fontUtils) {
    'use strict';

    function getFullFontFamily(fontFamily) {
        var fullFontFamily = fontFamily;
        var fallback = fontUtils.getFontFallback(fontFamily);
        if (fallback) {
            fullFontFamily = fullFontFamily + ',' + fallback;
        }

        //surround fonts with quotes if font name contains spaces or non-latin chars
        fullFontFamily = fullFontFamily.replace(/[^,]*[^\w,\d\-][^,]*/g, function (fontFamilyStr) {
            return "'" + fontFamilyStr.replace(/\+/g, " ") + "'";
        });
        return fullFontFamily;
    }

    function getColorCSSFromFontString(fullFontString, themeColors) {
        var colorParts = fullFontString.match(/{color_(\d+)}/);
        if (!colorParts) {
            var colorFromFontString = fullFontString.match(/#[A-Z0-9]{3,6}/);
            if (colorFromFontString) {
                return 'color:' + colorFromFontString[0] + ';';
            }
            return '';
        }
        var colorIndexInTheme = colorParts[1];
        var colorFromTheme = themeColors[colorIndexInTheme];
        if (colorFromTheme.indexOf('#') === 0) {
            return 'color:' + colorFromTheme + ';';
        }
        return 'color:rgba(' + colorFromTheme + ');';
    }

    function getFontCSSFromFontString(fontVal) {
        var font = fontVal;
        if (_.includes(font, '#')) {
            font = font.slice(0, font.indexOf("#"));
        }
        font = font.replace(/\{color_\d+\}/, '');
        var fontFamily = fontUtils.getFontFamily(font);
        var fullFontFamily = getFullFontFamily(fontFamily);
        var childFont = font.replace(fontFamily, fullFontFamily);
        return childFont + ';';
    }

    /**
     *
     * @param fontString
     * @param themeData
     * @returns {*}
     */
    function getFontVal(fontString, themeData) {
        if (_.startsWith(fontString, 'font_')) {
            var fontParts = fontString.split('font_');
            if (fontParts.length === 2) {
                return themeData.font[fontParts[1]];
            }
        }
        return fontString;
    }

    /**
     *
     * @param font
     * @param themeColors
     * @returns {*}
     */
    function fontToCSSWithColor(font, themeColors) {
        var fontVal = getFontVal(font);
        var fontCss = getFontCSSFromFontString(fontVal);
        var colorCss = getColorCSSFromFontString(fontVal, themeColors);

        return fontCss + colorCss;
    }

    /**
     *
     * @param fontString
     * @param themeData
     * @returns {*}
     */
    function fontToCSSWithoutColor(fontString, themeData) {
        var fontVal = getFontVal(fontString, themeData);
        return getFontCSSFromFontString(fontVal);
    }

    /**
     * @param themeFonts: {font_0: 'fontString', font_1: 'fontString'}
     * @param themeColors
     * @returns ".font_0: {"font: 'normal normal normal 45px/1.4em Open+Sans; color: #123456;} "
     */

    function getThemeFontsCss(themeFonts, themeColors) {
        var result = "";

        _.forEach(themeFonts, function (fontString, fontIndex) {
            result += ".font_" + fontIndex + " {font: " + fontToCSSWithColor(fontString, themeColors) + "} \n";
        });

        return result;
    }

    return {
        fontToCSSWithColor: fontToCSSWithColor,
        fontToCSSWithoutColor: fontToCSSWithoutColor,
        getThemeFontsCss: getThemeFontsCss,
        getFullFontFamily: getFullFontFamily
    };
});
