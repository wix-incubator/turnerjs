define(['lodash', 'testUtils', 'utils', 'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/structure/utils/componentLayout'
], function (
    _, testUtils, utils, constants, privateServicesHelper, componentLayout
) {
    'use strict';

    describe('componentLayout', function(){

        var siteData, ps, parentComp, childComp;
        beforeEach(function () {
            siteData = testUtils.mockFactory.mockSiteData();
            childComp = {
                id: 'child',
                layout: {
                    //should be set in each test
                }
            };
            parentComp = {
                id: 'parent',
                components: [childComp],
                layout: {
                    width: 500,
                    height: 500,
                    x: 100,
                    y: 100,
                    rotationInDegrees: 0
                }
            };
        });


        function getCompPointer(compId) {
            var page = ps.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, page);
        }
        function prepareTest() {
            var measureMap = {
                width: {'parent': parentComp.layout.width},
                height: {'parent': parentComp.layout.height},
                left: {'parent': parentComp.layout.x},
                top: {'parent': parentComp.layout.y}
            };

            siteData.addPageWithDefaults('page1', [parentComp])
                .addMeasureMap(measureMap);

            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        describe('applyPositionAndSizeOnCurrentLayoutSchema', function () {


            describe('when changing width', function(){
                it('when component layout has width in pixels, it should resize the width in pixels', function () {
                    childComp.layout = {
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 0
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {width: 150});
                    expect(compLayout).toContain({width: 150});
                });
                it('when component layout is docked top, it should resize the width in pixels', function () {
                    childComp.layout = {
                        x: 0,
                        width: 150,
                        height: 0,
                        docked: {top: {px: 200}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {width: 200});
                    expect(compLayout).toContain({width: 200});
                });
                it('when component layout is docked both left and right, it should resize the docked values to reflect the width change', function () {
                    childComp.layout = {
                        y: 0,
                        height: 100,
                        docked: {left: {px: 250}, right: {px: 200}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {x: 200, width: 150});
                    expect(compLayout.docked).toContain({left: {'px': 200}, right: {'px': 150}});
                });
                it('when component layout is docked right, it should change the docked right value in order to reflect the width change', function () {
                    childComp.layout = {
                        y: 0,
                        width: 150,
                        height: 0,
                        docked: {right: {px: 200}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {width: 200});
                    expect(compLayout.docked).toContain({right: {'px': 150}});
                });
                it('when component layout is docked left, it should not change the docked left value (since the component is not moving)', function () {
                    childComp.layout = {
                        y: 0,
                        width: 150,
                        height: 0,
                        docked: {left: {px: 200}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {width: 200});
                    expect(compLayout.docked).toContain({left: {'px': 200}});
                });
                it('when component layout is docked hCenter, it should change the docked hCenter value to reflect the change', function () {
                    //childComp.layout.docked = {hCenter: {px: 0}};
                    //childComp.layout.width = 100;
                    childComp.layout = {
                        y: 0,
                        width: 100,
                        height: 0,
                        docked: {hCenter: {px: 0}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {width: 300});
                    expect(compLayout.docked).toContain({hCenter: {'px': 100}});
                });
            });
            describe('when changing height', function(){
                it('when component layout has height in pixels, it should resize the height in pixels', function () {
                    childComp.layout = {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 200
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {height: 150});
                    expect(compLayout).toContain({height: 150});
                });
                it('when component layout is docked left, it should resize the height in pixels', function () {
                    childComp.layout = {
                        y: 0,
                        width: 0,
                        height: 150,
                        docked: {left: {px: 200}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {height: 200});
                    expect(compLayout).toContain({height: 200});
                });
                it('when component layout is docked both top and bottom, it should resize the docked values to reflect the height change', function () {
                    childComp.layout = {
                        x: 0,
                        width: 0,
                        docked: {top: {px: 250}, bottom: {px: 200}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {y: 200, height: 150});
                    expect(compLayout.docked).toContain({top: {'px': 200}, bottom: {'px': 150}});
                });
                it('when component layout is docked bottom, it should change the bottom right value in order to reflect the height change', function () {
                    childComp.layout = {
                        x: 0,
                        width: 0,
                        height: 150,
                        docked: {bottom: {px: 200}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {height: 200});
                    expect(compLayout.docked).toContain({bottom: {'px': 150}});
                });
                it('when component layout is docked top, it should not change the docked top value (since the component is not moving)', function () {
                    childComp.layout = {
                        x: 0,
                        width: 0,
                        height: 150,
                        docked: {top: {px: 200}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {height: 200});
                    expect(compLayout.docked).toContain({top: {'px': 200}});
                });
                it('when component layout is docked vCenter, it should change the docked vCenter value to reflect the change', function () {
                    //childComp.layout.docked = {vCenter: {px: 0}};
                    //childComp.layout.height = 100;
                    childComp.layout = {
                        x: 0,
                        width: 0,
                        height: 100,
                        docked: {vCenter: {px: 0}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {height: 300});
                    expect(compLayout.docked).toContain({vCenter: {'px': 100}});
                });
            });
            describe('when changing x', function(){
                it('when component layout is docked left, it should change the left dock value', function(){
                    //childComp.layout.docked = {left: {px: 250}};
                    childComp.layout = {
                        y: 0,
                        width: 0,
                        height: 0,
                        docked: {left: {px: 250}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {x: 200});
                    expect(compLayout.docked).toContain({left: {'px': 200}});
                });
                it('when component layout is docked right, it should change the right dock value', function(){
                    //childComp.layout.docked = {right: {px: 250}};
                    //childComp.layout.width = 100;
                    childComp.layout = {
                        y: 0,
                        width: 100,
                        height: 0,
                        docked: {right: {px: 250}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {x: 200});
                    expect(compLayout.docked).toContain({right: {'px': 200}});
                });
                it('when component layout is docked hCenter, it should change the hCenter dock value', function(){
                    //childComp.layout.width = 100;
                    //childComp.layout.docked = {hCenter: {px: 10}};

                    childComp.layout = {
                        y: 0,
                        width: 100,
                        height: 0,
                        docked: {hCenter: {px: 10}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {x: 250});
                    expect(compLayout.docked).toContain({hCenter: {'px': 50}});
                });
            });
            describe('when changing y', function(){
                it('when component layout is docked top, it should change the top dock value', function(){
                    //childComp.layout.docked = {top: {px: 250}};
                    childComp.layout = {
                        x: 0,
                        width: 0,
                        height: 0,
                        docked: {top: {px: 250}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {y: 200});
                    expect(compLayout.docked).toContain({top: {'px': 200}});
                });
                it('when component layout is docked bottom, it should change the bottom dock value', function(){
                    //childComp.layout.docked = {bottom: {px: 250}};
                    //childComp.layout.height = 100;
                    childComp.layout = {
                        x: 0,
                        width: 0,
                        height: 100,
                        docked: {bottom: {px: 250}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {y: 200});
                    expect(compLayout.docked).toContain({bottom: {'px': 200}});
                });
                it('when component layout is docked vCenter, it should change the vCenter dock value', function(){
                    //childComp.layout.height = 100;
                    //childComp.layout.docked = {vCenter: {px: 10}};
                    childComp.layout = {
                        x: 0,
                        width: 0,
                        height: 100,
                        docked: {vCenter: {px: 10}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {y: 250});
                    expect(compLayout.docked).toContain({vCenter: {'px': 50}});
                });
                it('when component layout is vertically stretched to screen, it should change the y value', function(){
                    //childComp.layout.docked = {top: {px: 250}};
                    childComp.layout = {
                        y: 100,
                        x: 0,
                        width: 0,
                        height: 0,
                        docked: {top: {vh: 0}, bottom: {vh: 0}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {y: 200});
                    expect(compLayout.y).toEqual(200);
                });
            });
            describe('when the component layout is docked using pct units', function(){
                it('when changing width, it should update the docked right pct value', function(){
                    childComp.layout = {
                        y: 0,
                        height: 100,
                        docked: {left: {pct: 10}, right: {pct: 10}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {x: 50, width: 350});
                    expect(compLayout.docked).toContain({left: {'pct': 10}, right: {'pct': 20}});
                });
                it('when changing height, it should update the docked right pct value', function(){
                    childComp.layout = {
                        x: 0,
                        width: 100,
                        docked: {top: {pct: 10}, bottom: {pct: 10}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {y: 50, height: 350});
                    expect(compLayout.docked).toContain({top: {'pct': 10}, bottom: {'pct': 20}});
                });
                it('when changing x, it should update the docked right pct value', function(){
                    childComp.layout = {
                        y: 0,
                        height: 100,
                        width: 100,
                        docked: {left: {pct: 10}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {x: 75});
                    expect(compLayout.docked).toContain({left: {'pct': 15}});
                });
                it('when changing y, it should update the docked right pct value', function(){
                    childComp.layout = {
                        x: 0,
                        height: 100,
                        width: 100,
                        docked: {top: {pct: 10}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {y: 75});
                    expect(compLayout.docked).toContain({top: {'pct': 15}});
                });
                it('should update pct value to maximum 2 decimal numbers', function(){
                    siteData.addMeasureMap({width: {'parent': 1240}});
                    parentComp.layout.width = 1240;
                    childComp.layout = {
                        y: 0,
                        height: 100,
                        docked: {left: {pct: 0}, right: {pct: 0}}
                    };
                    prepareTest();
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.applyPositionAndSizeOnCurrentLayoutSchema(ps, compPointer, {x: 20, width: 1220});

                    expect(compLayout.docked).toContain({left: {'pct': 1.61}, right: {'pct': 0}}); // x: 0px -> 20px : 0pct -> 1.6129...pct
                });
            });
        });

        describe('getPositionAndSize', function(){
            describe('For docked screen width component', function(){
                beforeEach(function() {
                    childComp.layout = {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 150,
                        docked: {left: {vw: 0}, right: {vw: 0}}
                    };
                });

                it('when view mode is desktop width should be the screen width', function(){
                    var screenWidth = 1100;
                    prepareTest();
                    spyOn(siteData, 'isMobileView').and.returnValue(false);
                    siteData.getBodyClientWidth = jasmine.createSpy('getBodyClientWidth').and.returnValue(screenWidth);
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.getPositionAndSize(ps, compPointer);
                    expect(compLayout.width).toBe(screenWidth);
                });

                it('when view mode is mobile width should be 320', function(){
                    prepareTest();
                    spyOn(siteData, 'isMobileView').and.returnValue(true);
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.getPositionAndSize(ps, compPointer);
                    expect(compLayout.width).toBe(320);
                });

                it('should use rootWidth instead of siteWidth', function() {
                    var screenWidth = 1100,
                        rootWidth = 980;

                    siteData.getBodyClientWidth = jasmine.createSpy('getBodyClientWidth').and.returnValue(screenWidth);
                    spyOn(utils.layout, 'getRootWidth').and.returnValue(rootWidth);
                    var compPointer = getCompPointer('child');
                    var compLayout = componentLayout.getPositionAndSize(ps, compPointer);

                    expect(compLayout.width).toBe(rootWidth);
                });
            });
        });
    });
});
