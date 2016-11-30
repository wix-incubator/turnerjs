define([
    'zepto',
    'lodash',
    'bluebird',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, Promise, driver) {
    'use strict';


    describe('getStateUrl Tests', function () {
        var compId = 'TPASection_iufejl9h';

        it('Url is built based on provided sectionId and state ', function (done) {

            driver.getStateUrl(compId, 'product_page', '1', function(data){
                expect(data.url).toBe('http://milak41.wixsite.com/mysite-529/product-page/1');
                done();
            });
        });

        it('Url is built based on provided sectionId  - no state', function (done) {

            driver.getStateUrl(compId, 'product_page', '', function(data){
                expect(data.url).toBe('http://milak41.wixsite.com/mysite-529/product-page');
                done();
            });
        });

        it('Main site utl is returned since without state since sectionId was not provided', function (done) {

            driver.getStateUrl(compId, '', '1', function(data){
                expect(data.url).toBe('http://milak41.wixsite.com/mysite-529');
                done();
            });
        });

        it('Main site utl is returned since TPA section is a homepage', function (done) {

            driver.getStateUrl(compId, '', '', function(data){
                expect(data.url).toBe('http://milak41.wixsite.com/mysite-529');
                done();
            });
        });

        it('Url to main section is returned since provided sectionId does not exist in this tpa', function (done) {

            driver.getStateUrl(compId, 'mila', '1', function(data){
                expect(data.url).toBe('http://milak41.wixsite.com/mysite-529');
                done();
            });
        });

        it('Url to main tpa section is returned when sectionId is not proveded', function (done) {

            var compId2 = 'TPASection_iugnf444';

           driver.navigateToPage('h7s3w');
           driver.waitForDomElement('#TPASection_iugnf444', 5, 1000, 'failed to navigate to page h7s3w')
                .then(function(){
                    driver.getStateUrl(compId2, '', '', function(data){
                        expect(data.url).toBe('http://milak41.wixsite.com/mysite-529/book-a-room');
                        done();
                    });
                });

        });

        it('Error is returned when tpa has no section', function (done) {

            var compId3 = 'comp-iugshfgz';

            driver.navigateToPage('c1dmp');

            driver.waitForDomElement('#comp-iugshfgz', 5, 1000, 'failed to navigate to page h7s3w')
                .then(function(){
                    driver.getStateUrl(compId3, '', '', function(response){
                        expect(response.error.message).toEqual('Page with app "Comments" was not found.');
                        done();
                    });
                });
        });

    });



});
