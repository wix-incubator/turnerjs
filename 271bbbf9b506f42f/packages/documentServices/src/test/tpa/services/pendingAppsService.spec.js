define(['documentServices/tpa/services/clientSpecMapService',
        'documentServices/tpa/services/pendingAppsService',
        'documentServices/siteMetadata/siteMetadata',
        'documentServices/mockPrivateServices/privateServicesHelper'], function (clientSpecMapService, pendingAppsService, siteMetadata, privateServicesHelper) {
    'use strict';

    describe('Pending apps service', function () {
        var mockPs;

        beforeEach(function() {
            mockPs = privateServicesHelper.mockPrivateServices();
        });

        afterEach(function () {
            //remove state
            pendingAppsService.onSave();
        });

        it('should count as a pending app if it has a truthy requiresEditorComponent and it is an hybrid app', function() {
            var mockSpecMap = {
                1: {
                    requiresEditorComponent: true,
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                    applicationId: 18,
                    widgets: {
                        "13abbbcd-6e26-ed44-6976-5e1db235b0e5": {
                            "widgetId": "13abbbcd-6e26-ed44-6976-5e1db235b0e5"
                        }
                    }
                }
            };
            spyOn(clientSpecMapService, 'isHybridApp').and.returnValue(true);
            spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockSpecMap);

            var pendingCount = pendingAppsService.getPendingAppsCount(mockPs);
            expect(pendingAppsService.isPending(mockPs, mockSpecMap[1])).toBeTruthy();
            expect(pendingCount).toBe(1);
        });

        it('should not count as a pending app if it has a truthy requiresEditorComponent it is not an hybrid app', function() {
            var mockSpecMap = {
                1: {
                    requiresEditorComponent: true,
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                    applicationId: 18,
                    widgets: {
                        "13abbbcd-6e26-ed44-6976-5e1db235b0e5": {
                            "widgetUrl": "https://dl.dropboxusercontent.com/u/262669197/WidgetJSON.html"
                        }
                    }
                }
            };
            spyOn(clientSpecMapService, 'isHybridApp').and.returnValue(false);
            spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockSpecMap);

            var pendingCount = pendingAppsService.getPendingAppsCount(mockPs);
            expect(pendingAppsService.isPending(mockPs, mockSpecMap[1])).not.toBeTruthy();
            expect(pendingCount).toBe(0);
        });

        it('should NOT count as a pending app if requiresEditorComponent is undefined', function() {
            var mockSpecMap = {
                1: {
                    sectionUrl: "http://localhost/section"
                }
            };

            spyOn(clientSpecMapService, 'isHybridApp').and.returnValue(true);
            spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockSpecMap);

            var pendingCount = pendingAppsService.getPendingAppsCount(mockPs);
            expect(pendingCount).toBe(0);
        });

        it('should filter out dismiss apps from pending count', function() {
            var mockSpecMap = {
                1: {
                    requiresEditorComponent: true,
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                    applicationId: 18,
                    widgets: {
                        "13abbbcd-6e26-ed44-6976-5e1db235b0e5": {
                            "widgetUrl": "https://dl.dropboxusercontent.com/u/262669197/WidgetJSON.html"
                        }
                    }
                },
                2: {
                    requiresEditorComponent: true,
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c52",
                    applicationId: 18,
                    widgets: {
                        "13abbbcd-6e26-ed44-6976-5e1db235b0e5": {
                            "widgetUrl": "https://dl.dropboxusercontent.com/u/262669197/WidgetJSON.html"
                        }
                    }
                }
            };

            spyOn(clientSpecMapService, 'isHybridApp').and.returnValue(true);
            spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockSpecMap);

            pendingAppsService.dismiss(mockPs, mockSpecMap[1].appDefinitionId);
            var pendingCount = pendingAppsService.getPendingAppsCount(mockPs);
            expect(pendingCount).toBe(1);
        });

        describe('is Pending', function () {
            it('should support passing undefined private services', function() {
                var mockSpecMap = {
                    1: {
                        requiresEditorComponent: true,
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        applicationId: 18,
                        widgets: {
                            "13abbbcd-6e26-ed44-6976-5e1db235b0e5": {
                                "widgetId": "13abbbcd-6e26-ed44-6976-5e1db235b0e5"
                            }
                        }
                    }
                };
                spyOn(clientSpecMapService, 'isHybridApp').and.returnValue(true);
                spyOn(clientSpecMapService, 'isHybridAppFromAppData').and.returnValue(true);
                spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockSpecMap);

                var pendingCount = pendingAppsService.getPendingAppsCount(mockPs);
                expect(pendingAppsService.isPending(undefined, mockSpecMap[1])).toBeTruthy();
                expect(pendingCount).toBe(1);
            });
        });

        describe('premium pending', function () {
            var app1 = {
                "appDefId": "1397817e-3428-11c5-6751-79acf34f2f34",
                "applicationId": 7,
                "vendorProductId": "Premium1"
            };
            var app2 = {
                "appDefId": "12bdee78-5f95-6247-38ed-ebc1601a8dcd",
                "applicationId": 8,
                "vendorProductId": "Tint"
            };

            var app3 = {
                "appDefId": "12bdce78-5f95-6247-38ed-ebc1601a8dca",
                "applicationId": 9
            };

            var data = [app1, app2, app3];

            beforeEach(function() {
                spyOn(siteMetadata, "getProperty").and.returnValue(data);
            });

            it('should get premium pending apps from site meta data', function () {
                var apps = pendingAppsService.getPremiumPendingApps();
                expect(apps).toContain([app1, app2]);
            });

            it('should validate premium pending apps from site meta data', function () {
                var apps = pendingAppsService.getPremiumPendingApps();
                expect(apps).not.toContain(app3);
            });

            it('should omit installed apps', function () {
                var mockSpecMap = {
                    1: {
                        dashboardUrl: "http://localhost/hybrid",
                        requiresEditorComponent: true,
                        appDefinitionId: "1397817e-3428-11c5-6751-79acf34f2f34" +
                        "" +
                        "",
                        applicationId: 7,
                        widgets: {
                            "13abbbcd-6e26-ed44-6976-5e1db235b0e5": {
                                "widgetUrl": "https://dl.dropboxusercontent.com/u/262669197/WidgetJSON.html",
                                "widgetId": "13abbbcd-6e26-ed44-6976-5e1db235b0e5",
                                "refreshOnWidthChange": true,
                                "mobileUrl": "https://dl.dropboxusercontent.com/u/262669197/WidgetJSON.html",
                                "published": true,
                                "mobilePublished": false,
                                "seoEnabled": true,
                                "defaultWidth": 500,
                                "defaultHeight": 500,
                                "defaultShowOnAllPages": false,
                                "settings": {
                                    "height": 750,
                                    "width": 600,
                                    "url": "https://dl.dropboxusercontent.com/u/262669197/WidgetJSON.html"
                                }
                            }
                        }
                    }
                };
                spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockSpecMap);

                var apps = pendingAppsService.getPremiumPendingApps();
                expect(apps).not.toContain(app1);
            });
        });

        describe('pending apps from meta data', function () {
            var siteMetaData;
            beforeEach(function () {
                siteMetaData = [
                    {
                        appDefId: "135aad86-9125-6074-7346-29dc6a3c9bcf",
                        applicationId: 6,
                        reason: 'HybridAppEditorMissing'
                    },
                    {
                        appDefId: "134139f3-f2a0-2c2c-693c-ed22165cfd84",
                        applicationId: 8,
                        vendorProductId: "Premium1",
                        reason: "Premium"
                    },
                    {
                        appDefId: "134139f3-f2a0-2c2c-693c-ed22165cfd84",
                        applicationId: 8,
                        vendorProductId: "Premium1",
                        reason: 'Premium'
                    },
                    {
                        appDefId: "134139f3-f2a0-2c2c-693c-ed22165cfd89",
                        applicationId: 9,
                        vendorProductId: 'Premium9',
                        reason: 'Premium'
                    },
                    {
                        appDefId: "134139f3-f2a0-2c2c-693c-ed22165cfd84",
                        applicationId: 12,
                        reason: "Premium"
                    }
                ];
                spyOn(siteMetadata, "getProperty").and.returnValue(siteMetaData);
            });
            it('should get pending apps', function () {
                var apps = pendingAppsService.getPendingAppsFromSiteMetaData();
                expect(apps).toEqual([
                    {
                        appDefId: "135aad86-9125-6074-7346-29dc6a3c9bcf",
                        applicationId: 6,
                        reason: 'HybridAppEditorMissing'
                    },
                    {
                        appDefId: "134139f3-f2a0-2c2c-693c-ed22165cfd84",
                        applicationId: 8,
                        vendorProductId: "Premium1",
                        reason: "Premium"
                    },
                    {
                        appDefId: "134139f3-f2a0-2c2c-693c-ed22165cfd89",
                        applicationId: 9,
                        vendorProductId: 'Premium9',
                        reason: 'Premium'
                    }
                ]);
            });

            it('should filter out session dismissed', function () {
                pendingAppsService.dismiss(mockPs, siteMetaData[0].appDefId);
                var apps = pendingAppsService.getPendingAppsFromSiteMetaData();
                expect(apps).toEqual([
                    {
                        appDefId: "134139f3-f2a0-2c2c-693c-ed22165cfd84",
                        applicationId: 8,
                        vendorProductId: "Premium1",
                        reason: "Premium"
                    },
                    {
                        appDefId: "134139f3-f2a0-2c2c-693c-ed22165cfd89",
                        applicationId: 9,
                        vendorProductId: 'Premium9',
                        reason: 'Premium'
                    }
                ]);
            });

            it('should isPremiumPendingApp', function () {
                expect(pendingAppsService.isPremiumPendingApp(mockPs, 8)).toBeTruthy();
                expect(pendingAppsService.isPremiumPendingApp(mockPs, 10)).toBeFalsy();
                expect(pendingAppsService.isPremiumPendingApp(mockPs, 12)).toBeTruthy();
            });

            it('should add a pending app', function () {
                var pendingAppCount = pendingAppsService.getPendingAppsFromSiteMetaData(mockPs).length;

                pendingAppsService.addPendingDashboardApp(mockPs, '123-456');

                var newPendingAppCount = pendingAppsService.getPendingAppsFromSiteMetaData(mockPs).length;
                expect(newPendingAppCount).toEqual(pendingAppCount + 1);
            });

            it('should not add a pending app when appdefId is invalid', function () {
                var pendingAppCount = pendingAppsService.getPendingAppsFromSiteMetaData(mockPs).length;

                pendingAppsService.addPendingDashboardApp(mockPs, '');
                pendingAppsService.addPendingDashboardApp(mockPs, null);
                pendingAppsService.addPendingDashboardApp(mockPs, undefined);

                var newPendingAppCount = pendingAppsService.getPendingAppsFromSiteMetaData(mockPs).length;
                expect(newPendingAppCount).toEqual(pendingAppCount);
            });

            it('should remove a pending app', function () {
                var appDefId = 'fake-id-123123';
                var pendingAppCount = pendingAppsService.getPendingAppsFromSiteMetaData(mockPs).length;

                pendingAppsService.addPendingDashboardApp(mockPs, appDefId);
                pendingAppsService.dismiss(mockPs, appDefId);

                var newPendingAppCount = pendingAppsService.getPendingAppsFromSiteMetaData(mockPs).length;
                expect(newPendingAppCount).toEqual(pendingAppCount);
            });

            it('should ignore dismiss request if app was added', function () {
                var appDefId = '123-456';
                pendingAppsService.add({
                    appDefinitionId: appDefId
                });
                pendingAppsService.dismiss(mockPs, appDefId);

                expect(pendingAppsService.getAppsToDismiss().length).toEqual(0);
            });

            it('should remove dismiss app when the same app is added', function () {
                var appDefId = '123-456';
                pendingAppsService.dismiss(mockPs, appDefId);
                pendingAppsService.add({
                    appDefinitionId: appDefId
                });
                expect(pendingAppsService.getAppsToDismiss().length).toEqual(0);
            });
        });
    });
});
