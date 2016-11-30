define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, driver) {
    'use strict';

    describe('tpaSection Tests', function () {
        var compId = 'TPSctn0-8w1';

        describe('push state', function () {

            beforeAll(function () {
                compId = 'TPSctn0-8w1';
                driver.navigateToPage('cpi4');
                delete driver.appsReady[compId];

                driver.appIsAlive(compId);
            });

            it('should change site state', function (done) {
                var state = 'new-state';
                var siteData = window.rendered.props.siteData;
                driver.pushState(compId, state, 3000).then(function () {
                    expect(siteData.getExistingRootNavigationInfo(siteData.getCurrentUrlPageId()).pageAdditionalData).toEqual(state);
                    done();
                });
            });
        });

        describe('replace state', function() {
            beforeAll(function () {
                compId = 'TPSctn0-8w1';
                driver.navigateToPage('cpi4');
                delete driver.appsReady[compId];

                driver.appIsAlive(compId);
            });

            it('should replace site state and not save it to browser history', function (done) {
                var state = 'replace-state';
                var state2 = 'replace-state2';
                var siteData = window.rendered.props.siteData;
                driver.replaceState(compId, state).then(function () {
                    expect(siteData.getExistingRootNavigationInfo(siteData.getCurrentUrlPageId()).pageAdditionalData).toEqual(state);
                    expect(_.endsWith(window.location.pathname, state)).toBeTruthy();
                    driver.replaceState(compId, state2).then(function () {
                        expect(_.endsWith(window.location.pathname, state2)).toBeTruthy();
                        window.history.back();
                        setTimeout(function () {
                            expect(window.location.pathname).toEqual('/multi1/multi/new-state');
                            done();
                        }, 1000);
                    });
                });
            });
        });
    });
});
