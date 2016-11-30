define([
    'lodash',
    'testUtils',
    'documentServices/mobileConversion/modules/boxSlideShowLayoutHandler'
], function (_, testUtils, boxSlideShowLayoutHandler) {
    'use strict';

    describe('boxSlideShowLayoutHandler', function () {
        var mobilePage, desktopPage, expected;
        var pageId = 'pageId';
        var factory = testUtils.mockFactory;


        function mockSlideShow(siteData, pageID) {
            var slideShow = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.BoxSlideShow', siteData, pageID, {}, false, 'mock_slideShow');
            slideShow.components = _.map([1, 2, 3, 4], function (slideId) {
                return factory.createStructure('wysiwyg.viewer.components.BoxSlideShowSlide', {
                    layout: {
                        x: 50,
                        y: 50,
                        height: slideId % 2 === 0 ? 50 : 100
                    }
                }, 'slide-' + slideId);
            });
            return slideShow.id;
        }

        describe('fixSlideShowComponentsFromMobilePage', function () {

            //fromComp
            function getValidSlideStructure(slideId, slideShowId, slideShowHeight, allSlides) {
                var slide = factory.createStructure('wysiwyg.viewer.components.BoxSlideShowSlide', {
                    layout: {height: slideShowHeight, x: 0, y: 0, anchors: []}
                }, slideId);

                _.forEach(_.without(allSlides, slideId), function (otherSlide) {
                    slide.layout.anchors.push(factory.createAnchorMobileAlgorithm(slideId, otherSlide, 'TOP_TOP', 0));
                });

                slide.layout.anchors.push(factory.createAnchorMobileAlgorithm(slideId, slideShowId, 'BOTTOM_PARENT', 0, true, slideShowHeight));

                return slide;
            }

            beforeEach(function () {

                var siteData = factory.mockSiteData()
                    .addPageWithDefaults(pageId);
                mockSlideShow(siteData, pageId);
                desktopPage = siteData.pagesData[pageId].structure;
                mobilePage = _.clone(desktopPage);

                var slides = ['slide-1', 'slide-2', 'slide-3', 'slide-4'];

                expected = factory.createStructure('mobile.core.components.Page', {
                    components: [
                        factory.createStructure('wysiwyg.viewer.components.BoxSlideShow', {
                            layout: {height: 100},
                            components: [
                                getValidSlideStructure('slide-1', 'mock_slideShow', 100, slides),
                                getValidSlideStructure('slide-2', 'mock_slideShow', 100, slides),
                                getValidSlideStructure('slide-3', 'mock_slideShow', 100, slides),
                                getValidSlideStructure('slide-4', 'mock_slideShow', 100, slides)
                            ]
                        }, 'mock_slideShow')
                    ],
                    "mobileComponents": [],
                    skin: "wysiwyg.viewer.skins.page.BasicPageSkin",
                    type: "Page"
                }, 'pageId');
                expected.layout = {x: 0, y: 0};
            });

            it('should fix mobile slides layout and anchors (bottom parent anchor + bottom top to all others) if areComponentsAddedOrDeleted', function () {
                boxSlideShowLayoutHandler.fixSlideShowComponentsFromMobilePage(pageId, mobilePage, desktopPage, true);
                expect(mobilePage).toEqual(expected);
            });

            it('should fix slides order to be like the desktop structure', function () {
                var slideShow = desktopPage.components[0].components = [{id: "comp-ihelahsf"}, {id: "comp-ihel5iqs"}, {id: "comp-ihelafez"}];

                boxSlideShowLayoutHandler.fixSlideShowComponentsFromMobilePage(pageId, mobilePage, desktopPage, false);
                var mobileSlideShow = mobilePage.components[0].components;

                _.forEach(slideShow.components, function (slide, index) {
                    expect(mobileSlideShow[index].components.id).toEqual(slide.id);
                });
            });

            it('should fix mobile slides layout and anchors for masterPage as well', function () {
                mobilePage.children = mobilePage.components;
                delete mobilePage.components;

                desktopPage.children = desktopPage.components;
                delete desktopPage.components;

                expected.children = expected.components;
                delete expected.components;

                boxSlideShowLayoutHandler.fixSlideShowComponentsFromMobilePage(pageId, mobilePage, desktopPage, true);
                expect(mobilePage).toEqual(expected);
            });
        });
    });
});
