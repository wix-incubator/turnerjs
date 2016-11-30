define(['lodash', 'coreUtils/core/nonPageItemZoom'], function (_, nonPageItemZoom) {
    'use strict';

    describe('nonPageItemZoom', function () {
        function zoomIntoImageData(getImageDataFromGalleryByQuery) {
            var imageData = {type: 'Image'};
            var galleryData = {gallery: 'gallery'};
            var enhancedImageData = nonPageItemZoom.addGalleryDataToImageData(imageData, galleryData, getImageDataFromGalleryByQuery || _.noop);
            nonPageItemZoom.zoom(enhancedImageData);
            return enhancedImageData;
        }

        describe('addGalleryDataToImageData', function () {
            it('should add the gallery context data to the image data', function () {
                var imageData = {type: 'Image'};
                var galleryData = {gallery: 'gallery'};
                var getImageDataFromGalleryByQuery = _.noop;
                var enhancedImageData = nonPageItemZoom.addGalleryDataToImageData(imageData, galleryData, getImageDataFromGalleryByQuery);
                expect(enhancedImageData).toEqual(jasmine.objectContaining(imageData));
                expect(enhancedImageData.galleryData).toEqual(jasmine.objectContaining(galleryData));
                expect(enhancedImageData.galleryData.getImageDataByQuery).toBe(getImageDataFromGalleryByQuery);
            });
        });

        describe('zoom', function () {
            beforeEach(function () {
                window.rendered = {
                    forceUpdate: jasmine.createSpy('forceUpdate')
                };
            });

            it('should throw an exception if trying to zoom on invalid image data (one that does not support nonPageItemZoom)', function () {
                expect(nonPageItemZoom.zoom.bind(null, null)).toThrow();
                expect(nonPageItemZoom.zoom.bind(null, {})).toThrow();
                expect(nonPageItemZoom.zoom.bind(null, {galleryData: {}})).toThrow();
            });

            describe('a valid imageData', function () {
                it('should call forceUpdate', function () {
                    zoomIntoImageData();
                    expect(window.rendered.forceUpdate).toHaveBeenCalled();
                });

                it('should save the given zoomed image in memory and retrieve it using getZoomedImageData', function () {
                    var enhancedImageData = zoomIntoImageData();
                    expect(nonPageItemZoom.getZoomedImageData()).toBe(enhancedImageData);
                });
            });

            describe('unzoom', function () {
                beforeEach(function () {
                    zoomIntoImageData();
                    nonPageItemZoom.unzoom();
                });

                it('should call forceUpdate', function () {
                    expect(window.rendered.forceUpdate).toHaveBeenCalled();
                });

                it('should later return undefined by calling getZoomedImageData', function () {
                    expect(nonPageItemZoom.getZoomedImageData()).toBeUndefined();
                });
            });
        });

        describe('shouldImageBeZoomedAsNonPageItem', function () {
            it('should return false if given undefined as imageData', function () {
                expect(nonPageItemZoom.shouldImageBeZoomedAsNonPageItem(undefined)).toBeFalsy();
            });

            it('should return false if given an imageData with no galleryData', function () {
                expect(nonPageItemZoom.shouldImageBeZoomedAsNonPageItem({type: 'Image'})).toBeFalsy();
            });

            it('should return true if given an imageData with galleryData', function () {
                expect(nonPageItemZoom.shouldImageBeZoomedAsNonPageItem({type: 'Image', galleryData: {}})).toBeTruthy();
            });
        });
    });
});
