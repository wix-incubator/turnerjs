define(['Squire', 'lodash'], function(Squire, _) {
    'use strict';

    var siteAPI = {
        getSiteData: function () {
            var pagesData = [{
                title: ""
            }];
            var getDataByQuery = function () {
                return {};
            };
            return {
                pagesData: pagesData,
                getDataByQuery: getDataByQuery
            };
        }
    };

    describe('mapPageToWidgets site with tpaApplicationId(s)', function() {
        var injector = new Squire();

        var sitePagesData = [
            {
                descriptionSEO: "",
                hidePage: false,
                hideTitle: true,
                icon: "",
                id: "mainPage",
                indexable: true,
                metaData: {},
                metaKeywordsSEO: "",
                pageSecurity: {},
                pageTitleSEO: "",
                pageUriSEO: "home",
                title: "Home",
                tpaApplicationId: 1,
                type: "Page",
                underConstruction: false
            },
            {
                descriptionSEO: "",
                hidePage: false,
                hideTitle: true,
                icon: "",
                id: "page2",
                indexable: true,
                metaData: {},
                metaKeywordsSEO: "",
                pageSecurity: {},
                pageTitleSEO: "",
                pageUriSEO: "page2",
                title: "Page2",
                tpaApplicationId: 0,
                type: "Page",
                underConstruction: false
            },
            {
                descriptionSEO: "",
                hidePage: false,
                hideTitle: true,
                icon: "",
                id: "page3",
                indexable: true,
                metaData: {},
                metaKeywordsSEO: "",
                pageSecurity: {},
                pageTitleSEO: "",
                pageUriSEO: "page3",
                title: "Page3",
                tpaApplicationId: 2,
                type: "Page3",
                underConstruction: false
            }
        ];

        beforeEach(function (done) {
            var sitePagesMock = {
                getSitePagesData: jasmine.createSpy().and.returnValue(sitePagesData)
            };

            var builder = injector.mock('tpa/utils/sitePages', sitePagesMock);

            var self = this;
            builder.require(['tpa/services/pageService'], function (pageService) {
                self.pageService = pageService;
                done();
            });
        });

        it('should return a map with pages to widgets if site has any', function () {
            var tpaToPageMap = this.pageService.mapPageToWidgets(siteAPI);
            expect(_.size(tpaToPageMap)).toBe(2);

            var app = tpaToPageMap[1][0];
            expect(app.pageId).toBe('mainPage');
            expect(app.tpaId).toBe(1);
            expect(app.tpaPageId).not.toBeDefined();


            app = tpaToPageMap[2][0];
            expect(app.pageId).toBe('page3');
            expect(app.tpaId).toBe(2);
            expect(app.tpaPageId).not.toBeDefined();
        });
    });


    describe('mapPageToWidgets site with tpaApplicationId(s) and multi section apps', function() {
        var injector = new Squire();

        var sitePagesData = [
            {
                descriptionSEO: "",
                hidePage: false,
                hideTitle: true,
                icon: "",
                id: "mainPage",
                indexable: true,
                metaData: {},
                metaKeywordsSEO: "",
                pageSecurity: {},
                pageTitleSEO: "",
                pageUriSEO: "home",
                title: "Home",
                tpaApplicationId: 1,
                type: "Page",
                underConstruction: false
            },
            {
                descriptionSEO: "",
                hidePage: false,
                hideTitle: true,
                icon: "",
                id: "page2",
                indexable: true,
                metaData: {},
                metaKeywordsSEO: "",
                pageSecurity: {},
                pageTitleSEO: "",
                pageUriSEO: "page2",
                title: "Page2",
                tpaApplicationId: 0,
                type: "Page",
                underConstruction: false
            },
            {
                descriptionSEO: "",
                hidePage: false,
                hideTitle: true,
                icon: "",
                id: "page3",
                indexable: true,
                metaData: {},
                metaKeywordsSEO: "",
                pageSecurity: {},
                pageTitleSEO: "",
                pageUriSEO: "page3",
                title: "Page3",
                tpaApplicationId: 1,
                type: "Page3",
                underConstruction: false,
                tpaPageId: 'developerPageId'
            }
        ];

        beforeEach(function (done) {
            var sitePagesMock = {
                getSitePagesData: jasmine.createSpy().and.returnValue(sitePagesData)
            };

            var builder = injector.mock('tpa/utils/sitePages', sitePagesMock);

            var self = this;
            builder.require(['tpa/services/pageService'], function (pageService) {
                self.pageService = pageService;
                done();
            });
        });


        it('should return a map with pages to widgets for given site pages when site has multi page for the same app', function () {
            var tpaToPageMap = this.pageService.mapPageToWidgets(siteAPI);
            expect(_.size(tpaToPageMap)).toBe(1);

            var app = tpaToPageMap[1];
            expect(_.size(app)).toBe(2);

            expect(app[0].pageId).toBe('mainPage');
            expect(app[0].tpaId).toBe(1);
            expect(app[0].tpaPageId).not.toBeDefined();

            expect(app[1].pageId).toBe('page3');
            expect(app[1].tpaId).toBe(1);
            expect(app[1].tpaPageId).toBe('developerPageId');
        });

    });

    describe('mapPageToWidgets site without tpaApplicationId(s)', function() {
        var injector = new Squire();

        var sitePagesData = [
            {
                descriptionSEO: "",
                hidePage: false,
                hideTitle: true,
                icon: "",
                id: "page2",
                indexable: true,
                metaData: {},
                metaKeywordsSEO: "",
                pageSecurity: {},
                pageTitleSEO: "",
                pageUriSEO: "page2",
                title: "Page2",
                tpaApplicationId: 0,
                type: "Page",
                underConstruction: false
            }
        ];

        beforeEach(function (done) {
            var sitePagesMock = {
                getSitePagesData: jasmine.createSpy().and.returnValue(sitePagesData)
            };

            var builder = injector.mock('tpa/utils/sitePages', sitePagesMock);

            var self = this;
            builder.require(['tpa/services/pageService'], function (pageService) {
                self.pageService = pageService;
                done();
            });
        });

        it('should return an empty page to widget map for given site pages without any tpaApplicationId', function () {
            var tpaToPageMap = this.pageService.mapPageToWidgets(siteAPI);
            expect(_.size(tpaToPageMap)).toBe(0);
        });
    });
});