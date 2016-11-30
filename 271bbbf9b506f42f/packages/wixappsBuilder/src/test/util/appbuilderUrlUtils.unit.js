define(['lodash', 'testUtils', 'wixappsBuilder/util/appbuilderUrlUtils', 'wixappsBuilder/util/oldImagesConversionMap'], function (_, testUtils, appsUrlUtils, oldImagesConversionMap) {
    'use strict';

    describe('apps url utils', function () {
        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData();
        });

        it('should not change image data for media service images', function () {
            var imageData = testUtils.proxyData.createImageData('8d13be_232af915f9984e0bb5a42dd5382abad8.jpg', 500, 500, 'title');
            expect(appsUrlUtils.resolveImageData(imageData, this.siteData.serviceTopology)).toEqual(imageData);
        });

        it('should replace old images that appear in the map to the correlated one from the media service', function () {
            var imageName = 'bloom.jpg';
            var url = 'images/items/' + imageName;
            var title = 'title';
            var imageData = testUtils.proxyData.createImageData(url, 10, 10, title);
            var expected = testUtils.proxyData.createImageData(oldImagesConversionMap[imageName].src, oldImagesConversionMap[imageName].width, oldImagesConversionMap[imageName].height, title);
            expect(appsUrlUtils.resolveImageData(imageData, this.siteData.serviceTopology)).toEqual(expected);
        });

        it('should not change image that is not in images folder (i.e. data src starts with "images/")', function () {
            var imageData = testUtils.proxyData.createImageData('myPhoto.jpg', 500, 500, 'title');
            expect(appsUrlUtils.resolveImageData(imageData, this.siteData.serviceTopology)).toEqual(imageData);
        });

        it('should construct a url to the right wixapps version if the image is in images folder (i.e. data src starts with "images/")', function () {
            var width = 500, height = 500, title = 'my_title';
            var url = 'images/icons/appbuilder_sprite.png';
            var imageData = testUtils.proxyData.createImageData(url, width, height, title);

            var expectedUrl = this.siteData.serviceTopology.scriptsLocationMap.wixapps + '/' + url;
            var expectedData = testUtils.proxyData.createImageData(expectedUrl, width, height, title);
            expect(appsUrlUtils.resolveImageData(imageData, this.siteData.serviceTopology)).toEqual(expectedData);
        });

        it('should construct a url to the right wixapps version if the image is in images folder and absolute url (i.e. data src starts with "http://images/")', function () {
            var width = 500, height = 500, title = 'my_title';
            var relativeUrl = 'images/icons/appbuilder_sprite.png';
            var absoluteUrl = 'http://' + relativeUrl;
            var imageData = testUtils.proxyData.createImageData(absoluteUrl, width, height, title);

            var expectedUrl = this.siteData.serviceTopology.scriptsLocationMap.wixapps + '/' + relativeUrl;
            var expectedData = testUtils.proxyData.createImageData(expectedUrl, width, height, title);
            expect(appsUrlUtils.resolveImageData(imageData, this.siteData.serviceTopology)).toEqual(expectedData);
        });
    });
});
