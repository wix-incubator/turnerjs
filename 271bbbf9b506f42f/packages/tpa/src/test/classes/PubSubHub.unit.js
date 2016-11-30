define(['zepto', 'lodash', 'tpa/classes/PubSubHub', 'utils'], function ($, _, PubSubHub, utils) {
    'use strict';

    describe('TPA PubSub hub', function () {
        var hubMap;
        var hub;
        var mocks;

        beforeEach(function () {
            hubMap = {};
            hub = new PubSubHub(hubMap);
            mocks = {
                appDefId: 'app-def-id',
                compId: 'comp-id',
                eventKey: 'event-key',
                data: {foo: 'bar'},
                otherCompId: 'otherCompId'
            };
        });

        describe('when hub is empty', function () {
            it('should add first data object', function () {
                hub.persistData(mocks.appDefId, mocks.eventKey, mocks.compId, mocks.data);

                expect(hubMap[mocks.appDefId]).toBeDefined();
                expect(hubMap[mocks.appDefId][mocks.eventKey]).toBeDefined();
                expect(hubMap[mocks.appDefId][mocks.eventKey].data).toBeDefined();
                expect(hubMap[mocks.appDefId][mocks.eventKey].data.length).toEqual(1);

                hub.persistData(mocks.appDefId, mocks.eventKey, mocks.compId, mocks.data);

                var data = hub.getPersistedData(mocks.appDefId, mocks.eventKey);

                expect(data.length).toEqual(2);
            });

            it('should add first listener', function () {
                hub.addEventListener(mocks.appDefId, mocks.eventKey, mocks.compId);

                var listeners = hub.getEventListeners(mocks.appDefId, mocks.eventKey);

                expect(listeners).toBeDefined();
                expect(listeners.length).toEqual(1);
            });

            it('should remove non existing listener', function () {
                hub.removeEventListener(mocks.appDefId, mocks.eventKey, mocks.compId);

                var listeners = hub.getEventListeners(mocks.appDefId, mocks.eventKey);

                expect(listeners).not.toBeDefined();
            });

            it('should get no data', function () {
                var data = hub.getPersistedData(mocks.appDefId, mocks.eventKey);

                expect(data).not.toBeDefined();
            });

            it('should get no listeners', function () {
                var listeners = hub.getEventListeners(mocks.appDefId, mocks.eventKey);

                expect(listeners).not.toBeDefined();
            });
        });

        describe('when hub is not empty', function () {
            beforeEach(function () {
                hub.addEventListener(mocks.appDefId, mocks.eventKey, mocks.compId);
                hub.persistData(mocks.appDefId, mocks.eventKey, mocks.compId, mocks.data);
            });

            it('should add same listener', function () {
                hub.addEventListener(mocks.appDefId, mocks.eventKey, mocks.compId);

                var listeners = hub.getEventListeners(mocks.appDefId, mocks.eventKey);

                expect(listeners.length).toEqual(1);
            });

            it('should add new listener', function () {
                hub.addEventListener(mocks.appDefId, mocks.eventKey, mocks.compId + '_2');

                var listeners = hub.getEventListeners(mocks.appDefId, mocks.eventKey);

                expect(listeners.length).toEqual(2);
            });

            it('should add second data object', function () {
                hub.persistData(mocks.appDefId, mocks.eventKey, mocks.compId, mocks.data);

                var data = hub.getPersistedData(mocks.appDefId, mocks.eventKey);

                expect(data.length).toEqual(2);
            });

            it('should remove existing listener', function () {
                hub.removeEventListener(mocks.appDefId, mocks.eventKey, mocks.compId);

                var listeners = hub.getEventListeners(mocks.appDefId, mocks.eventKey);

                expect(listeners.length).toEqual(0);
            });

            it('should get one data object', function () {
                var data = hub.getPersistedData(mocks.appDefId, mocks.eventKey);

                expect(data).toBeDefined();
                expect(data.length).toEqual(1);
            });

            it('should get one listener', function () {
                var listeners = hub.getEventListeners(mocks.appDefId, mocks.eventKey);

                expect(listeners).toBeDefined();
                expect(listeners.length).toEqual(1);
            });

            it('should clear all listeners of a component, case one event is registered', function(){
                hub.deleteCompListeners(mocks.appDefId, mocks.compId);
                var listeners = hub.getEventListeners(mocks.appDefId, mocks.eventKey);
                expect(listeners).not.toContain( mocks.compId);
            });

            it('should clear all listeners of a component, case 2 events are registered', function(){
                hub.addEventListener(mocks.appDefId, 'event2', mocks.compId);
                hub.deleteCompListeners(mocks.appDefId, mocks.compId);
                var listeners = hub.getEventListeners(mocks.appDefId, mocks.eventKey);
                expect(listeners).not.toContain( mocks.compId);
                listeners = hub.getEventListeners(mocks.appDefId, 'event2');
                expect(listeners).not.toContain( mocks.compId);
            });

            it('should clear all listeners of a component, case 3 events are registered', function(){
                hub.addEventListener(mocks.appDefId, 'event2', mocks.compId);
                hub.addEventListener(mocks.appDefId, 'event2', mocks.otherCompId);
                hub.addEventListener(mocks.appDefId, 'event3', mocks.otherCompId);
                hub.deleteCompListeners(mocks.appDefId, mocks.compId);
                var listeners = hub.getEventListeners(mocks.appDefId, mocks.eventKey);
                expect(listeners).not.toContain( mocks.compId);
                listeners = hub.getEventListeners(mocks.appDefId, 'event2');
                expect(listeners).not.toContain( mocks.compId);
                listeners = hub.getEventListeners(mocks.appDefId, 'event3');
                expect(listeners).not.toContain( mocks.compId);
                listeners = hub.getEventListeners(mocks.appDefId, 'event2');
                expect(listeners).toContain( mocks.otherCompId);
                listeners = hub.getEventListeners(mocks.appDefId, 'event3');
                expect(listeners).toContain(mocks.otherCompId);
            });

            describe('data limit', function(){
                beforeEach(function(){
                    var data = [];
                    data[999] = {num: 1};
                    var bigHubMap = {
                        appDefId12: {
                            event1: {
                                data: data,
                                listeners: []
                            }
                        }
                    };
                    this.bigHub = new PubSubHub(bigHubMap);
                });

                it('should keep maximum of 1000 data objects', function(){

                    var persistedData = this.bigHub.getPersistedData('appDefId12', 'event1');
                    expect(persistedData.length).toBeLessThan(1001);
                    this.bigHub.persistData('appDefId12', 'event1', mocks.compId, {});
                    persistedData = this.bigHub.getPersistedData('appDefId12', 'event1');
                    expect(persistedData.length).toBeLessThan(1001);
                });

                it('should warn the user when the data limit is reached', function(){
                    spyOn(utils.log, 'warn').and.callThrough();
                    this.bigHub.persistData('appDefId12', 'event1', mocks.compId, {});
                    expect(utils.log.warn).toHaveBeenCalled();
                });
            });
        });
    });
});
