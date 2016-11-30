define(['lodash', 'testUtils', 'backgroundCommon/components/bgImage'], function (_, testUtils, bgImage) {
    'use strict';

    describe('bgImage', function () {

        function createBgImageProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(bgImage, _.merge({
                skin: "skins.viewer.bgImage.bgImageSkin",
                compData: {},
                'data-type': 'bgimage'
            }, partialProps));
        }

        function createBgImageComponent(partialProps) {
            var props = createBgImageProps(partialProps);
            return testUtils.getComponentFromDefinition(bgImage, props);
        }

        describe('getSkinProperties', function(){
            describe('image style', function(){
                it('should include opacity if opacity defined in compData', function(){
                    var compData = {
                        opacity: 0.5
                    };
                    var bgImageComponent = createBgImageComponent({compData: compData});

                    var skinProperties = bgImageComponent.getSkinProperties();
                    expect(skinProperties.image.style.opacity).toEqual(compData.opacity);
                });

                it('should mot include opacity if compData.opacity is not defined', function(){
                    var compData = {};
                    var bgImageComponent = createBgImageComponent({compData: compData});

                    var skinProperties = bgImageComponent.getSkinProperties();
                    expect(skinProperties.image.style.opacity).not.toBeDefined();
                });
            });

            describe('image data-type', function(){
                it("should equal to props['data-type']", function(){
                    var dataType = 'bgimage';
                    var bgImageComponent = createBgImageComponent({'data-type': dataType});

                    var skinProperties = bgImageComponent.getSkinProperties();
                    expect(skinProperties.image['data-type']).toEqual(dataType);
                });
            });
        });
    });
});
