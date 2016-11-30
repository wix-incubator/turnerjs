define(['utils',
    'lodash',
    'bluebird',
    'documentServices/tpa/services/provisionService',
    'documentServices/tpa/utils/ProvisionUrlBuilder',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/services/appMarketService',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/tpa/bi/errors'
], function(utils, _, Promise, provisionService, provisionUrlBuilder, siteMetadata, clientSpecMapService, appMarketService, privateServicesHelper, tpaErrors){
    'use strict';

    describe('provisionService spec', function () {
        var mockPs;
        var lastAppId = 1;
        var appStoreBaseUrl = 'http://editor.wix.com/wix-apps/appStore/';

        beforeEach(function () {
            mockPs = privateServicesHelper.mockPrivateServices();
            spyOn(mockPs.dal, 'get').and.returnValue('http://editor.wix.com/wix-apps');
        });

        describe('provisionAppAfterSave', function () {
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
            });

            it('should call the server with the given meta site id and accept json query param', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                provisionService.provisionAppAfterSave(mockPs, "appDefinitionId", function () {
                }, function () {
                });
                expect(getUrlFromAjaxSpy()).toEqual( appStoreBaseUrl + 'provision/appDefinitionId?accept=json&metaSiteId=metaSiteId');
            });

            it('should call the given success callback if request was successful', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({
                        success: true,
                        payload: {}
                    });
                });


                var callback = jasmine.createSpy('callback');
                provisionService.provisionAppAfterSave(mockPs, "appDefinitionId", callback);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
            });

            it('should call the given success callback if storing the appMarketData failed but request was successful', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                spyOn(appMarketService, 'getAppMarketDataAsync').and.callFake(function(){
                    return Promise.reject(true);
                });

                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({
                        success: true,
                        payload: {}
                    });
                });


                var callback = jasmine.createSpy('onSuccess');
                provisionService.provisionAppAfterSave(mockPs, "appDefinitionId", callback);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith({applicationId : lastAppId + 1, notProvisioned : true});
            });

            it('should not throw error if storing the appMarketData failed with error', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                spyOn(appMarketService, 'getAppMarketDataAsync').and.callFake(function(){
                    return new Promise(function () {
                        throw new Error('cache app market data error');
                    });
                });

                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({
                        success: true,
                        payload: {
                            type: 'editor'
                        }
                    });
                });

                var callback = jasmine.createSpy('onSuccess');

                expect(provisionService.provisionAppAfterSave.bind(null, mockPs, "appDefinitionId", callback)).not.toThrow();
            });

            it('should call the given error callback if request was not successful', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');

                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.error({
                        success: false
                    });
                });


                var callback = jasmine.createSpy('callback');
                provisionService.provisionAppAfterSave(mockPs, "appDefinitionId", function () {
                }, callback);
                expect(callback).toHaveBeenCalledWith({success : false});
            });

            describe('general provision features', function(){
                it('should report bi error if app market caching request fails', function(done){
                    utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                        opts.success({
                            success: true,
                            payload: {}
                        });
                    });
                    spyOn(appMarketService, 'getAppMarketDataAsync').and.callFake(function(){
                        return Promise.reject();
                    });
                    mockPs.siteAPI.reportBI = jasmine.createSpy('reportBi').and.callFake(function(){
                        expect(mockPs.siteAPI.reportBI).toHaveBeenCalledWith(tpaErrors.FAIL_TO_GET_APP_MARKET_DATA);
                        done();
                    });

                    var callback = jasmine.createSpy('onSuccess');
                    provisionService.provisionAppAfterSave(mockPs, "appDefinitionId", callback);
                });

                it('should store the appMarket if app type is tpa', function () {
                    spyOn(appMarketService, 'getAppMarketDataAsync').and.callFake(function(){
                        return Promise.resolve(true);
                    });

                    utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                        opts.success({
                            success: true,
                            payload: {
                                appDefinitionId: 'appDefinitionId',
                                type: 'editor'
                            }
                        });
                    });

                    var callback = jasmine.createSpy('onSuccess');

                    provisionService.provisionAppAfterSave(mockPs, "appDefinitionId", callback);
                    expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
                    expect(appMarketService.getAppMarketDataAsync).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String));
                });

                it('should not store the appMarket if app type is not tpa', function () {
                    spyOn(appMarketService, 'getAppMarketDataAsync').and.callFake(function(){
                        return Promise.resolve(true);
                    });

                    utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                        opts.success({
                            success: true,
                            payload: {
                                appDefinitionId: 'appDefinitionId',
                                type: 'appbuilder'
                            }
                        });
                    });

                    var callback = jasmine.createSpy('onSuccess');

                    provisionService.provisionAppAfterSave(mockPs, "appDefinitionId", callback);
                    expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
                    expect(appMarketService.getAppMarketDataAsync).not.toHaveBeenCalled();
                });
            });
        });

        describe('provisionAppBeforeSave', function () {
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
            });

            it('should call the server with accept json query param', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                provisionService.provisionAppBeforeSave(mockPs, "appDefinitionId", function () {
                    });
                expect(getUrlFromAjaxSpy()).toEqual( appStoreBaseUrl + 'pre-save-provision/appDefinitionId?accept=json');
            });

            it('should call the given success callback if request was successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({
                        success: true,
                        payload: {}
                    });
                });


                var callback = jasmine.createSpy('onSuccess');
                provisionService.provisionAppBeforeSave(mockPs, "appDefinitionId", callback);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith({applicationId : lastAppId + 1, notProvisioned : true});
            });

            it('should call the given error callback if request was not successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.error({
                        success: false
                    });
                });


                var callback = jasmine.createSpy('callback');
                provisionService.provisionAppBeforeSave(mockPs, "appDefinitionId", function () {
                }, callback);
                expect(callback).toHaveBeenCalledWith({success : false});
            });
        });

        describe('provision demo app before first save', function () {
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
            });

            it('should call the server with accept json query param', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                provisionService.provisionAppDemoBeforeSave(mockPs, 14, function () {
                });
                expect(getUrlFromAjaxSpy()).toEqual( appStoreBaseUrl + 'demo/pre-save-provision/metaSiteId/14?accept=json');
            });

            it('should call the given success callback if request was successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({
                        success: true,
                        payload: {}
                    });
                });

                var callback = jasmine.createSpy('onSuccess');
                provisionService.provisionAppBeforeSave(mockPs, 14, callback);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith({applicationId : lastAppId + 1, notProvisioned : true});
            });

            it('should call the given error callback if request was not successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.error({
                        success: false
                    });
                });


                var callback = jasmine.createSpy('callback');
                provisionService.provisionAppBeforeSave(mockPs, 14, function () {
                }, callback);
                expect(callback).toHaveBeenCalledWith({success : false});
            });
        });

        describe('provision demo app after save', function () {
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
            });

            it('should call the server with the right end-point', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                provisionService.provisionAppDemoAfterSave(mockPs, 'appDefinitionId', function () {
                }, function () {
                });
                expect(getUrlFromAjaxSpy()).toEqual( appStoreBaseUrl + 'provision/appDefinitionId?accept=json&metaSiteId=metaSiteId');
            });

            it('should call the given success callback if request was successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({
                        success: true,
                        payload: {}
                    });
                });

                var callback = jasmine.createSpy('onSuccess');
                provisionService.provisionAppDemoAfterSave(mockPs, "appDefinitionId", callback);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith({applicationId : lastAppId + 1, notProvisioned : true});
            });

            it('should call the given error callback if request was not successful', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.error({
                        success: false
                    });
                });


                var callback = jasmine.createSpy('callback');
                provisionService.provisionAppDemoAfterSave(mockPs, "appDefinitionId", function () {
                }, callback);
                expect(callback).toHaveBeenCalledWith({success : false});
            });
        });

        describe('completeProvisionAppsAfterSave', function() {
            var ajaxSpy;

            function getLastArgsFromAjaxSpy() {
                return ajaxSpy.calls.mostRecent().args;
            }

            function getUrlFromAjaxSpy() {
                return getLastArgsFromAjaxSpy()[0].url;
            }

            beforeEach(function () {
                ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');
                spyOn(clientSpecMapService, 'getLargestApplicationId').and.returnValue(11);
                spyOn(clientSpecMapService, 'registerAppData');
            });

            it('should call the server with accept json query param', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                var clientSpecMap = [];
                clientSpecMap[0] = {
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                    appDefinitionName: "Dropifi Contact Widget",
                    applicationId: 'applicationId1',
                    type: 'wixapps',
                    notProvisioned: true
                };

                clientSpecMap[1] = {
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c52",
                    appDefinitionName: "Dropifi Contact Widget2",
                    applicationId: 'applicationId2',
                    type: 'appbuilder'
                };

                clientSpecMap[2] = {
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c53",
                    appDefinitionName: "Dropifi Contact Widget2",
                    applicationId: 'applicationId3',
                    type: 'dashboard'
                };
                provisionService.completeProvisionAppsAfterSave('http://editor.wix.com/wix-apps', 'metaSiteId', 'editorSessionId', clientSpecMap, function () {});
                expect(getUrlFromAjaxSpy()).toEqual( appStoreBaseUrl + 'post-save-complete-provision?accept=json&editorSessionId=editorSessionId&metaSiteId=metaSiteId');
            });

            it('should send only non tpas when appFlows experiment is open', function () {
                spyOn(siteMetadata, 'getProperty').and.returnValue('metaSiteId');
                var clientSpecMap = [];
                clientSpecMap[0] = {
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                    appDefinitionName: "Dropifi Contact Widget",
                    applicationId: 'applicationId1',
                    type: 'wixapps',
                    notProvisioned: true
                };

                clientSpecMap[1] = {
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c52",
                    appDefinitionName: "Dropifi Contact Widget2",
                    applicationId: 'applicationId2',
                    type: 'appbuilder'
                };

                clientSpecMap[2] = {
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c53",
                    appDefinitionName: "Dropifi Contact Widget2",
                    applicationId: 'applicationId3',
                    type: 'dashboard'
                };

                provisionService.completeProvisionAppsAfterSave('http://editor.wix.com/wix-apps', 'metaSiteId', 'editorSessionId', clientSpecMap, function () {});
                var dataObj = JSON.parse(ajaxSpy.calls.mostRecent().args[0].data);
                expect(_.size(dataObj.apps)).toBe(1);
            });
        });

        describe('refreshSpecMap', function() {
            var ajaxSpy;
            var data = {
                payload: {applicationId: 1}
            };
            var metaSiteId = 'metaSiteId',
                applicationId = 'applicationId';

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

            it('should call the server with the right end point', function () {
                provisionService.refreshSpecMap(mockPs, applicationId, metaSiteId, _.noop, _.noop);
                expect(getUrlFromAjaxSpy()).toEqual( appStoreBaseUrl + 'spec/' + metaSiteId + '/' + applicationId + '?accept=json');

            });

            it('should register new data to specMap', function() {
                ajaxSpy.and.callFake(function(options){
                    options.success(data);
                });
                provisionService.refreshSpecMap(mockPs, applicationId, metaSiteId, _.noop, _.noop);
                expect(clientSpecMapService.registerAppData).toHaveBeenCalledWith(mockPs, data.payload);
            });
        });
    });
});
