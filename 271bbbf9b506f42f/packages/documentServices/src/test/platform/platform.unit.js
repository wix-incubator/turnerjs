define([
    'lodash',
    'testUtils',
    'documentServices/platform/platform',
    'documentServices/platform/services/workerService',
    'documentServices/siteMetadata/clientSpecMap',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (
    _,
    testUtils,
    platform,
    workerService,
    clientSpecMap,
    clientSpecMapService,
    privateServicesHelper
) {
    'use strict';
    describe('platform', function () {
        var ps;
        var mockAppsData = {
            18: {
                appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                appDefinitionName: "LiveChat",
                applicationId: 18,
                instance: "1234",
                type: "livechat",
                widgets: {}
            },
            19: {
                appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                appDefinitionName: "Dropifi Contact Widget",
                applicationId: 19,
                instance: "1234",
                type: "dropifi",
                widgets: {}
            },
            20: {
                appDefinitionId: "1911c9da-51ef-f7ae-2576-3704c9c08c59",
                appDefinitionName: "WixCode",
                applicationId: 20,
                instance: "1234",
                editorUrl: "http://www.wixcodeappurl.com",
                type: "siteextension",
                widgets: {}
            },
            21: {
                appDefinitionId: "1011c9da-51ef-f7ae-2576-3704c9c08c53",
                appDefinitionName: "Data binding",
                applicationId: 21,
                instance: "1234",
                editorUrl: "http://www.databindingurl.com",
                type: "siteextension",
                widgets: {}
            }

        };

        beforeAll(function () {
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
            testUtils.experimentHelper.openExperiments('sv_platform1');
        });

        afterAll(function () {
            testUtils.experimentHelper.closeExperiments('sv_platform1');
        });

        xdescribe('initApp', function () { // TODO: enable/replace once platform apps provision flow has been decided
            beforeEach(function () {
                spyOn(clientSpecMap, "getAppDataByAppDefinitionId").and.callFake(function(privateServices, appDefId) {
                    return _.find(mockAppsData, {appDefinitionId: appDefId});
                });
                spyOn(workerService, 'addApp');
            });

            describe('appDefinitionId is in clientSpecMap', function () {
                it('should call workerService.addApp method with applicationId and appUrl', function () {
                    platform.initApp(ps, '1911c9da-51ef-f7ae-2576-3704c9c08c59');
                    expect(workerService.addApp).toHaveBeenCalledWith({
                        id: 20,
                        url: 'http://www.wixcodeappurl.com'
                    });
                });
            });
            describe('appDefinitionId is NOT in clientSpecMap', function () {
                it('should throw', function () {
                    expect(callWithBadAppDefId).toThrow();
                    expect(workerService.addApp).not.toHaveBeenCalled();

                    function callWithBadAppDefId() {
                        platform.initApp(ps, '9292929292929292912');
                    }
                });
            });
        });

        describe('init', function () {
           it('should initialize base path in site data', function () {
               var emptyPlatformData = {
                   appState: {},
                   appManifest: {}
               };
               platform.init(ps, {});

               var platformSiteData = ps.dal.full.getByPath(['platform']);
               expect(platformSiteData).toEqual(emptyPlatformData);
           });
        });

        xdescribe('initialize', function () {
            describe('platform apps exist in clientSpecMap', function () {
                beforeEach(function () {
                    spyOn(workerService, 'init');
                    spyOn(clientSpecMap, "filterAppsDataByType").and.callFake(function() {
                        return _.filter(mockAppsData, {type: 'siteextension'});
                    });
                    spyOn(workerService, 'addApps');
                });
                it('should call workerService.addApps method with array of {applicationId, appUrl}', function () {
                    platform.initialize(ps);
                    expect(workerService.addApps).toHaveBeenCalledWith(ps, [
                        {
                            id: mockAppsData[20].applicationId,
                            url: mockAppsData[20].editorUrl
                        },
                        {
                            id: mockAppsData[21].applicationId,
                            url: mockAppsData[21].editorUrl
                        }
                    ]);
                });
            });
            describe('no platform apps in clientSpecMap', function () {
                beforeEach(function () {
                    spyOn(clientSpecMap, "filterAppsDataByType").and.returnValue([]);
                    spyOn(workerService, 'addApps');
                });
                it('should not call workerService.addApps', function () {
                    platform.initialize(ps);
                    expect(workerService.addApps).not.toHaveBeenCalled();
                });
            });
        });

        describe('notifyApplication', function () {
            beforeEach(function () {
                spyOn(workerService, 'triggerEvent').and.callThrough();
            });

            it('should call workerService.triggerEvent with the same appId and options', function () {
                var appId = 'appId';
                var options = {};
                platform.notifyApplication(ps, appId, options);
                expect(workerService.triggerEvent).toHaveBeenCalledWith(appId, options);
            });
        });

        describe('updatePagePlatformApps', function () {

            describe('when the value is truthy', function() {
                it('should add the given application to pagesPlatformApps', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var pageId = siteData.getPrimaryPageId();
                    var appId = 'appId';

                    var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    platform.init(mockPS);
                    var pageRef = mockPS.pointers.page.getPagePointer(pageId);

                    platform.updatePagePlatformApp(mockPS, pageRef, appId, true);

                    expect(siteData.isPlatformAppOnPage(pageId, appId)).toBeTruthy();
                });

                it('should not touch other page applications', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var pageId = siteData.getPrimaryPageId();
                    var appId = 'appId';
                    var otherAppId = 'otherAppId';
                    var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    platform.init(mockPS);
                    var pageRef = mockPS.pointers.page.getPagePointer(pageId);

                    platform.updatePagePlatformApp(mockPS, pageRef, appId, true);
                    platform.updatePagePlatformApp(mockPS, pageRef, otherAppId, true);

                    expect(siteData.isPlatformAppOnPage(pageId, appId)).toBeTruthy();
                    expect(siteData.isPlatformAppOnPage(pageId, otherAppId)).toBeTruthy();
                });

                it('should not touch applications in other pages', function () {
                    var firstPage = 'page1';
                    var secondPage = 'page2';
                    var appId = 'appId';
                    var otherAppId = 'otherAppId';
                    var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(firstPage).addPageWithDefaults(secondPage);
                    var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    platform.init(mockPS);
                    var firstPageRef = mockPS.pointers.page.getPagePointer(firstPage);
                    var secondPageRef = mockPS.pointers.page.getPagePointer(secondPage);

                    platform.updatePagePlatformApp(mockPS, firstPageRef, appId, true);
                    platform.updatePagePlatformApp(mockPS, secondPageRef, otherAppId, true);
                    platform.updatePagePlatformApp(mockPS, secondPageRef, appId, true);

                    expect(siteData.isPlatformAppOnPage(firstPage, appId)).toBeTruthy();
                    expect(siteData.isPlatformAppOnPage(secondPage, otherAppId)).toBeTruthy();
                    expect(siteData.isPlatformAppOnPage(secondPage, appId)).toBeTruthy();
                });
            });

            describe('when the value is falsy', function() {
                it('should remove the given application from pagesPlatformApps', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var pageId = siteData.getPrimaryPageId();
                    var appId = 'appId';

                    var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    platform.init(mockPS);
                    var pageRef = mockPS.pointers.page.getPagePointer(pageId);

                    platform.updatePagePlatformApp(mockPS, pageRef, appId, true);
                    platform.updatePagePlatformApp(mockPS, pageRef, appId, false);

                    expect(siteData.isPlatformAppOnPage(pageId, appId)).toBeFalsy();
                });

                it('should not touch other page applications', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var pageId = siteData.getPrimaryPageId();
                    var appId = 'appId';
                    var otherAppId = 'otherAppId';
                    var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    platform.init(mockPS);
                    var pageRef = mockPS.pointers.page.getPagePointer(pageId);

                    platform.updatePagePlatformApp(mockPS, pageRef, appId, true);
                    platform.updatePagePlatformApp(mockPS, pageRef, otherAppId, true);
                    platform.updatePagePlatformApp(mockPS, pageRef, appId, false);

                    expect(siteData.isPlatformAppOnPage(pageId, appId)).toBeFalsy();
                    expect(siteData.isPlatformAppOnPage(pageId, otherAppId)).toBeTruthy();
                });

                it('should not touch applications in other pages', function () {
                    var firstPage = 'page1';
                    var secondPage = 'page2';
                    var appId = 'appId';
                    var otherAppId = 'otherAppId';
                    var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(firstPage).addPageWithDefaults(secondPage);
                    var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    platform.init(mockPS);
                    var firstPageRef = mockPS.pointers.page.getPagePointer(firstPage);
                    var secondPageRef = mockPS.pointers.page.getPagePointer(secondPage);

                    platform.updatePagePlatformApp(mockPS, firstPageRef, appId, true);
                    platform.updatePagePlatformApp(mockPS, secondPageRef, otherAppId, true);
                    platform.updatePagePlatformApp(mockPS, secondPageRef, appId, true);
                    platform.updatePagePlatformApp(mockPS, firstPageRef, appId, false);

                    expect(siteData.isPlatformAppOnPage(firstPage, appId)).toBeFalsy();
                    expect(siteData.isPlatformAppOnPage(secondPage, otherAppId)).toBeTruthy();
                    expect(siteData.isPlatformAppOnPage(secondPage, appId)).toBeTruthy();
                });
            });
        });

        describe('getDataByAppDefId', function () {
            beforeEach(function () {
                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.callThrough();
                spyOn(clientSpecMapService, 'getAppData').and.callThrough();
            });

            it('should get app data form clientSpecMapService from appDefId', function () {
                platform.getAppDataByAppDefId(ps, 'appDefId');
                expect(clientSpecMapService.getAppDataByAppDefinitionId).toHaveBeenCalledWith(ps, 'appDefId');

            });
        });

        describe('getDataByApplicationId', function () {
            beforeEach(function () {
                spyOn(clientSpecMapService, 'getAppData').and.callThrough();
            });

            it('should get app data form clientSpecMapService', function () {
                platform.getAppDataByApplicationId(ps, 1234);
                expect(clientSpecMapService.getAppData).toHaveBeenCalledWith(ps, 1234);

            });
        });
    });
});
