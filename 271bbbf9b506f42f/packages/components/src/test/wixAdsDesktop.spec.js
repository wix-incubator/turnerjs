define(['lodash', 'testUtils', 'components/components/wixads/wixAdsDesktop'], function (_, testUtils, wixAdsDesktop) {
    'use strict';

    describe('WixAdsDesktop Component', function () {
        it('should do nothing cool... so... initial state should indicate a desktop viewer', function () {

            var props = testUtils.mockFactory.mockProps();

            var wixAdsClass = _.clone(wixAdsDesktop);
            wixAdsClass.props = props;

            var initialState = wixAdsClass.getInitialState();

            expect(initialState.$viewerState).toEqual("desktop");
        });
    });
});
