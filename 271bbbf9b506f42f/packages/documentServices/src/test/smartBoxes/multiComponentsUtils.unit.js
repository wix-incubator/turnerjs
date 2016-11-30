define(['lodash',
        'testUtils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/component/component',
        'documentServices/structure/structure',
        'documentServices/componentsMetaData/componentsMetaData',
        'definition!documentServices/smartBoxes/multiComponentsUtils',
        'documentServices/smartBoxes/multiComponentsUtilsValidations',
        'documentServices/constants/constants'],
    function (_, testUtils, privateServicesHelper, component, structure, componentsMetaData, MultiComponentsUtilsDef, multiComponentsUtilsValidations, constants) {
        'use strict';

        function getCompPointer(ps, compId, pageId) {
            var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, page);
        }

        function getSiteDataWithComponents(pageId, components) {
            return testUtils.mockFactory.mockSiteData({}, true).addPageWithDefaults(pageId, components);
        }

        describe('multiComponentsUtils', function () {

            var multiComponentsUtils, siteData, ps, pageId, SCREEN_WIDTH, SCREEN_HEIGHT;

            beforeEach(function () {
                pageId = 'pageId';

                this.addComponents = function (compsArr) {
                    ps.dal.addDesktopComps(compsArr, ps.pointers.components.getPage(pageId, 'DESKTOP'));
                };

                this.components = [
                    {
                        id: 'positiveAxisComp',
                        layout: {
                            bounding: {x: 10, y: 20, height: 70, width: 80},
                            x: 10,
                            y: 20,
                            height: 70,
                            width: 80,
                            rotationInDegrees: 0
                        }
                    },
                    {
                        id: 'comp2',
                        layout: {
                            bounding: {x: 50, y: 70, height: 100, width: 100},
                            x: 50,
                            y: 70,
                            height: 100,
                            width: 100
                        }
                    },
                    {
                        id: 'comp3',
                        layout: {
                            bounding: {x: 100, y: 100, height: 10, width: 10},
                            x: 100,
                            y: 100,
                            height: 10,
                            width: 10
                        }
                    },
                    {
                        id: 'negativeXAxisCoordComp',
                        layout: {
                            bounding: {x: -5, y: 80, height: 50, width: 50},
                            x: -5,
                            y: 80,
                            height: 50,
                            width: 50
                        }
                    },
                    {
                        id: 'negativeYAxisCoordComp',
                        layout: {
                            bounding: {x: 50, y: -10, height: 100, width: 100},
                            x: 50,
                            y: -10,
                            height: 100,
                            width: 100
                        }
                    },
                    {
                        id: 'fullWidthComp',
                        layout: {
                            y: 10,
                            height: 100,
                            docked: {
                                left: {vw: 0},
                                right: {vw: 0}
                            }
                        }
                    },
                    {
                        id: 'topMostComp',
                        layout: {
                            x: 50,
                            y: 10,
                            height: 100,
                            width: 100
                        }
                    },
                    {
                        id: 'leftMostComp',
                        layout: {
                            x: 0,
                            y: 10,
                            height: 100,
                            width: 100
                        }
                    },
                    {
                        id: 'alsoLeftMostComp',
                        layout: {
                            x: 0,
                            y: 20,
                            height: 55,
                            width: 60
                        }
                    },
                    {
                        id: 'bottomMostComp',
                        layout: {
                            x: 0,
                            y: 620,
                            height: 80,
                            width: 60
                        }
                    }
                ];
                SCREEN_WIDTH = 1100;
                SCREEN_HEIGHT = 800;
                siteData = getSiteDataWithComponents(pageId, this.components)
                    .addMeasureMap({
                    clientWidth: SCREEN_WIDTH,
                    clientHeight: SCREEN_HEIGHT
                });
                   siteData.setScreenSize(SCREEN_WIDTH, SCREEN_HEIGHT);

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                spyOn(ps.siteAPI, 'getScreenSize').and.returnValue({
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT
                });
                multiComponentsUtils = new MultiComponentsUtilsDef(_, component, structure, componentsMetaData, multiComponentsUtilsValidations, constants);
            });

            describe('getSnugLayout', function () {

                it('should return undefined if no comps are inserted', function () {
                    var actual = multiComponentsUtils.getSnugLayout(ps, []);
                    expect(actual).toEqual(undefined);

                    actual = multiComponentsUtils.getSnugLayout(ps);
                    expect(actual).toEqual(undefined);
                });

                it('on a single component, should return the components layout', function () {
                    var comp1Pointer = getCompPointer(ps, 'positiveAxisComp', pageId);
                    var comp1Layout = component.layout.get(ps, comp1Pointer);
                    var actual = multiComponentsUtils.getSnugLayout(ps, [comp1Pointer]);
                    expect(actual).toEqual(comp1Layout);
                });

                it('two components - should return the surrounding layout', function () {
                    var actual = multiComponentsUtils.getSnugLayout(ps, [getCompPointer(ps, 'positiveAxisComp', pageId), getCompPointer(ps, 'comp2', pageId)]);
                    var expectedLayout = {
                        bounding: {x: 10, y: 20, height: 150, width: 140},
                        x: 10,
                        y: 20,
                        height: 150,
                        width: 140,
                        rotationInDegrees: 0
                    };

                    expect(actual).toEqual(expectedLayout);
                });

                it('three components, with some negative values - should return the surrounding layout', function () {
                    var actual = multiComponentsUtils.getSnugLayout(ps, [getCompPointer(ps, 'comp3', pageId), getCompPointer(ps, 'negativeXAxisCoordComp', pageId), getCompPointer(ps, 'negativeYAxisCoordComp', pageId)]);
                    expect(actual).toEqual({
                        bounding: {x: -5, y: -10, height: 140, width: 155},
                        x: -5,
                        y: -10,
                        height: 140,
                        width: 155,
                        rotationInDegrees: 0
                    });
                });

                it('should use the screenWidth for screen width components in the selection (this is for the public API of getSnugLayout)', function () {
                    var actual = multiComponentsUtils.getSnugLayout(ps, [getCompPointer(ps, 'positiveAxisComp', pageId), getCompPointer(ps, 'fullWidthComp', pageId)]);
                    expect(actual.width).toEqual(SCREEN_WIDTH);
                    expect(actual.bounding.width).toEqual(SCREEN_WIDTH);
                });
            });

            describe('getSnugLayoutRelativeToStructure', function () {
                it('should return undefined if no comps are inserted', function () {
                    var actual = multiComponentsUtils.getSnugLayoutRelativeToStructure(ps, []);
                    expect(actual).toBeUndefined();

                    actual = multiComponentsUtils.getSnugLayoutRelativeToStructure(ps);
                    expect(actual).toBeUndefined();
                });

                it('should return component layout, with single component as an argument', function () {
                    var comp1Pointer = getCompPointer(ps, 'positiveAxisComp', pageId);
                    var comp1LayoutRelativeToScreen = structure.getCompLayoutRelativeToStructure(ps, comp1Pointer);
                    var snugLayoutRelativeToScreen = multiComponentsUtils.getSnugLayoutRelativeToStructure(ps, [comp1Pointer]);
                    expect(snugLayoutRelativeToScreen).toEqual(comp1LayoutRelativeToScreen);
                });

                it('should return bounding box of multiple components with positive X and Y values', function () {
                    var snugLayoutRelativeToStructure = multiComponentsUtils.getSnugLayoutRelativeToStructure(ps, [getCompPointer(ps, 'positiveAxisComp', pageId), getCompPointer(ps, 'comp2', pageId)]);
                    //Header height / pagesContainer y is 100 so y equals 120
                    expect(snugLayoutRelativeToStructure).toEqual({
                        bounding: {x: 10, y: 120, width: 140, height: 150},
                        x: 10,
                        y: 120,
                        width: 140,
                        height: 150,
                        rotationInDegrees: 0
                    });
                });

                it('should return valid bounding box of multiple components with positive and negative X and Y values', function () {
                    var snugLayoutRelativeToStructure = multiComponentsUtils.getSnugLayoutRelativeToStructure(ps, [getCompPointer(ps, 'negativeXAxisCoordComp', pageId), getCompPointer(ps, 'negativeYAxisCoordComp', pageId)]);
                    expect(snugLayoutRelativeToStructure).toEqual({
                        bounding: {x: -5, y: 90, width: 155, height: 140},
                        x: -5,
                        y: 90,
                        width: 155,
                        height: 140,
                        rotationInDegrees: 0
                    });
                });

                it('should use x: siteX, width: screenWidth', function () {
                    var siteX = -60;
                    spyOn(ps.siteAPI, 'getSiteX').and.returnValue(siteX);

                    var snugLayoutRelativeToStructure = multiComponentsUtils.getSnugLayoutRelativeToStructure(ps, [getCompPointer(ps, 'positiveAxisComp', pageId), getCompPointer(ps, 'fullWidthComp', pageId)]);

                    expect(snugLayoutRelativeToStructure.x).toEqual(siteX);
                    expect(snugLayoutRelativeToStructure.width).toEqual(SCREEN_WIDTH);
                });
            });

            describe('getSnugLayoutRelativeToScreen', function () {
                it('should return undefined if no comps are inserted', function () {
                    var actual = multiComponentsUtils.getSnugLayoutRelativeToScreen(ps, []);
                    expect(actual).toBeUndefined();

                    actual = multiComponentsUtils.getSnugLayoutRelativeToScreen(ps);
                    expect(actual).toBeUndefined();
                });

                it('should return component layout, with single component as an argument', function () {
                    var comp1Pointer = getCompPointer(ps, 'positiveAxisComp', pageId);
                    var comp1LayoutRelativeToScreen = structure.getCompLayoutRelativeToScreen(ps, comp1Pointer);

                    var snugLayoutRelativeToScreen = multiComponentsUtils.getSnugLayoutRelativeToScreen(ps, [comp1Pointer]);
                    expect(snugLayoutRelativeToScreen).toEqual(comp1LayoutRelativeToScreen);
                });

                it('should return bounding box of multiple components with positive X and Y values', function () {

                    var siteX = Math.abs(ps.siteAPI.getSiteX());
                    var snugLayoutRelativeToScreen = multiComponentsUtils.getSnugLayoutRelativeToScreen(ps, [getCompPointer(ps, 'positiveAxisComp', pageId), getCompPointer(ps, 'comp2', pageId)]);
                    expect(snugLayoutRelativeToScreen).toEqual({
                        bounding: {x: 10 + siteX, y: 120, width: 140, height: 150},
                        x: 10 + siteX,
                        y: 120,
                        width: 140,
                        height: 150,
                        rotationInDegrees: 0
                    });
                });

                it('should return valid bounding box of multiple components with positibe and negative X and Y values', function () {
                    var siteX = Math.abs(ps.siteAPI.getSiteX());
                    var snugLayoutRelativeToScreen = multiComponentsUtils.getSnugLayoutRelativeToScreen(ps, [getCompPointer(ps, 'positiveAxisComp', pageId), getCompPointer(ps, 'comp2', pageId)]);
                    expect(snugLayoutRelativeToScreen).toEqual({
                        bounding: {x: 10 + siteX, y: 120, width: 140, height: 150},
                        x: 10 + siteX,
                        y: 120,
                        width: 140,
                        height: 150,
                        rotationInDegrees: 0
                    });

                });

                it('should return x:0, width: screenWidth if there are fullWidth comps in selection (this is for public API only)', function () {
                    //var siteX = Math.abs(ps.siteAPI.getSiteX());

                    var snugLayoutRelativeToScreen = multiComponentsUtils.getSnugLayoutRelativeToScreen(ps, [getCompPointer(ps, 'positiveAxisComp', pageId), getCompPointer(ps, 'fullWidthComp', pageId)]);

                    expect(snugLayoutRelativeToScreen.width).toEqual(SCREEN_WIDTH);
                    expect(snugLayoutRelativeToScreen.x).toEqual(0);
                });
            });

            describe('align', function () {
                beforeEach(function () {
                    spyOn(structure, 'updateCompLayout');
                });

                describe('left', function(){
                    it('should align components to the left', function () {
                        var comp2Pointer = getCompPointer(ps, 'comp2', pageId);
                        var comp3Pointer = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [comp2Pointer, comp3Pointer], constants.COMP_ALIGNMENT_OPTIONS.LEFT);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2Pointer, jasmine.objectContaining({x: 50}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3Pointer, jasmine.objectContaining({x: 50}));
                    });


                    it('should align all components to left of snugLayout if there is a full width component in the selection', function () {
                        var fullWidthComp = getCompPointer(ps, 'fullWidthComp', pageId);
                        var comp2 = getCompPointer(ps, 'comp2', pageId);
                        var comp3 = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [comp2, comp3, fullWidthComp], constants.COMP_ALIGNMENT_OPTIONS.LEFT);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({x: 0}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({x: 0}));
                    });

                    it('should align all components to the snuglayout which has negative x', function() {
                        var fullWidthComp = getCompPointer(ps, 'fullWidthComp', pageId);
                        var negativeXAxisCoordComp = getCompPointer(ps, 'negativeXAxisCoordComp', pageId);
                        var comp3 = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [negativeXAxisCoordComp, comp3, fullWidthComp], constants.COMP_ALIGNMENT_OPTIONS.LEFT);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, negativeXAxisCoordComp, jasmine.objectContaining({x: -5}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({x: -5}));
                    });

                    it('should not align the fullWidth component', function() {
                        var fullWidthComp = getCompPointer(ps, 'fullWidthComp', pageId);
                        var comp2 = getCompPointer(ps, 'comp2', pageId);
                        var comp3 = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [comp2, comp3, fullWidthComp], constants.COMP_ALIGNMENT_OPTIONS.LEFT);

                        expect(structure.updateCompLayout.calls.count()).toBe(2);
                    });

                });

                describe('right', function(){
                    it('should align components to the right', function () {
                        var comp2Pointer = getCompPointer(ps, 'comp2', pageId);
                        var comp3Pointer = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [comp2Pointer, comp3Pointer], constants.COMP_ALIGNMENT_OPTIONS.RIGHT);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2Pointer, jasmine.objectContaining({x: 50}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3Pointer, jasmine.objectContaining({x: 140}));
                    });

                    it('should align all components to x : (siteWidth - compWidth) if there is a full width component in the selection', function () {
                        var fullWidthComp = getCompPointer(ps, 'fullWidthComp', pageId);
                        var comp2 = getCompPointer(ps, 'comp2', pageId);
                        var comp3 = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [comp2, comp3, fullWidthComp], constants.COMP_ALIGNMENT_OPTIONS.RIGHT);

                        var siteWidth = ps.siteAPI.getSiteWidth();

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({x: siteWidth - 100}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({x: siteWidth - 10}));
                    });

                    it('should align all components to the right of the site if component outside of sitewidth on the right inside selection', function() {
                        this.addComponents([
                            {
                                id: 'outsideOfPageFromRightComp',
                                layout: {
                                    x: 950,
                                    width: 150,
                                    y: 10,
                                    height: 100
                                }
                            }
                        ]);
                        var fullWidthComp = getCompPointer(ps, 'fullWidthComp', pageId);
                        var outsideOfPageFromRightComp = getCompPointer(ps, 'outsideOfPageFromRightComp', pageId);
                        var comp3 = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [outsideOfPageFromRightComp, comp3, fullWidthComp], constants.COMP_ALIGNMENT_OPTIONS.RIGHT);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, outsideOfPageFromRightComp, jasmine.objectContaining({x: 950}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({x: 1100 - 10}));
                    });

                    it('should not align the fullWidth components', function() {
                        var fullWidthComp = getCompPointer(ps, 'fullWidthComp', pageId);
                        var comp2 = getCompPointer(ps, 'comp2', pageId);
                        var comp3 = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [comp2, comp3, fullWidthComp], constants.COMP_ALIGNMENT_OPTIONS.RIGHT);

                        expect(structure.updateCompLayout.calls.count()).toBe(2);
                    });

                });

                describe('top', function(){
                    it('should align components to the top', function () {
                        var topMostComp = getCompPointer(ps, 'topMostComp', pageId);
                        var comp3Pointer = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [topMostComp, comp3Pointer], constants.COMP_ALIGNMENT_OPTIONS.TOP);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, topMostComp, jasmine.objectContaining({y: 10}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3Pointer, jasmine.objectContaining({y: 10}));
                    });
                });

                describe('bottom', function(){
                    it('should align components to the bottom', function () {
                        var bottomMostComp = getCompPointer(ps, 'bottomMostComp', pageId);
                        var comp3Pointer = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [bottomMostComp, comp3Pointer], constants.COMP_ALIGNMENT_OPTIONS.BOTTOM);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, bottomMostComp, jasmine.objectContaining({y: 620}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3Pointer, jasmine.objectContaining({y: 690}));
                    });
                });



                describe('center', function(){
                    it('should align components to the center', function () {
                        var comp2 = getCompPointer(ps, 'comp2', pageId);
                        var comp3 = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [comp2, comp3], constants.COMP_ALIGNMENT_OPTIONS.CENTER);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({x: 50}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({x: 95}));
                    });

                    it('should align all components to center if there is a full width component in the selection, and ignore full width comp', function () {
                        var fullWidthComp = getCompPointer(ps, 'fullWidthComp', pageId);
                        var comp2 = getCompPointer(ps, 'comp2', pageId);
                        var comp3 = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [comp2, comp3, fullWidthComp], constants.COMP_ALIGNMENT_OPTIONS.CENTER);

                        //center is calculated as the page's center because full width comp makes snug layout to be the same as the page
                        //comp 2 -> 980 / 2 (page width /2 ) - 100 / 2 (comp width / 2)
                        var layoutForComp2 = structure.updateCompLayout.calls.argsFor(0)[2];
                        var layoutForComp3 = structure.updateCompLayout.calls.argsFor(1)[2];

                        expect(layoutForComp2).toContain({x: 490 - (100 / 2)});
                        expect(layoutForComp3).toContain({x: 490 - (10 / 2)});
                        expect(structure.updateCompLayout.calls.count()).toBe(2);
                    });
                });

                describe('middle', function(){
                    it('should align components to the middle', function () {
                        var comp2 = getCompPointer(ps, 'comp2', pageId);
                        var comp3 = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.align(ps, [comp2, comp3], constants.COMP_ALIGNMENT_OPTIONS.MIDDLE);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({y: 70}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({y: 115}));
                    });
                });

            });

            describe('distribute', function () {
                var dist1Comp, dist2Comp, dist3Comp, dist4Comp;

                beforeEach(function () {
                    this.addComponents([
                        {
                            id: 'dist1',
                            layout: {x: 60, y: 60, height: 20, width: 20}
                        },
                        {
                            id: 'dist2',
                            layout: {x: 64, y: 73, height: 20, width: 20}
                        },
                        {
                            id: 'dist3',
                            layout: {x: 70, y: 75, height: 20, width: 20}
                        },
                        {
                            id: 'dist4',
                            layout: {x: 150, y: 150, height: 20, width: 20}
                        }
                    ]);
                    dist1Comp = getCompPointer(ps, 'dist1', pageId);
                    dist2Comp = getCompPointer(ps, 'dist2', pageId);
                    dist3Comp = getCompPointer(ps, 'dist3', pageId);
                    dist4Comp = getCompPointer(ps, 'dist4', pageId);
                    spyOn(structure, 'updateCompLayout');
                });

                describe('with two or less components', function () {

                    it('should not affect layout when 2 components are distributed horizontally', function () {
                        var comp2 = getCompPointer(ps, 'comp2', pageId);
                        var comp3 = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.distribute(ps, [comp2, comp3], constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({x: 50}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({x: 140}));
                    });

                    it('should not affect layout when 2 components are distributed vertically', function () {
                        var comp2 = getCompPointer(ps, 'comp2', pageId);
                        var comp3 = getCompPointer(ps, 'comp3', pageId);
                        multiComponentsUtils.distribute(ps, [comp2, comp3], 'vertical');

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({y: 70}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({y: 160}));
                    });

                });

                describe('with more than two components', function () {

                    it('should distribute 4 components horizontally', function () {
                        multiComponentsUtils.distribute(ps, [dist1Comp, dist2Comp, dist3Comp, dist4Comp], constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist1Comp, jasmine.objectContaining({x: 60}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist2Comp, jasmine.objectContaining({x: 90}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist3Comp, jasmine.objectContaining({x: 120}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist4Comp, jasmine.objectContaining({x: 150}));
                    });

                    it('should distribute 4 components horizontally (change of order should not change result)', function () {
                        multiComponentsUtils.distribute(ps, [dist1Comp, dist2Comp, dist3Comp, dist4Comp], constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist1Comp, jasmine.objectContaining({x: 60}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist2Comp, jasmine.objectContaining({x: 90}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist3Comp, jasmine.objectContaining({x: 120}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist4Comp, jasmine.objectContaining({x: 150}));
                    });

                    it('should distribute 4 components vertically', function () {
                        multiComponentsUtils.distribute(ps, [dist1Comp, dist2Comp, dist3Comp, dist4Comp], constants.COMP_DISTRIBUTION_OPTIONS.VERTICAL);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist1Comp, jasmine.objectContaining({y: 60}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist2Comp, jasmine.objectContaining({y: 90}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist3Comp, jasmine.objectContaining({y: 120}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist4Comp, jasmine.objectContaining({y: 150}));
                    });

                    it('should distribute 4 components both horizontally and vertically', function () {
                        multiComponentsUtils.distribute(ps, [dist1Comp, dist2Comp, dist3Comp, dist4Comp], constants.COMP_DISTRIBUTION_OPTIONS.BOTH);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist1Comp, jasmine.objectContaining({x: 60}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist1Comp, jasmine.objectContaining({y: 60}));

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist2Comp, jasmine.objectContaining({x: 90}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist2Comp, jasmine.objectContaining({y: 90}));

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist3Comp, jasmine.objectContaining({x: 120}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist3Comp, jasmine.objectContaining({y: 120}));

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist4Comp, jasmine.objectContaining({x: 150}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, dist4Comp, jasmine.objectContaining({y: 150}));
                    });

                    it('already distributed components should not change upon another distribution', function () {

                        this.addComponents([
                            {
                                id: 'alreadyDist1',
                                layout: {
                                    x: 60,
                                    y: 60,
                                    height: 20,
                                    width: 20,
                                    bounding: {x: 60, y: 60, height: 20, width: 20}
                                }
                            },
                            {
                                id: 'alreadyDist2',
                                layout: {
                                    x: 90,
                                    y: 73,
                                    height: 20,
                                    width: 20,
                                    bounding: {x: 90, y: 73, height: 20, width: 20}
                                }
                            },
                            {
                                id: 'alreadyDist3',
                                layout: {
                                    x: 120,
                                    y: 75,
                                    height: 20,
                                    width: 20,
                                    bounding: {x: 120, y: 75, height: 20, width: 20}
                                }
                            },
                            {
                                id: 'alreadyDist4',
                                layout: {
                                    x: 150,
                                    y: 150,
                                    height: 20,
                                    width: 20,
                                    bounding: {x: 150, y: 150, height: 20, width: 20}
                                }
                            }
                        ]);

                        var alreadyDistComp1 = getCompPointer(ps, 'alreadyDist1', pageId);
                        var alreadyDistComp2 = getCompPointer(ps, 'alreadyDist2', pageId);
                        var alreadyDistComp3 = getCompPointer(ps, 'alreadyDist3', pageId);
                        var alreadyDistComp4 = getCompPointer(ps, 'alreadyDist4', pageId);

                        multiComponentsUtils.distribute(ps, [alreadyDistComp1, alreadyDistComp2, alreadyDistComp3, alreadyDistComp4], constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL);

                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, alreadyDistComp1, jasmine.objectContaining({x: 60}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, alreadyDistComp2, jasmine.objectContaining({x: 90}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, alreadyDistComp3, jasmine.objectContaining({x: 120}));
                        expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, alreadyDistComp4, jasmine.objectContaining({x: 150}));
                    });
                });

                describe('components in different container', function () {
                    beforeEach(function () {
                        this.addComponents([
                            {
                                id: 'distContainer1',
                                layout: {
                                    x: 0,
                                    y: 0,
                                    width: 300,
                                    height: 300
                                },
                                components: [
                                    {
                                        id: 'dist1InContainer',
                                        layout: {x: 60, y: 60, height: 20, width: 20}
                                    },
                                    {
                                        id: 'dist2InContainer',
                                        layout: {x: 80, y: 80, height: 20, width: 20}
                                    }
                                ]
                            },
                            {
                                id: 'distContainer2',
                                layout: {
                                    x: 110, y: 50, width: 60, height: 90
                                },
                                components: [
                                    {
                                        id: 'dist3InContainer',
                                        layout: {x: 70, y: 70, height: 20, width: 20}
                                    },
                                    {
                                        id: 'dist4InContainer',
                                        layout: {x: 160, y: 160, height: 20, width: 20}
                                    }
                                ]
                            }
                        ]);

                        dist1Comp = getCompPointer(ps, 'dist1InContainer', pageId);
                        dist2Comp = getCompPointer(ps, 'dist2InContainer', pageId);
                        dist3Comp = getCompPointer(ps, 'dist3InContainer', pageId);
                        dist4Comp = getCompPointer(ps, 'dist4InContainer', pageId);
                    });

                    it('should distribute 4 components horizontally', function () {
                        multiComponentsUtils.distribute(ps, [dist1Comp, dist2Comp, dist3Comp, dist4Comp], constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL);

                        var layoutForDist1 = structure.updateCompLayout.calls.argsFor(0)[2];
                        var layoutForDist2 = structure.updateCompLayout.calls.argsFor(1)[2];
                        var layoutForDist3 = structure.updateCompLayout.calls.argsFor(2)[2];
                        var layoutForDist4 = structure.updateCompLayout.calls.argsFor(3)[2];
                        expect(layoutForDist1).toContain({x: 60});
                        expect(layoutForDist2).toContain({x: 130});
                        expect(layoutForDist3).toContain({x: 200 - 110});
                        expect(layoutForDist4).toContain({x: 270 - 110});
                    });

                    it('should distribute 4 components vertically', function () {
                        multiComponentsUtils.distribute(ps, [dist1Comp, dist2Comp, dist3Comp, dist4Comp], constants.COMP_DISTRIBUTION_OPTIONS.VERTICAL);

                        var layoutForDist1 = structure.updateCompLayout.calls.argsFor(0)[2];
                        var layoutForDist2 = structure.updateCompLayout.calls.argsFor(1)[2];
                        var layoutForDist3 = structure.updateCompLayout.calls.argsFor(2)[2];
                        var layoutForDist4 = structure.updateCompLayout.calls.argsFor(3)[2];
                        expect(layoutForDist1).toContain({y: 60});
                        expect(layoutForDist2).toContain({y: 110});
                        expect(layoutForDist3).toContain({y: 160 - 50});
                        expect(layoutForDist4).toContain({y: 210 - 50});
                    });

                });

                describe('cases with rotated components', function () {
                    var rotatedComp;

                    it('should distribute 4 components horizontally (rotated comp got different bounding layout than its regular layout)', function () {
                        this.addComponents([
                            {
                                id: 'rotatedComp',
                                layout: {
                                    x: 155,
                                    y: 155,
                                    width: 10,
                                    height: 20,
                                    rotationInDegrees: 90
                                }
                            }
                        ]);

                        rotatedComp = getCompPointer(ps, 'rotatedComp', pageId);

                        multiComponentsUtils.distribute(ps, [dist1Comp, dist2Comp, dist3Comp, rotatedComp], constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL);

                        var layoutForDist1 = structure.updateCompLayout.calls.argsFor(0)[2];
                        var layoutForDist2 = structure.updateCompLayout.calls.argsFor(1)[2];
                        var layoutForDist3 = structure.updateCompLayout.calls.argsFor(2)[2];
                        var layoutForRotatedComp = structure.updateCompLayout.calls.argsFor(3)[2];
                        expect(layoutForDist1).toContain({x: 60});
                        expect(layoutForDist2).toContain({x: 90});
                        expect(layoutForDist3).toContain({x: 120});
                        expect(layoutForRotatedComp).toContain({x: 150 + 5}); //diff for rotated width
                    });

                    it('should distribute 4 components vertically (rotated comp got different bounding layout than its regular layout)', function () {
                        this.addComponents([
                            {
                                id: 'rotatedComp',
                                layout: {
                                    x: 155,
                                    y: 155,
                                    width: 20,
                                    height: 10,
                                    rotationInDegrees: 90
                                }
                            }
                        ]);

                        rotatedComp = getCompPointer(ps, 'rotatedComp', pageId);

                        multiComponentsUtils.distribute(ps, [dist1Comp, dist2Comp, dist3Comp, rotatedComp], constants.COMP_DISTRIBUTION_OPTIONS.VERTICAL);

                        var layoutForDist1 = structure.updateCompLayout.calls.argsFor(0)[2];
                        var layoutForDist2 = structure.updateCompLayout.calls.argsFor(1)[2];
                        var layoutForDist3 = structure.updateCompLayout.calls.argsFor(2)[2];
                        var layoutForRotatedComp = structure.updateCompLayout.calls.argsFor(3)[2];
                        expect(layoutForDist1).toContain({y: 60});
                        expect(layoutForDist2).toContain({y: 90});
                        expect(layoutForDist3).toContain({y: 120});
                        expect(layoutForRotatedComp).toContain({y: 150 + 5});
                    });

                });

                describe('negative spaces', function () {

                    it('should distribute 3 components with negative space horizontally (causing overlap)', function () {
                        this.addComponents([
                            {
                                id: 'wideComp',
                                layout: {x: 70, y: 70, height: 90, width: 150}
                            }
                        ]);
                        var wideComp = getCompPointer(ps, 'wideComp', pageId);
                        multiComponentsUtils.distribute(ps, [dist1Comp, wideComp, dist4Comp], constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL);

                        var layoutForDist1 = structure.updateCompLayout.calls.argsFor(0)[2];
                        var layoutForWideComp = structure.updateCompLayout.calls.argsFor(1)[2];
                        var layoutForDist4 = structure.updateCompLayout.calls.argsFor(2)[2];
                        expect(layoutForDist1).toContain({x: 60});
                        expect(layoutForWideComp).toContain({x: 65});
                        expect(layoutForDist4).toContain({x: 200});
                    });


                    it('should distribute 3 components with negative space vertically (causing overlap)', function () {
                        this.addComponents([
                            {
                                id: 'highComp',
                                layout: {x: 70, y: 70, height: 420, width: 90}
                            }
                        ]);
                        var highComp = getCompPointer(ps, 'highComp', pageId);
                        multiComponentsUtils.distribute(ps, [dist1Comp, highComp, dist4Comp], constants.COMP_DISTRIBUTION_OPTIONS.VERTICAL);

                        var layoutForDist1 = structure.updateCompLayout.calls.argsFor(0)[2];
                        var layoutForHighComp = structure.updateCompLayout.calls.argsFor(1)[2];
                        var layoutForDist4 = structure.updateCompLayout.calls.argsFor(2)[2];
                        expect(layoutForDist1).toContain({y: 60});
                        expect(layoutForHighComp).toContain({y: 65});
                        expect(layoutForDist4).toContain({y: 470});
                    });
                });

                describe('Full Width comp in selection', function(){
                    it('should ignore full width comp when trying to distribute', function() {
                        var fullWidthComp = getCompPointer(ps, 'fullWidthComp', pageId);

                        multiComponentsUtils.distribute(ps, [dist1Comp, fullWidthComp, dist3Comp, dist4Comp], constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL);

                        var layoutForDist1 = structure.updateCompLayout.calls.argsFor(0)[2];
                        var layoutForDist3 = structure.updateCompLayout.calls.argsFor(1)[2];
                        var layoutForDist4 = structure.updateCompLayout.calls.argsFor(2)[2];

                        expect(structure.updateCompLayout.calls.count()).toEqual(3);
                        expect(layoutForDist1).toContain({x: 60});
                        expect(layoutForDist3).toContain({x: 105});
                        expect(layoutForDist4).toContain({x: 150});
                    });

                    describe('when only two or less comps are not full width', function(){
                        it('and they already distributed, it should not affect their position', function() {
                            this.addComponents([
                                {
                                    id: 'alreadyDist1',
                                    layout: {
                                        x: 60,
                                        y: 60,
                                        height: 20,
                                        width: 20,
                                        bounding: {x: 60, y: 60, height: 20, width: 20}
                                    }
                                },
                                {
                                    id: 'alreadyDist2',
                                    layout: {
                                        x: 90,
                                        y: 73,
                                        height: 20,
                                        width: 20,
                                        bounding: {x: 90, y: 73, height: 20, width: 20}
                                    }
                                }
                            ]);

                            var fullWidthComp = getCompPointer(ps, 'fullWidthComp', pageId);
                            var alreadyDistComp1 = getCompPointer(ps, 'alreadyDist1', pageId);
                            var alreadyDistComp2 = getCompPointer(ps, 'alreadyDist2', pageId);

                            multiComponentsUtils.distribute(ps, [alreadyDistComp1, alreadyDistComp2, fullWidthComp], constants.COMP_DISTRIBUTION_OPTIONS.HORIZONTAL);

                            expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, alreadyDistComp1, jasmine.objectContaining({x: 60}));
                            expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, alreadyDistComp2, jasmine.objectContaining({x: 90}));

                            expect(structure.updateCompLayout.calls.count()).toBe(2);
                        });
                    });
                });
            });

            describe('matchSize', function () {
                beforeEach(function () {
                    this.addComponents([
                        {
                            id: 'rotatedComp',
                            layout: {
                                x: 5,
                                y: 20,
                                height: 180,
                                width: 65,
                                rotationInDegrees: 20
                            }
                        }
                    ]);

                    spyOn(structure, 'updateCompLayout');
                });

                it('should match size of components to width', function () {
                    var comp1 = getCompPointer(ps, 'positiveAxisComp', pageId);
                    var comp2 = getCompPointer(ps, 'comp2', pageId);
                    var comp3 = getCompPointer(ps, 'comp3', pageId);
                    var comp4 = getCompPointer(ps, 'negativeXAxisCoordComp', pageId);

                    multiComponentsUtils.matchSize(ps, [comp1, comp2, comp3, comp4], constants.COMP_MATCH_SIZE_OPTIONS.WIDTH);
                    var averageWidth = 60;

                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp1, jasmine.objectContaining({width: averageWidth}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({width: averageWidth}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({width: averageWidth}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp4, jasmine.objectContaining({width: averageWidth}));
                });

                it('should ignore width of full width component when match sizing to width', function () {
                    this.addComponents([
                        {
                            id: 'negativeXAxisComp',
                            layout: {
                                bounding: {x: -5, y: 80, height: 50, width: 50},
                                x: -5,
                                y: 80,
                                height: 50,
                                width: 70
                            }
                        }
                    ]);
                    var fullWidthComp = getCompPointer(ps, 'fullWidthComp', pageId);
                    var comp2 = getCompPointer(ps, 'comp2', pageId);
                    var comp3 = getCompPointer(ps, 'comp3', pageId);
                    var comp4 = getCompPointer(ps, 'negativeXAxisComp', pageId);

                    multiComponentsUtils.matchSize(ps, [fullWidthComp, comp2, comp3, comp4], constants.COMP_MATCH_SIZE_OPTIONS.WIDTH);
                    //full width - 1100
                    //comp2 - 100
                    //comp3 - 10
                    //negativeXAxisComp - 70
                    //ignoring full width
                    var averageWidth = 60;

                    expect(averageWidth).toBe(180 / 3); //full width should be ignored

                    var layoutForComp1 = structure.updateCompLayout.calls.argsFor(0)[2];
                    var layoutForComp2 = structure.updateCompLayout.calls.argsFor(1)[2];
                    var layoutForComp3 = structure.updateCompLayout.calls.argsFor(2)[2];

                    expect(layoutForComp1).toContain({width: averageWidth});
                    expect(layoutForComp2).toContain({width: averageWidth});
                    expect(layoutForComp3).toContain({width: averageWidth});
                });

                it('should match size of components to height', function () {
                    var comp1 = getCompPointer(ps, 'positiveAxisComp', pageId);
                    var comp2 = getCompPointer(ps, 'comp2', pageId);
                    var comp3 = getCompPointer(ps, 'comp3', pageId);
                    var comp4 = getCompPointer(ps, 'negativeXAxisCoordComp', pageId);

                    multiComponentsUtils.matchSize(ps, [comp1, comp2, comp3, comp4], constants.COMP_MATCH_SIZE_OPTIONS.HEIGHT);
                    var averageHeight = 57.5;

                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp1, jasmine.objectContaining({height: averageHeight}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({height: averageHeight}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({height: averageHeight}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp4, jasmine.objectContaining({height: averageHeight}));
                });

                it('should match size of components to height even if there is a full width comp in the selection', function () {
                    var comp1 = getCompPointer(ps, 'positiveAxisComp', pageId);
                    var comp2 = getCompPointer(ps, 'comp2', pageId);
                    var comp3 = getCompPointer(ps, 'comp3', pageId);
                    var fullWidthComp = getCompPointer(ps, 'fullWidthComp', pageId);

                    //70 + 10 + 100 + 100 / 4
                    var averageHeight = 70;

                    multiComponentsUtils.matchSize(ps, [comp1, comp2, comp3, fullWidthComp], constants.COMP_MATCH_SIZE_OPTIONS.HEIGHT);


                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp1, jasmine.objectContaining({height: averageHeight}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({height: averageHeight}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({height: averageHeight}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, fullWidthComp, jasmine.objectContaining({height: averageHeight}));
                });

                it('match size with rotated component', function () {
                    var comp1 = getCompPointer(ps, 'positiveAxisComp', pageId);
                    var comp2 = getCompPointer(ps, 'comp2', pageId);
                    var comp3 = getCompPointer(ps, 'comp3', pageId);
                    var rotatedComp = getCompPointer(ps, 'rotatedComp', pageId);

                    multiComponentsUtils.matchSize(ps, [comp1, comp2, comp3, rotatedComp], constants.COMP_MATCH_SIZE_OPTIONS.WIDTH);
                    var averageWidth = 63.75;

                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp1, jasmine.objectContaining({width: averageWidth}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({width: averageWidth}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({width: averageWidth}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, rotatedComp, jasmine.objectContaining({width: averageWidth}));
                });

                it('should match size of components to both width and height', function () {
                    var comp1 = getCompPointer(ps, 'positiveAxisComp', pageId);
                    var comp2 = getCompPointer(ps, 'comp2', pageId);
                    var comp3 = getCompPointer(ps, 'comp3', pageId);
                    var comp4 = getCompPointer(ps, 'negativeXAxisCoordComp', pageId);

                    multiComponentsUtils.matchSize(ps, [comp1, comp2, comp3, comp4], constants.COMP_MATCH_SIZE_OPTIONS.BOTH);

                    var averageDimensions = {
                        width: 60,
                        height: 57.5
                    };

                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp1, jasmine.objectContaining({width: averageDimensions.width}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp1, jasmine.objectContaining({height: averageDimensions.height}));

                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({width: averageDimensions.width}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp2, jasmine.objectContaining({height: averageDimensions.height}));

                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({width: averageDimensions.width}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp3, jasmine.objectContaining({height: averageDimensions.height}));

                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp4, jasmine.objectContaining({width: averageDimensions.width}));
                    expect(structure.updateCompLayout).toHaveBeenCalledWith(ps, comp4, jasmine.objectContaining({height: averageDimensions.height}));
                });

            });
        });
    });
