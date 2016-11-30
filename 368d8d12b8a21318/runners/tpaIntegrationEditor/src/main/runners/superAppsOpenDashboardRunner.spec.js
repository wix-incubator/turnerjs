define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('supperApps openDashboardUrl tests', function () {

        var wixStoresAppDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';

        beforeEach(function(){
            driver.closeAllPanels();
        });

        it('should open iframe with origin in url', function (done) {
            driver.navigateToPage('p21vc').then(function () {
                driver.openManageProducts(wixStoresAppDefId, {origin: 'testOrigin'}).then(function () {
                    var modal = $('.focus-panel-frame');
                    var iframeSrc = modal.find('iframe').attr('src');
                    expect(iframeSrc).toContain('origin=testOrigin');
                    driver.closeAllPanels();
                    done();
                });
            });
        });

        it('should open iframe without origin in url if origin is an empty string', function (done) {
            driver.navigateToPage('p21vc').then(function () {
                driver.openManageProducts(wixStoresAppDefId, {origin: ''}).then(function () {
                    var modal = $('.focus-panel-frame');
                    var iframeSrc = modal.find('iframe').attr('src');
                    expect(iframeSrc).not.toContain('origin=');
                    driver.closeAllPanels();
                    done();
                });
            });
        });

        it('should open iframe without origin in url if origin is null', function (done) {
            driver.navigateToPage('p21vc').then(function () {
                driver.openManageProducts(wixStoresAppDefId, {origin: null}).then(function () {
                    var modal = $('.focus-panel-frame');
                    var iframeSrc = modal.find('iframe').attr('src');
                    expect(iframeSrc).not.toContain('origin=');
                    driver.closeAllPanels();
                    done();
                });
            });
        });

        it('should open iframe without origin in url if origin is not passed', function (done) {
            driver.navigateToPage('p21vc').then(function () {
                driver.openManageProducts(wixStoresAppDefId).then(function () {
                    var modal = $('.focus-panel-frame');
                    var iframeSrc = modal.find('iframe').attr('src');
                    expect(iframeSrc).not.toContain('origin=');
                    driver.closeAllPanels();
                    done();
                });
            });
        });
    });
});
