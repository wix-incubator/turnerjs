define(['lodash', 'definition!fonts/utils/fontUtils', 'utils', 'experiment'], function (_, fontUtilsDef, utils, experiment) {
    'use strict';

    describe('fontUtils', function () {


        var masterPage = {
            usedFonts: ['arial'],
            characterSets: ['latin'],
            id: "masterPage",
            mainPage: "#mainPage",
            siteName: "Template Base"
        };

        var THEME_DATA = {
            "type": "WFlatTheme",
            "id": "THEME_DATA",
            "font": [
                "normal normal bold 40px/1.4em arial {color_15}",
                "normal normal bold 12px/1.4em arial #3A1C13",
                "normal normal bold 12px/1.4em amiri #3A1C13"
            ]
        };

        var mockedSiteData = {
            santaBase: "http://127.0.0.1",
            serviceTopology: {
                publicStaticsUrl: 'http://static.parastorage.com/services/wix-public/1.182.0/',
                scriptsLocationMap: {
                    santa: "http://127.0.0.1"
                },
                scriptsDomainUrl: "http://127.0.0.1"
            },
            rendererModel: {
                siteInfo: {
                    documentType: "UGC"
                }
            },

            pagesData: {
                masterPage: {
                    'data': {
                        "document_data": {
                            "masterPage": {
                                "type": "Document",
                                "id": "masterPage"
                            },
                            "c24x6": {
                                "type": "Page",
                                "id": "c24x6"
                            }
                        },
                        "theme_data": {
                            "THEME_DATA": THEME_DATA
                        }
                    }
                },
                'test_page': {
                    'data': {
                        'document_data': {
                            'test_rich_text': {
                                "type": "StyledText",
                                "id": "c1bk0",
                                "text": '<p class="font_1"><span style="font-family:\'niconne\',fantasy;">Some text</span></p>' +
                                '<p class="font_1"><span style="font-family:lobster,fantasy;">Some other text</span></p>'
                            }
                        }
                    }
                },
                'test_page_with_different_commas': {
                    'data': {
                        'document_data': {
                            'test_rich_text': {
                                "type": "StyledText",
                                "id": "c1bk0",
                                "text": "<p class='font_1'><span style='font-family:niconne,fantasy;>Some text</span></p>" +
                                "<p class='font_1'><span style='font-family:lobster,fantasy;'>Some other text</span></p>"
                            }
                        }
                    }
                },
                'test_page2': {
                    'data': {
                        'document_data': {
                            'test_rich_text': {
                                "type": "StyledText",
                                "id": "c1bk0",
                                "text": '<h2 class="font_1">gagabaga</h2>' +
                                '<h6 class="font_2">Tube channel&nbsp;Currcam68 watch and enjoy.</h6>'
                            }
                        }
                    }
                },
                'page_with_data_no_text': {
                    'data': {
                        'document_data': {
                            'test_rich_text': {
                                "type": "StyledText",
                                "id": "c1bk0"
                            }
                        }
                    }
                },
                'page_with_app_part': {
                    'data': {
                        'document_data': {
                            'test_rich_text': {
                                "type": "AppPart",
                                "id": "c1bk0"
                            }
                        }
                    }
                },
                'page_with_app_builder': {
                    'data': {
                        'document_data': {
                            'test_rich_text': {
                                "type": "AppBuilderComponent",
                                "id": "c1bk0"
                            }
                        }
                    }
                }
            },

            getGeneralTheme: function () {
                return THEME_DATA;
            },

            getDataByQuery: function (query) {
                if (query === "masterPage") {
                    return masterPage;
                }
            },

            getPageUsedFonts: function () {
                return undefined;
            },

            getPageData: function (pageId) {
                return this.pagesData[pageId];
            },

            setPageUsedFonts: function () {
            }
        };

        var fontsMetadataMock = {
            "arial": {
                "displayName": "Arial",
                "fontFamily": "arial",
                "cdnName": "",
                "genericFamily": "sans-serif",
                "provider": "system",
                "characterSets": [
                    "latin",
                    "latin-ext",
                    "cyrillic",
                    "hebrew",
                    "arabic"
                ],
                "permissions": "all",
                "fallbacks": "arial-fall-back,arial-fall-back-2",
                "spriteIndex": 2
            },
            "amiri": {
                "displayName": "Amiri",
                "fontFamily": "amiri",
                "cdnName": "",
                "genericFamily": "serif",
                "provider": "open source",
                "characterSets": [
                    "arabic"
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 187
            },
            "amiri2": {
                "displayName": "Amiri 2",
                "fontFamily": "amiri2",
                "cdnName": "amiri+2+cdn",
                "genericFamily": "serif",
                "provider": "google",
                "characterSets": [
                    "latin"
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 23
            },
            "lobster": {
                "displayName": "Lobster",
                "fontFamily": "lobster",
                "cdnName": "Lobster",
                "genericFamily": "cursive",
                "provider": "google",
                "characterSets": [
                    "latin",
                    "latin-ext",
                    "cyrillic"
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 54
            },
            "niconne": {
                "displayName": "Niconne",
                "fontFamily": "niconne",
                "cdnName": "Niconne",
                "genericFamily": "fantasy",
                "provider": "google",
                "characterSets": [
                    "latin"
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 58
            },
            "fbplum": {
                "displayName": "FB Plum",
                "fontFamily": "fbplum",
                "cdnName": "",
                "genericFamily": "fantasy",
                "provider": "monotype",
                "characterSets": [
                    "korean"
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 202
            },
            "fbgreen": {
                "displayName": "FB Green",
                "fontFamily": "fbgreen",
                "cdnName": "",
                "genericFamily": "sans-serif",
                "provider": "monotype",
                "characterSets": [
                    "korean"
                ],
                "permissions": "all",
                "fallbacks": "",
                "spriteIndex": 203
            },
            "din-next-w01-light": {
                "displayName": "DIN Next Light",
                "fontFamily": "din-next-w01-light",
                "cdnName": "",
                "genericFamily": "sans-serif",
                "provider": "monotype",
                "characterSets": [
                    "latin",
                    "latin-ext",
                    "cyrillic"
                ],
                "permissions": "all",
                "fallbacks": "din-next-w02-light,din-next-w10-light",
                "spriteIndex": 121
            }
        };

        var mockThemeColors = {
            'color_0': '#ffffff',
            'color_1': '#FFFFFF',
            'color_2': '#000000',
            'color_3': '237,28,36,1',
            'color_4': '0,136,203,1',
            'color_5': '255,203,5,1',
            'color_6': '114,114,114,1',
            'color_7': '176,176,176,1',
            'color_8': '255,255,255,1',
            'color_9': '114,114,114,1',
            'color_10': '176,176,176,1',
            'color_11': '#FFFFFF',
            'color_12': '#CCCCCC',
            'color_13': '160,160,159,1',
            'color_14': '#605E5E',
            'color_15': '#2F2E2E',
            'color_16': '#BAE9FF',
            'color_17': '#97DEFF',
            'color_18': '#30BDFF',
            'color_19': '#207EA9',
            'color_20': '#103F54',
            'color_21': '#B6E8E3',
            'color_22': '#8DD1CA',
            'color_23': '#41BAAE',
            'color_24': '#2B7C74',
            'color_25': '#163E3A',
            'color_26': '#F4C0AF',
            'color_27': '#E99F86',
            'color_28': '#DE5021',
            'color_29': '#943616',
            'color_30': '#4A1B0B',
            'color_31': '#F4EAB1',
            'color_32': '#E9DB89',
            'color_33': '#DEC328',
            'color_34': '#94821B',
            'color_35': '#4A410D'
        };

        var mockThemeFonts = {
            'font_0': 'normal normal normal 40px/1.4em din-next-w01-light {color_14}',
            'font_1': 'normal normal normal 16px/1.4em din-next-w01-light {color_14}',
            'font_2': 'normal normal normal 25px/1.4em din-next-w01-light {color_14}',
            'font_3': 'normal normal normal 60px/1.4em din-next-w01-light {color_14}',
            'font_4': 'normal normal normal 40px/1.4em din-next-w01-light {color_14}',
            'font_5': 'normal normal normal 25px/1.4em din-next-w01-light {color_14}',
            'font_6': 'normal normal normal 22px/1.4em din-next-w01-light {color_14}',
            'font_7': 'normal normal normal 17px/1.4em din-next-w01-light {color_14}',
            'font_8': 'normal normal normal 15px/1.4em din-next-w01-light {color_14}',
            'font_9': 'normal normal normal 14px/1.4em din-next-w01-light {color_14}',
            'font_10': 'normal normal normal 12px/1.4em din-next-w01-light {color_14}',
            'font_11': 'normal normal normal 40px/1.4em din-next-w01-light #9C0A0A'
        };

        // Freeze (make immutable) mocks so we don't need to reinitialize them beforeEach
        Object.freeze(mockedSiteData);
        Object.freeze(fontsMetadataMock);
        Object.freeze(masterPage);
        Object.freeze(THEME_DATA);
        Object.freeze(mockThemeColors);
        Object.freeze(mockThemeFonts);

        var fontUtils = fontUtilsDef(_, fontsMetadataMock, utils, experiment);

        var fontsFromStyles = [
            fontsMetadataMock.amiri,
            fontsMetadataMock.arial
        ];

        describe('fontUtils', function () {

            describe('parseStyleFont', function () {

                it('should return font object for a font class', function () {
                    var expectedResult = {
                        style: 'normal',
                        variant: 'normal',
                        weight: 'normal',
                        size: '40px',
                        lineHeight: '1.4em',
                        family: 'din-next-w01-light',
                        color: '#9C0A0A',
                        fontWithFallbacks: 'din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif',
                        cssColor: '#9C0A0A',
                        bold: false,
                        italic: false
                    };

                    var styleFont = fontUtils.parseStyleFont(
                        'font_11',
                        mockThemeFonts,
                        mockThemeColors
                    );
                    expect(styleFont).toEqual(expectedResult);
                });

                it('should return font object for a font string', function () {
                    var expectedResult = {
                        style: 'normal',
                        variant: 'normal',
                        weight: 'normal',
                        size: '40px',
                        lineHeight: '1.4em',
                        family: 'din-next-w01-light',
                        color: '#9C0A0A',
                        fontWithFallbacks: 'din-next-w01-light,din-next-w02-light,din-next-w10-light,sans-serif',
                        cssColor: '#9C0A0A',
                        bold: false,
                        italic: false
                    };

                    var styleFont = fontUtils.parseStyleFont(
                        'normal normal normal 40px/1.4em din-next-w01-light #9C0A0A',
                        mockThemeFonts,
                        mockThemeColors
                    );
                    expect(expectedResult).toContain(styleFont);
                });

            });

            describe('parseFontStr', function () {

                it('should return an object representation of the given css string', function () {
                    expect(_.isEqual(fontUtils.parseFontStr("normal normal normal 23px/1.4em font_a color_a sans-serif"), {
                        style: 'normal',
                        variant: 'normal',
                        weight: 'normal',
                        size: '23px',
                        lineHeight: '1.4em',
                        family: 'font_a',
                        color: 'color_a',
                        bold: false,
                        italic: false
                    })).toBe(true);
                });

                it('should set bold true/false according to the font weight', function () {
                    var boldStyles = [
                        'normal normal bold 23px/1.4em font_a color_a sans-serif',
                        'normal normal 700 23px/1.4em font_a color_a sans-serif',
                        'normal normal 800 23px/1.4em font_a color_a sans-serif',
                        'normal normal 900 23px/1.4em font_a color_a sans-serif'
                    ];
                    var nonBoldStyles = [
                        'normal normal normal 23px/1.4em font_a color_a sans-serif',
                        'normal normal 100 23px/1.4em font_a color_a sans-serif',
                        'normal normal 200 23px/1.4em font_a color_a sans-serif',
                        'normal normal 300 23px/1.4em font_a color_a sans-serif',
                        'normal normal 400 23px/1.4em font_a color_a sans-serif',
                        'normal normal 500 23px/1.4em font_a color_a sans-serif',
                        'normal normal 600 23px/1.4em font_a color_a sans-serif'
                    ];

                    _.forEach(boldStyles, function (fontStyle) {
                        expect(fontUtils.parseFontStr(fontStyle).bold).toEqual(true);
                    });
                    _.forEach(nonBoldStyles, function (fontStyle) {
                        expect(fontUtils.parseFontStr(fontStyle).bold).toEqual(false);
                    });
                });

                it('should set italic true/false according to the font style', function () {
                    var italicStyle = 'italic normal 100 23px/1.4em font_a color_a sans-serif';
                    var nonItalicStyles = [
                        'normal normal normal 23px/1.4em font_a color_a sans-serif',
                        'oblique normal normal 23px/1.4em font_a color_a sans-serif'
                    ];

                    expect(fontUtils.parseFontStr(italicStyle).italic).toEqual(true);
                    _.forEach(nonItalicStyles, function (fontStyle) {
                        expect(fontUtils.parseFontStr(fontStyle).italic).toEqual(false);
                    });
                });

            });

            it('getFontFamily should parse the given css string and return the font family', function () {
                expect(fontUtils.getFontFamily("normal normal normal 23px/1.4em font_a color_a sans-serif")).toBe('font_a');
            });

            it('getMetadata should return metaData for the given font name', function () {
                expect(_.isEqual(fontUtils.getMetadata(['arial', 'amiri']), [fontsMetadataMock.arial, fontsMetadataMock.amiri])).toBe(true);
            });

            it('getFontFamilyWithFallbacks should the font Family fallbacks', function () {
                expect(fontUtils.getFontFallback('arial')).toEqual('arial-fall-back,arial-fall-back-2,sans-serif');
            });

            it('getFontFamilyWithFallbacks should return empty fallbacks string for unknown font family (font is not in metadata)', function () {
                expect(fontUtils.getFontFallback('unknownFont')).toEqual('');
            });

            it('getPageFontsMetaData should return a list of fonts used on the page (theme and overrides)', function () {
                var fonts = fontUtils.getPageFontsMetaData(mockedSiteData, 'test_page');
                var fromPage = [
                    fontsMetadataMock.lobster,
                    fontsMetadataMock.niconne
                ];
                var expected = _.union(fontsFromStyles, fromPage);

                fonts = _.sortBy(fonts, "fontFamily");
                expected = _.sortBy(expected, "fontFamily");

                expect(fonts).toEqual(expected);
            });

            it('getPageFontsMetaData should return a list of fonts used on the page from THEME_DATA (only by font class)', function () {
                var fonts = fontUtils.getPageFontsMetaData(mockedSiteData, 'test_page2');
                var fromPage = [];
                var expected = _.union(fontsFromStyles, fromPage);

                fonts = _.sortBy(fonts, "fontFamily");
                expected = _.sortBy(expected, "fontFamily");

                expect(fonts).toEqual(expected);
            });

            it('getPageUsedFontsList should return same results when using comma or quotes in the font family', function () {
                var usedFonts = fontUtils.getPageUsedFontsList(mockedSiteData, 'test_page');
                var usedFonts_with_different_commas = fontUtils.getPageUsedFontsList(mockedSiteData, 'test_page_with_different_commas');
                expect(_.isEqual(usedFonts, usedFonts_with_different_commas)).toBeTruthy();
            });

            it('getPageFontsMetaData should return styles from app part plugin', function () {
                var fonts = fontUtils.getPageFontsMetaData(mockedSiteData, 'page_with_app_part');
                var fromPage = [];
                var expected = _.union(fontsFromStyles, fromPage);

                fonts = _.sortBy(fonts, "fontFamily");
                expected = _.sortBy(expected, "fontFamily");

                expect(fonts).toEqual(expected);
            });

            it('getPageFontsMetaData should return styles from app builder plugin', function () {
                var fonts = fontUtils.getPageFontsMetaData(mockedSiteData, 'page_with_app_builder');
                var fromPage = [];
                var expected = _.union(fontsFromStyles, fromPage);

                fonts = _.sortBy(fonts, "fontFamily");
                expected = _.sortBy(expected, "fontFamily");

                expect(fonts).toEqual(expected);
            });

            it("getSiteFontsMetaData shoul not throw an exception if there is no text in the data", function () {
                function shouldNotThrow() {
                    fontUtils.getPageFontsMetaData(mockedSiteData, 'page_with_data_no_text');
                }

                expect(shouldNotThrow).not.toThrow();
            });

            it('getWixStoredFontsCssUrlsWithParams - should return same result as getWixStoredFontsCssUrls', function () {
                expect(fontUtils.getWixStoredFontsCssUrlsWithParams(mockedSiteData.santaBase, masterPage.characterSets))
                    .toEqual(fontUtils.getWixStoredFontsCssUrls(mockedSiteData));
            });

            it('getWixStoredFontsCssUrls - return url with the needed charsets to load ', function () {
                var expectedCharsetUrl = ["//127.0.0.1/static/css/user-site-fonts/latin.css"];
                expect(fontUtils.getWixStoredFontsCssUrls(mockedSiteData)).toEqual(expectedCharsetUrl);
            });

            it('getWixStoredFontsCssUrls - return url with the needed charsets to load without double slashes', function () {
                var mockSiteDataWithExtraSlash = _.clone(mockedSiteData);
                mockSiteDataWithExtraSlash.santaBase += "/";
                var expectedCharsetUrl = ["//127.0.0.1/static/css/user-site-fonts/latin.css"];
                expect(fontUtils.getWixStoredFontsCssUrls(mockSiteDataWithExtraSlash)).toEqual(expectedCharsetUrl);
            });

            it('getCurrentSelectablefonts - returned fonts array based on the charset', function () {
                var latinFonts = _.filter(fontsMetadataMock, function (f) {
                    return _.includes(f.characterSets, "latin");
                });
                var expectedSelectableFonts = [{
                    'lang': 'latin',
                    'fonts': _.sortBy(latinFonts, "fontFamily")
                }];
                var currentSelectablefonts = fontUtils.getCurrentSelectablefonts(mockedSiteData);
                currentSelectablefonts.fonts = _.sortBy(currentSelectablefonts, "fontFamily");

                expect(_.isEqual(currentSelectablefonts, expectedSelectableFonts)).toBeTruthy();
            });

            it('getCurrentSelectablefontsWithParams - should return the same result as getCurrentSelectablefonts', function () {
                var currentSelectableFonts = fontUtils.getCurrentSelectablefonts(mockedSiteData);
                var currentSelectableFontsWithParams = fontUtils.getCurrentSelectablefontsWithParams(mockedSiteData.rendererModel.siteInfo.documentType, masterPage.characterSets);

                expect(_.isEqual(currentSelectableFontsWithParams, currentSelectableFonts)).toBeTruthy();
            });

            it('getFontsUrl - returned google font url with all the google fonts we need to load, for array and object inputs', function () {
                var expectedUrl = "//fonts.googleapis.com/css?family=Niconne:n,b,i,bi|Lobster:n,b,i,bi|&subset=latin";
                var fontNameObj = {"niconne": 1, "lobster": 1};
                expect(fontUtils.getFontsUrl(fontNameObj, mockedSiteData)).toEqual(expectedUrl);
                var fontNameArray = ["niconne", "lobster"];
                expect(fontUtils.getFontsUrl(fontNameArray, mockedSiteData)).toEqual(expectedUrl);
            });

            it('getFontsUrlWithParams - should return same result as getFontsUrl', function () {
                var fontNameObj = {"niconne": 1, "lobster": 1};
                expect(fontUtils.getFontsUrlWithParams(fontNameObj, mockedSiteData.rendererModel.siteInfo.documentType, masterPage.characterSets))
                    .toEqual(fontUtils.getFontsUrl(fontNameObj, mockedSiteData));

                var fontNameArray = ["niconne", "lobster"];
                expect(fontUtils.getFontsUrlWithParams(fontNameArray, mockedSiteData.rendererModel.siteInfo.documentType, masterPage.characterSets))
                    .toEqual(fontUtils.getFontsUrl(fontNameArray, mockedSiteData));
            });

            it('getFontsUrlWithParams - should return empty string for font without cdn', function () {
                var fontNameArray = ["din-next-w01-light"];
                expect(fontUtils.getFontsUrlWithParams(fontNameArray, mockedSiteData.rendererModel.siteInfo.documentType, masterPage.characterSets))
                    .toEqual("");
            });

            it('getFontClassName - element with font class', function () {
                var text = '<span class="font_12">dslkhljkhds</span>';
                expect(fontUtils.getFontClassName(text)).toEqual("font_12");
            });

            it('getFontClassName - element without font class', function () {
                var text = '<span>dslkhljkhds</span>';
                expect(fontUtils.getFontClassName(text)).toBeUndefined();
            });

            it('getCssUrls', function () {
                var expected = {
                    googleFonts: '//fonts.googleapis.com/css?family=amiri+2+cdn:n,b,i,bi|Lobster:n,b,i,bi|Niconne:n,b,i,bi|&subset=latin-ext,cyrillic,japanese,korean,arabic,hebrew,latin',
                    "latin-ext": 'http://127.0.0.1/services/santa-resources/resources/viewer/user-site-fonts/v3/latin-ext.css',
                    cyrillic: 'http://127.0.0.1/services/santa-resources/resources/viewer/user-site-fonts/v3/cyrillic.css',
                    japanese: 'http://127.0.0.1/services/santa-resources/resources/viewer/user-site-fonts/v3/japanese.css',
                    korean: 'http://127.0.0.1/services/santa-resources/resources/viewer/user-site-fonts/v3/korean.css',
                    arabic: 'http://127.0.0.1/services/santa-resources/resources/viewer/user-site-fonts/v3/arabic.css',
                    hebrew: 'http://127.0.0.1/services/santa-resources/resources/viewer/user-site-fonts/v3/hebrew.css',
                    latin: 'http://127.0.0.1/services/santa-resources/resources/viewer/user-site-fonts/v3/latin.css'
                };
                var result = fontUtils.getCssUrls(mockedSiteData.rendererModel.siteInfo.documentType, mockedSiteData.serviceTopology);
                expect(result).toEqual(expected);
            });
        });

    });
})
;
