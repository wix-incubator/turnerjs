define(['react', 'lodash', 'utils', 'testUtils', 'balataCommon/balata/balata'], function (React, _, utils, testUtils, balata) {
    'use strict';

    describe('balata tests', function () {

        var COMP_CLASS_NAMES = {
            BG_OVERLAY: 'wysiwyg.viewer.components.background.bgOverlay',
            BG_MEDIA: 'wysiwyg.viewer.components.background.bgMedia'
        };
        var balataClass = React.createClass(balata);

        function createBalataProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(balata, _.merge({
                skin: "skins.viewer.balata.balataBaseSkin",
                key: "balata-1",
                structureComponentId: '',
                fixedBackgroundColorBalata: false
            }, partialProps));
        }

        function createBalataComponent(partialProps, container) {
            var props = createBalataProps(partialProps);

            return testUtils.getComponentFromReactClass(balataClass, props, container);
        }

        describe('componentWillReceiveProps', function(){
            it('should notify designDataChangeAspect on prevBgData change', function(){
                var mockDesignDataChangeAspect = {
                    // args: compId, previousData, currentData
                    notify: function (){}
                };

                var compDesign = {
                    background: {id: 'oldBg'}
                };

                var newCompDesign = {
                    background: {id: 'newBg'}
                };

                var props = {
                    structureComponentId: 'structureComponent',
                    designDataChangeAspect: mockDesignDataChangeAspect,
                    compDesign: compDesign
                };

                var newProps = _.cloneDeep(props);
                newProps.compDesign = newCompDesign;

                spyOn(mockDesignDataChangeAspect, 'notify');

                var container = window.document.createElement('div');
                createBalataComponent(props, container);
                createBalataComponent(newProps, container);

                expect(mockDesignDataChangeAspect.notify).toHaveBeenCalledWith(props.structureComponentId, compDesign, newCompDesign);
            });
        });

        describe('getSkinProperties', function(){

            describe('root', function(){

                function getRootSkinProperties(comp){
                    return comp.getSkinProperties()[''];
                }

                describe('style', function(){
                    it('should include default style properties', function(){
                        var defaultStyles = {
                            position: 'absolute',
                            top: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none'
                        };

                        var balataComp = createBalataComponent({style: {}});
                        var rootSkinStyle = getRootSkinProperties(balataComp).style;

                        expect(rootSkinStyle).toEqual(jasmine.objectContaining(defaultStyles));
                    });

                    it('should include all the properties defined in props.style', function(){
                        var style = {
                            color: 'red',
                            border: '1px'
                        };

                        var balataComp = createBalataComponent({style: style});

                        var rootSkinStyle = getRootSkinProperties(balataComp).style;

                        expect(rootSkinStyle).toEqual(jasmine.objectContaining(style));
                    });
                });

                describe('onClick', function(){
                    it('should equal to props.onClick', function(){
                        var onClickFunc = function(){};
                        var balataComp = createBalataComponent({onClick: onClickFunc});

                        var rootSkinProperties = getRootSkinProperties(balataComp);

                        expect(rootSkinProperties.onClick).toEqual(onClickFunc);
                    });
                });

                describe('key', function(){
                    it('should start with balata_ and end with effect name', function(){
                        var effectName = 'effectName1';
                        spyOn(utils.containerBackgroundUtils, 'getBgEffectName').and.returnValue(effectName);
                        var balataComp = createBalataComponent();

                        var rootSkinProperties = getRootSkinProperties(balataComp);

                        expect(rootSkinProperties.key).toEqual('balata_' + effectName);

                    });
                });

                describe('children', function(){

                    it('should create only underlay if data has no media or overlay', function(){
                        var compDesign = {
                            background: {
                                backgroundData: 'backgroundData'
                            }
                        };
                        var balataComp = createBalataComponent({compDesign: compDesign});

                        var children = getRootSkinProperties(balataComp).children;

                        expect(testUtils.isComponentOfType(children[0], COMP_CLASS_NAMES.BG_OVERLAY)).toBe(true);
                    });

                    describe('media', function(){
                        it('should create a media layer if mediaRef has data', function(){
                            var compDesign = {
                                background: {
                                    backgroundData: 'backgroundData',
                                    mediaRef: {
                                        mockMediaRef: 'mockMediaRef'
                                    }
                                }
                            };
                            var balataComp = createBalataComponent({compDesign: compDesign});

                            var children = getRootSkinProperties(balataComp).children;

                            expect(testUtils.isComponentOfType(children[1], COMP_CLASS_NAMES.BG_MEDIA)).toBe(true);
                        });
                    });

                    describe('overlay', function(){

                        describe("showOverlayForMediaType is 'all'", function(){
                            it('should create overlay child for background with colorOverlay', function(){
                                var compDesign = {
                                    background: {
                                        mediaRef: {
                                            mockMediaRef: 'mockMediaRef'
                                        },
                                        colorOverlay: "{color_1}",
                                        showOverlayForMediaType: "all"
                                    }
                                };

                                var balataComp = createBalataComponent({compDesign: compDesign});

                                var children = getRootSkinProperties(balataComp).children;

                                expect(testUtils.isComponentOfType(children[2], COMP_CLASS_NAMES.BG_OVERLAY)).toBe(true);
                            });

                            it('should create overlay child for background with imageOverlay', function(){
                                var compDesign = {
                                    background: {
                                        mediaRef: {
                                            mockMediaRef: 'mockMediaRef'
                                        },
                                        imageOverlay: {
                                            mockImageOverlay: 'mockImageOverlay',
                                            uri: 'imageOverlay.png'
                                        },
                                        showOverlayForMediaType: "all"
                                    }
                                };

                                var balataComp = createBalataComponent({compDesign: compDesign, staticMediaUrl: 'staticMediaUrl'});

                                var children = getRootSkinProperties(balataComp).children;

                                expect(testUtils.isComponentOfType(children[2], COMP_CLASS_NAMES.BG_OVERLAY)).toBe(true);
                            });

                            it('should not create overlay child for background without imageOverlay or colorOverlay', function(){
                                var compDesign = {
                                    background: {
                                        mediaRef: {
                                            mockMediaRef: 'mockMediaRef'
                                        },
                                        showOverlayForMediaType: "all"
                                    }
                                };

                                var balataComp = createBalataComponent({compDesign: compDesign, staticMediaUrl: 'staticMediaUrl'});

                                var children = getRootSkinProperties(balataComp).children;

                                expect(children[2]).not.toBeDefined();
                            });
                        });

                        describe("showOverlayForMediaType is 'WixVideo'", function(){
                            it('should create overlay child only for video background', function(){
                                var mockVideoBackgroundAspect = {
                                    registerVideo: function(){},
                                    getQuality: function(){}
                                };

                                var compDesign = {
                                    background: {
                                        mediaRef: {
                                            type: "WixVideo",
                                            posterImageRef: {}
                                        },
                                        colorOverlay: "{color_1}",
                                        showOverlayForMediaType: "WixVideo"
                                    }
                                };

                                var balataComp = createBalataComponent({compDesign: compDesign, videoBackgroundAspect: mockVideoBackgroundAspect});

                                var children = getRootSkinProperties(balataComp).children;

                                expect(testUtils.isComponentOfType(children[2], COMP_CLASS_NAMES.BG_OVERLAY)).toBe(true);
                            });

                            it('should not create overlay child for Image background', function(){
                                var compDesign = {
                                    background: {
                                        mediaRef: {
                                            type: "Image"
                                        },
                                        colorOverlay: "{color_1}",
                                        showOverlayForMediaType: "WixVideo"
                                    }
                                };

                                var balataComp = createBalataComponent({compDesign: compDesign});

                                var children = getRootSkinProperties(balataComp).children;

                                expect(children[2]).not.toBeDefined();
                            });
                        });

                        it('should not create overlay for background without mediaRef', function(){
                            var compDesign = {
                                background: {
                                    mediaRef: undefined,
                                    colorOverlay: "{color_1}",
                                    showOverlayForMediaType: "all"
                                }
                            };

                            var balataComp = createBalataComponent({compDesign: compDesign});

                            var children = getRootSkinProperties(balataComp).children;

                            expect(children[2]).not.toBeDefined();
                        });
                    });

                });
            });

        });
    });
});
