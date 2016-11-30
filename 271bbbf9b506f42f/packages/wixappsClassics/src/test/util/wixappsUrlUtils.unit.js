/**
 * Created by amitk
 */
define(['lodash', 'testUtils', 'wixappsClassics/util/wixappsUrlUtils'], function (_, testUtils, appsUrlUtils) {
    'use strict';

    describe('apps url utils', function () {
        var packageName = "faq";

        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData();
        });

        it('should not change image data for media service images', function () {
            var imageData = testUtils.proxyData.createImageData('8d13be_232af915f9984e0bb5a42dd5382abad8.jpg', 500, 500, 'title');
            expect(appsUrlUtils.resolveImageData(imageData, this.siteData.serviceTopology, packageName)).toEqual(imageData);
        });

        it('should not change image that is not in images folder (i.e. data src starts with "images/")', function () {
            var imageData = testUtils.proxyData.createImageData('myPhoto.jpg', 500, 500, 'title');
            expect(appsUrlUtils.resolveImageData(imageData, this.siteData.serviceTopology, packageName)).toEqual(imageData);
        });

        it('should construct a url to the right wixapps version if the image is in images folder (i.e. data src starts with "images/")', function () {
            var width = 500, height = 500, title = 'my_title';
            var url = 'images/arrow8_right.png';
            var imageData = testUtils.proxyData.createImageData(url, width, height, title);

            var expectedUrl = this.siteData.serviceTopology.scriptsLocationMap.wixapps + '/javascript/wixapps/apps/' + packageName + '/' + url;
            var expectedData = testUtils.proxyData.createImageData(expectedUrl, width, height, title);
            expect(appsUrlUtils.resolveImageData(imageData, this.siteData.serviceTopology, packageName)).toEqual(expectedData);
        });

        it('should construct a url to the right wixapps version if the image is in images folder and absolute url (i.e. data src starts with "http://images/")', function () {
            var width = 500, height = 500, title = 'my_title';
            var relativeUrl = 'images/arrow8_right.png';
            var absoluteUrl = 'http://' + relativeUrl;
            var imageData = testUtils.proxyData.createImageData(absoluteUrl, width, height, title);

            var expectedUrl = this.siteData.serviceTopology.scriptsLocationMap.wixapps + '/javascript/wixapps/apps/' + packageName + '/' + relativeUrl;
            var expectedData = testUtils.proxyData.createImageData(expectedUrl, width, height, title);
            expect(appsUrlUtils.resolveImageData(imageData, this.siteData.serviceTopology, packageName)).toEqual(expectedData);
        });
    });
});
