define(['testUtils', 'santaProps/types/SantaTypes'], function (testUtils, SantaTypes) {
    'use strict';

    describe('RendererModel types', function(){
        describe('useSandboxInHTMLComp', function(){
            it('should return useSandboxInHTMLComp string from siteData.rendererModel', function(){
                var siteData = testUtils.mockFactory.mockSiteData();
                var expected = "nir";
                siteData.rendererModel.useSandboxInHTMLComp = expected;

                var cookie = SantaTypes.RendererModel.useSandboxInHTMLComp.fetch({siteData: siteData});
                expect(cookie).toEqual(expected);
            });
        });
    });
});
