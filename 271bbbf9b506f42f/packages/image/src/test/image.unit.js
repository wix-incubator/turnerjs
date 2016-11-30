define(['lodash', 'react', 'testUtils', 'image'], function (_, React, /** testUtils */testUtils, image) {
    'use strict';

    describe('image spec', function () {

        function createImageComponent(partialProps, siteData) {
            var props = testUtils.santaTypesBuilder.getComponentProps(image, _.merge({
                imageData: {
                    uri: 'http://images/myImage.png',
                    title: 'BEST TITLE EVER',
                    alt: 'alt example',
                    width: 50,
                    height: 70
                },
                containerWidth: 150,
                containerHeight: 150,
                displayMode: 'full',
                skin: 'skins.core.ImageNewSkinZoomable'
            }, partialProps), siteData);

            return testUtils.getComponentFromDefinition(image, props);
        }

        describe('root part', function () {

            it('should have dimensions according to container dimensions props', function () {
                var imageComp = createImageComponent({
                    containerWidth: 200,
                    containerHeight: 300
                });

                var skinProperties = imageComp.getSkinProperties();

                expect(skinProperties[''].style.width).toEqual(200);
                expect(skinProperties[''].style.height).toEqual(300);
            });

            describe('image', function () {

                it('should render img element', function () {
                    var imageComp = createImageComponent();

                    var skinProperties = imageComp.getSkinProperties();
                    expect(React.addons.TestUtils.isElementOfType(skinProperties[''].addChildren, 'img')).toBe(true);
                });

                it('should contain the uri in the src attribute', function () {
                    var mockSiteData = testUtils.mockFactory.mockSiteData({
                        serviceTopology: {
                            staticMediaUrl: 'spider/pig'
                        }
                    });
                    var imageComp = createImageComponent({
                        imageData: {
                            uri: 'doeswhatever.jpg'
                        }
                    }, mockSiteData);

                    var skinProperties = imageComp.getSkinProperties();
                    expect(_.startsWith(skinProperties[''].addChildren.props.src, 'spider/pig/doeswhatever.jpg')).toBe(true);
                });

                it('should have alt attribute according to the alt data', function () {
                    var imageComp = createImageComponent({
                        imageData: {
                            alt: 'spider pig does!'
                        }
                    });

                    var skinProperties = imageComp.getSkinProperties();
                    expect(skinProperties[''].addChildren.props.alt).toBe('spider pig does!');
                });

                it('should render svg effect', function () {
                    var imageComp = createImageComponent({
                        effectName: 'blur'
                    });

                    var skinProperties = imageComp.getSkinProperties();
                    var addedChildren = skinProperties[''].addChildren;
                    expect(React.addons.TestUtils.isElementOfType(addedChildren[0], 'img')).toBe(true);
                    expect(React.addons.TestUtils.isElementOfType(addedChildren[1], 'svg')).toBe(true);
                });

            });

        });

        describe('preloader part', function () {

            describe('using preloader', function () {

                it('should have css classes', function () {
                    var imageComp = createImageComponent({
                        usePreloader: true
                    });

                    var skinProperties = imageComp.getSkinProperties();
                    expect(skinProperties.preloader.className).toEqual('circle-preloader white');
                });

                it('should NOT have css class if removeImagePreloader experiment is open', function () {
                    testUtils.experimentHelper.openExperiments(['removeImagePreloader']);
                    var imageComp = createImageComponent({
                        usePreloader: true
                    });

                    var skinProperties = imageComp.getSkinProperties();
                    expect(skinProperties.preloader.className).toEqual('');
                });

            });

            describe('not using preloader', function () {

                it('should NOT have css classes', function () {
                    var imageComp = createImageComponent({
                        usePreloader: false
                    });

                    var skinProperties = imageComp.getSkinProperties();
                    expect(skinProperties.preloader.className).toEqual('');
                });

            });

        });

    });
});
