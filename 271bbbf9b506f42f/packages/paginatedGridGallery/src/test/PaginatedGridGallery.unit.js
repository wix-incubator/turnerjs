define(['lodash', 'react', 'reactDOM', 'core', 'testUtils', 'paginatedGridGallery'
], function (_, React, ReactDOM, core, /** testUtils */ testUtils, paginatedGridGallery) {
    'use strict';

    describe('animated Gallery spec', function () {

        beforeEach(function() {
            spyOn(core.compMixins.animationsMixin, 'sequence').and.callFake(testUtils.mockSequence);
        });

        function createImageData(overrideData) {
            return _.assign({
                type: 'Image',
                id: _.uniqueId('Image_'),
                link: {},
                title: 'My mock image title',
                description: 'My mock image description',
                uri: 'fb2cfede96be3d1ceebe8f3274af2433.jpg',
                width: 722,
                height: 1100,
                alt: 'My mock image alt',
                originalImageDataRef: null
            }, overrideData);
        }

        function createPaginatedGridGalleryComponent(props, node) {
            return testUtils.getComponentFromDefinition(paginatedGridGallery, props, node);
        }

        function createPaginatedGridGalleryProps(partialProps, siteData) {
            return testUtils.santaTypesBuilder.getComponentProps(paginatedGridGallery, _.assign({
                compProp: {
                    maxRows: 2,
                    numCols: 2,
                    margin: 106,
                    autoplay: true,
                    galleryImageOnClickAction: "zoomMode",
                    goToLinkText: "Go to link",
                    imageMode: "clipImage",
                    autoPlayDirection: "LTR",
                    expandEnabled: true,
                    transition: "seq_shrink_All"
                },
                compData: {
                    items: []
                },
                style: {
                    top: 100,
                    left: 100,
                    width: 100,
                    height: 100
                },
                skin: 'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridArrowsOutside'
            }, partialProps), siteData);
        }

        describe('autoplay', function () {

            describe('autoplay prop is false', function () {

                it('should be disabled when there are items in the gallery', function () {
                    var galleryProps = createPaginatedGridGalleryProps({
                        compProp: {
                            autoplay: false
                        },
                        compData: {
                            items: _.times(20, createImageData)
                        }
                    });
                    var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                    expect(galleryComp.state.shouldAutoPlay).toBe(false);
                    expect(galleryComp.state.$slideshow).toBe('autoplayOff');
                });

                it('should be disabled when there are NO items in the gallery', function () {
                    var galleryProps = createPaginatedGridGalleryProps({
                        compProp: {
                            autoplay: false
                        },
                        compData: {
                            items: []
                        }
                    });
                    var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                    expect(galleryComp.state.shouldAutoPlay).toBe(false);
                    expect(galleryComp.state.$slideshow).toBe('autoplayOff');
                });

            });

            describe('autoplay prop is true', function () {

                it('should be enabled when there are items in the gallery', function () {
                    var galleryProps = createPaginatedGridGalleryProps({
                        compProp: {
                            autoplay: true
                        },
                        compData: {
                            items: _.times(20, createImageData)
                        }
                    });
                    var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                    expect(galleryComp.state.shouldAutoPlay).toBe(true);
                    expect(galleryComp.state.$slideshow).toBe('autoplayOn');
                });

                it('should be disabled when there are NO items in the gallery', function () {
                    var galleryProps = createPaginatedGridGalleryProps({
                        compProp: {
                            autoplay: true
                        },
                        compData: {
                            items: []
                        }
                    });
                    var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                    expect(galleryComp.state.shouldAutoPlay).toBe(false);
                    expect(galleryComp.state.$slideshow).toBe('autoplayOff');
                });

            });

            describe('zoom mode', function () {

                describe('changing from zoom close to open', function () {

                    it('autoplay should be enabled but not active', function () {
                        var galleryProps = createPaginatedGridGalleryProps({
                            compProp: {
                                autoplay: true
                            },
                            compData: {
                                items: _.times(5, createImageData)
                            }
                        });
                        var containerNode = window.document.createElement('div');

                        createPaginatedGridGalleryComponent(galleryProps, containerNode);

                        var secondGalleryProps = _.assign({}, galleryProps, {
                            isZoomOpened: true
                        });
                        var galleryComp = createPaginatedGridGalleryComponent(secondGalleryProps, containerNode);

                        expect(galleryComp.state.shouldAutoPlay).toBe(true);
                        expect(galleryComp.state.$slideshow).toBe('autoplayOff');
                    });

                });

                describe('changing from zoom open to close', function () {

                    it('autoplay should be enabled and active', function () {
                        var galleryProps = createPaginatedGridGalleryProps({
                            compProp: {
                                autoplay: true
                            },
                            compData: {
                                items: _.times(5, createImageData)
                            },
                            isZoomOpened: true
                        });
                        var containerNode = window.document.createElement('div');

                        createPaginatedGridGalleryComponent(galleryProps, containerNode);

                        var secondGalleryProps = _.assign({}, galleryProps, {
                            isZoomOpened: false
                        });
                        var galleryComp = createPaginatedGridGalleryComponent(secondGalleryProps, containerNode);

                        expect(galleryComp.state.shouldAutoPlay).toBe(true);
                        expect(galleryComp.state.$slideshow).toBe('autoplayOn');
                    });

                });

            });

        });

        describe('items container part', function () {

            it('should render all images', function () {
                var galleryProps = createPaginatedGridGalleryProps({
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: _.times(4, createImageData)
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                var skinProperties = galleryComp.getSkinProperties();

                expect(skinProperties.itemsContainer.children.length).toEqual(4);
            });

            describe('additional images for next and previous pages', function () {

                it('should render full next and previous pages', function () {
                    var galleryProps = createPaginatedGridGalleryProps({
                        compProp: {
                            maxRows: 3,
                            numCols: 2
                        },
                        compData: {
                            items: _.times(24, createImageData)
                        }
                    });
                    var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                    var skinProperties = galleryComp.getSkinProperties();

                    expect(skinProperties.itemsContainer.children.length).toEqual(18);
                });

                it('should render partial previous page', function () {
                    var galleryProps = createPaginatedGridGalleryProps({
                        compProp: {
                            maxRows: 3,
                            numCols: 2
                        },
                        compData: {
                            items: _.times(22, createImageData)
                        }
                    });
                    var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                    var skinProperties = galleryComp.getSkinProperties();

                    expect(skinProperties.itemsContainer.children.length).toEqual(16);
                });

            });

            describe('show-counter css class', function () {

                it('should not have show-counter css class when showCounter and ShowNavigation are false', function () {
                    var galleryProps = createPaginatedGridGalleryProps({
                        styleId: 's17',
                        compData: {
                            items: _.times(4, createImageData)
                        },
                        compProp: {
                            showCounter: false,
                            showNavigation: false
                        }
                    });
                    var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                    var skinProperties = galleryComp.getSkinProperties();

                    expect(skinProperties.itemsContainer.className).toEqual('');
                });

                it('should have show-counter css class when showCounter is true and ShowNavigation is false', function () {
                    var galleryProps = createPaginatedGridGalleryProps({
                        styleId: 's17',
                        compData: {
                            items: _.times(4, createImageData)
                        },
                        compProp: {
                            showCounter: true,
                            showNavigation: false
                        }
                    });
                    var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                    var skinProperties = galleryComp.getSkinProperties();

                    expect(skinProperties.itemsContainer.className).toEqual('s17_show-counter');
                });

                it('should have show-counter css class when showCounter is false and ShowNavigation is true', function () {
                    var galleryProps = createPaginatedGridGalleryProps({
                        styleId: 's17',
                        compData: {
                            items: _.times(20, createImageData)
                        },
                        compProp: {
                            showCounter: false,
                            showNavigation: true
                        }
                    });
                    var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                    var skinProperties = galleryComp.getSkinProperties();

                    expect(skinProperties.itemsContainer.className).toEqual('s17_show-counter');
                });

                it('should have show-counter css class when showCounter and ShowNavigation are true', function () {
                    var galleryProps = createPaginatedGridGalleryProps({
                        styleId: 's17',
                        compData: {
                            items: _.times(4, createImageData)
                        },
                        compProp: {
                            showCounter: true,
                            showNavigation: true
                        }
                    });
                    var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                    var skinProperties = galleryComp.getSkinProperties();

                    expect(skinProperties.itemsContainer.className).toEqual('s17_show-counter');
                });

            });

        });

        describe('counter part', function () {

            it('should render 1/1 for a single page', function () {
                var galleryProps = createPaginatedGridGalleryProps({
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: _.times(4, createImageData)
                    }
                });

                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                var skinProperties = galleryComp.getSkinProperties();

                expect(skinProperties.counter.children).toEqual('1/1');
            });

            it('should render 1/4 for a 4 pages gallery', function () {
                var galleryProps = createPaginatedGridGalleryProps({
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: _.times(22, createImageData)
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                var skinProperties = galleryComp.getSkinProperties();

                expect(skinProperties.counter.children).toEqual('1/4');
            });

            it('should render 2/4 when navigating forward to the second page', function () {
                var galleryProps = createPaginatedGridGalleryProps({
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: _.times(22, createImageData)
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                React.addons.TestUtils.Simulate.click(galleryComp.refs.buttonNext);

                var skinProperties = galleryComp.getSkinProperties();

                expect(skinProperties.counter.children).toEqual('2/4');
            });

            it('should render 4/4 when navigating backwards to the last page', function () {
                var galleryProps = createPaginatedGridGalleryProps({
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: _.times(22, createImageData)
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                React.addons.TestUtils.Simulate.click(galleryComp.refs.buttonPrev);

                var skinProperties = galleryComp.getSkinProperties();

                expect(skinProperties.counter.children).toEqual('4/4');
            });

        });

        describe('title part', function () {

            it('should be an empty string', function () {
                var galleryProps = createPaginatedGridGalleryProps({
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: _.times(4, createImageData)
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                var skinProperties = galleryComp.getSkinProperties();

                expect(skinProperties.title.children).toEqual('');
            });

            it('should be the hovered image title', function () {
                var images = _.times(4, createImageData);
                images[2] = createImageData({title: 'Spider Pig Does!'});

                var galleryProps = createPaginatedGridGalleryProps({
                    id: 'galleryId',
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: images
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                React.addons.TestUtils.Simulate.mouseEnter(ReactDOM.findDOMNode(galleryComp.refs.galleryId02));
                var skinProperties = galleryComp.getSkinProperties();
                expect(skinProperties.title.children).toEqual('Spider Pig Does!');
            });

            it('should return to an empty string on image hover-out', function () {
                var images = _.times(4, createImageData);
                images[2] = createImageData({title: 'Spider Pig Does!'});

                var galleryProps = createPaginatedGridGalleryProps({
                    id: 'galleryId',
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: images
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                React.addons.TestUtils.Simulate.mouseEnter(ReactDOM.findDOMNode(galleryComp.refs.galleryId02));

                var skinProperties = galleryComp.getSkinProperties();
                expect(skinProperties.title.children).toEqual('Spider Pig Does!');

                React.addons.TestUtils.Simulate.mouseLeave(ReactDOM.findDOMNode(galleryComp));

                skinProperties = galleryComp.getSkinProperties();
                expect(skinProperties.title.children).toEqual('');
            });

        });

        describe('description part', function () {

            it('should be an empty string', function () {
                var galleryProps = createPaginatedGridGalleryProps({
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: _.times(4, createImageData)
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                var skinProperties = galleryComp.getSkinProperties();

                expect(skinProperties.description.children).toEqual('');
            });

            it('should be the hovered image description', function () {
                var images = _.times(4, createImageData);
                images[2] = createImageData({description: 'Can he swing from a web?'});

                var galleryProps = createPaginatedGridGalleryProps({
                    id: 'galleryId',
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: images
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                React.addons.TestUtils.Simulate.mouseEnter(ReactDOM.findDOMNode(galleryComp.refs.galleryId02));
                var skinProperties = galleryComp.getSkinProperties();
                expect(skinProperties.description.children).toEqual('Can he swing from a web?');
            });

            it('should return to an empty string on image hover-out', function () {
                var images = _.times(4, createImageData);
                images[2] = createImageData({description: 'Can he swing from a web?'});

                var galleryProps = createPaginatedGridGalleryProps({
                    id: 'galleryId',
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: images
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                React.addons.TestUtils.Simulate.mouseEnter(ReactDOM.findDOMNode(galleryComp.refs.galleryId02));

                var skinProperties = galleryComp.getSkinProperties();
                expect(skinProperties.description.children).toEqual('Can he swing from a web?');

                React.addons.TestUtils.Simulate.mouseLeave(ReactDOM.findDOMNode(galleryComp));

                skinProperties = galleryComp.getSkinProperties();
                expect(skinProperties.description.children).toEqual('');
            });

        });

        describe('link part', function () {

            it('should have no link', function () {
                var galleryProps = createPaginatedGridGalleryProps({
                    id: 'galleryId',
                    compProp: {
                        maxRows: 3,
                        numCols: 2
                    },
                    compData: {
                        items: _.times(4, createImageData)
                    }
                });

                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                var skinProperties = galleryComp.getSkinProperties();
                expect(skinProperties.link).not.toBeDefined();
            });

            it('should have a goToLink text', function (done) {
                var images = _.times(4, createImageData);
                images[2] = createImageData({link: testUtils.mockFactory.dataMocks.externalLinkData()});

                var galleryProps = createPaginatedGridGalleryProps({
                    id: 'galleryId',
                    compProp: {
                        maxRows: 3,
                        numCols: 2,
                        goToLinkText: 'DOES WHATEVER SPIDER PIG DOES'
                    },
                    compData: {
                        items: images
                    }
                });

                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);

                galleryComp.setState({
                    hoveredImage: galleryComp.refs.galleryId02
                }, function () {
                    var skinProperties = galleryComp.getSkinProperties();
                    expect(skinProperties.link.children).toEqual('DOES WHATEVER SPIDER PIG DOES');
                    done();
                });
            });

        });

        describe('behaviors', function () {

            it('should move to the next page when executing nextSlide behavior', function (done) {
                var galleryProps = createPaginatedGridGalleryProps({
                    compProp: {
                        maxRows: 3,
                        numCols: 2,
                        transition: "seq_shrink_All"
                    },
                    compData: {
                        items: _.times(22, createImageData)
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);
                var nextSlideBehavior = paginatedGridGallery.statics.behaviors.nextSlide;
                var currentIndex = galleryComp.state.currentIndex;
                var pageSize = galleryProps.compProp.numCols * galleryProps.compProp.maxRows;

                var onBehaviorDone = function () {
                    expect(galleryComp.state.currentIndex).toEqual(currentIndex + pageSize);
                    done();
                };

                galleryComp[nextSlideBehavior.methodName](onBehaviorDone);
            });

            it('should move to the next page when executing prevSlide behavior', function (done) {
                var galleryProps = createPaginatedGridGalleryProps({
                    compProp: {
                        maxRows: 3,
                        numCols: 2,
                        transition: "seq_shrink_All"
                    },
                    compData: {
                        items: _.times(22, createImageData)
                    }
                });
                var galleryComp = createPaginatedGridGalleryComponent(galleryProps);
                var prevSlideBehavior = paginatedGridGallery.statics.behaviors.prevSlide;
                var pageSize = galleryProps.compProp.numCols * galleryProps.compProp.maxRows;

                galleryComp.setState({
                    currentIndex: pageSize + 1
                }, function() {
                    var onBehaviorDone = function () {
                        expect(galleryComp.state.currentIndex).toEqual(1);
                        done();
                    };

                    galleryComp[prevSlideBehavior.methodName](onBehaviorDone);
                });
            });

        });

        describe('public state', function () {
            var paginatedGridGalleryClass = React.createClass(paginatedGridGallery);

            it('should create default public state', function () {
	            var publicState = paginatedGridGalleryClass.publicState();
                expect(publicState).toEqual({currentIndex: 0});
            });

            it('should get the public state according to the component state', function () {
	            var state = {currentIndex: 4};
	            var publicState = paginatedGridGalleryClass.publicState(state);
                expect(publicState).toEqual(state);
            });
        });
    });
});
