define(['lodash', 'definition!core/siteRender/wixAdsInstatiator'], function(_, wixAdsInstatiatorDef) {
    'use strict';

    describe('wixAdsInstatiator', function() {
        describe('getStructure', function() {
            var wai;
            var siteData;
            var isMobileView;
            beforeEach(function() {
                wai = wixAdsInstatiatorDef();
                siteData = {
                    isMobileView: function() { return isMobileView; }
                };
            });

            describe('in mobile view', function() {
                beforeEach(function() {
                    isMobileView = true;
                });

                it('should return WixAdsMobile', function() {
                    var structure = wai.getStructure(siteData);
                    expect(structure.componentType).toBe('wysiwyg.viewer.components.WixAdsMobile');
                });
            });

            describe('in desktop view', function() {
                beforeEach(function() {
                    isMobileView = false;
                });

                it('should return WixAdsDesktop', function() {
                    var structure = wai.getStructure(siteData);
                    expect(structure.componentType).toBe('wysiwyg.viewer.components.WixAdsDesktop');
                });
            });

            it('should return the id specified in siteData.WIX_ADS_ID', function() {
                siteData.WIX_ADS_ID = 'myid';
                var structure = wai.getStructure(siteData);
                expect(structure.id).toBe('myid');
            });

            it('should return the correct skin', function() {
                var structure = wai.getStructure(siteData);
                expect(structure.skin).toBe('wysiwyg.viewer.skins.wixadsskins.WixAdsWebSkin');
            });

            it('should return the correct styleId', function() {
                var structure = wai.getStructure(siteData);
                expect(structure.styleId).toBe('wixAds');
            });

            it('should return the correct layout', function() {
                var structure = wai.getStructure(siteData);
                expect(structure.layout.position).toEqual('absolute');
            });
        });
    });
});