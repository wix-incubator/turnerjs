define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('tpa openBillingPage handler', function () {
        it('should handle openBillingPage for cycle modal', function (done) {
            var appDefId = '13016589-a9eb-424a-8a69-46cb05ce0b2c';
            driver.openBillingPage(appDefId, 'cycles-modal').then(function (response) {
                expect(response.result).toBe('ok');
                driver.closeAllPanels();
                done();
            }).catch(function(response) {
                fail(response.result);
                done();
            });
        });

        it('should handle openBillingPage for benefits modal', function (done) {
            var appDefId = '12f51ae9-aa4e-1717-f49f-581ef8058a7d';
            driver.openBillingPage(appDefId, 'benefits-modal').then(function (response) {
                expect(response.result).toBe('ok');
                driver.closeAllPanels();
                done();
            }).catch(function(response) {
                fail(response.result);
                done();
            });
        });

        it('should open upgrade url with referralAdditionalInfo=settings if referrer is not passed ', function (done) {
            spyOn(window, 'open');
            var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';

            driver.openBillingPage(appDefId, 'benefits-modal').then(function (response) {
                driver.selectComp(appDefId);
                response.dom.find('.btn-upgrade').click();
                expect(response.result).toBe('ok');
                expect(window.open.calls.argsFor(0)[0]).toContain('referralAdditionalInfo=settings');
                done();
            }).catch(function (response) {
                fail(response.result);
                done();
            });
        });

        it('should open upgrade url with referralAdditionalInfo=referrer if referrer is passed ', function (done) {
            spyOn(window, 'open');
            var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';

            driver.openBillingPage(appDefId, 'benefits-modal', {data: {referrer: 'referrer'}}).then(function (response) {
                driver.selectComp(appDefId);
                response.dom.find('.btn-upgrade').click();
                expect(response.result).toBe('ok');
                expect(window.open.calls.argsFor(0)[0]).toContain('referralAdditionalInfo=referrer');
                done();
            }).catch(function (response) {
                fail(response.result);
                done();
            });
        });

        it('should get the upgrade url with referralAdditionalInfo defined but with no value', function (done) {
            var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
            driver.getWixUpgradeUrl(appDefId, function (url) {
                expect(url).toContain('referralAdditionalInfo');
                expect(url).not.toContain('referralAdditionalInfo=');
                done();
            });
        });

        /*
        it('should handle openBillingPage for pp modal', function (done) {
            var appDefId = '12aacf69-f3fb-5334-2847-e00a8f13c12f';
            driver.openBillingPage(appDefId, 'package-picker-container').then(function (response) {
                expect(response.result).toBe('ok');
                driver.closeAllPanels();
                done();
            }).catch(function(response) {
                fail(response.result);
                done();
            });
        });
        */
    });
});
