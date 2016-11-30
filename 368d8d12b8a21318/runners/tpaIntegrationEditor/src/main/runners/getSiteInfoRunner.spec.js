define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('getSiteInfo Tests', function () {
        var compId = 'comp-ica98sbu';

        describe('editor getSiteInfo', function () {
            it('should return API response', function (done) {
                driver.getSiteInfo(compId).then(function (info) {
                    expect(info.siteTitle).toBe('siteTitle');
                    expect(info.pageTitle).toBe('HOME');
                    expect(info.baseUrl).toBe('http://adiela0.wixsite.com/getsiteinforunner');
                    expect(info.referer).toBeDefined();
                    expect(info.siteKeywords).toBe('keyword');
                    expect(info.siteDescription).toBe('description');
                    //expect(info.url).not.toBeDefined();
                    expect(info.url).toBeDefined();
                    done();
                });
            });
        });
    });
});
