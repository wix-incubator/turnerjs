define(['lodash',
    'documentServices/page/page',
    'documentServices/component/component',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/services/installedTpaAppsOnSiteService',
    'documentServices/tpa/constants',
    'documentServices/tpa/services/pendingAppsService',
    'documentServices/mockPrivateServices/privateServicesHelper'], function(_, page, component, clientSpecMapService, installedTpaAppsOnSiteService, tpaConstants, pendingAppsService, privateServicesHelper) {

    'use strict';

    describe("Installed tpa apps on site service", function() {
        var mockAppsData = {
            12: {
                appDefinitionId: "1363adbc",
                appDefinitionName: "LiveChat",
                applicationId: 12,
                instance: "1234",
                widgets: {},
                type:"editor"
            },
            16: {
                appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                appDefinitionName: "LiveChat",
                applicationId: 16,
                instance: "1234",
                widgets: {},
                appType: "Editor"
            },
            20: {
                appDefinitionId: "1311c9da-51ef-f7ae-2576",
                appDefinitionName: "Dropifi Contact Widget",
                applicationId: 20,
                instance: "123456",
                widgets: {},
                appType: "Editor"
            },
            22: {
                appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8cttt",
                appDefinitionName: "LiveChat",
                applicationId: 22,
                instance: "1234",
                widgets: {},
                type:"editor"
            },
            25: {
                appDefinitionId: "1363adbc-c783",
                appDefinitionName: "LiveChat",
                applicationId: 25,
                instance: "1234",
                widgets: {},
                type:"editor"
            },
            26: {
                appDefinitionId: "1363adbcrrrrr",
                appDefinitionName: "LiveChat",
                applicationId: 26,
                instance: "1234",
                widgets: {},
                type:"editor"
            },
            27: {
                appDefinitionId: "27272727",
                appDefinitionName: "LiveChat",
                applicationId: 27,
                instance: "1234",
                widgets: {},
                type:"editor"
            },
            28: {
                appDefinitionId: "27272727",
                appDefinitionName: "LiveChat",
                applicationId: 28,
                instance: "1234",
                widgets: {},
                type:"editor"
            },
            29: {
                appDefinitionId: "1363adbcrrrrr",
                appDefinitionName: "LiveChat",
                applicationId: 29,
                instance: "1234",
                widgets: {},
                type:"editor",
                demoMode: true
            }
        };

        var mockPs;

        var appNotInstalled = {
            22: {
                appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                appDefinitionName: "LiveChat",
                applicationId: 22,
                instance: "1234",
                widgets: {},
                permissions: {
                    revoked: false
                },
                appType: "Editor"
            }
        };

        var hybridAppNotInstalled = {
            22: {
                appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                appDefinitionName: "LiveChat",
                dashboardUrl: 'http://hx0r.com',
                applicationId: 22,
                instance: "1234",
                widgets: {
                    11: {
                        published: true,
                        autoAddToSite: true
                    }
                },
                permissions: {
                    revoked: false
                },
                appType: "Hybrid"
            }
        };

        var mockPagesData = {
            1: {
                structure: {
                    components: [
                        {
                            dataQuery: '#123',
                            componentType: tpaConstants.COMP_TYPES.TPA_WIDGET,
                            id: 'comp1'
                        },
                        {
                            dataQuery: '#111',
                            componentType: tpaConstants.COMP_TYPES.TPA_WIDGET,
                            id: 'comp5'
                        },
                        {
                            dataQuery: '#333',
                            componentType: tpaConstants.COMP_TYPES.TPA_WIDGET,
                            id: 'comp3366'
                        }
                    ],
                    id: '1'
                },
                data: {
                    document_data: {
                        123: {
                            applicationId: '12',
                            type: tpaConstants.DATA_TYPE.TPA_WIDGET
                        },
                        111: {
                            applicationId: '20',
                            type: tpaConstants.DATA_TYPE.TPA_WIDGET
                        },
                        333: {
                            applicationId: '33',
                            type: tpaConstants.DATA_TYPE.TPA_WIDGET
                        }
                    }
                }
            },
            2: {
                structure: {
                    components: [
                        {
                            dataQuery: '#345',
                            componentType: tpaConstants.COMP_TYPES.TPA_WIDGET,
                            id: 'comp2'
                        },
                        {
                            dataQuery: '#456',
                            componentType: 'other',
                            id: 'comp3'
                        },
                        {
                            dataQuery: '#666',
                            componentType: 'other',
                            id: 'comp33'
                        }
                    ],
                    id: '2'
                },
                data: {
                    document_data: {
                        345: {
                            applicationId: '21',
                            type: tpaConstants.DATA_TYPE.TPA_WIDGET
                        },
                        666: {
                            applicationId: '26',
                            type: tpaConstants.DATA_TYPE.TPA_MULTI_SECTION
                        }
                    }
                }
            },
            3: {
                structure: {
                    components: [],
                    id: '3'
                },
                data: {
                    document_data: {}
                }
            },
            4: {
                structure: {
                    components: [
                        {
                            dataQuery: '#345',
                            componentType: 'other',
                            id: 'comp2'
                        },
                        {
                            dataQuery: '#456',
                            componentType: 'other',
                            id: 'comp3'
                        },
                        {
                            dataQuery: '#666',
                            componentType: 'other',
                            id: 'comp44'
                        }
                    ],
                    id: '4'
                },
                data: {
                    document_data: {
                        345: {
                            applicationId: '21',
                            type: tpaConstants.DATA_TYPE.TPA_WIDGET
                        },
                        666: {
                            applicationId: '26',
                            type: tpaConstants.DATA_TYPE.TPA_SECTION
                        }
                    }
                }
            },
            5: {
                structure: {
                    components: [
                        {
                            dataQuery: '#123',
                            componentType: tpaConstants.COMP_TYPES.TPA_WIDGET,
                            id: 'comp1'
                        },
                        {
                            dataQuery: '#111',
                            componentType: tpaConstants.COMP_TYPES.TPA_WIDGET,
                            id: 'comp5'
                        },
                        {
                            dataQuery: '#456',
                            componentType: 'other',
                            id: 'comp3'
                        },
                        {
                            dataQuery: '#777',
                            componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                            id: 'comp33'
                        }
                    ],
                    id: '5'
                },
                data: {
                    document_data: {
                        123: {
                            applicationId: '12',
                            type: tpaConstants.DATA_TYPE.TPA_WIDGET
                        },
                        111: {
                            applicationId: '20',
                            type: tpaConstants.DATA_TYPE.TPA_WIDGET
                        },
                        456: {
                            applicationId: '21',
                            type: tpaConstants.DATA_TYPE.TPA_WIDGET
                        },
                        777: {
                            applicationId: '26',
                            type: tpaConstants.DATA_TYPE.TPA_SECTION
                        }
                    }
                }
            },
            6: {
                structure: {
                    components: [
                        {
                            dataQuery: '#222',
                            componentType: tpaConstants.COMP_TYPES.TPA_WIDGET,
                            id: 'comp2'
                        }
                    ],
                    id: '6'
                },
                data: {
                    document_data: {
                        222: {
                            applicationId: '16',
                            type: tpaConstants.DATA_TYPE.TPA_WIDGET
                        }
                    }
                }
            },
            7: {
                structure: {
                    components: [
                        {
                            dataQuery: '#222',
                            componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                            id: 'comp2'
                        }
                    ],
                    id: '7'
                },
                data: {
                    document_data: {
                        222: {
                            applicationId: '16',
                            type: tpaConstants.DATA_TYPE.TPA_SECTION
                        }
                    }
                }
            },
            8: {
                structure: {
                    components: [
                        {
                            dataQuery: '#888',
                            componentType: tpaConstants.COMP_TYPES.TPA_MULTI_SECTION,
                            id: 'comp88888'
                        }
                    ],
                    id: '8'
                },
                data: {
                    document_data: {
                        888: {
                            applicationId: '26',
                            type: tpaConstants.DATA_TYPE.TPA_MULTI_SECTION
                        }
                    }
                }
            },
            9: {
                structure: {
                    components: [
                        {
                            dataQuery: '#999',
                            componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                            id: 'comp9999'
                        },
                        {
                            dataQuery: '#9999',
                            componentType: tpaConstants.COMP_TYPES.TPA_WIDGET,
                            id: 'comp99999'
                        }
                    ],
                    id: '9'
                },
                data: {
                    document_data: {
                        999: {
                            applicationId: '26',
                            type: tpaConstants.DATA_TYPE.TPA_SECTION
                        },
                        9999: {
                            applicationId: '28',
                            type: tpaConstants.DATA_TYPE.TPA_WIDGET
                        }
                    }
                }
            },
            10: {
                structure: {
                    components: [
                        {
                            dataQuery: '#1010',
                            componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                            id: 'comp1010'
                        },
                        {
                            dataQuery: '#101010',
                            componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                            id: 'comp101010'
                        }
                    ],
                    id: '10'
                },
                data: {
                    document_data: {
                        1010: {
                            applicationId: '26',
                            type: tpaConstants.DATA_TYPE.TPA_SECTION
                        },
                        101010: {
                            applicationId: '28',
                            type: tpaConstants.DATA_TYPE.TPA_SECTION
                        }
                    }
                }
            },
            11: {
                structure: {
                    components: [
                        {
                            dataQuery: '#1020',
                            componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                            id: 'comp1020'
                        }
                    ],
                    id: '11'
                },
                data: {
                    document_data: {
                        1020: {
                            applicationId: '29',
                            type: tpaConstants.DATA_TYPE.TPA_SECTION
                        }
                    }
                }
            },
            masterPage: {
                structure: {
                    components: [
                        {
                            dataQuery: '#1010',
                            componentType: 'other',
                            id: 'comp1010'
                        },
                        {
                            dataQuery: '#101010',
                            componentType: 'other',
                            id: 'comp101010'
                        }
                    ],
                    id: '10'
                },
                data: {
                    document_data: {
                        1010: {
                            applicationId: '26',
                            type: tpaConstants.DATA_TYPE.TPA_SECTION
                        },
                        101010: {
                            applicationId: '28',
                            type: tpaConstants.DATA_TYPE.TPA_SECTION
                        },
                        11: {
                            tpaApplicationId: 29
                        },
                        4: {
                            tpaApplicationId: 0
                        },
                        10: {
                            tpaApplicationId: 26
                        },
                        9: {
                            tpaApplicationId: 26
                        }
                    }
                }
            }

        };

        beforeEach(function() {
            var siteData = privateServicesHelper.getSiteDataWithPages();
            siteData.pagesData = mockPagesData;

            mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            spyOn(page, 'getPageIdList').and.returnValue(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);
            spyOn(component.data, 'get').and.callFake(function(ps, compPointer) {
                var pageId = ps.pointers.components.getPageOfComponent(compPointer).id;
                var comp = _.find(mockPagesData[pageId].structure.components, {id: compPointer.id});
                var dataQuery = comp.dataQuery.substring(1);
                return mockPagesData[pageId].data.document_data[dataQuery];
            });

            spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockAppsData);
        });

        describe('getAppsToGrantAndRevoke', function() {
            it('should return no ids if applicationId exists', function() {
                var appData = {
                    21: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 21,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: false
                        },
                        appType: "Editor"
                    }
                };

                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData)).toEqual({revoke: [], grant:[]});
            });

            it('should return no ids if applicationId not exists but app is preInstalled', function() {
                var appData = _.cloneDeep(appNotInstalled);
                appData[22].preInstalled = true;

                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData)).toEqual({revoke: [], grant:[]});
            });

            it('should return no ids if applicationId not exists but app is hybrid and call parameters asks to filter out hybrids', function() {
                var appData = _.cloneDeep(hybridAppNotInstalled);
                spyOn(clientSpecMapService, 'isEditorOrHybridApp').and.returnValue(true);
                spyOn(clientSpecMapService, 'isHybridAppAndEditorPartNotDismissed').and.returnValue(false);

                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData, {
                    excludeHybrid: true
                })).toEqual({revoke: [], grant:[]});
            });

            it('should return id if applicationId not exists but app is hybrid and call parameters do not asks to filter out hybrids', function() {
                var appData = _.cloneDeep(hybridAppNotInstalled);
                spyOn(clientSpecMapService, 'isEditorOrHybridApp').and.returnValue(true);


                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData, {
                    excludeHybrid: false
                })).toEqual({revoke: [appData[22]], grant:[]});
            });

            it('should return id if applicationId not exists but app is hybrid and call parameters have bad value', function() {
                var appData = _.cloneDeep(hybridAppNotInstalled);
                spyOn(clientSpecMapService, 'isEditorOrHybridApp').and.returnValue(true);


                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData, {
                    excludeHybrid: 'foo'
                })).toEqual({revoke: [appData[22]], grant:[]});
            });

            it('should return id if applicationId not exists, app is hybrid, call parameters asks to filter out hybrids but editor part is not dismissed', function() {
                var appData = _.cloneDeep(hybridAppNotInstalled);
                spyOn(clientSpecMapService, 'isEditorOrHybridApp').and.returnValue(true);
                spyOn(clientSpecMapService, 'isHybridAppAndEditorPartNotDismissed').and.returnValue(true);

                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData, {
                    excludeHybrid: true
                })).toEqual({revoke: [appData[22]], grant:[]});
            });

            it('should return no ids if applicationId not exists but app is pending', function() {
                spyOn(pendingAppsService, 'isPending').and.returnValue(true);
                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appNotInstalled, mockPagesData)).toEqual({revoke: [], grant:[]});
            });

            it('should return no ids if applicationId not exists but app is dashboard only', function() {
                var appData = _.cloneDeep(appNotInstalled);
                appData[22].appType = 'Dashboard';

                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData)).toEqual({revoke: [], grant:[]});
            });

            it('should return ids if applicationId not exists but app is hybrid only and no options forward as parameter', function() {
                var appData = _.cloneDeep(appNotInstalled);
                appData[22].appType = 'Hybrid';
                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData)).toEqual({revoke: [appData[22]], grant:[]});
            });

            it('should return no ids if applicationId not exists but app hybrid only and options forward as parameter', function() {
                var appData = _.cloneDeep(appNotInstalled);
                appData[22].appType = 'Hybrid';
                appData[22].editorPartDismissed = true;
                var options = {
                    excludeHybrid: true
                };
                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData, options)).toEqual({revoke: [], grant:[]});
            });

            it('should return ids if applicationId not exists but app hybrid and editor aprt is not dismissed only and options forward as parameter', function() {
                var appData = _.cloneDeep(appNotInstalled);
                appData[22].appType = 'Hybrid';
                appData[22].editorPartDismissed = false;
                var options = {
                    excludeHybrid: true
                };
                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData, options)).toEqual({revoke: [appData[22]], grant:[]});
            });


            it('should return ids if applicationId not exists but app is hybrid only and no options forward as parameter', function() {
                var appData = _.cloneDeep(appNotInstalled);
                appData[22].appType = 'Hybrid';
                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData)).toEqual({revoke: [appData[22]], grant:[]});
            });

            it('should return no ids if applicationId not exists but app is not tpa app', function() {
                var appData = _.cloneDeep(appNotInstalled);
                appData[22].appType = 'other';

                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData)).toEqual({revoke: [], grant:[]});
            });

            it('should return no ids if app has no permissions', function() {
                var appData = {
                    22: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 22,
                        instance: "1234",
                        widgets: {},
                        appType: "Editor"
                    }
                };

                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData)).toEqual({revoke: [], grant:[]});
            });

            it('should return app id if app is NOT revoked', function() {
                var appData = {
                    22: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 22,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: false
                        },
                        appType: "Editor"
                    }
                };

                spyOn(clientSpecMapService, 'isEditorOrHybridApp').and.returnValue(true);

                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData)).toEqual({revoke: [appData[22]], grant:[]});
            });

            it('should return no app ids if the app permissions is already revoked', function() {
                var appData = {
                    22: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 22,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: true
                        },
                        appType: "Editor"
                    }
                };

                spyOn(clientSpecMapService, 'isDashboardAppOnly').and.returnValue(false);
                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData)).toEqual({revoke: [], grant:[]});
            });

            it('should return id for grant permissions in case app was revoked and app is reinstall', function() {
                var appData = {
                    33: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 33,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: true
                        },
                        appType: "Editor"
                    }
                };

                spyOn(clientSpecMapService, 'isDashboardAppOnly').and.returnValue(false);
                expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke(appData, mockPagesData)).toEqual({revoke: [], grant:[appData[33]]});

            });
        });

        describe('getInstalledAppsOnPage', function() {
            it('should return no apps if there are no installed comps on page', function() {
                expect(installedTpaAppsOnSiteService.getInstalledAppsOnPage(mockPs, '3')).toEqual([]);
            });

            it('should return no apps if there are no tpa comps on page', function() {
                expect(installedTpaAppsOnSiteService.getInstalledAppsOnPage(mockPs, '4')).toEqual([]);
            });

            it('should return no apps if there tpa comps but they are not in the client spec map', function() {
                expect(installedTpaAppsOnSiteService.getInstalledAppsOnPage(mockPs, '2')).toEqual([]);
            });

            it('should return apps data of the tpas on the page', function() {
                expect(installedTpaAppsOnSiteService.getInstalledAppsOnPage(mockPs, '1')).toEqual([mockAppsData[12], mockAppsData[20]]);
            });
        });

        describe("getFirstAppCompPageId", function() {
            it("should return undefined in case appDefinitionId doesn't exist", function() {
                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue(null);
                expect(installedTpaAppsOnSiteService.getFirstAppCompPageId(mockPs, '123')).toBeNull();
            });

            it("should return undefined for comp not installed on site", function() {
                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue(mockAppsData[27]);
                expect(installedTpaAppsOnSiteService.getFirstAppCompPageId(mockPs, '277')).toBeNull();
            });

            it("should return section page id in case there are a section and widget", function() {
                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue(mockAppsData[16]);
                expect(installedTpaAppsOnSiteService.getFirstAppCompPageId(mockPs, "1363adbc-c783-b1e0-d8ef-4a661300ac8c")).toEqual({pageId: '7', compId:'comp2'});
            });

            it("should return the first page for comp installed on a few pages", function() {
                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue(mockAppsData[20]);
                expect(installedTpaAppsOnSiteService.getFirstAppCompPageId(mockPs, "1311c9da-51ef-f7ae-2576")).toEqual({pageId: '1', compId: 'comp5'});

            });

            it("should return first section page id in case there are multiple sections", function() {
                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue(mockAppsData[26]);
                expect(installedTpaAppsOnSiteService.getFirstAppCompPageId(mockPs, "1363adbcrrrrr")).toEqual({pageId: '5', compId: 'comp33'});
            });
        });

        describe('isMainSectionInstalled', function() {
            it("should return false if the app is not installed", function() {
                expect(installedTpaAppsOnSiteService.isMainSectionInstalled(mockPs, "22")).toBeFalsy();
            });

            it("should return false if only widgets are installed", function() {
                expect(installedTpaAppsOnSiteService.isMainSectionInstalled(mockPs, "21")).toBeFalsy();
            });

            it("should return true if main section is installed", function() {
                expect(installedTpaAppsOnSiteService.isMainSectionInstalled(mockPs, "26")).toBeTruthy();
            });

            it("should return true if few main section are installed", function() {
                expect(installedTpaAppsOnSiteService.isMainSectionInstalled(mockPs, "28")).toBeTruthy();
            });

        });

        describe("test getHiddenSections", function() {
            it("should return an empty array if app id does not exists", function() {
                expect(installedTpaAppsOnSiteService.getHiddenSections(mockPs, "22")).toBeNull();
            });

            it("should return null if there are only comps of type section and widget", function() {
                expect(installedTpaAppsOnSiteService.getHiddenSections(mockPs, "28")).toBeNull();
            });

            it("should return one sub sections", function() {
                expect(installedTpaAppsOnSiteService.getHiddenSections(mockPs, "26").length).toEqual(1);
            });
        });

        describe("test getWidgetsByAppId", function() {
            it("should not return widgets if all comps are of type section or multiSection", function() {
                expect(installedTpaAppsOnSiteService.getWidgetsByAppId(mockPs, "26")).toBeNull();
            });

            it("should return no widgets if application id not exists", function() {
                expect(installedTpaAppsOnSiteService.getWidgetsByAppId(mockPs, "22")).toBeNull();
            });

            it("should return few widgets", function() {
                expect(installedTpaAppsOnSiteService.getWidgetsByAppId(mockPs, "20").length).toEqual(2);
            });
        });

        describe("test getAllAppCompsByAppId", function() {
            it("should not return comps if app id does not exists", function() {
                expect(installedTpaAppsOnSiteService.getAllAppCompsByAppId(mockPs, "22")).toBeNull();
            });

            it("should return section and multiSection", function() {
                expect(installedTpaAppsOnSiteService.getAllAppCompsByAppId(mockPs, "26").length).toEqual(4);
            });

            it("should return one widget", function() {
                expect(installedTpaAppsOnSiteService.getAllAppCompsByAppId(mockPs, "21").length).toEqual(1);
            });

            it("should return few widgets", function() {
                expect(installedTpaAppsOnSiteService.getAllAppCompsByAppId(mockPs, "20").length).toEqual(2);
            });

            it("should return no comps if applicationId was not given", function() {
                expect(installedTpaAppsOnSiteService.getAllAppCompsByAppId(mockPs)).toBeNull();
            });

            it("should not return comps if app data is corrupted", function() {
                component.data.get.and.returnValue(undefined);
                expect(installedTpaAppsOnSiteService.getAllAppCompsByAppId(mockPs, "26")).toBeNull();
            });
        });

        describe('getRenderedReactCompsByApplicationId', function () {
            it("should return an empty array if app id does not exists", function() {
                expect(installedTpaAppsOnSiteService.getRenderedReactCompsByApplicationId(mockPs, {}, "22")).toEqual([]);
            });

            it("should return only rendered comps", function() {
                var _siteAPI = {};
                var comp = {};
                _siteAPI.getComponentById = function() {
                    return comp;
                };
                expect(installedTpaAppsOnSiteService.getRenderedReactCompsByApplicationId(mockPs, _siteAPI, "21")).toEqual([comp]);
            });
        });

        describe("test isMultiSectionInstalled", function() {
            it("should return false if application id not exists", function() {
                expect(installedTpaAppsOnSiteService.isMultiSectionInstalled(mockPs, "22")).toBeFalsy();
            });

            it("should return false if only one section installed", function() {
                expect(installedTpaAppsOnSiteService.isMultiSectionInstalled(mockPs, "28")).toBeFalsy();
            });

            it("should return false if no section installed", function() {
                expect(installedTpaAppsOnSiteService.isMultiSectionInstalled(mockPs, "21")).toBeFalsy();
            });

            it("should return true if more than one section is installed", function() {
                expect(installedTpaAppsOnSiteService.isMultiSectionInstalled(mockPs, "26")).toBeTruthy();
            });

            it("should return no comps if applicationId was not given", function() {
                expect(installedTpaAppsOnSiteService.isMultiSectionInstalled(mockPs)).toBeFalsy();
            });

            it("should not return comps if app data is corrupted", function() {
                component.data.get.and.returnValue(undefined);
                expect(installedTpaAppsOnSiteService.isMultiSectionInstalled(mockPs, "26")).toBeFalsy();
            });
        });

        describe('isAppInstalledBy', function () {
            it('should return true if app is installed', function () {
                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue(mockAppsData[26]);
                expect(installedTpaAppsOnSiteService.isAppInstalledBy(mockPs, '123')).toBe(true);
            });

            it('should return false if app def id not exists', function () {
                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue(null);
                expect(installedTpaAppsOnSiteService.isAppInstalledBy(mockPs, '123')).toBe(false);
            });

            it('should return false if app is not installed', function () {
                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue(mockAppsData[22]);
                expect(installedTpaAppsOnSiteService.isAppInstalledBy(mockPs, '123')).toBe(false);
            });

            describe('- demo mode app - app is installed -', function() {
                it('should return true if filterOutDemoMode is true and the app is not in demo mode', function() {
                    spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue(mockAppsData[26]);
                    expect(installedTpaAppsOnSiteService.isAppInstalledBy(mockPs, '123', true)).toBe(true);
                });

                it('should return false if filterOutDemoMode is true and the app is in demo mode', function() {
                    spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue(mockAppsData[29]);
                    expect(installedTpaAppsOnSiteService.isAppInstalledBy(mockPs, '123', true)).toBe(false);
                });

                it('should return true if filterOutDemoMode is false and the app is in demo mode', function() {
                    spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue(mockAppsData[29]);
                    expect(installedTpaAppsOnSiteService.isAppInstalledBy(mockPs, '123')).toBe(true);
                });
            });
        });

        describe('getDeletedAppsIds', function() {
            it('should return no ids if applicationId exists', function() {
                var appData = {
                    21: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 21,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: false
                        },
                        appType: "Editor"
                    }
                };
                clientSpecMapService.getAppsData.and.returnValue(appData);
                expect(installedTpaAppsOnSiteService.getDeletedAppsIds(mockPs)).toEqual([]);
            });

            it('should return id if applicationId not exists and app is hybrid', function() {
                var appData = _.cloneDeep(hybridAppNotInstalled);
                appData[22].appType = 'Hybrid';
                clientSpecMapService.getAppsData.and.returnValue(appData);

                expect(installedTpaAppsOnSiteService.getDeletedAppsIds(mockPs)).toEqual([22]);
            });

            it('should return id if applicationId not exists and app is hybrid', function() {
                var appData = _.cloneDeep(appNotInstalled);
                appData[22].appType = 'Editor';
                clientSpecMapService.getAppsData.and.returnValue(appData);

                expect(installedTpaAppsOnSiteService.getDeletedAppsIds(mockPs)).toEqual([22]);
            });

            it('should return no ids if applicationId not exists but app is not tpa app', function() {
                var appData = _.cloneDeep(appNotInstalled);
                appData[22].appType = 'other';
                clientSpecMapService.getAppsData.and.returnValue(appData);

                expect(installedTpaAppsOnSiteService.getDeletedAppsIds(mockPs)).toEqual([]);
            });
        });

        describe('getAppsDefIdToProvisionOnSiteLoad', function() {
            it('should return no apps if provisionOnSaveSite is true but app is not in demo mode', function() {
                var mockClientSpecMap = {
                    12: {
                        provisionOnSaveSite: true,
                        applicationId: 12,
                        demoMode: false
                    }
                };

                var siteData = privateServicesHelper.getSiteDataWithPages();
                var mockPsWithEmptyPagesData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                clientSpecMapService.getAppsData.and.returnValue(mockClientSpecMap);
                expect(installedTpaAppsOnSiteService.getAppsDefIdToProvisionOnSiteLoad(mockPsWithEmptyPagesData)).toEqual([]);
            });

            it('should return no apps if provisionOnSaveSite is false but app is in demo mode and installed', function() {
                var mockClientSpecMap = {
                    12: {
                        provisionOnSaveSite: false,
                        applicationId: 12,
                        demoMode: true
                    }
                };

                var siteData = privateServicesHelper.getSiteDataWithPages();
                var mockPsWithEmptyPagesData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                clientSpecMapService.getAppsData.and.returnValue(mockClientSpecMap);
                expect(installedTpaAppsOnSiteService.getAppsDefIdToProvisionOnSiteLoad(mockPsWithEmptyPagesData)).toEqual([]);
            });

            it('should return no apps if provisionOnSaveSite is true but app is not installed', function() {
                var mockClientSpecMap = {
                    12: {
                        provisionOnSaveSite: true,
                        applicationId: 12,
                        demoMode: true
                    }
                };
                var siteData = privateServicesHelper.getSiteDataWithPages();
                page.getPageIdList.and.callThrough();
                var mockPsWithEmptyPagesData = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                clientSpecMapService.getAppsData.and.returnValue(mockClientSpecMap);
                expect(installedTpaAppsOnSiteService.getAppsDefIdToProvisionOnSiteLoad(mockPsWithEmptyPagesData)).toEqual([]);
            });

            it('should return apps if all the following conditions are true: provisionOnSaveSite, demoMode and app is installed', function() {
                var mockClientSpecMap = {
                    12: {
                        provisionOnSaveSite: true,
                        applicationId: 12,
                        demoMode: true,
                        appDefinitionId: 'appDef1'
                    }
                };

                clientSpecMapService.getAppsData.and.returnValue(mockClientSpecMap);
                expect(installedTpaAppsOnSiteService.getAppsDefIdToProvisionOnSiteLoad(mockPs)).toEqual([mockClientSpecMap[12].appDefinitionId]);
            });
        });

        describe('getAllAppIdsInstalledOnPages', function() {

            it('should return no ids if apps are not installed', function() {
                var pagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: 'button',
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    type: 'button'
                                },
                                101010: {
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    type: 'text'
                                }
                            }
                        }
                    }
                };

                expect(installedTpaAppsOnSiteService.getAllAppIdsInstalledOnPages(pagesData)).toEqual([]);

            });

            it('should return app ids installed on one page', function() {
                var pagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '26',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };

                expect(installedTpaAppsOnSiteService.getAllAppIdsInstalledOnPages(pagesData)).toEqual(['26']);
            });

            it('should return appIds installed on few pages', function() {

                var pagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '26',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: tpaConstants.COMP_TYPES.TPA_WIDGET,
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: tpaConstants.DATA_TYPE.TPA_WIDGET
                                }
                            }
                        }
                    }
                };

                expect(installedTpaAppsOnSiteService.getAllAppIdsInstalledOnPages(pagesData)).toEqual(['26', '29']);

            });
        });

        describe('areTpaCompsWereUnInstalled', function() {

            it('should return false if tpa comps were added', function() {
                var pagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };
                var updatedPagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '26',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };

                expect(installedTpaAppsOnSiteService.areTpaCompsWereUnInstalled(pagesData, updatedPagesData)).toBeFalsy();
            });

            it('should return false if no tpas were installed', function() {
                var pagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };
                var updatedPagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };

                expect(installedTpaAppsOnSiteService.areTpaCompsWereUnInstalled(pagesData, updatedPagesData)).toBeFalsy();
            });

            it('should return true if tpa was deleted', function() {
                var pagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '26',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };
                var updatedPagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };

                expect(installedTpaAppsOnSiteService.areTpaCompsWereUnInstalled(pagesData, updatedPagesData)).toBeTruthy();
            });

            it('should return true if page with tpa installed was deleted', function() {
                var pagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '26',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };
                var updatedPagesData = {
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };

                var deletedPagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '26',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    }
                };

                expect(installedTpaAppsOnSiteService.areTpaCompsWereUnInstalled(pagesData, updatedPagesData, deletedPagesData)).toBeTruthy();
            });

            it('should return false if page with no tpa installed was deleted', function() {
                var pagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '26',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };
                var deletedPagesData = {
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };

                var updatedPagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '26',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    }
                };

                expect(installedTpaAppsOnSiteService.areTpaCompsWereUnInstalled(pagesData, updatedPagesData, deletedPagesData)).toBeFalsy();
            });

            it('should return true in case one app was added and one app was deleted from the same page', function() {
                var pagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '26',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };
                var updatedPagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '30',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };

                var deletedPagesData = {
                };

                expect(installedTpaAppsOnSiteService.areTpaCompsWereUnInstalled(pagesData, updatedPagesData, deletedPagesData)).toBeTruthy();

            });

            it('should return false in case one app was copied and paste to another page', function() {
                var pagesData = {
                    10: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '26',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };
                var updatedPagesData = {
                    14: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1010',
                                    componentType: tpaConstants.COMP_TYPES.TPA_SECTION,
                                    id: 'comp1010'
                                },
                                {
                                    dataQuery: '#101010',
                                    componentType: 'button',
                                    id: 'comp101010'
                                }
                            ],
                            id: '10'
                        },
                        data: {
                            document_data: {
                                1010: {
                                    applicationId: '26',
                                    type: tpaConstants.DATA_TYPE.TPA_SECTION
                                },
                                101010: {
                                    applicationId: '28',
                                    type: 'button'
                                }
                            }
                        }
                    },
                    11: {
                        structure: {
                            components: [
                                {
                                    dataQuery: '#1020',
                                    componentType: 'text',
                                    id: 'comp1020'
                                }
                            ],
                            id: '11'
                        },
                        data: {
                            document_data: {
                                1020: {
                                    applicationId: '29',
                                    type: 'text'
                                }
                            }
                        }
                    }
                };

                var deletedPagesData = {
                };

                expect(installedTpaAppsOnSiteService.areTpaCompsWereUnInstalled(pagesData, updatedPagesData, deletedPagesData)).toBeFalsy();

            });

        });

        describe('getAppsToGrantPermissions', function() {
            it('should return no apps if app is revoked and installed but not of editor type', function() {
                var appData = {
                    21: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 21,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: true
                        },
                        appType: "Dashboard"
                    }
                };

                var appIdsInstalledOnSite = ['21', '23'];

                expect(installedTpaAppsOnSiteService.getAppsToGrantPermissions(appData, appIdsInstalledOnSite)).toEqual([]);
            });

            it('should return no apps if app is not revoked but installed and of editor type', function() {
                var appData = {
                    21: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 21,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: false
                        },
                        appType: "Editor"
                    }
                };

                var appIdsInstalledOnSite = ['21', '23'];

                expect(installedTpaAppsOnSiteService.getAppsToGrantPermissions(appData, appIdsInstalledOnSite)).toEqual([]);

            });

            it('should return no apps if app is revoked and of editor type but not installed', function() {
                var appData = {
                    21: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 21,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: true
                        },
                        appType: "Editor"
                    }
                };

                var appIdsInstalledOnSite = ['23'];

                expect(installedTpaAppsOnSiteService.getAppsToGrantPermissions(appData, appIdsInstalledOnSite)).toEqual([]);
            });

            it('should return no apps if app is revoked and of editor type but not installed', function() {
                var appData = {
                    21: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 21,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: true
                        },
                        appType: "Editor"
                    }
                };

                var appIdsInstalledOnSite = ['23'];

                expect(installedTpaAppsOnSiteService.getAppsToGrantPermissions(appData, appIdsInstalledOnSite)).toEqual([]);
            });

            it('should return no apps if app is revoked and of editor type but not installed and no apps are installed', function() {
                var appData = {
                    21: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 21,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: true
                        },
                        appType: "Editor"
                    }
                };

                var appIdsInstalledOnSite = [];

                expect(installedTpaAppsOnSiteService.getAppsToGrantPermissions(appData, appIdsInstalledOnSite)).toEqual([]);
            });


            it('should return apps if app is revoked, of editor type and installed', function() {
                var appData = {
                    21: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 21,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: true
                        },
                        appType: "Editor"
                    }
                };

                var appIdsInstalledOnSite = ['21', '23'];

                expect(installedTpaAppsOnSiteService.getAppsToGrantPermissions(appData, appIdsInstalledOnSite)).toEqual([appData['21']]);
            });

            it('should return apps if app is revoked, of hybrid type and installed', function() {
                var appData = {
                    21: {
                        appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                        appDefinitionName: "LiveChat",
                        applicationId: 21,
                        instance: "1234",
                        widgets: {},
                        permissions: {
                            revoked: true
                        },
                        appType: "Hybrid"
                    }
                };

                var appIdsInstalledOnSite = ['21', '23'];

                expect(installedTpaAppsOnSiteService.getAppsToGrantPermissions(appData, appIdsInstalledOnSite)).toEqual([appData['21']]);
            });
        });

        describe('getAppPages', function() {
            it('should return app pages', function() {
                var expectedAppPages = [_.merge(mockPagesData.masterPage.data.document_data[9], {pageId: '9'}), _.merge(mockPagesData.masterPage.data.document_data[10], {pageId: '10'})];
                expect(installedTpaAppsOnSiteService.getAppPages(mockPs, 26)).toEqual(expectedAppPages);
            });

            it('should return no pages if app has no pages', function() {
                expect(installedTpaAppsOnSiteService.getAppPages(mockPs, 22)).toEqual([]);
            });

            it('should return no pages if app is not installed', function() {
                expect(installedTpaAppsOnSiteService.getAppPages(mockPs, 3000)).toEqual([]);
            });
        });
    });
});
