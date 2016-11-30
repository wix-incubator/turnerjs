define(['lodash', 'react', 'reactDOM', 'testUtils', 'wPhoto'], function(_, React, ReactDOM, testUtils, wPhoto) {
    'use strict';

    describe('wPhoto spec', function () {

        function createWPhotoComponent(props, targetNode) {
            return testUtils.getComponentFromDefinition(wPhoto, props, targetNode);
        }

        function createWPhotoProps(partialProps, siteData) {
            return testUtils.santaTypesBuilder.getComponentProps(wPhoto, _.merge({
                compData: {
                    uri: 'http://images/myImage.png',
                    title: 'BEST TITLE EVER',
                    width: 50,
                    height: 70
                },
                compProp: {},
                skin: 'wysiwyg.viewer.skins.photo.IronPhoto'
            }, partialProps), siteData);
        }

        function createCompWithClickBehavior(clickBehavior, props) {
            var wPhotoProps = createWPhotoProps(_.merge({
                compProp: {
                    displayMode: 'full',
                    onClickBehavior: clickBehavior
                }
            }, props));
            return createWPhotoComponent(wPhotoProps);
        }

        describe('wrapper div', function () {

            it('title is rendered', function () {
                var wPhotoProps = createWPhotoProps({
                    compData: {
                        title: 'DOES WHATEVER SPIDER PIG DOES'
                    },
                    compProp: {
                        displayMode: 'full',
                        onClickBehavior: 'disabled'
                    }
                });
                var wPhotoComp = createWPhotoComponent(wPhotoProps);

                var skinProperties = wPhotoComp.getSkinProperties();
                expect(skinProperties[''].title).toEqual('DOES WHATEVER SPIDER PIG DOES');
            });

            it('content padding is rendered', function () {
                var wPhotoProps = createWPhotoProps({
                    theme: {
                        style: {
                            properties: {
                                contentPaddingLeft: 10,
                                contentPaddingRight: 4,
                                contentPaddingTop: 10,
                                contentPaddingBottom: 2
                            }
                        }
                    }
                });
                var wPhotoComp = createWPhotoComponent(wPhotoProps);

                var skinProperties = wPhotoComp.getSkinProperties();
                expect(skinProperties['']['data-content-padding-horizontal']).toEqual(14);
                expect(skinProperties['']['data-content-padding-vertical']).toEqual(12);
            });

            describe('size', function() {

                describe('default display mode', function() {

                    it('should have a dimensions of component size without display mode', function () {
                        var wPhotoProps = createWPhotoProps({
                            style: {
                                width: 180,
                                height: 220
                            }
                        });
                        var wPhotoComp = createWPhotoComponent(wPhotoProps);

                        var skinProperties = wPhotoComp.getSkinProperties();
                        expect(skinProperties[''].style.width).toEqual(180);
                        expect(skinProperties[''].style.height).toEqual(220);
                    });

                });

                describe('display mode that changes div dimensions', function() {

                    describe('fitWidth', function() {

                        it('should not change the component width', function() {
                            var wPhotoProps = createWPhotoProps({
                                compData: {
                                    width: 100,
                                    height: 100
                                },
                                style: {
                                    width: 180,
                                    height: 220
                                },
                                theme: {
                                    style: {
                                        properties: {
                                            contentPaddingLeft: 10,
                                            contentPaddingRight: 4,
                                            contentPaddingTop: 10,
                                            contentPaddingBottom: 2
                                        }
                                    }
                                },
                                compProp: {
                                    displayMode: 'fitWidth',
                                    onClickBehavior: 'disabled'
                                }
                            });
                            var wPhotoComp = createWPhotoComponent(wPhotoProps);

                            var skinProperties = wPhotoComp.getSkinProperties();
                            expect(skinProperties[''].style.width).toEqual(180);
                        });

                        it('should have a height of (comp width - horizontal padding) + vertical padding', function() {
                            var wPhotoProps = createWPhotoProps({
                                compData: {
                                    width: 100,
                                    height: 100
                                },
                                style: {
                                    width: 180,
                                    height: 220
                                },
                                theme: {
                                    style: {
                                        properties: {
                                            contentPaddingLeft: 10,
                                            contentPaddingRight: 4,
                                            contentPaddingTop: 10,
                                            contentPaddingBottom: 2
                                        }
                                    }
                                },
                                compProp: {
                                    displayMode: 'fitWidth',
                                    onClickBehavior: 'disabled'
                                }
                            });
                            var wPhotoComp = createWPhotoComponent(wPhotoProps);

                            var skinProperties = wPhotoComp.getSkinProperties();
                            expect(skinProperties[''].style.height).toEqual(178);
                        });
                    });

                    describe('fitHeight', function() {

                        it('should not change the component height', function() {
                            var wPhotoProps = createWPhotoProps({
                                compData: {
                                    width: 100,
                                    height: 100
                                },
                                style: {
                                    width: 180,
                                    height: 220
                                },
                                theme: {
                                    style: {
                                        properties: {
                                            contentPaddingLeft: 10,
                                            contentPaddingRight: 4,
                                            contentPaddingTop: 10,
                                            contentPaddingBottom: 2
                                        }
                                    }
                                },
                                compProp: {
                                    displayMode: 'fitHeight',
                                    onClickBehavior: 'disabled'
                                }
                            });
                            var wPhotoComp = createWPhotoComponent(wPhotoProps);

                            var skinProperties = wPhotoComp.getSkinProperties();
                            expect(skinProperties[''].style.height).toEqual(220);
                        });

                        it('should have a width of (comp height - vertical padding) + horizontal padding', function() {
                            var wPhotoProps = createWPhotoProps({
                                compData: {
                                    width: 100,
                                    height: 100
                                },
                                style: {
                                    width: 180,
                                    height: 220
                                },
                                theme: {
                                    style: {
                                        properties: {
                                            contentPaddingLeft: 10,
                                            contentPaddingRight: 4,
                                            contentPaddingTop: 10,
                                            contentPaddingBottom: 2
                                        }
                                    }
                                },
                                compProp: {
                                    displayMode: 'fitHeight',
                                    onClickBehavior: 'disabled'
                                }
                            });
                            var wPhotoComp = createWPhotoComponent(wPhotoProps);

                            var skinProperties = wPhotoComp.getSkinProperties();
                            expect(skinProperties[''].style.width).toEqual(222);
                        });
                    });

                });

            });

        });

        describe('linkPart', function () {

            it('should have a dimensions of size - padding', function () {
                var wPhotoComp = createCompWithClickBehavior('disabled', {
                    style: {
                        width: 180,
                        height: 220
                    },
                    theme: {
                        style: {
                            properties: {
                                contentPaddingLeft: 10,
                                contentPaddingRight: 4,
                                contentPaddingTop: 10,
                                contentPaddingBottom: 2
                            }
                        }
                    }
                });

                var skinProperties = wPhotoComp.getSkinProperties();
                expect(skinProperties.link.style.width).toEqual(166);
                expect(skinProperties.link.style.height).toEqual(208);
            });

            describe('disabled click behaviour', function() {

                describe('with link', function() {

                    it('should not have a "cursor" cursor', function () {
                        var wPhotoComp = createCompWithClickBehavior('disabled', {
                            compData: {
                                link: {
                                    id: 'linkId',
                                    type: 'ExternalLink',
                                    url: 'linkUrl',
                                    target: '_blank'
                                }
                            }
                        });

                        var skinProperties = wPhotoComp.getSkinProperties();
                        expect(skinProperties.link.style.cursor).not.toEqual('cursor');
                    });

                    it('should have a div as a parentConst', function () {
                        var wPhotoComp = createCompWithClickBehavior('disabled', {
                                compData: {
                                    link: {
                                        id: 'linkId',
                                        type: 'ExternalLink',
                                        url: 'linkUrl',
                                        target: '_blank'
                                    }
                                }
                        });

                        var skinProperties = wPhotoComp.getSkinProperties();
                        expect(skinProperties.link.parentConst).toEqual(React.DOM.div);
                    });

                });

                describe('with NO link', function() {

                    it('should not have a "cursor" cursor', function () {
                        var wPhotoComp = createCompWithClickBehavior('disabled');

                        var skinProperties = wPhotoComp.getSkinProperties();
                        expect(skinProperties.link.style.cursor).not.toEqual('cursor');
                    });

                    it('should have a div as a parentConst', function () {
                        var wPhotoComp = createCompWithClickBehavior('disabled');

                        var skinProperties = wPhotoComp.getSkinProperties();
                        expect(skinProperties.link.parentConst).toEqual(React.DOM.div);
                    });

                });

            });

            describe('goToLink click behaviour', function() {

                it('should have a "pointer" cursor', function () {
                    var wPhotoComp = createCompWithClickBehavior('goToLink');

                    var skinProperties = wPhotoComp.getSkinProperties();
                    expect(skinProperties.link.style.cursor).not.toEqual('pointer');
                });

                it('should render link according to data', function () {
                    var wPhotoProps = createWPhotoProps({
                        compData: {
                            link: testUtils.mockFactory.dataMocks.externalLinkData({
                                url: 'http://spider.pig',
                                target: '_self'
                            })
                        }
                    });

                    var wPhotoComp = createCompWithClickBehavior('goToLink', wPhotoProps);

                    var skinProperties = wPhotoComp.getSkinProperties();
                    expect(skinProperties.link.target).toEqual('_self');
                    expect(skinProperties.link.href).toEqual('http://spider.pig');
                });

            });

            describe('zoomMode click behaviour', function() {

                it('should have a "pointer" cursor', function () {
                    var wPhotoComp = createCompWithClickBehavior('zoomMode');

                    var skinProperties = wPhotoComp.getSkinProperties();
                    expect(skinProperties.link.style.cursor).toEqual('pointer');
                });

                it('should render link according to data', function () {
                    var mockSiteData = testUtils.mockFactory.mockSiteData({
                        publicModel: {
                            externalBaseUrl: 'http://no.he/cant'
                        }
                    });
                    var wPhotoProps = createWPhotoProps({
                        compData: {
                            id: 'imageDataId1',
                            title: 'HE\'S A PIG',
                            link: testUtils.mockFactory.dataMocks.externalLinkData({
                                url: 'http://can.he.swing',
                                target: '_blank'
                            })
                        },
                        structure: {
                            propertyQuery: '#propertyQuery'
                        },
                        rootNavigationInfo: {
                            pageId: 'currentPage'
                        }
                    }, mockSiteData);

                    var wPhotoComp = createCompWithClickBehavior('zoomMode', wPhotoProps);

                    var skinProperties = wPhotoComp.getSkinProperties();
                    expect(skinProperties.link.target).toEqual('_self');
                    expect(skinProperties.link.href).toEqual('http://no.he/cant#!HE\'S A PIG/zoom/currentPage/imageDataId1');
                });

            });

            describe('no onClickBehavior provided (old wPhotoProperties)', function() {

                describe('with link', function() {

                    it('should have a "pointer" cursor', function () {
                        var wPhotoComp = createCompWithClickBehavior();

                        var skinProperties = wPhotoComp.getSkinProperties();
                        expect(skinProperties.link.style.cursor).not.toEqual('pointer');
                    });

                    it('should render link according to data', function () {
                        var wPhotoProps = createWPhotoProps({
                            compData: {
                                link: testUtils.mockFactory.dataMocks.externalLinkData({
                                    url: 'http://does.whatever',
                                    target: '_blank'
                                })
                            }
                        });

                        var wPhotoComp = createCompWithClickBehavior(null, wPhotoProps);

                        var skinProperties = wPhotoComp.getSkinProperties();
                        expect(skinProperties.link.target).toEqual('_blank');
                        expect(skinProperties.link.href).toEqual('http://does.whatever');
                    });

                });

                describe('with NO link', function() {

                    it('should not have a "cursor" cursor', function () {
                        var wPhotoComp = createCompWithClickBehavior();

                        var skinProperties = wPhotoComp.getSkinProperties();
                        expect(skinProperties.link.style.cursor).not.toEqual('cursor');
                    });

                    it('should have a div as a parentConst', function () {
                        var wPhotoComp = createCompWithClickBehavior();

                        var skinProperties = wPhotoComp.getSkinProperties();
                        expect(skinProperties.link.parentConst).toEqual(React.DOM.div);
                    });

                });

            });

        });

        describe('image', function () {

            describe('zoomAndPan click behavior', function () {

                describe('default isInZoom state', function() {

                    it('should have a isInZoom=false', function() {
                        var wPhotoComp = createCompWithClickBehavior('zoomAndPanMode', {
                            compData: {
                                width: 1000,
                                height: 1000
                            },
                            styleId: 'styleId'
                        });

                        expect(wPhotoComp.state.isInZoom).toBe(false);
                    });

                    it('should  have zoomedout class', function () {
                        var wPhotoComp = createCompWithClickBehavior('zoomAndPanMode', {
                            compData: {
                                width: 1000,
                                height: 1000
                            },
                            styleId: 'styleId'
                        });

                        var imageClassList = _.toArray(ReactDOM.findDOMNode(wPhotoComp.refs.img).classList);
                        expect(imageClassList).toContain('styleId_zoomedout');
                    });

                    it('should NOT have zoomedin class', function () {
                        var wPhotoComp = createCompWithClickBehavior('zoomAndPanMode', {
                            compData: {
                                width: 1000,
                                height: 1000
                            },
                            styleId: 'styleId'
                        });

                        var imageClassList = _.toArray(ReactDOM.findDOMNode(wPhotoComp.refs.img).classList);
                        expect(imageClassList).not.toContain('styleId_zoomedin');
                    });
                });

                describe('when changing from zoom OUT to zoom IN state', function() {

                    it('should have a zoomedin class', function (done) {
                        var wPhotoComp = createCompWithClickBehavior('zoomAndPanMode', {
                            compData: {
                                width: 1000,
                                height: 1000
                            },
                            styleId: 'styleId'
                        });

                        wPhotoComp.setState({isInZoom: true}, function() {
                                var imageClassList = _.toArray(ReactDOM.findDOMNode(wPhotoComp.refs.img).classList);
                                expect(imageClassList).toContain('styleId_zoomedin');
                                done();

                        });
                    });

                });

                describe('when changing from zoom IN to zoom OUT state', function() {

                    it('should have a zoomedout class', function (done) {
                        var wPhotoComp = createCompWithClickBehavior('zoomAndPanMode', {
                            compData: {
                                width: 1000,
                                height: 1000
                            },
                            styleId: 'styleId'
                        });

                        wPhotoComp.setState({isInZoom: false}, function() {
                            var imageClassList = _.toArray(ReactDOM.findDOMNode(wPhotoComp.refs.img).classList);
                            expect(imageClassList).toContain('styleId_zoomedout');
                            done();
                        });
                    });

                });

            });

        });
    });
});
