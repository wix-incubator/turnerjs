define(['tpaIntegrationEditor/driver/driver','lodash' ,'jasmine-boot'], function (driver,_) {
    'use strict';

    describe('preview handlers', function () {

        it('should handle getCurrentPageId', function (done) {
            driver.getWidgetPageId('comp-icvr20p1').then(function (pageId) {
                expect(pageId).toBe('c1dmp');
                done();
            });
        });

        it('should handle getSitePages', function (done) {
            driver.getSitePages('comp-icvr20p1',null).then(function (sitePages) {
                var page1 = sitePages[0];
                var page2 = sitePages[1];
                var page3 = sitePages[2];
                var page4 = sitePages[3];
                var page5 = sitePages[4];

                expect(page1.hide).toBeFalsy();
                expect(page1.id).toBe('c1dmp');
                expect(page1.title).toBe('HOME');
                expect(_.has(page1, 'url')).toBeFalsy();

                expect(page2.hide).toBeFalsy();
                expect(page2.id).toBe('mqqs8');
                expect(page2.title).toBe('Shop');
                expect(_.has(page2, 'url')).toBeFalsy();

                expect(page3.hide).toBeTruthy();
                expect(page3.id).toBe('zmrue');
                expect(page3.title).toBe('Product Page');
                expect(_.has(page3, 'url')).toBeFalsy();

                expect(page4.hide).toBeTruthy();
                expect(page4.id).toBe('x8nz5');
                expect(page4.title).toBe('Cart');
                expect(_.has(page4, 'url')).toBeFalsy();


                expect(page5.hide).toBeTruthy();
                expect(page5.id).toBe('woei9');
                expect(page5.title).toBe('Thank You Page');
                expect(_.has(page5, 'url')).toBeFalsy();

                done();
            });
        });

        it('should handle getSitePages with pages url', function (done) {
            driver.getSitePages('comp-icvr20p1',true).then(function (sitePages) {
                var page1 = sitePages[0];
                var page2 = sitePages[1];
                var page3 = sitePages[2];
                var page4 = sitePages[3];
                var page5 = sitePages[4];

                expect(page1.hide).toBeFalsy();
                expect(page1.id).toBe('c1dmp');
                expect(page1.title).toBe('HOME');
                expect(page1.url).toBe('http://liorshefer.wixsite.com/do-not-delete-for-it');

                expect(page2.hide).toBeFalsy();
                expect(page2.id).toBe('mqqs8');
                expect(page2.title).toBe('Shop');
                expect(page2.url).toBe('http://liorshefer.wixsite.com/do-not-delete-for-it/blank-mqqs8');


                expect(page3.hide).toBeTruthy();
                expect(page3.id).toBe('zmrue');
                expect(page3.title).toBe('Product Page');
                expect(page3.url).toBe('http://liorshefer.wixsite.com/do-not-delete-for-it/blank-zmrue');


                expect(page4.hide).toBeTruthy();
                expect(page4.id).toBe('x8nz5');
                expect(page4.title).toBe('Cart');
                expect(page4.url).toBe('http://liorshefer.wixsite.com/do-not-delete-for-it/blank-x8nz5');


                expect(page5.hide).toBeTruthy();
                expect(page5.id).toBe('woei9');
                expect(page5.title).toBe('Thank You Page');
                expect(page5.url).toBe('http://liorshefer.wixsite.com/do-not-delete-for-it/blank-woei9');

                done();
            });
        });

        it('should handle getSitePages without pages url', function (done) {
            driver.getSitePages('comp-icvr20p1',false).then(function (sitePages) {
                var page1 = sitePages[0];
                var page2 = sitePages[1];
                var page3 = sitePages[2];
                var page4 = sitePages[3];
                var page5 = sitePages[4];

                expect(page1.hide).toBeFalsy();
                expect(page1.id).toBe('c1dmp');
                expect(page1.title).toBe('HOME');
                expect(_.has(page1, 'url')).toBeFalsy();

                expect(page2.hide).toBeFalsy();
                expect(page2.id).toBe('mqqs8');
                expect(page2.title).toBe('Shop');
                expect(_.has(page2, 'url')).toBeFalsy();


                expect(page3.hide).toBeTruthy();
                expect(page3.id).toBe('zmrue');
                expect(page3.title).toBe('Product Page');
                expect(_.has(page3, 'url')).toBeFalsy();


                expect(page4.hide).toBeTruthy();
                expect(page4.id).toBe('x8nz5');
                expect(page4.title).toBe('Cart');
                expect(_.has(page4, 'url')).toBeFalsy();


                expect(page5.hide).toBeTruthy();
                expect(page5.id).toBe('woei9');
                expect(page5.title).toBe('Thank You Page');
                expect(_.has(page5, 'url')).toBeFalsy();

                done();
            });
        });

        describe('navigateToPage in preview', function () {
            var compId = 'comp-icvr20p1';

            it('should navigate to a given page', function (done) {
                driver.switchToPreviewPromise().then(function() {
                    driver.navigateToPageHandler(compId, 'mqqs8')
                        .then(function (response) {
                            expect(response).toBeTruthy();
                            driver.switchToEditor();
                            done();
                        });
                }, function(){
                    fail('switch to preview failed');
                    done();
                });
            });

        });

        describe('getSectionUrl', function () {
            it('return an error when app has no section', function (done) {
                driver.getSectionUrl('comp-icvr20p1', 'foo').then(function (response) {
                    expect(response.error.message).toBe('This app does not have any pages.');
                    done();
                });
            });

            ////TODO: fix test due to new urls
            //xit('return first non hidden page when the given page id is not part of the app urrrr', function (done) {
            //    var compId = 'TPASection_icvr7hir';
            //    driver.navigateToPage('mqqs8').then(function () {
            //        driver.getSectionUrl(compId, 'foo').then(function (response) {
            //            expect(response.url).toBe('http://liorshefer.wixsite.com/do-not-delete-for-it#!hxs0r/t7eb4');
            //            done();
            //        });
            //    });
            //});
            //
            ////TODO: fix test due to new urls
            //xit('return the right page when data is valid', function (done) {
            //    var compId = 'TPASection_icvr7hir';
            //    driver.getSectionUrl(compId, 'thank_you_page').then(function (response) {
            //        expect(response.url).toBe('http://liorshefer.wixsite.com/do-not-delete-for-it#!thank-you-page/woei9');
            //        done();
            //    });
            //
            //});
        });

        describe('should handle getSiteInfo', function () {
            it('should return site info for saved site', function (done) {
                driver.getSiteInfo('TPASection_icvr7hir').then(function (response) {
                    expect(response.baseUrl).toBe('http://liorshefer.wixsite.com/do-not-delete-for-it');
                    expect(response.pageTitle).toBe('Shop');
                    expect(response.siteDescription).toBe('');
                    //expect(response.siteKeywords).toBe('key1,key2');
                    expect(response.siteTitle).toBe(' | Shop');
                    expect(response.referer).toBeDefined();
                    //expect(response.url).not.toBeDefined();
                    expect(response.url).toBeDefined();
                    done();
                });
            });
        });

        describe('openSettingsDialog', function () {
            it('should open the settings dialog of an app installed on the current page', function (done) {
                driver.switchToPreviewPromise().then(function() {
                    driver.openSettingsDialog('TPASection_icvr7hir').then(function () {
                        expect(true).toBeTruthy();
                        driver.closeSettingsPanel();
                        driver.switchToEditor();
                        done();
                    }).catch(function(panel) {
                        fail(panel.result);
                        done();
                    });
                }, function(){
                    fail('switch to preview failed');
                    done();
                });
            });

            it('should navigate to the app comp page and open the settings dialog', function (done) {
                driver.switchToPreviewPromise().then(function() {
                    driver.openSettingsDialog('TPASection_icvr7hir', {compId: 'TPAMultiSection_icvr7i7m'}).then(function () {
                        expect(true).toBeTruthy();
                        driver.closeSettingsPanel();
                        driver.switchToEditor();
                        done();
                    }).catch(function(panel) {
                        fail(panel.result);
                        done();
                    });
                }, function(){
                    fail('switch to preview failed');
                    done();
                });
            });
        });

        describe('getExternalId', function () {
            it('return externalId for comp w/ this value set', function (done) {
                var compId = 'TPASection_icvr7hir';
                var externalId = 'de305d54-75b4-431b-adb2-eb6b9e546014';
                driver.getExternalId(compId).then(function (response) {
                    expect(response).toBe(externalId);
                    done();
                });

            });
        });

        describe('getInstalledInstance', function(){
            var compId = 'TPASection_icvr7hir';
            var onSuccessCallback;
            var onErrorCallback;

            beforeEach(function(){
                onSuccessCallback = jasmine.createSpy('onSuccess');
                onErrorCallback = jasmine.createSpy('onError');
            });

            it('should call the onSuccess callback with the installed instance of the app', function(done){
                driver.getInstalledInstance(compId, '13016589-a9eb-424a-8a69-46cb05ce0b2c', onSuccessCallback, onErrorCallback)
                    .then(function(){
                        expect(onSuccessCallback).toHaveBeenCalledWith({instanceId: '13f6eb3d-8f8d-b600-cd88-4122d59edb19'});
                        expect(onErrorCallback).not.toHaveBeenCalled();
                        done();
                    });
            });

            it('should call the onError callback if the app was never installed on the site', function(done){
                driver.getInstalledInstance(compId, '1234', onSuccessCallback, onErrorCallback)
                    .then(function(){
                        expect(onErrorCallback).toHaveBeenCalled();
                        expect(onSuccessCallback).not.toHaveBeenCalled();
                        done();
                    });
            });

            it('should call the onError callback if the app that was deleted and is not installed', function(done){
                driver.getInstalledInstance(compId, '12b10b6e-1ee1-da13-2130-ff2db43be2fd', onSuccessCallback, onErrorCallback)
                    .then(function(){
                        expect(onErrorCallback).toHaveBeenCalled();
                        expect(onSuccessCallback).not.toHaveBeenCalled();
                        done();
                    });
            });
        });

    });
});
