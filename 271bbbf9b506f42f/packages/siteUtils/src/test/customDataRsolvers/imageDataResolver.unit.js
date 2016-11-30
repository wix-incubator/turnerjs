define([
    'lodash',
    'testUtils',
    'siteUtils/customDataResolvers/imageDataResolver'
], function (_, testUtils, imageDataResolver) {
    'use strict';
    describe('imageDataResolver', function () {


        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData();
            this.getData = this.siteData.dataResolver.getDataByQuery.bind(this, this.siteData.pagesData, 'masterPage', 'masterPage', this.siteData.dataTypes.DATA);
        });

        it('should call imageDataResolver for data of type "Image"', function () {
            var spy = spyOn(imageDataResolver, 'resolve');
            var image = this.siteData.mock.imageData();
            this.getData('#' + image.id);
            expect(spy).toHaveBeenCalledWith(image, jasmine.any(Function));
        });

        it('should resolve link and originalImageRef', function () {
            var origImage = this.siteData.mock.imageData();
            var link = this.siteData.mock.externalLinkData();
            var image = this.siteData.mock.imageData({
                link: link,
                originalImageDataRef: origImage
            });

            var result = imageDataResolver.resolve(image, this.getData);
            expect(result.link).toEqual(link);
            expect(result.originalImageDataRef).toEqual(origImage);
        });

        it('should add nothing to the original image data if there is no global quality data', function () {
            var image = this.siteData.mock.imageData();
            var globalImageQuality = this.siteData.mock.globalImageQualityData();
            delete globalImageQuality.quality;
            delete globalImageQuality.unsharpMask;
            this.siteData.addData(globalImageQuality);

            var result = imageDataResolver.resolve(image, this.getData);
            expect(image).toEqual(result);
        });

        it('should add global quality data to the original image data if there is no quality data on the image', function () {
            var image = this.siteData.mock.imageData();

           this.siteData.mock.globalImageQualityData({
                quality: 100,
                unsharpMask: {
                    radius: 1,
                    amount: 1,
                    thershold: 1
                }
            }, true);

            var result = imageDataResolver.resolve(image, this.getData);
            expect(result.quality).toEqual({
                quality: 100,
                unsharpMask: {
                    radius: 1,
                    amount: 1,
                    thershold: 1
                }
            });
        });

        it('should not add global quality data to the original image data if there is quality data on the image', function () {
            var image = this.siteData.mock.imageData({
                quality: {
                    quality: 100,
                    unsharpMask: {
                        radius: 1,
                        amount: 1,
                        thershold: 1
                    }
                }
            });

            this.siteData.mock.globalImageQualityData({
                quality: 90,
                unsharpMask: {
                    radius: 2,
                    amount: 2,
                    thershold: 2
                }
            }, true);

            var result = imageDataResolver.resolve(image, this.getData);
            expect(result.quality).toEqual({
                quality: 100,
                unsharpMask: {
                    radius: 1,
                    amount: 1,
                    thershold: 1
                }
            });
        });
    });
});
