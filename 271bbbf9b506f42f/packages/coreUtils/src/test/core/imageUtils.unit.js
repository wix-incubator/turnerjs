define([
    'lodash',
    'testUtils',
    'coreUtils/core/imageUtils',
    'imageClientApi'
], function (_, testUtils, imageUtils, imageClientApi) {
    'use strict';

    describe('imageUtils', function () {
        describe('getContainerSize', function () {
            var containerSize = {
                width: 100,
                height: 300
            };
            var imageSize = {
                width: 400,
                height: 500
            };
            var fittingTypes = _.omit(imageClientApi.fittingTypes, ['LEGACY_FIT_WIDTH', 'LEGACY_FIT_HEIGHT']);

            it('should return passed container size for all  fittingTypes but LEGACY_FIT_WIDTH and LEGACY_FIT_HEIGHT', function () {

                _.forEach(fittingTypes, function (fittingType) {
                    expect(imageUtils.getContainerSize(containerSize, imageSize, fittingType)).toEqual(containerSize);
                });
            });

            it('should return a clone of containerSize', function () {
                expect(imageUtils.getContainerSize(containerSize, imageSize, fittingTypes.FILL)).not.toBe(containerSize);
            });

            it('should return a calculated height for LEGACY_FIT_WIDTH', function () {
                var calculatedHeight = containerSize.width / (imageSize.width / imageSize.height);
                expect(imageUtils.getContainerSize(containerSize, imageSize, imageClientApi.fittingTypes.LEGACY_FIT_WIDTH).height).toEqual(calculatedHeight);
            });

            it('should return a calculated width for LEGACY_FIT_WIDTH', function () {
                var calculatedWidth = containerSize.height * (imageSize.width / imageSize.height);
                expect(imageUtils.getContainerSize(containerSize, imageSize, imageClientApi.fittingTypes.LEGACY_FIT_HEIGHT).width).toEqual(calculatedWidth);
            });

            it('should return a calculated rounded height and width for LEGACY_FIT_WIDTH', function () {
                var calculatedHeight = containerSize.width / (imageSize.width / imageSize.height);
                var calculatedWidth = containerSize.width;
                var result = imageUtils.getContainerSize(containerSize, imageSize, imageClientApi.fittingTypes.LEGACY_FIT_WIDTH);
                expect(result.exactWidth).toEqual(Math.ceil(calculatedWidth));
                expect(result.exactHeight).toEqual(Math.ceil(calculatedHeight));
            });

            it('should return a calculated rounded height and width for LEGACY_FIT_HEIGHT', function () {
                var calculatedHeight = containerSize.height;
                var calculatedWidth = containerSize.height * (imageSize.width / imageSize.height);
                var result = imageUtils.getContainerSize(containerSize, imageSize, imageClientApi.fittingTypes.LEGACY_FIT_HEIGHT);
                expect(result.exactWidth).toEqual(Math.ceil(calculatedWidth));
                expect(result.exactHeight).toEqual(Math.ceil(calculatedHeight));
            });

        });
        describe('getImageComputedProperties', function () {
            beforeEach(function () {
                this.imageData = testUtils.mockFactory.dataMocks.imageData();
                this.imageData.quality = {};
                this.siteData = testUtils.mockFactory.mockSiteData();
                this.imageInfo = {
                    imageData: this.imageData,
                    containerWidth: 400,
                    containerHeight: 500,
                    displayMode: 'fit'
                };

                // Spy on imageClientApi getData
                this.spiedGetData = spyOn(imageClientApi, 'getData').and.returnValue({
                    uri: 'mockImageUri',
                    css: {}
                });

                //Expected source passed to imageClientApi
                this.src = _.assign(_.pick(this.imageData, ['width', 'height', 'crop']), {id: this.imageData.uri});

                //Expected target passed to imageClientApi
                this.target = {
                    width: this.imageInfo.containerWidth,
                    height: this.imageInfo.containerHeight,
                    htmlTag: 'img',
                    pixelAspectRatio: 1,
                    alignment: imageClientApi.alignTypes.CENTER
                };
            });
            it('should pass the correct data to imageClientApi', function () {
                var expectedArgs = [
                    'fit',
                    this.src,
                    this.target,
                    this.imageData.quality
                ];
                imageUtils.getImageComputedProperties(this.imageInfo, this.siteData.getMediaFullStaticUrl.bind(this.siteData), this.siteData.currentUrl, this.siteData.mobile.getDevicePixelRatio(), 'img');

                expect(this.spiedGetData.calls.argsFor(0)).toEqual(expectedArgs);
            });

            it('should pass the image quality to imageClientApi as filter', function () {
                this.imageInfo.imageData.quality = {quality: 60};
                var expectedArgs = [
                    'fit',
                    this.src,
                    this.target,
                    {quality: 60}
                ];
                imageUtils.getImageComputedProperties(this.imageInfo, this.siteData.getMediaFullStaticUrl.bind(this.siteData), this.siteData.currentUrl, this.siteData.mobile.getDevicePixelRatio(), 'img');

                expect(this.spiedGetData.calls.argsFor(0)).toEqual(expectedArgs);
            });

            it('should pass "fill" to imageClientApi if no displayMode defined', function () {
                var expectedArgs = [
                    'fill',
                    this.src,
                    this.target,
                    this.imageData.quality
                ];
                delete this.imageInfo.displayMode;
                imageUtils.getImageComputedProperties(this.imageInfo, this.siteData.getMediaFullStaticUrl.bind(this.siteData), this.siteData.currentUrl, this.siteData.mobile.getDevicePixelRatio(), 'img');

                expect(this.spiedGetData.calls.argsFor(0)).toEqual(expectedArgs);
            });

            it('should pass "img" to imageClientApi if no htmlTag defined', function () {
                var expectedArgs = [
                    'fit',
                    this.src,
                    this.target,
                    this.imageData.quality
                ];
                imageUtils.getImageComputedProperties(this.imageInfo, this.siteData.getMediaFullStaticUrl.bind(this.siteData), this.siteData.currentUrl, this.siteData.mobile.getDevicePixelRatio());

                expect(this.spiedGetData.calls.argsFor(0)).toEqual(expectedArgs);
            });
        });
        // TODO: Shimi
        //describe('getImageMeanBrightness', function () {
        //    it('should call imageAnalyzer mean brightness', function () {
        //        var spiedAnalyzer = spyOn(imageAnalyzer, 'getImageMeanBrightness');
        //        imageUtils.getImageMeanBrightness();
        //        expect(spiedAnalyzer).toHaveBeenCalled();
        //    });
        //});
    });
});
