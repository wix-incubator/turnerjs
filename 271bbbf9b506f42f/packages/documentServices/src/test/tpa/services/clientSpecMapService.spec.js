define(['lodash',
        'documentServices/siteMetadata/siteMetadata',
        'documentServices/siteMetadata/clientSpecMap',
        'documentServices/tpa/services/clientSpecMapService',
        'documentServices/mockPrivateServices/privateServicesHelper'],
    function (_, metaData, clientSpecMap, clientSpecMapService, privateServicesHelper) {
        'use strict';

        describe('clientSpecMap service', function () {
            var mockPs;
            var mockAppsData = {
                18: {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    appType: "Editor",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {}
                },
                19: {
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                    appDefinitionName: "Dropifi Contact Widget",
                    appType: "Hybrid",
                    vendorProducts: ['foo'],
                    applicationId: 19,
                    instance: "1234",
                    dashboardUrl: "ww.dashboard.com",
                    widgets: {
                        11: {
                            published: true,
                            autoAddToSite: true
                        },
                        12: {
                            published: true,
                            appPage: {
                                id: 2
                            }
                        }
                    }
                },
                22: {
                    appDefinitionId: "1311c9da-51ef-f7ae-aaaa-3704c9c08c51",
                    appDefinitionName: "Dropifi Contact Widget",
                    appType: "Hybrid",
                    applicationId: 22,
                    instance: "1234",
                    dashboardUrl: "ww.dashboard.com",
                    autoAddToSite: true,
                    vendorProducts: [],
                    widgets: {
                        11: {
                            published: false,
                            autoAddToSite: true
                        },
                        12: {
                            published: false,
                            appPage: {
                                id: 3
                            }
                        }
                    }
                },
                23: {
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                    appDefinitionName: "Dropifi Contact Widget",
                    applicationId: 23,
                    appType: "Hybrid",
                    instance: "1234",
                    dashboardUrl: "ww.dashboard.com",
                    vendorProducts: null,
                    widgets: {
                        11: {
                            published: true,
                            autoAddToSite: true
                        },
                        12: {
                            published: true
                        }
                    }
                },
                24: {
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                    appDefinitionName: "Dropifi Contact Widget",
                    applicationId: 24,
                    appType: "Hybrid",
                    instance: "1234",
                    dashboardUrl: "ww.dashboard.com",
                    vendorProducts: null,
                    widgets: {
                        11: {
                            published: true,
                            autoAddToSite: true
                        },
                        12: {
                            published: true
                        }
                    }
                }

            };

            beforeEach(function () {
                mockPs = privateServicesHelper.mockPrivateServices();
            });

            describe("test getLargestApplicationId", function() {
                it("should return 0 if there are no apps", function() {
                    spyOn(metaData, "getProperty").and.returnValue({});

                    expect(clientSpecMapService.getLargestApplicationId()).toEqual(0);
                });

                it("should return the larfest largest application id", function() {
                    spyOn(metaData, "getProperty").and.returnValue(mockAppsData);
                    expect(clientSpecMapService.getLargestApplicationId()).toEqual(24);
                });
            });

            describe("Manipulate app data", function(){
                beforeEach(function(){
                    spyOn(metaData, "getProperty").and.returnValue(mockAppsData);
                    spyOn(metaData, "setProperty").and.callFake(function(ps, property, newAppsData){
                        mockAppsData = newAppsData;
                    });
                });

                describe("test getWidgetData", function() {
                   it("should return an empty object if widgets is not defined", function(){
                        mockAppsData[21] = {
                            appDefinitionId: "1311c9da-51ef-f7ae-2576",
                            appDefinitionName: "New widget",
                            applicationId: 21,
                            instance: "123455555"
                        };

                       expect(clientSpecMapService.getWidgetData(null, "21", '111')).toEqual(null);

                   });

                    it("should return an empty object if widget is an empty object", function(){
                        mockAppsData[22] = {
                            appDefinitionId: "1311c9da-51ef-f7ae-2576",
                            appDefinitionName: "New widget",
                            applicationId: 21,
                            instance: "123455555",
                            widgets: {}
                        };

                        expect(clientSpecMapService.getWidgetData(null, "22", '111')).toEqual(null);
                    });

                    it("should return an empty object if the application id is not exists", function () {
                        expect(clientSpecMapService.getWidgetData(null, "23", '111')).toEqual(null);
                    });


                    it("should return an empty object if the widget id is not exists", function () {
                        mockAppsData[22] = {
                            appDefinitionId: "1311c9da-51ef-f7ae-2576",
                            appDefinitionName: "New widget",
                            applicationId: 21,
                            instance: "123455555",
                            widgets: {
                                222: {
                                    widgetId: "222"
                                },
                                333: {
                                    widgetId: "333"
                                }
                            }
                        };

                        expect(clientSpecMapService.getWidgetData(null, "22", '111')).toEqual(null);
                    });

                    it("should return an object containing widget data", function(){
                        mockAppsData[22] = {
                            appDefinitionId: "1311c9da-51ef-f7ae-2576",
                            appDefinitionName: "New widget",
                            applicationId: 21,
                            instance: "123455555",
                            widgets: {
                                222: {
                                    widgetId: "222"
                                },
                                333: {
                                    widgetId: "333"
                                }
                            }
                        };

                        expect(clientSpecMapService.getWidgetData(null, "22", '222')).toEqual(mockAppsData[22].widgets['222']);
                    });
                });
            });

            describe('isHybridApp/ isHybridAppFromAppData', function() {
                it('should return false when no applicationId is supplied', function() {
                    expect(clientSpecMapService.isHybridApp()).toBeFalsy();
                });

                it('should return false when no appData is supplied', function() {
                    expect(clientSpecMapService.isHybridAppFromAppData()).toBeFalsy();
                });

                it('should return false when has no appType', function() {
                    var mockAppDataTest = {
                        18: {
                            appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                            applicationId: 18,
                            widgets: {
                                222: {
                                    mobilePublished: true,
                                    mobileUrl: "http://hotels.wix.com/search-widget-mobile.html",
                                    published: true
                                }
                            }
                        }
                    };
                    spyOn(metaData, "getProperty").and.returnValue(mockAppDataTest);
                    expect(clientSpecMapService.isHybridApp({}, 18)).toBeFalsy();
                    expect(clientSpecMapService.isHybridAppFromAppData(mockAppDataTest)).toBeFalsy();
                });

                it('should return true when appType is Hybrid', function() {
                    var mockAppDataTest = {
                        18: {
                            appType: 'Hybrid'
                        }
                    };
                    spyOn(metaData, "getProperty").and.returnValue(mockAppDataTest);
                    expect(clientSpecMapService.isHybridApp(null, 18)).toBeTruthy();
                    expect(clientSpecMapService.isHybridAppFromAppData(mockAppDataTest[18])).toBeTruthy();
                });
            });

            describe("isDashboardAppOnly", function() {
                it("no app data - should return false", function() {
                    var mockAppDataTest = {
                        18: {
                            appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                            applicationId: 18,
                            widgets: {
                                222: {
                                    mobilePublished: true,
                                    mobileUrl: "http://hotels.wix.com/search-widget-mobile.html",
                                    published: true
                                }
                            }
                        }
                    };
                    spyOn(metaData, "getProperty").and.returnValue(mockAppDataTest);

                    expect(clientSpecMapService.isDashboardAppOnly()).toBeFalsy();
                });

                it('should return true when appType is Hybrid', function() {
                    var mockAppDataTest = {
                        18: {
                            appType: 'Dashboard'
                        }
                    };
                    spyOn(metaData, "getProperty").and.returnValue(mockAppDataTest);
                    expect(clientSpecMapService.isDashboardAppOnly(mockAppDataTest[18])).toBeTruthy();
                });
            });

            describe('hasHiddenPages', function () {
                var mockClientSpec = {
                    19: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 19,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        widgets: {
                            11: {
                                published: true,
                                appPage: {
                                    id: 1,
                                    hidden: true
                                }
                            },
                            12: {
                                published: true,
                                appPage: {
                                    id: 2
                                }
                            }
                        }
                    },
                    22: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 22,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com"
                    }
                };

                beforeEach(function() {
                    spyOn(metaData, "getProperty").and.returnValue(mockClientSpec);
                });
                it('should return true when app has hidden appPages defined', function () {
                    expect(clientSpecMapService.hasHiddenPages(mockPs, 19)).toBeTruthy();
                });
                it('should return false when app has no hidden appPages defined', function () {
                    expect(clientSpecMapService.hasHiddenPages(mockPs, 12)).toBeFalsy();
                });
            });

            describe('widgetsToAutoAddToSite', function () {
                var mockClientSpec = {
                    19: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 19,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        widgets: {
                            11: {
                                published: true,
                                autoAddToSite: true
                            },
                            12: {
                                published: true,
                                appPage: {
                                    id: 2
                                }
                            }
                        }
                    },
                    22: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 22,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        autoAddToSite: true,
                        widgets: {
                            11: {
                                published: false,
                                autoAddToSite: true
                            },
                            12: {
                                published: true,
                                appPage: {
                                    id: 2
                                }
                            }
                        }
                    }
                };

                beforeEach(function() {
                    spyOn(metaData, "getProperty").and.returnValue(mockClientSpec);
                });

                it('should return widgets to auto add', function () {
                    expect(clientSpecMapService.widgetsToAutoAddToSite(mockPs, mockClientSpec[19], false)).toContain({
                        published : true,
                        autoAddToSite : true
                    });
                });

                it('should return widgets to auto add in dev mode', function () {
                    clientSpecMapService.setIsInDevMode(true);
                    expect(clientSpecMapService.widgetsToAutoAddToSite(mockPs, mockClientSpec[22])).toContain({
                        published : false,
                        autoAddToSite : true
                    });
                });
            });

            describe('getWidgetDataFromTPAPageId', function () {
                var mockClientSpec = {
                    19: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 19,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        widgets: {
                            11: {
                                published: true,
                                autoAddToSite: true
                            },
                            12: {
                                published: true,
                                appPage: {
                                    id: 2
                                }
                            }
                        }
                    },
                    22: {
                        appDefinitionId: "1311c9da-51ef-f7ae-aaaa-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 22,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        autoAddToSite: true,
                        widgets: {
                            11: {
                                published: false,
                                autoAddToSite: true
                            },
                            12: {
                                published: false,
                                appPage: {
                                    id: 3
                                }
                            }
                        }
                    },
                    23: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 19,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        widgets: {
                            11: {
                                published: true,
                                autoAddToSite: true
                            },
                            12: {
                                published: true
                            }
                        }
                    }
                };

                beforeEach(function() {
                    spyOn(metaData, "getProperty").and.returnValue(mockClientSpec);
                });

                it('should return widgets with the given page id', function () {
                    expect(clientSpecMapService.getWidgetDataFromTPAPageId(mockPs, mockClientSpec[19].appDefinitionId, 2, false)).toBe(
                        mockClientSpec[19].widgets[12]
                    );
                });

                it('should not return widgets with the given page id if not in dev mode and widget is not published', function () {
                    clientSpecMapService.setIsInDevMode(false);
                    expect(clientSpecMapService.getWidgetDataFromTPAPageId(mockPs, mockClientSpec[22].appDefinitionId, 3)).not.toBe(
                        mockClientSpec[22].widgets[12]
                    );
                });

                it('should return widgets with the given page id if in dev mode and widget is not published', function () {
                    clientSpecMapService.setIsInDevMode(true);
                    expect(clientSpecMapService.getWidgetDataFromTPAPageId(mockPs, mockClientSpec[22].appDefinitionId, 3)).toBe(
                        mockClientSpec[22].widgets[12]
                    );
                });

                it('should return nothing if app has no sections', function () {
                    clientSpecMapService.setIsInDevMode(false);
                    expect(clientSpecMapService.getWidgetDataFromTPAPageId(mockPs, mockClientSpec[23].appDefinitionId, 3)).toBeUndefined();
                });
            });

            describe('getWidgetDataFromTPAWidgetId', function () {
                var mockClientSpec = {
                    19: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 19,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        widgets: {
                            11: {
                                published: true,
                                autoAddToSite: true
                            },
                            12: {
                                published: true,
                                tpaWidgetId: '2'
                            }
                        }
                    },
                    22: {
                        appDefinitionId: "1311c9da-51ef-f7ae-aaaa-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 22,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        autoAddToSite: true,
                        widgets: {
                            11: {
                                published: false,
                                autoAddToSite: true
                            },
                            12: {
                                published: false,
                                tpaWidgetId: '3'
                            }
                        }
                    },
                    23: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 19,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com"
                    }
                };

                beforeEach(function() {
                    spyOn(metaData, "getProperty").and.returnValue(mockClientSpec);
                });

                it('should return widget with the given tpaWidgetId', function () {
                    expect(clientSpecMapService.getWidgetDataFromTPAWidgetId(mockPs, mockClientSpec[19].appDefinitionId, '2', false)).toBe(
                        mockClientSpec[19].widgets[12]
                    );
                });

                it('should not return widget with the given tpaWidgetId if not in dev mode and widget is not published', function () {
                    clientSpecMapService.setIsInDevMode(false);
                    expect(clientSpecMapService.getWidgetDataFromTPAWidgetId(mockPs, mockClientSpec[22].appDefinitionId, '3')).not.toBe(
                        mockClientSpec[22].widgets[12]
                    );
                });

                it('should return widgets with the given tpaWidgetId if in dev mode and widget is not published', function () {
                    clientSpecMapService.setIsInDevMode(true);
                    expect(clientSpecMapService.getWidgetDataFromTPAWidgetId(mockPs, mockClientSpec[22].appDefinitionId, '3')).toBe(
                        mockClientSpec[22].widgets[12]
                    );
                });

                it('should return nothing if app has no widgets', function () {
                    clientSpecMapService.setIsInDevMode(false);
                    expect(clientSpecMapService.getWidgetDataFromTPAWidgetId(mockPs, mockClientSpec[23].appDefinitionId, '3')).toBeUndefined();
                });
            });

            describe("hasPremiumOffering", function() {
                it('should return has premium offering when app has vendor products', function() {
                    spyOn(clientSpecMap, "getAppData").and.returnValue(mockAppsData[19]);
                    expect(clientSpecMapService.hasPremiumOffering({}, mockAppsData[19])).toBeTruthy();
                });

                it('should return has no premium offering when app has empty vendor products', function() {
                    spyOn(clientSpecMap, "getAppData").and.returnValue(mockAppsData[22]);
                    expect(clientSpecMapService.hasPremiumOffering({}, mockAppsData[22])).toBeFalsy();
                });

                it('should return has no premium offering when app is not installed', function() {
                    spyOn(clientSpecMap, "getAppData").and.returnValue(mockAppsData[20]);
                    expect(clientSpecMapService.hasPremiumOffering({}, mockAppsData[20])).toBeFalsy();
                });

                it('should return has no premium offering when app has null vendor products', function() {
                    spyOn(clientSpecMap, "getAppData").and.returnValue(mockAppsData[21]);
                    expect(clientSpecMapService.hasPremiumOffering({}, mockAppsData[21])).toBeFalsy();
                });

                it('should return has no premium offering when app has no vendor products', function() {
                    spyOn(clientSpecMap, "getAppData").and.returnValue(mockAppsData[22]);
                    expect(clientSpecMapService.hasPremiumOffering({}, mockAppsData[22])).toBeFalsy();
                });
            });

            describe('isWidgetHasMobileUrl', function() {
                var mockClientSpec = {
                    12: {
                        widgets: {
                            1: {

                            },
                            2: {
                                mobileUrl: 'ww.mobile'
                            },
                            3: {
                                mobileUrl: 'ww.mobile',
                                mobilePublished: false
                            },
                            4: {
                                mobileUrl: 'ww.mobile',
                                mobilePublished: true
                            }
                        }
                    }
                };

                beforeEach(function() {
                    spyOn(metaData, "getProperty").and.returnValue(mockClientSpec);
                });

                it('should return false if the application id is not defined', function() {
                    expect(clientSpecMapService.isWidgetHasMobileUrl(mockPs, null, 18)).toBeFalsy();
                });

                it('should return false if the widget id is not defined', function() {
                    expect(clientSpecMapService.isWidgetHasMobileUrl(mockPs, 3, null)).toBeFalsy();
                });

                it('should return false if there is no widget data', function() {
                    expect(clientSpecMapService.isWidgetHasMobileUrl(mockPs, 12, 5)).toBeFalsy();
                });

                it('should return false if mobileUrl is not defined', function() {
                    expect(clientSpecMapService.isWidgetHasMobileUrl(mockPs, 12, 1)).toBeFalsy();
                });

                it('should return false if has mobile url but is published is not defined', function() {
                    expect(clientSpecMapService.isWidgetHasMobileUrl(mockPs, 12, 2)).toBeFalsy();
                });

                it('should return false if mobile url is not published', function() {
                    expect(clientSpecMapService.isWidgetHasMobileUrl(mockPs, 12, 3)).toBeFalsy();
                });

                it('should return true if mobile url is defined and in dev mode', function() {
                    clientSpecMapService.setIsInDevMode(true);
                    expect(clientSpecMapService.isWidgetHasMobileUrl(mockPs, 12, 2)).toBeTruthy();
                });

                it('should return true if mobile url is defined and is published', function() {
                    clientSpecMapService.setIsInDevMode(false);
                    expect(clientSpecMapService.isWidgetHasMobileUrl(mockPs, 12, 4)).toBeTruthy();
                });
            });

            describe('isAppPermissionsIsRevoked', function() {
                it('should return false if permissions is not defined', function() {
                    var appData = {
                    };

                    expect(clientSpecMapService.isAppPermissionsIsRevoked(appData)).toBeFalsy();
                });

                it('should return false if permissions.revoked is not defined', function() {
                    var appData = {
                        permissions: {

                        }
                    };

                    expect(clientSpecMapService.isAppPermissionsIsRevoked(appData)).toBeFalsy();
                });

                it('should return false if permissions.revoked is not boolean', function() {
                    var appData = {
                        permissions: {
                            revoke: ''
                        }
                    };

                    expect(clientSpecMapService.isAppPermissionsIsRevoked(appData)).toBeFalsy();
                });

                it('should return false if permissions.revoked is false', function() {
                    var appData = {
                        permissions: {
                            revoke: false
                        }
                    };

                    expect(clientSpecMapService.isAppPermissionsIsRevoked(appData)).toBeFalsy();
                });

                it('should return true if permissions are revoked', function() {
                    var appData = {
                        permissions: {
                            revoke: true
                        }
                    };

                    expect(clientSpecMapService.isAppPermissionsIsRevoked(appData)).toBeFalsy();
                });
            });

            describe('isAppPermissionsIsGranted', function() {
                it('should return false if permissions is not defined', function() {
                    var appData = {
                    };

                    expect(clientSpecMapService.isAppPermissionsIsGranted(appData)).toBeFalsy();
                });

                it('should return false if permissions.revoked is not defined', function() {
                    var appData = {
                        permissions: {

                        }
                    };

                    expect(clientSpecMapService.isAppPermissionsIsGranted(appData)).toBeFalsy();
                });

                it('should return false if permissions.revoked is not boolean', function() {
                    var appData = {
                        permissions: {
                            revoke: ''
                        }
                    };

                    expect(clientSpecMapService.isAppPermissionsIsGranted(appData)).toBeFalsy();
                });

                it('should return false if permissions.revoked is true', function() {
                    var appData = {
                        permissions: {
                            revoke: true
                        }
                    };

                    expect(clientSpecMapService.isAppPermissionsIsGranted(appData)).toBeFalsy();
                });

                it('should return true if permissions are not revoked', function() {
                    var appData = {
                        permissions: {
                            revoke: false
                        }
                    };

                    expect(clientSpecMapService.isAppPermissionsIsGranted(appData)).toBeFalsy();
                });
            });

            describe('hasSections', function () {
                var mockAppData;

                it('should have sections', function () {
                    mockAppData = {
                        widgets: [
                            {
                                id: '1',
                                appPage: {},
                                published: true
                            }
                        ]
                    };

                    var hasSections = clientSpecMapService.hasSections(mockPs, mockAppData);

                    expect(hasSections).toBeTruthy();
                });

                it('should not have sections', function () {
                    mockAppData = {
                        widgets: [
                            {
                                id: '1'
                            }
                        ]
                    };

                    var hasSections = clientSpecMapService.hasSections(mockPs, mockAppData);

                    expect(hasSections).toBeFalsy();
                });

                it('should not have sections if no published sections exist', function () {
                    mockAppData = {
                        widgets: [
                            {
                                id: '1',
                                appPage: {}
                            }
                        ]
                    };

                    var hasSections = clientSpecMapService.hasSections(mockPs, mockAppData);

                    expect(hasSections).toBeFalsy();
                });
            });

            describe('filterApps', function () {
                it('should filter our non apps from spec map', function () {
                    var data = [];
                    data[0] = {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 0,
                        appType: "Dashboard",
                        dashboardUrl: "ww.dashboard.com"
                    };

                    data[1] = {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 0,
                        appType: "Editor"
                    };

                    data[2] = {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 0,
                        appType: "Hybrid"
                    };

                    data[3] = {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget"
                    };

                    var apps = clientSpecMapService.filterApps(data);
                    expect(_.size(apps)).toBe(3);
                });

                it('should not filter out entries that do not have appType', function () {
                    var data = {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget"
                    };

                    var apps = clientSpecMapService.filterApps([data]);
                    expect(_.size(apps)).toBe(1);
                });

                it('should filter our wixapps', function () {
                    var data = [];
                    data[0] = {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        type: 'wixapps'
                    };

                    data[1] = {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c52",
                        appDefinitionName: "Dropifi Contact Widget2",
                        type: 'appbuilder'
                    };

                    var apps = clientSpecMapService.filterApps(data);

                    expect(_.size(apps)).toBe(0);
                });
            });

            describe('isAppProvisionedOnServer', function() {
                var mockClientSpec = {
                    12: {
                        notProvisioned: true
                    },
                    13: {
                        notProvisioned: false
                    },
                    14:{

                    }
                };

                beforeEach(function() {
                    spyOn(metaData, "getProperty").and.returnValue(mockClientSpec);
                });

                it('should return false if notProvisoned is true', function() {
                    expect(clientSpecMapService.isAppProvisionedOnServer(mockPs, 12)).toBeFalsy();
                });

                it('should return true if notProvisoned is true', function() {
                    expect(clientSpecMapService.isAppProvisionedOnServer(mockPs, 13)).toBeTruthy();
                });

                it('should return true if notProvisoned is not defined', function() {
                    expect(clientSpecMapService.isAppProvisionedOnServer(mockPs, 14)).toBeTruthy();
                });
            });

            describe('hasMainSection', function(){

                var mockClientSpec = {
                    19: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 19,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        widgets: {
                            11: {
                                published: true,
                                autoAddToSite: true
                            },
                            12: {
                                published: true,
                                tpaWidgetId: '2'
                            }
                        }
                    },
                    22: {
                        appDefinitionId: "1311c9da-51ef-f7ae-aaaa-3704c9c08c51",
                        appDefinitionName: "appDefinitionName",
                        applicationId: 22,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        autoAddToSite: true,
                        widgets: {
                            11: {
                                appPage: {
                                    id: 1,
                                    hidden: false
                                },
                                published: true
                            },
                            12: {
                                published: false,
                                tpaWidgetId: '3'
                            }
                        }
                    },
                    23: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "appDefinitionName",
                        applicationId: 23,
                        instance: "instance",
                        widgets: {
                            11: {
                                appPage: {
                                    id: 1,
                                    hidden: true
                                },
                                published: true
                            }
                        }
                    }
                };

                beforeEach(function() {
                    spyOn(metaData, "getProperty").and.returnValue(mockClientSpec);
                });

                it('should return false when app has no sections', function() {
                    expect(clientSpecMapService.hasMainSection(mockPs, mockClientSpec[19])).toBe(false);
                });

                it('should return false when app has only hidden section', function() {
                    expect(clientSpecMapService.hasMainSection(mockPs, mockClientSpec[23])).toBe(false);

                });

                it('should return true when app has main section', function() {
                    expect(clientSpecMapService.hasMainSection(mockPs, mockClientSpec[22])).toBe(true);
                });
            });

            describe('getMainSectionWidgetDataFromApplicationId', function () {
                var mockClientSpec = {
                    19: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 19,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        widgets: {
                            11: {
                                published: true,
                                autoAddToSite: true
                            },
                            12: {
                                published: true,
                                tpaWidgetId: '2'
                            }
                        }
                    },
                    22: {
                        appDefinitionId: "1311c9da-51ef-f7ae-aaaa-3704c9c08c51",
                        appDefinitionName: "appDefinitionName",
                        applicationId: 22,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        autoAddToSite: true,
                        widgets: {
                            11: {
                                appPage: {
                                    id: 1,
                                    hidden: false
                                },
                                published: true
                            },
                            12: {
                                published: false,
                                tpaWidgetId: '3'
                            }
                        }
                    },
                    23: {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "appDefinitionName",
                        applicationId: 23,
                        instance: "instance",
                        widgets: {
                            11: {
                                appPage: {
                                    id: 1,
                                    hidden: true
                                },
                                published: true
                            },
                            12: {
                                appPage: {
                                    id: 2,
                                    hidden: false
                                },
                                published: true
                            }
                        }
                    }
                };

                beforeEach(function() {
                    spyOn(metaData, "getProperty").and.returnValue(mockClientSpec);
                });

                it('should return undefined when app has no sections', function() {


                    expect(clientSpecMapService.getMainSectionWidgetDataFromApplicationId(mockPs, 19)).toBeUndefined();
                });

                it('should the main section when app has only one section', function() {
                    expect(clientSpecMapService.getMainSectionWidgetDataFromApplicationId(mockPs, 22)).toEqual({
                        appPage: {
                            id: 1,
                            hidden: false
                        },
                        published: true
                    });
                });

                it('should the main section when app has only one few sections', function() {
                    expect(clientSpecMapService.getMainSectionWidgetDataFromApplicationId(mockPs, 23)).toEqual({
                        appPage: {
                            id: 2,
                            hidden: false
                        },
                        published: true
                    });
                });
            });

            describe('getHiddenSectionsWidgetIdsToPreFetch', function () {
                var mockAppData;

                beforeEach(function () {
                    mockAppData = {
                        appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                        appDefinitionName: "Dropifi Contact Widget",
                        applicationId: 19,
                        instance: "1234",
                        dashboardUrl: "ww.dashboard.com",
                        widgets: {
                            11: {
                                published: true,
                                autoAddToSite: true,
                                widgetId: '11'
                            },
                            12: {
                                published: true,
                                tpaWidgetId: '2',
                                widgetId: '12'
                            }
                        }
                    };
                });

                it('should not return widget ids if there are no app page widgets', function() {
                    expect(clientSpecMapService.getSectionsWidgetIdsToPreFetch(mockAppData)).toEqual([]);
                });

                it('should not return widget ids if there are no app page widgets marked as prefetch', function() {
                    mockAppData.widgets[11].appPage = {};
                    mockAppData.widgets[12].appPage = {};

                    expect(clientSpecMapService.getSectionsWidgetIdsToPreFetch(mockAppData)).toEqual([]);

                });

                it('should return widget ids if there are app page widgets marked as prefetch', function() {
                    mockAppData.widgets[11].appPage = {};
                    mockAppData.widgets[11].preFetch = true;

                    expect(clientSpecMapService.getSectionsWidgetIdsToPreFetch(mockAppData)).toEqual(['11']);
                });

                it('should not return widget ids if widgets are marked as published:false', function() {
                    mockAppData.widgets[11].appPage = {};
                    mockAppData.widgets[11].preFetch = true;
                    mockAppData.widgets[11].published = false;

                    expect(clientSpecMapService.getSectionsWidgetIdsToPreFetch(mockAppData)).toEqual([]);
                });

                it('should return widget ids if widgets are marked as published:false but santaEditorPublished:true', function() {
                    mockAppData.widgets[11].appPage = {};
                    mockAppData.widgets[11].preFetch = true;
                    mockAppData.widgets[11].published = false;
                    mockAppData.widgets[11].santaEditorPublished = true;

                    expect(clientSpecMapService.getSectionsWidgetIdsToPreFetch(mockAppData)).toEqual(['11']);
                });
            });

            describe('isDemoAppAfterProvision', function() {
                it('should return true if the it a demo app', function() {
                    var appData = {
                        instance: 'KZL9u5Ho0JgRPMev3fsyidFueoydpF7VEOKNIkRwMQE.eyJpbnN0YW5jZUlkIjoiMjA5YjU5NjYtZGFmMS00NTU0LWFlMjQtYTgxNDhjZjU4Nzk5Iiwic2lnbkRhdGUiOiIyMDE2LTA3LTMxVDEyOjEyOjMwLjAzM1oiLCJ1aWQiOiJiMmQ3ZGYzNS0yNTRiLTRiYWYtODQ5Mi00YzNjNTU4YmE2ZTgiLCJwZXJtaXNzaW9ucyI6Ik9XTkVSIiwiaXBBbmRQb3J0IjoiOTEuMTk5LjExOS40MS8zMzM0MCIsInZlbmRvclByb2R1Y3RJZCI6bnVsbCwiZGVtb01vZGUiOmZhbHNlLCJvcmlnaW5JbnN0YW5jZUlkIjoiYjQ2MTVjYjItNGU5OS00ZjM1LTkzMzAtOGU1YWZlYzk3ODQ1IiwiYmlUb2tlbiI6ImNhNzY4NzA0LTVlMjEtMGM2Ni0wODA2LTgzM2U4Nzk5YjUwMSIsInNpdGVPd25lcklkIjoiYjJkN2RmMzUtMjU0Yi00YmFmLTg0OTItNGMzYzU1OGJhNmU4In0'
                    };

                    expect(clientSpecMapService.isDemoAppAfterProvision(appData)).toBeTruthy();
                });

                it('should return false if the it a demo app', function() {
                    var appData = {
                        instance: 'lgalMji4_6FYuofXogqSl3sa0myl3sLWCJs1ZiwDsPU.eyJpbnN0YW5jZUlkIjoiMDQyMTRjY2QtMmUxNC00ZTkyLWFmZTQtN2U0Y2NmNzYwMTc0Iiwic2lnbkRhdGUiOiIyMDE2LTA3LTMxVDEyOjE5OjQ3LjgwOFoiLCJ1aWQiOiJiMmQ3ZGYzNS0yNTRiLTRiYWYtODQ5Mi00YzNjNTU4YmE2ZTgiLCJwZXJtaXNzaW9ucyI6Ik9XTkVSIiwiaXBBbmRQb3J0IjoiOTEuMTk5LjExOS40MS82MTk1MCIsInZlbmRvclByb2R1Y3RJZCI6bnVsbCwiZGVtb01vZGUiOmZhbHNlLCJzaXRlT3duZXJJZCI6ImIyZDdkZjM1LTI1NGItNGJhZi04NDkyLTRjM2M1NThiYTZlOCJ9'
                    };

                    expect(clientSpecMapService.isDemoAppAfterProvision(appData)).toBeFalsy();
                });
            });

            describe('getAppSections', function () {
                var appData;

                beforeEach(function () {
                    appData = {
                        widgets: {
                            1: {
                                appPage: {},
                                published: true
                            }
                        }
                    };
                });

                it('should return published sections when dev mode is off', function () {
                    var sections = clientSpecMapService.getAppSections(mockPs, appData);

                    expect(sections.length).toEqual(1);
                });

                it('should exclude non published sections when dev mode is off', function () {
                    appData.widgets[1].published = false;

                    var sections = clientSpecMapService.getAppSections(mockPs, appData);

                    expect(sections.length).toEqual(0);
                });


                it('should return sections marked as santaEditorPublished when dev mode is off', function () {
                    appData.widgets[1].published = false;
                    appData.widgets[1].santaEditorPublished = true;

                    var sections = clientSpecMapService.getAppSections(mockPs, appData);

                    expect(sections.length).toEqual(1);
                });

                it('should return all sections when dev mode is on', function () {
                    appData.widgets[1].published = false;
                    clientSpecMapService.setIsInDevMode(true);

                    var sections = clientSpecMapService.getAppSections(mockPs, appData);

                    expect(sections.length).toEqual(1);
                    clientSpecMapService.setIsInDevMode(false);
                });

                it('should not return widgets which are not sections', function () {
                    appData.widgets[1].appPage = null;

                    var sections = clientSpecMapService.getAppSections(mockPs, appData);

                    expect(sections.length).toEqual(0);
                });
            });

            describe('getExtensionsWidgets', function () {
                var appData;

                beforeEach(function () {
                    appData = {
                        widgets: {
                            1: {
                                published: true
                            }
                        }
                    };
                });

                it('should return published widgets when dev mode is off', function () {
                    var sections = clientSpecMapService.getExtensionsWidgets(mockPs, appData);

                    expect(sections.length).toEqual(1);
                });

                it('should exclude non published widgets when dev mode is off', function () {
                    appData.widgets[1].published = false;

                    var sections = clientSpecMapService.getExtensionsWidgets(mockPs, appData);

                    expect(sections.length).toEqual(0);
                });


                it('should return widgets marked as santaEditorPublished when dev mode is off', function () {
                    appData.widgets[1].published = false;
                    appData.widgets[1].santaEditorPublished = true;

                    var sections = clientSpecMapService.getExtensionsWidgets(mockPs, appData);

                    expect(sections.length).toEqual(1);
                });

                it('should return all widgets when dev mode is on', function () {
                    appData.widgets[1].published = false;
                    clientSpecMapService.setIsInDevMode(true);

                    var sections = clientSpecMapService.getExtensionsWidgets(mockPs, appData);

                    expect(sections.length).toEqual(1);
                    clientSpecMapService.setIsInDevMode(false);
                });

                it('should not return sections', function () {
                    appData.widgets[1].appPage = {};

                    var sections = clientSpecMapService.getExtensionsWidgets(mockPs, appData);

                    expect(sections.length).toEqual(0);
                });
            });
        });
    });
