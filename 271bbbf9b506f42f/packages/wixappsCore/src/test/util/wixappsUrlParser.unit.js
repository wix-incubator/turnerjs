define(["wixappsCore/util/wixappsUrlParser", 'testUtils', 'utils'], function(/** wixappsCore.wixappsUrlParser */wixappsUrlParser, /** testUtils */testUtils, utils){
    "use strict";

    var wixUrlParser = utils.wixUrlParser;

    describe("wixappsUrlParser", function(){
        beforeEach(function(){
            this.siteData = testUtils.mockFactory.mockSiteData()
                .addData({
                    type: 'AppPage',
                    id: 'itemPage'
                }).addData({
                    type: 'PermaLink',
                    id: 'permaLink',
                    mutableSeoTitle: 'mutableSeoTitle'
                });
        });

        describe("getPageSubItemId", function(){
            it("should set subItemId if it's a single Item page", function(){
                this.siteData.setCurrentPage('itemPage', {
                    pageAdditionalData: 'itemId'
                });
                expect(wixappsUrlParser.getPageSubItemId(this.siteData)).toBe('itemId');
            });

            it("should set subItemId if it's an appPartZoom", function(){
                this.siteData.setCurrentPage(this.siteData.currentPage, {
                    pageAdditionalData: 'itemId/itemTitle',
                    pageItemId: 'permaLink'
                });

                expect(wixappsUrlParser.getPageSubItemId(this.siteData)).toBe('itemId');
            });

            it("should not set the subItemId if no data item found (or of wrong type but later :))", function(){
                this.siteData.setCurrentPage(this.siteData.currentPage, {
                    pageAdditionalData: 'itemId'
                });

                expect(wixappsUrlParser.getPageSubItemId(this.siteData)).toBe(null);
            });
        });

        describe("getUrl", function(){
            beforeEach(function(){
                spyOn(wixUrlParser, "getUrl").and.callFake(function(siteData, pageInfo){
                    return pageInfo;
                });
            });

            describe('url for zoom', function(){

                it("should create the url for zoom with old format", function(){
                    var pageInfo = wixappsUrlParser.getAppPartZoomUrl(this.siteData, 'permaLink', 'itemId', 'itemTitle');
                    expect(pageInfo).toEqual({
                        pageItemId: 'permaLink',
                        pageAdditionalData: 'itemId/itemtitle',
                        title: 'mutableSeoTitle'
                    });
                });

                it("should create the url for zoom with new format", function(){
                    spyOn(this.siteData, 'isUsingUrlFormat').and.returnValue(true);
                    var pageInfo = wixappsUrlParser.getAppPartZoomUrl(this.siteData, 'permaLink', 'itemId', 'itemTitle');
                    expect(pageInfo).toEqual({
                        pageItemId: 'permaLink',
                        pageAdditionalData: 'itemId/mutableSeoTitle/itemtitle'
                    });
                });

            });

            it('should return currentUrl when permalink data is missing', function () {
                var pageInfo = wixappsUrlParser.getAppPartZoomUrl(this.siteData, 'BadBadPermaLink', 'itemId', 'itemTitle');
                expect(pageInfo).toEqual(this.siteData.currentUrl.full);
            });
            it("should create the url for page", function(){
                var pageInfo = wixappsUrlParser.getAppPageUrl(this.siteData, 'itemPage', 'itemId', 'itemTitle');
                expect(pageInfo).toEqual({
                    pageId: 'itemPage',
                    pageAdditionalData: 'itemId',
                    title: 'itemTitle'
                });
            });
        });

        describe("getAppPageParam", function() {
            beforeEach(function () {
                this.pageResult = '';
                spyOn(this.siteData, "getDataByQuery").and.callFake(function (pageId) {
                    this.pageResult = pageId;
                    return {};
                }.bind(this));
            });

            it("viewer mode - return url data if exists", function () {
                spyOn(this.siteData, "isViewerMode").and.returnValue(true);
                wixappsUrlParser.getAppPageParams(this.siteData, {pageId: 'asde'});
                expect(this.pageResult).toEqual('asde');
            });

            it("viewer mode - return current url data if urlData is undefined", function () {
                spyOn(this.siteData, "isViewerMode").and.returnValue(true);
                wixappsUrlParser.getAppPageParams(this.siteData);
                expect(this.pageResult).toEqual(this.siteData.currentPage);
            });

            it("preview mode - return current url data", function () {
                spyOn(this.siteData, "isViewerMode").and.returnValue(false);
                wixappsUrlParser.getAppPageParams(this.siteData);
                expect(this.pageResult).toEqual(this.siteData.currentPage);
            });

        });

    });
});
