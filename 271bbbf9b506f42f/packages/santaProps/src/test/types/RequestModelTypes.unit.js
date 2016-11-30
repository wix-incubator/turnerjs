define(['testUtils', 'santaProps/types/modules/RequestModelTypes'], function (testUtils, RequestModelTypes) {
    'use strict';

    describe('MobileTypes', function(){
        describe('cookie', function(){
            it('should return cookie string from siteData.requestModel', function(){
                var siteData = testUtils.mockFactory.mockSiteData();

                var mockCookie = 'mockCookie';
                siteData.requestModel.cookie = mockCookie;

                var cookie = RequestModelTypes.cookie.fetch({siteData: siteData});
                var cookieRequired = RequestModelTypes.cookie.isRequired.fetch({siteData: siteData});

                expect(cookie).toEqual(mockCookie);
                expect(cookieRequired).toEqual(mockCookie);
            });
        });
    });
});
