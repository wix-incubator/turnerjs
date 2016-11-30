define(['lodash', 'siteUtils/core/positionAndSizeUtils'], function (_, positionAndSizeUtils) {
    'use strict';

    describe('positionAndSizeUtils', function () {

        beforeEach(function(){
            this.pageDimensions = {
                x: 0,
                y: 0,
                width: 980,
                height: 1000
            };
            this.viewportSize = {
                width: 1000,
                height: 1000
            };
            this.fakeSiteWidth = 500;
        });

        describe('getPositionAndSize', function () {

            describe('for non-docked components', function(){
                it('should return the dimensions by the absolute layout', function(){
                    var compLayout = {
                        width: 200,
                        height: 200,
                        x: 0,
                        y: 0
                    };

                    var parentDimensions = this.pageDimensions;
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions).toEqual({
                        width: 200,
                        height: 200,
                        x: 0,
                        y: 0
                    });
                });
            });

            describe('for components stretched horizontally to parent', function(){
                it('should return width calculated from the parent', function () {
                    var compLayout = {docked: {left: {'px': 100}, right: {'px': 100}}};
                    var parentDimensions = {
                        width: 500,
                        height: 500,
                        x: 0,
                        y: 0
                    };
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.width).toBe(300); //parent is 500, docked left 100 and right 100
                });
            });
            describe('for components stretched horizontally to the screen ("screen width") verb', function(){
                it('should return the width calculated from the screen', function () {
                    var compLayout = {docked: {left: {'vw': 10}, right: {'vw': 10}}};
                    var parentDimensions = this.pageDimensions;
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.width).toBe(800);
                });

                it('should return the x calculated as an offset from the "site x", since COMPONENTS CAN ONLY BE STRETCHED TO SCREEN IF CHILD OF A LEGACY 980PX CONTAINER', function () {
                    var compLayout = {docked: {left: {'vw': 10}, right: {'vw': 10}}};
                    var parentDimensions = this.pageDimensions;
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.x).toBe(-150); //viewportWidth = 1000, siteWidth = 500. The comp will be 100px (10vw) away from the left of the screen, which is -150 away from the left of the site
                });

                it('should return the x calculated as an offset from the root if root is defined', function () {
                    var compLayout = {docked: {left: {'vw': 10}, right: {'vw': 10}}};
                    var rootLeft = 300;
                    var parentDimensions = this.pageDimensions;
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth, rootLeft);
                    expect(compDimensions.x).toBe(-200); //rootLeft = 400. The comp will be 100px (10vw) away from the left of the root, which is -200 away from the left of the site
                });
            });

            describe('for components stretched vertically to parent', function(){
                it('should return the height calculated from the parent', function () {
                    var compLayout = {
                        docked: {top: {'px': 100}, bottom: {'px': 100}}
                    };

                    var parentDimensions = {
                        height: 500,
                        width: 500,
                        x: 0,
                        y: 0
                    };
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.height).toBe(300);
                });
            });

            describe('to the screen ("screen height") verb', function(){
                //TODO:
            });

            describe('when the component has aspect ratio', function(){
                //NOTE: aspectRatio makes a minHeight which the component will be rendered with.
                // the component can still get a bigger height by patcher
                it('the height should be calculated from the width', function () {
                    var compLayout = {
                        height: 200,
                        width: 200,
                        aspectRatio: 1.5
                    };

                    var parentDimensions = this.pageDimensions;
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.height).toBe(300);
                });
                it('the height should be calculated from the width when the component width is stretched', function () {
                    var compLayout = {
                        height: 200,
                        docked: {
                            left: {px: 50},
                            right: {px: 50}
                        },
                        aspectRatio: 1.5
                    };

                    var parentDimensions = {
                        width: 500,
                        height: 500,
                        x: 0,
                        y: 0
                    };
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.height).toBe(600);
                });
                it('the height should be calculated from the width when the component width is stretched to screen', function () {
                    var compLayout = {
                        height: 200,
                        docked: {
                            left: {vw: 0},
                            right: {vw: 0}
                        },
                        aspectRatio: 1.5
                    };

                    var parentDimensions = this.pageDimensions;
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.height).toBe(1500);
                });
            });

            describe('The y dimension returned when the component is docked to a single vertical direction, should be calculated from comp layout relative the parent', function(){
                it('docked top', function(){
                    var compLayout = {
                        docked: {top: {'px': 5, pct: 10}},
                        y: 75,
                        x: 100,
                        height: 150,
                        width: 200
                    };

                    var parentDimensions = {
                        height: 500,
                        width: 500,
                        x: 0,
                        y: 0
                    };
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.y).toBe(55); //10% of 500, + 5px
                });

                it('docked bottom', function(){
                    var compLayout = {
                        docked: {bottom: {'px': 5, pct: 10}},
                        y: 75,
                        x: 100,
                        height: 150,
                        width: 200
                    };

                    var parentDimensions = {
                        height: 500,
                        width: 500,
                        x: 0,
                        y: 0
                    };
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.y).toBe(295); //10% of 500, + 5px = 55px from bottom, height = 150px = 205px = top of comp from bottom, 500 - 205 = y of comp
                });

                it('docked vertical center (vCenter) - negative values should be above center', function(){
                    var compLayout = {
                        docked: {vCenter: {'px': -5, pct: -10}},
                        y: 75,
                        x: 100,
                        height: 150,
                        width: 200
                    };

                    var parentDimensions = {
                        height: 500,
                        width: 500,
                        x: 0,
                        y: 0
                    };
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.y).toBe(120); //10% of 500, + 5px = 55px from center (negative values means upwards). Comp height = 150 / 2 = 75px above center. 75 + 55 = 130 above center, center @ 250, 250 - 130 = 120
                });

                it('docked vertical center (vCenter) - positive values should be below center', function(){
                    var compLayout = {
                        docked: {vCenter: {'px': 5, pct: 10}},
                        y: 75,
                        x: 100,
                        height: 150,
                        width: 200
                    };

                    var parentDimensions = {
                        height: 500,
                        width: 500,
                        x: 0,
                        y: 0
                    };
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.y).toBe(230); //10% of 500, + 5px = 55px from center (positive values means downwards). Comp height = 150 / 2 = 75px above center. 75 - 55 = 20 above center, center @ 250, 250 - 20 = 230
                });
            });
            describe('The x dimension returned when the component is docked to a single horizontal direction, should be calculated from comp layout relative the parent', function(){
                it('docked left', function(){
                    var compLayout = {
                        docked: {left: {'px': 5, pct: 10}},
                        y: 100,
                        x: 77,
                        height: 150,
                        width: 200
                    };

                    var parentDimensions = {
                        height: 500,
                        width: 500,
                        x: 0,
                        y: 0
                    };
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.x).toBe(55); //10% of 500, + 5px
                });

                it('docked right', function(){
                    var compLayout = {
                        docked: {right: {'px': 5, pct: 10}},
                        y: 100,
                        x: 77,
                        height: 150,
                        width: 200
                    };

                    var parentDimensions = {
                        height: 500,
                        width: 500,
                        x: 0,
                        y: 0
                    };
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.x).toBe(245); //10% of 500, + 5px = 55px from right, width = 200px, = 255px = left of comp from right, 500 - 255 = x of comp
                });

                it('docked horizontal center (hCenter) - positive values should be to the right of the center', function(){
                    var compLayout = {
                        docked: {hCenter: {'px': 5, pct: 10}},
                        y: 75,
                        x: 100,
                        height: 150,
                        width: 150
                    };

                    var parentDimensions = {
                        height: 500,
                        width: 500,
                        x: 0,
                        y: 0
                    };
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.x).toBe(230);
                });

                it('docked horizontal center (hCenter) - negative values should be to the left of the center', function(){
                    var compLayout = {
                        docked: {vCenter: {'px': -5, pct: -10}},
                        y: 75,
                        x: 100,
                        height: 150,
                        width: 150
                    };

                    var parentDimensions = {
                        height: 500,
                        width: 500,
                        x: 0,
                        y: 0
                    };
                    var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                    expect(compDimensions.y).toBe(120);
                });
            });
        });

        describe('getPositionAndSizeRounded', function(){
            it('docked top - should round docked in pixel upward', function(){
                var compLayout = {
                    docked: {top: {pct: 10}},
                    y: 75,
                    x: 100,
                    height: 150,
                    width: 200
                };

                var parentDimensions = {
                    height: 511,
                    width: 500,
                    x: 0,
                    y: 0
                };
                var compDimensions = positionAndSizeUtils.getPositionAndSizeRounded(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                expect(compDimensions.y).toBe(52); //10% of 511 = 51.1 -> 52
            });

            it('docked bottom - should round docked in pixel upward', function(){
                var compLayout = {
                    docked: {bottom: {pct: 10}},
                    y: 75,
                    x: 100,
                    height: 150,
                    width: 200
                };

                var parentDimensions = {
                    height: 511,
                    width: 500,
                    x: 0,
                    y: 0
                };
                var compDimensions = positionAndSizeUtils.getPositionAndSizeRounded(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                expect(compDimensions.y).toBe(309); //10% of 511 = 51.1 -> 52 -> 511 - 52 - 150
            });

            it('stretched vertically - height should calculate after docked rounded upward', function(){
                var compLayout = {
                    docked: {top: {pct: 10}, bottom: {pct: 10}},
                    y: 75,
                    x: 100,
                    height: 150,
                    width: 200
                };

                var parentDimensions = {
                    height: 511,
                    width: 500,
                    x: 0,
                    y: 0
                };
                var compDimensions = positionAndSizeUtils.getPositionAndSizeRounded(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                expect(compDimensions.height).toBe(407); //10% of 511 = 51.1 -> 52. height = 511 - 52 - 52 = 407
            });
        });
    });
});
