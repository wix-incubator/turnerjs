define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, driver) {
    'use strict';
    describe('tpaWidget Tests', function () {
        var compId = 'TPWdgt0-11yp';

        beforeAll(function () {
            driver.appIsAlive(compId);
        });

        describe('urlBuilder', function () {
            it('should build the app URL', function () {
                var appUrl = $('#TPWdgt0-11yp').find('iframe').attr('src');
                var tokens = appUrl.split('&');
                //expect(_.startsWith(tokens[3], 'cacheKiller')).toBeTruthy();
                expect(_.includes(tokens, 'compId=TPWdgt0-11yp')).toBeTruthy();
                expect(_.includes(tokens, 'deviceType=desktop'));
                //expect(_.startsWith(tokens[7], 'instance')).toBeTruthy();
                expect(_.includes(tokens, 'locale=en')).toBeTruthy();
                expect(_.includes(tokens, 'viewMode=site')).toBeTruthy();
                expect(_.includes(tokens, 'width=571')).toBeTruthy();
            });
        });
    });

});
