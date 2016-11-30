define(['jquery', 'tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function ($, driver) {
    'use strict';

    describe('tpa pending', function () {
        it('should show 3 pending apps indication', function (done) {
            driver.getPendingValue().then(function (panel) {
                var pendingValue = panel.dom.find('.notifications').text();
                expect(pendingValue).toBe('2');
                done();
            }).catch(function() {
                fail('expected pending apps count to be 2.');
                done();
            });
        });
    });
});
