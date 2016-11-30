define(['jquery',
        'tpaIntegrationEditor/driver/driver',
        'jasmine-boot'],
    function ($, driver) {
        'use strict';

        describe('superAppsGfpp', function () {
            var shopAppDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
            var proGalleryAppDefId = '14271d6f-ba62-d045-549b-ab972ae1f70e';

            afterEach(function () {
                driver.closeAllPanels();
            });

            describe('wix stores gfpp', function () {
                it('should display 5 gfpp buttons when shop is selected', function (done) {
                    driver.selectComp(shopAppDefId);
                    var gfpp = $('#gfpp')[0];
                    expect(gfpp.children.length).toBe(5);
                    done();
                });

                it('should open the store dashboard when clicking on "Manage Products" button', function (done) {
                    driver.selectComp(shopAppDefId);
                    var button = $('#gfpp')[0].children[0];
                    button.click();
                    driver.waitForDomElement('.tpa-settings-modal', 10, 1000, 'modal was not opened in 10*1000 milsec').then(function (modal) {
                        var frameSrc = $(modal)[0].dom.find('iframe').attr('src');
                        expect(button.textContent).toEqual('Manage Products');
                        expect(frameSrc).toContain('https://ecom.wix.com/storemanager');
                        done();
                    }, function () {
                        fail('modal was not opened in 10*1000 milsec');
                        done();
                    });

                });

                it('should open the settings panel when clicking on "Settings" button', function (done) {
                    driver.selectComp(shopAppDefId);
                    var button = $('#gfpp')[0].children[1];
                    button.click();
                    driver.waitForDomElement('#tpaSettingsFrame', 10, 1000, 'panel was not opened in 10*1000 milsec').then(function (response) {
                        expect(button.textContent).toEqual('Settings');
                        expect(response.result).toBe('ok');
                        done();
                    }, function () {
                        fail('panel was not opened in 10*1000 milsec');
                        done();
                    });
                });

                it('should open the store pages panel when clicking on "Store Pages" button', function (done) {
                    driver.selectComp(shopAppDefId);
                    var button = $('#gfpp')[0].children[2];
                    button.click();
                    driver.waitForDomElement('.wix-store-pages-panel', 10, 1000, 'panel was not opened in 10*1000 milsec').then(function (response) {
                        expect(button.textContent).toEqual('Store Pages');
                        expect(response.result).toBe('ok');
                        done();
                    }, function () {
                        fail('panel was not opened in 10*1000 milsec');
                        done();
                    });
                });
            });

            describe('pro gallery gfpp', function () {

                it('should open super apps modal when clicking "Manage Media" button', function (done) {
                    driver.selectComp(proGalleryAppDefId);
                    var button = $('#gfpp')[0].children[0];
                    button.click();
                    driver.waitForDomElement('.tpa-settings-modal', 10, 1000, 'modal was not opened in 10*1000 milsec').then(function (response) {
                        expect(button.textContent).toEqual('Manage Media');
                        expect(response.result).toBe('ok');
                        done();
                    }, function () {
                        fail('modal was not opened in 10*1000 milsec');
                        done();
                    });
                });
            });
        });
    });
