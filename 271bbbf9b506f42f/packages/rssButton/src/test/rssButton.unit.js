define(['lodash', 'testUtils', 'rssButton', 'core'],
    function (_, /** testUtils */testUtils, rssButton, core) {
        'use strict';

        function getComponent(partialProps) {
            var overrideProps = _.merge({
                compData: {
                    id: 'c12d5',
                    link: testUtils.mockFactory.dataMocks.externalLinkData()
                },
                skin: 'wysiwyg.common.components.rssbutton.viewer.skins.RSSButtonSkin',
                style: {
                    width: 200,
                    height: 200
                }
            }, partialProps);
            var componentProps = testUtils.santaTypesBuilder.getComponentProps(rssButton, overrideProps);
            testUtils.getComponentFromDefinition(rssButton, componentProps);
        }

        function getImageData(overrides) {
            return testUtils.mockFactory.dataMocks.imageData(overrides);
        }

        describe('rssButton component', function () {

            describe('image dimensions test', function () {
                it('should create image with same dimensions as compData', function () {
                    spyOn(core.compMixins.skinBasedComp, 'createChildComponent');
                    var image = getImageData({
                        width: 100,
                        height: 100
                    });
                    getComponent({compData: {image: image}, style: {width: 300, height: 300}});
                    expect(core.compMixins.skinBasedComp.createChildComponent).toHaveBeenCalledWith(
                        jasmine.objectContaining({width: 300, height: 300}),
                        'core.components.Image',
                        'image',
                        jasmine.objectContaining({
                            skinPart: 'image',
                            displayMode: 'full',
                            containerWidth: 300,
                            containerHeight: 300
                        })
                    );
                });

                it('should maintain the same ratio for the image when the imageData dimensions are not equal', function () {
                    spyOn(core.compMixins.skinBasedComp, 'createChildComponent');
                    var image = getImageData({width: 100, height: 200});
                    getComponent({
                        compData: {
                            image: image
                        },
                        style: {width: 400, height: 400}
                    });
                    expect(core.compMixins.skinBasedComp.createChildComponent).toHaveBeenCalledWith(
                        jasmine.objectContaining({width: 200, height: 400}),
                        'core.components.Image',
                        'image',
                        jasmine.objectContaining({
                            skinPart: 'image',
                            displayMode: 'full',
                            containerWidth: 400,
                            containerHeight: 400
                        })
                    );
                });
            });

            describe('alt text in image component inside rssbutton', function () {
                it('should receive alt property from image compData', function () {
                    spyOn(core.compMixins.skinBasedComp, 'createChildComponent');
                    var image = getImageData({alt: 'PETER PORKER'});
                    getComponent({compData: {image: image}});
                    expect(core.compMixins.skinBasedComp.createChildComponent).toHaveBeenCalledWith(
                        jasmine.objectContaining({alt: 'PETER PORKER'}),
                        'core.components.Image',
                        'image',
                        jasmine.objectContaining({
                            skinPart: 'image',
                            displayMode: 'full'
                        })
                    );
                });
            });

        });
    });
