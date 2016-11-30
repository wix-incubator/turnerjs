define(['lodash',
        'testUtils',
        'documentServices/mockPrivateServices/privateServicesHelper'

    ],
    function (_, testUtils, privateServicesHelper) {
        'use strict';

        var siteData;

        var fontsMetaDataMock = {
            "arial": {
                "displayName": "Arial",
                "fontFamily": "arial",
                "cdnName": "",
                "genericFamily": "sans-serif",
                "provider": "system",
                "characterSets": [
                    "latin"
                ],
                "permissions": "all",
                "fallbacks": "arial_fallback",
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
            "lobster": {
                "displayName": "Lobster",
                "fontFamily": "lobster",
                "cdnName": "Lobster",
                "genericFamily": "cursive",
                "provider": "google",
                "characterSets": [
                    "latin"
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
            "helvetica": {
                "displayName": "Helvetica 45",
                "fontFamily": "helveticaneuew01-45ligh",
                "cdnName": "",
                "genericFamily": "sans-serif",
                "provider": "monotype",
                "characterSets": [
                    "latin"
                ],
                "permissions": "studio",
                "fallbacks": "",
                "spriteIndex": 89
            }
        };

        var mock = {'fonts/utils/fontMetadata': fontsMetaDataMock};


        describe('fonts public API', function () {

            beforeEach(function () {
                siteData = testUtils.mockFactory.mockSiteData();
                this.privateApi = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            testUtils.requireWithMocks('documentServices/fonts/fonts', mock, function (fonts) {
                describe('getCssUrls', function () {
                    it('should return wix stored style sheets + google fonts urls', function () {
                        var expected = {
                            googleFonts: '//fonts.googleapis.com/css?family=Lobster:n,b,i,bi|Niconne:n,b,i,bi|&subset=latin-ext,cyrillic,japanese,korean,arabic,hebrew,latin',
                            "latin-ext": 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/latin-ext.css',
                            cyrillic: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/cyrillic.css',
                            japanese: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/japanese.css',
                            korean: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/korean.css',
                            arabic: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/arabic.css',
                            hebrew: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/hebrew.css',
                            latin: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/latin.css'
                        };
                        expect(fonts.css.getCssUrls(this.privateApi)).toEqual(expected);
                    });
                    it('should return wix stored style sheets + helvetica + google fonts urls for wixSite', function () {
                        this.privateApi.dal.setDocumentType('WixSite');

                        var expected = {
                            googleFonts: '//fonts.googleapis.com/css?family=Lobster:n,b,i,bi|Niconne:n,b,i,bi|&subset=latin-ext,cyrillic,japanese,korean,arabic,hebrew,latin',
                            "latin-ext": 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/latin-ext.css',
                            cyrillic: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/cyrillic.css',
                            japanese: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/japanese.css',
                            korean: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/korean.css',
                            arabic: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/arabic.css',
                            hebrew: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/hebrew.css',
                            latin: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/latin.css',
                            helveticas: 'http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v3/helvetica.css'
                        };

                        expect(fonts.css.getCssUrls(this.privateApi)).toEqual(expected);

                    });
                });

                describe('getSiteFontsOptions', function () {
                    it('should return site fonts options by permission grouped by used character sets in the site when not wixSite', function () {
                        var latinFonts = _.filter(fontsMetaDataMock, function (font) {
                            return font.permissions !== 'studio' && _.includes(font.characterSets, "latin");
                        });
                        var expected = [{lang: 'latin', fonts: _.sortBy(latinFonts, "fontFamily")}];

                        var result = fonts.getSiteFontsOptions(this.privateApi);

                        expect(result).toEqual(expected);
                    });

                    it('should return site fonts options by permission grouped by used character sets in the site when wixSite', function () {

                        this.privateApi.dal.setDocumentType('WixSite');
                        var latinFonts = _.filter(fontsMetaDataMock, function (font) {
                            return _.includes(font.characterSets, "latin");
                        });

                        var expected = [{lang: 'latin', fonts: _.sortBy(latinFonts, "fontFamily")}];

                        var result = fonts.getSiteFontsOptions(this.privateApi);

                        expect(result).toEqual(expected);
                    });

                    it('should return all fonts options by permission grouped by character sets when not wixSite', function () {
                        var latinFonts = _.filter(fontsMetaDataMock, function (font) {
                            return font.permissions !== 'studio' && _.includes(font.characterSets, "latin");
                        });

                        var arabicFonts = _.filter(fontsMetaDataMock, function (font) {
                            return font.permissions !== 'studio' && _.includes(font.characterSets, "arabic");
                        });
                        var expected = [
                            {lang: 'latin-ext', fonts: undefined},
                            {lang: 'cyrillic', fonts: undefined},
                            {lang: 'japanese', fonts: undefined},
                            {lang: 'korean', fonts: undefined},
                            {lang: 'arabic', fonts: _.sortBy(arabicFonts, "fontFamily")},
                            {lang: 'hebrew', fonts: undefined},
                            {lang: 'latin', fonts: _.sortBy(latinFonts, "fontFamily")}
                        ];

                        var result = fonts.getAllFontsOptions(this.privateApi);

                        expect(result).toEqual(expected);
                    });
                });
            });


        });
    });
