define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('provision add app flow - template', function () {
            it('should provision on save', function (done) {
                var appDefId = '1375baa8-8eca-5659-ce9d-455b2009250d';
                expect(driver.isInDemoMode(appDefId)).toBeTruthy();
                driver.save(function () {
                    expect(driver.isInDemoMode(appDefId)).toBeFalsy();
                    done();
                }, function() {
                    fail('expected save to success');
                    done();
                });
            });
        }
    );
});
