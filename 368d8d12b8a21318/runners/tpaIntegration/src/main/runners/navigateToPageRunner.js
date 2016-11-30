define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, driver) {
    'use strict';
    describe('navigateToPage Tests', function () {
        var compId = 'TPWdgt0-11yp';


        it('should not navigate when pageId is invalid', function (done) {
            return driver.navigateToPageHandler(compId, 'aaaa', 'band', undefined, function (response) {
                expect(response.error.message).toEqual('Page id "aaaa" was not found.');
                done();
            });
        });

        it('should navigate when pageId is valid', function (done) {
            driver.navigateToPageHandler(compId, 'cadp', 'band').then(function(response) {
                expect(response).toBeTruthy();
                done();
            });
        });

        describe('when anchorId is passed', function () {
            var anchorId = 'comp-it07ggpd';

            it('should navigate to page and then scroll to anchor', function (done) {
                driver.navigateToPageHandler(compId, 'BlankPage_0', 'HOME', anchorId).then(function () {
                    var anchorComp = $('#' + anchorId)[0];
                    driver.waitForCondition(driver.isAnchorInViewport.bind(null, anchorComp), 'anchor is not in view port').then(function () {
                        expect(driver.isAnchorInViewport(anchorComp)).toBe(true);
                        done();
                    });
                });
            });

            it('should still navigate to page when anchor does not exist', function (done) {
                driver.navigateToPageHandler(compId, 'cadp', 'band', anchorId, function (response) {
                    expect(response.error.message).toEqual('anchor with id "' + anchorId + '" was not found on the current page.');
                }).then(function(response) {
                    expect(response).toBeTruthy();
                    done();
                });
            });

            it('should return an error when anchor does not exist', function (done) {
                driver.navigateToPageHandler(compId, 'cadp', 'band', anchorId, function (response) {
                    expect(response.error.message).toEqual('anchor with id "' + anchorId + '" was not found on the current page.');
                    done();
                });
            });
        });
    });
});

