define([
    'zepto',
    'lodash',
    'bluebird',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, Promise, driver) {
    'use strict';


    describe('getSectionUrl Tests', function () {
        var compId = 'TPASection_iufejl9h';

        it('Section url is built based on provided sectionId', function (done) {

            driver.getSectionUrl(compId, 'product_page', function(data){
                expect(data.url).toMatch('/product-page');
                done();
            });
        });

        it('Main SectionUrl is returned', function (done) {

            //need to add implementation here
            // driver.getSectionUrl(compId, undefined, function(data){
            //    expect(data).toMatch('/shop');
                done();
        });

        it('Section url has main site url(section is on home page)since provided sectionId does not exist in application', function (done) {

            driver.getSectionUrl(compId, '123', function(data){
                expect(data.url).toMatch('http://milak41.wixsite.com/mysite-529');
                done();
            });
        });


        it('Url to main tpa section is returned when sectionId is incorrect', function (done) {

            var compId2 = 'TPASection_iugnf444';

           driver.navigateToPage('h7s3w');
           driver.waitForDomElement('#TPASection_iugnf444', 5, 1000, 'failed to navigate to page h7s3w')
                .then(function(){
                   driver.getSectionUrl(compId2, '123', function(data){
                       expect(data.url).toMatch('/book-a-room');
                        done();
                    });
                });

        })  ;



    });



});
