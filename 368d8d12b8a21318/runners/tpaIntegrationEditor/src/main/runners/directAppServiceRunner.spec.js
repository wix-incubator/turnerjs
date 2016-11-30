define(['jquery', 'tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function ($, driver) {
    'use strict';

    describe('tpa direct App Service', function () {
        it('should handle opening the market w/ the right appDefId and referralInfo', function (done) {
            driver.waitForMarketAndReturnUrl().then(function (resultObj) {
                expect(resultObj.result).toBe('ok');
                var $dom = $(resultObj.dom[0]);
                expect($dom.attr('src')).toContain('openAppDefId=12f1fbab-8b9d-3002-87b5-2972897e8314');
                expect($dom.attr('src')).toContain('referralInfo=dash_market');
                done();
            }).catch(function(resultObj) {
                var $dom = $(resultObj.dom[0]);
                fail($dom.attr('src'));
                done();
            });
        });
    });
});
