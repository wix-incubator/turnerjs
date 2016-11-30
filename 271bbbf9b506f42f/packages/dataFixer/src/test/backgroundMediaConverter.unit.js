define(['lodash', 'dataFixer/plugins/backgroundMediaConverter'], function(_, backgroundMediaConverter) {
    'use strict';

    describe('backgroundMediaConverter', function() {

        var exec = backgroundMediaConverter.exec;
        var masterPageThemeBg, masterPageBGPP, data, pages, backgrounds;

        describe('fix MasterPage with theme background (without background per page)', function(){
            beforeEach(function() {
                masterPageThemeBg = _.cloneDeep(_siteAsJsonThemeBg.masterPage);
                exec(masterPageThemeBg);

                data = masterPageThemeBg.data.document_data;
                pages = _.filter(data, {type: 'Page'});
                backgrounds = _.filter(data, {type: 'BackgroundMedia'});
            });

            it("should create 2 background items for each page", function() {
                expect(pages.length).toEqual(backgrounds.length / 2);
            });

            it("should assign each page with 2 backgrounds, one for mobile one for desktop", function() {
                var bgIds = _.map(backgrounds, 'id');
                expect(_.uniq(bgIds).length).toEqual(bgIds.length);

                _.forEach(pages, function(page){
                    var desktopBgId = page.pageBackgrounds.desktop.ref.replace('#', '');
                    var mobileBgId = page.pageBackgrounds.mobile.ref.replace('#', '');

                    expect(bgIds).toContain(desktopBgId);
                    expect(bgIds).toContain(mobileBgId);
                });
            });

            it("should contain metaData object", function() {
                _.forEach(backgrounds, function(background){
                    expect(background.metaData).toEqual(jasmine.objectContaining({
                        isPreset: false,
                        schemaVersion: '2.0',
                        isHidden: false
                    }));
                });
            });

            it("should create backgrounds by the right schema", function() {
                var testBg = backgrounds[0];
                var testImage = data[backgrounds[0].mediaRef.replace('#', '')];

                expect(testBg.alignType).toBeOfType('string');
                expect(testBg.color).toBeOfType('string');
                expect(testBg.fittingType).toBeOfType('string');
                expect(testBg.id).toBeOfType('string');
                expect(testBg.mediaRef).toBeOfType('string');
                expect(testBg.scrollType).toBeOfType('string');
                expect(testBg.type).toBe('BackgroundMedia');

                expect(testImage.type).toBe('Image');
                expect(testImage.uri).toBeOfType('string');
                expect(testImage.width).toBeOfType('number');
                expect(testImage.height).toBeOfType('number');
            });
        });

        describe('fix Page with theme background (without background per page)', function(){
            it('should do nothing', function() {
                var pageThemeBg = _.cloneDeep(_siteAsJsonThemeBg.pages);
                _.forEach(pageThemeBg, function(page){
                    exec(page);
                    expect(page.pageBackgrounds).toBeUndefined();
                });
            });
        });

        describe('fix MasterPage with background per page', function() {
            beforeEach(function() {
                masterPageBGPP = _.cloneDeep(_siteAsJsonMockBGPP.masterPage);
                exec(masterPageBGPP);

                data = masterPageBGPP.data.document_data;
                pages = _.filter(data, {type: 'Page'});
                backgrounds = _.filter(data, {type: 'BackgroundMedia'});
            });

            it("should convert 2 BackgroundImage items (use mock)", function() {
                var countBgImage = _.filter(_siteAsJsonMockBGPP.masterPage.data.document_data, {type: 'BackgroundImage'}).length;
                var countBgMedia = _.filter(data, {type: 'BackgroundMedia'}).length;
                var countBgMediaImage = _.filter(data, {type: 'Image'}).length;
                expect(countBgImage).toEqual(countBgMedia);
                expect(countBgImage).toEqual(countBgMediaImage);
            });

            it("should create backgrounds by the right schema", function() {
                var testBg = backgrounds[0];
                var testImage = data[backgrounds[0].mediaRef.replace('#', '')];

                expect(testBg.alignType).toBeOfType('string');
                expect(testBg.color).toBeOfType('string');
                expect(testBg.fittingType).toBeOfType('string');
                expect(testBg.id).toBeOfType('string');
                expect(testBg.mediaRef).toBeOfType('string');
                expect(testBg.scrollType).toBeOfType('string');
                expect(testBg.type).toBe('BackgroundMedia');

                expect(testImage.type).toBe('Image');
                expect(testImage.uri).toBeOfType('string');
                expect(testImage.width).toBeOfType('number');
                expect(testImage.height).toBeOfType('number');
            });

        });

        describe('fix Pages with background per page', function(){

            var pageBGPP;
            beforeEach(function(){
                pageBGPP = _.cloneDeep(_siteAsJsonMockBGPP.pages);
            });

            it('should convert 2 backgrounds on each page', function() {

                _.forEach(pageBGPP, function(page){
                    exec(page);
                    var countBgImage = _.filter(page.data.document_data, {type: 'BackgroundImage'}).length;
                    var bgMedia = _.filter(page.data.document_data, {type: 'BackgroundMedia'});
                    var countBgMedia = bgMedia.length;

                    expect(countBgImage).toEqual(0);
                    expect(countBgMedia).toEqual(2);

                });
            });

            it('should create new images for backgrounds with images', function(){
                _.forEach(pageBGPP, function(page) {
                    exec(page);
                    var bgMedia = _.filter(page, {type: 'BackgroundMedia'});
                    _.forEach(bgMedia, function(item) {
                        var hasRef = !!item.mediaRef;
                        var hasImage = hasRef && !!page[item.mediaRef];
                        expect(hasRef).toEqual(hasImage);

                    });
                });
            });
        });

        describe('Converted Site', function(){
            it('should do nothing if page and master page already converted', function(){
                var convertedSite = _.cloneDeep(_siteAsJsonMockBgMedia);
                exec(convertedSite.masterPage);
                exec(convertedSite.pages[0]);

                expect(_siteAsJsonMockBgMedia).toEqual(convertedSite);
            });
        });
    });



    var _siteAsJsonMockBgMedia = {
        "masterPage": {
            "data": {
                "document_data": {
                    111: {
                        type: 'Page',
                        pageBackgrounds: {
                            desktop:{
                                ref: '#222'
                            },
                            mobile:{
                                ref: '#333'
                            }
                        }
                    },
                    222: {
                        type: 'BackgroundMedia'
                    },
                    333: {
                        type: 'BackgroundMedia'
                    }
                },
                "theme_data": {
                    "THEME_DATA": {
                        "siteBg": "4d24ad2c7b8f47bbbfe14399bd41dc54.png 64px 50px center top auto repeat repeat scroll #C5E5DA",
                        "mobileBg": "4d24ad2c7b8f47bbbfe14399bd41dc54.png 64px 50px center top auto repeat repeat scroll #C5E5DA"
                    }
                }
            },
            "structure": {"type" : "Document"}
        },
        "pages": [
            {
                "data": {
                    "document_data": {
                        111: {
                            type: 'Page',
                            id: '111',
                            pageBackgrounds: {
                                desktop:{
                                    ref: '#222'
                                },
                                mobile:{
                                    ref: '#333'
                                }
                            }
                        },
                        222: {
                            type: 'BackgroundMedia'
                        },
                        333: {
                            type: 'BackgroundMedia'
                        }
                    }
                },
                "structure": {"id" : "111"}
            }

        ]
    };
    var _siteAsJsonMockBGPP = {
        "masterPage": {
            "data": {
                "document_data": {
                    "1fti": {
                        "type": "PageLink",
                        "id": "1fti",
                        "metaData": {
                            "isPreset": true,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "pageId": "#c1dmp"
                    },
                    "c1b2g": {
                        "type": "Page",
                        "id": "c1b2g",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "title": "About2",
                        "hideTitle": true,
                        "icon": "",
                        "descriptionSEO": "",
                        "metaKeywordsSEO": "",
                        "pageTitleSEO": "",
                        "pageUriSEO": "about2",
                        "hidePage": false,
                        "underConstruction": false,
                        "tpaApplicationId": 0,
                        "pageSecurity": {
                            "requireLogin": false,
                            "passwordDigest": ""
                        },
                        "indexable": true,
                        "isLandingPage": false,
                        "pageBackgrounds": {
                            "desktop": {
                                "custom": true,
                                "ref": "#customBgImgnfv",
                                "isPreset": false
                            },
                            "mobile": {
                                "custom": true,
                                "ref": "#customBgImg7i5",
                                "isPreset": true
                            }
                        }
                    },
                    "c1dmp": {
                        "type": "Page",
                        "id": "c1dmp",
                        "metaData": {
                            "isPreset": true,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "title": "HOME",
                        "hideTitle": true,
                        "icon": "",
                        "descriptionSEO": "",
                        "metaKeywordsSEO": "",
                        "pageTitleSEO": "",
                        "pageUriSEO": "home",
                        "hidePage": false,
                        "underConstruction": false,
                        "tpaApplicationId": 0,
                        "pageSecurity": {
                            "requireLogin": false
                        },
                        "indexable": true,
                        "isLandingPage": false,
                        "pageBackgrounds": {
                            "desktop": {
                                "custom": true,
                                "ref": "#customBgImg3vn",
                                "isPreset": false
                            },
                            "mobile": {
                                "custom": true,
                                "ref": "#customBgImg24ta",
                                "isPreset": true
                            }
                        }
                    },
                    "chi7": {
                        "type": "Page",
                        "id": "chi7",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "title": "Blank",
                        "hideTitle": true,
                        "icon": "",
                        "descriptionSEO": "",
                        "metaKeywordsSEO": "",
                        "pageTitleSEO": "",
                        "pageUriSEO": "blank",
                        "hidePage": false,
                        "underConstruction": false,
                        "tpaApplicationId": 0,
                        "pageSecurity": {
                            "requireLogin": false,
                            "passwordDigest": "",
                            "dialogLanguage": ""
                        },
                        "indexable": true,
                        "isLandingPage": false,
                        "pageBackgrounds": {
                            "desktop": {
                                "custom": true,
                                "ref": "#customBgImgu1c",
                                "isPreset": false
                            },
                            "mobile": {
                                "custom": true,
                                "ref": "#customBgImg4t8",
                                "isPreset": true
                            }
                        }
                    },
                    "customBgImg24ta": {
                        "type": "BackgroundImage",
                        "id": "customBgImg24ta",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.1",
                            "isHidden": false
                        },
                        "url": "4d24ad2c7b8f47bbbfe14399bd41dc54.png",
                        "positionx": "center",
                        "positiony": "top",
                        "width": "auto",
                        "repeatx": "repeat",
                        "repeaty": "repeat",
                        "attachment": "scroll",
                        "color": "#C5E5DA",
                        "imagesizeh": 50,
                        "imagesizew": 64
                    },
                    "customBgImg3vn": {
                        "type": "BackgroundImage",
                        "id": "customBgImg3vn",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.1",
                            "isHidden": false
                        },
                        "url": "4d24ad2c7b8f47bbbfe14399bd41dc54.png",
                        "positionx": "center",
                        "positiony": "top",
                        "width": "auto",
                        "repeatx": "repeat",
                        "repeaty": "repeat",
                        "attachment": "scroll",
                        "color": "#C5E5DA",
                        "imagesizeh": 50,
                        "imagesizew": 64
                    },
                    "masterPage": {}
                },
                "theme_data": {
                    "THEME_DATA": {
                        "type": "WFlatTheme",
                        "id": "THEME_DATA",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "color": [
                            "#ffffff",
                            "#FFFFFF",
                            "#000000",
                            "237,28,36,1",
                            "0,136,203,1",
                            "255,203,5,1",
                            "114,114,114,1",
                            "176,176,176,1",
                            "255,255,255,1",
                            "114,114,114,1",
                            "176,176,176,1",
                            "#FFFFFF",
                            "#CCCCCC",
                            "160,160,159,1",
                            "#605E5E",
                            "#2F2E2E",
                            "#BAE9FF",
                            "#97DEFF",
                            "#30BDFF",
                            "#207EA9",
                            "#103F54",
                            "#B6E8E3",
                            "#8DD1CA",
                            "#41BAAE",
                            "#2B7C74",
                            "#163E3A",
                            "#F4C0AF",
                            "#E99F86",
                            "#DE5021",
                            "#943616",
                            "#4A1B0B",
                            "#F4EAB1",
                            "#E9DB89",
                            "#DEC328",
                            "#94821B",
                            "#4A410D"
                        ],
                        "siteBg": "4d24ad2c7b8f47bbbfe14399bd41dc54.png 64px 50px center top auto repeat repeat scroll #C5E5DA",
                        "mobileBg": "4d24ad2c7b8f47bbbfe14399bd41dc54.png 64px 50px center top auto repeat repeat scroll #C5E5DA",
                        "font": [
                            "normal normal normal 40px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 16px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 25px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 60px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 40px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 25px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 22px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 17px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 15px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 14px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 12px/1.4em din-next-w01-light {color_14}"
                        ],
                        "border": [
                            "0.15em solid [color_1]",
                            "0.25em solid [color_2]",
                            "0.35em solid [color_3]"
                        ],
                        "padding1": "0 0 0 0",
                        "padding2": "0.0em 0.5em 0.0em 0.5em",
                        "padding3": "1.0em 0.0em 1.0em 0.0em",
                        "iconSize": "3.2",
                        "bulletSize": "1.5",
                        "headerSpacing": "2.25em",
                        "componentSpacing": "0.45em",
                        "itemSpacing": "0.75em",
                        "thumbSpacing": "0.23em",
                        "iconSpacing": "0.75em",
                        "themePresets": {
                            "mobileBg": false
                        },
                        "THEME_DIRECTORY": "photography",
                        "BG_DIRECTORY": "photography",
                        "CONTACT_DIRECTORY": "photography/contact",
                        "NETWORKS_DIRECTORY": "photography/network",
                        "EXTERNAL_LINKS_DIRECTORY": "photography/external",
                        "PAGES_DIRECTORY": "photography/pages",
                        "WEB_THEME_DIRECTORY": "viewer",
                        "BASE_THEME_DIRECTORY": "base"
                    }
                }
            },
            "structure" : {"type" : "Document"}
        },
        "pages": [
            {
                "data": {
                    "document_data": {

                        "c1dmp": {
                            "type": "Page",
                            "id": "c1dmp",
                            "metaData": {
                                "isPreset": true,
                                "schemaVersion": "1.0",
                                "isHidden": false
                            },
                            "title": "HOME",
                            "hideTitle": true,
                            "icon": "",
                            "descriptionSEO": "",
                            "metaKeywordsSEO": "",
                            "pageTitleSEO": "",
                            "pageUriSEO": "home",
                            "hidePage": false,
                            "underConstruction": false,
                            "tpaApplicationId": 0,
                            "pageSecurity": {
                                "requireLogin": false
                            },
                            "indexable": true,
                            "isLandingPage": false,
                            "pageBackgrounds": {
                                "desktop": {
                                    "custom": true,
                                    "ref": "#customBgImg3vn",
                                    "isPreset": false
                                },
                                "mobile": {
                                    "custom": true,
                                    "ref": "#customBgImg24ta",
                                    "isPreset": true
                                }
                            }
                        },
                        "customBgImg24ta": {
                            "type": "BackgroundImage",
                            "id": "customBgImg24ta",
                            "metaData": {
                                "isPreset": false,
                                "schemaVersion": "1.1",
                                "isHidden": false
                            },
                            "url": "4d24ad2c7b8f47bbbfe14399bd41dc54.png",
                            "positionx": "center",
                            "positiony": "top",
                            "width": "auto",
                            "repeatx": "repeat",
                            "repeaty": "repeat",
                            "attachment": "scroll",
                            "color": "#C5E5DA",
                            "imagesizeh": 50,
                            "imagesizew": 64
                        },
                        "customBgImg3vn": {
                            "type": "BackgroundImage",
                            "id": "customBgImg3vn",
                            "metaData": {
                                "isPreset": false,
                                "schemaVersion": "1.1",
                                "isHidden": false
                            },
                            "url": "4d24ad2c7b8f47bbbfe14399bd41dc54.png",
                            "positionx": "center",
                            "positiony": "top",
                            "width": "auto",
                            "repeatx": "repeat",
                            "repeaty": "repeat",
                            "attachment": "scroll",
                            "color": "#C5E5DA",
                            "imagesizeh": 50,
                            "imagesizew": 64
                        }

                    }
                },
                "title": "HOME",
                "pageUriSEO": "home",
                "structure": {
                    "id": "c1dmp"
                }
            },
            {

                "data": {
                    "document_data": {
                        "chi7": {
                            "type": "Page",
                            "id": "chi7",
                            "metaData": {
                                "isPreset": false,
                                "schemaVersion": "1.0",
                                "isHidden": false
                            },
                            "title": "Blank",
                            "hideTitle": true,
                            "icon": "",
                            "descriptionSEO": "",
                            "metaKeywordsSEO": "",
                            "pageTitleSEO": "",
                            "pageUriSEO": "blank",
                            "hidePage": false,
                            "underConstruction": false,
                            "tpaApplicationId": 0,
                            "pageSecurity": {
                                "requireLogin": false,
                                "passwordDigest": "",
                                "dialogLanguage": ""
                            },
                            "indexable": true,
                            "isLandingPage": false,
                            "pageBackgrounds": {
                                "desktop": {
                                    "custom": true,
                                    "ref": "#customBgImgu1c",
                                    "isPreset": false
                                },
                                "mobile": {
                                    "custom": true,
                                    "ref": "#customBgImg4t8",
                                    "isPreset": true
                                }
                            }
                        },
                        "customBgImg4t8": {
                            "type": "BackgroundImage",
                            "id": "customBgImg4t8",
                            "metaData": {
                                "isPreset": false,
                                "schemaVersion": "1.1",
                                "isHidden": false
                            },
                            "url": "none",
                            "positionx": "center",
                            "positiony": "top",
                            "width": "cover",
                            "repeatx": "no_repeat",
                            "repeaty": "no_repeat",
                            "attachment": "fixed",
                            "color": "{color_22}",
                            "imagesizeh": 0,
                            "imagesizew": 0
                        },
                        "customBgImgu1c": {
                            "type": "BackgroundImage",
                            "id": "customBgImgu1c",
                            "metaData": {
                                "isPreset": false,
                                "schemaVersion": "1.1",
                                "isHidden": false
                            },
                            "url": "none",
                            "positionx": "center",
                            "positiony": "top",
                            "width": "cover",
                            "repeatx": "no_repeat",
                            "repeaty": "no_repeat",
                            "attachment": "fixed",
                            "color": "{color_22}",
                            "imagesizeh": 0,
                            "imagesizew": 0
                        }
                    },
                    "theme_data": {},
                    "component_properties": {}
                },
                "title": "Blank",
                "pageUriSEO": "blank",
                "structure": {"id": "chi7"}
            },
            {
                "data": {
                    "document_data": {
                        "c1b2g": {
                            "type": "Page",
                            "id": "c1b2g",
                            "metaData": {
                                "isPreset": false,
                                "schemaVersion": "1.0",
                                "isHidden": false
                            },
                            "title": "About2",
                            "hideTitle": true,
                            "icon": "",
                            "descriptionSEO": "",
                            "metaKeywordsSEO": "",
                            "pageTitleSEO": "",
                            "pageUriSEO": "about2",
                            "hidePage": false,
                            "underConstruction": false,
                            "tpaApplicationId": 0,
                            "pageSecurity": {
                                "requireLogin": false,
                                "passwordDigest": ""
                            },
                            "indexable": true,
                            "isLandingPage": false,
                            "pageBackgrounds": {
                                "desktop": {
                                    "custom": true,
                                    "ref": "#customBgImgnfv",
                                    "isPreset": false
                                },
                                "mobile": {
                                    "custom": true,
                                    "ref": "#customBgImg7i5",
                                    "isPreset": true
                                }
                            }
                        },
                        "customBgImg7i5": {
                            "type": "BackgroundImage",
                            "id": "customBgImg7i5",
                            "metaData": {
                                "isPreset": false,
                                "schemaVersion": "1.1",
                                "isHidden": false
                            },
                            "url": "34a5c89879d04bd0b22d4754040a4df9.jpg",
                            "positionx": "center",
                            "positiony": "top",
                            "width": "cover",
                            "repeatx": "no_repeat",
                            "repeaty": "no_repeat",
                            "attachment": "scroll",
                            "color": "#023D61",
                            "imagesizeh": 1200,
                            "imagesizew": 1980
                        },
                        "customBgImgnfv": {
                            "type": "BackgroundImage",
                            "id": "customBgImgnfv",
                            "metaData": {
                                "isPreset": false,
                                "schemaVersion": "1.1",
                                "isHidden": false
                            },
                            "url": "34a5c89879d04bd0b22d4754040a4df9.jpg",
                            "positionx": "center",
                            "positiony": "top",
                            "width": "cover",
                            "repeatx": "no_repeat",
                            "repeaty": "no_repeat",
                            "attachment": "scroll",
                            "color": "#023D61",
                            "imagesizeh": 1200,
                            "imagesizew": 1980
                        }
                    }
                },
                "title": "About2",
                "pageUriSEO": "about2",
                "structure": {"id": "c1b2g"}
            }
        ]
    };
    var _siteAsJsonThemeBg = {
        "masterPage": {
            "data": {
                "document_data": {
                    "1fti": {
                        "type": "PageLink",
                        "id": "1fti",
                        "metaData": {
                            "isPreset": true,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "pageId": "#c1dmp"
                    },
                    "c1b2g": {
                        "type": "Page",
                        "id": "c1b2g",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "title": "About2",
                        "hideTitle": true,
                        "icon": "",
                        "descriptionSEO": "",
                        "metaKeywordsSEO": "",
                        "pageTitleSEO": "",
                        "pageUriSEO": "about2",
                        "hidePage": false,
                        "underConstruction": false,
                        "tpaApplicationId": 0,
                        "pageSecurity": {
                            "requireLogin": false,
                            "passwordDigest": ""
                        },
                        "indexable": true,
                        "isLandingPage": false

                    },
                    "c1dmp": {
                        "type": "Page",
                        "id": "c1dmp",
                        "metaData": {
                            "isPreset": true,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "title": "HOME",
                        "hideTitle": true,
                        "icon": "",
                        "descriptionSEO": "",
                        "metaKeywordsSEO": "",
                        "pageTitleSEO": "",
                        "pageUriSEO": "home",
                        "hidePage": false,
                        "underConstruction": false,
                        "tpaApplicationId": 0,
                        "pageSecurity": {
                            "requireLogin": false
                        },
                        "indexable": true,
                        "isLandingPage": false
                    },
                    "chi7": {
                        "type": "Page",
                        "id": "chi7",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "title": "Blank",
                        "hideTitle": true,
                        "icon": "",
                        "descriptionSEO": "",
                        "metaKeywordsSEO": "",
                        "pageTitleSEO": "",
                        "pageUriSEO": "blank",
                        "hidePage": false,
                        "underConstruction": false,
                        "tpaApplicationId": 0,
                        "pageSecurity": {
                            "requireLogin": false,
                            "passwordDigest": "",
                            "dialogLanguage": ""
                        },
                        "indexable": true,
                        "isLandingPage": false
                    },
                    "masterPage": {}
                },
                "theme_data": {
                    "THEME_DATA": {
                        "type": "WFlatTheme",
                        "id": "THEME_DATA",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "color": [
                            "#ffffff",
                            "#FFFFFF",
                            "#000000",
                            "237,28,36,1",
                            "0,136,203,1",
                            "255,203,5,1",
                            "114,114,114,1",
                            "176,176,176,1",
                            "255,255,255,1",
                            "114,114,114,1",
                            "176,176,176,1",
                            "#FFFFFF",
                            "#CCCCCC",
                            "160,160,159,1",
                            "#605E5E",
                            "#2F2E2E",
                            "#BAE9FF",
                            "#97DEFF",
                            "#30BDFF",
                            "#207EA9",
                            "#103F54",
                            "#B6E8E3",
                            "#8DD1CA",
                            "#41BAAE",
                            "#2B7C74",
                            "#163E3A",
                            "#F4C0AF",
                            "#E99F86",
                            "#DE5021",
                            "#943616",
                            "#4A1B0B",
                            "#F4EAB1",
                            "#E9DB89",
                            "#DEC328",
                            "#94821B",
                            "#4A410D"
                        ],
                        "siteBg": "desktop.png 100px 100px center top auto repeat repeat scroll #C5E5DA",
                        "mobileBg": "mobile.png 50px 50px center top auto repeat repeat scroll #C5E5DA",
                        "font": [
                            "normal normal normal 40px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 16px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 25px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 60px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 40px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 25px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 22px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 17px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 15px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 14px/1.4em din-next-w01-light {color_14}",
                            "normal normal normal 12px/1.4em din-next-w01-light {color_14}"
                        ],
                        "border": [
                            "0.15em solid [color_1]",
                            "0.25em solid [color_2]",
                            "0.35em solid [color_3]"
                        ],
                        "padding1": "0 0 0 0",
                        "padding2": "0.0em 0.5em 0.0em 0.5em",
                        "padding3": "1.0em 0.0em 1.0em 0.0em",
                        "iconSize": "3.2",
                        "bulletSize": "1.5",
                        "headerSpacing": "2.25em",
                        "componentSpacing": "0.45em",
                        "itemSpacing": "0.75em",
                        "thumbSpacing": "0.23em",
                        "iconSpacing": "0.75em",
                        "themePresets": {
                            "mobileBg": false
                        },
                        "THEME_DIRECTORY": "photography",
                        "BG_DIRECTORY": "photography",
                        "CONTACT_DIRECTORY": "photography/contact",
                        "NETWORKS_DIRECTORY": "photography/network",
                        "EXTERNAL_LINKS_DIRECTORY": "photography/external",
                        "PAGES_DIRECTORY": "photography/pages",
                        "WEB_THEME_DIRECTORY": "viewer",
                        "BASE_THEME_DIRECTORY": "base"
                    }
                }
            },
            "structure" : {"type" : "Document"}

        },
        "pages": [
            {
                "data": {
                    "document_data": {

                        "c1dmp": {
                            "type": "Page",
                            "id": "c1dmp",
                            "metaData": {
                                "isPreset": true,
                                "schemaVersion": "1.0",
                                "isHidden": false
                            },
                            "title": "HOME",
                            "hideTitle": true,
                            "icon": "",
                            "descriptionSEO": "",
                            "metaKeywordsSEO": "",
                            "pageTitleSEO": "",
                            "pageUriSEO": "home",
                            "hidePage": false,
                            "underConstruction": false,
                            "tpaApplicationId": 0,
                            "pageSecurity": {
                                "requireLogin": false
                            },
                            "indexable": true,
                            "isLandingPage": false
                        }

                    }
                },
                "title": "HOME",
                "pageUriSEO": "home",
                "structure" :{"id": "c1dmp"}
            },
            {

                "data": {
                    "document_data": {
                        "chi7": {
                            "type": "Page",
                            "id": "chi7",
                            "metaData": {
                                "isPreset": false,
                                "schemaVersion": "1.0",
                                "isHidden": false
                            },
                            "title": "Blank",
                            "hideTitle": true,
                            "icon": "",
                            "descriptionSEO": "",
                            "metaKeywordsSEO": "",
                            "pageTitleSEO": "",
                            "pageUriSEO": "blank",
                            "hidePage": false,
                            "underConstruction": false,
                            "tpaApplicationId": 0,
                            "pageSecurity": {
                                "requireLogin": false,
                                "passwordDigest": "",
                                "dialogLanguage": ""
                            },
                            "indexable": true,
                            "isLandingPage": false
                        }
                    },
                    "theme_data": {},
                    "component_properties": {}
                },
                "title": "Blank",
                "pageUriSEO": "blank",
                "structure": {"id": "chi7"}
            },
            {
                "data": {
                    "document_data": {
                        "c1b2g": {
                            "type": "Page",
                            "id": "c1b2g",
                            "metaData": {
                                "isPreset": false,
                                "schemaVersion": "1.0",
                                "isHidden": false
                            },
                            "title": "About2",
                            "hideTitle": true,
                            "icon": "",
                            "descriptionSEO": "",
                            "metaKeywordsSEO": "",
                            "pageTitleSEO": "",
                            "pageUriSEO": "about2",
                            "hidePage": false,
                            "underConstruction": false,
                            "tpaApplicationId": 0,
                            "pageSecurity": {
                                "requireLogin": false,
                                "passwordDigest": ""
                            },
                            "indexable": true,
                            "isLandingPage": false
                        }
                    }
                },
                "title": "About2",
                "pageUriSEO": "about2",
                "structure" : {"id": "c1b2g"}
            }
        ]
    };
});

