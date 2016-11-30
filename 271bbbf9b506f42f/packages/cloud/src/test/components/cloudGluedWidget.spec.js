define(['cloud/components/cloudGluedWidget', '../cloudTestUtils.js'], function (cloudGluedWidget, cloudTestUtils) {
    'use strict';

    var WIDTH = 200;

    describe('cloudGluedWidget', function () {

        beforeEach(function() {
            var options = {
                style: {
                    width: WIDTH
                }
            };

            this.comp = cloudTestUtils.getComponent(cloudGluedWidget, options);
        });

        it('`mutateIframeUrlQueryParam` should add the width to the query params', function () {
            var queryParams = {};
            var returnedQueryParams = this.comp.mutateIframeUrlQueryParam(queryParams);

            expect(returnedQueryParams).toBe(queryParams);
            expect(queryParams.width).toEqual(WIDTH);
        });

        it('`mutateSkinProperties` should extend the component style', function () {
            var style = {}, width = 300, height = 200;
            var skinProperties = {
                '': {
                    style: style
                }
            };

            this.comp.setState({
                width: width,
                height: height
            });

            var returnedSkinProperties = this.comp.mutateSkinProperties(skinProperties);

            expect(returnedSkinProperties).toBe(skinProperties);
            expect(style.width).toEqual(width);
            expect(style.height).toEqual(height);
            expect(style.zIndex).toEqual(2);
        });
    });
});
