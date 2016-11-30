define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('provision add app - demo mode - template', function () {
        it('should provision app when user is adding a new widget', function (done) {
            var appDefId = '13bb5d67-1add-e770-a71f-001277e17c57';
            expect(driver.isInDemoMode(appDefId)).toBeTruthy();
            driver.addWidget(appDefId).then(function () {
                expect(driver.isInDemoMode(appDefId)).toBeFalsy();
                done();
            });
        });
    });
});