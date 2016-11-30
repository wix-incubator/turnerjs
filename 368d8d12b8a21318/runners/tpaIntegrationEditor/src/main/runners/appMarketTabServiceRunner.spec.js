define(['jquery', 'tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function ($, driver) {
    'use strict';

    describe('App market tab Service', function () {
        it('should handle opening the market w/ the right referralInfo', function (done) {
            driver.waitForMarketAndReturnUrl().then(function (resultObj) {
                expect(resultObj.result).toBe('ok');
                var $dom = $(resultObj.dom[0]);
                expect($dom.attr('src')).toContain('referralInfo=sa_market');
                done();
            }).catch(function(resultObj) {
                var $dom = $(resultObj.dom[0]);
                fail($dom.attr('src'));
                done();
            });
        });
    });
});
