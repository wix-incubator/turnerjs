define(['lodash', 'react', 'testUtils', 'displayer'], function (_, React, testUtils, displayer) {
    'use strict';

    describe('displayer spec', function () {

        function createDisplayerComponent(props) {
            return testUtils.getComponentFromDefinition(displayer, props);
        }

        function createDisplayerWithClickBehavior(clickBehavior, props) {
            var displayerProps = createDisplayerProps(_.merge({
                compProp: {
                    galleryImageOnClickAction: clickBehavior
                }
            }, props));
            return createDisplayerComponent(displayerProps);
        }

        function createDisplayerProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(displayer, _.merge({
                compProp: {
                    alignText: 'mockTextAlign',
                    goToLinkText: 'mockGoToLinkText'
                },
                compData: {
                    id: 'mockId'
                },
                imageIndex: 0,
                imageWrapperSize: {
                    imageWrapperHeight: 100,
                    imageWrapperWidth: 100,
                    imageWrapperMarginLeft: 0,
                    imageWrapperMarginRight: 0,
                    imageWrapperMarginTop: 0,
                    imageWrapperMarginBottom: 0
                },
                skin: 'wysiwyg.viewer.skins.displayers.SlideShowSloopyDisplayer'
            }, partialProps));
        }

        describe('imageWrapper part', function () {

            it('should have a size according to imageWrapperSize prop', function () {
                var displayerProps = createDisplayerProps({
                    imageWrapperSize: {
                        imageWrapperHeight: 140,
                        imageWrapperWidth: 200,
                        imageWrapperMarginLeft: 10,
                        imageWrapperMarginRight: 10,
                        imageWrapperMarginTop: 0,
                        imageWrapperMarginBottom: 0
                    }
                });
                var displayerComp = createDisplayerComponent(displayerProps);

                var displayerSkinProperties = displayerComp.getSkinProperties();
                expect(displayerSkinProperties.imageWrapper.style).toEqual({
                    height: 140,
                    width: 200,
                    marginLeft: 10,
                    marginRight: 10,
                    marginTop: 0,
                    marginBottom: 0
                });
            });

        });

        describe('title part', function () {

            describe('when sv_fixGridsTextDirection is open', function() {
                beforeEach(function() {
                    testUtils.experimentHelper.openExperiments(['sv_fixGridsTextDirection']);
                });

                it('should have a text align right and direction rtl', function () {
                    var displayerProps = createDisplayerProps({
                        compProp: {
                            alignText: 'right'
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var displayerSkinProperties = displayerComp.getSkinProperties();
                    expect(displayerSkinProperties.title.style).toEqual({
                        textAlign: 'right',
                        direction: 'rtl'
                    });
                });

                it('should have a text align left only', function () {
                    var displayerProps = createDisplayerProps({
                        compProp: {
                            alignText: 'left'
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var displayerSkinProperties = displayerComp.getSkinProperties();
                    expect(displayerSkinProperties.title.style).toEqual({
                        textAlign: 'left'
                    });
                });
            });

            describe('when sv_fixGridsTextDirection is closed', function() {
                it('should have a text align right only', function () {
                    var displayerProps = createDisplayerProps({
                        compProp: {
                            alignText: 'right'
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var displayerSkinProperties = displayerComp.getSkinProperties();
                    expect(displayerSkinProperties.title.style).toEqual({
                        textAlign: 'right'
                    });
                });

                it('should have a text align left only', function () {
                    var displayerProps = createDisplayerProps({
                        compProp: {
                            alignText: 'left'
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var displayerSkinProperties = displayerComp.getSkinProperties();
                    expect(displayerSkinProperties.title.style).toEqual({
                        textAlign: 'left'
                    });
                });
            });

            it('should have a title according to compData', function () {
                var displayerProps = createDisplayerProps({
                    compData: {
                        title: 'SPIDER PIG'
                    }
                });
                var displayerComp = createDisplayerComponent(displayerProps);

                var displayerSkinProperties = displayerComp.getSkinProperties();
                expect(displayerSkinProperties.title.children).toEqual('SPIDER PIG');
            });

            it('should have a default empty title', function () {
                var displayerProps = createDisplayerProps();
                var displayerComp = createDisplayerComponent(displayerProps);

                var displayerSkinProperties = displayerComp.getSkinProperties();
                expect(displayerSkinProperties.title.children).toEqual('');
            });

        });

        describe('description part', function () {
            describe('when sv_fixGridsTextDirection is open', function() {
                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments(['sv_fixGridsTextDirection']);
                });

                it('should have a text align only', function () {
                    var displayerProps = createDisplayerProps({
                        compProp: {
                            alignText: 'center'
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var displayerSkinProperties = displayerComp.getSkinProperties();
                    expect(displayerSkinProperties.description.style).toEqual({
                        textAlign: 'center'
                    });
                });

                it('should have a text align right and direction rtl', function () {
                    var displayerProps = createDisplayerProps({
                        compProp: {
                            alignText: 'right'
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var displayerSkinProperties = displayerComp.getSkinProperties();
                    expect(displayerSkinProperties.description.style).toEqual({
                        textAlign: 'right',
                        direction: 'rtl'
                    });
                });
            });

            describe('when sv_fixGridsTextDirection is closed', function() {
                it('should have a text align right only', function () {
                    var displayerProps = createDisplayerProps({
                        compProp: {
                            alignText: 'right'
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var displayerSkinProperties = displayerComp.getSkinProperties();
                    expect(displayerSkinProperties.description.style).toEqual({
                        textAlign: 'right'
                    });
                });

                it('should have a text align left only', function () {
                    var displayerProps = createDisplayerProps({
                        compProp: {
                            alignText: 'left'
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var displayerSkinProperties = displayerComp.getSkinProperties();
                    expect(displayerSkinProperties.description.style).toEqual({
                        textAlign: 'left'
                    });
                });
            });

            it('should have a description according to compData', function () {
                var displayerProps = createDisplayerProps({
                    compData: {
                        description: 'DOES WHATEVER A SPIDER PIG DOES'
                    }
                });
                var displayerComp = createDisplayerComponent(displayerProps);

                var displayerSkinProperties = displayerComp.getSkinProperties();
                expect(displayerSkinProperties.description.children).toEqual('DOES WHATEVER A SPIDER PIG DOES');
            });

            it('should have a default empty description', function () {
                var displayerProps = createDisplayerProps();
                var displayerComp = createDisplayerComponent(displayerProps);

                var displayerSkinProperties = displayerComp.getSkinProperties();
                expect(displayerSkinProperties.description.children).toEqual('');
            });

            describe('line brake in the description', function () {

                it('should be parsed into an array with React LineBreak elements inbetween', function () {
                    var displayerProps = createDisplayerProps({
                        compData: {
                            description: 'can he swing\n from a web?\r no, he cant\r\nhe is a pig!'
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var displayerSkinProperties = displayerComp.getSkinProperties();
                    var descriptionChildren = displayerSkinProperties.description.children;
                    expect(descriptionChildren[0]).toEqual('can he swing');
                    expect(React.addons.TestUtils.isElementOfType(descriptionChildren[1], 'br')).toBe(true);
                    expect(descriptionChildren[2]).toEqual(' from a web?');
                    expect(React.addons.TestUtils.isElementOfType(descriptionChildren[3], 'br')).toBe(true);
                    expect(descriptionChildren[4]).toEqual(' no, he cant');
                    expect(React.addons.TestUtils.isElementOfType(descriptionChildren[5], 'br')).toBe(true);
                    expect(descriptionChildren[6]).toEqual('he is a pig!');
                });

            });

        });

        describe('image part', function () {

            it('should create an Image component', function () {
                var displayerProps = createDisplayerProps();
                var displayerComp = createDisplayerComponent(displayerProps);

                var skinProperties = displayerComp.getSkinProperties();
                expect(skinProperties.image.props.structure.componentType).toEqual('core.components.Image');
            });

            it('should pass compData as imageData prop', function () {
                var compData = {
                    param1: 'val1'
                };
                var displayerProps = createDisplayerProps({
                    compData: compData
                });
                var displayerComp = createDisplayerComponent(displayerProps);

                var skinProperties = displayerComp.getSkinProperties();
                expect(skinProperties.image.props.imageData).toEqual(displayerProps.compData);
            });

            it('should have a \'fill\' displayMode', function () {
                var displayerProps = createDisplayerProps();
                var displayerComp = createDisplayerComponent(displayerProps);

                var skinProperties = displayerComp.getSkinProperties();
                expect(skinProperties.image.props.displayMode).toEqual('fill');
            });

            describe('when skin has no exports', function () {

                it('containerWidth should be according to imageWrapper width', function () {
                    var displayerProps = createDisplayerProps({
                        imageWrapperSize: {
                            imageWrapperHeight: 200,
                            imageWrapperWidth: 150,
                            imageWrapperMarginLeft: 0,
                            imageWrapperMarginRight: 0,
                            imageWrapperMarginTop: 0,
                            imageWrapperMarginBottom: 0
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var skinProperties = displayerComp.getSkinProperties();
                    expect(skinProperties.image.props.containerWidth).toEqual(150);
                });

                it('containerHeight should be according to imageWrapper height', function () {
                    var displayerProps = createDisplayerProps({
                        imageWrapperSize: {
                            imageWrapperHeight: 200,
                            imageWrapperWidth: 150,
                            imageWrapperMarginLeft: 0,
                            imageWrapperMarginRight: 0,
                            imageWrapperMarginTop: 0,
                            imageWrapperMarginBottom: 0
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var skinProperties = displayerComp.getSkinProperties();
                    expect(skinProperties.image.props.containerHeight).toEqual(200);
                });

            });

            describe('when skin has dimension exports', function () {

                it('containerWidth should be according to imageWrapper width and left & right skin exports', function () {
                    var displayerProps = createDisplayerProps({
                        skin: 'skins.viewer.displayers.SlideIronDisplayer',
                        imageWrapperSize: {
                            imageWrapperHeight: 200,
                            imageWrapperWidth: 150,
                            imageWrapperMarginLeft: 0,
                            imageWrapperMarginRight: 0,
                            imageWrapperMarginTop: 0,
                            imageWrapperMarginBottom: 0
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var skinProperties = displayerComp.getSkinProperties();
                    expect(skinProperties.image.props.containerWidth).toEqual(126);
                });

                it('containerHeight should be according to imageWrapper height and top & bottom skin exports', function () {
                    var displayerProps = createDisplayerProps({
                        skin: 'skins.viewer.displayers.SlideIronDisplayer',
                        imageWrapperSize: {
                            imageWrapperHeight: 200,
                            imageWrapperWidth: 150,
                            imageWrapperMarginLeft: 0,
                            imageWrapperMarginRight: 0,
                            imageWrapperMarginTop: 0,
                            imageWrapperMarginBottom: 0
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var skinProperties = displayerComp.getSkinProperties();
                    expect(skinProperties.image.props.containerHeight).toEqual(48);
                });

            });

            describe('when skin has addMarginToContainer:true exports', function () {

                it('containerWidth should be according to imageWrapper width, skin params, and margins', function () {
                    var displayerProps = createDisplayerProps({
                        skin: 'wysiwyg.viewer.skins.gallerymatrix.MatrixDisplayerCircleSkin',
                        imageWrapperSize: {
                            imageWrapperHeight: 200,
                            imageWrapperWidth: 150,
                            imageWrapperMarginLeft: 17,
                            imageWrapperMarginRight: 31,
                            imageWrapperMarginTop: 0,
                            imageWrapperMarginBottom: 0
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var skinProperties = displayerComp.getSkinProperties();
                    expect(skinProperties.image.props.containerWidth).toEqual(198);
                });

                it('containerHeight should be according to imageWrapper height, skin params, and margins', function () {
                    var displayerProps = createDisplayerProps({
                        skin: 'wysiwyg.viewer.skins.gallerymatrix.MatrixDisplayerCircleSkin',
                        imageWrapperSize: {
                            imageWrapperHeight: 200,
                            imageWrapperWidth: 150,
                            imageWrapperMarginLeft: 17,
                            imageWrapperMarginRight: 31,
                            imageWrapperMarginTop: 17,
                            imageWrapperMarginBottom: 13
                        },
                        theme: {
                            style: {
                                properties: {
                                    brw: 13
                                }
                            }
                        }
                    });
                    var displayerComp = createDisplayerComponent(displayerProps);

                    var skinProperties = displayerComp.getSkinProperties();
                    expect(skinProperties.image.props.containerHeight).toEqual(204);
                });

            });

        });

        describe('zoom part', function () {

            describe('style', function () {

                describe('disabled behaviour', function () {

                    it('should have a default cursor', function () {
                        var displayerComp = createDisplayerWithClickBehavior('disabled');

                        var displayerSkinProperties = displayerComp.getSkinProperties();
                        expect(displayerSkinProperties.zoom.style.cursor).toEqual('default');
                    });

                });

                describe('zoomeMode behaviour', function () {

                    it('should have a pointer cursor', function () {
                        var displayerComp = createDisplayerWithClickBehavior('zoomMode');

                        var displayerSkinProperties = displayerComp.getSkinProperties();
                        expect(displayerSkinProperties.zoom.style.cursor).toEqual('pointer');
                    });

                });

                describe('goToLink behaviour', function () {

                    describe('when link is defined', function () {

                        it('should have a pointer cursor', function () {
                            var displayerComp = createDisplayerWithClickBehavior('goToLink', {
                                compData: {
                                    link: 'someLink'
                                }
                            });

                            var displayerSkinProperties = displayerComp.getSkinProperties();
                            expect(displayerSkinProperties.zoom.style.cursor).toEqual('pointer');
                        });

                    });

                    describe('when link is not defined', function () {

                        it('should have a default cursor', function () {
                            var displayerComp = createDisplayerWithClickBehavior('goToLink');

                            var displayerSkinProperties = displayerComp.getSkinProperties();
                            expect(displayerSkinProperties.zoom.style.cursor).toEqual('default');
                        });

                    });

                });

                describe('undefined behavior', function () {

                    describe('when expandEnabled is true', function () {

                        it('should have a pointer cursor', function () {
                            var displayerComp = createDisplayerWithClickBehavior(null, {
                                compProp: {
                                    expandEnabled: true
                                }
                            });

                            var displayerSkinProperties = displayerComp.getSkinProperties();
                            expect(displayerSkinProperties.zoom.style.cursor).toEqual('pointer');
                        });

                    });

                    describe('when expandEnabled is false', function () {

                        it('should have a default cursor', function () {
                            var displayerComp = createDisplayerWithClickBehavior(null, {
                                compProp: {
                                    expandEnabled: false
                                }
                            });

                            var displayerSkinProperties = displayerComp.getSkinProperties();
                            expect(displayerSkinProperties.zoom.style.cursor).toEqual('default');
                        });

                    });

                });

            });

            describe('addChildBefore', function () {

                it('should add an A element', function () {
                    var displayerComp = createDisplayerWithClickBehavior('zoomMode');

                    var skinProperties = displayerComp.getSkinProperties();
                    expect(React.addons.TestUtils.isElementOfType(skinProperties.zoom.addChildBefore[0], 'a')).toBe(true);
                });

                it('should be added before link part', function () {
                    var displayerComp = createDisplayerWithClickBehavior('zoomMode');

                    var skinProperties = displayerComp.getSkinProperties();
                    expect(skinProperties.zoom.addChildBefore[1]).toEqual('link');
                });

                it('should render a zoom link if clickAction is "zoomMode"', function () {
                    var expectedLink = {
                        href: 'mockExternalBaseUrl#!untitled/zoom/currentPage/mockId',
                        target: '_self'
                    };
                    var displayerComp = createDisplayerWithClickBehavior('zoomMode', {
                        galleryDataId: 'galleryId0'
                    });
                    var skinProperties = displayerComp.getSkinProperties();

                    expect(skinProperties.zoom.addChildBefore[0].props.href).toEqual(expectedLink.href);
                    expect(skinProperties.zoom.addChildBefore[0].props.target).toEqual(expectedLink.target);
                });

                it('should render a link if clickAction is goToLink', function () {
                    var linkData = {
                        type: 'ExternalLink',
                        url: 'http://mockUrl.com',
                        target: '_blank'
                    };
                    var expectedLink = {
                        href: linkData.url,
                        target: linkData.target
                    };

                    var displayerComp = createDisplayerWithClickBehavior('goToLink', {
                        compData: {
                            link: linkData
                        }
                    });
                    var skinProperties = displayerComp.getSkinProperties();

                    expect(skinProperties.zoom.addChildBefore[0].props.href).toEqual(expectedLink.href);
                    expect(skinProperties.zoom.addChildBefore[0].props.target).toEqual(expectedLink.target);
                });

            });

        });
    });
});
