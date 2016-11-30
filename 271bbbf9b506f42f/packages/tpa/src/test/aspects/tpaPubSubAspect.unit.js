define(['zepto', 'lodash', 'definition!tpa/aspects/TPAPubSubAspect', 'tpa/classes/PubSubHub'], function ($, _, tpaPubSubAspectDef, PubSubHub) {
    'use strict';

    describe('PubSub aspect', function () {
        var TPAPubSubAspect;
        var pubSubAspect;
        var testEvent = 'test-event';
        var appDefId = 'test-app-def-id';
        var publishedData = {foo: 'bar'};
        var subscribeMockMsg = {
            callId: 2,
            compId: 'subscriber',
            type: 'registerEventListener',
            data: {
                eventKey: testEvent
            }
        };

        var siteAPI, tpaUtils, mockComp;

        beforeEach(function () {

            siteAPI = {
                getComponentById: jasmine.createSpy('getComponentById')
            };
            tpaUtils = {
                addPubSubEventPrefix: jasmine.createSpy('getComponentById').and.returnValue('TPA_PUB_SUB_' + testEvent),
                stripPubSubPrefix: jasmine.createSpy('stripPubSubPrefix').and.returnValue(testEvent),
                getAppDefId: jasmine.createSpy('getAppDefId').and.returnValue(appDefId)
            };
            mockComp = {
                sendPostMessage: jasmine.createSpy('sendPostMessage')
            };

            siteAPI.getComponentById.and.returnValue(mockComp);


            TPAPubSubAspect = tpaPubSubAspectDef(_, tpaUtils, PubSubHub);

            pubSubAspect = new TPAPubSubAspect(siteAPI);
        });

        describe('when no persisted data exist - classic flow', function () {
            it('should publish data to subscribed comp', function () {
                pubSubAspect.subscribe(subscribeMockMsg);
                pubSubAspect.publish(appDefId, 'publisher', {
                    eventKey: testEvent,
                    eventData: publishedData,
                    origin: 'publisher',
                    isPersistent: false
                });

                expect(mockComp.sendPostMessage).toHaveBeenCalledWith({
                    eventType: 'TPA_PUB_SUB_' + testEvent,
                    intent: 'addEventListener',
                    params: {
                        data: publishedData,
                        name: testEvent,
                        origin: 'publisher'
                    }
                });
            });

            it('should not publish data since there are no subscribers', function () {
                pubSubAspect.publish(appDefId, 'publisher', {
                    eventKey: testEvent,
                    eventData: publishedData,
                    origin: 'publisher',
                    isPersistent: false
                });

                expect(mockComp.sendPostMessage).not.toHaveBeenCalledWith();
            });

            it('should not publish data since the listener unsubscribed', function () {
                pubSubAspect.subscribe(subscribeMockMsg);
                pubSubAspect.unsubscribe(appDefId, 'subscriber', testEvent);
                pubSubAspect.publish(appDefId, 'publisher', {
                    eventKey: testEvent,
                    eventData: publishedData,
                    origin: 'publisher',
                    isPersistent: false
                });

                expect(mockComp.sendPostMessage).not.toHaveBeenCalledWith();
            });
        });

        describe('when publishing before subscribing with persisted data', function () {
            xit('should send persisted data', function () {
                pubSubAspect.publish(appDefId, 'publisher', {
                    eventKey: testEvent,
                    eventData: publishedData,
                    origin: 'publisher',
                    isPersistent: true
                });
                subscribeMockMsg.data.receivePastEvents = true;
                pubSubAspect.subscribe(subscribeMockMsg);

                expect(mockComp.sendPostMessage).toHaveBeenCalledWith({
                    eventType: 'TPA_PUB_SUB_' + testEvent,
                    intent: 'addEventListener',
                    params: {
                        data: publishedData,
                        name: testEvent,
                        origin: 'publisher'
                    }
                });
            });

            it('should not send persisted data', function () {
                pubSubAspect.publish(appDefId, 'publisher', {
                    eventKey: testEvent,
                    eventData: publishedData,
                    origin: 'publisher',
                    isPersistent: true
                });
                subscribeMockMsg.data.receivePastEvents = false;
                pubSubAspect.subscribe(subscribeMockMsg);

                expect(mockComp.sendPostMessage).not.toHaveBeenCalledWith();
            });
        });
    });
});
