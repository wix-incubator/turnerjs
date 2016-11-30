define(['testUtils', 'tpa/utils/tpaUtils', 'tpa/handlers/tpaHandlers'], function (testUtils, tpaUtils, tpaHandlers) {
    'use strict';

    describe('Anchor handlers', function(){
        var pageId = 'page1';

        beforeEach(function(){
            this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI();
            var siteData = this.mockSiteAPI.getSiteData();
            this.anchorData = siteData.mock.anchorData({
                compId: '123',
                name: 'frogAnchor',
                pageId: 'u37l2'
            });
            siteData.addPageWithDefaults(pageId);
            this.mockSiteAPI.setCurrentPage(pageId);
        });

        describe('getCurrentPageAnchors', function(){
            beforeEach(function(){
                this.callback = jasmine.createSpy('callback');
            });

            it('should return the top page anchor by default', function(){
                tpaHandlers.getCurrentPageAnchors(this.mockSiteAPI, null, this.callback);
                var anchors = this.callback.calls.argsFor(0)[0];
                expect(anchors.length).toBe(1);
                expect(anchors[0]).toEqual({id: 'PAGE_TOP_ANCHOR', title: tpaUtils.Constants.TOP_PAGE_ANCHOR_PREFIX + this.mockSiteAPI.getSiteData().getPrimaryPageId()});
            });

            it('should return the current page anchors data', function(){
                testUtils.mockFactory.mockComponent('Anchor', this.mockSiteAPI.getSiteData(), pageId, {data: this.anchorData});

                tpaHandlers.getCurrentPageAnchors(this.mockSiteAPI, null, this.callback);
                var anchors = this.callback.calls.argsFor(0)[0];
                expect(anchors.length).toBe(2);
                expect(anchors).toContain({id: 'PAGE_TOP_ANCHOR', title: tpaUtils.Constants.TOP_PAGE_ANCHOR_PREFIX + this.mockSiteAPI.getSiteData().getPrimaryPageId()});
                expect(anchors).toContain({id: this.anchorData.compId, title: this.anchorData.name});
            });
        });

        describe('Navigate to anchor', function(){
            beforeEach(function(){
                this.onFailure = jasmine.createSpy('onFailure');
                spyOn(this.mockSiteAPI, 'scrollToAnchor');
                testUtils.mockFactory.mockComponent('Anchor', this.mockSiteAPI.getSiteData(), pageId, {data: this.anchorData});
            });

            it('should navigate to anchor on the current page', function(){
                this.mockSiteAPI.getComponentById = jasmine.createSpy('getComponentById').and.returnValue({props: {compData: {id: this.anchorData.id}}});
                var msg = {data: {anchorId: '123'}};

                tpaHandlers.navigateToAnchor(this.mockSiteAPI, msg, this.onFailure);
                expect(this.mockSiteAPI.scrollToAnchor).toHaveBeenCalledWith(this.anchorData.id);
                expect(this.onFailure).not.toHaveBeenCalled();
            });

            it('should navigate to top page anchor on the current page', function(){
                var msg = {data: {anchorId: 'PAGE_TOP_ANCHOR'}};

                tpaHandlers.navigateToAnchor(this.mockSiteAPI, msg, this.onFailure);
                expect(this.mockSiteAPI.scrollToAnchor).toHaveBeenCalledWith('SCROLL_TO_TOP');
                expect(this.onFailure).not.toHaveBeenCalled();
            });

            it('should call the onFailure if no anchor was found on the current page', function(){
                var msg = {data: {anchorId: '666'}};

                tpaHandlers.navigateToAnchor(this.mockSiteAPI, msg, this.onFailure);
                expect(this.onFailure).toHaveBeenCalled();
                expect(this.mockSiteAPI.scrollToAnchor).not.toHaveBeenCalled();
            });
        });
    });

});
