define(['jquery', 'tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function ($, driver) {
    'use strict';

    describe('open new app market when experiment appMarketUnification is on', function () {
        it('should open new app market', function (done) {
            driver.openAppMarketPanel();
            driver.waitForDomElement('.app-market-frame-20', 10, 1000, 'app market panel was not opened in 10*1000 milsec').then(function (resultObj) {
                expect(resultObj.result).toBe('ok');
                done();
            }).catch(function(resultObj) {
                var $dom = $(resultObj.dom[0]);
                fail($dom.hasClass('app-market-frame-20'));
                done();
            });
        });
    });
});
