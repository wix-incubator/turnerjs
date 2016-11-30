define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
    ], function ($, _, driver) {
    'use strict';
    describe('getSiteInfo Tests', function () {
        var compId = 'i42k5em5';

        describe('getSiteInfo', function() {
            it('should return API response', function (done) {
               driver.getSiteInfo(compId, function(info) {
                    expect(info.siteTitle).toBe($('title').text());
                    expect(info.pageTitle).toBe('HOME');
                    expect(info.baseUrl).toBe('http://yaarac1.wixsite.com/info');
                    expect(info.referer).toBeDefined();
                    expect(info.siteKeywords).toBe('some');
                    expect(info.siteDescription).toBe('desc');
                    expect(info.url.indexOf('http://yaarac1.wixsite.com/info')).toBe(0);
                   done();
                });
            });
        });
    });
});

