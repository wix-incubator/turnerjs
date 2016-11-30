define(['documentServices/componentsMetaData/components/slideShowGalleryMetaData',
        'documentServices/dataModel/dataModel', 'documentServices/constants/constants'],
    function(slideShowGalleryMetaData, dataModel, constants) {
        'use strict';
        describe('slideShowGalleryMetaData - ', function() {

            describe('resizableSides', function () {
                it('Should return left and right if image mode prop = flexibleHeight', function () {
                    spyOn(dataModel, 'getPropertiesItem').and.returnValue({
                        imageMode: 'flexibleHeight'
                    });

                    var resizableSides = slideShowGalleryMetaData.resizableSides({}, 'slideShowGallery');

                    expect(resizableSides).toEqual([constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT]);
                });

                it('Should return top, left, bottom, right if image mode prop != flexibleHeight', function () {
                    spyOn(dataModel, 'getPropertiesItem').and.returnValue({
                        imageMode: 'someMode'
                    });

                    var resizableSides = slideShowGalleryMetaData.resizableSides({}, 'slideShowGallery');

                    expect(resizableSides).toEqual([constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.BOTTOM, constants.RESIZE_SIDES.RIGHT]);
                });
            });
        });
    });