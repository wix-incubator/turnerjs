define(['lodash', 'fonts/utils/fontMetadata', 'utils'], function (_, fontsMetadata, utils) {
    'use strict';
    var GOOGLE_FONT_SERVICE_URL = "//fonts.googleapis.com/css?family=";
    var POSSIBLE_CHARACTERS_SETS = ['latin-ext', 'cyrillic', 'japanese', 'korean', 'arabic', 'hebrew', 'latin']; //todo: remove this when the editor change will be ga

    var styleFontsRegex = /<[^>]+class="[^"]*(font_[0-9]+)[^"]*"/g;

    var customTextDataGetterMap = {
        StyledText: function (siteData, dataItem) {
            return [dataItem.text];
        },
        RichText: function (siteData, dataItem) {
            return [dataItem.text];
        }
    };

    function registerCustomTextDataGetter(type, getter) {
        customTextDataGetterMap[type] = getter;
    }

    var customFontFamiliesGetterMap = {};

    function registerCustomFontFamiliesGetter(type, getter) {
        customFontFamiliesGetterMap[type] = getter;
    }

    function parseFontStr(fontStr) {
        return utils.cssUtils.parseFontStr(fontStr);
    }

    function getFontFamily(fontStr) {
        return fontStr.split(' ')[4];
    }

    function getMetadata(fontNames) {
        return _.compact(_.map(fontNames, function (fontName) {
            return fontsMetadata[fontName];
        }));
    }

    function getFontFallback(fontFamily) {
        var cleanFontName = fontFamily.replace(/\+/g, " ").toLowerCase();
        var fontMeta = fontsMetadata[cleanFontName];
        if (fontMeta) {
            var fallback = fontMeta.fallbacks;
            if (fallback) {
                fallback += ",";
            }
            fallback += fontMeta.genericFamily;
            return fallback;
        }

        return '';
    }

    function formatFallbackList(fallbacks) {
        //surround fonts with quotes if font name contains spaces or non-latin chars
        return _(fallbacks)
            .split(',')
            .invoke('replace', /.*[^\w\d\-].*/, '"$&"')
            .join(',');
    }

    function getFontFallbacksCss(fontName) {
        var font = fontsMetadata[fontName.toLowerCase()];
        var fontFamily = font.fontFamily,
            fallbacks;
        if (font) {
            fallbacks = fontFamily;
            if (font.fallbacks !== '') {
                fallbacks += ',' + font.fallbacks;
            }
            fallbacks += ',' + font.genericFamily;
        } else {
            fallbacks = fontName;
        }

        return formatFallbackList(fallbacks);
    }

    function getGoogleFontsUrl(fonts, characterSets) {
        if (fonts.length === 0) {
            return undefined;
        }

        var fontQuery = _.map(fonts, function (font) {
            return font.cdnName + ':n,b,i,bi|';
        });
        if (characterSets) {
            fontQuery.push('&subset=');
            fontQuery.push(characterSets.join(','));
        }

        return GOOGLE_FONT_SERVICE_URL + fontQuery.join("");
    }

    function getPageFontsMetaData(siteData, pageId) {
        var usedFontsList = _.filter(getPageUsedFontsList(siteData, pageId), function (fontFamilyName) {
            return _.has(fontsMetadata, fontFamilyName);
        });
        return getMetadata(usedFontsList);
    }

    function getPageUsedFontsList(siteData, pageId) {
        return computePageUsedFontsList(siteData, pageId);
    }

    function collectFontFamiliesFromStyles(siteData) {
        var styles = _.times(11, function (n) {
            return "font_" + n;
        });
        return getFontFamilyFromStyleIds(siteData, styles);
    }

    function computePageUsedFontsList(siteData, pageId) {
        var currentPageData = siteData.getPageData(pageId).data.document_data;

        var fontFamiliesFromTextData = _(currentPageData)
            .filter(function (data) {
                return _.has(customTextDataGetterMap, data.type);
            })
            .map(function (data) {
                var textDataArray = customTextDataGetterMap[data.type](siteData, data);
                return _.union(utils.fonts.fontsParser.collectFontsFromTextDataArray(textDataArray));
            })
            .flattenDeep()
            .value();

        var customFontFamilies = _(currentPageData)
            .filter(function (data) {
                return _.has(customFontFamiliesGetterMap, data.type);
            })
            .map(function (data) {
                return customFontFamiliesGetterMap[data.type](siteData, data) || [];
            })
            .flattenDeep()
            .value();

        var fontFamiliesFromSiteStructure = _.get(currentPageData, 'masterPage.usedFonts', []);

        return _.union(fontFamiliesFromTextData, customFontFamilies, collectFontFamiliesFromStyles(siteData), fontFamiliesFromSiteStructure);
    }

    function getFontFamilyFromStyleIds(siteData, fontStylesIds) {
        var generalThemeData = siteData.getGeneralTheme();
        return _.map(fontStylesIds, function (fontStyleId) {
            return getFontFamilyByStyleId(generalThemeData, fontStyleId);
        });
    }

    function getFontFamilyByStyleId(generalThemeData, stylesId) {
        var fontStyles = generalThemeData.font;
        var fontIndex = parseInt(stylesId.substring(stylesId.indexOf("_") + 1), 10);
        var fontStyleString = fontStyles[fontIndex];
        var fontFamily = '';
        if (fontStyleString) {
            fontFamily = parseFontStr(fontStyleString).family.toLowerCase();
        }
        return fontFamily;
    }

    function getFontFamilyWithFallbacks(fontName) {
        var font = fontsMetadata[fontName.toLowerCase()];
        var fontFamily = font && font.fontFamily,
            fallbacks;

        if (font) {
            fallbacks = fontFamily;
            if (font.fallbacks !== '') {
                fallbacks += ',' + font.fallbacks;
            }
            fallbacks += ',' + font.genericFamily;
        } else {
            fallbacks = fontName;
        }

        return formatFallbackList(fallbacks);
    }

    function getWixStoredFontsCssUrlsWithParams(baseUrl, characterSets, altBaseUrl) {
        if (altBaseUrl && /localhost|127.0.0.\d/.test(baseUrl)) {
            baseUrl = altBaseUrl;
        }
        baseUrl = baseUrl.replace(/^http:/, '');
        var fontsCssBaseUrl = baseUrl.replace(/\/$/, '') + '/static/css/user-site-fonts/';
        return _.map(characterSets, function (characterSet) {
            return fontsCssBaseUrl + characterSet + '.css';
        });
    }

    function getWixStoredFontsCssUrls(siteData) {
        return getWixStoredFontsCssUrlsWithParams(siteData.santaBase,
            siteData.getDataByQuery("masterPage").characterSets,
            siteData.serviceTopology.scriptsLocationMap.santa);
    }

    function getCurrentSelectablefontsWithParams(documentType, characterSets) {
        var languagesFontsLists = getFontsByPermissionToFontsList(documentType);
        return _(POSSIBLE_CHARACTERS_SETS)
            .intersection(characterSets)
            .map(function (lang) {
                return {
                    lang: lang,
                    fonts: languagesFontsLists[lang]
                };
            })
            .value();
    }

    function getCurrentSelectablefonts(siteData) {
        return getCurrentSelectablefontsWithParams(siteData.rendererModel.siteInfo.documentType, siteData.getDataByQuery("masterPage").characterSets);
    }

    function getFontsByPermissionToFontsList(documentType) {
        var permissions = getFontsPermissions(documentType);
        var langs = _.reduce(fontsMetadata, function (res, value, key) {
            var fontCharacterSets = value.characterSets;
            if (_.includes(permissions, value.permissions)) {
                value.cssFontFamily = getFontFallbacksCss(key);
                _.forEach(fontCharacterSets, function (charSet) {
                    if (!res[charSet]) {
                        res[charSet] = [];
                    }
                    res[charSet].push(value);
                }, this);
            }
            return res;
        }, {});

        _.forOwn(langs, function (fontList, charSet) {
            langs[charSet] = _.sortBy(fontList, 'displayName');
        }, this);
        return langs;
    }

    function getFontsUrlWithParams(fontNamesObject, documentType, characterSets) {
        var fontsFamiliesArray = (_.isArray(fontNamesObject) ? fontNamesObject : _.keys(fontNamesObject));
        var query = getFontsQuery(fontsFamiliesArray, documentType, characterSets);
        if (query) {
            return GOOGLE_FONT_SERVICE_URL + query;
        }

        return "";
    }

    function getFontsUrl(fontNamesObject, siteData) {
        return getFontsUrlWithParams(fontNamesObject, siteData.rendererModel.siteInfo.documentType, siteData.getDataByQuery("masterPage").characterSets);
    }

    function getFontsPermissions(documentType) {
        var permissions = ['all', 'legacy'];
        if (documentType === 'WixSite') {
            permissions.push('studio');
        }
        return permissions;
    }

    function getFontsQuery(fontsFamiliesArray, documentType, characterSets) {
        var fontQuery = '';
        var permissions = getFontsPermissions(documentType);
        _.forEach(fontsFamiliesArray, function (fontFamily) {
            var font = fontsMetadata[fontFamily];
            if (font && font.cdnName && _.includes(permissions, font.permissions)) {
                fontQuery += font.cdnName;
                fontQuery += ':n,b,i,bi|';
            }
        });
        if (fontQuery === '') {
            return null;
        }
        if (characterSets) {
            fontQuery += '&subset=' + characterSets.join(',');
        }
        return fontQuery;
    }

    function getFontClassName(text) {
        styleFontsRegex.lastIndex = 0;
        var match = styleFontsRegex.exec(text);
        return match ? match[1] : undefined;
    }

    function parseStyleFont(fontStyleName, themeFonts, themeColors) {
        if (themeFonts[fontStyleName]) {
            var fontObject = parseStringFont(themeFonts[fontStyleName]);
            return parseThemeFontColor(fontObject, themeColors);
        }
        return parseStringFont(fontStyleName);
    }

    function parseThemeFontColor(fontObject, themeColors) {
        var fontColor = fontObject.color && fontObject.color.match(/{([^}]+)}/);
        if (themeColors && fontColor && themeColors[fontColor[1]]) {
            fontObject.cssColor = themeColors[fontColor[1]];
        } else {
            fontObject.cssColor = fontObject.color;
        }
        return fontObject;
    }

    function parseStringFont(fontValue) {
        var fontObject = parseFontStr(fontValue);
        fontObject.fontWithFallbacks = getFontFamilyWithFallbacks(fontObject.family);
        return fontObject;
    }

    function getWixHelveticaUrl(serviceTopology) {
        return serviceTopology.publicStaticsUrl + '/css/Helvetica/fontFace.css';
    }

    function getWixStaticsFontsLinks(serviceTopology, characterSets, documentType) {
        var result = {};

        _.forEach(characterSets, function (characterSet) {
            result[characterSet] = utils.media.getMediaUrl(serviceTopology, 'user-site-fonts/v3/' + characterSet + '.css');
        });

        if (documentType === 'WixSite') {
            result.helveticas = utils.media.getMediaUrl(serviceTopology, 'user-site-fonts/v3/helvetica.css');
        }
        return result;
    }

    function getCssUrls(documentType, serviceTopology) {
        var cssLinks = {};

        cssLinks.googleFonts = getFontsUrlWithParams(fontsMetadata, documentType, POSSIBLE_CHARACTERS_SETS);
        _.merge(cssLinks, getWixStaticsFontsLinks(serviceTopology, POSSIBLE_CHARACTERS_SETS, documentType));

        return cssLinks;
    }

    return {
        parseFontStr: parseFontStr,
        parseStyleFont: parseStyleFont,
        getMetadata: getMetadata,
        getGoogleFontsUrl: getGoogleFontsUrl,
        getFontFamily: getFontFamily,
        getFontFallback: getFontFallback,
        getPageFontsMetaData: getPageFontsMetaData,
        getFontFamilyWithFallbacks: getFontFamilyWithFallbacks,
        getWixStoredFontsCssUrls: getWixStoredFontsCssUrls,
        getWixStoredFontsCssUrlsWithParams: getWixStoredFontsCssUrlsWithParams,
        getCurrentSelectablefonts: getCurrentSelectablefonts,
        getCurrentSelectablefontsWithParams: getCurrentSelectablefontsWithParams,
        collectFontsFromTextDataArray: utils.fonts.fontsParser.collectFontsFromTextDataArray,
        getFontsUrl: getFontsUrl,
        getFontsUrlWithParams: getFontsUrlWithParams,
        getFontFamilyByStyleId: getFontFamilyByStyleId,
        getFontClassName: getFontClassName,
        registerCustomTextDataGetter: registerCustomTextDataGetter,
        registerCustomFontFamiliesGetter: registerCustomFontFamiliesGetter,
        getPageUsedFontsList: getPageUsedFontsList,
        getWixHelveticaUrl: getWixHelveticaUrl,
        getCssUrls: getCssUrls,
        POSSIBLE_CHARACTERS_SETS: POSSIBLE_CHARACTERS_SETS //used by the Santa-Editor //todo: needs to be removed!!
    };
});
