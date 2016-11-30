define([
    'Squire',
    'lodash',
    'zepto',
    'layout/util/layout',
    'utils',
    'layout/util/rootLayoutUtils',
    'layout/util/calculateScreenWidthDimensions',
    'layout/specificComponents/bgImageLayout',
    'layout/specificComponents/balataLayout',
    'definition!layout/specificComponents/containerAndScreenWidthLayout',
    'testUtils'
], function (
    Squire,
    _,
    $,
    layout,
    utils,
    rootLayoutUtils,
    calculateScreenWidthDimensions,
    bgImageLayout,
    balataLayout,
    containerAndScreenWidthLayoutDef,
    testUtils
) {
    'use strict';

    //commented out, since the tests make too many assumptions on implementation and cant actually run with dependencies on zepto
    xdescribe('containerAndScreenWidth layout', function () {
        var layoutMock;

        beforeEach(function (done) {
            var injector;

            injector = new Squire();

            injector.mock('layout/util/layout', {
                registerPatcher: jasmine.createSpy('registerPatcher'),
                registerSAFEPatcher: jasmine.createSpy('registerSAFEPatcher'),
                registerRequestToMeasureChildren: jasmine.createSpy('registerRequestToMeasureChildren'),
                registerCustomMeasure: jasmine.createSpy("registerCustomMeasure"),
                registerMeasureChildrenFirst: jasmine.createSpy("registerMeasureChildrenFirst"),
                registerPatchers: jasmine.createSpy("registerPatchers"),
                registerSAFEPatchers: jasmine.createSpy("registerPatchers"),
                registerRequestToMeasureDom: jasmine.createSpy("registerRequestToMeasureDom")
            });

            injector.require(['layout/specificComponents/containerAndScreenWidthLayout'], function () {
                layoutMock = injector.mocks['layout/util/layout'];
                done();
            });
        });

        it('registers a patcher for the bgImageStrip component', function () {
            expect(layoutMock.registerPatcher).toHaveBeenCalledWith(
                'wysiwyg.viewer.components.BgImageStrip', jasmine.any(Function));
        });


        describe('bgImageStrip patcher', function () {
            var patchBgImageStrip, options;

            beforeEach(function () {

                var compId = 'bgImageStrip';

                // Get the original patcher function provided by the module.
                var patcher = _.find(layoutMock.registerPatcher.calls.all(), {args: ['wysiwyg.viewer.components.BgImageStrip']}).args[1];

                patchBgImageStrip = function (optionsObj) {
                    var measureMap, structureInfo, nodesMap, siteData;

                    siteData = testUtils.mockFactory.mockSiteData();
                    siteData.addMeasureMap({
                        width: {screen: optionsObj.width},
                        height: _.set({}, compId, optionsObj.height)
                    });
                    measureMap = siteData.measureMap;
                    nodesMap = {};
                    nodesMap[compId] = {
                        style: {}
                    };
                    nodesMap[compId + 'bg'] = {
                        style: {}
                    };

                    structureInfo = {dataItem: optionsObj.dataItem, propertiesItem: optionsObj.propertiesItem};

                    patcher(compId, nodesMap, measureMap, structureInfo, siteData);
                    return nodesMap[optionsObj.expectedCompId].style;
                };
            });

            it('should set the correct width for container node style', function () {
                options = {
                    expectedCompId: 'bgImageStrip',
                    width: 1920
                };
                expect(patchBgImageStrip(options).cssText).toContain('width:1920px');
            });


            it('should set the image uri for the inner image node style', function (done) {
                options = {
                    expectedCompId: 'bgImageStrip' + 'bg',
                    width: 1920,
                    height: 500,
                    dataItem: {
                        type: 'Image',
                        width: 2000,
                        height: 2000,
                        uri: 'dummy.jpg'
                    },
                    propertiesItem: {
                        fittingType: 'fill',
                        alignType: 'center'
                    }
                };
                patchBgImageStrip(options);
                setTimeout(done, 300);
                expect(patchBgImageStrip(options).cssText).toContain('background-position:center');

            });

        });
    });

    var mockPopup = {
            dataItem: {
                isPopup: true,
                pageBackgrounds: {
                    desktop: {
                        ref: '#bg_ref'
                    }
                }
            },
            propertiesItem: {
                desktop: {
                    popup: {
                        'closeOnOverlayClick': true
                    }
                }
            },
            structure: {}
        },
        measureChildrenArgs,
        mockId = 'mockId',
        mockMeasureMap = testUtils.mockFactory.createBlankMeasureMap(),
        mockNodesMap = {
            mockId: 'mockId'
        },
        mockSiteData;

    function generateContainerAndScreenWidthLayout() {
        layout.registerPatcher = jasmine.createSpy('registerPatcher');
        layout.registerCustomMeasure = jasmine.createSpy('registerCustomMeasure');
        layout.registerRequestToMeasureChildren = jasmine.createSpy('registerRequestToMeasureChildren');

        return containerAndScreenWidthLayoutDef(
            _,
            $,
            layout,
            utils,
            rootLayoutUtils,
            calculateScreenWidthDimensions,
            bgImageLayout,
            balataLayout
        );
    }

    function getArgsFromSpyForComponentType(spy, compType) {
        var calls = spy.calls,
            length = calls.count();

        for (var i = 0; i < length; i += 1) {
            if (_.includes(calls.argsFor(i), compType)) {
                return calls.argsFor(i);
            }
        }
        return [];
    }

    xdescribe('containerAndScreenWidthLayout', function () {
        var balataConsts = utils.balataConsts;
        var POPUP_OVERLAY_SKIN_PART_ID = balataConsts.BALATA;

        beforeEach(function () {
            generateContainerAndScreenWidthLayout();
        });

        describe('on init registers a request to measure the children of the component', function() {
            describe('for "mobile.core.components.Page" which', function() {
                var compType = "mobile.core.components.Page";

                it('should call registerRequestToMeasureChildren', function() {
                    expect(layout.registerRequestToMeasureChildren).toHaveBeenCalledWith(
                        "mobile.core.components.Page", jasmine.any(Function));
                });

                describe('has function in args which', function() {
                    it('should return ["inlineContent"] for page', function() {
                        measureChildrenArgs = getArgsFromSpyForComponentType(layout.registerRequestToMeasureChildren, compType);
                        expect(_.get(measureChildrenArgs, 1)(mockSiteData, mockId, mockNodesMap, mockPopup))
                            .toEqual([["inlineContent"]]);
                    });

                    it('should return ["inlineContent"], [POPUP_OVERLAY_SKIN_PART_ID] for popup', function() {
                        generateContainerAndScreenWidthLayout();

                        measureChildrenArgs = getArgsFromSpyForComponentType(layout.registerRequestToMeasureChildren, compType);
                        expect(_.get(measureChildrenArgs, 1)(mockSiteData, mockId, mockNodesMap, mockPopup))
                            .toEqual([["inlineContent"], [POPUP_OVERLAY_SKIN_PART_ID]]);
                    });

                });
            });
        });

        describe('on init registers custom measure', function() {
            describe('for "mobile.core.components.Page" which', function() {
                var compType = "mobile.core.components.Page";

                beforeEach(function() {
                    mockSiteData = testUtils.mockFactory.mockSiteData(null, true);
                });

                it('should call registerCustomMeasure', function() {
                    expect(layout.registerCustomMeasure).toHaveBeenCalledWith(
                        "mobile.core.components.Page", jasmine.any(Function));
                });

                describe('has function in args which', function() {
                    it('should call balataLayout.measure', function() {
                        spyOn(balataLayout, 'measure');
                        generateContainerAndScreenWidthLayout();
                        measureChildrenArgs = getArgsFromSpyForComponentType(layout.registerCustomMeasure, compType);

                        measureChildrenArgs[1](mockId, mockMeasureMap, mockNodesMap, mockSiteData, mockPopup);
                        expect(balataLayout.measure).toHaveBeenCalled();
                    });
                });
            });
        });


        describe('on init registers patcher', function() {
            describe('for "mobile.core.components.Page" which', function() {
                var compType = "mobile.core.components.Page";

                beforeEach(function() {
                    mockSiteData = testUtils.mockFactory.mockSiteData(null, true);
                });

                it('should call registerSAFEPatcher', function() {
                    expect(layout.registerSAFEPatcher).toHaveBeenCalledWith(
                        "mobile.core.components.Page", jasmine.any(Function));
                });

                describe('has function in args which', function() {
                    it('should call balataLayout.patch', function() {
                        spyOn(balataLayout, 'patch');
                        generateContainerAndScreenWidthLayout();
                        measureChildrenArgs = getArgsFromSpyForComponentType(layout.registerPatcher, compType);

                        measureChildrenArgs[1](mockId, mockNodesMap, mockMeasureMap, mockPopup, mockSiteData);
                        expect(balataLayout.patch).toHaveBeenCalled();
                    });
                });
            });
        });

    });
});
