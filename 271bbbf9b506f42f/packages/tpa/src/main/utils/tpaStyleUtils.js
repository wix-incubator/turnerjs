define(['lodash', 'color', 'fonts', 'utils'], function (_, color, fonts, utils) {
    'use strict';
    var COLOR_PARAM_KEY_PREFIX = 'param_color_',
        NUMBER_PARAM_KEY_PREFIX = 'param_number_',
        BOOLEAN_PARAM_KEY_PREFIX = 'param_boolean_',
        FONT_PARAM_KEY_PREFIX = 'param_font_';

    var getFontsKeyToNameMap = function () {
        return {
            "Title": "font_0",
            "Menu": "font_1",
            "Page-title": "font_2",
            "Heading-XL": "font_3",
            "Heading-L": "font_4",
            "Heading-M": "font_5",
            "Heading-S": "font_6",
            "Body-L": "font_7",
            "Body-M": "font_8",
            "Body-S": "font_9",
            "Body-XS": "font_10"
        };
    };

    var getNameToFontsKeyMap = function() {
        var fontsKeyToNameMap = getFontsKeyToNameMap();
        return _.invert(fontsKeyToNameMap);
    };

    var createFontObject = function (currFontString, fontName) {
        var fontObj = fonts.fontUtils.parseFontStr(currFontString);
        var fontWithFallbacks = fonts.fontUtils.getFontFamilyWithFallbacks(fontObj.family);
        return {
            editorKey: fontName,
            lineHeight: fontObj.lineHeight,
            style: fontObj.style,
            weight: fontObj.weight,
            size: fontObj.size,
            fontFamily: fontObj.family.toLowerCase(),
            value: 'font:' + [fontObj.style, fontObj.variant, fontObj.weight, fontObj.size + '/' + fontObj.lineHeight, fontWithFallbacks].join(' ') + ';'
        };
    };
    var rgbToHex = function (rgbAsString) {
        var rgbAsArray = rgbAsString.split(',');

        return color({
            r: rgbAsArray[0],
            g: rgbAsArray[1],
            b: rgbAsArray[2]
        }).hexString();
    };

    var getUploadFontFaces = function(allFonts, siteData, styleId) {
        var siteTextPresets = _.assign(getStylesFonts(styleId, siteData.getAllTheme()), getTextPresets(allFonts));

        var uploadedFontsUtils = utils.fonts.uploadedFontsUtils;
        var usedUploadedFonts = _(siteTextPresets)
            .map(function (val) {
                if (_.isString(val)) {
                    val = JSON.parse(val);
                }
                return (val.family || val.fontFamily);
            })
            .filter(function (fontFamily) {
                return uploadedFontsUtils.isUploadedFontFamily(fontFamily);
            })
            .union()
            .value();

        return uploadedFontsUtils.getUploadedFontFaceStyles(usedUploadedFonts, siteData.serviceTopology.mediaRootUrl);
    };

    var getAllGoogleFontsUrl = function (allFonts, siteData, styleId) {
        return getGoogleFontsCssUrl(_.assign(getStylesFonts(styleId, siteData.getAllTheme()), getTextPresets(allFonts)), siteData);
    };
    var getGoogleFontsCssUrl = function (siteTextPresets, siteData) {
        var fontsObj = {};
        _.forEach(siteTextPresets, function (val) {
            if (typeof val === 'string') {
                val = JSON.parse(val);
            }
            fontsObj[val.family || val.fontFamily] = 1;
        });
        var fontUrl = fonts.fontUtils.getFontsUrl(fontsObj, siteData);

        // In case there are no google fonts, return an empty url
        if (_.includes(fontUrl, "family=null")) {
            return '';
        }
        return fontUrl;
    };
    var getStylesFonts = function (styleId, siteTheme) {
        var fontsDic = {};
        var stylesProps = getAppStyleProperties(styleId, siteTheme);

        _.forEach(stylesProps, function (val, key) {
            if (key.match(FONT_PARAM_KEY_PREFIX)) {
                fontsDic[key.replace(FONT_PARAM_KEY_PREFIX, '')] = val;
            }
        }, this);
        return fontsDic;
    };

    var getAppStyleProperties = function (styleId, siteThemes) {
        var myTheme = siteThemes[styleId];
        if (!myTheme) {
            return null;
        }
        var styleData = myTheme.style && myTheme.style.properties;
        if (!styleData) {
            return null;
        }
        return styleData;
    };
    var getColorParamFromStyle = function (prop, styles, isExtraParam, theme) {
        var val = styles[prop];
        var selectedColor;

        if (val && !_.isString(val) && val.value) { //ui-lib
            return {themeName: undefined, value: val.value.cssColor || val.value.color.value || val.value.rgba};
        }
        if (!isExtraParam && val && _.isString(val) && utils.stringUtils.startsWith(val, 'color_')) {
            var colorValue = utils.colorParser.getColorValue(theme, val);
            colorValue = _.includes(colorValue, ',') ? rgbToHex(colorValue) : colorValue;
            var themeVal = color(colorValue);
            if (styles.hasOwnProperty('alpha-' + prop) && styles['alpha-' + prop] !== 1) {
                selectedColor = 'rgba(' + (themeVal.values.rgb.join(",")) + ',' + styles['alpha-' + prop] + ')';
            } else {
                selectedColor = themeVal.hexString();
            }
            return {themeName: val, value: selectedColor};
        } else if (!isExtraParam) {
            return {themeName: undefined, value: val};
        }
        return {themeName: undefined, value: undefined};
    };

    var getValueForWixParams = function (allThemes, wixParams, callback) {

        var result = _.reduce(wixParams, function (output, value, prop) {
            var key;
            var isExtraParam = utils.stringUtils.startsWith(prop, 'alpha-');

            if (isExtraParam) {
                return output;
            } else if (prop.match(COLOR_PARAM_KEY_PREFIX)) {
                key = getStyleKey(COLOR_PARAM_KEY_PREFIX, prop);
                output[key] = _.get(getColorParamFromStyle(prop, wixParams, isExtraParam, allThemes), 'value');
                return output;
            } else if (prop.match(NUMBER_PARAM_KEY_PREFIX)) {
                key = getStyleKey(NUMBER_PARAM_KEY_PREFIX, prop);
                output[key] = +value;
                return output;
            } else if (prop.match(BOOLEAN_PARAM_KEY_PREFIX)) {
                key = getStyleKey(BOOLEAN_PARAM_KEY_PREFIX, prop);
                output[key] = getBoolValue(value);
                return output;
            } else if (prop.match(FONT_PARAM_KEY_PREFIX)) {
                key = getStyleKey(FONT_PARAM_KEY_PREFIX, prop);
                output[key] = _.get(getFontObject(value, allThemes), 'value');
                return output;
            }

        }, {});

        callback(result);
    };

    var getBoolValue = function(value) {
        if (_.isBoolean(value)) {
            return value;
        }

        return value !== 'false';
    };

    var getStyleKey = function(prefix, key) {
        return 'style.' + key.replace(prefix, '');
    };

    var setValueForStoredParam = function (prop, stylesProps, stylesForSDK, siteData) {
        //skips extra params
        var allThemes = siteData.getAllTheme().THEME_DATA;
        var isExtraParam = utils.stringUtils.startsWith(prop, 'alpha-');
        if (stylesProps.hasOwnProperty(prop) && !isExtraParam) {
            if (prop.match(COLOR_PARAM_KEY_PREFIX)) {
                stylesForSDK.colors[prop.replace(COLOR_PARAM_KEY_PREFIX, '')] = getColorParamFromStyle(prop, stylesProps, isExtraParam, allThemes);
            } else if (prop.match(NUMBER_PARAM_KEY_PREFIX)) {
                stylesForSDK.numbers[prop.replace(NUMBER_PARAM_KEY_PREFIX, '')] = +stylesProps[prop];
            } else if (prop.match(BOOLEAN_PARAM_KEY_PREFIX)) {
                stylesForSDK.booleans[prop.replace(BOOLEAN_PARAM_KEY_PREFIX, '')] = getBoolValue(stylesProps[prop]);
            } else if (prop.match(FONT_PARAM_KEY_PREFIX)) {
                stylesForSDK.fonts[prop.replace(FONT_PARAM_KEY_PREFIX, '')] = getFontObject(stylesProps[prop], allThemes);
            }
        }
    };

    var getFontObject = function(font, allThemes) {
        var savedFont = (typeof font === "object") ? font.value : JSON.parse(font);
        if (savedFont.fontStyleParam && savedFont.preset === 'Custom') {
            updateCustomSavedFontValue(savedFont);
        } else if (savedFont.fontStyleParam && savedFont.theme) {
            updatePresetSelectedFromNewUILib(savedFont);
        } else if (savedFont.fontStyleParam) {
            updatePresetSavedFontValue(savedFont, allThemes.font);
        } else if (savedFont.fontParam && savedFont.preset === 'None') {
            updateSavedFontValueFromNewUILib(savedFont);
        } else if (savedFont.fontParam) {
            updateSavedFontValue(savedFont);
        }

        return savedFont;
    };

    var updateCustomSavedFontValue = function (savedFont) {
        var fontWithFallbacks = fonts.fontUtils.getFontFamilyWithFallbacks(savedFont.family);
        var size = savedFont.size + "px";
        var lineHeight = Math.floor(savedFont.size * 1.25) + "px"; //font size +20%
        var style = savedFont.style.italic ? 'italic' : 'normal';
        var weight = savedFont.style.bold ? 'bold' : 'normal';
        var variant = 'normal';
        var value = '';
        value += 'font:' + [style, variant, weight, size + '/' + lineHeight, fontWithFallbacks].join(' ') + ';';
        value += savedFont.style.underline ? 'text-decoration:underline;' : '';
        savedFont.value = value;
    };

    var updatePresetSavedFontValue = function (savedFont, allFonts) {
        var allFontsDef = getTextPresets(allFonts);
        var themeFont = allFontsDef[savedFont.preset];

        savedFont.value = themeFont.value;
        savedFont.size = parseInt(themeFont.size, 10);
        savedFont.family = themeFont.fontFamily;
        savedFont.style.bold = themeFont.weight === 'bold';
        savedFont.style.italic = themeFont.style === 'italic';
        savedFont.style.underline = false;
    };

    var updatePresetSelectedFromNewUILib = function (savedFont) {
        var fontWithFallbacks = fonts.fontUtils.getFontFamilyWithFallbacks(savedFont.family);
        var themeFont = fonts.fontUtils.parseFontStr(savedFont.preset);

        savedFont.value = 'font:' + [themeFont.style, themeFont.variant, themeFont.weight, themeFont.size + '/' + themeFont.lineHeight, fontWithFallbacks].join(' ') + ';';
        savedFont.size = parseInt(themeFont.size, 10);
        savedFont.family = themeFont.family.toLowerCase();
        savedFont.style.bold = themeFont.weight === 'bold';
        savedFont.style.italic = themeFont.style === 'italic';
        savedFont.style.underline = false;
    };

    var updateSavedFontValueFromNewUILib = function (savedFont) {
        var fontWithFallbacks = fonts.fontUtils.getFontFamilyWithFallbacks(savedFont.family);
        var style = savedFont.style.italic ? 'italic' : 'normal';
        var weight = savedFont.style.bold ? 'bold' : 'normal';
        var value = '';
        value += 'font-family:' + fontWithFallbacks + ';font-style:' + style + ';font-weight:' + weight + ';';
        value += savedFont.style.underline ? 'text-decoration:underline;' : '';
        savedFont.value = value;
    };


    var updateSavedFontValue = function (savedFont) {
        savedFont.family = savedFont.value;
        savedFont.value = buildFontValue(savedFont);
        savedFont.size = 0;
        savedFont.style = {
            bold: false,
            italic: false,
            underline: false
        };
    };
    var buildFontValue = function (font) {
        var value = 'font-family:' + (font.cssFontFamily || font.value) + ';';
        // Escape double quote for FF/IE support
        value = value.replace(/''/g, "'");

        return value;
    };

    var getStylesForSDK = function (siteData, styleId) {
        var siteThemes = siteData.getAllTheme();
        var mainTheme = siteThemes.THEME_DATA;
        var stylesForSDK = {
            colors: {},
            numbers: {},
            booleans: {},
            fonts: {},
            googleFontsCssUrl: getAllGoogleFontsUrl(mainTheme.font, siteData, styleId),
            uploadFontFaces: getUploadFontFaces(mainTheme.font, siteData, styleId)
        };
        var stylesProps = getAppStyleProperties(styleId, siteThemes);
        if (!stylesProps) {
            return stylesForSDK;
        }

        _.forEach(stylesProps, function (value, prop) {
            setValueForStoredParam(prop, stylesProps, stylesForSDK, siteData);
        });

        return stylesForSDK;
    };

    var getTextPresets = function (allFonts) {
        var index = 0;
        return _.reduce(getFontsKeyToNameMap(), function (result, value, key) {
            result[key] = createFontObject(allFonts[index++], value);
            return result;
        }, {});
    };

    var getSiteColors = function (allColors) {
        return _.reduce(allColors, function (res, item, index) {
            if ((index >= 1 && index <= 5) || (index >= 11 && index <= 35)) {
                res.push({
                    name: "color_" + index,
                    value: _.includes(item, ',') ? rgbToHex(item) : item
                });
            }
            return res;
        }, []);
    };

    var filterLegacyFonts = function (fontsByLang) {
        _.forEach(fontsByLang, function (lang) {
            lang.fonts = _.reject(lang.fonts, {permissions: 'legacy'});
        });
        return fontsByLang;
    };

    var getStyleDataToPassIntoApp = function (siteAPI, comp, shouldAddWixHelveticaFonts) {
        var siteData = siteAPI.getSiteData();
        var allThemes = siteData.getAllTheme().THEME_DATA;
        var appComp = comp && comp.hasOrigComponent() ? siteAPI.getComponentById(comp.getOrigComponentId()) : comp;
        var imageSprintUrl = (_.includes(siteData.santaBase, 'localhost') ? siteData.santaBase : siteData.santaBase.replace("http://", "//")) + '/static/images/editorUI/fonts.v3.png';



        var fonsMetaWithoutLegacyFonts = filterLegacyFonts(fonts.fontUtils.getCurrentSelectablefonts(siteData));
        var cssUrls = fonts.fontUtils.getWixStoredFontsCssUrls(siteData);
        if (shouldAddWixHelveticaFonts){
            var wixHelveticaFonts = [fonts.fontUtils.getWixHelveticaUrl(siteData.serviceTopology)];
            cssUrls = cssUrls.concat(wixHelveticaFonts);
        }

        return {
            fonts: {
                cssUrls: cssUrls,
                imageSpriteUrl: imageSprintUrl,
                fontsMeta: fonsMetaWithoutLegacyFonts
            },
            siteTextPresets: getTextPresets(allThemes.font),
            siteColors: getSiteColors(allThemes.color),
            style: appComp ? getStylesForSDK(siteData, appComp.props.structure.styleId) : {}
        };
    };
    return {
        getTextPresets: getTextPresets,
        getSiteColors: getSiteColors,
        getStylesForSDK: getStylesForSDK,
        getStyleDataToPassIntoApp: getStyleDataToPassIntoApp,
        getNameToFontsKeyMap: getNameToFontsKeyMap,
        getValueForWixParams: getValueForWixParams
    };
});
