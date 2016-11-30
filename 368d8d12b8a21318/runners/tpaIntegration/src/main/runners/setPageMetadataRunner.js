define(['zepto', 'lodash', 'tpaIntegration/driver/driver', 'jasmine-boot'], function ($, _, driver) {
    'use strict';

    describe('setPageMetadata', function () {
        var galleryCompId = 'TPASection_ipe61m9a';
        var productPageCompId = 'TPAMultiSection_ipe61mm9';
        var commentsCompId = 'comp-ippelq95';

        it('should change only title in a section', function (done) {
            driver.navigateToPage('p21vc');
            driver.waitForDomElement('#' + galleryCompId).then(function () {
                driver.setPageMetadata(galleryCompId, 'newTitle');
                setTimeout(function () {
                    expect(window.document.title).toEqual('sitewithshop | newTitle');
                    done();
                }, 2000);
            });
        });

        it('should change only description', function (done) {
            driver.navigateToPage('p21vc');
            driver.waitForDomElement('#' + galleryCompId).then(function () {
                driver.setPageMetadata(galleryCompId, '', 'new description');
                setTimeout(function () {
                    expect(window.document.querySelectorAll('meta[name=description]')[0].content).toEqual('new description');
                    done();
                }, 2000);
            });
        });

        it('should change both title and description', function (done) {
            driver.navigateToPage('p21vc');
            driver.waitForDomElement('#' + galleryCompId).then(function () {
                driver.setPageMetadata(galleryCompId, 'new title2', 'new description2');
                setTimeout(function () {
                    expect(window.document.title).toEqual('sitewithshop | new title2');
                    expect(window.document.querySelectorAll('meta[name=description]')[0].content).toEqual('new description2');
                    done();
                }, 2000);
            });
        });

        it('should change title & description in a multi section', function (done) {
            var state = 'ea77f230-558f-57b6-cdd1-0ba565e8f827';
            driver.navigateToPage('p21vc');
            driver.waitForDomElement('#' + galleryCompId).then(function () {
                driver.navigateToSectionHandler(galleryCompId, state, {sectionId: 'product_page'});
                setTimeout(function () {
                    driver.setPageMetadata(productPageCompId, 'new title3', 'new description3');
                    setTimeout(function () {
                        expect(window.document.title).toEqual('sitewithshop | new title3');
                        expect(window.document.querySelectorAll('meta[name=description]')[0].content).toEqual('new description3');
                        expect(window.location.pathname).toEqual('/sitewithshop/product-page/ea77f230-558f-57b6-cdd1-0ba565e8f827');
                        done();
                    }, 2000);
                }, 2000);
            });
        });

        it('should not change title in a widget', function (done) {
            driver.navigateToPage('c1dmp');
            driver.waitForDomElement('#' + commentsCompId).then(function () {
                driver.setPageMetadata(commentsCompId, 'newTitle');
                setTimeout(function () {
                    expect(window.document.title).toEqual('sitewithshop');
                    done();
                }, 2000);
            });
        });
    });
});
