define(['lodash', 'tpa/layout/tpaSectionPatcher', 'testUtils'], function(_, tpaSectionPatcher, testUtils) {
    'use strict';

    describe("tpaSectionPatcher", function() {
        var patchers;

        beforeEach(function() {
            patchers = {
                css: jasmine.createSpy('css')
            };
        });

        it('should have a function "patchTPASection"', function() {
            expect(tpaSectionPatcher.patchTPASection).toEqual(jasmine.any(Function));
        });

        describe('patchTPASection', function () {
            var siteData,
                measureMap,
                flatStructure = {
                    dataItem: {
                        applicationId: '1000'
                    }
                };

            beforeEach(function () {
                measureMap = {
                    height: {myid: 100,
                             screen: 500},
                    width: {myid: 200},
                    siteOffsetTop: 0,
                    custom: {
                        myid: {
                            hasIframe: true
                        }
                    }
                };
            });

            describe('when loading on iOS Safari', function () {
                beforeEach(function() {
                    siteData = {
                        os: {
                            ios: true
                        },
                        browser: {
                            safari: true
                        },
                        isViewerMode: function() { return true; },
                        rendererModel: {
                            clientSpecMap: {}
                        }
                    };
                });

                it('should patch iframe skin part size', function () {
                    tpaSectionPatcher.patchTPASection('myid', patchers, measureMap, flatStructure, siteData);
                    expect(patchers.css).toHaveBeenCalledWith('myidiframe', {
                        width: 200,
                        height: 100
                    });
                });
            });

            describe('when loading on desktop Safari', function () {
                beforeEach(function() {
                    siteData = {
                        os: {
                            osx: true
                        },
                        browser: {
                            safari: true
                        },
                        isViewerMode: function() { return true; },
                        rendererModel: {
                            clientSpecMap: {}
                        }
                    };
                });

                it('should patch iframe skin part size', function () {
                    tpaSectionPatcher.patchTPASection('myid', patchers, measureMap, flatStructure, siteData);
                    expect(patchers.css).not.toHaveBeenCalled();
                });
            });

            describe('when loading on desktop Chrome', function () {
                beforeEach(function() {
                    siteData = {
                        os: {
                            windows: true
                        },
                        browser: {
                            chrome: true
                        },
                        isViewerMode: function() { return true; },
                        rendererModel: {
                            clientSpecMap: {}
                        }
                    };
                });

                it('should patch iframe skin part size', function () {
                    tpaSectionPatcher.patchTPASection('myid', patchers, measureMap, flatStructure, siteData);
                    expect(patchers.css).not.toHaveBeenCalled();
                });
            });

            describe('full page app', function() {
                var mockSiteData;

                beforeEach(function() {
                    mockSiteData = testUtils.mockFactory.mockSiteData();

                    mockSiteData.isMobileView = jasmine.createSpy().and.returnValue(false);

                    mockSiteData.isViewerMode = jasmine.createSpy().and.returnValue(true);

                    mockSiteData.os = {};
                    mockSiteData.browser = {};

                    mockSiteData.rendererModel.clientSpecMap[2005] = {
                        appDefinitionId: 'appDefinitionId',
                        widgets: {
                            widget1: {
                                appPage: {

                                }
                            }
                        }
                    };

                    flatStructure.dataItem = {
                        widgetId: 'widget1',
                        applicationId : '2005'
                    };

                });

                it('should set full page style in case of full page component in desktop view', function() {
                    mockSiteData.rendererModel.clientSpecMap[2005].widgets.widget1.appPage.fullPage = true;
                    mockSiteData.isMobileView.and.returnValue(false);
                    var expectedCss = {};
                    expectedCss.position = 'fixed';
                    expectedCss.top = '0px';
                    expectedCss.left = '0px';
                    expectedCss.right = '0px';
                    expectedCss.bottom = '0px';

                    tpaSectionPatcher.patchTPASection('myid', patchers, measureMap, flatStructure, mockSiteData);
                    expect(patchers.css).toHaveBeenCalledWith('myid', expectedCss);
                });


                it('should return full page style in case of full page component in mobile view and show mobile ad is true', function() {
                    mockSiteData.rendererModel.clientSpecMap[2005].widgets.widget1.appPage.fullPage = true;
                    mockSiteData.isMobileView.and.returnValue(true);
                    measureMap.siteOffsetTop = 30;
                    var expectedCss = {};
                    expectedCss.position = 'fixed';
                    expectedCss.height = '470px';
                    expectedCss.minHeight = '470px';
                    expectedCss.top = '30px';
                    expectedCss.left = '0px';
                    expectedCss.right = '0px';
                    expectedCss.bottom = '0px';

                    tpaSectionPatcher.patchTPASection('myid', patchers, measureMap, flatStructure, mockSiteData);
                    expect(patchers.css).toHaveBeenCalledWith('myid', expectedCss);
                });

                it('should return full page style in case of full page component in mobile horizontal view and show mobile ad is false', function() {
                    mockSiteData.rendererModel.clientSpecMap[2005].widgets.widget1.appPage.fullPage = true;
                    mockSiteData.isMobileView.and.returnValue(true);
                    measureMap.siteOffsetTop = 0;
                    var expectedCss = {};
                    expectedCss.position = 'fixed';
                    expectedCss.height = '500px';
                    expectedCss.minHeight = '500px';
                    expectedCss.top = '0px';
                    expectedCss.left = '0px';
                    expectedCss.right = '0px';
                    expectedCss.bottom = '0px';

                    tpaSectionPatcher.patchTPASection('myid', patchers, measureMap, flatStructure, mockSiteData);
                    expect(patchers.css).toHaveBeenCalledWith('myid', expectedCss);
                });

                it('should do nothing in case of a widget that is not full page', function() {
                    mockSiteData.rendererModel.clientSpecMap[2005].widgets.widget1.appPage.fullPage = false;
                    mockSiteData.isMobileView.and.returnValue(false);

                    tpaSectionPatcher.patchTPASection('myid', patchers, measureMap, flatStructure, mockSiteData);
                    expect(patchers.css).not.toHaveBeenCalled();
                });


                it('should patch iframe skin part size according to mobile height', function () {
                    mockSiteData.os = {
                        ios: true
                    };
                    mockSiteData.browser = {
                        safari: true
                    };

                    mockSiteData.rendererModel.clientSpecMap[2005].widgets.widget1.appPage.fullPage = true;
                    mockSiteData.isMobileView.and.returnValue(true);

                    tpaSectionPatcher.patchTPASection('myid', patchers, measureMap, flatStructure, mockSiteData);
                    expect(patchers.css.calls.argsFor(1)).toEqual(['myidiframe', {
                        width: 200,
                        height: 500
                    }]);
                });

            });
        });
    });
});
