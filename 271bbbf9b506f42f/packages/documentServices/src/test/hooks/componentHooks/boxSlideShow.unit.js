define([
    'lodash', 'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/hooks/componentHooks/boxSlideShow'
], function (_, testUtils,
             privateServicesHelper,
             boxSlideShow) {
    'use strict';

    describe('boxSlideShow component hook', function () {
        var ps, siteData;
        var mockFactory = testUtils.mockFactory;
        var expectedAddError = 'Invalid slideShow structure definition';
        var expectedDeleteError = "can't delete the last slide";

        function createBoxSlideShow(){
            return mockFactory.createStructure('wysiwyg.viewer.components.BoxSlideShow');
        }

        function createStripSlideShow(){
            return mockFactory.createStructure('wysiwyg.viewer.components.StripContainerSlideShow');
        }

        function createBoxSlideShowSlide(){
            return mockFactory.createStructure('wysiwyg.viewer.components.BoxSlideShowSlide');
        }

        function createStripSlideShowSlide(){
            return mockFactory.createStructure('wysiwyg.viewer.components.StripContainerSlideShowSlide');
        }

        beforeEach(function(){
            siteData = mockFactory.mockSiteData();
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        });

        describe('verifySlideShowStructureOnAdd', function(){
            it("should throw an error if there aren't any slides", function () {
                var slideShow = createBoxSlideShow();
                expect(function(){
                    boxSlideShow.verifySlideShowStructureOnAdd(ps, null, null, slideShow);
                }).toThrow(new Error(expectedAddError));
            });

            it("should throw an error if there is a slide with a non matching type for boxSlideShow", function () {
                var slideShow = createBoxSlideShow();
                slideShow.components = _.times(3, createBoxSlideShowSlide);
                slideShow.components.push(mockFactory.createStructure('otherMockType'));
                expect(function(){
                    boxSlideShow.verifySlideShowStructureOnAdd(ps, null, null, slideShow);
                }).not.toThrow();

                slideShow.components = [createBoxSlideShowSlide(), createStripSlideShowSlide()];
                expect(function(){
                    boxSlideShow.verifySlideShowStructureOnAdd(ps, null, null, slideShow);
                }).toThrow(new Error(expectedAddError));
            });

            it("should throw an error if there is a slide with a non matching type for stripSlideShow", function () {
                var slideShow = createStripSlideShow();
                slideShow.components = _.times(3, createStripSlideShowSlide);
                slideShow.components.push(mockFactory.createStructure('otherMockType'));
                expect(function(){
                    boxSlideShow.verifySlideShowStructureOnAdd(ps, null, null, slideShow);
                }).not.toThrow();

                slideShow.components = [createBoxSlideShowSlide(), createStripSlideShowSlide()];
                expect(function(){
                    boxSlideShow.verifySlideShowStructureOnAdd(ps, null, null, slideShow);
                }).toThrow(new Error(expectedAddError));
            });
        });

        describe('verifySlideShowStructureOnDelete', function(){
            it("should throw an error if there aren't any slides for boxSlideShow", function () {
                var slideShow = createBoxSlideShow();
                slideShow.components = [createBoxSlideShowSlide()];
                slideShow.components[0].id = 'slideId';
                siteData.addPageWithDefaults('pageId', [slideShow]);
                var slideShowPointer = ps.pointers.components.getComponent('slideId', ps.pointers.components.getPage('pageId', 'DESKTOP'));

                expect(function(){
                    boxSlideShow.verifySlideShowStructureOnDelete(ps, slideShowPointer, false);
                }).toThrow(new Error(expectedDeleteError));
            });

            it("should throw an error if there aren't any slides for stripSlideShow", function () {
                var slideShow = createStripSlideShow();
                slideShow.components = [createStripSlideShowSlide()];
                slideShow.components[0].id = 'slideId';
                siteData.addPageWithDefaults('pageId', [slideShow]);
                var slideShowPointer = ps.pointers.components.getComponent('slideId', ps.pointers.components.getPage('pageId', 'DESKTOP'));

                expect(function(){
                    boxSlideShow.verifySlideShowStructureOnDelete(ps, slideShowPointer, false);
                }).toThrow(new Error(expectedDeleteError));
            });
        });
    });
});
