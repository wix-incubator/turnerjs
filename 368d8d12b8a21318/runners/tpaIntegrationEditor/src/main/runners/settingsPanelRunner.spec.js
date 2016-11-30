define(['tpaIntegrationEditor/driver/driver', 'lodash', 'jquery', 'jasmine-boot'], function (driver, _, $) {
    'use strict';

    describe('settingsPanelRunner', function () {
        var commentsAppDefId = '13016589-a9eb-424a-8a69-46cb05ce0b2c';
        var defaultHelpId = '2898b3c3-7032-4c14-8858-81dc07063fa5';

        it('should open and close help panel without refreshing the settings iframe', function (done) {
            var spy = driver.spyOnAppIsAlive();

            driver.openSettingsPanel(commentsAppDefId).then(function () {

                var helpButton = $('.tpa-settings-panel-frame').find('.panel-header .btn-help');
                helpButton.click();

                driver.waitForDomElement('.help-panel-frame', 10, 1000, 'help panel was not opened in 10*1000 milsec').then(function () {

                    var closeButton = $('.help-panel-frame').find('.close');
                    closeButton.click();

                    setTimeout(function () {
                        expect(spy.calls.count()).toBe(1); //only when settings was loaded
                        done();
                    }, 2000);
                });
            });
        });

        it('should get the right help url', function (done) {
            driver.openSettingsPanel(commentsAppDefId).then(function () {

                var helpButton = $('.tpa-settings-panel-frame').find('.panel-header .btn-help');
                helpButton.click();

                driver.waitForDomElement('.help-panel-frame', 10, 1000, 'help panel was not opened in 10*1000 milsec').then(function (result) {
                    var helpIframe = result.dom.find('iframe').first();
                    expect(helpIframe.attr('src')).toContain(defaultHelpId);
                    done();
                });
            });
        });

        describe('when setHelpArticle is used', function () {
            var customHelpId = 'ca4ff7a3-322a-42f1-80b4-229f83f31e63';

            it('should change the help id', function (done) {
                driver.openSettingsPanel(commentsAppDefId).then(function () {
                    driver.setHelpArticle(customHelpId);

                    setTimeout(function () {
                        var helpButton = $('.tpa-settings-panel-frame').find('.panel-header .btn-help');
                        helpButton.click();

                        driver.waitForDomElement('.help-panel-frame', 10, 1000, 'help panel was not opened in 10*1000 milsec').then(function (result) {
                            var helpIframe = result.dom.find('iframe').first();
                            expect(helpIframe.attr('src')).toContain(customHelpId);
                            done();
                        });
                    }, 1000);
                });
            });

            it('should return the original help id when reopening the settings panel', function (done) {
                driver.closeAllPanels();
                driver.openSettingsPanel(commentsAppDefId).then(function () {
                    var helpButton = $('.tpa-settings-panel-frame').find('.panel-header .btn-help');
                    helpButton.click();
                    driver.waitForDomElement('.help-panel-frame', 10, 1000, 'help panel was not opened in 10*1000 milsec').then(function (result) {
                        var helpIframe = result.dom.find('iframe').first();
                        expect(helpIframe.attr('src')).not.toContain(customHelpId);
                        expect(helpIframe.attr('src')).toContain(defaultHelpId);
                        done();
                    });
                });
            }, 1000);
        });
    });
});
