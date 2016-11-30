define([
    'zepto',
    'lodash',
    'tpaIntegration/driver/driver',
    'jasmine-boot'
], function ($, _, driver) {
    'use strict';
    describe('style Tests', function () {
        var compId = 'i3q70t1y';

        beforeAll(function() {
            driver.appIsAlive(compId);
        });

        describe('get style', function() {
            it('should get app style', function () {
                driver.getStyleData(compId, function(data) {
                    expect(data.fonts).toBeDefined();
                    expect(data.fonts.cssUrls).toBeDefined();
                    expect(_.isEmpty(data.fonts.cssUrls)).toBeFalsy();
                    expect(data.fonts.imageSpriteUrl).toBeDefined();
                    expect(data.fonts.fontsMeta).toBeDefined();
                    expect(data.siteTextPresets).toBeDefined();
                    expect(data.siteColors).toBeDefined();
                    expect(data.style).toBeDefined();
                });
            });
        });
    });
});
