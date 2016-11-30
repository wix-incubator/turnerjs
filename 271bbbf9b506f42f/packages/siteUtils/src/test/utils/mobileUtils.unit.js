define(['lodash', 'siteUtils/utils/mobileUtils'], function (_, mobileUtils) {
    'use strict';

    describe('mobileUtils', function () {
        describe('convertFontSizeToMobile', function(){
            it('should preserve the evil legacy behavior of returning NAN when scale is undefined', function () {
                expect(mobileUtils.convertFontSizeToMobile(16)).toEqual(NaN);
            });

            it('should round non-integer font size input', function () {
                expect(mobileUtils.convertFontSizeToMobile(16.12, 1)).toEqual(16);
            });
        });
    });
});
