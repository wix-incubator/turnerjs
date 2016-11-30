define([
    'lodash',
    'definition!tpa/layout/gluedWidgetMeasurer',
    'definition!tpa/layout/gluedWidgetPatcher',
    'tpa/layout/tpaGluedWidgetPlacement',
    'tpa/layout/tpaMeasurer',
    'tpa/utils/gluedWidgetMeasuringUtils'
], function(
    _,
    gluedWidgetMeasurerDef,
    gluedWidgetPatcherDef,
    tpaGluedWidgetPlacement,
    tpaMeasurer,
    gluedWidgetMeasuringUtils
) {
    'use strict';

    describe("tpaGluedWidgetMeasurer", function() {
        var gluedWidgetPatcher,
            patchers,
            nodesMap,
            measureAndPatch,
            id = 'glued-test',
            measureMap,
            siteData,
            flatStructure,
            widgetHeight,
            widgetWidth,
            screenWidth,
            horizontalMargin,
            verticalMargin,
            zeptoCss,
            measurer;

        beforeEach(function() {
            widgetHeight = 200;
            widgetWidth = 300;
            screenWidth = 1000;
            verticalMargin = 0;
            horizontalMargin = 0;
            measureMap = {
                height: {
                    screen: 1000
                },
                width: {
                    screen: 1000
                },
                custom: {
                    WIX_ADS: {
                        topAd: null
                    }
                },
                siteMarginBottom: 0
            };
            measureMap.height[id] = widgetHeight;
            measureMap.width[id] = widgetWidth;
            nodesMap = {};
            nodesMap[id] = {};
            patchers = {
                css: jasmine.createSpy('css')
            };
            zeptoCss = jasmine.createSpy();

            var fakeZepto = jasmine.createSpy().and.returnValue({
                css: zeptoCss,
                height: jasmine.createSpy().and.returnValue(widgetHeight),
                width: jasmine.createSpy().and.returnValue(widgetWidth)
            });

            siteData = {
                WIX_ADS_ID: 'WIX_ADS',
                measureMap: measureMap,
                rendererModel: {
                    clientSpecMap: {},
                    siteInfo: {}
                }
            };

            tpaMeasurer.measureTPA = jasmine.createSpy();

            var PatcherCtor = gluedWidgetPatcherDef(_);
            gluedWidgetPatcher = new PatcherCtor();

            var MeasurerCtor = gluedWidgetMeasurerDef(_, fakeZepto, tpaMeasurer, gluedWidgetMeasuringUtils);
            measurer = new MeasurerCtor(tpaGluedWidgetPlacement);

            measureAndPatch = function (placement) {
                flatStructure = {
                    propertiesItem: {
                        placement: placement,
                        horizontalMargin: horizontalMargin,
                        verticalMargin: verticalMargin
                    },
                    layout: {
                        height: widgetHeight,
                        width: widgetWidth
                    }
                };

                measurer.measureGluedWidget(id, measureMap, nodesMap, siteData, flatStructure);
                gluedWidgetPatcher.patchGluedWidget(id, patchers, measureMap, null, siteData);
            };
        });

        function assertCss(expectedStyles) {
            expect(patchers.css.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining(expectedStyles));
        }

        describe('TPA Measurer', function() {
            it('should call TPA measurer', function() {
                measureAndPatch('TOP_LEFT');

                expect(tpaMeasurer.measureTPA).toHaveBeenCalled();
            });
        });

        describe('TOP_LEFT', function() {
            it('should return top=0, left=0', function() {
                measureAndPatch('TOP_LEFT');

                assertCss({
                    top: 0,
                    left: 0,
                    bottom: 'auto',
                    position: 'fixed'
                });
            });
        });

        describe('TOP_RIGHT', function() {
            it('should return top=0, right=0', function() {
                measureAndPatch('TOP_RIGHT');

                assertCss({
                    top: 0,
                    right: 0,
                    bottom: 'auto',
                    position: 'fixed'
                });
            });

            describe('when a top ad exists but it doesn\'t collide with the widget', function() {
                beforeEach(function() {
                    measureMap.custom.WIX_ADS.topAd = {
                        height: 20,
                        width: 100,
                        left: screenWidth - (widgetWidth + 1) - 100,
                        right: screenWidth - (widgetWidth + 1),
                        top: 0,
                        bottom: 20
                    };
                });

                it('should return top=0, right=0', function() {
                    measureAndPatch('TOP_RIGHT');

                    assertCss({
                        top: 0,
                        bottom: 'auto',
                        position: 'fixed'
                    });
                });
            });

            describe('when a top ad exists and collides with the widget', function() {
                beforeEach(function() {
                    measureMap.custom.WIX_ADS.topAd = {
                        height: 20,
                        width: 100,
                        left: screenWidth - (widgetWidth + 1),
                        right: screenWidth - (widgetWidth + 1) + 100,
                        top: 0,
                        bottom: 20
                    };
                });

                it('should return top=0, right=0', function() {
                    measureAndPatch('TOP_RIGHT');

                    assertCss({
                        top: 20,
                        bottom: 'auto',
                        position: 'fixed'
                    });
                });
            });
        });

        describe('BOTTOM_RIGHT', function() {
            it('should return bottom=0, right=0', function() {
                measureAndPatch('BOTTOM_RIGHT');

                assertCss({
                    top: 'auto',
                    right: 0,
                    bottom: 0,
                    position: 'fixed'
                });
            });
        });

        describe('BOTTOM_RIGHT (as default)', function() {
            it('should return bottom=0, right=0', function() {
                measureAndPatch('BOTTOM_RIGHT');

                assertCss({
                    top: 'auto',
                    right: 0,
                    bottom: 0,
                    position: 'fixed'
                });
            });
        });

        describe('BOTTOM_LEFT', function() {
            it('should return bottom=0, left=0', function() {
                measureAndPatch('BOTTOM_LEFT');

                assertCss({
                    top: 'auto',
                    left: 0,
                    bottom: 0,
                    position: 'fixed'
                });
            });
        });

        describe('CENTER_RIGHT', function() {
            describe('verticalMargin=0', function() {
                it('should return the correct values', function() {
                    measureAndPatch('CENTER_RIGHT');

                    assertCss({
                        top: 400,
                        right: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=0.25', function() {
                beforeEach(function () {
                    verticalMargin = 0.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_RIGHT');

                    assertCss({
                        top: 470,
                        right: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=-0.25', function() {
                beforeEach(function () {
                    verticalMargin = -0.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_RIGHT');

                    assertCss({
                        top: 330,
                        right: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=1', function() {
                beforeEach(function () {
                    verticalMargin = 1;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_RIGHT');

                    assertCss({
                        top: 680,
                        right: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=1.25', function() {
                beforeEach(function () {
                    verticalMargin = 1.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_RIGHT');

                    assertCss({
                        top: 710,
                        right: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=-1.25', function() {
                beforeEach(function () {
                    verticalMargin = -1.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_RIGHT');

                    assertCss({
                        top: 90,
                        right: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=-2', function() {
                beforeEach(function () {
                    verticalMargin = -2;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_RIGHT');

                    assertCss({
                        top: 0,
                        right: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=2', function() {
                beforeEach(function () {
                    verticalMargin = 2;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_RIGHT');

                    assertCss({
                        top: 800,
                        right: 0,
                        position: 'fixed'
                    });
                });
            });
        });

        describe('CENTER_LEFT', function() {
            describe('verticalMargin=0', function() {
                it('should return the correct values', function() {
                    measureAndPatch('CENTER_LEFT');

                    assertCss({
                        top: 400,
                        left: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=0.25', function() {
                beforeEach(function () {
                    verticalMargin = 0.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_LEFT');

                    assertCss({
                        top: 470,
                        left: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=-0.25', function() {
                beforeEach(function () {
                    verticalMargin = -0.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_LEFT');

                    assertCss({
                        top: 330,
                        left: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=1', function() {
                beforeEach(function () {
                    verticalMargin = 1;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_LEFT');

                    assertCss({
                        top: 680,
                        left: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=1.25', function() {
                beforeEach(function () {
                    verticalMargin = 1.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_LEFT');

                    assertCss({
                        top: 710,
                        left: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=-1.25', function() {
                beforeEach(function () {
                    verticalMargin = -1.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_LEFT');

                    assertCss({
                        top: 90,
                        left: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=2', function() {
                beforeEach(function () {
                    verticalMargin = 2;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_LEFT');

                    assertCss({
                        top: 800,
                        left: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('verticalMargin=-2', function() {
                beforeEach(function () {
                    horizontalMargin = -2;
                });

                it('should return the correct values', function() {
                    measureAndPatch('CENTER_LEFT');

                    assertCss({
                        top: 400,
                        left: 0,
                        position: 'fixed'
                    });
                });
            });
        });

        describe('BOTTOM_CENTER', function() {
            describe('horizontalMargin=0', function() {
                it('should return the correct values', function() {
                    measureAndPatch('BOTTOM_CENTER');

                    assertCss({
                        top: 'auto',
                        left: 350,
                        bottom: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('horizontalMargin=0.25', function() {
                beforeEach(function () {
                    horizontalMargin = 0.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('BOTTOM_CENTER');

                    assertCss({
                        top: 'auto',
                        left: 362.5,
                        bottom: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('horizontalMargin=-0.25', function() {
                beforeEach(function () {
                    horizontalMargin = -0.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('BOTTOM_CENTER');

                    assertCss({
                        top: 'auto',
                        left: 337.5,
                        bottom: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('horizontalMargin=1', function() {
                beforeEach(function () {
                    horizontalMargin = 1;
                });

                it('should return the correct values', function() {
                    measureAndPatch('BOTTOM_CENTER');

                    assertCss({
                        top: 'auto',
                        left: 400,
                        bottom: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('horizontalMargin=1.25', function() {
                beforeEach(function () {
                    horizontalMargin = 1.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('BOTTOM_CENTER');

                    assertCss({
                        top: 'auto',
                        left: 475,
                        bottom: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('horizontalMargin=-1.25', function() {
                beforeEach(function () {
                    horizontalMargin = -1.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('BOTTOM_CENTER');

                    assertCss({
                        top: 'auto',
                        left: 225,
                        bottom: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('horizontalMargin=-2', function() {
                beforeEach(function () {
                    horizontalMargin = -2;
                });

                it('should return the correct values', function() {
                    measureAndPatch('BOTTOM_CENTER');

                    assertCss({
                        top: 'auto',
                        left: 0,
                        bottom: 0,
                        position: 'fixed'
                    });
                });
            });

            describe('horizontalMargin=2', function() {
                beforeEach(function () {
                    horizontalMargin = 2;
                });

                it('should return the correct values', function() {
                    measureAndPatch('BOTTOM_CENTER');

                    assertCss({
                        top: 'auto',
                        left: 700,
                        bottom: 0,
                        position: 'fixed'
                    });
                });
            });
        });

        describe('TOP_CENTER', function() {
            describe('horizontalMargin=0', function() {
                it('should return the correct values', function() {
                    measureAndPatch('TOP_CENTER');

                    assertCss({
                        top: 0,
                        left: 350,
                        bottom: 'auto',
                        position: 'fixed'
                    });
                });
            });

            describe('horizontalMargin=0.25', function() {
                beforeEach(function () {
                    horizontalMargin = 0.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('TOP_CENTER');

                    assertCss({
                        top: 0,
                        left: 362.5,
                        bottom: 'auto',
                        position: 'fixed'
                    });
                });
            });

            describe('horizontalMargin=-0.25', function() {
                beforeEach(function () {
                    horizontalMargin = -0.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('TOP_CENTER');

                    assertCss({
                        top: 0,
                        left: 337.5,
                        bottom: 'auto',
                        position: 'fixed'
                    });
                });
            });

            describe('horizontalMargin=1', function() {
                beforeEach(function () {
                    horizontalMargin = 1;
                });

                it('should return the correct values', function() {
                    measureAndPatch('TOP_CENTER');

                    assertCss({
                        top: 0,
                        left: 400,
                        bottom: 'auto',
                        position: 'fixed'
                    });
                });
            });

            describe('horizontalMargin=1.25', function() {
                beforeEach(function () {
                    horizontalMargin = 1.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('TOP_CENTER');

                    assertCss({
                        top: 0,
                        left: 475,
                        bottom: 'auto',
                        position: 'fixed'
                    });
                });

                describe('when a top ad exists and collides with the widget', function() {
                    beforeEach(function() {
                        measureMap.custom.WIX_ADS.topAd = {
                            height: 20,
                            width: 100,
                            left: screenWidth - (widgetWidth + 1),
                            right: screenWidth - (widgetWidth + 1) + 100,
                            top: 0,
                            bottom: 20
                        };
                    });

                    it('should return top=0, right=0', function() {
                        measureAndPatch('TOP_RIGHT');

                        assertCss({
                            top: 20,
                            right: 0,
                            bottom: 'auto',
                            position: 'fixed'
                        });
                    });
                });
            });

            describe('horizontalMargin=-1.25', function() {
                beforeEach(function () {
                    horizontalMargin = -1.25;
                });

                it('should return the correct values', function() {
                    measureAndPatch('TOP_CENTER');

                    assertCss({
                        top: 0,
                        left: 225,
                        bottom: 'auto',
                        position: 'fixed'
                    });
                });
            });
        });

        describe('measureWixAdComponent', function() {
            var isMobileView, querySelector;
            beforeEach(function() {
                id = 'myId';
                measureMap = {
                    custom: {}
                };
                querySelector = jasmine.createSpy('querySelector');
                nodesMap = {
                    myId: {
                        querySelector: querySelector
                    }
                };
                siteData = {
                    isMobileView: function() { return isMobileView; }
                };
                isMobileView = null;
            });

            describe('in mobile view', function() {
                beforeEach(function() {
                    isMobileView = true;
                });

                it('should query for the mobile skinPart', function() {
                    measurer.measureWixAdComponent(id, measureMap, nodesMap, siteData);
                    expect(querySelector).toHaveBeenCalledWith('#myIdmobileWADTop');
                });
            });

            describe('in desktop view', function() {
                beforeEach(function() {
                    isMobileView = false;
                });

                it('should query for the desktop skinPart', function() {
                    measurer.measureWixAdComponent(id, measureMap, nodesMap, siteData);
                    expect(querySelector).toHaveBeenCalledWith('#myIddesktopWADTop');
                });
            });

            describe('when the selector does not return a result', function() {
                it('should not change the measureMap.custom property', function() {
                    measurer.measureWixAdComponent(id, measureMap, nodesMap, siteData);
                    expect(measureMap.custom).toEqual({});
                });
            });

            describe('when the selector returns a node', function() {
                var rect = {};
                var node;

                beforeEach(function() {
                    node = {
                        getBoundingClientRect: _.constant(rect)
                    };

                    querySelector.and.returnValue(node);
                });

                it('should initialize the measureMap.custom property with the correct values', function() {
                    measurer.measureWixAdComponent(id, measureMap, nodesMap, siteData);
                    expect(measureMap.custom).toEqual({
                        myId: {
                            topAd: rect
                        }
                    });
                });
            });
        });
    });
});
