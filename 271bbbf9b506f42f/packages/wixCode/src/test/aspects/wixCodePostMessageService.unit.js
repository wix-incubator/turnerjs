define([
    'lodash',
    'testUtils',
    'pmrpc',
    'utils',
    'tpa',
    'widgets',
    'wixCode/handlers/wixCodeHandlers',
    'wixCode/services/wixCodeAppsAPIService',
    'definition!wixCode/aspects/wixCodePostMessageService',
    'wixCode/utils/constants',
    'wixCode/utils/messageBuilder',
    'wixCode/services/wixCodeUserScriptsService',
    'wixCode/utils/wixCodeWidgetService'
], function (_,
             testUtils,
             rpc,
             utils,
             tpa,
             widgets,
             wixCodeHandlers,
             wixCodeAppsAPIService,
             wixCodePostMessageServiceDefinition,
             constants,
             messageBuilder,
             wixCodeUserScriptsService,
             wixCodeWidgetService) {
    'use strict';

    describe('wixCodePostMessageService', function () {

        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());

            this.siteAspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(this.siteData);

            this.wixCodePostMessageService = wixCodePostMessageServiceDefinition(_,
                rpc,
                tpa,
                utils,
                wixCodeHandlers,
                wixCodeAppsAPIService,
                constants,
                messageBuilder,
                wixCodeWidgetService,
                widgets);
        });


        describe('handleMessage', function () {

            it('should handle serialized data', function () {
                var msg = JSON.stringify({
                    intent: 'WIX_CODE',
                    type: 'init_widgets',
                    compId: 'foo',
                    arguments: []
                });
                var handleWixCodeMessage = jasmine.createSpy('handleWixCodeMessage');
                this.wixCodePostMessageService.handleMessage(this.siteAspectSiteAPI, msg, handleWixCodeMessage);
                expect(handleWixCodeMessage).toHaveBeenCalledWith(JSON.parse(msg), jasmine.any(Function));
            });

            it('should handle json data', function () {
                var msg = {
                    intent: 'WIX_CODE',
                    type: 'init_widgets',
                    compId: 'foo',
                    arguments: []
                };
                var handleWixCodeMessage = jasmine.createSpy('handleWixCodeMessage');
                this.wixCodePostMessageService.handleMessage(this.siteAspectSiteAPI, msg, handleWixCodeMessage);
                expect(handleWixCodeMessage).toHaveBeenCalledWith(msg, jasmine.any(Function));
            });

            it('should handle WIX_CODE_SITE_API event', function () {
                var msg = {
                    intent: 'WIX_CODE_SITE_API',
                    type: 'siteInfo',
                    compId: 'foo',
                    callbackId: 1,
                    arguments: []
                };

                spyOn(tpa.tpaHandlers, 'siteInfo');
                var widgetHandler = widgets.widgetService.getWidgetHandler(this.siteAspectSiteAPI);
                spyOn(widgetHandler, 'updateComponent');

                this.wixCodePostMessageService.handleMessage(this.siteAspectSiteAPI, msg);

                expect(tpa.tpaHandlers.siteInfo).toHaveBeenCalledWith(this.siteAspectSiteAPI, msg, jasmine.any(Function));


                var handlerCall = tpa.tpaHandlers.siteInfo.calls.first();
                handlerCall.args[2]({foo: 'bar'});
                expect(widgetHandler.updateComponent).toHaveBeenCalledWith({//this is what you all came for 0545881741
                    intent: 'WIX_CODE_RESPONSE',
                    callbackId: 1,
                    type: 'siteInfo',
                    result: {foo: 'bar'},
                    contextId: msg.contextId
                });
            });
            it('should handle WIX_CODE_APP_API get api event', function () {
                var msg = {
                    intent: 'WIX_CODE_APP_API',
                    data: {
                        compId: 'valid-compId'
                    },
                    callbackId: 1,
                    type: 'getAppAPI'
                };
                spyOn(this.siteAspectSiteAPI, 'getComponentById').and.returnValue({
                    getIframe: function () {
                        return jasmine.createSpy('getIframe');
                    }
                });
                spyOn(rpc.api, 'get').and.callThrough();
                spyOn(tpa.common.tpaPostMessageCommon, 'callPostMessage');

                this.wixCodePostMessageService.handleMessage(this.siteAspectSiteAPI, msg);
                expect(rpc.api.get).toHaveBeenCalledWith({
                    appId: 'valid-compId', initiator: 'valid-compIdiframe'
                });
                expect(tpa.common.tpaPostMessageCommon.callPostMessage).toHaveBeenCalled();
            });

            it('should handle WIX_CODE_APP_API invoke function event', function () {
                var msg = {
                    intent: 'WIX_CODE_APP_API',
                    data: {
                        compId: 'valid-compId',
                        fn: 'foo',
                        fnArgs: ['yo', 4]
                    },
                    callbackId: 1,
                    type: 'invokeAppFn'
                };
                spyOn(this.siteAspectSiteAPI, 'getComponentById').and.returnValue({
                    getIframe: function () {
                        return jasmine.createSpy('getIframe');
                    }
                });

                spyOn(wixCodeAppsAPIService, 'invokeAppFunctionFor');

                this.wixCodePostMessageService.handleMessage(this.siteAspectSiteAPI, msg);
                expect(wixCodeAppsAPIService.invokeAppFunctionFor).toHaveBeenCalledWith('valid-compId', 'foo', ['yo', 4], jasmine.any(Function));
            });

            it('should throw an error if WIX_CODE_APP_API even has no valid component', function () {
                var msg = {
                    intent: 'WIX_CODE_APP_API',
                    callbackId: 1,
                    arguments: []
                };
                expect(this.wixCodePostMessageService.handleMessage.bind(undefined, this.siteAspectSiteAPI, msg)).toThrow();
            });

            it('should send compName and command when callback fnc has no data ', function () {
                var msg = {
                    intent: 'WIX_CODE',
                    type: 'wix_code_iframe_command',
                    compName: 'compName',
                    command: 'command',
                    compId: 'foo',
                    callbackId: 1,
                    arguments: []
                };

                var widgetHandler = widgets.widgetService.getWidgetHandler(this.siteAspectSiteAPI);
                spyOn(widgetHandler, 'onCommand').and.callThrough();
                spyOn(widgetHandler, 'updateComponent').and.callThrough();

                this.wixCodePostMessageService.handleMessage(this.siteAspectSiteAPI, msg);

                var handlerCall = widgetHandler.onCommand.calls.first();
                handlerCall.args[1]();
                expect(widgetHandler.updateComponent).toHaveBeenCalledWith({
                    intent: 'WIX_CODE_RESPONSE',
                    callbackId: 1,
                    type: 'wix_code_iframe_command',
                    result: {
                        compName: 'compName',
                        command: 'command'
                    },
                    contextId: msg.contextId
                });
            });

            it('should filter messages without WIX_CODE or WIX_CODE_SITE_API intent', function () {
                var msg = {
                    intent: 'TPA',
                    type: 'init_widgets',
                    compId: 'foo',
                    arguments: []
                };
                var handleWixCodeMessage = jasmine.createSpy('handleWixCodeMessage');

                spyOn(widgets.widgetService, 'getWidgetHandler');

                this.wixCodePostMessageService.handleMessage(this.siteAspectSiteAPI, msg, handleWixCodeMessage);
                expect(handleWixCodeMessage).not.toHaveBeenCalled();
                expect(widgets.widgetService.getWidgetHandler).not.toHaveBeenCalled();
            });

            it('should delegate IFRAME_COMMAND to the widgetHandler', function () {
                var msg = {
                    intent: 'WIX_CODE',
                    type: 'wix_code_iframe_command',
                    compId: 'foo',
                    arguments: []
                };
                var widgetHandler = widgets.widgetService.getWidgetHandler(this.siteAspectSiteAPI);
                spyOn(widgetHandler, 'onCommand').and.callThrough();

                this.wixCodePostMessageService.handleMessage(this.siteAspectSiteAPI, msg);

                expect(widgetHandler.onCommand).toHaveBeenCalledWith(msg, jasmine.any(Function));
            });

            it('should delegate unknown message types to the widget handler', function () {
                var msg = {
                    intent: 'WIX_CODE',
                    type: 'unknown'
                };
                var widgetHandler = widgets.widgetService.getWidgetHandler(this.siteAspectSiteAPI);
                spyOn(widgetHandler, 'handleRemoteMessage').and.callThrough();

                this.wixCodePostMessageService.handleMessage(this.siteAspectSiteAPI, msg);

                expect(widgetHandler.handleRemoteMessage).toHaveBeenCalledWith(msg);
            });

            it("should delegate googleAnalytics message to window.ga if it exist's", function () {
                var msg = {
                    intent: 'WIX_CODE',
                    type: 'googleAnalytics',
                    data: ['send', 'event', 'button3', 'click']
                };

                spyOn(utils.logger, 'reportGoogleAnalytics');

                this.wixCodePostMessageService.handleMessage(this.siteAspectSiteAPI, msg);

                expect(utils.logger.reportGoogleAnalytics).toHaveBeenCalledWith(this.siteAspectSiteAPI.getSiteData(), 'send', 'event', 'button3', 'click');
            });

            describe('on console message', function () {
                it('should call logWixCodeConsoleMessage', function () {
                    var msg = {
                        intent: 'WIX_CODE',
                        type: 'console'
                    };

                    spyOn(utils, 'logWixCodeConsoleMessage');

                    this.wixCodePostMessageService.handleMessage(this.siteAspectSiteAPI, msg);

                    expect(utils.logWixCodeConsoleMessage).toHaveBeenCalledWith(msg);
                });
            });

        });

        describe('modifyPostMessage', function () {
            describe('appConfig', function () {
                it('should not be added to the message for load_widgets if no widgets were passed', function () {
                    var msg = testUtils.mockFactory.widgetMocks.messages.mockLoadMessage([]);

                    expect(this.wixCodePostMessageService.modifyPostMessage(this.siteAspectSiteAPI, msg)).toEqual(msg);
                });

                it('should be added to the wixCode widgets in the message for load_widgets', function(){
                    var widgetMocks = testUtils.mockFactory.widgetMocks.messages;
                    var widgetsDefs = [
                        widgetMocks.mockAppWidgetDef('ecom', 'http://wix.com/ecom'),
                        widgetMocks.mockWixCodeWidgetDef('Page', 'somePageId')
                    ];
                    var msg = widgetMocks.mockLoadMessage(widgetsDefs);
                    var wixCodeModel = this.siteData.rendererModel.wixCodeModel;
                    var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.siteData.rendererModel.clientSpecMap);
                    var expectedMessage = widgetMocks.mockLoadMessage(
                        [
                            widgetsDefs[0],
                            _.assign({}, widgetsDefs[1], {appConfig: {
                                userScript: wixCodeUserScriptsService.getUserScript(widgetsDefs[1], wixCodeModel, wixCodeSpec, this.siteData),
                                scari: wixCodeModel.signedAppRenderInfo
                            }})
                        ]);

                    expect(this.wixCodePostMessageService.modifyPostMessage(this.siteAspectSiteAPI, msg)).toEqual(expectedMessage);

                });

                it('should not be added to the message for init_widgets', function () {
                    var widgetMocks = testUtils.mockFactory.widgetMocks.messages;
                    var widgetsDefs = [
                        widgetMocks.mockAppWidgetDef('ecom', 'http://wix.com/ecom'),
                        widgetMocks.mockWixCodeWidgetDef('Page', 'somePageId')
                    ];
                    var msg = widgetMocks.mockInitMessage(widgetsDefs);

                    expect(this.wixCodePostMessageService.modifyPostMessage(this.siteAspectSiteAPI, msg)).toEqual(msg);
                });

                it('should not be added to the message for start_widgets', function(){
                    var msg = testUtils.mockFactory.widgetMocks.messages.mockStartMessage({contextId: {}});

                    expect(this.wixCodePostMessageService.modifyPostMessage(this.siteAspectSiteAPI, msg)).toEqual(msg);
                });
            });
        });

        describe('registerMessageHandler', function () {
            it('should register a handler with the widget service', function() {
                spyOn(widgets.widgetService, 'registerWidgetMessageHandler');
                var handler = jasmine.createSpy('handler');

                this.wixCodePostMessageService.registerMessageHandler(this.siteAspectSiteAPI, handler);

                expect(widgets.widgetService.registerWidgetMessageHandler).toHaveBeenCalledWith(this.siteAspectSiteAPI, jasmine.any(Function));
            });
        });

        describe('registerMessageModifier', function () {
            it('should register a modifier with the widget service', function() {
                spyOn(widgets.widgetService, 'registerWidgetMessageModifier');
                var modifier = jasmine.createSpy('modifier');

                this.wixCodePostMessageService.registerMessageModifier(this.siteAspectSiteAPI, modifier);

                expect(widgets.widgetService.registerWidgetMessageModifier).toHaveBeenCalledWith(this.siteAspectSiteAPI, jasmine.any(Function));
            });
        });
    });
});
