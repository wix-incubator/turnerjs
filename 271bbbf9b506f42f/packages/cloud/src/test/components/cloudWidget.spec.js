define(['cloud/components/cloudWidget', '../cloudTestUtils.js'], function (cloudWidget, cloudTestUtils) {
    'use strict';

    var WIDTH = 200;

    describe('cloudWidget', function () {

        beforeEach(function() {
            var options = {
                style: {
                    width: WIDTH
                }
            };

            this.comp = cloudTestUtils.getComponent(cloudWidget, options);
        });

        it('`mutateIframeUrlQueryParam` should add the width to the query params', function () {
            var queryParams = {};
            queryParams = this.comp.mutateIframeUrlQueryParam(queryParams);

            expect(queryParams.width).toEqual(WIDTH);
        });
    });
});
