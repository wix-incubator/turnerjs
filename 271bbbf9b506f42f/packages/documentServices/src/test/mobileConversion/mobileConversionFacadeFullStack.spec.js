/**
 * Created by alexandergonchar on 11/6/14.
 */
define([
    'lodash',
    'Squire',
    'core',
    'testUtils',
    'documentServices/dataAccessLayer/DataAccessLayer',
    'documentServices/mobileConversion/mobileConversionFacade',
    'documentServices/mockPrivateServices/privateServicesHelper',
    './data/fullStackBigSiteStructure.json.js',
    './data/fullStackCorrectConvertedComponents.json.js'
], function (
    _,
    Squire,
    core,
    testUtils,
    DataAccessLayer,
    mobileConversionFacadeForStateless,
    privateServicesHelper,
    fullStackBigSiteStructure,
    correctConvertedComponents
) {
    'use strict';

    describe('mobile conversion Facade (Full stack)', function () {
        function initiate(mockedData) {
            var siteData = privateServicesHelper.getSiteDataWithPages(mockedData);
            var privateApi = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            return privateApi;
        }

        describe('runMobileConversionAlgorithm', function () {
            var mobileConversionFacade,
                privateApi,
                struct;

            function expectBoToEqualTypesAndIds(expectedComps, actualComps) {
                var actualComp, expectedComp;
                expect(actualComps.length).toBe(expectedComps.length);
                for (var i = 0; i < actualComps.length; ++i) {
                    actualComp = actualComps[i];
                    expectedComp = expectedComps[i];
                    expect(actualComp.componentType).toBe(expectedComp.componentType);
                    expect(actualComp.id).toBe(expectedComp.id);
                }
            }

            beforeEach(function (done) {
                var pagesData = createBigSiteStructure();

                struct = pagesData.mainPage.structure;
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                mockSiteData.pagesData = pagesData;
                privateApi = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);

                var injector = new Squire();
                injector.require(['documentServices/mobileConversion/mobileConversionFacade'], function (mc) {
                    mobileConversionFacade = mc;
                    done();
                });
            });

            it('should convert big site properly', function () {
                mobileConversionFacade.runMobileConversionAlgorithm(privateApi, struct, []);

                var correctMobileComponents = createCorrectConvertedComponents();
                expectBoToEqualTypesAndIds(correctMobileComponents, struct.mobileComponents);
            });
        });

        describe('stateless function', function () {
            describe('getComponentsExistingInWebsiteButNotInMobile', function () {


                it('should return zero difference for equal structures', function () {
                    var pagesData = {
                        mainPage: {
                            components: [
                                {id: 'x1', components: []},
                                {id: 'x2', components: []},
                                {id: 'x3', components: []}
                            ],
                            mobileComponents: [
                                {id: 'x1', mobileComponents: []},
                                {id: 'x2', mobileComponents: []},
                                {id: 'x3', mobileComponents: []}
                            ]
                        },
                        masterPage: {
                            mobileComponents: [
                                {id: 'SITE_HEADER'},
                                {id: 'PGAES_CONTAINER'},
                                {id: 'SITE_FOOTER'}
                            ]
                        }
                    };
                    var privateApi = initiate(pagesData);


                    var diff = mobileConversionFacadeForStateless.getComponentsExistingInWebsiteButNotInMobile(
                        privateApi);

                    expect(diff.mainPage.length).toEqual(0);
                    expect(diff.masterPage.length).toEqual(0);

                });

                it('should return component existing in website but not in mobile', function () {
                    var pagesData = {
                        mainPage: {
                            components: [
                                {id: 'x1', components: []},
                                {id: 'x2', components: []},
                                {id: 'x3', components: []}
                            ],
                            mobileComponents: [
                                {id: 'x1', mobileComponents: []},
                                {id: 'x3', mobileComponents: []}
                            ]
                        },
                        masterPage: {
                            mobileComponents: [
                                {id: 'SITE_HEADER'},
                                {id: 'PGAES_CONTAINER'},
                                {id: 'SITE_FOOTER'}
                            ]
                        }
                    };

                    var privateApi = initiate(pagesData);

                    var diff = mobileConversionFacadeForStateless.getComponentsExistingInWebsiteButNotInMobile(
                        privateApi);

                    expect(diff.mainPage.length).toEqual(1);
                    expect(diff.mainPage[0]).toEqual('x2');
                    expect(diff.masterPage.length).toEqual(0);

                });

                it('should *not* return component existing in mobile but not in website', function () {
                    var pagesData = {
                        mainPage: {
                            components: [
                                {id: 'x1', components: []},
                                {id: 'x3', components: []}
                            ],
                            mobileComponents: [
                                {id: 'x1', mobileComponents: []},
                                {id: 'x2', mobileComponents: []},
                                {id: 'x3', mobileComponents: []}
                            ]
                        },
                        masterPage: {
                            mobileComponents: [
                                {id: 'SITE_HEADER'},
                                {id: 'PGAES_CONTAINER'},
                                {id: 'SITE_FOOTER'}
                            ]
                        }
                    };
                    var privateApi = initiate(pagesData);


                    var diff = mobileConversionFacadeForStateless.getComponentsExistingInWebsiteButNotInMobile(
                        privateApi);

                    expect(diff.mainPage.length).toEqual(0);
                    expect(diff.masterPage.length).toEqual(0);
                });

                it('should handle both masterPage and mainPage', function () {
                    var pagesData = {
                        mainPage: {
                            components: [
                                {id: 'x1', components: []},
                                {id: 'x3', components: []}
                            ]
                        },
                        masterPage: {
                            components: [{id: 'y1', components: []}],
                            mobileComponents: [
                                {id: 'SITE_HEADER'},
                                {id: 'PGAES_CONTAINER'},
                                {id: 'SITE_FOOTER'}
                            ]
                        }
                    };
                    var privateApi = initiate(pagesData);


                    var diff = mobileConversionFacadeForStateless.getComponentsExistingInWebsiteButNotInMobile(
                        privateApi);

                    expect(diff.mainPage.length).toEqual(2);
                    expect(diff.masterPage.length).toEqual(1);
                    expect(diff.mainPage[0]).toEqual('x1');
                    expect(diff.mainPage[1]).toEqual('x3');
                    expect(diff.masterPage[0]).toEqual('y1');
                });
            });

            xdescribe('getHiddenMobileOnlyComponentIds', function () {

                it('should return TINY_MENU when site header is in the structure but TINY_MENU is not', function () {
                    var mainPage = {
                        components: [
                            {id: 'SITE_HEADER', components: []},
                            {id: 'x2', components: []},
                            {id: 'x3', components: []}
                        ],
                        id: 'mainPage'
                    };
                    var privateApi = privateServicesHelper.mockPrivateServices({pagesData: {mainPage: mainPage}});
                    spyOn(privateApi.dal, 'getKeys').and.returnValue(['mainPage']);


                    var ids = mobileConversionFacadeForStateless.getHiddenMobileOnlyComponentIds(privateApi, mainPage);

                    expect(ids.length).toEqual(1);
                    expect(ids[0]).toEqual('TINY_MENU');
                });

                it('should *not* return TINY_MENU when site contains TINY_MENU', function () {
                    var mainPage = {
                        components: [
                            {
                                id: 'SITE_HEADER',
                                components: [
                                    {id: 'TINY_MENU', components: []}
                                ]
                            },
                            {id: 'x2', components: []},
                            {id: 'x3', components: []}
                        ],
                        id: 'mainPage'
                    };
                    var privateApi = privateServicesHelper.mockPrivateServices({pagesData: {mainPage: mainPage}});
                    spyOn(privateApi.dal, 'getKeys').and.returnValue(['mainPage']);

                    var ids = mobileConversionFacadeForStateless.getHiddenMobileOnlyComponentIds(privateApi, mainPage);

                    expect(ids.length).toEqual(0);
                });
            });

            describe('addMobileOnlyComponentToStructure', function () {
                it('should add TINY_MENU when a site header doesnt contain it', function () {
                    var mainPage = {
                        structure: {
                            mobileComponents: [
                                {
                                    id: 'SITE_HEADER',
                                    layout: {},
                                    components: []
                                },
                                {id: 'x2', components: []},
                                {id: 'x3', components: []}
                            ],
                            componentType: 'mobile.core.components.Page',
                            id: 'mainPage'
                        },
                        id: 'mainPage'
                    };
                    var siteData = testUtils.mockFactory.mockSiteData(null, true).addPage(mainPage);
                    var privateApi = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    spyOn(privateApi.dal, 'getKeys').and.returnValue(['mainPage']);

                    mobileConversionFacadeForStateless.addMobileOnlyComponentToStructure(privateApi, 'TINY_MENU', mainPage.structure);

                    var comps = mainPage.structure.mobileComponents[0].components;

                    expect(comps.length).toBe(1);
                    expect(comps[0].id).toBe('TINY_MENU');
                });

                xit('should add EXIT_MOBILE to the footer of a site', function () {
                    var mainPage = {
                        structure: {
                            components: [
                                {id: 'x2', components: [], layout: {x: 0, y: 0}},
                                {id: 'x3', components: [], layout: {x: 40, y: 40}},
                                {
                                    id: 'SITE_FOOTER',
                                    components: [],
                                    layout: {x: 50, y: 50}
                                }
                            ],
                            componentType: 'mobile.core.components.Page',
                            id: 'mainPage'
                        },
                        id: 'mainPage'
                    };
                    var siteData = testUtils.mockFactory.mockSiteData(null, true).addPage(mainPage);
                    var privateApi = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    spyOn(privateApi.dal, 'getKeys').and.returnValue(['mainPage']);

                    mobileConversionFacadeForStateless.addMobileOnlyComponentToStructure(privateApi, 'EXIT_MOBILE', mainPage.structure);

                    var comps = mainPage.structure.mobileComponents[2].components;

                    expect(comps.length).toBe(1);
                    expect(comps[0].id).toBe('EXIT_MOBILE');
                });

                it('should add BACK_TO_TOP_BUTTON when to the footer of a site', function () {
                    var mainPage = {
                        structure: {
                            mobileComponents: [
                                {id: 'x2', components: []},
                                {id: 'x3', components: []},
                                {
                                    id: 'SITE_FOOTER',
                                    components: [],
                                    layout: {x: 50, y: 50}
                                }
                            ],
                            componentType: 'mobile.core.components.Page',
                            id: 'mainPage'
                        },
                        id: 'mainPage'
                    };
                    var siteData = testUtils.mockFactory.mockSiteData(null, true).addPage(mainPage);
                    var privateApi = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    spyOn(privateApi.dal, 'getKeys').and.returnValue(['mainPage']);

                    mobileConversionFacadeForStateless.addMobileOnlyComponentToStructure(privateApi, 'BACK_TO_TOP_BUTTON', mainPage.structure);

                    var comps = mainPage.structure.mobileComponents;

                    expect(comps.length).toBe(4);
                    expect(comps[3].id).toBe('BACK_TO_TOP_BUTTON');
                });
            });
        });
    });

    function createBigSiteStructure() {
        return fullStackBigSiteStructure;
    }

    function createCorrectConvertedComponents() {
        return correctConvertedComponents;
    }
});
