define([
    'lodash',
    'pmrpc',
    'documentServices/platform/core/messageFormatter',
    'documentServices/platform/services/sdkAPIService',
    'definition!documentServices/platform/services/workerService',
    'documentServices/platform/core/workerFactory',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/platform/platform',
    'documentServices/platform/common/constants',
    'documentServices/platform/services/platformAppDataGetter'
], function (_,
             rpc,
             messageFormatter,
             sdkAPIService,
             WorkerServiceDef,
             workerFactory,
             privateServicesHelper,
             platform,
             constants,
             platformAppDataGetter) {
    'use strict';

    describe('workerService', function () {
        var workerService, workerIframe, ps, messagesHandler;
        var IFRAME_SRC = 'http://iframeTestUrl/bla/bla';

        function simulateWorkerReady(source) {
            messagesHandler({
                source: source || workerIframe.contentWindow,
                data: {
                    type: constants.MessageTypes.SDK_READY
                }
            });
        }

        beforeEach(function () {
            workerService = new WorkerServiceDef(_, rpc, sdkAPIService, workerFactory, messageFormatter, constants);
            ps = ps || privateServicesHelper.mockPrivateServices();
            workerIframe = {
                contentWindow: jasmine.createSpyObj('contentWindowSpy', ['postMessage', 'onmessage', 'onerror'])
            };
            spyOn(workerFactory, 'getAppsContainerUrl').and.returnValue(IFRAME_SRC);
            spyOn(workerFactory, 'createWorkerIframe').and.callFake(function (id, src, handler) {
                messagesHandler = handler;
                return workerIframe;
            });
        });

        describe('lifecycle', function () {
            describe('init', function () {
                it('should add an apps container iframe to the DOM with the url received from workerFactory', function () {
                    var actualIframeSrc = null;
                    workerFactory.createWorkerIframe.and.callFake(function (id, src, handler) {
                        actualIframeSrc = src;
                        messagesHandler = handler;
                        return workerIframe;
                    });

                    workerService.init(ps, {});

                    expect(actualIframeSrc).toEqual(IFRAME_SRC);
                });
            });

            describe('worker communication', function () {
                it('should not send message before worker is ready', function () {
                    var apps = [{
                        id: 'id1',
                        url: 'www.example.com'
                    }];
                    var applicationId = 'appId';
                    var options = {
                        option1: 1,
                        option2: 'option2'
                    };

                    workerService.init(ps, {});
                    workerService.addApps(apps);
                    workerService.triggerEvent(applicationId, options);

                    expect(workerIframe.contentWindow.postMessage).not.toHaveBeenCalled();
                });

                it('should send queued messages when worker is ready', function () {
                    var apps = [{
                        applicationId: 'id1',
                        editorUrl: 'www.example.com'
                    }];
                    var applicationId = 'appId';
                    var options = {
                        option1: 1,
                        option2: 'option2'
                    };

                    workerService.init(ps, {});
                    workerService.addApps(apps);
                    workerService.triggerEvent(applicationId, options);
                    simulateWorkerReady();

                    expect(workerIframe.contentWindow.postMessage).toHaveBeenCalledWith({
                        intent: constants.Intents.PLATFORM_WORKER,
                        type: constants.MessageTypes.ADD_APPS,
                        apps: apps
                    }, '*');
                    expect(workerIframe.contentWindow.postMessage).toHaveBeenCalledWith({
                        intent: constants.Intents.PLATFORM_WORKER,
                        type: constants.MessageTypes.TRIGGER_EVENT,
                        applicationId: applicationId,
                        args: options
                    }, '*');
                });

                it('should only process messages arriving from the worker origin', function () {
                    var apps = [{
                        id: 'id1',
                        url: 'www.example.com'
                    }];

                    workerService.init(ps, {});
                    workerService.addApps(apps);
                    simulateWorkerReady({});

                    expect(workerIframe.contentWindow.postMessage).not.toHaveBeenCalled();
                });
            });
        });

        describe('messaging a ready worker', function () {
            beforeEach(function () {
                workerService.init(ps, {});
                simulateWorkerReady();
            });

            it('should send add apps', function () {
                var apps = [{
                    applicationId: 'id1',
                    editorUrl: 'www.example.com'
                }, {
                    applicationId: 'id2',
                    editorUrl: 'www.example1.com'
                }];

                workerService.addApps(apps);

                expect(workerIframe.contentWindow.postMessage).toHaveBeenCalledWith({
                    intent: constants.Intents.PLATFORM_WORKER,
                    type: constants.MessageTypes.ADD_APPS,
                    apps: apps
                }, '*');
            });

            it('should send add app', function () {
                var app = {
                    applicationId: 'id1',
                    editorUrl: 'www.example.com'
                };

                workerService.addApp(app);

                expect(workerIframe.contentWindow.postMessage).toHaveBeenCalledWith({
                    intent: constants.Intents.PLATFORM_WORKER,
                    type: constants.MessageTypes.ADD_APPS,
                    apps: [app]
                }, '*');
            });

            it('should send application events', function () {
                var applicationId = 'appId';
                var options = {
                    option1: 1,
                    option2: 'option2'
                };

                workerService.triggerEvent(applicationId, options);

                expect(workerIframe.contentWindow.postMessage).toHaveBeenCalledWith({
                    intent: constants.Intents.PLATFORM_WORKER,
                    type: constants.MessageTypes.TRIGGER_EVENT,
                    applicationId: applicationId,
                    args: options
                }, '*');
            });
        });

        describe('handling worker messages', function () {
            var editorAPI;

            beforeEach(function () {
                editorAPI = {
                    controllers: {
                        setTypes: jasmine.createSpy('setTypes')
                    }
                };
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                platform.init(ps, editorAPI);
            });

            it('when `setManifest` message is received - should call editorAPI setTypes', function () {
                var appId = 123;
                spyOn(platformAppDataGetter, 'getAppDataByApplicationId').and.returnValue({appDefinitionId: appId.toString()});

                messagesHandler({
                    source: workerIframe.contentWindow,
                    data: {
                        type: constants.MessageTypes.SET_MANIFEST,
                        manifest: {
                            exports: 'manifest'
                        },
                        applicationId: appId
                    }
                });
                expect(editorAPI.controllers.setTypes).toHaveBeenCalledWith('', 'manifest');
            });


            it('when `setManifest` message is received - should not call editorAPI setTypes if exports not exist', function () {
                var appId = 111;
                spyOn(platformAppDataGetter, 'getAppDataByApplicationId').and.returnValue({appDefinitionId: appId.toString()});

                messagesHandler({
                    source: workerIframe.contentWindow,
                    data: {
                        type: constants.MessageTypes.SET_MANIFEST,
                        manifest: {},
                        applicationId: appId
                    }
                });
                expect(editorAPI.controllers.setTypes).not.toHaveBeenCalledWith('', 'manifest');
            });

            it('should set the appManifest  when `setManifest` message is received', function () {
                var appId1 = 'appId1';
                var appId2 = 'appId2';
                var appManifestDataApp1 = {
                    exports: 'manifest1',
                    routers: {
                        mockData: 'mockData1'
                    }
                };
                var appManifestDataApp2 = {
                    exports: 'manifest2',
                    routers: {
                        mockData: 'mockData2'
                    }
                };
                spyOn(platformAppDataGetter, 'getAppDataByApplicationId').and.callFake(function (privateServices, appId) {
                    return {appDefinitionId: appId.toString()};
                });
                messagesHandler({
                    source: workerIframe.contentWindow,
                    data: {
                        type: constants.MessageTypes.SET_MANIFEST,
                        manifest: appManifestDataApp1,
                        applicationId: appId1
                    }
                });

                messagesHandler({
                    source: workerIframe.contentWindow,
                    data: {
                        type: constants.MessageTypes.SET_MANIFEST,
                        manifest: appManifestDataApp2,
                        applicationId: appId2
                    }
                });
                var appManifesrAppId1 = ps.pointers.platform.getAppManifestPointer(appId1);
                expect(ps.dal.get(appManifesrAppId1)).toEqual(appManifestDataApp1);

                var appManifesrAppId2 = ps.pointers.platform.getAppManifestPointer(appId2);
                expect(ps.dal.get(appManifesrAppId2)).toEqual(appManifestDataApp2);
            });
        });
    });
});
