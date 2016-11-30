define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, driver) {
    'use strict';

    describe('deep linking', function () {
        var compId = 'TPSctn0-8w1';

        it('should get the state from additional info in site URL', function () {
            var state = 'test-state';
            var pageInfo = driver.getCurrentNavigationInfo();
            expect(pageInfo.state.sectionUrlState).toEqual(state);
        });

        it('should not navigate to section when app has no section', function (done) {
            compId = 'TPWdgt0-mvo';

            driver.navigateToPage('cadp');

            return driver.appIsAlive(compId).then(function () {
                var pageInfo = driver.getCurrentNavigationInfo();

                expect(pageInfo.state).toBeUndefined();
                done();
            });
        });
    });
});
