define(['testUtils', 'wixCode/utils/wixCodeWidgetService'], function(testUtils, wixCodeWidgetService) {
    'use strict';

    describe('wixCodeWidgetService', function(){

        describe('clientSpecMapService', function(){

            beforeEach(function(){
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI();
                this.mockSiteData = this.mockSiteAPI.getSiteData()
                    .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
            });

            it('should return true if client spec map has wix code specs', function() {
                var hasWixCodeWidgetSpecs = wixCodeWidgetService.hasWixCodeWidgetSpecs(this.mockSiteData.getClientSpecMap());
                expect(hasWixCodeWidgetSpecs).toEqual(true);
            });
        });
    });
});
