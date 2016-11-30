define(['testUtils', 'santaProps/types/modules/BrowserSantaTypes'], function (/** testUtils */ testUtils, BrowserSantaTypes) {
    'use strict';

    describe('BrowserSantaType.', function () {

        describe('browser', function () {

            it('should be chrome', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData, 'getBrowser').and.returnValue({chrome: true});

                var browser = BrowserSantaTypes.browser.fetch({siteData: siteData});
                var browserRequired = BrowserSantaTypes.browser.isRequired.fetch({siteData: siteData});

                expect(browser).toEqual({chrome: true});
                expect(browserRequired).toEqual({chrome: true});
            });
        });

        describe('os', function(){
            it('should equal siteData.getOs return value', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                var osMockData = {mac: true};
                spyOn(siteData, 'getOs').and.returnValue(osMockData);

                var os = BrowserSantaTypes.os.fetch({siteData: siteData});
                var osRequired = BrowserSantaTypes.os.isRequired.fetch({siteData: siteData});

                expect(os).toEqual(osMockData);
                expect(osRequired).toEqual(osMockData);
            });
        });

        describe('isAndroidOldBrowser', function () {

            it('should be true', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                spyOn(siteData.mobile, 'isAndroidOldBrowser').and.returnValue(true);

                var isAndroidOldBrowser = BrowserSantaTypes.isAndroidOldBrowser.fetch({siteData: siteData});
                var isAndroidOldBrowserRequired = BrowserSantaTypes.isAndroidOldBrowser.isRequired.fetch({siteData: siteData});

                expect(isAndroidOldBrowser).toEqual(true);
                expect(isAndroidOldBrowserRequired).toEqual(true);
            });
        });
    });
});
