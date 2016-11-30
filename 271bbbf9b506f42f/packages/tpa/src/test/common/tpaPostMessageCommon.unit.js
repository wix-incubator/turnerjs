define(['lodash', 'tpa/common/tpaPostMessageCommon'], function (_, tpaPostMessageCommon) {

    'use strict';
    describe('Testing tpa Post Messages', function () {
        var data, source = {}, targetOrigin;
        beforeEach(function() {
            data = {};
            source = {
                postMessage: jasmine.createSpy('postMessage')
            };
            targetOrigin = '*';
        });

        describe('callPostMessage', function () {
            it('should call post message when source has postMessage', function () {
                tpaPostMessageCommon.callPostMessage(source, data);
                expect(source.postMessage).toHaveBeenCalled();
            });

            it('should assign source to contentWindow when source has no postMessage and call post message', function () {
                source.postMessage = undefined;
                source.contentWindow = {
                    postMessage: jasmine.createSpy('postMessage')
                };
                tpaPostMessageCommon.callPostMessage(source, data);
                expect(source.contentWindow.postMessage).toHaveBeenCalled();
            });

            it('should json stringify the given string', function () {
                var dataAsString = 'jklk';
                tpaPostMessageCommon.callPostMessage(source, dataAsString, targetOrigin);
                expect(source.postMessage).toHaveBeenCalledWith(JSON.stringify(dataAsString), targetOrigin);
            });

            it('should json stringify the given json', function () {
                var jsonData = "{foo: 'bar'}";
                tpaPostMessageCommon.callPostMessage(source, jsonData, targetOrigin);
                expect(source.postMessage).toHaveBeenCalledWith(JSON.stringify(jsonData), targetOrigin);
            });

        });

        describe('generateResponseFunction', function() {
            it('should call callPostMessage', function() {
                spyOn(tpaPostMessageCommon, "callPostMessage");
                var msg = {
                    callId: 'callId',
                    type: 'type'
                };
                tpaPostMessageCommon.generateResponseFunction(source, msg)(data);
                var json = {
                    intent: tpaPostMessageCommon.Intents.TPA_RESPONSE,
                    callId: msg.callId,
                    type: msg.type,
                    res: data,
                    status: true
                };
                expect(source.postMessage).toHaveBeenCalledWith(JSON.stringify(json), targetOrigin);
            });
        });

        describe('isTPAMessage', function () {
            it('should check intent', function () {
                expect(tpaPostMessageCommon.isTPAMessage(tpaPostMessageCommon.Intents.TPA_MESSAGE)).toBeTruthy();
                expect(tpaPostMessageCommon.isTPAMessage(tpaPostMessageCommon.Intents.TPA_MESSAGE2)).toBeTruthy();
                expect(tpaPostMessageCommon.isTPAMessage('fdsfds')).toBeFalsy();
                expect(tpaPostMessageCommon.isTPAMessage()).toBeFalsy();
            });
        });

        describe('fixOldPingPongMessageType', function () {
            it('should replace ping pong intent with an empty char', function () {
                expect(tpaPostMessageCommon.fixOldPingPongMessageType(tpaPostMessageCommon.Intents.PINGPONG_PREFIX)).toBe('');
                expect(tpaPostMessageCommon.fixOldPingPongMessageType(tpaPostMessageCommon.Intents.TPA_MESSAGE2)).toBe(tpaPostMessageCommon.Intents.TPA_MESSAGE2);
            });

            it('should not modify the msgType when the intent is not ping pong', function () {
                expect(tpaPostMessageCommon.fixOldPingPongMessageType(tpaPostMessageCommon.Intents.TPA_MESSAGE2)).toBe(tpaPostMessageCommon.Intents.TPA_MESSAGE2);
            });
        });

        describe('handleTPAMessage', function () {

            beforeEach(function(){
                this.ps = {};
                this.siteAPI = {
                    getComponentById: jasmine.createSpy(),
                    getSiteData: jasmine.createSpy().and.returnValue({viewMode: 'viewer'})
                };
                this.callHandler = jasmine.createSpy('callHandler');
            });

            it('should call the given handler when event has JSON data', function () {
                var event = {
                    data: '{"intent": "TPA", "type": "appStateChanged"}',
                    source: {
                        postMessage: function () {}
                    }
                };

                tpaPostMessageCommon.handleTPAMessage(this.ps, this.siteAPI, this.callHandler, event);
                expect(this.callHandler).toHaveBeenCalledWith(this.ps, this.siteAPI, JSON.parse(event.data), jasmine.any(Function));
            });

            it('should call the given handler when event has originalEvent that has JSON data', function () {
                var event = {
                    originalEvent: {
                        data: '{"intent": "TPA", "type": "heightChanged"}',
                        source: {
                            postMessage: function () {
                            }
                        }
                    }
                };

                tpaPostMessageCommon.handleTPAMessage(this.ps, this.siteAPI, this.callHandler, event);
                expect(this.callHandler).toHaveBeenCalledWith(this.ps, this.siteAPI, JSON.parse(event.originalEvent.data), jasmine.any(Function));
            });

            it('should call handler for messages intent TPA_PREVIEW', function() {
                var event = {
                        originalEvent: {
                            data: '{"intent": "TPA_PREVIEW", "type": "openHelp"}',
                            source: {
                                postMessage: function () {
                                }
                            }
                        }
                    },
                    msg = JSON.parse(event.originalEvent.data);
                tpaPostMessageCommon.handleTPAMessage(this.ps, this.siteAPI, this.callHandler, event);
                expect(this.callHandler).toHaveBeenCalledWith(this.ps, this.siteAPI, msg, jasmine.any(Function));
            });

            it('should not call handler for messages not TPA and TPA_PREVIEW', function() {
                var event = {
                    originalEvent: {
                        data: '{"intent": "INTENT", "type": "openHelp"}',
                        source: {
                            postMessage: function () {
                            }
                        }
                    }
                };
                tpaPostMessageCommon.handleTPAMessage(this.ps, this.siteAPI, this.callHandler, event);
                expect(this.callHandler).not.toHaveBeenCalled();
            });

            it('should not call viewer handler when in preview for messages that override viewer behaviour', function() {
                this.siteAPI.getSiteData.and.returnValue({viewMode: 'preview'});
                window.documentServices = {
                    tpa: {
                        __privates: {
                            areDocumentServicesHandlersReady: function() {
                                return true;
                            }
                        }
                    }
                };
                var event = {
                    originalEvent: {
                        data: '{"intent": "TPA2", "type": "getSectionUrl"}',
                        source: {
                            postMessage: function () {
                            }
                        }
                    }
                };
                tpaPostMessageCommon.handleTPAMessage(undefined, this.siteAPI, this.callHandler, event);
                expect(this.callHandler).not.toHaveBeenCalled();
            });

            it('should not call viewer handler siteInfo when in preview for messages that override viewer behaviour', function() {
                this.siteAPI.getSiteData.and.returnValue({viewMode: 'preview'});
                window.documentServices = {
                    tpa: {
                        __privates: {
                            areDocumentServicesHandlersReady: function() {
                                return true;
                            }
                        }
                    }
                };
                var event = {
                    originalEvent: {
                        data: '{"intent": "TPA2", "type": "siteInfo"}',
                        source: {
                            postMessage: function () {
                            }
                        }
                    }
                };
                tpaPostMessageCommon.handleTPAMessage(undefined, this.siteAPI, this.callHandler, event);
                expect(this.callHandler).not.toHaveBeenCalled();
            });

            it('should call viewer handler when not in preview', function() {
                var event = {
                    originalEvent: {
                        data: '{"intent": "TPA2", "type": "navigateToPage"}',
                        source: {
                            postMessage: function () {
                            }
                        }
                    }
                };
                tpaPostMessageCommon.handleTPAMessage(undefined, this.siteAPI, this.callHandler, event);
                expect(this.callHandler).toHaveBeenCalled();
            });

            it('should call viewer handler when in preview but DS handlers are not initialized', function() {
                this.siteAPI.getSiteData.and.returnValue({viewMode: 'preview'});
                window.documentServices = {
                    tpa: {
                        __privates: {
                            isDocumentServiceHandlersInit: function() {
                                return false;
                            }
                        }
                    }
                };
                var event = {
                    originalEvent: {
                        data: '{"intent": "TPA2", "type": "navigateToPage"}',
                        source: {
                            postMessage: function () {
                            }
                        }
                    }
                };
                tpaPostMessageCommon.handleTPAMessage(undefined, this.siteAPI, this.callHandler, event);
                expect(this.callHandler).toHaveBeenCalled();
            });

        });

    });
});
