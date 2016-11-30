define(['coreUtils/core/mobileViewportFixer', 'testUtils'], function (mobileViewportFixer, testUtils) {
    'use strict';

    function getViewportMeta(tag) {
        var attr = tag.getAttribute('content');
        return attr.split(',').map(function(e) {
            return e.trim();
        });
    }

    describe('Mobile Viewport Fixer', function(){
        var siteData;

        beforeEach(function(){
            this.wixMobileViewport = window.document.createElement('div');
            spyOn(window.document, 'getElementById').and.returnValue(this.wixMobileViewport);
            siteData = testUtils.mockFactory.mockSiteData();
        });

        it('should have width of 320 and non-scalable for mobile view', function(){
            siteData.isMobileView = function () {return true; };
            mobileViewportFixer.fixViewportTag(siteData);
            var viewportAttr = getViewportMeta(this.wixMobileViewport);
            expect(viewportAttr).toContain('user-scalable=no');
            expect(viewportAttr).toContain('width=320');
        });

        it('should have width of 980 and scalable for non mobile view', function(){
            siteData.isMobileView = function(){return false;};
            mobileViewportFixer.fixViewportTag(siteData);
            var viewportAttr = getViewportMeta(this.wixMobileViewport);
            expect(viewportAttr).toContain('user-scalable=yes');
            expect(viewportAttr).toContain('width=980');
        });
    });
});
