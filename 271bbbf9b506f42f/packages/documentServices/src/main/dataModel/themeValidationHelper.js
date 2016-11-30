define(['lodash', 'fonts'], function(_, fonts) {
    "use strict";

    var FONT_POSSIBLE_VALUES = {
        STYLE: ['normal', 'italic'],
        VARIANT: ['normal', 'small-caps', 'inherit'],
        WEIGHT: ['normal', 'bold', 'bolder', 'lighter'],
        UNITS: ['px', 'em', 'pt', 'ex', 'in', 'cm', 'mm', 'pc']
    };

    function validateFont(ps, fontStr, allColors) {
        var result = {isValid: false, error: null};
        var split = fontStr.split(' ');
        if (split.length !== 6) {
            result.error = new Error("font format isn't correct please supply following format: font-style font-variant font-weight font-size/line-height font-family color");
            return result;
        }
        var isStyleValid = _.includes(FONT_POSSIBLE_VALUES.STYLE, split[0]);
        if (!isStyleValid) {
            result.error = new Error("font-style isn't valid. possible values are: " + FONT_POSSIBLE_VALUES.STYLE);
            return result;
        }
        var isVariantValid = _.includes(FONT_POSSIBLE_VALUES.VARIANT, split[1]);
        if (!isVariantValid) {
            result.error = new Error("font-variant isn't valid. possible values are: " + FONT_POSSIBLE_VALUES.VARIANT);
            return result;
        }
        var isWeightValid = _.includes(FONT_POSSIBLE_VALUES.WEIGHT, split[2]);
        if (!isWeightValid) {
            result.error = new Error("font-weight isn't valid. possible values are: " + FONT_POSSIBLE_VALUES.WEIGHT);
            return result;
        }
        var sizeSplit = split[3] ? split[3].split('/') : [];
        var isSizeValid = checkIfSizeStringIsValid(sizeSplit[0]);
        if (!isSizeValid) {
            result.error = new Error("font-size isn't valid.Correct format is: fontSize+unit.Possible units allowed are: " + FONT_POSSIBLE_VALUES.UNITS);
            return result;
        }
        var isLineHeightValid = checkIfSizeStringIsValid(sizeSplit[1]);
        if (!isLineHeightValid) {
            result.error = new Error("line-height isn't valid.Correct format is: lineHeight+unit.Possible units allowed are: " + FONT_POSSIBLE_VALUES.UNITS);
            return result;
        }
        var isFontFamilyValid = fonts && fonts.fontMetaData ? _.includes(Object.keys(fonts.fontMetaData), split[4]) : true;
        if (!isFontFamilyValid) {
            result.error = new Error("font family isn't correct " + split[4]);
            return result;
        }
        var isColorValid = isColorInSchema(split[5], allColors) || validateColor(ps, split[5]);
        if (!isColorValid) {
            result.error = new Error("color isn't in correct format.Correct format is {color_5} or rgba/hex");
            return result;
        }
        result.isValid = (isStyleValid && isVariantValid && isWeightValid && isSizeValid && isLineHeightValid && isFontFamilyValid && isColorValid);
        return result;
    }

    function validateColor(ps, colorToValidate) {
        if (colorToValidate) {
            var isThemeColor = /^\{color_([0-9]{1,2}|100)\}$/.test(colorToValidate);
            var isHexColor = validateHexColor(ps, colorToValidate);
            var isRGBAColor = rgbaColor(colorToValidate);
            return isThemeColor || isHexColor || isRGBAColor;
        }
        return false;
    }

    function validateHexColor(ps, hexColor) {
        return !!hexColor && /^#(([0-9|a-f|A-F]){3}){1,2}$/.test(hexColor);
    }

    function rgbaColor(value) {
        if (value === null) {
            return true;
        }
        var split = value.split(',');

        if (split.length !== 3 && split.length !== 4) {
            return false;
        }

        var alpha = split[3];
        var validRgb = _.every(split.slice(0, 3), function (number) {
            return number >= 0 && number <= 255;
        });

        if (!validRgb) {
            return false;
        }

        if (alpha) {
            return alpha >= 0 && alpha <= 1;
        }

        return true;
    }

    function isColorInSchema(color, allColors) {
        if (!(color[0] === "{" && color[color.length - 1] === "}")) {
            return false;
        }
        var colorName = color.substring(1, color.length - 1);
        colorName = colorName.replace(/_/g, '');
        return _.includes(Object.keys(allColors), colorName);
    }

    function checkIfSizeStringIsValid(sizeStr) {
        sizeStr = String(sizeStr);
        var size = parseFloat(sizeStr);
        var unit = sizeStr.split(String(size)).join('');
        var isSizeValue = !isNaN(size);
        var isUnitValue = _.includes(FONT_POSSIBLE_VALUES.UNITS, unit);
        return isSizeValue && isUnitValue;
    }

    return {
        validateColor: validateColor,
        validateHexColor: validateHexColor,
        validateFont: validateFont,
        FONT_POSSIBLE_VALUES: _.cloneDeep(FONT_POSSIBLE_VALUES)
    };
});