define(['lodash', 'testUtils'], function (_, testUtils) {
    'use strict';


    describe('MockFactory', function () {
        var mock = testUtils.mockFactory.dataMocks;
        describe("data mocks, no siteData", function(){
            it('should create ExternalLink data with value resolver', function () {
                var link = mock.externalLinkData({url: "http://www.boobies.com"});

                expect(link.id).toBeDefined();
                expect(link.type).toEqual("ExternalLink");
                expect(link.url).toEqual("http://www.boobies.com");
                expect(link.target).toEqual("_blank");
            });

            it('should create ExternalLink data with function resolver', function () {
                var link = mock.externalLinkData({url: function () { return "http://www.boobies.com"; }});

                expect(link.id).toBeDefined();
                expect(link.type).toEqual("ExternalLink");
                expect(link.url).toEqual("http://www.boobies.com");
                expect(link.target).toEqual("_blank");
            });

            it('should create ImageList with links data', function () {
                var links = _.times(3, mock.externalLinkData);
                var images = _.times(3, function (i) { return mock.imageData({"link": mock.utils.toRef(links[i])}); });
                var imageList = mock.imageList({"items": images});

                expect(imageList).toBeDefined();
            });

        });
        describe("data mock, add to siteData", function(){
            it("should create 3 links and add them to siteData", function(){
                var siteData = testUtils.mockFactory.mockSiteData();
                var links = _.times(3, siteData.mock.externalLinkData, siteData.mock);

                expect(siteData.getDataByQuery(links[0].id)).toBeDefined();
            });
        });

        describe("comp props", function(){
            var mockFactory = testUtils.mockFactory;
            it("should create default props with mocked siteData and API", function(){
                var props = mockFactory.mockProps();
                expect(props.siteData.publicModel).toBeDefined();
            });
            it("should create props with passed siteData", function(){
                var siteData = mockFactory.mockSiteData().addData({
                    id: 'test'
                });
                var props = mockFactory.mockProps(siteData);
                expect(props.siteData.getDataByQuery('test')).toBeDefined();
            });
            it("should create props with data and add it to siteData", function(){
                var props = mockFactory.mockProps().setCompData({
                    id: 'test'
                });
                expect(props.compData.id).toBe('test');
                expect(props.siteData.getDataByQuery('test')).toBeDefined();
            });
            it("should create props with theme and add to siteData", function(){
                var props = mockFactory.mockProps().setThemeStyle({
                    id: 'style',
                    style: {}
                });
                expect(props.siteData.getAllTheme().style).toBeDefined();
                expect(props.styleId).toBe('style');
            });
            it("should create linkBar props", function(){
                var compProps = mockFactory.mockProps();
                var dataMocks = compProps.siteData.mock;

                var links = _.times(3, dataMocks.externalLinkData, dataMocks);
                var images = _.times(3, function(i) {return dataMocks.imageData({"link": links[i]}); }, dataMocks);

                compProps
                    .setCompData(dataMocks.imageList({"items": images}))
                    .setCompProp({})
                    .setSkin("wysiwyg.viewer.skins.LinkBarNoBGSkin");


                expect(compProps.compData).toBeDefined();
                expect(compProps.compData.type).toEqual("ImageList");
                expect(compProps.compData.items.length).toEqual(3);

                expect(compProps.skin).toEqual("wysiwyg.viewer.skins.LinkBarNoBGSkin");
            });
        });

    });
});
