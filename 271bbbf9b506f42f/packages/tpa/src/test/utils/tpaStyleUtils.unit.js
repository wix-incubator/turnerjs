define(['tpa/utils/tpaStyleUtils', 'fonts', 'testUtils'], function (tpaStyleUtils, fonts, testUtils) {
    'use strict';

    describe('tpa style', function () {
        beforeEach(function() {
            testUtils.experimentHelper.closeExperiments(['sv_fontsRefactorExp']);
        });
        var mockedAllSystemFonts = ["normal normal normal 45px/1.4em Open+Sans {color_14}", "normal normal normal 13px/1.4em Arial {color_11}", "normal normal normal 24px/1.4em Open+Sans {color_14}", "normal normal normal 60px/1.4em Open+Sans {color_14}", "normal normal normal 30px/1.4em Open+Sans {color_14}", "normal normal normal 22px/1.4em Open+Sans {color_14}", "normal normal normal 19px/1.4em Open+Sans {color_14}", "normal normal normal 15px/1.4em Arial {color_15}", "normal normal normal 14px/1.4em Arial {color_15}", "normal normal normal 12px/1.4em Arial {color_15}", "normal normal normal 10px/1.4em Arial {color_15}", "normal normal normal 40px/1.4em wfont_b2d7df_3958b19224b447a5818e420a5b538054,wf_3958b19224b447a5818e420a5,orig_alexbrush-regular {color_14}"];
        var mockedAllSystemColors = ["#ffffff", "#FFFFFF", "#000000", "237,28,36,1", "0,136,203,1", "255,203,5,1", "114,114,114,1", "176,176,176,1", "255,255,255,1", "114,114,114,1", "176,176,176,1", "#FFFFFF", "#F3F3F3", "170,168,168,1", "#717070", "#4A4A4A", "#AADDFF", "#7FCCFF", "#0099FF", "#0065A9", "#003254", "#FFEEAA", "#FFE57F", "#FFCC00", "#A98700", "#544300", "#C4E7B6", "#A0CF8E", "#64B743", "#437A2D", "#213D16", "#E0A1E0", "#C170C1", "#A31AA3", "#6C116C", "#360836"];
        var mockedSiteData = {
            getAllTheme: function () {
                return {
                    "THEME_DATA": {
                        "font": ["normal normal normal 45px/1.4em Open+Sans {color_14}", "normal normal normal 13px/1.4em Arial {color_11}", "normal normal normal 24px/1.4em Open+Sans {color_14}", "normal normal normal 60px/1.4em Open+Sans {color_14}", "normal normal normal 30px/1.4em Open+Sans {color_14}", "normal normal normal 22px/1.4em Open+Sans {color_14}", "normal normal normal 19px/1.4em Open+Sans {color_14}", "normal normal normal 15px/1.4em Arial {color_15}", "normal normal normal 14px/1.4em Arial {color_15}", "normal normal normal 12px/1.4em Arial {color_15}", "normal normal normal 10px/1.4em Arial {color_15}"],
                        "color": mockedAllSystemColors
                    },
                    "mockStyleId1": {
                        "style": {
                            "properties": {
                                "param_color_background": "color_31",
                                "param_color_header": "color_20",
                                "param_font_bodyFont": "{\"size\":15,\"style\":{\"bold\":false,\"italic\":false,\"underline\":false},\"family\":\"arial\",\"cssFontFamily\":\"arial,\",\"preset\":\"Body-L\",\"fontStyleParam\":true}",
                                "param_font_headerFont": "{\"size\":26,\"style\":{\"bold\":false,\"italic\":false,\"underline\":false},\"family\":\"kelly slab\",\"preset\":\"Custom\",\"fontStyleParam\":true}",
                                "param_boolean_my_key": false
                            }
                        }
                    },
                    "mockStyleNewUILibId": {
                        "style": {
                            "properties": {
                                "param_font_bodyFontFromNewUILIB": "{\"size\":40,\"style\":{\"bold\":false,\"italic\":false,\"underline\":false},\"family\":\"arial\",\"cssFontFamily\":\"arial,\",\"preset\":\"normal normal normal 45px/1.4em Open+Sans {color_14}\",\"fontStyleParam\":true,\"theme\":true,\"fontStyleParam\":true}"
                            }
                        }
                    },
                    "mockStyleNewUILibIdCustom": {
                        "style": {
                            "properties": {
                                "param_font_headerFontFromNewUILIB": "{\"size\":26,\"style\":{\"bold\":false,\"italic\":false,\"underline\":false},\"family\":\"kelly slab\",\"preset\":\"Custom\",\"fontStyleParam\":true}"
                            }
                        }
                    },
                    "mockStyleFontParamaNewUILib": {
                        "style": {
                            "properties": {
                                "param_font_headerFontFromNewUILIB": "{\"style\":{\"bold\":false,\"italic\":true,\"underline\":true},\"family\":\"kelly slab\",\"preset\":\"None\",\"fontParam\":true}",
                                param_font_design_buttonFamilyFont: "{\"style\":{\"italic\":false,\"bold\":false,\"underline\":false},\"family\":\"wfont_b2d7df_180c9d23c1f94787b62f72d113389c4b,wf_180c9d23c1f94787b62f72d11,orig_2dumb\",\"preset\":\"None\",\"fontParam\":true,\"displayName\":\"2 Dumb\"}"
                            }
                        }
                    }
                };
            },
            getDataByQuery: function () {
                return {
                    "characterSets": ["latin"]
                };
            },
            rendererModel: {
                siteInfo: {
                    documentType: "UGC"
                }
            },
            santaBase: 'localhost',
            serviceTopology: {
                mediaRootUrl: "https://static.wixstatic.com/"
            }
        };
        var mockedSiteData2 = {
            getAllTheme: function () {
                return {
                    "THEME_DATA": {
                        "font": ["normal normal normal 45px/1.4em Open+Sans {color_14}", "normal normal normal 13px/1.4em Arial {color_11}", "normal normal normal 24px/1.4em Open+Sans {color_14}", "normal normal normal 60px/1.4em Open+Sans {color_14}", "normal normal normal 30px/1.4em Open+Sans {color_14}", "normal normal normal 22px/1.4em Open+Sans {color_14}", "normal normal normal 19px/1.4em Open+Sans {color_14}", "normal normal normal 15px/1.4em Arial {color_15}", "normal normal normal 14px/1.4em Arial {color_15}", "normal normal normal 12px/1.4em Arial {color_15}", "normal normal normal 10px/1.4em Arial {color_15}"],
                        "color": mockedAllSystemColors
                    },
                    "mockStyleId2": {
                        "style": {
                            "properties": {
                                "param_color_textColor": "color_15",
                                "param_color_titleColor": "color_3",
                                "param_font_descriptionFont": "{\"value\":\"reklamescriptw00-medium\",\"index\":54,\"fontParam\":true,\"cssFontFamily\":\"''reklamescriptw00-medium'',''cursive''\"}",
                                "param_font_titleFont": "{\"value\":\"americantypwrteritcw01--731025\",\"index\":1,\"fontParam\":true,\"cssFontFamily\":\"'americantypwrteritcw01--731025','americantypwrteritcw02--737091','serif'\"}"}
                        }
                    }
                };
            },
            getDataByQuery: function (query) {
                if (query === "masterPage") {
                    return {"type": "Document", "id": "masterPage", "metaData": {"isPreset": false, "schemaVersion": "1.0", "isHidden": false}, "siteName": "Template Base", "mainPage": "#mainPage", "renderModifiers": {"pageAutoShrink": true}, "characterSets": ["latin"], "usedFonts": ["arial"]};
                }
            },
            rendererModel: {
                siteInfo: {
                    documentType: "UGC"
                }
            },
            serviceTopology:{
                mediaRootUrl: "https://static.wixstatic.com/"
            }

        };
        var mockedComp2 = {
            props: {
                structure: {
                    styleId: "mockStyleId2"
                }
            }
        };
        var mockedComp = {
            props: {
                structure: {
                    styleId: "mockStyleId1"
                }
            }
        };
        describe('TPA Style Utils', function () {
            describe('getTextPresets', function () {
                it('should return object with all systemFont and there data - based on mockedAllSystemFonts', function () {
                    var expectedReturnObj = {
                        "Title": {
                            "editorKey": "font_0",
                            "lineHeight": "1.4em",
                            "style": "normal",
                            "weight": "normal",
                            "size": "45px",
                            "fontFamily": "open sans",
                            "value": "font:normal normal normal 45px/1.4em \"open sans\",sans-serif;"
                        },
                        "Menu": {
                            "editorKey": "font_1",
                            "lineHeight": "1.4em",
                            "style": "normal",
                            "weight": "normal",
                            "size": "13px",
                            "fontFamily": "arial",
                            "value": "font:normal normal normal 13px/1.4em arial,\"ｍｓ ｐゴシック\",\"ms pgothic\",\"돋움\",dotum,helvetica,sans-serif;"
                        },
                        "Page-title": {
                            "editorKey": "font_2",
                            "lineHeight": "1.4em",
                            "style": "normal",
                            "weight": "normal",
                            "size": "24px",
                            "fontFamily": "open sans",
                            "value": "font:normal normal normal 24px/1.4em \"open sans\",sans-serif;"
                        },
                        "Heading-XL": {
                            "editorKey": "font_3",
                            "lineHeight": "1.4em",
                            "style": "normal",
                            "weight": "normal",
                            "size": "60px",
                            "fontFamily": "open sans",
                            "value": "font:normal normal normal 60px/1.4em \"open sans\",sans-serif;"
                        },
                        "Heading-L": {
                            "editorKey": "font_4",
                            "lineHeight": "1.4em",
                            "style": "normal",
                            "weight": "normal",
                            "size": "30px",
                            "fontFamily": "open sans",
                            "value": "font:normal normal normal 30px/1.4em \"open sans\",sans-serif;"
                        },
                        "Heading-M": {
                            "editorKey": "font_5",
                            "lineHeight": "1.4em",
                            "style": "normal",
                            "weight": "normal",
                            "size": "22px",
                            "fontFamily": "open sans",
                            "value": "font:normal normal normal 22px/1.4em \"open sans\",sans-serif;"
                        },
                        "Heading-S": {
                            "editorKey": "font_6",
                            "lineHeight": "1.4em",
                            "style": "normal",
                            "weight": "normal",
                            "size": "19px",
                            "fontFamily": "open sans",
                            "value": "font:normal normal normal 19px/1.4em \"open sans\",sans-serif;"
                        },
                        "Body-L": {
                            "editorKey": "font_7",
                            "lineHeight": "1.4em",
                            "style": "normal",
                            "weight": "normal",
                            "size": "15px",
                            "fontFamily": "arial",
                            "value": "font:normal normal normal 15px/1.4em arial,\"ｍｓ ｐゴシック\",\"ms pgothic\",\"돋움\",dotum,helvetica,sans-serif;"
                        },
                        "Body-M": {
                            "editorKey": "font_8",
                            "lineHeight": "1.4em",
                            "style": "normal",
                            "weight": "normal",
                            "size": "14px",
                            "fontFamily": "arial",
                            "value": "font:normal normal normal 14px/1.4em arial,\"ｍｓ ｐゴシック\",\"ms pgothic\",\"돋움\",dotum,helvetica,sans-serif;"
                        },
                        "Body-S": {
                            "editorKey": "font_9",
                            "lineHeight": "1.4em",
                            "style": "normal",
                            "weight": "normal",
                            "size": "12px",
                            "fontFamily": "arial",
                            "value": "font:normal normal normal 12px/1.4em arial,\"ｍｓ ｐゴシック\",\"ms pgothic\",\"돋움\",dotum,helvetica,sans-serif;"
                        },
                        "Body-XS": {
                            "editorKey": "font_10",
                            "lineHeight": "1.4em",
                            "style": "normal",
                            "weight": "normal",
                            "size": "10px",
                            "fontFamily": "arial",
                            "value": "font:normal normal normal 10px/1.4em arial,\"ｍｓ ｐゴシック\",\"ms pgothic\",\"돋움\",dotum,helvetica,sans-serif;"
                        }
                    };
                    var textPresets = tpaStyleUtils.getTextPresets(mockedAllSystemFonts);
                    expect(textPresets).toEqual(expectedReturnObj);
                });
            });
            describe('getSiteColors', function () {
                it('should return object with all site Colors and there data', function () {
                    var expectedSiteColors = [
                        {"name": "color_1", "value": "#FFFFFF"},
                        {"name": "color_2", "value": "#000000"},
                        {"name": "color_3", "value": "#ED1C24"},
                        {"name": "color_4", "value": "#0088CB"},
                        {"name": "color_5", "value": "#FFCB05"},
                        {"name": "color_11", "value": "#FFFFFF"},
                        {"name": "color_12", "value": "#F3F3F3"},
                        {"name": "color_13", "value": "#AAA8A8"},
                        {"name": "color_14", "value": "#717070"},
                        {"name": "color_15", "value": "#4A4A4A"},
                        {"name": "color_16", "value": "#AADDFF"},
                        {"name": "color_17", "value": "#7FCCFF"},
                        {"name": "color_18", "value": "#0099FF"},
                        {"name": "color_19", "value": "#0065A9"},
                        {"name": "color_20", "value": "#003254"},
                        {"name": "color_21", "value": "#FFEEAA"},
                        {"name": "color_22", "value": "#FFE57F"},
                        {"name": "color_23", "value": "#FFCC00"},
                        {"name": "color_24", "value": "#A98700"},
                        {"name": "color_25", "value": "#544300"},
                        {"name": "color_26", "value": "#C4E7B6"},
                        {"name": "color_27", "value": "#A0CF8E"},
                        {"name": "color_28", "value": "#64B743"},
                        {"name": "color_29", "value": "#437A2D"},
                        {"name": "color_30", "value": "#213D16"},
                        {"name": "color_31", "value": "#E0A1E0"},
                        {"name": "color_32", "value": "#C170C1"},
                        {"name": "color_33", "value": "#A31AA3"},
                        {"name": "color_34", "value": "#6C116C"},
                        {"name": "color_35", "value": "#360836"}
                    ];
                    var siteColors = tpaStyleUtils.getSiteColors(mockedAllSystemColors);
                    expect(siteColors).toEqual(expectedSiteColors);
                });
            });

            describe('getStylesForSDK', function () {
                it('should return object with all comp Style and manipulated data - styled fonts (regular+custom)', function () {
                    var expectedStyles = {
                        "colors": {
                            "background": {"themeName": "color_31", "value": "#E0A1E0"},
                            "header": {"themeName": "color_20", "value": "#003254"}
                        },
                        "numbers": {},
                        "booleans": {
                            "my_key": false
                        },
                        "fonts": {
                            "bodyFont": {
                                "size": 15,
                                "style": {"bold": false, "italic": false, "underline": false},
                                "family": "arial",
                                "cssFontFamily": "arial,",
                                "preset": "Body-L",
                                "fontStyleParam": true,
                                "value": "font:normal normal normal 15px/1.4em arial,\"ｍｓ ｐゴシック\",\"ms pgothic\",\"돋움\",dotum,helvetica,sans-serif;"
                            },
                            "headerFont": {
                                "size": 26,
                                "style": {"bold": false, "italic": false, "underline": false},
                                "family": "kelly slab",
                                "preset": "Custom",
                                "fontStyleParam": true,
                                "value": "font:normal normal normal 26px/32px \"kelly slab\",fantasy;"
                            }
                        },
                        "googleFontsCssUrl": "//fonts.googleapis.com/css?family=Kelly+Slab:n,b,i,bi|&subset=latin",
                        "uploadFontFaces": ""

                    };

                    var styleSDK = tpaStyleUtils.getStylesForSDK(mockedSiteData, mockedComp.props.structure.styleId);
                    expect(styleSDK).toEqual(expectedStyles);
                });
                it('should return object with all comp Style and manipulated data - fontParam)', function () {
                    var expectedStyles = {
                        "colors": {
                            "textColor": {"themeName": "color_15", "value": "#4A4A4A"},
                            "titleColor": {"themeName": "color_3", "value": "#ED1C24"}
                        },
                        "numbers": {},
                        "booleans": {},
                        "fonts": {
                            "descriptionFont": {"value": "font-family:'reklamescriptw00-medium','cursive';", "index": 54, "fontParam": true, "cssFontFamily": "''reklamescriptw00-medium'',''cursive''", "family": "reklamescriptw00-medium", "size": 0, "style": {"bold": false, "italic": false, "underline": false}},
                            "titleFont": {"value": "font-family:'americantypwrteritcw01--731025','americantypwrteritcw02--737091','serif';", "index": 1, "fontParam": true, "cssFontFamily": "'americantypwrteritcw01--731025','americantypwrteritcw02--737091','serif'", "family": "americantypwrteritcw01--731025", "size": 0, "style": {"bold": false, "italic": false, "underline": false}}
                        },
                        "googleFontsCssUrl": "",
                        "uploadFontFaces": ""
                    };
                    var styleSDK = tpaStyleUtils.getStylesForSDK(mockedSiteData2, mockedComp2.props.structure.styleId);
                    expect(styleSDK).toEqual(expectedStyles);
                });
                it('should return object with all comp Style and manipulated data even when a property in styles in undefined', function () {
                    var mockedSiteDataBad = {
                        getAllTheme: function () {
                            return {
                                "THEME_DATA": {
                                    "font": ["normal normal normal 45px/1.4em Open+Sans {color_14}", "normal normal normal 13px/1.4em Arial {color_11}", "normal normal normal 24px/1.4em Open+Sans {color_14}", "normal normal normal 60px/1.4em Open+Sans {color_14}", "normal normal normal 30px/1.4em Open+Sans {color_14}", "normal normal normal 22px/1.4em Open+Sans {color_14}", "normal normal normal 19px/1.4em Open+Sans {color_14}", "normal normal normal 15px/1.4em Arial {color_15}", "normal normal normal 14px/1.4em Arial {color_15}", "normal normal normal 12px/1.4em Arial {color_15}", "normal normal normal 10px/1.4em Arial {color_15}"],
                                    "color": mockedAllSystemColors
                                },
                                "mockStyleId1": {
                                    "style": {
                                        "properties": {
                                            "param_color_background": undefined,
                                            "param_color_header": "color_20",
                                            "param_font_bodyFont": "{\"size\":15,\"style\":{\"bold\":false,\"italic\":false,\"underline\":false},\"family\":\"arial\",\"cssFontFamily\":\"arial,\",\"preset\":\"Body-L\",\"fontStyleParam\":true}",
                                            "param_font_headerFont": "{\"size\":26,\"style\":{\"bold\":false,\"italic\":false,\"underline\":false},\"family\":\"kelly slab\",\"preset\":\"Custom\",\"fontStyleParam\":true}"
                                        }
                                    }
                                }
                            };
                        },
                        getDataByQuery: function () {
                            return {
                                "characterSets": ["latin"]
                            };
                        },
                        rendererModel: {
                            siteInfo: {
                                documentType: "UGC"
                            }
                        },
                        serviceTopology:{
                            mediaRootUrl: "https://static.wixstatic.com/"
                        }

                    };
                    var expectedStyles = {
                        "colors": {
                            "background": {"value": undefined, "themeName": undefined},
                            "header": {"themeName": "color_20", "value": "#003254"}
                        },
                        "numbers": {},
                        "booleans": {},
                        "fonts": {
                            "bodyFont": {
                                "size": 15,
                                "style": {"bold": false, "italic": false, "underline": false},
                                "family": "arial",
                                "cssFontFamily": "arial,",
                                "preset": "Body-L",
                                "fontStyleParam": true,
                                "value": "font:normal normal normal 15px/1.4em arial,\"ｍｓ ｐゴシック\",\"ms pgothic\",\"돋움\",dotum,helvetica,sans-serif;"
                            },
                            "headerFont": {
                                "size": 26,
                                "style": {"bold": false, "italic": false, "underline": false},
                                "family": "kelly slab",
                                "preset": "Custom",
                                "fontStyleParam": true,
                                "value": "font:normal normal normal 26px/32px \"kelly slab\",fantasy;"
                            }
                        },
                        "googleFontsCssUrl": "//fonts.googleapis.com/css?family=Kelly+Slab:n,b,i,bi|&subset=latin",
                        "uploadFontFaces": ""
                    };
                    var styleSDK = tpaStyleUtils.getStylesForSDK(mockedSiteDataBad, mockedComp.props.structure.styleId);
                    expect(styleSDK).toEqual(expectedStyles);
                });
            });

            describe('getStyleDataToPassIntoApp', function() {
                var mockSiteAPI;
                var fontsMock = [{
                    fonts: [{
                        fontFamily: "amatic sc",
                        permissions: "all"
                    }, {
                        fontFamily: "americantypwrteritcw01--731025",
                        permissions: "all"
                    }, {
                        fontFamily: "anton",
                        permissions: "all"
                    }]
                }];
                beforeEach(function() {
                    mockSiteAPI = {
                        getSiteData: function() {return mockedSiteData;}
                    };

                    spyOn(fonts.fontUtils, 'getCurrentSelectablefonts').and.returnValue(fontsMock);
                    spyOn(fonts.fontUtils, 'getWixStoredFontsCssUrls').and.returnValue({});
                });

                it('should return all fonts meta', function() {
                    var style = tpaStyleUtils.getStyleDataToPassIntoApp(mockSiteAPI, null);
                    expect(style.fonts.fontsMeta).toEqual(fontsMock);
                });

                it('should return fonts meta filtering legacy fonts', function() {
                    var fontsMock2 = [{
                        fonts: [{
                            fontFamily: "amatic sc",
                            permissions: "all"
                        }, {
                            fontFamily: "signika",
                            permissions: "legacy"
                        }, {
                            fontFamily: "americantypwrteritcw01--731025",
                            permissions: "all"
                        }, {
                            fontFamily: "anton",
                            permissions: "all"
                        }, {
                            fontFamily: "nimbus-sans-tw01con",
                            permissions: "legacy"
                        }
                        ]
                    }];

                    fonts.fontUtils.getCurrentSelectablefonts.and.returnValue(fontsMock2);

                    var style = tpaStyleUtils.getStyleDataToPassIntoApp(mockSiteAPI, null);
                    expect(style.fonts.fontsMeta).toEqual(fontsMock);
                });

                it('should add editor helvetica fonts when specified', function(){
                    mockedSiteData.serviceTopology = {
                        publicStaticsUrl: "http://static.parastorage.com/services/wix-public/1.179.0/",
                        mediaRootUrl: "https://static.wixstatic.com/"
                    };
                    fonts.fontUtils.getWixStoredFontsCssUrls.and.returnValue([]);

                    var addWixHelveticaFonts = true;
                    var style = tpaStyleUtils.getStyleDataToPassIntoApp(mockSiteAPI, null, addWixHelveticaFonts);

                    expect(style.fonts.cssUrls).toContain("http://static.parastorage.com/services/wix-public/1.179.0//css/Helvetica/fontFace.css");
                });
            });
        });

        describe('New UI-lib style utils', function () {
            var mockedCompNewUILib = {
                props: {
                    structure: {
                        styleId: "mockStyleNewUILibId"
                    }
                }
            };

            var mockedCompNewUILibCustom = {
                props: {
                    structure: {
                        styleId: "mockStyleNewUILibIdCustom"
                    }
                }
            };


            describe('getStylesForSDK', function () {
                it('should return fonts value when theme is chosen', function () {
                    var expectedStyles = {
                        "colors": {},
                        "numbers": {},
                        "booleans": {},
                        "fonts": {
                            "bodyFontFromNewUILIB": {
                                "size": 45,
                                "style": {"bold": false, "italic": false, "underline": false},
                                "family": "open sans",
                                "cssFontFamily": "arial,",
                                "preset": "normal normal normal 45px/1.4em Open+Sans {color_14}",
                                "fontStyleParam": true,
                                "theme":true,
                                "value": "font:normal normal normal 45px/1.4em arial,\"ｍｓ ｐゴシック\",\"ms pgothic\",\"돋움\",dotum,helvetica,sans-serif;"
                            }
                        },
                        "googleFontsCssUrl": "",
                        "uploadFontFaces": ""

                    };

                    var styleSDK = tpaStyleUtils.getStylesForSDK(mockedSiteData, mockedCompNewUILib.props.structure.styleId);
                    expect(styleSDK).toEqual(expectedStyles);
                });

                it('should return fonts value when custom font is chosen', function () {
                    var expectedStyles = {
                        "colors": {},
                        "numbers": {},
                        "booleans": {},
                        "fonts": {
                            "headerFontFromNewUILIB": {
                                "size": 26,
                                "style": {"bold": false, "italic": false, "underline": false},
                                "family": "kelly slab",
                                "preset": "Custom",
                                "fontStyleParam": true,
                                "value": "font:normal normal normal 26px/32px \"kelly slab\",fantasy;"
                            }
                        },
                        "googleFontsCssUrl": "//fonts.googleapis.com/css?family=Kelly+Slab:n,b,i,bi|&subset=latin",
                        "uploadFontFaces": ""
                    };

                    var styleSDK = tpaStyleUtils.getStylesForSDK(mockedSiteData, mockedCompNewUILibCustom.props.structure.styleId);
                    expect(styleSDK).toEqual(expectedStyles);
                });

                it('should return uploaded fonts when there are and experiment is opened', function() {

                    var mockStyleFontParamaNewUILib = {
                        props: {
                            structure: {
                                styleId: "mockStyleFontParamaNewUILib"
                            }
                        }
                    };

                    var expectedStyles = {
                        "colors": {},
                        "numbers": {},
                        "booleans": {},
                        "fonts": {
                            "headerFontFromNewUILIB": {
                                "style": {"bold": false, "italic": true, "underline": true},
                                "family": "kelly slab",
                                "preset": "None",
                                "fontParam": true,
                                "value": 'font-family:\"kelly slab\",fantasy;font-style:italic;font-weight:normal;text-decoration:underline;'
                            },
                            "design_buttonFamilyFont": {
                                "style": {"italic": false, "bold": false, "underline": false},
                                "family": "wfont_b2d7df_180c9d23c1f94787b62f72d113389c4b,wf_180c9d23c1f94787b62f72d11,orig_2dumb",
                                "preset": "None",
                                "fontParam": true,
                                "displayName": "2 Dumb",
                                "value": "font-family:wfont_b2d7df_180c9d23c1f94787b62f72d113389c4b,wf_180c9d23c1f94787b62f72d11,orig_2dumb;font-style:normal;font-weight:normal;"
                            }
                        },
                        "googleFontsCssUrl": "//fonts.googleapis.com/css?family=Kelly+Slab:n,b,i,bi|&subset=latin",
                        "uploadFontFaces": "@font-face {\nfont-family: wf_180c9d23c1f94787b62f72d11;\nsrc: url(\"https://static.wixstatic.com/ufonts/b2d7df_180c9d23c1f94787b62f72d113389c4b/woff/file.woff\") format(\"woff\"),\nurl(\"https://static.wixstatic.com/ufonts/b2d7df_180c9d23c1f94787b62f72d113389c4b/woff2/file.woff2\") format(\"woff2\"),\nurl(\"https://static.wixstatic.com/ufonts/b2d7df_180c9d23c1f94787b62f72d113389c4b/ttf/file.ttf\") format(\"ttf\");\n}\n"
                    };

                    var styleSDK = tpaStyleUtils.getStylesForSDK(mockedSiteData, mockStyleFontParamaNewUILib.props.structure.styleId);
                    expect(styleSDK).toEqual(expectedStyles);


                });
            });
        });

        describe('getValueForWixParams', function() {
            it('should return object with all comp Style and manipulated data - styled fonts (regular+custom)', function (done) {
                var styleData = {
                    "alpha-param_color_gallery_quickViewBackground": "0.7",
                    "param_color_gallery_quickViewBackground": "color_11",
                    "param_color_textColor": "color_15",
                    "param_color_gallery_titleTextColor": '#727272',
                    "param_boolean_gallery_showDividers": "true",
                    "param_boolean_gallery_showPrice": "false",
                    "param_font_descriptionFont":  "{\"size\":17,\"style\":{\"bold\":false,\"italic\":false,\"underline\":false},\"family\":\"raleway\",\"cssFontFamily\":\"'raleway','sans-serif'\",\"preset\":\"Body-M\",\"fontStyleParam\":true}",
                    "param_number_galleryImageRatio": "2",
                    "param_font_quickView_buttonborderSize": "{\"value\":\"1px\",\"fontStyleParam\":false}"
                };

                var expectedCssStyles = {
                    "style.gallery_quickViewBackground": "rgba(255,255,255,0.7)",
                    "style.textColor": "#4A4A4A",
                    "style.gallery_titleTextColor": '#727272',
                    "style.gallery_showDividers": true,
                    "style.gallery_showPrice": false,
                    "style.descriptionFont": "font:normal normal normal 14px/1.4em arial,\"ｍｓ ｐゴシック\",\"ms pgothic\",\"돋움\",dotum,helvetica,sans-serif;",
                    "style.galleryImageRatio": 2,
                    "style.quickView_buttonborderSize": "1px"
                };

                tpaStyleUtils.getValueForWixParams(mockedSiteData.getAllTheme().THEME_DATA, styleData, function(result) {
                    expect(expectedCssStyles).toEqual(result);
                    done();
                });
            });

            it('should return object with all comp Style and manipulated data even when a property in styles in undefined', function (done) {
                var styleData = {
                    "param_color_background": undefined,
                    "param_color_header": "color_20",
                    "param_font_bodyFont": "{\"size\":15,\"style\":{\"bold\":false,\"italic\":false,\"underline\":false},\"family\":\"arial\",\"cssFontFamily\":\"arial,\",\"preset\":\"Body-L\",\"fontStyleParam\":true}",
                    "param_font_headerFont": "{\"size\":26,\"style\":{\"bold\":false,\"italic\":false,\"underline\":false},\"family\":\"kelly slab\",\"preset\":\"Custom\",\"fontStyleParam\":true}"
                };

                var expectedCssStyles = {
                    "style.background": undefined,
                    "style.header": "#003254",
                    "style.bodyFont": "font:normal normal normal 15px/1.4em arial,\"ｍｓ ｐゴシック\",\"ms pgothic\",\"돋움\",dotum,helvetica,sans-serif;",
                    "style.headerFont": "font:normal normal normal 26px/32px \"kelly slab\",fantasy;"
                };

                tpaStyleUtils.getValueForWixParams(mockedSiteData.getAllTheme().THEME_DATA, styleData, function(result) {
                    expect(expectedCssStyles).toEqual(result);
                    done();
                });
            });

        });
    });
});
