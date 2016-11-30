define(['jquery', 'lodash', 'tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function ($, _, driver) {
    'use strict';

    describe('tpa app market panels', function () {

        afterAll(function(){
            driver.closeAllPanels();
        });

        it('should not show help for permissions modal', function (done) {
            var appDefId = '13016589-a9eb-424a-8a69-46cb05ce0b2c';
            driver.openMarketPanel(appDefId, 'appMarketPermissionsModal').then(function (panel) {
                var $header = $(panel.dom[0]).find('.panel-header.panel-header.dark');
                var className = $($header[0].children[1]).attr('class');
                expect(className).not.toBe('help');
                done();
            }).catch(function(panel) {
                fail(panel.result);
                done();
            });
        });

        it('should open app info on the reviews tab', function (done) {
            var appDefId = '13016589-a9eb-424a-8a69-46cb05ce0b2c';
            var appName = 'comments';
            driver.openReviewInfo(appDefId, 'appMarketAppModal').then(function (response) {
                expect(response.result).toBe('ok');
                var dom = $(response.dom[0]);
                var iframeSrc = dom.find('iframe').attr('src');
                expect(iframeSrc).toContain('http://editor.wix.com/wix-app-market/editor/');
                expect(iframeSrc).toContain('referralInfo=settings_panel');
                expect(iframeSrc).toContain('#/' + appName + '/reviews');
                done();
            }).catch(function (response) {
                fail(response.result);
                done();
            });

        });
    });

    describe('open app market modal', function(){
        var messages = [
            {
                cmd: 'OPEN_APP_MARKET_MODAL',
                params: {
                    height: '600',
                    width: '600',
                    url: 'http://www.example.com',
                    id: '1'
                }
            },
            {
                cmd: 'OPEN_APP_MARKET_MODAL',
                params: {
                    height: '500',
                    width: '500',
                    url: 'http://www.example.com',
                    id: '2',
                    title: 'Second Modal',
                    shouldTranslateTitle: true
                }
            },

            {
                cmd: 'OPEN_APP_MARKET_MODAL',
                params: {
                    height: '400',
                    width: '400',
                    url: 'http://www.example.com',
                    id: '3',
                    title: 'Third Modal'
                }
            }];

        afterEach(function(){
            driver.closeAllPanels();
        });

        it('should open modal with the required mandatory parameters', function(done){
            driver.openAppMarketModal(messages[1]);

            driver.waitForDomElement('.focus-panel-frame', 10, 1000, 'app market modal was not opened in 10*1000 milsec').then(function () {
                var modal = $('.focus-panel-frame');
                var iframeSrc = modal.find('iframe').attr('src');
                expect(iframeSrc).toBe('http://www.example.com');
                expect(modal.width()).toBe(500);
                expect(modal.height()).toBe(500);
                done();
            }).catch(function(response) {
                fail(response.result);
                done();
            });
        });

        it('should open modal with a title that should not be translated', function(done){
            driver.openAppMarketModal(messages[2]);

            driver.waitForDomElement('.focus-panel-frame', 10, 1000, 'app market modal was not opened in 10*1000 milsec').then(function () {
                var modalHeader = $('.focus-panel-frame .panel-header-title').text();
                expect(modalHeader).toBe('Third Modal');
                done();
            }).catch(function (response) {
                fail(response.result);
                done();
            });
        });

        it('should open modal with a title that requires translation', function(done){
            driver.openAppMarketModal(messages[1]);

            driver.waitForDomElement('.focus-panel-frame', 10, 1000, 'app market modal was not opened in 10*1000 milsec').then(function () {
                var modalHeader = $('.focus-panel-frame .panel-header-title').text();
                expect(modalHeader).toBe('!Second Modal!');
                done();
            }).catch(function (response) {
                fail(response.result);
                done();
            });
        });

        describe('open 3 modal', function(){

            beforeEach(function(done){
                _.forEach(messages, function(msg){
                    driver.openAppMarketModal(msg);
                });
                driver.waitForCondition(function(){
                    return $('.focus-panel-frame').length === 3;
                }).then(done);
            });

            afterEach(function(){
                driver.closeAllPanels();
            });

            it('should open 3 modals', function(){
                expect(driver.getOpenPanels().length).toBe(3);
            });

            it('should close modal with given id', function(){
                driver.closeAppMarketModal('1');
                var openPanels = driver.getOpenPanels();
                var modalThatWasClosed = _.find(openPanels, {id: '1'});
                expect(openPanels.length).toBe(2);
                expect(modalThatWasClosed).toBeUndefined();
            });

            it('should close modal by clicking x button', function(){
                $('.focus-panel-frame .btn-close')[0].click();
                expect(driver.getOpenPanels().length).toBe(2);
            });

            it('should do nothing if trying to close modal with non existing id', function(){
                driver.closeAppMarketModal('no-such-id');
                expect(driver.getOpenPanels().length).toBe(3);
            });

        });
    });


});
