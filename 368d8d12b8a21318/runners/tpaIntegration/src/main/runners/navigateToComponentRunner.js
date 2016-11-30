define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, driver) {
    'use strict';
    describe('navigateToComponent Tests', function () {

        beforeEach(function() {
            window.scrollTo(0, 0);
        });

        var compId = 'comp-icoqyufj';

        var verificationFunction = function(targetCompId, done) {
            var $comp = $('#' + targetCompId);
            var expectedLeft = Math.min($('body')[0].scrollWidth - $('body')[0].offsetWidth, $comp.position().left);
            var expectedTop = Math.min($('body')[0].scrollHeight - $('body')[0].offsetHeight, $comp.offset().top);
            var actualTop = $('body').scrollTop() || $(document.documentElement).scrollTop();
            var actualLeft = $('body').scrollLeft() || $(document.documentElement).scrollLeft();
            expect(expectedLeft).toEqual(actualLeft);
            expect(expectedTop).toEqual(actualTop);
            done();
        };


        describe('should scroll to a component in the current page', function() {
            it('should navigate to a given page and scroll to component', function (done) {
                driver.waitForDomElement('#comp-icoqz2lw', 10, 2000, 'settings panel was not opened in 10*1000 milsec').then(function () {
                    driver.navigateToComponentHandler(compId, 'comp-icoqz2lw', 'c1dmp', function() {
                        verificationFunction('comp-icoqz2lw', done);
                    });
                });
            });

            it('should only scroll to component', function (done) {
                driver.navigateToComponentHandler(compId, 'comp-icoqz2lw', null, function() {
                    verificationFunction('comp-icoqz2lw', done);
                });
            });

        });

        describe('should scroll to a component in the a given page', function() {
            it('should navigate to page and scroll to component', function (done) {
                return driver.navigateToComponentHandler(compId, 'comp-icoqxlfx', 'dm9qz', function() {
                    verificationFunction('comp-icoqxlfx', done);
                });
            });
        });

        describe('should navigate to page and fail to scroll to a component', function() {
            it('should call onFailure', function (done) {
                return driver.navigateToComponentHandler(compId, 'aaaa', 'dm9qz', function(error) {
                    expect(driver.getCurrentPageId()).toEqual('dm9qz');
                    expect(error.error).toBeDefined();
                    done();
                });
            });
        });
    });
});

