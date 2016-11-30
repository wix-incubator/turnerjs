define([], function() {
    'use strict';

    var MOBILE_DEFAULT_MIN_FONT_SIZE = 12;
    var desktopToMobileFontSizeMap = {
        '26': 26,
        '27': 26,
        '28': 26,
        '29': 27,
        '30': 27,
        '31': 27,
        '32': 28,
        '33': 28,
        '34': 28,
        '35': 29,
        '36': 29,
        '37': 29,
        '38': 30,
        '39': 30,
        '40': 30,
        '41': 31,
        '42': 31,
        '43': 31,
        '44': 32,
        '45': 32,
        '46': 32,
        '47': 33,
        '48': 33,
        '49': 33,
        '50': 34,
        '51': 34,
        '52': 34,
        '53': 35,
        '54': 35,
        '55': 35,
        '56': 36,
        '57': 36,
        '58': 36,
        '59': 37,
        '60': 37,
        '61': 37,
        '62': 38,
        '63': 38,
        '64': 38,
        '65': 39,
        '66': 39,
        '67': 39,
        '68': 40,
        '69': 40,
        '70': 40,
        '71': 41,
        '72': 41,
        '73': 41,
        '74': 42,
        '75': 42,
        '76': 42,
        '77': 43,
        '78': 43,
        '79': 43,
        '80': 44,
        '81': 44,
        '82': 44,
        '83': 45,
        '84': 45,
        '85': 45,
        '86': 46,
        '87': 46,
        '88': 46,
        '89': 47,
        '90': 47,
        '91': 47,
        '92': 48,
        '93': 48,
        '94': 48,
        '95': 49,
        '96': 49,
        '97': 49,
        '98': 50,
        '99': 50,
        '100': 50
    };

    /**
     *
     * @param desktopFontSize
     * @return {number}
     */
    function getMobileFontSize(desktopFontSize) {
        var mobileFontSize;
        var mobileDefaultMinFontSize = MOBILE_DEFAULT_MIN_FONT_SIZE;

        var intDesktopFontSize = Math.round(desktopFontSize);

        if (intDesktopFontSize < mobileDefaultMinFontSize) {
            mobileFontSize = mobileDefaultMinFontSize;
        } else if (intDesktopFontSize <= 14) {
            mobileFontSize = intDesktopFontSize + 1;
        } else if (intDesktopFontSize <= 25) {
            mobileFontSize = intDesktopFontSize;
        } else if (intDesktopFontSize <= 100) {
            mobileFontSize = desktopToMobileFontSizeMap[intDesktopFontSize];
        } else {
            mobileFontSize = 50;
        }
        return mobileFontSize;
    }

    /**
     *
     * @param fontSize
     * @param scale
     * @return {number}
     */
    function convertFontSizeToMobile(fontSize, scale) {
        var mobileFontSize = this.getMobileFontSize(fontSize);
        return scale * mobileFontSize;
    }

    function getMinFontSize() {
        return MOBILE_DEFAULT_MIN_FONT_SIZE;
    }

    return {
        getMobileFontSize: getMobileFontSize,
        convertFontSizeToMobile: convertFontSizeToMobile,
        getMinFontSize: getMinFontSize
    };
});
