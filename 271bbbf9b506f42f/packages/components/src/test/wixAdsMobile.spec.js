define(['lodash', 'testUtils', 'components/components/wixads/wixAdsMobile'], function (_, testUtils, wixAdsMobile) {
    'use strict';

    describe('WixAdsMobile Component', function () {
        it('should do nothing cool... so... initial state should indicate a mobile viewer', function () {
            var props = testUtils.mockFactory.mockProps();
            props.siteData.isMobileView = function () {
                return true;
            };

            var wixAdsClass = _.clone(wixAdsMobile);
            wixAdsClass.props = props;
//            var wixAdsInstance = wixAdsClass(props);

            var initialState = wixAdsClass.getInitialState();

            expect(initialState.$viewerState).toEqual("mobile");
        });
    });
});
