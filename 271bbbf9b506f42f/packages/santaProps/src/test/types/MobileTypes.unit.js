define(['testUtils', 'santaProps/types/modules/MobileTypes'], function (testUtils, MobileTypes) {
    'use strict';

    describe('MobileTypes', function(){
        describe('cannotHideIframeWithinRoundedCorners', function(){
            it('should return true if siteData.mobile.cannotHideIframeWithinRoundedCorners return true', function(){
                var siteData = testUtils.mockFactory.mockSiteData();

                spyOn(siteData.mobile, 'cannotHideIframeWithinRoundedCorners').and.returnValue(true);

                var cannotHideIframeWithinRoundedCorners = MobileTypes.cannotHideIframeWithinRoundedCorners.fetch({siteData: siteData});
                var cannotHideIframeWithinRoundedCornersRequired = MobileTypes.cannotHideIframeWithinRoundedCorners.isRequired.fetch({siteData: siteData});

                expect(cannotHideIframeWithinRoundedCorners).toEqual(true);
                expect(cannotHideIframeWithinRoundedCornersRequired).toEqual(true);
            });

            it('should return false if siteData.mobile.cannotHideIframeWithinRoundedCorners return false', function(){
                var siteData = testUtils.mockFactory.mockSiteData();

                spyOn(siteData.mobile, 'cannotHideIframeWithinRoundedCorners').and.returnValue(false);

                var cannotHideIframeWithinRoundedCorners = MobileTypes.cannotHideIframeWithinRoundedCorners.fetch({siteData: siteData});
                var cannotHideIframeWithinRoundedCornersRequired = MobileTypes.cannotHideIframeWithinRoundedCorners.isRequired.fetch({siteData: siteData});

                expect(cannotHideIframeWithinRoundedCorners).toEqual(false);
                expect(cannotHideIframeWithinRoundedCornersRequired).toEqual(false);
            });
        });
    });
});
