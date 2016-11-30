define(['cloud/components/cloudWidget', '../cloudTestUtils.js'], function (cloudWidget, cloudTestUtils) {
    'use strict';

    describe('cloudBaseUrlMixin', function () {
        beforeEach(function() {
            this.comp = cloudTestUtils.getComponent(cloudWidget);
        });

        it('`getBaseUrl` should return the correct base url', function () {
            // URL structure: http://<extension-id>.cloud.wix.com/<signed-instance>/version/site/path/file.html?<other sdk parameters>
            //                [-------------------] [-----------] [---------------] [-----] [---][------------]
            //                    extension-id         base url       instance      version viewMode  view path
            var expectedUrl = 'http://extension-id.cloud.wix.com/signed-instance/foo/site/contact.html';
            var url = this.comp.getBaseUrl();

            expect(url).toEqual(expectedUrl);
        });
    });
});
