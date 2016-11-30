define(['utils',
    'lodash',
    'documentServices/tpa/services/appStoreService',
    'documentServices/tpa/utils/ProvisionUrlBuilder',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/tpa/services/installedTpaAppsOnSiteService',
    'documentServices/tpa/services/pendingAppsService',
    'documentServices/tpa/utils/tpaUtils',
    'documentServices/tpa/utils/provisionUtils',
    'documentServices/tpa/services/appMarketService',
    'bluebird',
    'documentServices/tpa/bi/errors',
    'documentServices/dataAccessLayer/wixImmutable'
], function(utils, _, appStoreService, provisionUrlBuilder, siteMetadata, clientSpecMapService, privateServicesHelper,
            installedTpaAppsOnSiteService, pendingAppsService, tpaUtils, provisionUtils, appMarketService, Promise, tpaErrors, wixImmutable) {

    'use strict';

    describe('appStoreService', function () {
        var mockPs;
        var lastAppId = 1;
        var appStoreBaseUrl = 'http://editor.wix.com/wix-apps/editor/';



        beforeEach(function () {
            mockPs = privateServicesHelper.mockPrivateServices();
            spyOn(mockPs.dal, 'get').and.returnValue('http://editor.wix.com/wix-apps');
            spyOn(appMarketService, 'getAppMarketDataAsync').and.callFake(function(){
                return Promise.resolve(true);
            });
        });

        describe('add app for site in template', function () {
            var ajaxSpy;

            function getLastArgsFromAjaxSpy() {
                return ajaxSpy.calls.mostRecent().args;
            }

            function getUrlFromAjaxSpy() {
                return getLastArgsFromAjaxSpy()[0].url;
            }

            function getPostDataFromAjaxSpy() {
                return getLastArgsFromAjaxSpy()[0].data;
            }

            beforeEach(function () {
                ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');
                spyOn(clientSpecMapService, 'getLargestApplicationId').and.returnValue(lastAppId);
                spyOn(clientSpecMapService, 'registerAppData');
                spyOn(tpaUtils, 'isSiteSaved').and.returnValue(false);
                spyOn(provisionUtils, 'generateAppFlowsLargestAppId').and.returnValue(1000);
            });

            it('should call the server with the right end point and params', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                appStoreService.preSaveAddApp(mockPs, "appDefinitionId", function () {});
                expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'pre-save-add-apps/template/metaSiteId?accept=json');
                expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                    guids: ['appDefinitionId']
                }));
            });

            it('should call the given success callback if request was successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({
                        success: true,
                        payload: [{}]
                    });
                });

                var callback = jasmine.createSpy('onSuccess');
                appStoreService.preSaveAddApp(mockPs, "appDefinitionId", callback);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith({applicationId : 1000, notProvisioned : true});
            });

            it('should add the app for the pending list if it was pending and the response was successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({
                        success: true,
                        payload: [{
                            applicationId: 1000
                        }]
                    });
                });


                var callback = jasmine.createSpy('callback');
                spyOn(pendingAppsService, 'isPremiumPendingApp').and.returnValue(true);
                spyOn(pendingAppsService, 'add');

                appStoreService.preSaveAddApp(mockPs, "appDefinitionId", callback);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith({applicationId : 1000});
                expect(pendingAppsService.add).toHaveBeenCalledWith({
                    applicationId: 1000
                });
            });

            it('should call the given error callback if request was not successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.error({
                        success: false
                    });
                });


                var callback = jasmine.createSpy('onSuccess');
                appStoreService.preSaveAddApp(mockPs, "appDefinitionId", function () {
                }, callback);
                expect(callback).toHaveBeenCalledWith({success : false});
            });

            describe('general provision features', function(){

                it('should store the appMarket if app type is tpa', function () {
                    utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                        opts.success({
                            success: true,
                            payload: [{
                                appDefinitionId: 'appDefinitionId',
                                type: 'editor'
                            }]
                        });
                    });

                    var callback = jasmine.createSpy('onSuccess');
                    appStoreService.preSaveAddApp(mockPs, "appDefinitionId", callback);
                    expect(callback).toHaveBeenCalled();
                    expect(appMarketService.getAppMarketDataAsync).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String));
                });

                it('should not store the appMarket if app type is not tpa', function () {
                    utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                        opts.success({
                            success: true,
                            payload: [{
                                appDefinitionId: 'appDefinitionId',
                                type: 'appbuilder'
                            }]
                        });
                    });

                    var callback = jasmine.createSpy('onSuccess');
                    appStoreService.preSaveAddApp(mockPs, "appDefinitionId", callback);
                    expect(callback).toHaveBeenCalled();
                    expect(appMarketService.getAppMarketDataAsync).not.toHaveBeenCalled();
                });

                it('should report bi error if app market caching request fails', function(done){
                    utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                        opts.success({
                            success: true,
                            payload: [{}]
                        });
                    });
                    appMarketService.getAppMarketDataAsync.and.callFake(function(){
                        return Promise.reject();
                    });
                    mockPs.siteAPI.reportBI = jasmine.createSpy('reportBi').and.callFake(function(){
                        expect(mockPs.siteAPI.reportBI).toHaveBeenCalledWith(tpaErrors.FAIL_TO_GET_APP_MARKET_DATA);
                        done();
                    });

                    var callback = jasmine.createSpy('onSuccess');
                    appStoreService.preSaveAddApp(mockPs, "appDefinitionId", callback);
                });
            });
        });

        describe('add app to site if marked as installed on sever but not exist on clientSpecMap', function () {
            beforeEach(function () {
                spyOn(utils.ajaxLibrary, 'ajax');
                spyOn(clientSpecMapService, 'registerAppData');
                spyOn(tpaUtils, 'isSiteSaved').and.returnValue(false);
                spyOn(provisionUtils, 'generateAppFlowsLargestAppId').and.returnValue(1000);
            });

            it('should call the given success callback if request was successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({
                        success: true,
                        payload: [{
                            appDefinitionId: 'there-is-no-app-with-that-id',
                            applicationId: 1000
                        }]
                    });
                });

                var callback = jasmine.createSpy('onSuccess');
                appStoreService.preSaveAddApp(mockPs, "appDefinitionId", callback);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith({appDefinitionId: 'there-is-no-app-with-that-id', notProvisioned: true, applicationId: 1000});
            });
        });

        describe('add app for site in user site', function () {
            var ajaxSpy;

            function getLastArgsFromAjaxSpy() {
                return ajaxSpy.calls.mostRecent().args;
            }

            function getUrlFromAjaxSpy() {
                return getLastArgsFromAjaxSpy()[0].url;
            }


            beforeEach(function () {
                ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');
                spyOn(clientSpecMapService, 'getLargestApplicationId').and.returnValue(lastAppId);
                spyOn(clientSpecMapService, 'registerAppData');
                spyOn(tpaUtils, 'isSiteSaved').and.returnValue(true);
                spyOn(provisionUtils, 'generateAppFlowsLargestAppId').and.returnValue(1000);
            });

            it('should call the server with the right end point and params', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                appStoreService.preSaveAddApp(mockPs, "appDefinitionId", function () {
                });
                expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'pre-save-add-app/metaSiteId?accept=json&appDefId=appDefinitionId');
            });

            it('should call the given success callback if request was successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({
                        success: true,
                        payload: {}
                    });
                });

                var callback = jasmine.createSpy('onSuccess');
                appStoreService.preSaveAddApp(mockPs, "appDefinitionId", callback);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith({applicationId : 1000, notProvisioned : true});
            });

            it('should call the given error callback if request was not successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.error({
                        success: false
                    });
                });


                var callback = jasmine.createSpy('callback');
                appStoreService.preSaveAddApp(mockPs, "appDefinitionId", function () {
                }, callback);
                expect(callback).toHaveBeenCalledWith({success : false});
            });
        });

        describe('settle on save and on load', function () {
            var ajaxSpy;
            var emptySiteData = {
                serviceTopology: {
                    appStoreUrl: 'http://editor.wix.com/wix-apps'
                },
                rendererModel: {
                    metaSiteId: 'metaSiteId',
                    clientSpecMap: {
                        siteInfo: {}
                    }
                },
                documentServicesModel: {
                    editorSessionId: 'editorSessionId'
                },
                pagesData: {}
            };

            var siteData = {
                serviceTopology: {
                    appStoreUrl: 'http://editor.wix.com/wix-apps'
                },
                rendererModel: {
                    metaSiteId: 'metaSiteId',
                    clientSpecMap: {
                        siteInfo: {}
                    }
                },
                documentServicesModel: {
                    editorSessionId: 'editorSessionId'
                },
                pagesData: {}
            };

            function getLastArgsFromAjaxSpy() {
                return ajaxSpy.calls.mostRecent().args;
            }

            function getUrlFromAjaxSpy() {
                return getLastArgsFromAjaxSpy()[0].url;
            }

            function getPostDataFromAjaxSpy() {
                return getLastArgsFromAjaxSpy()[0].data;
            }

            beforeEach(function () {
                ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');

            });

            describe('part of pages were updated', function() {
                var lastSiteData, currentSiteData;
                beforeEach(function() {
                    lastSiteData = _.cloneDeep(siteData);
                    lastSiteData.pagesData = {
                        "masterPage": {
                            data: {
                                document_data: {
                                    "dataItem-imujv8c6": {
                                        applicationId: "22",
                                        id: "dataItem-imujv8c6",
                                        type: "TPAWidget",
                                        widgetId: "widget1"
                                    }
                                }
                            },
                            structure: {
                                id: "masterPage",
                                children: [
                                    {
                                        omponentType: "wysiwyg.viewer.components.tpapps.TPAWidget",
                                        dataQuery: "#dataItem-imujv8c6",
                                        id: "comp-imujv4q1",
                                        skin: "wysiwyg.viewer.skins.TPAWidgetSkin",
                                        styleId: "tpaw0",
                                        type: "Component"
                                    }
                                ]
                            }
                        },
                        "page1": {
                            data: {
                                document_data: {
                                    'dataItem-1': {
                                        applicationId: "19",
                                        id: "dataItem-1",
                                        type: "TPAWidget",
                                        widgetId: "widget1"
                                    }
                                }
                            },
                            structure: {
                                id: 'page1',
                                components: [
                                    {
                                        omponentType: "wysiwyg.viewer.components.tpapps.TPAWidget",
                                        dataQuery: "#dataItem-1",
                                        id: "comp-1",
                                        skin: "wysiwyg.viewer.skins.TPAWidgetSkin",
                                        styleId: "tpaw0",
                                        type: "Component"
                                    }
                                ]
                            }
                        },
                        "page2": {
                            data: {
                                document_data: {
                                    'dataItem-1': {
                                        id: "dataItem-1",
                                        type: "text"
                                    }
                                }
                            },
                            structure: {
                                id: 'page2',
                                components: [
                                    {
                                        omponentType: "text",
                                        dataQuery: "#dataItem-1",
                                        id: "comp-1",
                                        skin: "wysiwyg.viewer.skins.TPAWidgetSkin",
                                        styleId: "tpaw0",
                                        type: "Component"
                                    }
                                ]
                            }
                        }
                    };
                    lastSiteData.rendererModel.clientSpecMap = {
                        "19": {

                            appDefinitionId: "appDef1",
                            applicationId: '19',
                            appType: "Editor",
                            permissions: {
                                revoked: false
                            },
                            widgets: {
                                widget1: {

                                }
                            }
                        },
                        "22": {
                            appDefinitionId: "appDef2",
                            applicationId: '22',
                            appType: "Editor",
                            permissions: {
                                revoked: false
                            },
                            widgets: {
                                widget1: {

                                }
                            }
                        }
                    };
                    currentSiteData = _.cloneDeep(siteData);

                    currentSiteData.pagesData = {
                        "masterPage": {
                            data: {
                                document_data: {
                                    "dataItem-imujv8c6": {
                                        applicationId: "22",
                                        id: "dataItem-imujv8c6",
                                        type: "TPAWidget",
                                        widgetId: "widget1"
                                    }
                                }
                            },
                            structure: {
                                id: "masterPage",
                                children: [
                                    {
                                        omponentType: "wysiwyg.viewer.components.tpapps.TPAWidget",
                                        dataQuery: "#dataItem-imujv8c6",
                                        id: "comp-imujv4q1",
                                        skin: "wysiwyg.viewer.skins.TPAWidgetSkin",
                                        styleId: "tpaw0",
                                        type: "Component"
                                    }
                                ]
                            }
                        },
                        "page1": {
                            data: {
                                document_data: {
                                    'dataItem-1': {
                                        applicationId: "19",
                                        id: "dataItem-1",
                                        type: "TPAWidget",
                                        widgetId: "widget1"
                                    },
                                    'dataItem-2': {
                                        applicationId: "20",
                                        id: "dataItem-2",
                                        type: "TPAWidget",
                                        widgetId: "widget2"
                                    }
                                }
                            },
                            structure: {
                                id: "page1",
                                components: [
                                    {
                                        omponentType: "wysiwyg.viewer.components.tpapps.TPAWidget",
                                        dataQuery: "#dataItem-1",
                                        id: "comp-1",
                                        skin: "wysiwyg.viewer.skins.TPAWidgetSkin",
                                        styleId: "tpaw0",
                                        type: "Component"
                                    },
                                    {
                                        omponentType: "wysiwyg.viewer.components.tpapps.TPAWidget",
                                        dataQuery: "#dataItem-2",
                                        id: "comp-2",
                                        skin: "wysiwyg.viewer.skins.TPAWidgetSkin",
                                        styleId: "tpaw0",
                                        type: "Component"
                                    }
                                ]
                            }
                        }
                    };
                    currentSiteData.rendererModel.clientSpecMap = {
                        "19": {
                            appDefinitionId: "appDef1",
                            applicationId: '19',
                            appType: "Editor",
                            permissions: {
                                revoked: false
                            },
                            widgets: {
                                widget1: {

                                }
                            }
                        },
                        "20": {
                            appDefinitionId: "appDef2",
                            applicationId: '20',
                            instanceId: 'instanceId',
                            notProvisioned: true,
                            appType: "Editor",
                            permissions: {
                                revoked: false
                            },
                            widgets: {
                                widget2: {

                                }
                            }
                        },
                        "22": {
                            appDefinitionId: "appDef2",
                            applicationId: '22',
                            appType: "Editor",
                            permissions: {
                                revoked: false
                            },
                            widgets: {
                                widget1: {

                                }
                            }
                        }
                    };
                });
               it('it should only settle on updated pages when app was added', function() {
                   var lastImmutable = wixImmutable.fromJS(lastSiteData);
                   var immutableSiteData = wixImmutable.fromJS(currentSiteData);
                   var onSuccess = jasmine.createSpy('onSuccess');
                   var onError = jasmine.createSpy('onError');
                   spyOn(installedTpaAppsOnSiteService, 'getAllAppIdsInstalledOnPages').and.callThrough();
                   appStoreService.settleOnSave(lastImmutable, immutableSiteData, false, onSuccess, onError);

                   expect(installedTpaAppsOnSiteService.getAllAppIdsInstalledOnPages).toHaveBeenCalledWith({'page1': currentSiteData.pagesData.page1});
                   expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                       actions: [{
                           type: 'add',
                           appDefId: 'appDef2',
                           applicationId: '20',
                           instanceId: 'instanceId'
                       }]
                   }));
               });

                it('it should settle on all pages when app was removed', function() {
                    var current = _.clone(lastSiteData);
                    current.rendererModel.clientSpecMap[20] = currentSiteData.rendererModel.clientSpecMap[20];
                    current.rendererModel.clientSpecMap[20].notProvisioned = false;
                    var lastImmutable = wixImmutable.fromJS(currentSiteData);
                    var immutableSiteData = wixImmutable.fromJS(current);
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    spyOn(installedTpaAppsOnSiteService, 'getAppsToGrantAndRevoke').and.callThrough();
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, false, onSuccess, onError);
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=save&editorSessionId=editorSessionId');
                    expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke).toHaveBeenCalledWith(currentSiteData.rendererModel.clientSpecMap, lastSiteData.pagesData, {});
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [{
                            type: 'remove',
                            applicationId: '20'
                        }]
                    }));
                });

                it('it should settle on all pages when app was removed from master page', function() {
                    var currentData = _.cloneDeep(currentSiteData);
                    currentData.pagesData.masterPage.data.document_data = {};
                    currentData.pagesData.masterPage.structure.children = [];
                    var lastImmutable = wixImmutable.fromJS(lastSiteData);
                    var immutableSiteData = wixImmutable.fromJS(currentData);
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    spyOn(installedTpaAppsOnSiteService, 'getAllAppIdsInstalledOnPages').and.callThrough();
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, false, onSuccess, onError);

                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [{
                            type: 'add',
                            appDefId: 'appDef2',
                            applicationId: '20',
                            instanceId: 'instanceId'
                        }, {
                            type: 'remove',
                            applicationId: '22'
                        }]
                    }));
                });

                it('it should only settle on updated pages when app was added and its permission is revoked', function() {
                    currentSiteData.rendererModel.clientSpecMap[20].notProvisioned = undefined;
                    currentSiteData.rendererModel.clientSpecMap[20].permissions.revoked = true;
                    var lastImmutable = wixImmutable.fromJS(lastSiteData);
                    var immutableSiteData = wixImmutable.fromJS(currentSiteData);
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    spyOn(installedTpaAppsOnSiteService, 'getAllAppIdsInstalledOnPages').and.callThrough();
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, false, onSuccess, onError);
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=save&editorSessionId=editorSessionId');
                    expect(installedTpaAppsOnSiteService.getAllAppIdsInstalledOnPages).toHaveBeenCalledWith({'page1': currentSiteData.pagesData.page1});
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [{
                            type: 'add',
                            appDefId: 'appDef2',
                            applicationId: '20',
                            instanceId: 'instanceId'
                        }]
                    }));
                });

                it('it should only settle on updated pages when demo app was provisioned', function() {
                    currentSiteData.rendererModel.clientSpecMap[20].notProvisioned = true;
                    currentSiteData.rendererModel.clientSpecMap[20].instance = 'KZL9u5Ho0JgRPMev3fsyidFueoydpF7VEOKNIkRwMQE.eyJpbnN0YW5jZUlkIjoiMjA5YjU5NjYtZGFmMS00NTU0LWFlMjQtYTgxNDhjZjU4Nzk5Iiwic2lnbkRhdGUiOiIyMDE2LTA3LTMxVDEyOjEyOjMwLjAzM1oiLCJ1aWQiOiJiMmQ3ZGYzNS0yNTRiLTRiYWYtODQ5Mi00YzNjNTU4YmE2ZTgiLCJwZXJtaXNzaW9ucyI6Ik9XTkVSIiwiaXBBbmRQb3J0IjoiOTEuMTk5LjExOS40MS8zMzM0MCIsInZlbmRvclByb2R1Y3RJZCI6bnVsbCwiZGVtb01vZGUiOmZhbHNlLCJvcmlnaW5JbnN0YW5jZUlkIjoiYjQ2MTVjYjItNGU5OS00ZjM1LTkzMzAtOGU1YWZlYzk3ODQ1IiwiYmlUb2tlbiI6ImNhNzY4NzA0LTVlMjEtMGM2Ni0wODA2LTgzM2U4Nzk5YjUwMSIsInNpdGVPd25lcklkIjoiYjJkN2RmMzUtMjU0Yi00YmFmLTg0OTItNGMzYzU1OGJhNmU4In0';
                    var lastImmutable = wixImmutable.fromJS(currentSiteData);
                    var immutableSiteData = wixImmutable.fromJS(currentSiteData);
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    spyOn(installedTpaAppsOnSiteService, 'getAllAppIdsInstalledOnPages').and.callThrough();
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, false, onSuccess, onError);
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=save&editorSessionId=editorSessionId');
                    expect(installedTpaAppsOnSiteService.getAllAppIdsInstalledOnPages).toHaveBeenCalledWith({});
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [{
                            type: 'add',
                            appDefId: 'appDef2',
                            applicationId: '20',
                            instanceId: 'instanceId'
                        }]
                    }));
                });

                it('should settle on all pages when page with app installed on it was deleted', function() {
                    var current = _.cloneDeep(currentSiteData);
                    delete current.pagesData.page1;
                    current.rendererModel.clientSpecMap[20] = currentSiteData.rendererModel.clientSpecMap[20];
                    current.rendererModel.clientSpecMap[20].notProvisioned = false;
                    var lastImmutable = wixImmutable.fromJS(currentSiteData);
                    var immutableSiteData = wixImmutable.fromJS(current);
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    spyOn(installedTpaAppsOnSiteService, 'getAppsToGrantAndRevoke').and.callThrough();
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, false, onSuccess, onError);
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=save&editorSessionId=editorSessionId');
                    expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke).toHaveBeenCalledWith(currentSiteData.rendererModel.clientSpecMap, current.pagesData, {});
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [{
                            type: 'remove',
                            applicationId: '19'
                        }, {
                            type: 'remove',
                            applicationId: '20'
                        }]
                    }));
                });

                it('should settle on updated pages when page with no app installed on it was deleted', function() {
                    var lastImmutable = wixImmutable.fromJS(lastSiteData);
                    var immutableSiteData = wixImmutable.fromJS(currentSiteData);
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    spyOn(installedTpaAppsOnSiteService, 'getAllAppIdsInstalledOnPages').and.callThrough();
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, false, onSuccess, onError);

                    expect(installedTpaAppsOnSiteService.getAllAppIdsInstalledOnPages).toHaveBeenCalledWith({'page1': currentSiteData.pagesData.page1});
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [{
                            type: 'add',
                            appDefId: 'appDef2',
                            applicationId: '20',
                            instanceId: 'instanceId'
                        }]
                    }));
                });
            });

            describe('site saved and app was added', function () {
                it('should call the server with the right end point, query params and data', function () {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    var _siteData = _.cloneDeep(siteData);
                    _siteData.rendererModel.clientSpecMap[0] = {
                        notProvisioned: true,
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId'
                    };

                    spyOn(clientSpecMapService, 'filterApps').and.returnValue(_siteData.rendererModel.clientSpecMap);

                    var lastImmutable = wixImmutable.fromJS(emptySiteData);
                    var immutableSiteData = wixImmutable.fromJS(_siteData);
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, true, onSuccess, onError);
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=firstSave&editorSessionId=editorSessionId');
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [{
                            type: 'add',
                            appDefId: 'appDefinitionId',
                            applicationId: 'applicationId',
                            instanceId: 'instanceId'
                        }]
                    }));
                });
            });

            describe('site saved and app was added and another app was removed', function () {
                it('should call the server with the right end point, query params and data', function () {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    var _siteData = _.cloneDeep(siteData);
                    _siteData.rendererModel.clientSpecMap[0] = {
                        notProvisioned: true,
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId'
                    };
                    _siteData.rendererModel.clientSpecMap[1] = {
                        appDefinitionId: 'appDefinitionId1',
                        applicationId: 'applicationId1',
                        instanceId: 'instanceId1'
                    };
                    _siteData.pagesData = {
                        "masterPage": {},
                        "page1": {}
                    };

                    spyOn(installedTpaAppsOnSiteService, 'getAppsToGrantAndRevoke').and.returnValue({revoke: [_siteData.rendererModel.clientSpecMap[1]], grant: []});
                    spyOn(clientSpecMapService, 'filterApps').and.returnValue(_siteData.rendererModel.clientSpecMap);

                    var lastImmutable = wixImmutable.fromJS(emptySiteData);
                    var immutableSiteData = wixImmutable.fromJS(_siteData);
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, true, onSuccess, onError);
                    expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke).toHaveBeenCalledWith(_siteData.rendererModel.clientSpecMap, _siteData.pagesData, {});
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=firstSave&editorSessionId=editorSessionId');
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [
                            {
                                type: 'add',
                                appDefId: 'appDefinitionId',
                                applicationId: 'applicationId',
                                instanceId: 'instanceId'
                            },
                            {
                                type: 'remove',
                                applicationId: 'applicationId1'
                            }
                        ]
                    }));
                });
            });

            describe('site saved and app was added and immediately removed', function () {
                it('should not call the server', function () {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    var _siteData = _.cloneDeep(siteData);
                    _siteData.rendererModel.clientSpecMap[0] = {
                        notProvisioned: true,
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId'
                    };

                    spyOn(clientSpecMapService, 'filterApps').and.returnValue(_siteData.rendererModel.clientSpecMap);

                    var lastImmutable = wixImmutable.fromJS(emptySiteData);
                    var immutableSiteData = wixImmutable.fromJS(_siteData);
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, false, onSuccess, onError);
                    expect(ajaxSpy).not.toHaveBeenCalled();
                });
            });

            describe('site saved and two different apps where added one of them immediately removed', function () {
                it('should call the server with the right end point, query params and data', function () {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    var _siteData = _.cloneDeep(siteData);
                    _siteData.rendererModel.clientSpecMap[0] = {
                        notProvisioned: true,
                        appDefinitionId: 'appDefinitionId1',
                        applicationId: 'applicationId1',
                        instanceId: 'instanceId1'
                    };
                    _siteData.rendererModel.clientSpecMap[1] = {
                        notProvisioned: true,
                        appDefinitionId: 'appDefinitionId2',
                        applicationId: 'applicationId2',
                        instanceId: 'instanceId2'
                    };

                    spyOn(installedTpaAppsOnSiteService, 'getAppsToGrantAndRevoke').and.returnValue({revoke: [_siteData.rendererModel.clientSpecMap[0]], grant: []});
                    spyOn(clientSpecMapService, 'filterApps').and.returnValue(_siteData.rendererModel.clientSpecMap);

                    var lastImmutable = wixImmutable.fromJS(emptySiteData);
                    var immutableSiteData = wixImmutable.fromJS(_siteData);
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, true, onSuccess, onError);
                    expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke).toHaveBeenCalledWith(_siteData.rendererModel.clientSpecMap, _siteData.pagesData, {});
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=firstSave&editorSessionId=editorSessionId');
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [
                            {
                                type: 'add',
                                appDefId: 'appDefinitionId2',
                                applicationId: 'applicationId2',
                                instanceId: 'instanceId2'
                            }
                        ]
                    }));
                });
            });

            describe('site saved and app was already provisioned but revoked and app was jsut added', function () {
                it('should call the server with the right end point, query params and data', function () {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    var _siteData = _.cloneDeep(siteData);
                    _siteData.rendererModel.clientSpecMap[0] = {
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId'
                    };

                    spyOn(installedTpaAppsOnSiteService, 'getAppsToGrantAndRevoke').and.returnValue({grant: [_siteData.rendererModel.clientSpecMap[0]], revoke: []});
                    spyOn(clientSpecMapService, 'filterApps').and.returnValue(_siteData.rendererModel.clientSpecMap);

                    var lastImmutable = wixImmutable.fromJS(emptySiteData);
                    var immutableSiteData = wixImmutable.fromJS(_siteData);
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, true, onSuccess, onError);

                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=firstSave&editorSessionId=editorSessionId');
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [
                            {
                                type: 'add',
                                appDefId: 'appDefinitionId',
                                applicationId: 'applicationId',
                                instanceId: 'instanceId'
                            }
                        ]
                    }));
                });
            });

            describe('site saved and app was dismissed', function () {
                it('should call the server with the right end point, query params and data', function () {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    var _siteData = _.cloneDeep(siteData);
                    _siteData.rendererModel.clientSpecMap[0] = {
                        notProvisioned: true,
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId'
                    };
                    _siteData.rendererModel.clientSpecMap[1] = {
                        appDefinitionId: 'appDefinitionId1',
                        applicationId: 'applicationId1',
                        instanceId: 'instanceId1'
                    };
                    _siteData.rendererModel.clientSpecMap[2] = {
                        appDefinitionId: 'appDefinitionId2'
                    };

                    spyOn(installedTpaAppsOnSiteService, 'getAppsToGrantAndRevoke').and.returnValue({revoke:[_siteData.rendererModel.clientSpecMap[1]], grant:[]});
                    spyOn(pendingAppsService, 'getAppsToDismiss').and.returnValue(['appDefinitionId2']);
                    spyOn(clientSpecMapService, 'filterApps').and.returnValue(_siteData.rendererModel.clientSpecMap);


                    var lastImmutable = wixImmutable.fromJS(emptySiteData);
                    var immutableSiteData = wixImmutable.fromJS(_siteData);
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, true, onSuccess, onError);
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=firstSave&editorSessionId=editorSessionId');
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [
                            {
                                type: 'add',
                                appDefId: 'appDefinitionId',
                                applicationId: 'applicationId',
                                instanceId: 'instanceId'
                            },
                            {
                                type: 'remove',
                                applicationId: 'applicationId1'
                            },
                            {
                                type: 'dismiss',
                                appDefId: 'appDefinitionId2'
                            }
                        ]
                    }));
                });
            });

            describe('site was never saved and app was added', function () {
                it('should call the server with the right end point, query params and data', function () {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    var _siteData = _.cloneDeep(siteData);
                    _siteData.rendererModel.clientSpecMap[0] = {
                        notProvisioned: true,
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId'
                    };

                    spyOn(clientSpecMapService, 'filterApps').and.returnValue(_siteData.rendererModel.clientSpecMap);

                    var lastImmutable = wixImmutable.fromJS(emptySiteData);
                    var immutableSiteData = wixImmutable.fromJS(_siteData);
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, true, onSuccess, onError);
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=firstSave&editorSessionId=editorSessionId');
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [{
                            type: 'add',
                            appDefId: 'appDefinitionId',
                            applicationId: 'applicationId',
                            instanceId: 'instanceId'
                        }]
                    }));
                });
            });

            describe('site was never saved and no apps were added', function () {
                it('should call the server with the right end point, query params and data', function () {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    var _siteData = _.cloneDeep(siteData);

                    spyOn(clientSpecMapService, 'filterApps').and.returnValue(_siteData.rendererModel.clientSpecMap);

                    var lastImmutable = wixImmutable.fromJS(emptySiteData);
                    var immutableSiteData = wixImmutable.fromJS(_siteData);
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, true, onSuccess, onError);
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=firstSave&editorSessionId=editorSessionId');
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: []
                    }));
                });
            });

            xdescribe('site was never saved and demo app flag provisionOnSaveSite is on', function () {
                it('should call the server with the right end point, query params and data', function () {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    var _siteData = _.cloneDeep(siteData);

                    var appData = {
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId'
                    };

                    spyOn(installedTpaAppsOnSiteService, 'getAppsToProvisionOnSaveSite').and.returnValue([appData]);
                    spyOn(clientSpecMapService, 'filterApps').and.returnValue(_siteData.rendererModel.clientSpecMap);

                    var lastImmutable = wixImmutable.fromJS(emptySiteData);
                    var immutableSiteData = wixImmutable.fromJS(_siteData);
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, true, onSuccess, onError);
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=firstSave&editorSessionId=editorSessionId');
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [{
                            type: 'add',
                            appDefId: 'appDefinitionId',
                            applicationId: 'applicationId',
                            instanceId: 'instanceId'
                        }]
                    }));
                });
            });

            describe('site was never saved app was added and another app was removed', function () {
                it('should call the server with the right end point, query params and data', function () {
                    var onSuccess = jasmine.createSpy('onSuccess');
                    var onError = jasmine.createSpy('onError');
                    var _siteData = _.cloneDeep(siteData);
                    _siteData.rendererModel.clientSpecMap[0] = {
                        notProvisioned: true,
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId'
                    };
                    _siteData.rendererModel.clientSpecMap[1] = {
                        appDefinitionId: 'appDefinitionId1',
                        applicationId: 'applicationId1',
                        instanceId: 'instanceId1'
                    };

                    spyOn(installedTpaAppsOnSiteService, 'getAppsToGrantAndRevoke').and.returnValue({revoke: [_siteData.rendererModel.clientSpecMap[1]], grant: []});
                    spyOn(clientSpecMapService, 'filterApps').and.returnValue(_siteData.rendererModel.clientSpecMap);

                    var lastImmutable = wixImmutable.fromJS(emptySiteData);
                    var immutableSiteData = wixImmutable.fromJS(_siteData);
                    appStoreService.settleOnSave(lastImmutable, immutableSiteData, true, onSuccess, onError);
                    expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=firstSave&editorSessionId=editorSessionId');
                    expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                        actions: [
                            {
                                type: 'add',
                                appDefId: 'appDefinitionId',
                                applicationId: 'applicationId',
                                instanceId: 'instanceId'
                            },
                            {
                                type: 'remove',
                                applicationId: 'applicationId1'
                            }
                        ]
                    }));
                });
            });

            describe('site on load', function () {
                var _mockPs, mockAppData;
                beforeEach(function () {
                    mockAppData = {
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId'
                    };
                    var mockSiteData = {
                        serviceTopology: {
                            appStoreUrl: 'http://editor.wix.com/wix-apps'
                        },
                        documentServicesModel: {
                            editorSessionId: 'editorSessionId'
                        },
                        rendererModel: {
                            metaSiteId: 'metaSiteId',
                            clientSpecMap: {
                                0: mockAppData
                            },
                            siteInfo: {}
                        },
                        pagesData: {}
                    };
                    _mockPs = mockPs;
                    var InitialSiteDataSnapshot = wixImmutable.fromJS(mockSiteData);
                    _mockPs.dal.full.immutable = {
                        getInitialSnapshot: function() {
                            return InitialSiteDataSnapshot;
                        }
                    };
                });

                describe('site loaded and app has no components', function () {
                    it('should call the server with the right end point, query params and data', function () {
                        var csm = _mockPs.siteAPI.getClientSpecMap();
                        spyOn(installedTpaAppsOnSiteService, 'getAppsToGrantAndRevoke').and.returnValue({revoke: [mockAppData], grant: []});
                        spyOn(clientSpecMapService, 'filterApps').and.returnValue(csm);

                        appStoreService.settleOnLoad(_mockPs);

                        expect(installedTpaAppsOnSiteService.getAppsToGrantAndRevoke).toHaveBeenCalledWith(csm, {}, {
                            excludeHybrid: true
                        });
                        expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=load&editorSessionId=editorSessionId');
                        expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                            actions: [{
                                type: 'remove',
                                applicationId: 'applicationId'
                            }]
                        }));
                    });

                    it('should not call the server when app has no components but it is an hybrid app', function () {
                        spyOn(installedTpaAppsOnSiteService, 'getAppsToGrantAndRevoke').and.returnValue({revoke: [], grant: []});
                        appStoreService.settleOnLoad(_mockPs);
                        expect(ajaxSpy).not.toHaveBeenCalled();
                    });
                });

                describe('site loaded and app has components but permission is revoked', function () {
                    it('should call the server with the right end point, query params and data', function () {
                        var csm = _mockPs.siteAPI.getClientSpecMap();
                        spyOn(installedTpaAppsOnSiteService, 'getAppsToGrantAndRevoke').and.returnValue({grant: [mockAppData], revoke: []});
                        spyOn(clientSpecMapService, 'filterApps').and.returnValue(csm);

                        appStoreService.settleOnLoad(_mockPs);
                        expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'settle/metaSiteId?accept=json&context=load&editorSessionId=editorSessionId');
                        expect(getPostDataFromAjaxSpy()).toEqual(JSON.stringify({
                            actions: [{
                                type: 'add',
                                appDefId: 'appDefinitionId',
                                applicationId: 'applicationId',
                                instanceId: 'instanceId'
                            }]
                        }));
                    });
                });
            });
        });

        describe('pre save add apps on load', function() {
            var mockClientSpecMap, mockSiteData;

            var ajaxSpy, mockPrivateServices;

            function getLastArgsFromAjaxSpy() {
                return ajaxSpy.calls.mostRecent().args;
            }

            function getUrlFromAjaxSpy() {
                return getLastArgsFromAjaxSpy()[0].url;
            }

            function getPostDataFromAjaxSpy() {
                return getLastArgsFromAjaxSpy()[0].data;
            }

            var comps = [
                    {"id": "tpaComp1", "dataQuery": '#comp1', "type": "Component", "layout": {"width":155, "height":144, "x":228, "y":88, "rotationInDegrees":0, "anchors":[]}, "componentType": "wysiwyg.viewer.components.tpapps.TPAWidget"}
                   ];
            beforeEach(function () {
                mockSiteData = privateServicesHelper.getSiteDataWithPages({mainPage: {components: comps, data: {
                        'comp1': {
                            applicationId: 'applicationId',
                            type: 'TPA'
                        }
                }}});
                mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');
                spyOn(clientSpecMapService, 'getLargestApplicationId').and.returnValue(lastAppId);
                spyOn(clientSpecMapService, 'registerAppData');
                spyOn(tpaUtils, 'isSiteSaved').and.returnValue(false);
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
            });

            it('should not provision on load in case the site is already saved', function() {
                mockClientSpecMap = {
                    0: {
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId',
                        demoMode: true,
                        provisionOnSaveSite: true
                    }
                };
                spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockClientSpecMap);
                tpaUtils.isSiteSaved.and.returnValue(true);
                appStoreService.preSaveAddAppsOnLoad(mockPrivateServices);
                expect(ajaxSpy).not.toHaveBeenCalled();
            });

            it('should call the server with the right end point and params', function () {
                mockClientSpecMap = {
                    0: {
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId',
                        demoMode: true,
                        provisionOnSaveSite: true
                    }
                };
                spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockClientSpecMap);
                appStoreService.preSaveAddAppsOnLoad(mockPrivateServices);
                expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'pre-save-add-apps/template/metaSiteId?accept=json');
                expect(getPostDataFromAjaxSpy()).toEqual('{"guids":["appDefinitionId"]}');
            });

            describe('should do nothing if there are no app to provision on load', function() {
                it('app with only provisionOnSaveSite true', function() {
                    mockClientSpecMap = {
                        0: {
                            appDefinitionId: 'appDefinitionId',
                            applicationId: 'applicationId',
                            instanceId: 'instanceId',
                            demoMode: false,
                            provisionOnSaveSite: true
                        }
                    };
                    spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockClientSpecMap);
                    appStoreService.preSaveAddAppsOnLoad(mockPrivateServices);
                    expect(ajaxSpy).not.toHaveBeenCalled();
                });

                it('app with only demoMode true', function() {
                    mockClientSpecMap = {
                        0: {
                            appDefinitionId: 'appDefinitionId',
                            applicationId: 'applicationId',
                            instanceId: 'instanceId',
                            demoMode: true,
                            provisionOnSaveSite: false
                        }
                    };

                    spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockClientSpecMap);
                    appStoreService.preSaveAddAppsOnLoad(mockPrivateServices);
                    expect(ajaxSpy).not.toHaveBeenCalled();
                });

                it('app with no properties of demoMode and provisionOnSaveSite', function() {
                    mockClientSpecMap = {
                        0: {
                            appDefinitionId: 'appDefinitionId',
                            applicationId: 'applicationId',
                            instanceId: 'instanceId',
                            demoMode: false,
                            provisionOnSaveSite: false
                        }
                    };
                    spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockClientSpecMap);
                    appStoreService.preSaveAddAppsOnLoad(mockPrivateServices);
                    expect(ajaxSpy).not.toHaveBeenCalled();
                });
            });

            it('should not update app data if the request was failed', function() {
                ajaxSpy.and.callFake(function(params) {
                    params.error();
                });

                mockClientSpecMap = {
                    0: {
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId',
                        demoMode: true,
                        provisionOnSaveSite: true
                    }
                };
                spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockClientSpecMap);
                appStoreService.preSaveAddAppsOnLoad(mockPrivateServices);
                expect(clientSpecMapService.registerAppData).not.toHaveBeenCalled();
            });

            it('should not update app data if the request returned response with no success', function() {
                var response = {

                };

                ajaxSpy.and.callFake(function(params) {
                    params.success(response);
                });

                mockClientSpecMap = {
                    0: {
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId',
                        demoMode: true,
                        provisionOnSaveSite: true
                    }
                };
                spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockClientSpecMap);
                appStoreService.preSaveAddAppsOnLoad(mockPrivateServices);
                expect(clientSpecMapService.registerAppData).not.toHaveBeenCalled();
            });

            it('should update app data of one app with demoMode false and notProvisioned true', function() {
                var newAppData = {
                    appDefinitionId: 'appDefinitionId',
                    applicationId: 'applicationId',
                    instanceId: 'instanceId',
                    demoMode: false,
                    provisionOnSaveSite: true
                };

                var response = {
                    success: true,
                    payload: [newAppData]
                };

                ajaxSpy.and.callFake(function(params) {
                    params.success(response);
                });

                mockClientSpecMap = {
                    0: {
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId',
                        demoMode: true,
                        provisionOnSaveSite: true
                    }
                };
                spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockClientSpecMap);
                appStoreService.preSaveAddAppsOnLoad(mockPrivateServices);
                newAppData.notProvisioned = true;
                expect(clientSpecMapService.registerAppData).toHaveBeenCalledWith(mockPrivateServices, newAppData);
            });

            it('should update multiple apps data with demoMode false and notProvisioned true', function() {
                var newAppData1 = {
                    appDefinitionId: 'appDefinitionId',
                    applicationId: 'applicationId',
                    instanceId: 'instanceId',
                    demoMode: false,
                    provisionOnSaveSite: true
                };

                var newAppData2 = {
                    appDefinitionId: 'appDefinitionId',
                    applicationId: 'applicationId',
                    instanceId: 'instanceId',
                    demoMode: false,
                    provisionOnSaveSite: true
                };


                var response = {
                    success: true,
                    payload: [newAppData1, newAppData2]

                };

                ajaxSpy.and.callFake(function(params) {
                    params.success(response);
                });

                mockClientSpecMap = {
                    0: {
                        appDefinitionId: 'appDefinitionId',
                        applicationId: 'applicationId',
                        instanceId: 'instanceId',
                        demoMode: true,
                        provisionOnSaveSite: true
                    },
                    1: {
                        appDefinitionId: 'appDefinitionId2',
                        applicationId: 'applicationId2',
                        instanceId: 'instanceId',
                        demoMode: true,
                        provisionOnSaveSite: true
                    }
                };
                spyOn(clientSpecMapService, 'getAppsData').and.returnValue(mockClientSpecMap);
                appStoreService.preSaveAddAppsOnLoad(mockPrivateServices);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalledWith(mockPrivateServices, newAppData1);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalledWith(mockPrivateServices, newAppData2);
            });
        });

        describe('provisionAppFromSourceTemplate', function () {
            var ajaxSpy;

            function getLastArgsFromAjaxSpy() {
                return ajaxSpy.calls.mostRecent().args;
            }

            function getUrlFromAjaxSpy() {
                return getLastArgsFromAjaxSpy()[0].url;
            }

            beforeEach(function () {
                ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');
                spyOn(clientSpecMapService, 'registerAppData');
            });
            it('should return onError if site is not saved', function () {
                var callback = jasmine.createSpy('callback');
                spyOn(tpaUtils, 'isSiteSaved').and.returnValue(false);
                appStoreService.provisionAppFromSourceTemplate(mockPs, "appDefinitionId", "sourceTemplateId", _.noop, callback);
                expect(callback).toHaveBeenCalledWith({success : false});
            });

            it('should call the server with the right end point and params', function () {
                spyOn(tpaUtils, 'isSiteSaved').and.returnValue(true);
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                appStoreService.provisionAppFromSourceTemplate(mockPs, "appDefinitionId", "sourceTemplateId", _.noop, _.noop);
                expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'provision-from-source-template/metaSiteId?accept=json&appDefId=appDefinitionId&sourceTemplateId=sourceTemplateId');
            });

            it('should call the given success callback if request was successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({
                        success: true,
                        payload: {
                            applicationId: 1000,
                            foo: 'bar'
                        }
                    });
                });

                spyOn(tpaUtils, 'isSiteSaved').and.returnValue(true);
                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue({
                    applicationId: '1000'
                });
                var callback = jasmine.createSpy('onSuccess');
                appStoreService.provisionAppFromSourceTemplate(mockPs, "appDefinitionId", "sourceTemplateId", callback, _.noop);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith({
                    applicationId: 1000,
                    foo: 'bar'
                });
            });
        });
    });
});
