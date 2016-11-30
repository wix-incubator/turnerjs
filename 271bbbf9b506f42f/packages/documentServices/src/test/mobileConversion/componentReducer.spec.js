/**
 * Created by noamr on 11/08/2016.
 */
define([
    'lodash', 'testUtils',
    'documentServices/theme/theme',
    'documentServices/dataModel/dataModel',
    'documentServices/component/component',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/mobileConversion/modules/componentReducer'
], function(_, testUtils, theme, dataModel, componentAPI, privateServicesHelper, componentReducer) {
    "use strict";

    var ps;
    var PAGE_ID = 'page';

    function createPageWithComponent(component) {
        return ps.dal.addPageWithDefaults(PAGE_ID, [_.defaults(component, {id: 'comp'})])
            .addDesignItem({id: 'colorDesignData', type: 'MediaContainerDesignData', background: '#colorBackground'}, PAGE_ID)
            .addDesignItem({id: 'colorBackground', type: 'BackgroundMedia', 'color': 'color_1', 'colorOpacity': 1}, PAGE_ID)
            .addDesignItem({id: 'transparentBackground', type: 'BackgroundMedia', 'color': 'color_2', 'colorOpacity': 0}, PAGE_ID)
            .addDesignItem({id: 'transparentDesignData', type: 'MediaContainerDesignData', background: '#transparentBackground'}, PAGE_ID)
            .addDesignItem({id: 'image', type: 'Image', width: 300, height: 150}, PAGE_ID)
            .addDesignItem({id: 'poster', type: 'Image', width: 300, height: 75}, PAGE_ID)
            .addDesignItem({id: 'imageBackground', type: 'BackgroundMedia', mediaRef: '#image'}, PAGE_ID)
            .addDesignItem({id: 'videoBackground', type: 'BackgroundMedia', mediaRef: '#video'}, PAGE_ID)
            .addDesignItem({id: 'video', type: 'WixVideo', posterImageRef: '#poster'}, PAGE_ID)
            .addDesignItem({id: 'imageDesignData', type: 'MediaContainerDesignData', background: '#imageBackground'}, PAGE_ID)
            .addDesignItem({id: 'videoDesignData', type: 'MediaContainerDesignData', background: '#videoBackground'}, PAGE_ID);
    }

    function executeReducerOnSingleComponent(component) {
        createPageWithComponent(component);
        componentReducer.createConversionData(ps, component, PAGE_ID);
    }

    function createStyle(props, skin) {
        return theme.styles.createItem(ps, {styleType: 'custom', skin: skin || 'skin', type: 'type', style: {properties: props}});
    }

    var TEXT_COMPONENT = {
        type: 'Component',
        componentType: 'wysiwyg.viewer.components.WRichText',
        dataQuery: '#text'
    };

    describe("Mobile conversion component reducer", function() {

        beforeEach(function() {
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(testUtils.mockFactory.mockSiteData());
        });

        describe('createConversionData', function() {
            describe('borderWidth', function() {
                it('should exist when specified in style', function() {
                    var component = {styleId: createStyle({brw: '20px'})};
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.borderWidth).toEqual(20);
                });
                it('should not exist when not in style', function() {
                    var component = {};
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.borderWidth).toBeUndefined();
                });
            });

            describe('solidColorBackgroundComponent', function() {
                it('should be falsy for strips with media', function() {
                    var component = {
                        type: 'Component',
                        componentType: 'wysiwyg.viewer.components.StripContainer',
                        designQuery: 'imageDesignData'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isSolidColorBackground).toBeFalsy();
                });

                it('should be falsy for components that are not strips/columns', function() {
                    var component = {
                        type: 'Component',
                        componentType: 'wysiwyg.viewer.components.Container',
                        designQuery: 'imageDesignData'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isSolidColorBackground).toBeFalsy();
                });

                it('should be truthy for strips with no media', function() {
                    var component = {
                        type: 'Component',
                        componentType: 'wysiwyg.viewer.components.StripContainer',
                        designQuery: 'colorDesignData'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isSolidColorBackground).toBeTruthy();
                });

                it('should be truthy for column containers with one column and no media', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'wysiwyg.viewer.components.StripColumnsContainer',
                        components: [
                            {
                                type: 'Container',
                                componentType: 'wysiwyg.viewer.components.Column',
                                designQuery: 'colorDesignData'
                            }
                        ]
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isSolidColorBackground).toBeTruthy();
                });

                it('should be falsy for column containers with more than one column', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'wysiwyg.viewer.components.StripColumnsContainer',
                        components: [
                            {
                                type: 'Container',
                                componentType: 'wysiwyg.viewer.components.Column',
                                designQuery: 'colorDesignData'
                            },
                            {
                                type: 'Container',
                                componentType: 'wysiwyg.viewer.components.Column',
                                designQuery: 'colorDesignData'
                            }
                        ]
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isSolidColorBackground).toBeFalsy();
                });

                it('should be false for column containers with one column and media', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'wysiwyg.viewer.components.StripColumnsContainer',
                        components: [
                            {
                                type: 'Container',
                                componentType: 'wysiwyg.viewer.components.Column',
                                designQuery: 'imageDesignData'
                            }
                        ]
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isSolidColorBackground).toBeFalsy();
                });
            });

            describe('transparentContainer', function() {
                it('should be falsy for non-containers', function() {
                    var component = {
                        type: 'Component',
                        componentType: 'wysiwyg.viewer.components.WPhoto',
                        designQuery: 'imageDesignData'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isTransparentContainer).toBeFalsy();
                });
                it('should be falsy for strips with media', function() {
                    var component = {
                        type: 'Component',
                        componentType: 'wysiwyg.viewer.components.StripContainer',
                        designQuery: 'imageDesignData'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isTransparentContainer).toBeFalsy();
                });

                it('should be falsy for strips with a color', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'wysiwyg.viewer.components.StripContainer',
                        designQuery: 'colorDesignData'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isTransparentContainer).toBeFalsy();
                });
                it('should be truthy for strips with transparent background', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'wysiwyg.viewer.components.StripContainer',
                        designQuery: 'transparentDesignData'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isTransparentContainer).toBeTruthy();
                });
                it('should be falsy for containers with an unknown skin', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'mobile.core.components.Container',
                        'styleId': createStyle({'alpha-bg': 0, brw: 0}, 'wysiwyg.viewer.skins.area.SomeoOtherSkin')
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isTransparentContainer).toBeFalsy();
                });
                it('should be falsy for containers with border in their style', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'mobile.core.components.Container',
                        'styleId': createStyle({'alpha-bg': 0, brw: 4}, 'wysiwyg.viewer.skins.area.DefaultAreaSkin')
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isTransparentContainer).toBeFalsy();

                });
                it('should be falsy for containers with a background color', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'mobile.core.components.Container',
                        'styleId': createStyle({'alpha-bg': 1, brw: 0}, 'wysiwyg.viewer.skins.area.DefaultAreaSkin')
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isTransparentContainer).toBeFalsy();

                });
                it('should be truthy for containers with no background color or border', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'mobile.core.components.Container',
                        'styleId': createStyle({'alpha-bg': 0}, 'wysiwyg.viewer.skins.area.DefaultAreaSkin')
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.isTransparentContainer).toBeTruthy();
                });

            });

            describe('background color', function() {
                it('should be correct for strips with design data', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'wysiwyg.viewer.components.StripContainer',
                        designQuery: 'colorDesignData'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.backgroundColor).toEqual('color_1');
                });
                it('should be correct for components with background style', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'wysiwyg.viewer.components.StripContainer',
                        styleId: createStyle({bg: 'color_17'})
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.backgroundColor).toEqual('color_17');
                });
                it('should ignore brackets', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'wysiwyg.viewer.components.StripContainer',
                        styleId: createStyle({bg: '{color_22}'})
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.backgroundColor).toEqual('color_22');
                });
                it('should be null when there is no background', function() {
                    var component = {
                        type: 'Container',
                        componentType: 'wysiwyg.viewer.components.StripContainer'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.backgroundColor).toBeFalsy();
                });
            });

            describe('fixed size', function() {
                it('should be fasly by default', function() {
                    var component = {
                        type: 'Component',
                        componentType: 'mobile.core.components.Container'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.fixedSize).toBeUndefined();

                });
                it('should be based on properties for LinkBar', function() {
                    var component = {
                        type: 'Component',
                        componentType: 'wysiwyg.viewer.components.LinkBar',
                        propertyQuery: 'props',
                        dataQuery: '#data'

                    };
                    createPageWithComponent(component)
                        .addProperties({id: 'props', orientation: 'HORIZ', iconSize: 20, spacing: 10}, PAGE_ID)
                        .addData({id: 'fb', type: 'Link', href: '#facebook'})
                        .addData({id: 'linkedIn', type: 'Link', href: '#linkedIn'})
                        .addData({id: 'data', type: 'LinkList', items: ['#fb', '#linkedIn']}, PAGE_ID);

                    componentReducer.createConversionData(ps, component, PAGE_ID);
                    expect(component.conversionData.fixedSize).toEqual({width: 50, height: 20});
                });
                it('should be based on background`s aspect ratio for image columns', function() {
                    var component = {
                        type: 'Component',
                        componentType: 'wysiwyg.viewer.components.Column',
                        designQuery: '#imageDesignData'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.fixedSize).toEqual({width: 320, height: 160});

                });

                it('should be based on background`s aspect ratio for video columns', function() {
                    var component = {
                        type: 'Component',
                        componentType: 'wysiwyg.viewer.components.Column',
                        designQuery: '#videoDesignData'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.fixedSize).toEqual({width: 320, height: 80});
                });
            });

            describe('text', function() {
                it('properties should be undefined for non-text', function() {
                    var component = {
                        type: 'Component',
                        componentType: 'wysiwyg.viewer.components.StripContainer',
                        designQuery: '#imageDesignData'
                    };
                    executeReducerOnSingleComponent(component);
                    expect(component.conversionData.textAlignments).toBeUndefined();
                    expect(component.conversionData.textLength).toBeUndefined();
                    expect(component.conversionData.effectiveTextLayoutBorders).toBeUndefined();
                    expect(component.conversionData.averageFontSize).toBeUndefined();
                });

                describe('alignments', function() {
                    it('should be left for text with no particular alignment', function() {
                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: 'Hello World'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.textAlignments).toEqual(['left']);
                    });

                    it('should be left for text with left alignment', function() {
                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: 'Hello <span style="text-align: left">World</span>'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.textAlignments).toEqual(['left']);
                    });

                    it('should be left+right for text with left and right alignment', function() {
                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: '<span style="text-align: right">Hello</span><span style="text-align: left">World</span>'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.textAlignments.sort()).toEqual(['left', 'right']);
                    });
                    it('should be left+right+center for text with some central alignment', function() {
                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: '<span style="text-align:center">Hello</span>!!!<span style="text-align: right">World</span>'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.textAlignments.sort()).toEqual(['center', 'left', 'right']);
                    });
                });

                describe('length', function() {
                    it('should be zero for empty text', function() {
                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: '<span></span>'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.textLength).toEqual(0);
                    });

                    it('should correctly calculate text length', function() {
                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: 'Hello <span>World</span>'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.textLength).toEqual(10);
                    });

                    it('should not trim text', function() {
                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: '    Hello World'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.textLength).toEqual(11);
                    });
                });

                describe('actual text width', function() {
                    it('should be computed by the browser', function() {
                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: '<span style="font-family: helvetica; font-size: 12px">X</span>'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.actualTextWidth).toBeGreaterThan(1);
                        expect(component.conversionData.actualTextWidth).toBeLessThan(20);
                    });
                });

                describe('average font size', function() {
                    it('should be correctly calculated from class', function() {
                        ps.dal.addGeneralTheme([], [
                            'normal normal normal 45px/1.4em Open+Sans {color_14}',
                            'normal normal normal 100px/1.4em Arial #FFFFFF']);

                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: '<span class="font_1">ABC</span>'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.averageFontSize).toEqual(100);
                    });
                    it('should be correctly calculated from font size', function() {
                        ps.dal.addGeneralTheme([], [
                            'normal normal normal 45px/1.4em Open+Sans {color_14}',
                            'normal normal normal 100px/1.4em Arial #FFFFFF']);

                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: '<span class="font_1"><span style="font-size: 20px">ABC</span></span>'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.averageFontSize).toEqual(20);
                    });
                    it('should be correctly calculated from several font sizes', function() {
                        ps.dal.addGeneralTheme([], [
                            'normal normal normal 45px/1.4em Open+Sans {color_14}',
                            'normal normal normal 100px/1.4em Arial #FFFFFF']);

                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: '<span class="font_1"><span style="font-size: 20px">ABC</span><span style="font-size: 10px">DEF</span></span>'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.averageFontSize).toEqual(15);
                    });
                    it('should be correctly calculated from several font sizes and classes', function() {
                        ps.dal.addGeneralTheme([], [
                            'normal normal normal 45px/1.4em Open+Sans {color_14}',
                            'normal normal normal 36px/1.4em Arial #FFFFFF']);

                        var component = _.clone(TEXT_COMPONENT);
                        createPageWithComponent(component)
                            .addData({id: 'text', type: 'RichText', text: '<span class="font_1"><span style="font-size: 20px">ABC</span><span style="font-size: 10px">DEF</span>GHI</span>'}, PAGE_ID);

                        componentReducer.createConversionData(ps, component, PAGE_ID);
                        expect(component.conversionData.averageFontSize).toEqual(22);
                    });
                });
            });

            describe('mobileConversionConfig', function() {

                var mobileConversionConfigKeys = [
                    'category',
                    'defaultHeight',
                    'desktopOnly',
                    'filterChildrenWhenHidden',
                    'isScreenWidth',
                    'isSuitableForProportionGrouping',
                    'isVisualComponent',
                    'marginX',
                    'minHeight',
                    'preserveAspectRatio',
                    'stretchHorizontally'
                ];

                function validateMobileConversionMetaData(compConversionData, expectedConfigs) {
                    _.forEach(expectedConfigs, function (expectedValue, key) {
                        var actualValue = compConversionData[key];
                        expect(actualValue).toEqual(expectedValue);
                    });
                    var undefinedConfigs = _.difference(mobileConversionConfigKeys, _.keys(expectedConfigs));
                    _.forEach(undefinedConfigs, function (key) {
                        var actualValue = compConversionData[key];
                        expect(actualValue).toBeUndefined();
                    });
                }

                describe('constant values', function () {

                    var compsWithConversionConfig = [
                        {
                            component: {
                                componentType: 'wysiwyg.viewer.components.GoogleMap'
                            },
                            expectedMobileConversionConfig: {
                                fixedSize: {width: 280, height: 240}
                            }
                        },
                        {
                            component: {
                                componentType: 'wysiwyg.viewer.components.SlideShowGallery'
                            },
                            expectedMobileConversionConfig: {
                                category: 'visual',
                                minHeight: 200
                            }
                        },
                        {
                            component: {
                                componentType: 'wysiwyg.viewer.components.Column',
                                designQuery: '#imageDesignData'
                            },
                            expectedMobileConversionConfig: {
                                filterChildrenWhenHidden: true,
                                stretchHorizontally: true,
                                category: 'column',
                                minHeight: 200,
                                fixedSize: {width: 320, height: 160},
                                preserveAspectRatio: false
                            }
                        },
                        {
                            component: {
                                componentType: 'wysiwyg.viewer.components.Column',
                                designQuery: '#videoDesignData'
                            },
                            expectedMobileConversionConfig: {
                                filterChildrenWhenHidden: true,
                                stretchHorizontally: true,
                                category: 'column',
                                minHeight: 200,
                                fixedSize: {width: 320, height: 80},
                                preserveAspectRatio: false
                            }
                        },
                        {
                            component: {
                                componentType: 'platform.components.AppController'
                            },
                            expectedMobileConversionConfig: {
                                desktopOnly: true
                            }
                        },
                        {
                            component: {
                                componentType: 'wysiwyg.viewer.components.StripContainerSlideShow'
                            },
                            expectedMobileConversionConfig: {
                                filterChildrenWhenHidden: true,
                                isScreenWidth: true,
                                marginX: 0,
                                preserveAspectRatio: false
                            }
                        },
                        {
                            component: {
                                componentType: 'wysiwyg.viewer.components.FooterContainer'
                            },
                            expectedMobileConversionConfig: {
                                category: 'siteSegments',
                                preserveAspectRatio: false
                            }
                        },
                        {
                            component: {
                                componentType: 'wysiwyg.viewer.components.VerticalLine'
                            },
                            expectedMobileConversionConfig: {
                                isSuitableForProportionGrouping: true,
                                hideByDefault:  true
                            }
                        }
                    ];

                    _.forEach(compsWithConversionConfig, function (compWithConversionConfig) {
                        it('should extract ' + _.keys(compWithConversionConfig.expectedMobileConversionConfig).join(', ') + ' from component metaData', function() {
                            executeReducerOnSingleComponent(compWithConversionConfig.component);
                            validateMobileConversionMetaData(compWithConversionConfig.component.conversionData, compWithConversionConfig.expectedMobileConversionConfig);
                        });
                    });

                    it('should not append values which are not specified in component metaData', function() {
                        var component = {
                            componentType: 'wysiwyg.common.components.onlineclock.viewer.OnlineClock'
                        };
                        executeReducerOnSingleComponent(component);
                        validateMobileConversionMetaData(component.conversionData);
                    });
                });

                describe('function values', function () {

                    it('should calculate values from functions defined in meta data', function () {
                        var mockComp = {
                            dataQuery: '#data',
                            componentType: 'wysiwyg.viewer.components.tpapps.TPAWidget'
                        };
                        createPageWithComponent(mockComp);
                        var clientSpecMapPointer = '#clientSpecMapPointer';
                        spyOn(ps.pointers.general, 'getClientSpecMap').and.returnValue(clientSpecMapPointer);
                        spyOn(ps.dal, 'get').and.callFake(function (pointer) {
                            if (pointer.id === 'data') {
                                return {applicationId: 'myApplicationId', widgetId: 'myWidgetId'};
                            }
                            if (pointer === clientSpecMapPointer) {
                                return {myApplicationId: {widgets: {myWidgetId: {mobileUrl: 'url'}}}};
                            }
                            return {};
                        });

                        componentReducer.createConversionData(ps, mockComp, PAGE_ID);
                        executeReducerOnSingleComponent(mockComp);
                        expect(mockComp.conversionData).toEqual({hideByDefault: false, stretchHorizontally: false, isSemiTransparentContainer: false, isTransparentContainer: false});
                    });
                });

                describe('component types mapping', function () {
                    var testMocks = [
                        {
                            realComp: {dataQuery: 'data', componentType: 'tpa.viewer.components.tpapps.TPAGluedWidget'},
                            usedComp: {dataQuery: 'data', componentType: 'wysiwyg.viewer.components.tpapps.TPAGluedWidget'}
                        },
                        {
                            realComp: {dataQuery: 'data', componentType: 'tpa.viewer.components.tpapps.TPAWidget'},
                            usedComp: {dataQuery: 'data', componentType: 'wysiwyg.viewer.components.tpapps.TPAWidget'}
                        }
                    ];

                    _.forEach(testMocks, function (testMock) {
                        it('should handle components with component type ' + testMock.realComp.componentType + ' as components with type ' + testMock.usedComp.componentType, function () {
                            executeReducerOnSingleComponent(testMock.usedComp);
                            executeReducerOnSingleComponent(testMock.realComp);
                            expect(testMock.realComp.conversionData).toEqual(testMock.usedComp.conversionData);
                        });
                    });
                });
            });
        });
    });
});
