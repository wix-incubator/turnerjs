define(['lodash', 'utils', 'testUtils', 'backgroundCommon/components/bgMedia'], function (_, utils, testUtils, bgMedia) {
    'use strict';

    describe('bgMedia', function () {

        var mockVideoBackgroundAspect = {
            registerVideo: function(){},
            getQuality: function(){}
        };

        function createBgMediaProps(partialProps) {
            return testUtils.santaTypesBuilder.getComponentProps(bgMedia, _.merge({
                skin: "skins.viewer.bgMedia.bgMediaSkin",
                structureComponentId: "comp-1",
                videoBackgroundAspect: mockVideoBackgroundAspect
            }, partialProps));
        }

        function createBgMediaComponent(partialProps) {
            var props = createBgMediaProps(partialProps);
            return testUtils.getComponentFromDefinition(bgMedia, props);
        }

        function getRootSkinProperties(bgMediaComp){
            return bgMediaComp.getSkinProperties()[''];
        }

        describe('getSkinProperties root', function(){

            function getMockCompDesignData(backgroundType, backgroundFittingType){
                return {
                    background: {
                        mediaRef: {
                            type: backgroundType
                        },
                        fittingType: backgroundFittingType
                    }
                };
            }

            describe('style', function(){
                it('should include all styles from props', function(){
                    var style = {
                        'color': 'red',
                        'border': '1px'
                    };
                    var bgMediaComp = createBgMediaComponent({style: style});
                    var rootSkinProperties = getRootSkinProperties(bgMediaComp);

                    expect(rootSkinProperties.style).toEqual(jasmine.objectContaining(style));
                });

                it('should include pointerEvents none', function(){
                    var bgMediaComp = createBgMediaComponent({});
                    var rootSkinProperties = getRootSkinProperties(bgMediaComp);

                    expect(rootSkinProperties.style.pointerEvents).toEqual('none');
                });

                it('should override top value: 0', function(){
                    var style = {
                        'top': 100
                    };
                    var bgMediaComp = createBgMediaComponent({style: style});
                    var rootSkinProperties = getRootSkinProperties(bgMediaComp);

                    expect(rootSkinProperties.style.top).toEqual(0);
                });

                it('should override position based on effect', function(){
                    var style = {
                        'position': 'fixed'
                    };
                    var positionByEffect = 'absolute';

                    spyOn(utils.containerBackgroundUtils, 'getPositionByEffect').and.returnValue(positionByEffect);
                    var bgMediaComp = createBgMediaComponent({style: style});
                    var rootSkinProperties = getRootSkinProperties(bgMediaComp);

                    expect(rootSkinProperties.style.position).toEqual(positionByEffect);
                });
            });

            describe('children', function(){

                var COMP_CLASS_NAMES = {
                    IMAGE: 'core.components.Image',
                    BG_IMAGE: 'wysiwyg.viewer.components.background.bgImage',
                    BG_VIDEO: 'wysiwyg.viewer.components.background.bgVideo'
                };

                describe('when mediaType is IMAGE', function(){
                    it('should create image child if fitting type is not tile', function(){
                        var mockCompDesignData = getMockCompDesignData('Image', 'fill');
                        var bgMediaComp = createBgMediaComponent({compDesign: mockCompDesignData});

                        var children = getRootSkinProperties(bgMediaComp).children;

                        expect(testUtils.isComponentOfType(children, COMP_CLASS_NAMES.IMAGE)).toBe(true);
                    });

                    it('should create bgImage if fitting type is tile', function(){
                        var mockCompDesignData = getMockCompDesignData('Image', 'tile');
                        var bgMediaComp = createBgMediaComponent({compDesign: mockCompDesignData});

                        var children = getRootSkinProperties(bgMediaComp).children;

                        expect(testUtils.isComponentOfType(children, COMP_CLASS_NAMES.BG_IMAGE)).toBe(true);
                    });
                });

                describe('when mediaType is WixVideo', function(){
                    it('should always create poster - image child', function(){
                        var mockCompDesignData = getMockCompDesignData('WixVideo', 'fill');
                        mockCompDesignData.background.mediaRef.posterImageRef = {};
                        var bgMediaComp = createBgMediaComponent({compDesign: mockCompDesignData});

                        var children = getRootSkinProperties(bgMediaComp).children;

                        expect(testUtils.isComponentOfType(children[0], COMP_CLASS_NAMES.IMAGE)).toBe(true);
                    });

                    it('should create bgVideo child if in desktop device and not in mobile view', function(){
                        var mockCompDesignData = getMockCompDesignData('WixVideo', 'fill');
                        mockCompDesignData.background.mediaRef.posterImageRef = {};
                        var bgMediaComp = createBgMediaComponent({compDesign: mockCompDesignData, isDesktopDevice: true, isMobileView: false});

                        var children = getRootSkinProperties(bgMediaComp).children;

                        expect(testUtils.isComponentOfType(children[1], COMP_CLASS_NAMES.BG_VIDEO)).toBe(true);
                    });

                    it('should create only poster - image child if not in desktop device', function(){
                        var mockCompDesignData = getMockCompDesignData('WixVideo', 'fill');
                        mockCompDesignData.background.mediaRef.posterImageRef = {};
                        var bgMediaComp = createBgMediaComponent({compDesign: mockCompDesignData, isDesktopDevice: false, isMobileView: false});

                        var children = getRootSkinProperties(bgMediaComp).children;

                        expect(_.isArray(children)).toBe(false);
                        expect(testUtils.isComponentOfType(children, COMP_CLASS_NAMES.IMAGE)).toBe(true);

                    });

                    it('should create only poster - image child if in mobile view', function(){
                        var mockCompDesignData = getMockCompDesignData('WixVideo', 'fill');
                        mockCompDesignData.background.mediaRef.posterImageRef = {};
                        var bgMediaComp = createBgMediaComponent({compDesign: mockCompDesignData, isDesktopDevice: true, isMobileView: true});

                        var children = getRootSkinProperties(bgMediaComp).children;

                        expect(_.isArray(children)).toBe(false);
                        expect(testUtils.isComponentOfType(children, COMP_CLASS_NAMES.IMAGE)).toBe(true);
                    });
                });
            });

            describe('data-effect', function(){
                it('should be equal to effectName defined in compProp', function(){
                    var compProp = {
                        effectName: 'someEffect'
                    };

                    var bgMediaComp = createBgMediaComponent({compProp: compProp});

                    var dataEffect = getRootSkinProperties(bgMediaComp)['data-effect'];

                    expect(dataEffect).toEqual(compProp.effectName);
                });

                it('should be none if compProp.effectName is not defined', function(){
                    var compProp = {};

                    var bgMediaComp = createBgMediaComponent({compProp: compProp});

                    var dataEffect = getRootSkinProperties(bgMediaComp)['data-effect'];

                    expect(dataEffect).toEqual('none');
                });
            });

            describe('data-fitting', function(){
                it('should equal to fiitingType in compDesign data', function(){
                    var mockCompDesignData = {
                        background: {
                            fittingType: 'fill'
                        }
                    };
                    var bgMediaComp = createBgMediaComponent({compDesign: mockCompDesignData});

                    var dataFitting = getRootSkinProperties(bgMediaComp)['data-fitting'];

                    expect(dataFitting).toEqual(mockCompDesignData.background.fittingType);
                });
            });

            describe('data-align', function(){

                it('should equal to alignType in compDesign data', function(){
                    var mockCompDesignData = {
                        background: {
                            alignType: 'center'
                        }
                    };
                    var bgMediaComp = createBgMediaComponent({compDesign: mockCompDesignData});

                    var dataAlign = getRootSkinProperties(bgMediaComp)['data-align'];

                    expect(dataAlign).toEqual(mockCompDesignData.background.alignType);
                });
            });

            describe('mediaTransforms', function(){

            });
        });
    });
});
