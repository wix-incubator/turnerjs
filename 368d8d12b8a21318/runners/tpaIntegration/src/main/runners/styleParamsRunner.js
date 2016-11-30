define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, driver) {
    'use strict';
    // site: http://mayah4.wix.com/mysite-114
    describe('style Tests', function () {
        var compId = 'TPASection_inhm779h';

        beforeAll(function() {
            driver.appIsAlive(compId);
        });

        describe('compare style by id and comp style', function() {
            it('should be equal', function(done) {
                driver.getStyleData(compId, function(data) {
                    driver.getStyleId(compId, function(styleId) {
                        driver.getStyleParamsByStyleId(compId, styleId, function(styleParam) {
                            expect(data.style).toEqual(styleParam);
                            done();
                        })
                    });
                });
            });
        });
    });
});
