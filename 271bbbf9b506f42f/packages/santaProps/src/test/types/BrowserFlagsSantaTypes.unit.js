define(['testUtils', 'santaProps/types/modules/BrowserFlagsSantaTypes'], function (/** testUtils */ testUtils, BrowserFlagsSantaTypes) {
    'use strict';

    describe('BrowserFlagsSantaTypes tests', function () {

        it('should return fixedBackgroundColorBalata from siteData.browserFlags', function(){
            var siteData = testUtils.mockFactory.mockSiteData();


            spyOn(siteData, 'browserFlags').and.returnValue({
                fixedBackgroundColorBalata: true
            });

            var fixedBackgroundColorBalata = BrowserFlagsSantaTypes.fixedBackgroundColorBalata.fetch({siteData: siteData});
            var fixedBackgroundColorBalataRequired = BrowserFlagsSantaTypes.fixedBackgroundColorBalata.isRequired.fetch({siteData: siteData});

            expect(fixedBackgroundColorBalata).toEqual(true);
            expect(fixedBackgroundColorBalataRequired).toEqual(true);
        });
    });
});
