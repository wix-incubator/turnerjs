define(['lodash', 'react', 'testUtils', 'galleriesCommon/mixins/galleryAutoPlayMixin'], function (_, React, testUtils, galleryAutoPlayMixin) {
    'use strict';

    describe('galleryAutoPlayMixin spec', function () {

        function createCompWithMixin(overrideProps) {
            var props = _.assign({
                useSantaTypes: true,
                structure: {},
                compProp: {},
                compData: {},
                isZoomOpened: false,
                id: _.uniqueId('compWithMixin_'),
                isPlayingAllowed: true
            }, overrideProps);

            var compDef = {
                displayName: 'compWithMixin',
                mixins: [galleryAutoPlayMixin],
                render: function () { //eslint-disable-line react/display-name
                    return React.createElement('div');
                }
            };

            return testUtils.getComponentFromDefinition(compDef, props);
        }

        describe('component state', function() {

            describe('shouldAutoPlay', function() {

                it('should be false with NO items and autoplay props is false', function () {
                    var compWithMixin = createCompWithMixin({
                        compProp: {
                            autoplay: false
                        },
                        compData: {
                            items: []
                        }
                    });

                    expect(compWithMixin.state.shouldAutoPlay).toBe(false);
                });

                it('should be false with items and autoplay props is false', function () {
                    var compWithMixin = createCompWithMixin({
                        compProp: {
                            autoplay: false
                        },
                        compData: {
                            items: _.times(5, testUtils.mockFactory.dataMocks.imageData())
                        }
                    });

                    expect(compWithMixin.state.shouldAutoPlay).toBe(false);
                });

                it('should be false with NO items and autoplay props is true', function () {
                    var compWithMixin = createCompWithMixin({
                        compProp: {
                            autoplay: true
                        },
                        compData: {
                            items: []
                        }
                    });

                    expect(compWithMixin.state.shouldAutoPlay).toBe(false);
                });

                it('should be true with items and autoplay props is true', function () {
                    var compWithMixin = createCompWithMixin({
                        compProp: {
                            autoplay: true
                        },
                        compData: {
                            items: _.times(5, testUtils.mockFactory.dataMocks.imageData())
                        }
                    });

                    expect(compWithMixin.state.shouldAutoPlay).toBe(true);
                });

            });

            describe('$slideshow', function() {

                it('should be autoplayOn', function() {
                    var compWithMixin = createCompWithMixin({
                        compProp: {
                            autoplay: true
                        },
                        compData: {
                            items: _.times(5, testUtils.mockFactory.dataMocks.imageData())
                        },
                        isZoomOpened: false,
                        isPlayingAllowed: true
                    });

                    expect(compWithMixin.state.$slideshow).toEqual('autoplayOn');
                });

                it('should be autoplayOff when autoPlay prop is false', function() {
                    var compWithMixin = createCompWithMixin({
                        compProp: {
                            autoplay: false
                        },
                        compData: {
                            items: _.times(5, testUtils.mockFactory.dataMocks.imageData())
                        },
                        isZoomOpened: false,
                        isPlayingAllowed: true
                    });

                    expect(compWithMixin.state.$slideshow).toEqual('autoplayOff');
                });

                it('should be autoplayOff when there are no items', function() {
                    var compWithMixin = createCompWithMixin({
                        compProp: {
                            autoplay: true
                        },
                        compData: {
                            items: []
                        },
                        isZoomOpened: false,
                        isPlayingAllowed: true
                    });

                    expect(compWithMixin.state.$slideshow).toEqual('autoplayOff');
                });

                it('should be autoplayOff when zoom is open', function() {
                    var compWithMixin = createCompWithMixin({
                        compProp: {
                            autoplay: true
                        },
                        compData: {
                            items: _.times(5, testUtils.mockFactory.dataMocks.imageData())
                        },
                        isZoomOpened: true,
                        isPlayingAllowed: true
                    });

                    expect(compWithMixin.state.$slideshow).toEqual('autoplayOff');
                });

                it('should be autoplayOff when isPlayingAllowed prop is false', function() {
                    var compWithMixin = createCompWithMixin({
                        compProp: {
                            autoplay: true
                        },
                        compData: {
                            items: _.times(5, testUtils.mockFactory.dataMocks.imageData())
                        },
                        isZoomOpened: false,
                        isPlayingAllowed: false
                    });

                    expect(compWithMixin.state.$slideshow).toEqual('autoplayOff');
                });
            });

        });

        describe('shouldShowAutoPlay', function() {

            it('should be false if isHidden', function () {
                var compWithMixin = createCompWithMixin({
                    compProp: {
                        isHidden: true,
                        showAutoplay: true
                    },
                    compData: {
                        items: _.times(5, testUtils.mockFactory.dataMocks.imageData())
                    }
                });

                expect(compWithMixin.shouldShowAutoPlay()).toBe(false);
            });

            it('should be false with NO items and showAutoplay props is false', function () {
                var compWithMixin = createCompWithMixin({
                    compProp: {
                        isHidden: false,
                        showAutoplay: false
                    },
                    compData: {
                        items: []
                    }
                });

                expect(compWithMixin.shouldShowAutoPlay()).toBe(false);
            });

            it('should be false with items and showAutoplay props is false', function () {
                var compWithMixin = createCompWithMixin({
                    compProp: {
                        isHidden: false,
                        showAutoplay: false
                    },
                    compData: {
                        items: _.times(5, testUtils.mockFactory.dataMocks.imageData())
                    }
                });

                expect(compWithMixin.shouldShowAutoPlay()).toBe(false);
            });



            it('should be false with NO items and showAutoplay props is true', function () {
                var compWithMixin = createCompWithMixin({
                    compProp: {
                        isHidden: false,
                        showAutoplay: true
                    },
                    compData: {
                        items: []
                    }
                });

                expect(compWithMixin.shouldShowAutoPlay()).toBe(false);
            });

            it('should be true with items and showAutoplay props is true', function () {
                var compWithMixin = createCompWithMixin({
                    compProp: {
                        isHidden: false,
                        showAutoplay: true
                    },
                    compData: {
                        items: _.times(5, testUtils.mockFactory.dataMocks.imageData())
                    }
                });

                expect(compWithMixin.shouldShowAutoPlay()).toBe(true);
            });


        });
    });

});
