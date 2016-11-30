define(['jquery', 'tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function ($, driver) {
    'use strict';

    describe('tpa pending', function () {
        it('should show 2 pending apps indication', function (done) {
            driver.getPendingValue().then(function (panel) {
                var pendingValue = panel.dom.find('.notifications').text();
                expect(pendingValue).toBe('2');
                done();
            }).catch(function() {
                fail('expected pending apps count to be 2.');
                done();
            });
        });

        /*
        it('should add and remove pending apps', function(done){
            var siteBoosterAppDefId = "e526cc43-5f4c-4c94-81e4-3f5eb39a0c9d";
            driver.addPendingApp(siteBoosterAppDefId);
            driver.getPendingValue()
                .then(function (panel) {
                    var pendingValue = panel.dom.find('.notifications').text();
                    expect(pendingValue).toBe('3');
                })
                .then(function(){
                    driver.removePendingApp(siteBoosterAppDefId);
                    return driver.getPendingValue();
                })
                .then(function (panel) {
                    var pendingValue = panel.dom.find('.notifications').text();
                    expect(pendingValue).toBe('2');
                    done();
                })
                .catch(function() {
                    fail('expected pending apps count to be 2.');
                    done();
                });
        });
        */
    });
});