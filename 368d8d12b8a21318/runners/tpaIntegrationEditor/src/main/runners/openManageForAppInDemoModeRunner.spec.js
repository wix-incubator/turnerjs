define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('provision on open settings for app in demo mode - template', function () {
        it('should provision app when user opens manage products', function (done) {
            var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
            expect(driver.isInDemoMode(appDefId)).toBeTruthy();
            driver.navigateToPage('c3yu').then(function () {
                driver.openManageProducts(appDefId).then(function () {
                    expect(driver.isInDemoMode(appDefId)).toBeFalsy();
                    driver.closeAllPanels();
                    done();
                });
            });
        });
    });
});