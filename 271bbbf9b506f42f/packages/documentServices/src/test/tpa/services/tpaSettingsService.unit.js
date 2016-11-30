define(['lodash',
        'tpa',
        'utils',
        'testUtils',
        'documentServices/tpa/services/tpaSettingsService',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/tpa/services/clientSpecMapService',
        'documentServices/siteMetadata/siteMetadata'
], function(_, tpa, utils, testUtils, tpaSettingsService, privateServicesHelper, clientSpecMapService, siteMetadata) {
    'use strict';

    describe('tpaSettingsService', function () {
        var mockPs;

        describe('getSettingsModalParams', function(){
            var mockCompId, mockInstance, mockUrlParams, mockPanelParams;

            beforeEach(function() {
                mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL();
                mockCompId = 'lo789';
                mockInstance = '123';
                mockUrlParams = {
                    origCompId: '12mk34',
                    deviceType: 'desktop',
                    url: 'http://mySite.com',
                    origin: 'gfpp_productPage'
                };
                mockPanelParams = {};
                spyOn(clientSpecMapService, 'getAppData').and.returnValue({instance: mockInstance});
                spyOn(utils.guidUtils, 'getUniqueId').and.returnValue(mockCompId);

                siteMetadata.setProperty(mockPs, siteMetadata.PROPERTY_NAMES.LANGUAGE_CODE, 'fr');
            });

            it('should build url with the given params', function(){
                var expectedUrlParams = {
                    locale: 'fr',
                    origCompId: mockUrlParams.origCompId,
                    compId: mockCompId,
                    deviceType: mockUrlParams.deviceType,
                    viewMode: 'editor',
                    instance: mockInstance,
                    origin: 'gfpp_productPage'
                };

                var settingsModalParams = tpaSettingsService.getSettingsModalParams(mockPs, mockUrlParams, mockPanelParams);

                _.forEach(expectedUrlParams, function(expectedValue, expectedParam){
                    expect(settingsModalParams.url).toContain(expectedParam + '=' + expectedValue);
                });
                expect(settingsModalParams.url).toStartWith(mockUrlParams.url);
            });

            it('should add a compId', function(){
                var settingsModalParams = tpaSettingsService.getSettingsModalParams(mockPs, mockUrlParams, mockPanelParams);
                expect(settingsModalParams.compId).toBe(mockCompId);
            });

            it('should have default title if none exists', function(){
                var settingsModalParams = tpaSettingsService.getSettingsModalParams(mockPs, mockUrlParams, mockPanelParams);
                expect(settingsModalParams.title).toBe('');
            });

            it('should not add origin to url if null', function(){
                mockUrlParams.origin = null;

                var settingsModalParams = tpaSettingsService.getSettingsModalParams(mockPs, mockUrlParams, mockPanelParams);

                expect(settingsModalParams.url).not.toContain('origin=');
            });

            it('should not add origin to url if empty', function(){
                mockUrlParams.origin = '';

                var settingsModalParams = tpaSettingsService.getSettingsModalParams(mockPs, mockUrlParams, mockPanelParams);

                expect(settingsModalParams.url).not.toContain('origin=');
            });

            it('should not add origin to url if not specified', function(){
                delete mockUrlParams.origin;

                var settingsModalParams = tpaSettingsService.getSettingsModalParams(mockPs, mockUrlParams, mockPanelParams);

                expect(settingsModalParams.url).not.toContain('origin=');
            });
        });

        describe("getSettingsUrl", function() {
            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData();
                mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
            });

            var origCompId = "origId";
            var compId = "compId";

            it("should get the base end point from the main app data", function() {
                var appData = {
                    settingsUrl: "https://settings.html",
                    settingsWidth: "500",
                    instance: "123"
                };

                var params = {
                    instance: appData.instance,
                    locale: 'fr',
                    origCompId: origCompId
                };

                siteMetadata.setProperty(mockPs, siteMetadata.PROPERTY_NAMES.LANGUAGE_CODE, 'fr');

                spyOn(clientSpecMapService, 'getAppData').and.returnValue(appData);

                var url = tpaSettingsService.getSettingsUrl(mockPs, "15", "123", origCompId, compId);

                expect(url).toContain(appData.settingsUrl);

                _.forEach(params, function (val, key) {
                    expect(url).toContain(key + '=' + val);
                });
            });

            it("should get the base end point from the widget data", function() {
                var appData = {
                    settingsUrl: "https://settings.html",
                    settingsWidth: "500",
                    instance: "123",
                    widgets: {
                        "1" :{
                            settings : {
                                url: "https://settings.html"
                            },
                            settingsWidth: "500"
                        }
                    }
                };

                var params = {
                    instance: appData.instance,
                    locale: 'en',
                    origCompId: origCompId
                };


                spyOn(clientSpecMapService, "getAppData").and.returnValue(appData);

                var url = tpaSettingsService.getSettingsUrl(mockPs, "15", "1", origCompId, compId);

                expect(url).toContain(appData.widgets["1"].settings.url);

                _.forEach(params, function (val, key) {
                    expect(url).toContain(key + '=' + val);
                });
            });

            it("should get the base end point from the main app data if the widgets has no extesions", function() {
                var appData = {
                    settingsUrl: "https://settings.html",
                    settingsWidth: "500",
                    instance: "123",
                    widgets: {
                        "1" :{
                            settings : {
                                url: "https://settings.html"
                            },
                            settingsWidth: "500"
                        }
                    }
                };

                var params = {
                    instance: appData.instance,
                    locale: 'en',
                    origCompId: origCompId
                };


                spyOn(clientSpecMapService, "getAppData").and.returnValue(appData);

                var url = tpaSettingsService.getSettingsUrl(mockPs, "15", "1", origCompId, compId);

                expect(url).toContain(appData.settingsUrl);

                _.forEach(params, function (val, key) {
                    expect(url).toContain(key + '=' + val);
                });
            });

            it("should get the base end point from the main app data if the widget has no settings data", function() {
                var appData = {
                    settingsUrl: "https://settings.html",
                    settingsWidth: "500",
                    instance: "123",
                    widgets: {
                        "1" :{
                        }
                    }
                };

                var params = {
                    instance: appData.instance,
                    locale: 'en',
                    origCompId: origCompId
                };


                spyOn(clientSpecMapService, "getAppData").and.returnValue(appData);

                var url = tpaSettingsService.getSettingsUrl(mockPs, "15", "1", origCompId, compId);

                expect(url).toContain(appData.settingsUrl);

                _.forEach(params, function (val, key) {
                    expect(url).toContain(key + '=' + val);
                });
            });

            it('should add EndpointType to url', function () {
                var appData = {
                    settingsUrl: "https://settings.html",
                    settingsWidth: "500",
                    instance: "123",
                    widgets: {
                        "1" :{
                        }
                    }
                };

                var params = {
                    instance: appData.instance,
                    locale: 'en',
                    origCompId: origCompId,
                    endpointType: 'settings',
                    width: 500
                };


                spyOn(clientSpecMapService, "getAppData").and.returnValue(appData);

                var url = tpaSettingsService.getSettingsUrl(mockPs, "15", "1", origCompId);
                _.forEach(params, function (val, key) {
                    expect(url).toContain(key + '=' + val);
                });
            });

            it('should apply width according to the options given', function(){
                var appData = {
                    settingsUrl: "https://settings.html",
                    settingsWidth: "500",
                    instance: "123",
                    widgets: {
                        "1" :{
                            settings: {
                                version: 2,
                                languages: ['ko']
                            }
                        }
                    }
                };
                var options = {
                    width: '426'
                };
                spyOn(clientSpecMapService, "getAppData").and.returnValue(appData);

                var url = tpaSettingsService.getSettingsUrl(mockPs, "15", "1", origCompId, options);

                expect(url).toContain('width=426');
            });

            it('should apply width according to the app data if option that was given was undefined', function(){
                var appData = {
                    settingsUrl: "https://settings.html",
                    settingsWidth: "500",
                    instance: "123",
                    widgets: {
                        "1" :{
                            settings: {
                                version: 2,
                                languages: ['ko']
                            }
                        }
                    }
                };
                var options = {
                    width: undefined
                };
                spyOn(clientSpecMapService, "getAppData").and.returnValue(appData);

                var url = tpaSettingsService.getSettingsUrl(mockPs, "15", "1", origCompId, options);

                expect(url).toContain('width=500');
            });

            it('should get the base end point from the widget data version 2 when options passes a truthy new version flag', function(){
                var appData = {
                    settingsUrl: "https://settings.html",
                    settingsWidth: "500",
                    instance: "123",
                    widgets: {
                        "1" :{
                            settings: {
                                version:1,
                                languages: ['ko'],
                                url: 'https://settingsOld.html',
                                urlV2: 'https://settingsNew.html'
                            }
                        }
                    }
                };
                var options = {
                    isNewVersion: true
                };
                spyOn(clientSpecMapService, "getAppData").and.returnValue(appData);

                var url = tpaSettingsService.getSettingsUrl(mockPs, "15", "1", origCompId, options);

                expect(url).toContain(appData.widgets[1].settings.urlV2);
            });

            it('should get the base end point from the widget data original version when options passes a falsy new version flag', function(){
                var appData = {
                    settingsUrl: "https://settings.html",
                    settingsWidth: "500",
                    instance: "123",
                    widgets: {
                        "1" :{
                            settings: {
                                version: 2,
                                languages: ['ko'],
                                url: 'https://settingsOld.html',
                                urlV2: 'https://settingsNew.html'
                            }
                        }
                    }
                };
                var options = {
                    isNewVersion: false
                };
                spyOn(clientSpecMapService, "getAppData").and.returnValue(appData);

                var url = tpaSettingsService.getSettingsUrl(mockPs, "15", "1", origCompId, options);

                expect(url).toContain(appData.widgets[1].settings.url);
            });

            it('should get the base end point from the widget data original version when no options were supplied', function(){
                var appData = {
                    settingsUrl: "https://settings.html",
                    settingsWidth: "500",
                    instance: "123",
                    widgets: {
                        "1" :{
                            settings: {
                                version: 2,
                                languages: ['ko'],
                                url: 'https://settingsOld.html',
                                urlV2: 'https://settingsNew.html'
                            }
                        }
                    }
                };
                spyOn(clientSpecMapService, "getAppData").and.returnValue(appData);

                var url = tpaSettingsService.getSettingsUrl(mockPs, "15", "1", origCompId, undefined);

                expect(url).toContain(appData.widgets[1].settings.url);
            });
        });
    });
});
