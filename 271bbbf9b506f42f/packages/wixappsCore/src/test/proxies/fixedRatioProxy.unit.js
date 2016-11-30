define(['lodash', 'testUtils', 'core', 'wixappsCore/proxies/fixedRatioProxy'], function (_, /** testUtils */testUtils) {
    'use strict';

    describe('fixedRatio proxy', function () {

        var viewDef, data;
        var aspectRatio = "1.77";

        var mockImage = {
            '_type': 'wix:LinkableImage',
            "title": "Water Droplets",
            "src": "cd6a81b7d29d88425609ecc053a00d16.jpg",
            "description": "Describe your image here",
            "width": 1000,
            "height": 750,
            link: {"_type": "wix:LinkBase"}
        };

        var getFixedLayout = function (originalLayout) {
            var result = {};

            var originalWidth = originalLayout.width;
            var originalHeight = originalLayout.height;
            result.height = originalWidth ? Math.floor(originalWidth / aspectRatio) : originalHeight;
            result.width = originalWidth ? originalWidth : Math.floor(originalHeight * aspectRatio);

            return result;
        };

        beforeEach(function () {
            viewDef = {
                comp: {
                    "name": "FixedRatioLayout",
                    "aspectRatio": aspectRatio,
                    "items": [
                        {
                            "data": "photo",
                            "comp": {
                                "name": "Image",
                                "imageMode": "fill",
                                "style": "wp2"
                            },
                            "id": "photo"
                        }
                    ]
                }
            };

            data = {photo: mockImage};
        });

        describe('createFixedRatioProxy with valid params', function () {
            function createProxyAndValidate(originalLayout) {
                viewDef.comp.items[0].layout = originalLayout;
                var props = testUtils.proxyPropsBuilder(viewDef, data);

                var fixedRatioProxy = testUtils.proxyBuilder('FixedRatioLayout', props);
                var noComponent = fixedRatioProxy.refs.component;
                var imageProxy = fixedRatioProxy.refs[0];
                var imageComponent = imageProxy.refs.component;
                var imageComponentStyle = imageComponent.props.style;

                if (originalLayout.width) {
                    expect(imageComponentStyle.width).toEqual(parseInt(originalLayout.width, 10));
                    expect(imageComponentStyle.height).toEqual(getFixedLayout(originalLayout).height);
                } else {
                    expect(imageComponentStyle.width).toEqual(getFixedLayout(originalLayout).width);
                    expect(imageComponentStyle.height).toEqual(parseInt(originalLayout.height, 10));
                }
                expect(noComponent).toBeUndefined();
                expect(imageComponent).toBeDefined();
            }

            it('create fixedRatioProxy with {child: image, provided size: width}', function () {
                var originalLayout = {width: 200};
                createProxyAndValidate(originalLayout);
            });

            it('create fixedRatioProxy with {child: image, provided size: width}', function () {
                var originalLayout = {width: "200"};
                createProxyAndValidate(originalLayout);
            });

            it('create fixedRatioProxy with {child: image, provided size: width}', function () {
                var originalLayout = {height: 200};
                createProxyAndValidate(originalLayout);
            });

            it('create fixedRatioProxy with {child: image, provided size: width}', function () {
                var originalLayout = {height: "200"};
                createProxyAndValidate(originalLayout);
            });
        });

        describe('create proxy with non valid layout', function() {
            it('create fixedRatioProxy with no aspectRatio', function () {
                delete viewDef.comp.aspectRatio;
                var props = testUtils.proxyPropsBuilder(viewDef, data);
                var error = new Error('FixedRatioProxy did not receive any aspect ratio');
                expect(testUtils.proxyBuilder.bind(testUtils, 'FixedRatioLayout', props)).toThrow(error);
            });

            it('create fixedRatioProxy with more than one child', function () {
                viewDef.comp.items[0].layout = {height: 200};
                viewDef.comp.items[1] = {};
                var props = testUtils.proxyPropsBuilder(viewDef, data);

                var error = new Error('FixedRatioProxy can only contain one child');
                expect(testUtils.proxyBuilder.bind(testUtils, 'FixedRatioLayout', props)).toThrow(error);
            });

            it('create fixedRatioProxy with no layout', function () {
                var props = testUtils.proxyPropsBuilder(viewDef, data);
                var error = new Error("FixedRatioProxy's child proxy does not receive legal layout properties");
                expect(testUtils.proxyBuilder.bind(testUtils, 'FixedRatioLayout', props)).toThrow(error);
            });

            it('create fixedRatioProxy with non valid layout', function () {
                viewDef.comp.items[0].layout = {width: "200%"};
                var props = testUtils.proxyPropsBuilder(viewDef, data);

                var error = new Error("FixedRatioProxy's child proxy does not receive legal layout properties");
                expect(testUtils.proxyBuilder.bind(testUtils, 'FixedRatioLayout', props)).toThrow(error);
            });
        });

    });
});
