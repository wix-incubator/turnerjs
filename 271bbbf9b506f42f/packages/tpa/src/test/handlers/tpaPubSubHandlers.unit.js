define(['core', 'react', 'utils', 'tpa/bi/errors', 'definition!tpa/handlers/tpaPubSubHandlers'], function(core, React, utils, biErrors, tpaPubSubHandlersDef) {
    'use strict';

    describe('PubSub handlers', function () {
        var pubSubHandlers;
        var testAppDefId = 'test-app-def-id';
        var testEvent = 'test-event';
        var testOrigin = 'test-origin';
        var subscribeMsgMock = {
            callId: 2,
            compId: 'subscriber',
            type: 'registerEventListener',
            data: {
                eventKey: testEvent
            }
        };
        var siteAPI;
        var pubSubAspectMock;
        var tpaUtils;
        var mockSiteData = {};
        var logger;

        describe('Handlers-Aspect integration', function () {
            beforeEach(function () {
                logger = utils.logger;
                pubSubAspectMock = {
                    publish: jasmine.createSpy().and.callFake(function () {}),
                    subscribe: jasmine.createSpy().and.callFake(function () {}),
                    unsubscribe: jasmine.createSpy().and.callFake(function () {})
                };
                siteAPI = {
                    getSiteAspect: jasmine.createSpy('getSiteAspect').and.returnValue(pubSubAspectMock),
                    getSiteData: jasmine.createSpy('getSiteData').and.returnValue(mockSiteData)
                };
                tpaUtils = {
                    getAppDefId: jasmine.createSpy('getAppDefId').and.returnValue(testAppDefId),
                    stripPubSubPrefix: jasmine.createSpy('stripPubSubPrefix').and.returnValue(testEvent)
                };

                pubSubHandlers = tpaPubSubHandlersDef(tpaUtils, utils, biErrors);
            });

            it('should subscribe in aspect', function () {
                pubSubHandlers.registerEventListener(siteAPI, subscribeMsgMock);

                expect(pubSubAspectMock.subscribe).toHaveBeenCalledWith(subscribeMsgMock);
            });

            it('should publish in aspect', function () {
                var publishedData = {foo: 'bar'};
                var msgData = {
                    eventKey: 'TPA_PUB_SUB_' + testEvent,
                    eventData: publishedData,
                    origin: 'test-origin',
                    isPersistent: false
                };
                var expectedMsgData = msgData;
                expectedMsgData.eventKey = testEvent;

                pubSubHandlers.publish(siteAPI, {
                    compId: "publisher",
                    data: msgData
                });

                expect(pubSubAspectMock.publish).toHaveBeenCalledWith(testAppDefId, 'publisher', expectedMsgData);
            });

            it('should report bi error nothing if app is not installed', function() {
                spyOn(logger, 'reportBI');
                var publishedData = {foo: 'bar'};
                var msgData = {
                    eventKey: 'TPA_PUB_SUB_' + testEvent,
                    eventData: publishedData,
                    origin: 'test-origin',
                    isPersistent: false
                };

                tpaUtils.getAppDefId.and.returnValue(null);

                pubSubHandlers.publish(siteAPI, {
                    compId: "publisher",
                    data: msgData
                });

                expect(pubSubAspectMock.publish).not.toHaveBeenCalled();
                expect(logger.reportBI).toHaveBeenCalledWith(mockSiteData, biErrors.SDK_PUBSUB_PUBLISH_ERROR);
            });

            it('should unsubscribe in aspect', function () {
                var publishedData = {foo: 'bar'};

                pubSubHandlers.removeEventListener(siteAPI, {
                    compId: 'publisher',
                    data: {
                        eventKey: 'TPA_PUB_SUB_' + testEvent,
                        eventData: publishedData,
                        origin: testOrigin
                    }
                });

                expect(pubSubAspectMock.unsubscribe).toHaveBeenCalledWith(testAppDefId, 'publisher', testEvent);
            });
        });
    });
});