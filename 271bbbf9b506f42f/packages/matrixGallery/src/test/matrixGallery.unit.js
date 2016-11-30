define(['siteUtils', 'lodash', 'testUtils', 'react', 'matrixGallery'],
    function (siteUtils, _, /**testUtils */ testUtils, React, matrixGallery) {
        'use strict';

        function createImageData() {
            return {
                type: 'Image',
                id: _.uniqueId('Image_'),
                link: null,
                title: 'My mock image title',
                description: 'My mock image description',
                uri: 'fb2cfede96be3d1ceebe8f3274af2433.jpg',
                width: 722,
                height: 1100,
                alt: 'My mock image alt',
                originalImageDataRef: null
            };
        }

        function createMatrixGalleryComponent(props, node) {
            return testUtils.componentBuilder('wysiwyg.viewer.components.MatrixGallery', props, node);
        }

        function createMatrixGalleryProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(matrixGallery, _.assign({
                compData: {
                    items: []
                },
                compProp: {},
                style: {
                    width: 500,
                    height: 500
                },
                skin: 'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryDefaultSkin',
                compTheme: {
                    style: {
                        properties: {}
                    }
                }
            }, partialProps));
        }

        describe('matrixGallery spec', function () {

            beforeEach(function () {
                var originalGetCompClass = siteUtils.compFactory.getCompClass;
                spyOn(siteUtils.compFactory, 'getCompClass').and.callFake(function (compName) {
                    if (compName === 'wysiwyg.viewer.components.MatrixGallery') {
                        return originalGetCompClass(compName);
                    }
                    return (React.createFactory(React.createClass({
                            displayName: 'customDiv',
                            render: function () {
                                return React.createElement('div');
                            }
                        })));
                });
            });

            describe('component root', function () {

                it('should have the gallery height', function () {
                    var matrixGalleryProps = createMatrixGalleryProps({
                        style: {
                            height: 180
                        },
                        compData: {
                            items: _.times(5, createImageData)
                        },
                        compProp: {
                            maxRows: 5,
                            numCols: 3
                        }
                    });

                    var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);
                    var skinProperties = matrixGalleryComp.getSkinProperties();

                    expect(skinProperties[''].style.height).toEqual(180);
                });

                describe('data-presented-row data node', function () {

                    it('should be the numbers of rows required', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            compData: {
                                items: _.times(5, createImageData)
                            },
                            compProp: {
                                maxRows: 5,
                                numCols: 3
                            }
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);
                        var skinProperties = matrixGalleryComp.getSkinProperties();

                        expect(skinProperties['']['data-presented-row']).toEqual(2);
                    });

                    it('should be the maximum available rows', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            compData: {
                                items: _.times(20, createImageData)
                            },
                            compProp: {
                                maxRows: 5,
                                numCols: 3
                            }
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);
                        var skinProperties = matrixGalleryComp.getSkinProperties();

                        expect(skinProperties['']['data-presented-row']).toEqual(5);
                    });
                });

                describe('data-height-diff data node', function () {

                    it('should be according to the skin exports', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            skin: 'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryTextSlideUpSkin'
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);
                        var skinProperties = matrixGalleryComp.getSkinProperties();

                        expect(skinProperties['']['data-height-diff']).toEqual(25);
                    });

                    it('should be default 0', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            skin: 'wysiwyg.viewer.skins.gallery.PolaroidMatrixGallery'
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);
                        var skinProperties = matrixGalleryComp.getSkinProperties();

                        expect(skinProperties['']['data-height-diff']).toEqual(0);
                    });
                });

                describe('data-width-diff data node', function () {

                    it('should be default 0', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            skin: 'wysiwyg.viewer.skins.gallerymatrix.TextBottomCustomHeightSkin'
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);
                        var skinProperties = matrixGalleryComp.getSkinProperties();

                        expect(skinProperties['']['data-width-diff']).toEqual(0);
                    });
                });

            });

            describe('itemsContainer part', function () {

                it('should render a displayer for each image', function () {
                    var matrixGalleryProps = createMatrixGalleryProps({
                        compData: {
                            items: _.times(5, createImageData)
                        },
                        compProp: {
                            maxRows: 5,
                            numCols: 3
                        }
                    });

                    var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);
                    var skinProperties = matrixGalleryComp.getSkinProperties();

                    expect(skinProperties.itemsContainer.children.length).toEqual(5);
                });

                it('should render the maximum amount of displayer that fit the grid', function () {
                    var matrixGalleryProps = createMatrixGalleryProps({
                        compData: {
                            items: _.times(20, createImageData)
                        },
                        compProp: {
                            maxRows: 5,
                            numCols: 3
                        }
                    });

                    var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);
                    var skinProperties = matrixGalleryComp.getSkinProperties();

                    expect(skinProperties.itemsContainer.children.length).toEqual(15);
                });

                it('should pass imageData to the displayers', function () {
                    var matrixGalleryProps = createMatrixGalleryProps({
                        compData: {
                            items: _.times(5, createImageData)
                        },
                        compProp: {
                            maxRows: 5,
                            numCols: 3
                        }
                    });

                    var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);
                    var skinProperties = matrixGalleryComp.getSkinProperties();

                    _.forEach(skinProperties.itemsContainer.children, function (displayerComp, i) {
                        expect(displayerComp.props.compData).toEqual(matrixGalleryProps.compData.items[i]);
                    });
                });

                it('should have the gallery height', function () {
                    var matrixGalleryProps = createMatrixGalleryProps({
                        style: {
                            height: 180
                        },
                        compData: {
                            items: _.times(5, createImageData)
                        },
                        compProp: {
                            maxRows: 5,
                            numCols: 3
                        }
                    });

                    var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);
                    var skinProperties = matrixGalleryComp.getSkinProperties();

                    expect(skinProperties.itemsContainer.style.height).toEqual(180);
                });

            });

            describe('showMore part', function () {

                it('should have a label according to compProp', function () {
                    var matrixGalleryProps = createMatrixGalleryProps({
                        compProp: {
                            showMoreLabel: 'SPIDER PIG'
                        }
                    });

                    var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                    var skinProperties = matrixGalleryComp.getSkinProperties();
                    expect(skinProperties.showMore.children).toEqual('SPIDER PIG');
                });

                it('should be visible if there are hidden items', function () {
                    var matrixGalleryProps = createMatrixGalleryProps({
                        compData: {
                            items: _.times(20, createImageData)
                        },
                        compProp: {
                            maxRows: 5,
                            numCols: 3
                        }
                    });

                    var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                    expect(matrixGalleryComp.state.$state).toEqual('hiddenChildren');
                });

                it('should NOT be visible if all items fit the grid', function () {
                    var matrixGalleryProps = createMatrixGalleryProps({
                        compData: {
                            items: _.times(5, createImageData)
                        },
                        compProp: {
                            maxRows: 5,
                            numCols: 3
                        }
                    });

                    var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                    expect(matrixGalleryComp.state.$state).toEqual('fullView');
                });

                describe('showing more - and there are additional available images', function () {

                    it('should be visible', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            compData: {
                                items: _.times(20, createImageData)
                            },
                            compProp: {
                                maxRows: 5,
                                numCols: 3,
                                incRows: 1
                            }
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                        React.addons.TestUtils.Simulate.click(matrixGalleryComp.refs.showMore);

                        expect(matrixGalleryComp.state.$state).toEqual('hiddenChildren');
                    });

                    it('should additionally render the images that was added to the grid', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            compData: {
                                items: _.times(20, createImageData)
                            },
                            compProp: {
                                maxRows: 5,
                                numCols: 3,
                                incRows: 1
                            }
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                        React.addons.TestUtils.Simulate.click(matrixGalleryComp.refs.showMore);

                        var skinProperties = matrixGalleryComp.getSkinProperties();
                        expect(skinProperties.itemsContainer.children.length).toEqual(18);
                    });

                });

                describe('showing more - no additional images', function () {

                    it('should NOT be visible', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            compData: {
                                items: _.times(17, createImageData)
                            },
                            compProp: {
                                maxRows: 5,
                                numCols: 3,
                                incRows: 1
                            }
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                        React.addons.TestUtils.Simulate.click(matrixGalleryComp.refs.showMore);

                        expect(matrixGalleryComp.state.$state).toEqual('fullView');
                    });

                    it('should additionally render the images that was added to the grid', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            compData: {
                                items: _.times(17, createImageData)
                            },
                            compProp: {
                                maxRows: 5,
                                numCols: 3,
                                incRows: 1
                            }
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                        React.addons.TestUtils.Simulate.click(matrixGalleryComp.refs.showMore);

                        var skinProperties = matrixGalleryComp.getSkinProperties();
                        expect(skinProperties.itemsContainer.children.length).toEqual(17);
                    });

                });

            });

            describe('mobile devices', function () {

                describe('$mobile css state', function () {

                    it('should only have mobile class in mobile device', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            isMobileDevice: true
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                        expect(matrixGalleryComp.state.$mobile).toEqual('mobile');
                    });

                    it('should only have mobile in tablet device', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            isTabletDevice: true
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                        expect(matrixGalleryComp.state.$mobile).toEqual('mobile');
                    });

                    it('should only have notMobile class', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            isMobileDevice: false,
                            isTabletDevice: false
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                        expect(matrixGalleryComp.state.$mobile).toEqual('notMobile');
                    });

                });

                describe('$displayDevice css state', function () {

                    it('should be mobileView in mobile view', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            isMobileView: true
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                        expect(matrixGalleryComp.state.$displayDevice).toEqual('mobileView');
                    });

                    it('should be desktopView', function () {
                        var matrixGalleryProps = createMatrixGalleryProps({
                            isMobileView: false
                        });

                        var matrixGalleryComp = createMatrixGalleryComponent(matrixGalleryProps);

                        expect(matrixGalleryComp.state.$displayDevice).toEqual('desktopView');
                    });

                });

            });

        });

    });
