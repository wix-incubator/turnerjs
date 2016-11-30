define(['jquery', 'tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function ($, driver) {
    'use strict';

    describe('Non wix app in template i.e., in demo mode', function () {
        it('should open the permissions modal once user tries to open settings', function(done) {
            driver.gfppOpenSettingsClick('13811a79-eb36-36e8-64fa-bc9792ddf097');
            driver.waitForDomElement('.focus-panel-frame-content', 10, 2000, 'settings panel was not opened in 10*1000 milsec').then(function (panel) {
                var $permissions = $(panel.dom[0]).find('.app-market-permissions-modal-container');
                var frameSrc = $($permissions.children()[0]).attr('src');
                expect(frameSrc).toContain('permission-request');
                expect(frameSrc).toContain('demoMode=true');
                done();
            }, function () {
                fail('settings panel was not opened in 10*1000 milsec');
                done();
            });
        });
    });
});