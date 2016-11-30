define([
    'zepto',
    'lodash',
    'bluebird',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, Promise, driver) {
    'use strict';
    describe('navigateToSection Tests', function () {
        var compId = 'TPWdgt0-11yp';

        describe('Multi Widget w/ section', function() {
            it('should navigate to section when app has one', function (done) {
                driver.appIsAlive(compId)
                    .then(function(){
                        driver.navigateToSection(compId, undefined, undefined, function(){}).then(function(pageItemInfo) {
                            expect(pageItemInfo.pageId).toBe('cpi4');
                            done();
                        });
                    });
            });

            it('should navigate to section and add state when app has a section', function (done) {
                var state = '#my-state';

                driver.navigateToSection(compId, undefined, state, function(){}).then(function(pageItemInfo) {
                    expect(pageItemInfo.pageId).toBe('cpi4');
                    expect(pageItemInfo.pageAdditionalData).toBe(state);
                    expect(pageItemInfo.state.sectionUrlState).toBe(state);
                    done();
                });
            });

            it('should not navigate to section when app has no section', function (done) {
                compId = 'TPWdgt0-mvo';

                driver.navigateToPage('cadp');

                driver.appIsAlive(compId).then(function () {
                    driver.navigateToSection(compId, undefined, undefined, function(){}).then(function(pageItemInfo) {
                        expect(pageItemInfo.pageId).toBe('cadp');
                        done();
                    });
                });
            });
        });
    });
});
