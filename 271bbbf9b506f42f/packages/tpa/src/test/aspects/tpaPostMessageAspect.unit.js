define(['lodash', 'testUtils', 'tpa/aspects/TPAPostMessageAspect', 'tpa/handlers/tpaHandlers', 'tpa/handlers/tpaPubSubHandlers', 'tpa/common/tpaBi', 'tpa/utils/tpaUtils'],
    function (_, testUtils, TPAAspectCtor, tpaHandlers, tpaPubSubHandlers, tpaBi, tpaUtils) {
    'use strict';
    var mockPostMsgEventSuccess = {
        data: '{"intent": "TPA", "type": "siteInfo"}',
        source: {
            postMessage: function () {
            }
        }
    };

    var mockPushStatePostMsgEventSuccess = {
        data: '{"intent": "TPA", "type": "appStateChanged"}',
        source: {
            postMessage: function () {
            }
        }
    };

    var mockPostMsgEventTPAWorker = {
        data: '{"intent": "TPA", "type": "siteInfo", "compId":"tpaWorker_3"}',
        source: {
            postMessage: function () {
            }
        }
    };

    describe('Testing tpa Post Messages aspect', function () {
        beforeEach(function () {
            spyOn(console, 'error');
            this.mockSiteAPI = jasmine.createSpyObj('siteAPI', ['registerToMessage', 'getCurrentUrlPageId', 'getComponentById', 'reportBI', 'getSiteData']);
            this.mockSiteAPI.getCurrentUrlPageId.and.returnValue('test-page');
            this.mockSiteAPI.getComponentById.and.returnValue({
                props: {
                    pageId: 'test-page',
                    structure: {
                        componentType: 'wysiwyg.viewer.components.tpapps.TPASection'
                    }
                }
            });
            this.mockSiteAPI.getSiteData.and.returnValue({viewMode: 'viewer'});
            this.tpaAspect = new TPAAspectCtor(this.mockSiteAPI);
        });

        it('should inject this.tpaAspect module', function () {
            expect(this.tpaAspect).toBeDefined();
        });

        it('should call a handler function (siteInfo) successfully', function () {
            spyOn(tpaHandlers, 'siteInfo').and.callFake(function (siteAPI, data, callback) {
                var mockData = JSON.parse(mockPostMsgEventSuccess.data);
                expect(callback).toBeDefined();
                expect(data.intent).toEqual(mockData.intent);
                expect(data.type).toEqual(mockData.type);
            });
            this.tpaAspect.handleTPAMessage(mockPostMsgEventSuccess);
            expect(tpaHandlers.siteInfo).toHaveBeenCalled();
        });

        it('should support both TPA and TPA2 intents', function () {
            spyOn(tpaHandlers, 'siteInfo').and.callFake(function (siteAPI, data, callback) {
                var mockData = JSON.parse(mockPostMsgEventSuccess.data);
                expect(callback).toBeDefined();
                expect(data.intent).toEqual(mockData.intent);
                expect(data.type).toEqual(mockData.type);
            });
            this.tpaAspect.handleTPAMessage(mockPostMsgEventSuccess);
            expect(tpaHandlers.siteInfo).toHaveBeenCalled();


            var mockPostMsgEventSuccessTPA2 = {
                data: '{"intent": "TPA2", "type": "heightChanged"}',
                source: {
                    postMessage: function () {
                    }
                }
            };

            spyOn(tpaHandlers, 'heightChanged').and.callFake(function (siteAPI, data, callback) {
                var mockData = JSON.parse(mockPostMsgEventSuccessTPA2.data);
                expect(callback).toBeDefined();
                expect(data.intent).toEqual(mockData.intent);
                expect(data.type).toEqual(mockData.type);
            });

            this.tpaAspect.handleTPAMessage(mockPostMsgEventSuccessTPA2);
            expect(tpaHandlers.heightChanged).toHaveBeenCalled();
        });

        it('should support data from originalEvent', function () {
            var mockPostMsgOriginalEventEvent = {
                originalEvent: {
                    data: '{"intent": "TPA", "type": "heightChanged"}',
                    source: {
                        postMessage: function () {
                        }
                    }
                }
            };

            spyOn(tpaHandlers, 'heightChanged').and.callFake(function (siteAPI, data, callback) {
                var mockData = JSON.parse(mockPostMsgOriginalEventEvent.originalEvent.data);
                expect(callback).toBeDefined();
                expect(data.intent).toEqual(mockData.intent);
                expect(data.type).toEqual(mockData.type);
            });

            this.tpaAspect.handleTPAMessage(mockPostMsgOriginalEventEvent);
            expect(tpaHandlers.heightChanged).toHaveBeenCalled();
        });

        it('should support old pingpong handler messages (sdk 1.16)', function () {
            var pingPongPostMsgEventSuccess = {
                data: '{"intent": "TPA", "type": "pingpong:siteInfo"}',
                source: {
                    postMessage: function () {
                    }
                }
            };
            spyOn(tpaHandlers, 'siteInfo').and.callFake(function (siteAPI, data, callback) {
                var mockData = JSON.parse(pingPongPostMsgEventSuccess.data);
                expect(callback).toBeDefined();
                expect(data.intent).toEqual(mockData.intent);
                expect(data.type).toEqual(mockData.type);
            });
            this.tpaAspect.handleTPAMessage(pingPongPostMsgEventSuccess);
            expect(tpaHandlers.siteInfo).toHaveBeenCalled();
        });

        it('should call tpa worker handlers successfully', function () {
            spyOn(tpaHandlers.tpaWorker, 'siteInfo').and.callFake(function (siteAPI, data, callback) {
                var mockData = JSON.parse(mockPostMsgEventTPAWorker.data);
                expect(callback).toBeDefined();
                expect(data.intent).toEqual(mockData.intent);
                expect(data.type).toEqual(mockData.type);
                expect(data.compId).toEqual(mockData.compId);
            });

            this.tpaAspect.handleTPAMessage(mockPostMsgEventTPAWorker);
            expect(tpaHandlers.tpaWorker.siteInfo).toHaveBeenCalled();
        });

        it('should call prevent tpa worker from calling handler', function () {
            spyOn(tpaHandlers, 'openModal');
            expect(tpaHandlers.openModal).not.toHaveBeenCalled();
        });

        it('should call response callback to inject data to widget iframe', function () {
            var siteInfoData;
            var mockData;

            spyOn(tpaHandlers, 'siteInfo').and.callFake(function (siteAPI, data, callback) {
                mockData = JSON.parse(mockPostMsgEventSuccess.data);
                expect(callback).toBeDefined();
                expect(data.intent).toEqual(mockData.intent);
                expect(data.type).toEqual(mockData.type);
                expect(data.compId).toEqual(mockData.compId);

                siteInfoData = data;

                callback(data);
            });

            spyOn(mockPostMsgEventSuccess.source, 'postMessage').and.callFake(function (msg) {
                var msgData = JSON.parse(msg);
                expect(msgData.res).toEqual(siteInfoData);
                expect(msgData.status).toBeTruthy();
                expect(msgData.intent).toEqual("TPA_RESPONSE");
            });

            this.tpaAspect.handleTPAMessage(mockPostMsgEventSuccess);
            expect(tpaHandlers.siteInfo).toHaveBeenCalled();
            expect(mockPostMsgEventSuccess.source.postMessage).toHaveBeenCalled();
        });

        it('should handle non-pushState message from TPA that is not displayed in current page', function () {
            this.tpaAspect._siteAPI.getCurrentUrlPageId = jasmine.createSpy().and.returnValue('page-test-1');
            spyOn(tpaHandlers, 'siteInfo').and.callFake(function (siteAPI, data, callback) {
                var mockData = JSON.parse(mockPostMsgEventSuccess.data);
                expect(callback).toBeDefined();
                expect(data.intent).toEqual(mockData.intent);
                expect(data.type).toEqual(mockData.type);
            });
            this.tpaAspect.handleTPAMessage(mockPostMsgEventSuccess);
            expect(tpaHandlers.siteInfo).toHaveBeenCalled();
        });

        it('should not handle pushState message from TPA that is not displayed current page', function () {
            this.tpaAspect._siteAPI.getCurrentUrlPageId = jasmine.createSpy().and.returnValue('masterPage');
            spyOn(tpaHandlers, 'appStateChanged').and.callFake(function (siteAPI, data, callback) {
                var mockData = JSON.parse(mockPushStatePostMsgEventSuccess.data);
                expect(callback).toBeDefined();
                expect(data.intent).toEqual(mockData.intent);
                expect(data.type).toEqual(mockData.type);
            });
            this.tpaAspect.handleTPAMessage(mockPushStatePostMsgEventSuccess);
            expect(tpaHandlers.appStateChanged).not.toHaveBeenCalled();
        });

        it('should handle pushState message from TPA that is displayed masterPage', function () {
            this.tpaAspect._siteAPI.getCurrentUrlPageId = jasmine.createSpy().and.returnValue('masterPage');
            spyOn(tpaHandlers, 'siteInfo').and.callFake(function (siteAPI, data, callback) {
                var mockData = JSON.parse(mockPostMsgEventSuccess.data);
                expect(callback).toBeDefined();
                expect(data.intent).toEqual(mockData.intent);
                expect(data.type).toEqual(mockData.type);
            });
            this.tpaAspect.handleTPAMessage(mockPostMsgEventSuccess);
            expect(tpaHandlers.siteInfo).toHaveBeenCalled();
        });

        it('should send BI event when handling message successfully', function () {
            testUtils.experimentHelper.openExperiments('sv_SendSdkMethodBI');
            spyOn(tpaHandlers, 'siteInfo');
            spyOn(tpaBi, 'sendBIEvent');
            this.tpaAspect.handleTPAMessage(mockPostMsgEventSuccess);
            var expectedMsg = _.assign(JSON.parse(mockPostMsgEventSuccess.data), {origin: 'viewer'});
            expect(tpaBi.sendBIEvent).toHaveBeenCalledWith(expectedMsg, this.mockSiteAPI, 'viewer');
        });

        it('should send with origin preview if the msg has viewMode preview', function () {
            testUtils.experimentHelper.openExperiments('sv_SendSdkMethodBI');
            spyOn(tpaHandlers, 'siteInfo');
            spyOn(tpaBi, 'sendBIEvent');
            this.mockSiteAPI.getSiteData.and.returnValue({viewMode: 'preview'});
            this.tpaAspect.handleTPAMessage(mockPostMsgEventSuccess);
            var expectedMsg = _.assign(JSON.parse(mockPostMsgEventSuccess.data), {origin: 'preview'});
            expect(tpaBi.sendBIEvent).toHaveBeenCalledWith(expectedMsg, this.mockSiteAPI, 'preview');
        });

        describe('super apps only handlers', function() {
            var message;

            beforeEach(function(){
                spyOn(tpaHandlers, 'getCtToken');
                message = {
                    data: '{"intent": "TPA", "type": "getCtToken", "compId": "id"}',
                    source: {
                        postMessage: function () {
                        }
                    }
                };
            });

            it('should call the handler if app is super app', function () {
                spyOn(tpaUtils, 'getAppData').and.returnValue({isWixTPA: true});

                this.tpaAspect.handleTPAMessage(message);

                expect(tpaHandlers.getCtToken).toHaveBeenCalled();
            });

            it('should not call the handler if app is not super app', function () {
                spyOn(tpaUtils, 'getAppData').and.returnValue({isWixTPA: false});

                this.tpaAspect.handleTPAMessage(message);

                expect(tpaHandlers.getCtToken).not.toHaveBeenCalled();
            });

            it('should not call the handler if app data is not returned', function () {
                spyOn(tpaUtils, 'getAppData').and.returnValue(null);

                this.tpaAspect.handleTPAMessage(message);

                expect(tpaHandlers.getCtToken).not.toHaveBeenCalled();
            });
        });

        describe('Post message to TPA component', function () {
            var mockComp;
            var mockData = {
                test: true
            };

            var circularRefMockData = {a: 1, b: 2, c: {d: 3, e: 4}, q: [1, 2, 3, 4, 5, {f: 6, g: 7}]};
            circularRefMockData.circularRefMockData = circularRefMockData;

            beforeEach(function () {
                mockComp = {
                    getIframe: jasmine.createSpy()
                };
            });

            it('should send post message to given comp', function () {
                var postMessageSpy = jasmine.createSpy();
                mockComp.getIframe.and.returnValue({
                    postMessage: postMessageSpy
                });

                this.tpaAspect.sendPostMessage(mockComp, mockData);

                expect(postMessageSpy).toHaveBeenCalledWith(JSON.stringify(mockData), '*');
            });

            it('should not call post message due to invalid message', function () {
                var postMessageSpy = jasmine.createSpy();
                mockComp.getIframe.and.returnValue({
                    contentWindow: {
                        postMessage: postMessageSpy
                    }
                });

                this.tpaAspect.sendPostMessage(mockComp, circularRefMockData);

                expect(postMessageSpy).not.toHaveBeenCalled();
            });

            it('should fail getting iframe from comp', function () {
                mockComp.getIframe.and.returnValue(undefined);

                function callPostMessage() {
                    this.tpaAspect.sendPostMessage(mockComp, mockData);
                }

                expect(callPostMessage).toThrow();
            });
        });

        describe('Handlers dispatching', function () {
            beforeEach(function () {
                spyOn(tpaPubSubHandlers, 'registerEventListener').and.callFake(function () {
                });
                spyOn(tpaHandlers, 'registerEventListener').and.callFake(function () {
                });
                spyOn(tpaHandlers.tpaWorker, 'registerEventListener').and.callFake(function () {
                });
            });

            it('should call registerEventListener handler in tpaPubSubHandlers', function () {
                var mockMessage = {
                    data: '{"intent":"TPA2","compId":"hy5x4gch","type":"registerEventListener","data":{"eventKey":"TPA_PUB_SUB_myEventKey"}}'
                };

                this.tpaAspect.handleTPAMessage(mockMessage);

                expect(tpaPubSubHandlers.registerEventListener).toHaveBeenCalled();
                expect(tpaHandlers.registerEventListener).not.toHaveBeenCalled();
                expect(tpaHandlers.tpaWorker.registerEventListener).not.toHaveBeenCalled();
            });

            it('should call registerEventListener handler in tpaHandlers', function () {
                var mockMessage = {
                    data: '{"intent":"TPA2","compId":"hy5x4gch","type":"registerEventListener","data":{"eventKey":"myEventKey"}}'
                };

                this.tpaAspect.handleTPAMessage(mockMessage);

                expect(tpaPubSubHandlers.registerEventListener).not.toHaveBeenCalled();
                expect(tpaHandlers.registerEventListener).toHaveBeenCalled();
                expect(tpaHandlers.tpaWorker.registerEventListener).not.toHaveBeenCalled();
            });

            it('should call registerEventListener handler in tpaHandlers.tpaWorker', function () {
                var mockMessage = {
                    data: '{"intent":"TPA2","compId":"tpaWorker_5","type":"registerEventListener","data":{"eventKey":"myEventKey"}}'
                };

                this.tpaAspect.handleTPAMessage(mockMessage);

                expect(tpaPubSubHandlers.registerEventListener).not.toHaveBeenCalled();
                expect(tpaHandlers.registerEventListener).not.toHaveBeenCalled();
                expect(tpaHandlers.tpaWorker.registerEventListener).toHaveBeenCalled();
            });
        });


    });

});
