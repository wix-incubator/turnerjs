define(
    [
        'wixappsClassics/blog/blog',
        'testUtils',
        'lodash',
        'utils'
    ],
    function (blog, testUtils, _, utils) {
        'use strict';

        describe('wixappsClassics: blog', function () {
            var mockSiteData, mockCompData, mockBlogSpecMap;
            var mockStoreId = "143e28fd-01f4-cd31-915e-7169ff2ba01e";

            beforeEach(function () {
                mockSiteData = testUtils.mockFactory.mockSiteData();
                mockCompData = testUtils.mockFactory.dataMocks.appPartData();
                mockBlogSpecMap = {
                    "type": "wixapps",
                    "applicationId": 14,
                    "appDefinitionId": "61f33d50-3002-4882-ae86-d319c1a249ab",
                    "datastoreId": mockStoreId,
                    "packageName": "blog",
                    "state": "Initialized"
                };
            });

            describe('getRequests', function () {
                var getRequests = blog.getRequests;
                var requests;

                beforeEach(function () {
                    requests = getRequests(mockSiteData, mockCompData, mockBlogSpecMap);
                });

                it('should return valid requests', function () {
                    requests.forEach(testRequest);
                });

                describe('blogSettings request', function () {
                    var blogSettingsRequest, mockSettingsResponse;

                    beforeEach(function () {
                        blogSettingsRequest = _.find(requests, {data: {collectionId: 'Settings'}});
                        mockSettingsResponse = {
                            payload: {
                                items: [{
                                    settingsObject: {
                                        email: true,
                                        locale: 'fr'
                                    }
                                }]
                            }
                        };
                    });

                    it('should have the correct data', function () {
                        var expectedData = {
                            collectionId: 'Settings',
                            filter: {_iid: 'blogSettings'},
                            storeId: mockStoreId
                        };
                        expect(blogSettingsRequest.data).toEqual(expectedData);
                    });
                    it('should have the correct destination', function () {
                        expect(blogSettingsRequest.destination).toEqual(['wixapps', 'blog']);
                    });

                    describe('transform function', function () {
                        it('should transform with settings from response', function () {
                            var result = {};
                            var ret = blogSettingsRequest.transformFunc(mockSettingsResponse, result);

                            expect(result.settings).toBeDefined();
                            expect(result.settings.email).toBe(true);
                            expect(result.settings.locale).toBe('fr');
                            expect(ret).toEqual(result);
                        });
                    });
                });

                function isValid(request) {
                    var requestInterface = {
                        force: _.isBoolean,
                        destination: _.isObject,
                        url: _.isString,
                        data: _.isObject,
                        transformFunc: _.isFunction
                    };

                    var hasRightKeys = _.isEqual(_.keys(request), _.keys(requestInterface));

                    if (!hasRightKeys) {
                        return false;
                    }

                    return _.every(requestInterface, function (testerFunc, key) {
                        var requestField = request[key];

                        return testerFunc(requestField);
                    });
                }

                function testRequest(request) {
                    expect(isValid(request)).toBe(true);
                }

            });

            describe('functionLibrary', function () {
                var functionLibrary = blog.functionLibrary;
                var mockTranslationBundle = {
                    en: {
                        abc: 'abc'
                    },
                    fr: {
                        abc: 'abc in fr'
                    }
                };
                describe('translateToBlogLocale', function () {
                    beforeEach(function () {
                        utils.translations.blogTranslations = mockTranslationBundle;
                    });
                    it('should exist', function () {
                        expect(functionLibrary.translateToBlogLocale).toBeDefined();
                    });
                    it('should return the string translated to the selected language in blog setting', function () {
                        var mockSettings = {
                            email: true,
                            locale: 'fr'
                        };
                        var mockSiteDataWithSettings = mockSiteDataWithBlogSettings(mockSiteData, mockSettings);
                        fakeSiteDataOnFunctionLibrary(functionLibrary, mockSiteDataWithSettings);
                        expect(functionLibrary.translateToBlogLocale('abc')).toBe('abc in fr');
                    });
                    it('should return the string in English if no language is selected in settings', function () {
                        fakeSiteDataOnFunctionLibrary(functionLibrary, mockSiteData);
                        expect(functionLibrary.translateToBlogLocale('abc')).toBe('abc');
                    });
                    it('should return the key in case the translation does not exist in English', function () {
                        var invalidKey = 'invalid_key_12_34';
                        expect(functionLibrary.translateToBlogLocale(invalidKey)).toBe(invalidKey);
                    });

                    afterAll(function () {
                        cleanupSiteDataFromFunctionLibrary(functionLibrary);
                    });

                });

                function mockSiteDataWithBlogSettings(siteData, settings) {
                    return _.merge(
                        _.assign({}, siteData),
                        {
                            wixapps: {
                                blog: {
                                    settings: settings
                                }
                            }
                        }
                    );
                }

                function fakeSiteDataOnFunctionLibrary(funcLib, siteData) {
                    funcLib.siteData = siteData;
                }

                function cleanupSiteDataFromFunctionLibrary(funcLib) {
                    delete funcLib.siteData;
                }

            });
        });

    }
);
