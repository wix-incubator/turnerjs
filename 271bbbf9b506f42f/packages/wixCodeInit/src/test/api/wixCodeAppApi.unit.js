define([
    'lodash',
    'testUtils',
    'wixCodeInit/api/wixCodeAppApi',
    'wixCodeInit/utils/urlBuilder',
    'wixCodeInit/utils/widgetsPreLoader',
    'widgets'
], function (_, testUtils, wixCodeAppApi, urlBuilder, widgetsPreLoader, widgets) {
    'use strict';

    describe('wixCodeAppApi', function () {

        function simulateInit(appApi) {
            var siteModel = {};
            var clientSpecMap = {
                3: {
                    type: 'siteextension',
                    applicationId: 3,
                    appDefinitionId: 'app-definition-id',
                    instance: 'signed-instance'
                }
            };
            spyOn(urlBuilder, 'buildUrl').and.returnValue('test-app-url');
            appApi.init(siteModel, clientSpecMap, {});
        }

        function fakeIFrameReady() {
            fakeMessageFromIFrame({
                intent: 'WIX_CODE',
                type: 'wix_code_iframe_loaded'
            });
        }

        function fakeMessageFromIFrame(messageData) {
            var iframe = getAppIFrame();
            var messageEvent = window.document.createEvent('Event');
            messageEvent.initEvent('message', true, true);
            messageEvent.source = iframe.contentWindow;
            messageEvent.data = messageData;
            window.dispatchEvent(messageEvent);
        }

        function getAppIFrame() {
            return window.document.body.children[0];
        }

        beforeEach(function () {
            window.document.body.innerHTML = '';
        });

        afterEach(function () {
            window.document.body.innerHTML = '';
        });

        describe('init', function () {

            it('should add an iframe with the correct app url to the document body', function () {
                var siteModel = {};
                var testAppUrl = 'test-app-url';
                var appDef = {
                    type: 'siteextension',
                    applicationId: '3',
                    appDefinitionId: 'app-definition-id',
                    instance: 'signed-instance'
                };
                var clientSpecMap = {
                    '54443': {
                        applicationId: '54443',
                        appDefinitionId: 'fake app',
                        type: 'fake'
                    }
                };
                clientSpecMap[appDef.applicationId] = appDef;
                var options = {};

                spyOn(urlBuilder, 'buildUrl').and.callFake(function (_siteModel, _appDef, _options) {
                    if (_siteModel === siteModel && _options === options && _appDef === appDef) { // make sure to fake the correct call
                        return testAppUrl;
                    }
                });

                var appApi = wixCodeAppApi.getApi();
                appApi.init(siteModel, clientSpecMap, options);

                var iframe = window.document.body.children[0];
                expect(iframe.src).toEqual(testAppUrl);
                expect(iframe.getAttribute('data-app-id')).toEqual(appDef.applicationId);
                expect(iframe.getAttribute('data-app-definition-id')).toEqual(appDef.appDefinitionId);
            });

            it('should not init more than once', function () {
                var clientSpecMap = {
                    3: {
                        type: 'siteextension',
                        applicationId: 3,
                        appDefinitionId: 'app-definition-id',
                        instance: 'signed-instance'
                    }
                };
                spyOn(urlBuilder, 'buildUrl').and.returnValue('test-app-url');

                var appApi = wixCodeAppApi.getApi();
                appApi.init({}, clientSpecMap, {});

                var iFrameAddedAtFirstInit = window.document.body.children[0];

                appApi.init({}, clientSpecMap, {});

                expect(window.document.body.children.length).toEqual(1);
                expect(window.document.body.children[0]).toEqual(iFrameAddedAtFirstInit);
            });
        });

        describe('sendMessage', function () {
            it('should forward the message to the iframe', function () {
                var appApi = wixCodeAppApi.getApi();
                simulateInit(appApi);
                fakeIFrameReady();
                var appIFrame = getAppIFrame();
                spyOn(appIFrame.contentWindow, 'postMessage');

                var testMessage = {test: 'test message'};
                appApi.sendMessage(testMessage);

                expect(appIFrame.contentWindow.postMessage).toHaveBeenCalledWith(testMessage, '*');
            });

            it('should hold messages until iframe is ready', function () {
                var appApi = wixCodeAppApi.getApi();
                simulateInit(appApi);
                var appIFrame = getAppIFrame();
                spyOn(appIFrame.contentWindow, 'postMessage');

                var testMessage = {test: 'test message'};
                appApi.sendMessage(testMessage);

                expect(appIFrame.contentWindow.postMessage).not.toHaveBeenCalledWith(testMessage);
                fakeIFrameReady();
                expect(appIFrame.contentWindow.postMessage).toHaveBeenCalledWith(testMessage, '*');
            });
        });

        describe('registerMessageHandler', function () {
            it('should register a callback that wil be called with messages sent by the iframe', function () {
                var appApi = wixCodeAppApi.getApi();
                simulateInit(appApi);
                fakeIFrameReady();

                var messageHandler = jasmine.createSpy('messageHandler');
                appApi.registerMessageHandler(messageHandler);

                var testMessage = {test: 'test message'};
                fakeMessageFromIFrame(testMessage);

                expect(messageHandler).toHaveBeenCalledWith(testMessage);
            });

            it('should not pass messages which do not originate in the app iframe', function () {
                var appApi = wixCodeAppApi.getApi();
                simulateInit(appApi);
                fakeIFrameReady();

                var messageHandler = jasmine.createSpy('messageHandler');
                appApi.registerMessageHandler(messageHandler);

                var messageEvent = window.document.createEvent('Event');
                messageEvent.initEvent('message', true, true);
                messageEvent.source = {id: 'not the app iframe'};
                messageEvent.data = {test: 'test message'};
                window.dispatchEvent(messageEvent);

                expect(messageHandler).not.toHaveBeenCalled();
            });
        });

        describe('registerMessageModifier', function () {
            it('should register a modifier callback that will be passed the message that is going to be sent', function () {
                var appApi = wixCodeAppApi.getApi();
                simulateInit(appApi);
                fakeIFrameReady();
                var appIFrame = getAppIFrame();
                spyOn(appIFrame.contentWindow, 'postMessage');

                var testMessage = {test: 'test message'};

                appApi.registerMessageModifier(function (originalMsg) {
                    originalMsg.modified = true;

                    return originalMsg;
                });
                appApi.sendMessage(testMessage);

                expect(appIFrame.contentWindow.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                    modified: true
                }), '*');
            });

            it('should pass the message to all of the registered message modifiers', function () {
                var appApi = wixCodeAppApi.getApi();
                simulateInit(appApi);
                fakeIFrameReady();
                var appIFrame = getAppIFrame();
                spyOn(appIFrame.contentWindow, 'postMessage');

                var testMessage = {test: 'test message'};

                appApi.registerMessageModifier(function (originalMsg) {
                    originalMsg.modified = true;

                    return originalMsg;
                });
                appApi.registerMessageModifier(function (originalMsg) {
                    originalMsg.modified2 = true;

                    return originalMsg;
                });
                appApi.sendMessage(testMessage);

                expect(appIFrame.contentWindow.postMessage).toHaveBeenCalledWith(jasmine.objectContaining({
                    modified: true,
                    modified2: true
                }), '*');
            });

            it('should send the unmodified message if no modifiers were registered', function () {
                var appApi = wixCodeAppApi.getApi();
                simulateInit(appApi);
                fakeIFrameReady();
                var appIFrame = getAppIFrame();
                spyOn(appIFrame.contentWindow, 'postMessage');

                var testMessage = {test: 'test message'};

                appApi.sendMessage(testMessage);

                expect(appIFrame.contentWindow.postMessage).toHaveBeenCalledWith(testMessage, '*');
            });
        });

        describe('widgets pre-loading', function () {

            beforeEach(function () {
                this.siteModel = testUtils.mockFactory.mockSiteModel()
                    .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
                this.mockPreLoadMessage = widgets.messageBuilder.loadWidgetsMessage([{
                    id: 'preloaded widget',
                    type: 'Page'
                }], _.get(this.siteModel, 'rendererModel.routers.configMap'), ['preloaded widget']);
                this.testUrl = 'http://test-url';

                var self = this;
                spyOn(widgetsPreLoader, 'asyncGetPreLoadMessage').and.callFake(function (_siteModel, url, callback) {
                    if (_siteModel === self.siteModel && url === self.testUrl) {
                        callback(self.mockPreLoadMessage);
                    }
                });

                var appDef = {
                    type: 'siteextension',
                    applicationId: '3',
                    appDefinitionId: 'app-definition-id',
                    instance: 'signed-instance'
                };
                var clientSpecMap = {
                    '54443': {
                        applicationId: '54443',
                        appDefinitionId: 'fake app',
                        type: 'fake'
                    }
                };
                clientSpecMap[appDef.applicationId] = appDef;

                this.appApi = wixCodeAppApi.getApi();
                this.appApi.init(this.siteModel, clientSpecMap);

                fakeIFrameReady();
            });

            describe('preLoadWidgets', function () {
                it('should send the iframe a message for loading the current page', function () {
                    var appIFrame = getAppIFrame();
                    spyOn(appIFrame.contentWindow, 'postMessage');

                    this.appApi.preLoadWidgets(this.siteModel, this.testUrl);

                    expect(appIFrame.contentWindow.postMessage).toHaveBeenCalledWith(this.mockPreLoadMessage, '*');
                });

                it('should do nothing if a message was already sent to the app', function () {
                    var appIFrame = getAppIFrame();

                    this.appApi.sendMessage({type: 'dummy first message'});

                    spyOn(appIFrame.contentWindow, 'postMessage');

                    this.appApi.preLoadWidgets(this.siteModel, this.testUrl);

                    expect(appIFrame.contentWindow.postMessage).not.toHaveBeenCalled();
                });

                it('shouuld do nothing if a preload message was already sent', function () {
                    var appIFrame = getAppIFrame();
                    this.appApi.preLoadWidgets(this.siteModel, this.testUrl);

                    spyOn(appIFrame.contentWindow, 'postMessage');
                    this.appApi.preLoadWidgets(this.siteModel, this.testUrl);

                    expect(appIFrame.contentWindow.postMessage).not.toHaveBeenCalled();
                });
            });

            describe('sendMessage', function () {
                it('should filter pre-loaded widgets from the first load message', function () {
                    var loadMessage = _.cloneDeep(this.mockPreLoadMessage);
                    loadMessage.widgets.push({
                        id: 'not preloaded widget',
                        type: 'Page'
                    });
                    expect(loadMessage.widgets.length).toEqual(2); // just making sure that beforeEach is not being changed

                    var expectedIFrameMessage = _.cloneDeep(loadMessage);
                    expectedIFrameMessage.widgets = [{
                        id: 'not preloaded widget',
                        type: 'Page'
                    }];

                    var appIFrame = getAppIFrame();
                    spyOn(appIFrame.contentWindow, 'postMessage');

                    this.appApi.preLoadWidgets(this.siteModel, this.testUrl);
                    this.appApi.sendMessage(loadMessage);

                    expect(appIFrame.contentWindow.postMessage).toHaveBeenCalledWith(expectedIFrameMessage, '*');
                });

                it('should not filter pre-loaded widgets from a message which is not the first', function () {
                    var loadMessage = _.cloneDeep(this.mockPreLoadMessage);
                    loadMessage.widgets.push({
                        id: 'not preloaded widget',
                        type: 'Page'
                    });

                    var appIFrame = getAppIFrame();
                    spyOn(appIFrame.contentWindow, 'postMessage');

                    this.appApi.preLoadWidgets(this.siteModel, this.testUrl);
                    this.appApi.sendMessage({type: 'dummy first message'});
                    this.appApi.sendMessage(loadMessage);

                    expect(loadMessage.widgets.length).toEqual(2); // just making sure that beforeEach is not being changed
                    expect(appIFrame.contentWindow.postMessage).toHaveBeenCalledWith(loadMessage, '*');
                });
            });

        });

        describe('preInitWidgets', function () {

            beforeEach(function () {
                this.testUrl = 'http://test-url';
                this.siteModel = testUtils.mockFactory.mockSiteModel()
                    .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
                var pageId = this.siteModel.publicModel.pageList.mainPageId;
                this.mockPreInitMessage = widgets.messageBuilder.initWidgetsMessage(pageId, {
                    controllerId: {appId: 'bla'}
                });

                var self = this;
                spyOn(widgetsPreLoader, 'asyncGetPreInitMessage').and.callFake(function (_siteModel, url, callback) {
                    if (_siteModel === self.siteModel && url === self.testUrl) {
                        callback(self.mockPreInitMessage);
                    }
                });

                this.appApi = wixCodeAppApi.getApi();
                this.appApi.init(this.siteModel, this.siteModel.rendererModel.clientSpecMap);

                fakeIFrameReady();

            });
            it('should send the iframe a message for initializing the current page', function () {
                var appIFrame = getAppIFrame();
                spyOn(appIFrame.contentWindow, 'postMessage');

                this.appApi.preInitWidgets(this.siteModel, this.testUrl);

                expect(appIFrame.contentWindow.postMessage).toHaveBeenCalledWith(this.mockPreInitMessage, '*');
            });

            it('should do nothing if a message was already sent to the app', function () {
                var appIFrame = getAppIFrame();

                this.appApi.sendMessage({type: 'dummy first message'});

                spyOn(appIFrame.contentWindow, 'postMessage');

                this.appApi.preInitWidgets(this.siteModel, this.testUrl);

                expect(appIFrame.contentWindow.postMessage).not.toHaveBeenCalled();
            });

            it('shouuld do nothing if a preinit message was already sent', function () {
                var appIFrame = getAppIFrame();
                this.appApi.preInitWidgets(this.siteModel, this.testUrl);

                spyOn(appIFrame.contentWindow, 'postMessage');
                this.appApi.preInitWidgets(this.siteModel, this.testUrl);

                expect(appIFrame.contentWindow.postMessage).not.toHaveBeenCalled();
            });

            it('shouuld do nothing if wixcode is not provisioned in the site', function () {
                var siteModel = testUtils.mockFactory.mockSiteModel();
                var appIFrame = getAppIFrame();
                spyOn(appIFrame.contentWindow, 'postMessage');
                this.appApi.preInitWidgets(siteModel, this.testUrl);

                expect(appIFrame.contentWindow.postMessage).not.toHaveBeenCalled();
            });
        });

    });
});
