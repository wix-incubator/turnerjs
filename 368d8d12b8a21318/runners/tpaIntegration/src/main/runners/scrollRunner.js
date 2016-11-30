define(['lodash', 'tpaIntegration/driver/driver', 'bluebird', 'tpaIntegration/driver/pingpong', 'jasmine-boot'], function (_, driver, Promise, Pingpong) {
    'use strict';

    describe('addEventListener for scroll', function () {
        var compId1, compId2, compId3, comp1, comp2, comp3, scrollEventTriggered;
        var comp1EventId, comp2EventId;

        beforeAll(function (done) {
            compId1 = 'comp-iq9di6n6';
            compId2 = 'comp-iq9di1jz';
            compId3 = 'comp-iq9h5xhj';

            comp1 = new Pingpong(compId1);
            comp2 = new Pingpong(compId2);
            comp3 = new Pingpong(compId3);

            Promise.all([
                new Promise(function(resolve) {
                    comp1.onReady(
                        comp1.injectScript(driver.getSDKUrl(), 'head')
                            .then(resolve)
                    );
                }),
                new Promise(function(resolve) {
                    comp2.onReady(
                        comp2.injectScript(driver.getSDKUrl(), 'head')
                            .then(resolve)
                    );
                }),
                new Promise(function(resolve) {
                    comp3.onReady(
                        comp3.injectScript(driver.getSDKUrl(), 'head')
                            .then(resolve)
                    );
                })
            ]).then(function () {
                done();
            })
        });

        afterEach(function () {
            comp1.request('Wix.removeEventListener', 'SCROLL', comp1EventId);
            comp2.request('Wix.removeEventListener', 'SCROLL', comp1EventId);
        });

        it('should sent scroll data to all registered apps', function (done) {
            var scrollData = {};
            scrollEventTriggered = function (compId, data) {
                scrollData[compId] = data;
                if (scrollData[compId1] && scrollData[compId2]) {
                    expect(_.omit(scrollData[compId1], ['x', 'y'])).toEqual(_.omit(scrollData[compId2], ['x', 'y']));
                    done();
                }
            };

            comp2.request('Wix.addEventListener', 'SCROLL', function (data) {
                scrollEventTriggered(compId2, data);
            }).then(function (id) {
                comp2EventId = id;
            });

            comp1.request('Wix.addEventListener', 'SCROLL', function (data) {
                scrollEventTriggered(compId1, data);
            }).then(function (id) {
                comp1EventId = id;
                driver.scrollTo(compId1, 0, 1000);
            });
        });

        it('should sent scroll data even it was updated fast', function (done) {
            driver.scrollTo(compId1, 0, 0);
            var counter = 0;


            comp3.request('Wix.addEventListener', 'SCROLL', function (data) {
                expect(data.scrollTop).toEqual(0);
                done();
            }).then(function () {
                driver.scrollTo(compId3, 0, 1000);
                driver.scrollTo(compId3, 0, 0);
            });
        });

    });
});
