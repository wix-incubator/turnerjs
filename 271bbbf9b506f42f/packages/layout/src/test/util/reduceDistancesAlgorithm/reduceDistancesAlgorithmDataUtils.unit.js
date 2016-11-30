define(['lodash', 'coreUtils', 'testUtils',
        'layout/util/reduceDistancesAlgorithm/reduceDistancesAlgorithmDataUtils',
        'layout/util/reduceDistancesAlgorithm/createAnchorsDataManager',
        'layout/util/reduceDistancesAlgorithm/createMeasureMapManager',
        'layout/util/reduceDistancesAlgorithm/createOriginalValuesManager'
    ],
    function (_, coreUtils, testUtils, reduceDistancesAlgorithmDataUtils, createAnchorsDataManager, createMeasureMapManager, createOriginalValuesManager) {
    'use strict';

    describe('reduceDistancesAlgorithmDataUtils', function () {

        describe('generateEnforceData', function(){

            var currentPageId, masterPageChildren, siteData, masterPageStructure, blankAnchorsMap, blankOriginalValues, blankMeasureMap,
                isMobileView, skipEnforceAnchors, lockedCompsMap;

            beforeEach(function(){
                currentPageId = 'currentPage';
                blankAnchorsMap = {};
                blankOriginalValues = {};
                blankMeasureMap = testUtils.mockFactory.createBlankMeasureMap();
                masterPageChildren = [{
                    componentType: 'mobile.core.components.Container',
                    components: [],
                    id: 'testContainer',
                    layout: {
                        anchors: [],
                        fixedPosition: false,
                        height: 300,
                        rotationDegrees: 0,
                        scale: 1,
                        width: 491,
                        x: 0,
                        y: 480
                    },
                    skin: '',
                    styleId: 'c2',
                    type: 'Container'
                }];
                siteData = testUtils.mockFactory.mockSiteData().addDesktopComps(masterPageChildren, 'masterPage');
                masterPageStructure = siteData.pagesData.masterPage.structure;
                isMobileView = false;
                skipEnforceAnchors = false;
                lockedCompsMap = {};
            });

            function addComponentsToCurrentPage(components, isMobileComponents){
                _.forEach(components, function(component){
                    testUtils.mockFactory.addCompToPage(siteData, currentPageId, component, isMobileComponents);
                });

                return siteData.pagesData[currentPageId].structure;
            }

            function addComponentsToDesktopCurrentPage(components){
                return addComponentsToCurrentPage(components, false);
            }

            function addComponentsToMobileCurrentPage(components){
                return addComponentsToCurrentPage(components, true);
            }

            function getCurrentPageStructure(){
                return siteData.pagesData[currentPageId].structure;
            }

            describe('structure', function(){
                var HARD_WIRED_COMPS = ['masterPage', 'SITE_BACKGROUND', 'SITE_HEADER', 'PAGES_CONTAINER', 'SITE_FOOTER', 'SITE_PAGES'];

                function isHardWiredComponentsOnly(structure){

                    function isHardWiredRecursively(component){
                        var isHardWired = _.includes(HARD_WIRED_COMPS, component.id);

                        if (!isHardWired){
                            return false;
                        }

                        var children = component.children || component.components;

                        return _.every(children, isHardWiredRecursively);
                    }

                    return isHardWiredRecursively(structure);
                }

                it('should only have hard-wired comps if skipEnforceAnchors is true', function(){
                    skipEnforceAnchors = true;


                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(masterPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    expect(isHardWiredComponentsOnly(enforceData.structure)).toBeTruthy();
                });

                it('should be equal to the given structure skipEnforceAnchors is false', function(){
                    skipEnforceAnchors = false;

                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(masterPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    expect(enforceData.structure).toEqual(masterPageStructure);
                });
            });

            describe('skipEnforce', function(){
                // todo - add tests
            });

            describe('measureMapManager', function(){
                it('should return new MeasureMapManager', function(){
                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(masterPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    var measureMapManager = createMeasureMapManager();

                    expect(enforceData.measureMapManager).toBeInstanceOf(measureMapManager.constructor);
                });


            });

            describe('anchorsDataManager', function(){
                it('should return new anchorsDataManager', function(){
                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(masterPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    var anchorsDataManager = createAnchorsDataManager();

                    expect(enforceData.anchorsDataManager).toBeInstanceOf(anchorsDataManager.constructor);
                });

                it('should inject anchors from measureMap.injectedAnchors', function(){
                    var injectedCompId = 'comp-a';
                    var injectedAnchor = {
                        "distance": 0,
                        "locked": true,
                        "originalValue": 0,
                        "fromComp": injectedCompId,
                        "targetComponent": 'container',
                        "type": "BOTTOM_PARENT"
                    };

                    blankMeasureMap.injectedAnchors = {};
                    blankMeasureMap.injectedAnchors[injectedCompId] = injectedAnchor;

                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(masterPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);
                    var anchor = enforceData.anchorsDataManager.getComponentAnchorToParent(injectedCompId);

                    expect(anchor).toEqual(injectedAnchor);
                });
            });

            describe('originalValuesManager', function(){
                it('should return new originalValuesManager', function(){
                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(masterPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    var originalValuesManager = createOriginalValuesManager();

                    expect(enforceData.originalValuesManager).toBeInstanceOf(originalValuesManager.constructor);
                });
            });

            describe('isMobileView', function(){
                it('should equal to the given isMobileView', function(){
                    isMobileView = true;

                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(masterPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    expect(enforceData.isMobileView).toEqual(true);
                });
            });

            describe('flatDataMap', function(){
                it('should return all component in structure as flat object', function(){
                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(masterPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    var allComponentsIds = ['masterPage', 'SITE_HEADER', 'SITE_FOOTER', 'PAGES_CONTAINER', 'SITE_PAGES', 'testContainer'].sort();
                    var resultComponentIds = _.keys(enforceData.flatDataMap).sort();

                    expect(resultComponentIds).toEqual(allComponentsIds);
                });

                it('should not include descendants of collapsed componnets', function(){
                    var comp1 = {
                        id: 'collapsedContainer',
                        components: [{
                            id: 'child',
                            layout: {
                                height: 100,
                                width: 100,
                                x: 0,
                                y: 0
                            }
                        }],
                        layout: {
                            x: 281,
                            y: 72,
                            width: 88,
                            height: 40,
                            rotationInDegrees: 30
                        }
                    };

                    blankMeasureMap.collapsed.collapsedContainer = true;
                    var currentPageStructure = addComponentsToCurrentPage([comp1]);
                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(currentPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);


                    expect(enforceData.flatDataMap.child).not.toBeDefined();
                });

                describe('viewMode', function(){
                    var desktopComponent, mobileComponent, currentPageStructure;

                    beforeEach(function(){
                        desktopComponent = {
                            id: 'comp-1',
                            layout: {
                                height: 300,
                                width: 491,
                                x: 0,
                                y: 480
                            }
                        };
                        mobileComponent = {
                            id: 'comp-1',
                            layout: {
                                height: 50,
                                width: 200,
                                x: 0,
                                y: 20
                            }
                        };

                        addComponentsToDesktopCurrentPage([desktopComponent]);
                        addComponentsToMobileCurrentPage([mobileComponent]);

                        currentPageStructure = getCurrentPageStructure();
                    });

                    it('should return mobile components in mobile mode', function(){
                        isMobileView = true;
                        var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(currentPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                        expect(enforceData.flatDataMap['comp-1']).toEqual(mobileComponent);
                    });

                    it('should return desktop components in desktop mode', function(){
                        isMobileView = false;
                        var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(currentPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                        expect(enforceData.flatDataMap['comp-1']).toEqual(desktopComponent);
                    });
                });
            });

            describe('lockedCompsMap', function(){
                it('should be equal to the given lockedCompsMap', function(){
                    lockedCompsMap = {'lockedComp': true};

                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(masterPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    expect(enforceData.lockedCompsMap).toEqual(lockedCompsMap);
                });

                it('should be empty object if the given lockedCompsMap is undefined', function(){
                    lockedCompsMap = undefined;

                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(masterPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    expect(enforceData.lockedCompsMap).toEqual({});
                });
            });

            describe('layoutsMap', function(){
                it('should include all components layouts data', function(){
                    var comp1 = {
                        id: 'comp-1',
                        layout: {
                            height: 300,
                            width: 491,
                            x: 0,
                            y: 480
                        }
                    };
                    var comp2 = {
                        id: 'comp-2',
                        layout: {
                            height: 100,
                            width: 100,
                            x: 0,
                            y: 0
                        }
                    };
                    var currentPageStructure = addComponentsToCurrentPage([comp1, comp2]);
                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(currentPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    expect(enforceData.layoutsMap['comp-1']).toEqual(comp1.layout);
                    expect(enforceData.layoutsMap['comp-2']).toEqual(comp2.layout);
                });

                it('should override dimensions for rotated components with bounding rect dimensions', function(){
                    var comp1 = {
                        id: 'comp-1',
                        layout: {
                            x: 281,
                            y: 72,
                            width: 88,
                            height: 40,
                            rotationInDegrees: 30
                        }
                    };

                    var currentPageStructure = addComponentsToCurrentPage([comp1]);
                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(currentPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    var boundingRect = coreUtils.boundingLayout.getBoundingLayout(comp1.layout);
                    var expectedLayout = _.defaults(boundingRect, comp1.layout);

                    expect(enforceData.layoutsMap['comp-1']).toEqual(expectedLayout);
                });

                it('should create a flat map of layout data for each component id', function(){
                    var stretchedToScreenComp = {
                        id: 'comp-1',
                        layout: {
                            height: 300,
                            width: 491,
                            x: 0,
                            y: 480,
                            docked: {
                                top: {
                                    vh: 0
                                },
                                bottom: {
                                    vh: 0
                                }
                            }
                        }
                    };
                    var comp2 = {
                        id: 'comp-2',
                        layout: {
                            height: 100,
                            width: 100,
                            x: 0,
                            y: 0
                        }
                    };
                    var currentPageStructure = addComponentsToCurrentPage([stretchedToScreenComp, comp2]);
                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(currentPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    var allComponentsIds = ['comp-1', 'comp-2', 'currentPage'].sort();
                    var resultComponentIds = _.keys(enforceData.layoutsMap).sort();

                    expect(resultComponentIds).toEqual(allComponentsIds);
                });

                describe('remove docked top and bottom properties for vertically stretched to screen components', function(){
                    it('should remove docked top and bottom property from layout if the comp is vertically stretched to screen', function(){
                        var stretchedToScreenComp = {
                            id: 'comp-1',
                            layout: {
                                height: 300,
                                width: 491,
                                x: 0,
                                y: 480,
                                docked: {
                                    top: {
                                        vh: 0
                                    },
                                    bottom: {
                                        vh: 0
                                    }
                                }
                            }
                        };
                        var comp2 = {
                            id: 'comp-2',
                            layout: {
                                height: 100,
                                width: 100,
                                x: 0,
                                y: 0
                            }
                        };
                        var currentPageStructure = addComponentsToCurrentPage([stretchedToScreenComp, comp2]);
                        var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(currentPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                        expect(enforceData.layoutsMap[stretchedToScreenComp.id].docked.top).toBeUndefined();
                        expect(enforceData.layoutsMap[stretchedToScreenComp.id].docked.bottom).toBeUndefined();
                    });

                    it('should not change original structure', function(){
                        var stretchedToScreenComp = {
                            id: 'comp-1',
                            layout: {
                                height: 300,
                                width: 491,
                                x: 0,
                                y: 480,
                                docked: {
                                    top: {
                                        vh: 0
                                    },
                                    bottom: {
                                        vh: 0
                                    }
                                }
                            }
                        };
                        var comp2 = {
                            id: 'comp-2',
                            layout: {
                                height: 100,
                                width: 100,
                                x: 0,
                                y: 0
                            }
                        };
                        var currentPageStructure = addComponentsToCurrentPage([stretchedToScreenComp, comp2]);
                        var pageStructureBeforeGenerate = _.cloneDeep(currentPageStructure);

                        reduceDistancesAlgorithmDataUtils.generateEnforceData(currentPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                        expect(currentPageStructure).toEqual(pageStructureBeforeGenerate);
                    });
                });

                it('should NOT remove docked property from layout if the comp is vertically stretched but not to screen (vh)', function(){
                    var stretchedToScreenComp = {
                        id: 'comp-1',
                        layout: {
                            height: 300,
                            width: 491,
                            x: 0,
                            y: 480,
                            docked: {
                                top: {
                                    px: 0
                                },
                                bottom: {
                                    px: 0
                                }
                            }
                        }
                    };
                    var comp2 = {
                        id: 'comp-2',
                        layout: {
                            height: 100,
                            width: 100,
                            x: 0,
                            y: 0
                        }
                    };
                    var currentPageStructure = addComponentsToCurrentPage([stretchedToScreenComp, comp2]);
                    var enforceData = reduceDistancesAlgorithmDataUtils.generateEnforceData(currentPageStructure, blankMeasureMap, blankAnchorsMap, blankOriginalValues, isMobileView, skipEnforceAnchors, lockedCompsMap);

                    expect(enforceData.layoutsMap[stretchedToScreenComp.id].docked.top).toBeDefined();
                    expect(enforceData.layoutsMap[stretchedToScreenComp.id].docked.bottom).toBeDefined();
                });
            });
        });
    });
});
