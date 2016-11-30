define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, driver) {
    'use strict';

    describe('getSitePages Tests', function () {
        var compId = 'TPWdgt0-11yp';
        var i=0;
        describe('getSitePages basic structure', function() {
            it('should be alive', function (done) {
                driver.appIsAlive(compId)
                    .then(function(){
                        var tpa = $('#' + compId);
                        expect(tpa).toBeDefined();
                        done();
                    });
            });

            it('should return the site pages', function (done) {
                driver.getSitePages(compId, null,function (response) {
                    expect(_.size(response)).toBe(14);
                    expect(_.pluck(response, 'id')).toEqual(['BlankPage_0','aijlt' ,'cadp', 'cpi4', 'c4x8', 'c2270',,'ac8wm',,,,,'masterPage','c17z1']);
                    expect(_.pluck(response, 'title')).toEqual(['HOME','New Link','BAND', 'multi', 'Main Page ', 'Etsy Shop',undefined,'AnchorLinkPage','WebAddress','EmailAddress','PhoneNumber','Document','TopToBottom','page 1']);
                    expect(_.pluck(response, 'hide')).toEqual([false, false, false, false, false, false, undefined, false,false, false, false, false,false, true]);
                    for (i = 0; i < 14; i++) {
                        expect(_.has(response[i], 'url')).toBeFalsy();
                    }

                    done();
                });
            });

            it('should return a page sub-pages', function (done) {
                driver.getSitePages(compId, null,function (response) {
                    var pageWithSubPages = response[2].subPages;

                    expect(pageWithSubPages).toBeDefined();
                    expect(_.size(pageWithSubPages)).toBe(1);
                    expect(_.pluck(pageWithSubPages, 'id')).toEqual(["c24kz"]);
                    expect(_.pluck(pageWithSubPages, 'title')).toEqual(["GALLERY"]);
                    expect(_.pluck(pageWithSubPages, 'hide')).toEqual([false]);
                    done();
                });
            });

            it('should return the site pages, link and menu header functionality', function (done) {
                driver.getSitePages(compId, true,function (response) {
                    expect(_.size(response)).toBe(14);
                    expect(_.pluck(response, 'id')).toEqual(['BlankPage_0','aijlt' ,'cadp', 'cpi4', 'c4x8', 'c2270',,'ac8wm',,,,,'masterPage','c17z1']);
                    expect(_.pluck(response, 'title')).toEqual(['HOME','New Link','BAND', 'multi', 'Main Page ', 'Etsy Shop',undefined,'AnchorLinkPage','WebAddress','EmailAddress','PhoneNumber','Document','TopToBottom','page 1']);
                    expect(_.pluck(response, 'hide')).toEqual([false, false, false, false, false, false, undefined, false,false, false, false, false,false, true]);
                    expect(_.pluck(response, 'url')).toEqual(
                        [
                            'http://milak41.wixsite.com/multi1',
                            'http://milak41.wixsite.com/multi1/popup-aijlt',
                            'http://milak41.wixsite.com/multi1/band',
                            'http://milak41.wixsite.com/multi1/multi',
                            'http://milak41.wixsite.com/multi1/main-page',
                            'http://milak41.wixsite.com/multi1/etsy-shop',
                             undefined,
                            'http://milak41.wixsite.com/multi1/menuheader-subpage',
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            'http://milak41.wixsite.com/multi1/page-1'
                        ]);

                    expect(_.has(response[6], 'url')).toBeFalsy();
                    expect(_.has(response[8], 'url')).toBeFalsy();
                    expect(_.has(response[9], 'url')).toBeFalsy();
                    expect(_.has(response[10], 'url')).toBeFalsy();
                    expect(_.has(response[11], 'url')).toBeFalsy();
                    expect(_.has(response[12], 'url')).toBeFalsy();

                    done();
                });
            });

            it('should not return site pages urls', function (done) {
                driver.getSitePages(compId, false,function (response) {
                    expect(_.size(response)).toBe(14);
                    for (i = 0; i < 14; i++) {
                        expect(_.has(response[i], 'url')).toBeFalsy();
                    }
                    done();
                });
            });


        });

    });
});

