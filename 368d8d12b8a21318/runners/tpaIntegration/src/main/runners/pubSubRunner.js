define([
    'zepto',
    'lodash',
    'bluebird',
    'tpaIntegration/driver/driver',
    'tpaIntegration/driver/pingpong',
    'jasmine-boot'
], function ($, _, Promise, driver, Pingpong) {
    'use strict';

    function getCompsReady(compIds) {
        return new Promise(function (resolve) {
            var comps = compIds.map(function (compId) {
                return new Pingpong(compId);
            });
            var compsReadyPromises = comps.map(function (comp) {
                return new Promise(function (resolve) {
                    comp.onReady(
                        comp.injectScript(driver.getSDKUrl(), 'head')
                            .then(resolve)
                    );
                })
            });
            Promise.all(compsReadyPromises).then(function () {
                resolve(comps);
            })
        })
    }

    function eventNameGenarator() {
        return 'eventName' + (eventNameGenarator.counter++);
    }
    eventNameGenarator.counter = 0;

    var app1CompAId = 'comp-ibqdgj28';
    var app1CompBId = 'comp-ibq7895p';
    var app2CompAId = 'comp-ibsyyvc2';
    var app2CompB_secondPageId = 'comp-ibt18088';
    var app1CompA, app1CompB, app2CompA;

    describe('TPA PubSub Tests', function () {
        beforeAll(function (done) {
            getCompsReady([app1CompAId, app1CompBId, app2CompAId]).then(function (compsArr) {
                app1CompA = compsArr[0];
                app1CompB = compsArr[1];
                app2CompA = compsArr[2];
                done();
            });
        });


        describe('simple subscribe & publish', function () {
            var eventData = {event: 'data'};

            it('should subscribe event listener and return it\'s id', function (done) {
                var eventName = eventNameGenarator();

                app1CompA.request('Wix.PubSub.subscribe', eventName, _.noop, false).then(function (id) {
                    expect(_.isNumber(id)).toBe(true);
                    done();
                });
            });

            it('should publish event and invoke it\'s listeners', function (done) {
                var eventName = eventNameGenarator();
                var noop = jasmine.createSpy('cb spy');
                app1CompA.request('Wix.PubSub.subscribe', eventName, noop, false).then(function () {
                    app1CompB.request('Wix.PubSub.publish', eventName, eventData).then(function () {
                        expect(noop).toHaveBeenCalledWith({
                            data: eventData,
                            origin: app1CompB.id,
                            name: eventName
                        }, null);
                        setTimeout(done, 100);
                    });
                });
            });
        });

        describe('callback should not being called after unsubscribe', function () {
            it('should unsubscribe event listener and not call it on publish', function (done) {
                var eventName = eventNameGenarator();
                var noop = jasmine.createSpy('cb spy');
                app1CompA.request('Wix.PubSub.subscribe', eventName, noop).then(function (id) {
                    setTimeout(function () {
                        app1CompA.request('Wix.PubSub.unsubscribe', eventName, id).then(function () {
                            app1CompB.request('Wix.PubSub.publish', eventName, {}, false).then(function () {
                                expect(noop).not.toHaveBeenCalled();
                                setTimeout(done, 100);
                            });
                        });
                    }, 100);
                });
            });
        });

        describe('events Leakage', function () {
            it('callback with eventName A shouldn\'t being called when eventName B published', function (done) {
                var eventNameA = eventNameGenarator();
                var eventNameB = eventNameGenarator();
                var noop = jasmine.createSpy('cb spy');
                app1CompA.request('Wix.PubSub.subscribe', eventNameA, noop, false).then(function () {
                    app1CompB.request('Wix.PubSub.publish', eventNameB, {}).then(function () {
                        expect(noop).not.toHaveBeenCalled();
                        done();
                    });
                });
            });

            it('callback from app a should not being called on app b publish', function (done) {
                var eventName = eventNameGenarator();
                var noop = jasmine.createSpy('cb spy');
                app1CompA.request('Wix.PubSub.subscribe', eventName, noop, false).then(function () {
                    app2CompA.request('Wix.PubSub.publish', eventName, {}).then(function () {
                        expect(noop).not.toHaveBeenCalled();
                        done();
                    });
                });
            });
        });

        describe('subscriptions after publish', function () {
            it('shouldn\'t being called if receivePastEvents is false', function (done) {
                var eventName = eventNameGenarator();
                var noop = jasmine.createSpy('cb spy');
                app1CompA.request('Wix.PubSub.publish', eventName, {}, true).then(function () {
                    app1CompB.request('Wix.PubSub.subscribe', eventName, noop, false).then(function () {
                        expect(noop).not.toHaveBeenCalled();
                        done();
                    });
                });
            });

            it('shouldn\'t being called if isPersistent is false', function (done) {
                var eventName = eventNameGenarator();
                var noop = jasmine.createSpy('cb spy');
                app1CompA.request('Wix.PubSub.publish', eventName, {}, false).then(function () {
                    app1CompB.request('Wix.PubSub.subscribe', eventName, noop, true).then(function () {
                        expect(noop).not.toHaveBeenCalled();
                        done();
                    });
                });
            });

            it('should being called if isPersistent & receivePastEvents are both true', function (done) {
                var eventName = eventNameGenarator();
                var noop = jasmine.createSpy('cb spy');
                app1CompA.request('Wix.PubSub.publish', eventName, {}, true).then(function () {
                    app1CompB.request('Wix.PubSub.subscribe', eventName, noop, true).then(function () {
                        expect(noop).toHaveBeenCalled();
                        setTimeout(done, 100);
                    });
                });
            });

        });

        describe('subscriptions after publish should being called if isPersistent & receivePastEvents are both true', function () {
            it('should publish event navigate to other page, register to that event and invoke it\'s callback', function (done) {
                var eventName = eventNameGenarator();
                var eventData = {};
                var noop = jasmine.createSpy('cb spy');
                app2CompA.request('Wix.PubSub.publish', eventName, eventData, true).then(function () {
                    app2CompA.request('Wix.navigateToPage', "p4jnq").then(function () {
                        setTimeout(function () {
                            var compInSecondPage = new Pingpong(app2CompB_secondPageId);
                            compInSecondPage.onReady(function () {
                                compInSecondPage.injectScript(driver.getSDKUrl(), 'head')
                                    .then(function () {
                                        compInSecondPage.request('Wix.PubSub.subscribe', eventName, noop, true).then(function () {
                                            expect(noop).toHaveBeenCalled();
                                            setTimeout(done, 100);
                                        });
                                    })
                            });
                        }, 2500);
                    });
                });
            });
        });
    });
});
