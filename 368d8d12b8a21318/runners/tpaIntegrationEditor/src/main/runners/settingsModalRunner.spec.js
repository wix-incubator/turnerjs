define(['tpaIntegrationEditor/driver/driver', 'lodash', 'jquery', 'jasmine-boot'], function (driver, _, $) {
    'use strict';

    describe('openSettingsModal', function () {
        var commentsAppDefId = '13016589-a9eb-424a-8a69-46cb05ce0b2c';
        var wixStoresAppDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';

        describe('with regular TPA', function () {
            var msg = {
                data: {
                    url: 'www.example.com',
                    width: 400,
                    height: 100,
                    title: 'my title',
                    onClose: jasmine.createSpy('onClose')
                }
            };
            var settingsModal;
            var helpButton;
            var helpPanelFrame;

            beforeAll(function(done){
                driver.settingsOpenModal(commentsAppDefId, msg)
                    .then(function (modal) {
                        settingsModal = modal;
                        done();
                    });
            });

            it('should open settings modal', function () {
                expect(settingsModal.result).toBe('ok');
                expect(settingsModal.dom.length).toBe(1);
            });

            it('should open it in the right dimensions', function () {
                expect(settingsModal.dom.find('iframe').height()).toBe(msg.data.height);
                expect( settingsModal.dom.width() ).toBe(msg.data.width);
            });

            it('should have help button', function () {
                helpButton = settingsModal.dom.find('.panel-header .btn-help');
                expect(helpButton.length).toBe(1);
            });

            it('should open help', function (done) {
                helpButton.click();
                setTimeout(function () {
                    helpPanelFrame = $('.help-panel-frame');
                    expect(helpPanelFrame.length).toBe(1);
                    done();
                }, 5000);
            });

            it('should get the right help url', function () {
                var helpPanelFrame = $('.help-panel-frame');
                var helpIframe = helpPanelFrame.find('iframe').first();

                expect(helpIframe.attr('src')).toContain("2898b3c3-7032-4c14-8858-81dc07063fa5");
            });

            afterAll(function () {
                driver.closeAllPanels();
            });
        });

        describe('with vertical TPA', function () {
            var WIX_STORE_DEFAULT_HELP_ID = '0f648788-74b4-4e52-a81a-6e7beaf886be';

            var msg = {
                data: {
                    url: 'www.example.com',
                    width: 400,
                    height: 100,
                    title: 'my title',
                    appDefinitionId: wixStoresAppDefId,
                    helpId: WIX_STORE_DEFAULT_HELP_ID,
                    onClose: jasmine.createSpy('onClose')
                }
            };

            var settingsModal;
            var helpButton;
            var helpPanelFrame;

            beforeAll(function(done){
                driver.settingsOpenModal(wixStoresAppDefId, msg)
                    .then(function (modal) {
                        settingsModal = modal;
                        done();
                    });
            });

            it('should open settings modal', function () {
                expect(settingsModal.result).toBe('ok');
                expect(settingsModal.dom.length).toBe(1);
            });

            it('should open it in the right dimensions', function () {
                expect(settingsModal.dom.find('iframe').height()).toBe(msg.data.height);
                expect(settingsModal.dom.width()).toBe(msg.data.width);
            });

            describe('help', function () {
                it('should have help button', function () {
                    helpButton = settingsModal.dom.find('.panel-header .btn-help');
                    expect(helpButton.length).toBeGreaterThan(0);
                });

                it('should open help', function (done) {
                    helpButton.click();
                    setTimeout(function () {
                        helpPanelFrame = $('.help-panel-frame');
                        expect( helpPanelFrame.length ).toBe(1);
                        done();
                    }, 5000);
                });

                it('should get the right help url', function () {
                    var helpPanelFrame = $('.help-panel-frame');
                    var helpIframe = helpPanelFrame.find('iframe').first();

                    expect(helpIframe.attr('src')).toContain("0f648788-74b4-4e52-a81a-6e7beaf886be");
                });
            });

            afterAll(function () {
                driver.closeAllPanels();
            });
        });

        describe('super apps modal options', function () {
            var settingsModal;
            var WIX_STORE_APP_DEF_ID = '1380b703-ce81-ff05-f115-39571d94dfcd';

            var msg = {
                data: {
                    url: 'www.example.com',
                    width: 400,
                    height: 100,
                    isBareMode: true,
                    options: {
                        margin: false,
                        background: 'rgb(255, 215, 255)',
                        overlay: 'rgb(255, 215, 0)'

                    },
                    onClose: jasmine.createSpy('onClose')
                }
            };

            beforeAll(function(done){
                driver.settingsOpenModal(WIX_STORE_APP_DEF_ID, msg)
                    .then(function (modal) {
                        settingsModal = modal;
                        done();
                    });
            });

            it('should open settings modal', function () {
                expect(settingsModal.result).toBe('ok');
                expect(settingsModal.dom.length).toBeGreaterThan(0);
            });

            it('should open it in the right dimensions', function () {
                expect(settingsModal.dom.find('iframe').height()).toBe(msg.data.height);
                expect(settingsModal.dom.width()).toBe(msg.data.width);
            });

            it('should have the right overlay bg color', function () {
                expect($('.dark-frame-overlay').css('backgroundColor')).toBe('rgb(255, 215, 0)');

                expect($('.focus-panel-frame-content-no-header').css('backgroundColor')).toBe('rgb(255, 215, 255)');
            });

            afterAll(function () {
                driver.closeAllPanels();
            });
        });

        describe('when setHelpArticle is used', function () {
            var customHelpId = 'ca4ff7a3-322a-42f1-80b4-229f83f31e63';
            var msg = {
                data: {
                    url: 'www.example.com',
                    width: 400,
                    height: 100,
                    title: 'my title',
                    onClose: jasmine.createSpy('onClose')
                }
            };

            it('should change the help id', function (done) {

                driver.settingsOpenModal(wixStoresAppDefId, msg).then(function (modal) {
                    driver.setHelpArticle(customHelpId, 'MODAL');

                    setTimeout(function () {
                        var helpButton = modal.dom.find('.panel-header .btn-help');
                        helpButton.click();

                        driver.waitForDomElement('.help-panel-frame', 10, 1000, 'help panel was not opened in 10*1000 milsec').then(function (result) {
                            var helpIframe = result.dom.find('iframe').first();
                            expect(helpIframe.attr('src')).toContain(customHelpId);
                            expect(helpIframe.attr('src')).not.toContain('0f648788-74b4-4e52-a81a-6e7beaf886be');
                            done();
                        });
                    }, 1000);
                });
            });

            it('should return the original help id when reopening the settings modal', function (done) {
                driver.closeAllPanels();
                driver.settingsOpenModal(wixStoresAppDefId, msg).then(function (modal) {
                    var helpButton = modal.dom.find('.panel-header .btn-help');
                    helpButton.click();
                    driver.waitForDomElement('.help-panel-frame', 10, 1000, 'help panel was not opened in 10*1000 milsec').then(function (result) {
                        var helpIframe = result.dom.find('iframe').first();
                        expect(helpIframe.attr('src')).not.toContain(customHelpId);
                        expect(helpIframe.attr('src')).toContain('0f648788-74b4-4e52-a81a-6e7beaf886be');
                        done();
                    });
                });
            }, 1000);
        });
    });
});
