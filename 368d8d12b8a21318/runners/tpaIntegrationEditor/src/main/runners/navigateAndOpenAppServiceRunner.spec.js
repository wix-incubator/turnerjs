define(['jquery', 'tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function ($, driver) {
    'use strict';

    describe('tpa navigate and open app Service', function () {
        it('should handle open app - section', function (done) {
            var message = {
                cmd: 'OPEN_APP',
                params: {
                    appDefinitionId: '1380b703-ce81-ff05-f115-39571d94dfcd'
                }
            };

            driver.openApp(message);
            driver.waitForDomElement('.tpa-settings-panel-frame', 10, 1000, 'settings panel was not opened in 10*1000 milsec', {
                delay: 2000
            }).then(function () {
                expect(true).toBeTruthy();
                driver.closeSettingsPanel();
                done();
            }, function () {
                fail('settings panel was not opened in 10*1000 milsec');
                done();
            });
        });

        it('should handle open app - widget', function (done) {
            var message = {
                cmd: 'OPEN_APP',
                params: {
                    appDefinitionId: '13bb5d67-1add-e770-a71f-001277e17c57'
                }
            };

            driver.openApp(message);
            driver.waitForDomElement('.tpa-settings-panel-frame', 10, 1000, 'settings panel was not opened in 10*1000 milsec', {
                delay: 2000
            }).then(function () {
                expect(true).toBeTruthy();
                done();
            }, function () {
                fail('settings panel was not opened in 10*1000 milsec');
                done();
            });
        });
    });
});
