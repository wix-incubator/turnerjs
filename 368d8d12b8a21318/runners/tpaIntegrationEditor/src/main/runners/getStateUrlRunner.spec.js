define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('getStateUrl Tests', function () {
        var compId = 'TPASection_iup9wenl';

//*EDITOR TESTS*//
        it('Editor:Url is built based on provided sectionId and state ', function (done) {

            driver.getStateUrl(compId, 'product_page', '1', function(data){
                expect(data.url).toBe('http://adiela0.wixsite.com/mysite-2641/product-page/1');
                done();
            });
        });


        it('Editor:Url is built based on provided sectionId  - no state', function (done) {

            driver.getStateUrl(compId, 'product_page', '', function(data){
                expect(data.url).toBe('http://adiela0.wixsite.com/mysite-2641/product-page');
                done();
            });
        });

        it('Editor:Main site url is returned since sectionId was not provided', function (done) {

            driver.getStateUrl(compId, '', '1', function(data){
                expect(data.url).toBe('http://adiela0.wixsite.com/mysite-2641');
                done();
            });
        });

        it('Editor:Main site utl is returned since TPA section is a homepage', function (done) {

            driver.getStateUrl(compId, '', '', function(data){
                expect(data.url).toBe('http://adiela0.wixsite.com/mysite-2641');
                done();
            });
        });

        it('Editor:Url to main section is returned since provided sectionId does not exist in this tpa', function (done) {

            driver.getStateUrl(compId, 'mila', '1', function(data){
                expect(data.url).toBe('http://adiela0.wixsite.com/mysite-2641');
                done();
            });
        });

        it('Editor:Url to main tpa section is returned when sectionId is not provided', function (done) {

            var compId2 = 'TPASection_iup9ydnv';


            driver.navigateToPage('qylml').then(function () {
                driver.getStateUrl(compId2, '', '',function (data) {
                    expect(data.url).toBe('http://adiela0.wixsite.com/mysite-2641/book-a-room');
                    done();
                });
            });

        });

        it('Editor:Error is returned when tpa has no section', function (done) {

            var compId3 = 'comp-iup9xu3i';

            driver.navigateToPage('c1dmp').then(function () {
                driver.getStateUrl(compId3, '', '',function (response) {
                    expect(response.error.message).toEqual('This app does not have any pages.');
                    done();
                });
            });

        });


//*PREVIEW TESTS*//
        it('Preview: Url is built based on provided sectionId and state ', function (done) {

            driver.navigateToPage('qylml').then(function (){
            driver.switchToPreviewPromise().then(function() {
                    driver.getStateUrl(compId, 'product_page', '1', function(data){
                        expect(data.url).toBe('http://adiela0.wixsite.com/mysite-2641/product-page/1');
                        done();
                    });
                }
                , function(){
                    fail('switch to preview failed');
                    done();
                });
             });
        });

        it('Preview: Error is returned when tpa has no section', function (done) {

            var compId3 = 'comp-iup9xu3i';

            driver.navigateToPage('c1dmp').then(function () {
                driver.switchToPreviewPromise().then(function() {
                driver.getStateUrl(compId3, '', '',function (response) {
                    expect(response.error.message).toEqual('This app does not have any pages.');
                    done();
                });
            });
            });
        });

    });
});
