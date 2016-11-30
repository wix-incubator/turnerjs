define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('provision on open settings for app in demo mode - template', function () {
        it('should provision app when user opens app settings', function (done) {
            var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
            expect(driver.isInDemoMode(appDefId)).toBeTruthy();
            driver.openSettingsPanel(appDefId).then(function () {
                expect(driver.isInDemoMode(appDefId)).toBeFalsy();
                done();
            });
        });
    });
});