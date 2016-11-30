define(['lodash', 'testUtils', 'utils',
    'definition!documentServices/structure/structure',
    'fake!documentServices/anchors/anchors',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/component/component',
    'documentServices/component/componentModes',
    'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/measure/fixedComponentMeasuring',
    'documentServices/structure/structureUtils',
    'documentServices/structure/relativeToScreenPlugins/relativeToScreenPlugins',
    'documentServices/dataModel/dataModel',
    'documentServices/measure/textMeasuring',
    'documentServices/structure/utils/layoutConstraintsUtils',
    'documentServices/hooks/layoutHooksRegistrar',
    'documentServices/hooks/hooks',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/smartBoxes/groupingUtils',
    'documentServices/structure/utils/windowScroll',
    'documentServices/structure/utils/componentLayout',
    'documentServices/structure/utils/layoutValidation',
    'documentServices/structure/siteGapMap',
    'documentServices/page/popupUtils',
    'documentServices/bi/events.json',
    'documentServices/actionsAndBehaviors/actionsAndBehaviors',
    'animations',
    'experiment',
    'documentServices/dataModel/ConnectionSchemas.json'], function
    (_, testUtils, utils, structureDefinition, fakeAnchors, componentsMetaData, component,
     componentModes, constants, privateServicesHelper, fixedComponentMeasuring, structureUtils,
     relativeToScreenPlugins, dataModel, textMeasuring, layoutConstraintsUtils, layoutHooksRegistrar,
     hooks, documentModeInfo, groupingUtils, windowScroll, componentLayout, layoutValidation, siteGapMap,
     popupUtils, biEvents, actionsAndBehaviors, animations, experiment, connectionSchemas) {
    'use strict';

    describe('Document Services - Structure API', function () {
        var openExperiments = testUtils.experimentHelper.openExperiments;
        var structure, privateServices;
        var mockDataSchemas = {
            someType: {
                properties: {
                    mockRef: 'ref',
                    mockRefList: 'refList'
                }
            }
        };

        var mockDesignSchemas = {
            "MediaContainerDesignData": {
                "properties": {
                    "background": {"type": ["string", "null"], "pseudoType": ["ref"]}
                }
            },
            "BackgroundMedia": {
                "properties": {
                    "mediaRef": {"type": ["string", "null"], "pseudoType": ["ref"]},
                    "imageOverlay": {"type": ["string", "null"], "pseudoType": ["ref"]}
                }
            }
        };

        var mockBehaviorsSchemas = {};


        var siteData;
        var mockPropertiesSchemas = {};
        var jsonPaths;

        function createButtonWithFixedStructure(x, y) {
            var button = createButtonWithoutFixedPos(x, y);
            button.layout.fixedPosition = true;
            return button;
        }

        function createButtonWithoutFixedPos(x, y, id) {
            return {
                "id": id || "buttonA",
                "type": "Component",
                "layout": {
                    "width": 60,
                    "height": 30,
                    "x": x === 0 ? x : x || 70,
                    "y": y === 0 ? y : y || 80,
                    "rotationInDegrees": 0
                },
                "style": "b1",
                "componentType": "wysiwyg.viewer.components.SiteButton",
                "dataQuery": "#dataQuery-" + (id || 'noID'),
                "propertyQuery": "propItem"
            };
        }

        function createContainerWithFixedPosition(x, y, children) {
            var containerStructure = createContainerStructure(x, y, children);
            containerStructure.layout.fixedPosition = true;
            return containerStructure;
        }

        function createContainerStructure(x, y, children) {
            return {
                "id": "container",
                "type": "Container",
                "layout": {
                    "width": 400,
                    "height": 200,
                    "x": x === 0 ? x : x || 50,
                    "y": y === 0 ? y : y || 50,
                    "rotationInDegrees": 0,
                    "anchors": []
                },
                "componentType": "mobile.core.components.Container",
                "components": children || []
            };
        }

        function createContainerWithModesStructure(id, x, y, children) {
            id = id || '';
            return {
                "id": id || 'containerWithModes',
                "type": 'Container',
                "layout": {
                    "width": 500,
                    "height": 400,
                    "x": x === 0 ? x : x || 50,
                    "y": y === 0 ? y : y || 50,
                    "rotationInDegrees": 0
                },
                "componentType": 'mobile.core.components.Container',
                "modes": {
                    "definitions": [{
                        modeId: 'mode1',
                        type: 'DEFAULT'
                    }, {
                        modeId: 'mode2',
                        type: 'HOVER'
                    }],
                    "overrides": [{
                        modeIds: ['mode1'],
                        designQuery: '#hbOvrDesignDataId1'
                    },
                        {
                            modeIds: ['mode2'],
                            overridingProperty: 'overriding-value1',
                            designQuery: '#hbOvrDesignDataId2'
                        }, {
                            modeIds: ['external-mode-of-some-parent'],
                            overridingProperty: 'overriding-value2'
                        }]
                },
                "components": children || []
            };
        }

        function prepareTest(pageId, pageComps) {
            siteData.addPageWithDefaults(pageId, pageComps);
            privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, jsonPaths);
        }

        function createMockPrivateServicesWithPages(pages, showOnAllPagesComponents) {
            showOnAllPagesComponents = showOnAllPagesComponents || [];
            var pageContainer = {
                "type": "Container",
                "id": "PAGES_CONTAINER",
                "components": [
                    {
                        "type": "Container",
                        "id": "SITE_PAGES",
                        "components": [],
                        "skin": "wysiwyg.viewer.skins.PageGroupSkin",
                        "layout": {
                            "width": 980,
                            "height": 500,
                            "x": 0,
                            "y": 0,
                            "scale": 1,
                            "rotationInDegrees": 0,
                            "anchors": [
                                {
                                    "distance": 0,
                                    "topToTop": 0,
                                    "originalValue": 500,
                                    "type": "BOTTOM_PARENT",
                                    "locked": true,
                                    "targetComponent": "PAGES_CONTAINER"
                                },
                                {
                                    "distance": 119,
                                    "locked": true,
                                    "originalValue": 619,
                                    "fromComp": "SITE_PAGES",
                                    "targetComponent": "PAGES_CONTAINER",
                                    "topToTop": null,
                                    "type": "BOTTOM_PARENT"
                                },
                                {
                                    "distance": 238,
                                    "locked": true,
                                    "originalValue": 738,
                                    "fromComp": "SITE_PAGES",
                                    "targetComponent": "PAGES_CONTAINER",
                                    "topToTop": null,
                                    "type": "BOTTOM_PARENT"
                                }
                            ],
                            "fixedPosition": false
                        },
                        "propertyQuery": "SITE_PAGES",
                        "componentType": "wysiwyg.viewer.components.PageGroup"
                    }
                ],
                "layout": {
                    "width": 980,
                    "height": 738,
                    "x": 0,
                    "y": 111,
                    "scale": 1,
                    "rotationInDegrees": 0,
                    "anchors": [
                        {
                            "distance": 359,
                            "locked": true,
                            "originalValue": 470,
                            "fromComp": "PAGES_CONTAINER",
                            "targetComponent": "comp-i9ilw2lw",
                            "topToTop": null,
                            "type": "TOP_TOP"
                        },
                        {
                            "distance": 1,
                            "locked": true,
                            "originalValue": 850,
                            "fromComp": "PAGES_CONTAINER",
                            "targetComponent": "SITE_FOOTER",
                            "topToTop": null,
                            "type": "BOTTOM_TOP"
                        }
                    ],
                    "fixedPosition": false
                },
                "componentType": "wysiwyg.viewer.components.PagesContainer"
            };

            showOnAllPagesComponents.push(pageContainer);
            siteData = privateServicesHelper.getSiteDataWithPages(pages, showOnAllPagesComponents);

            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, jsonPaths);
        }

        function createMockPrivateServicesWithComponents(pageComponents, dataOnPage, showOnAllPagesComponents) {
            var pages = {
                'page1': {
                    title: 'page1_title',
                    components: pageComponents,
                    data: _.merge({'dataItem-i9il8m2l1': {id: 'dataItem-i9il8m2l1'}}, dataOnPage && dataOnPage.document_data),
                    props: _.merge({'propItem-i9il8m2m': {id: 'propItem-i9il8m2m'}}, dataOnPage && dataOnPage.component_properties),
                    design: _.merge({}, dataOnPage && dataOnPage.design_data),
                    behaviors: {
                        'button-behavior-query': {id: 'button-behavior-query'},
                        'container-behavior-query': {id: 'container-behavior-query'}
                    },
                    connections: {
                        'button-connection-query': {id: 'button-connection-query'},
                        'container-connection-query': {id: 'container-behavior-query'}
                    }
                }
            };

            var ps = createMockPrivateServicesWithPages(pages, showOnAllPagesComponents);
            ps.siteAPI.getScroll = function () {
                return {x: 0, y: 0};
            };
            return ps;
        }

        function fakeSiteX(siteX) {
            var pageWidth = siteData.getSiteWidth();

            siteData.addMeasureMap({
                clientWidth: pageWidth + (siteX * 2)
            });
        }

        function fakeSiteStructureMeasure() {
            var heightMeasureMap = {};
            var widthMeasureMap = {};
            heightMeasureMap[constants.MASTER_PAGE_ID] = 600;
            widthMeasureMap[constants.MASTER_PAGE_ID] = 1000;

            siteData.addMeasureMap({
                height: heightMeasureMap,
                width: widthMeasureMap
            });
        }

        beforeEach(function () {
            this.jsonPaths = {
                siteData: [{path: ['origin'], optional: true}]
            };
            jsonPaths = this.jsonPaths;
            siteData = testUtils.mockFactory.mockSiteData();
            /** documentServices.structure */
            structure = structureDefinition(_, utils, fakeAnchors, componentsMetaData, component, componentModes,
                fixedComponentMeasuring, structureUtils, constants, relativeToScreenPlugins, dataModel,
                mockDataSchemas, mockPropertiesSchemas, mockDesignSchemas, mockBehaviorsSchemas, textMeasuring, connectionSchemas, layoutConstraintsUtils, hooks,
                documentModeInfo, groupingUtils, windowScroll, componentLayout, layoutValidation, siteGapMap,
                biEvents, popupUtils, actionsAndBehaviors, animations, experiment);
        });

        function getCompPointer(ps, compId, pageId) {
            var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, page);
        }


        // todo - fix test getDock + updateDock
        describe('Docked layout', function () {
            var pageId, compId;
            beforeEach(function () {
                pageId = 'mainPage';
                compId = 'comp';
                siteData.addMeasureMap({
                    width: {'container': 250, 'comp': 100},
                    height: {'container': 250, 'comp': 100},
                    left: {'container': 0, 'comp': 12},
                    top: {'container': 0, 'comp': 10},
                    clientWidth: 980
                });
            });

            function setCompInitialLayout(layout) {
                prepareTest(pageId, [{
                    id: 'container',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 250,
                        height: 250,
                        rotationInDegrees: 0
                    },
                    components: [
                        {
                            id: compId,
                            layout: layout
                        }
                    ]
                }]);

                siteData.addMeasureMap({
                    height: {container: 250},
                    width: {container: 250}
                });
            }

            describe('update docked layout when component is not docked', function () {

                it('Should keep x value even if new layout is docked to right', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200});
                    var newDocketLayout = {
                        right: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newDocketLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.x).toBe(0);
                });

                it('Should keep x value even if new layout is docked to left', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200});
                    var newLayout = {
                        left: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.x).toBe(0);
                });

                it('Should keep x value even  if new layout is docked to horizontal center', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200});
                    var newLayout = {
                        hCenter: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.x).toBe(0);
                });

                it('Should keep y value even if new layout is docked to top', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200});
                    var newLayout = {
                        top: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.y).toBe(0);
                });

                it('Should keep y value even if new layout is docked to bottom', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200});
                    var newLayout = {
                        bottom: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.y).toBe(0);
                });

                it('Should keep y value even if new layout is docked to vertical center', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200});
                    var newLayout = {
                        vCenter: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.y).toBe(0);
                });

                it('Should keep width value even if new layout is docked left AND right', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200});
                    var newLayout = {
                        left: {
                            px: 10
                        },
                        right: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.width).toBe(230); //250 container width - total dock val in pixels
                });

                it('Should keep height value even if new layout is docked top AND bottom', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200});
                    var newLayout = {
                        top: {
                            px: 10
                        },
                        bottom: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.height).toBe(230); ///250 container height - total dock val in pixels
                });

                it('Should remove dock.left value if new layout is docked to horizontal center', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200, docked: {left: {px: 10}}});
                    var newLayout = {
                        hCenter: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked.left).not.toBeDefined();
                    expect(compLayout.docked.hCenter).toBeDefined();
                });

                it('Should remove dock.right value if new layout is docked to horizontal center', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200, docked: {right: {px: 10}}});
                    var newLayout = {
                        hCenter: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked.right).not.toBeDefined();
                    expect(compLayout.docked.hCenter).toBeDefined();
                });

                it('Should remove dock.hCenter value if new layout is docked to left center', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200, docked: {hCenter: {px: 10}}});
                    var newLayout = {
                        left: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked.hCenter).not.toBeDefined();
                    expect(compLayout.docked.left).toBeDefined();
                });

                it('Should remove dock.hCenter value if new layout is docked to right center', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200, docked: {hCenter: {px: 10}}});
                    var newLayout = {
                        right: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked.hCenter).not.toBeDefined();
                    expect(compLayout.docked.right).toBeDefined();
                });

                it('Should remove dock.vCenter value if new layout is docked to top center', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200, docked: {vCenter: {px: 10}}});
                    var newLayout = {
                        top: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked.vCenter).not.toBeDefined();
                    expect(compLayout.docked.top).toBeDefined();
                });

                it('Should remove dock.vCenter value if new layout is docked to bottom center', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200, docked: {vCenter: {px: 10}}});
                    var newLayout = {
                        bottom: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked.vCenter).not.toBeDefined();
                    expect(compLayout.docked.bottom).toBeDefined();
                });

                it('Should remove dock.top value if new layout is docked to vertical center', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200, docked: {top: {px: 10}}});
                    var newLayout = {
                        vCenter: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked.top).not.toBeDefined();
                    expect(compLayout.docked.vCenter).toBeDefined();
                });

                it('Should remove dock.bottom value if new layout is docked to vertical center', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200, docked: {bottom: {px: 10}}});
                    var newLayout = {
                        vCenter: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked.bottom).not.toBeDefined();
                    expect(compLayout.docked.vCenter).toBeDefined();
                });

            });

            xdescribe('updateDock to Full Width', function () {

                it('should reparent component to the root (page or masterpage) given left and right dock in vw', function () {
                    setCompInitialLayout({x: 0, width: 200, height: 200, docked: {top: {px: 0}}});
                    var newDockedLayout = {
                        right: {
                            vw: 10
                        },
                        left: {
                            vw: 0
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newDockedLayout);

                    var compParent = privateServices.pointers.components.getParent(compPointer);
                    expect(compParent.id).toBe('mainPage');
                });

                it('should reparent component to current page given dock value different from left and right in vw', function () {
                    setCompInitialLayout({
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 200,
                        docked: {left: {vw: 0}, right: {vw: 0}}
                    });
                    var newDockedLayout = {
                        hCenter: {
                            px: 0
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.setDock(privateServices, compPointer, newDockedLayout);

                    var compParent = privateServices.pointers.components.getParent(compPointer);
                    expect(compParent.id).toBe(pageId);
                });
            });

            it('should constraint the dock data', function () {
                spyOn(layoutConstraintsUtils, 'constrainByDockingLimits');
                setCompInitialLayout({x: 0, width: 200, height: 200, y: 0, docked: {left: {px: 0}}});
                var newDockedLayout = {
                    left: {
                        px: 2
                    }
                };

                var compPointer = getCompPointer(privateServices, compId, pageId);
                structure.updateDock(privateServices, compPointer, newDockedLayout);

                expect(layoutConstraintsUtils.constrainByDockingLimits).toHaveBeenCalled();
            });

            describe('update docked layout when component is docked', function () {

                it('Should keep x value and top docked value if old layout is only docked top and new layout is docked to right', function () {
                    setCompInitialLayout({x: 0, width: 200, height: 200, y: 0, docked: {top: {px: 0}}});
                    var newDockedLayout = {
                        right: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newDockedLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.x).toBe(0);
                    expect(compLayout.docked.right.px).toEqual(10);
                    expect(compLayout.docked.top.px).toEqual(0);
                });

                it('Should throw error if new layout has not valid docked data (hCenter AND right)', function () {
                    setCompInitialLayout({x: 0, width: 200, height: 200, docked: {top: {px: 0}}});
                    var newDocketLayout = {
                        right: {
                            px: 10
                        },
                        hCenter: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateDock(privateServices, compPointer, newDocketLayout);
                    }

                    expect(update).toThrow();
                });

                it('Should remove top if new layout has vCenter in docked data', function () {
                    setCompInitialLayout({x: 0, width: 200, height: 200, docked: {top: {px: 0}}});
                    var newDocketLayout = {
                        vCenter: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newDocketLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.y).not.toBeDefined();
                    expect(compLayout.docked.vCenter).toBeDefined();
                    expect(compLayout.docked.top).not.toBeDefined();
                });

                it('should update aspect ratio if aspect ratio is defined', function () {
                    setCompInitialLayout({y: 0, height: 250, aspectRatio: 1, docked: {left: {px: 0}, right: {px: 0}}});
                    var newDockedLayout = {
                        right: {
                            px: 125
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.updateDock(privateServices, compPointer, newDockedLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.aspectRatio).toEqual(2); // height = 250, width = 125
                });
            });

            describe('setDock when component is not docked', function () {
                it('should add dock data as received in newLayout data', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200});
                    var newDockedLayout = {
                        right: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.setDock(privateServices, compPointer, newDockedLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    //expect(compLayout.x).toBe(40); //TODO: move this to integration, where the X will have been updated after measure and we can really test it
                    expect(compLayout.docked.right.px).toEqual(10);
                });

                it('should throw error if dock data received in newLayout is not valid', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, height: 200});
                    var newDockedLayout = {
                        right: {
                            px: 10
                        },
                        top: {
                            px: 10
                        },
                        vCenter: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    expect(function testSetDock() {
                        structure.setDock(privateServices, compPointer, newDockedLayout);
                    }).toThrow();
                });
            });

            describe('setDock when component is already docked', function () {
                beforeEach(function () {
                    siteData.addMeasureMap({
                        width: {'container': 250, 'childA': 100},
                        height: {'container': 250, 'childA': 100},
                        left: {'container': 0, 'childA': 12},
                        top: {'container': 0, 'childA': 10}
                    });
                });

                it('Should set docked value as received overriding old dock data', function () {
                    setCompInitialLayout({x: 0, width: 200, height: 200, docked: {top: {px: 0}}});
                    var newDockedLayout = {
                        right: {
                            px: 10
                        }
                    };

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.setDock(privateServices, compPointer, newDockedLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    //expect(compLayout.x).toBe(40); //TODO: move this to integration, where the Y will have been updated after measure and we can really test it
                    expect(compLayout.y).toBe(0);
                    expect(compLayout.docked.right.px).toEqual(10);
                    expect(compLayout.docked.top).not.toBeDefined();
                });
            });

            describe('Remove docked layout', function () {

                beforeEach(function () {
                    siteData.addMeasureMap({
                        width: {'container': 250, 'childA': 100},
                        height: {'container': 250, 'childA': 100},
                        left: {'container': 0, 'childA': 12},
                        top: {'container': 0, 'childA': 10}
                    });
                });

                it('Should remove dock right value and add x value when unDock is called', function () {
                    setCompInitialLayout({y: 0, width: 200, height: 200, docked: {right: {px: 20}}});

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.unDock(privateServices, compPointer);
                    var compLayout = privateServices.dal.get(compPointer).layout;

                    expect(compLayout.docked).not.toBeDefined();
                    expect(compLayout.x).toEqual(30);
                });

                it('Should remove dock left value and add x value when unDock is called', function () {
                    setCompInitialLayout({y: 0, width: 200, height: 200, docked: {left: {px: 20}}});

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.unDock(privateServices, compPointer);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked).not.toBeDefined();
                    expect(compLayout.x).toEqual(20);
                });

                it('Should remove horizontal center dock value and add x value when unDock is called', function () {
                    setCompInitialLayout({y: 0, width: 50, height: 100, docked: {hCenter: {px: 0}}});

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.unDock(privateServices, compPointer);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked).not.toBeDefined();
                    expect(compLayout.x).toEqual(100);
                });

                it('Should remove dock top value and add y value when unDock is called', function () {
                    setCompInitialLayout({x: 0, width: 10, height: 50, docked: {top: {px: 20}}});

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.unDock(privateServices, compPointer);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked).not.toBeDefined();
                    expect(compLayout.y).toEqual(20);
                });

                it('Should remove dock bottom value and add y value when unDock is called', function () {
                    setCompInitialLayout({x: 0, width: 50, height: 50, docked: {bottom: {px: 20}}});

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.unDock(privateServices, compPointer);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked).not.toBeDefined();
                    expect(compLayout.y).toEqual(180);
                });

                it('Should remove vertical center dock value and add y value when unDock is called', function () {
                    setCompInitialLayout({x: 0, width: 50, height: 50, docked: {vCenter: {px: 0}}});

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.unDock(privateServices, compPointer);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked).not.toBeDefined();
                    expect(compLayout.y).toEqual(100);
                });

                it('Should remove dock left AND right values and add width value if the current layout is horizontally stretched and unDock is called', function () {
                    setCompInitialLayout({x: 0, y: 0, height: 200, docked: {left: {px: 50}, right: {px: 50}}});

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.unDock(privateServices, compPointer);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked).not.toBeDefined();
                    expect(compLayout.width).toEqual(150);
                });

                it('Should remove dock top AND bottom values and add height value when unDock is called', function () {
                    setCompInitialLayout({x: 0, y: 0, width: 200, docked: {top: {px: 50}, bottom: {px: 50}}});

                    var compPointer = getCompPointer(privateServices, compId, pageId);
                    structure.unDock(privateServices, compPointer);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout.docked).not.toBeDefined();
                    expect(compLayout.height).toEqual(150);
                });

            });
        });

        describe('getDock - Docked components', function () {
            var ps, parentComp, childComp, measureMap;
            beforeEach(function () {
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
                        width: 100,
                        height: 100,
                        x: 0,
                        y: 0,
                        rotationInDegrees: 0
                    }
                };

                measureMap = {
                    width: {'parent': 100},
                    height: {'parent': 100},
                    left: {'parent': 0},
                    top: {'parent': 0}
                };
            });

            it('should return the x and y relative to structure independently of docking properties', function () {
                childComp.layout = {
                    docked: {
                        left: {
                            px: 10
                        }
                    },
                    y: 20,
                    width: 30,
                    height: 30
                };
                siteData.addPageWithDefaults('page1', [parentComp])
                    .addMeasureMap(measureMap);

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, this.jsonPaths);

                var compPointer = getCompPointer(ps, 'child', 'page1');
                var relativeToStructure = structure.getCompLayoutRelativeToStructure(ps, compPointer);

                expect(relativeToStructure.x).toEqual(10);

            });

            it('getDock should return the docked data for docked component', function () {
                childComp.layout = {
                    docked: {
                        left: {
                            px: 10
                        }
                    },
                    y: 20,
                    width: 30,
                    height: 30
                };
                siteData.addPageWithDefaults('page1', [parentComp])
                    .addMeasureMap(measureMap);

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, this.jsonPaths);

                var compPointer = getCompPointer(ps, 'child', 'page1');
                var dockedData = structure.getDock(ps, compPointer);

                expect(dockedData).toEqual({left: {px: 10}});
            });

            it('getDock should return null if component is not docked', function () {
                childComp.layout = {
                    x: 10,
                    y: 20,
                    width: 30,
                    height: 30
                };
                siteData.addPageWithDefaults('page1', [parentComp])
                    .addMeasureMap(measureMap);

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, this.jsonPaths);

                var compPointer = getCompPointer(ps, 'child', 'page1');
                var dockedData = structure.getDock(ps, compPointer);

                expect(dockedData).not.toBeDefined();
            });
        });

        describe('updating component layout:', function () {

            it('Should replace the current layout with the new one', function () {
                prepareTest('page1', [{
                    id: 'comp',
                    componentType: 'wysiwyg.viewer.components.VerticalLine',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 100,
                        height: 50,
                        rotationInDegrees: 0
                    }
                }]);

                var suggestedLayout = {
                    x: 10,
                    y: 20,
                    width: 100,
                    height: 200,
                    rotationInDegrees: 30
                };

                spyOn(componentsMetaData.public, 'isRotatable').and.returnValue(true);
                var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                structure.updateCompLayout(privateServices, compPointer, suggestedLayout);

                var compLayout = privateServices.dal.get(compPointer).layout;
                expect(compLayout).toEqual(suggestedLayout);
            });

            it('should apply constrainByDockingLimits', function () {
                spyOn(layoutConstraintsUtils, 'constrainByDockingLimits');
                prepareTest('page1', [{
                    id: 'comp',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 50,
                        height: 50
                    }
                }]);

                var newLayout = {
                    x: 10
                };
                var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                structure.updateCompLayout(privateServices, compPointer, newLayout);

                expect(layoutConstraintsUtils.constrainByDockingLimits).toHaveBeenCalled();
            });

            it('should apply constrainByDimensionsLimits', function () {
                spyOn(layoutConstraintsUtils, 'constrainByDimensionsLimits');
                prepareTest('page1', [{
                    id: 'comp',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 50,
                        height: 50
                    }
                }]);

                var newLayout = {
                    x: 10
                };
                var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                structure.updateCompLayout(privateServices, compPointer, newLayout);

                expect(layoutConstraintsUtils.constrainByDimensionsLimits).toHaveBeenCalled();
            });

            it('Should notify anchors about layout change', function () {
                prepareTest('page1', [{
                    id: 'comp',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 50,
                        height: 50,
                        rotationInDegrees: 0
                    }
                }]);
                var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                spyOn(fakeAnchors, "updateAnchors");
                structure.updateCompLayout(privateServices, compPointer, {x: 10});
                expect(fakeAnchors.updateAnchors).toHaveBeenCalledWith(privateServices, compPointer);
            });

            it('should throw exception for new layout with docked data', function () {
                prepareTest('page1', [{
                    id: 'comp',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 50,
                        height: 50,
                        rotationInDegrees: 0
                    }
                }]);

                var newLayout = {
                    docked: {
                        right: {
                            px: 10
                        }
                    }
                };
                var compPointer = getCompPointer(privateServices, 'comp', 'page1');

                function update() {
                    structure.updateCompLayout(privateServices, compPointer, newLayout);
                }

                expect(update).toThrow();
            });

            it('should ignore anchors update', function () {
                var orignalAnchor = {
                    type: "BOTTOM_PARENT"
                };
                prepareTest('page1', [{
                    id: 'comp',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 50,
                        height: 50,
                        rotationInDegrees: 0,
                        anchors: [orignalAnchor]
                    }
                }]);

                var newLayout = {
                    anchors: [{
                        type: 'BOTTOM_TOP'
                    }]
                };
                var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                structure.updateCompLayout(privateServices, compPointer, newLayout);

                var compLayout = privateServices.dal.get(compPointer).layout;
                expect(compLayout).toContain({anchors: [orignalAnchor]});
            });

            it('should update aspect ratio if aspect ratio is defined for component', function () {
                prepareTest('page1', [{
                    id: 'comp',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 20,
                        aspectRatio: 0.25
                    }
                }]);

                var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                structure.updateCompLayout(privateServices, compPointer, {width: 40});

                var compLayout = privateServices.dal.get(compPointer).layout;
                expect(compLayout.aspectRatio).toEqual(0.5);
            });

            describe('docked components', function () {
                it('should update the layout and keep the current layout schema', function () {
                    prepareTest('page1', [
                        {
                            id: 'container',
                            layout: {x: 100, y: 100, width: 100, height: 100},
                            children: [
                                {
                                    id: 'childA',
                                    layout: {
                                        x: 12,
                                        y: 10,
                                        width: 100,
                                        height: 100,
                                        rotationInDegrees: 0,
                                        docked: {left: {px: 12}}
                                    }
                                }
                            ]
                        }
                    ]);

                    siteData.addMeasureMap({
                        width: {'container': 100, 'childA': 100},
                        height: {'container': 100, 'childA': 100},
                        left: {'container': 100, 'childA': 12},
                        top: {'container': 100, 'childA': 10}
                    });


                    var newLayout = {
                        x: 20
                    };

                    var compPointer = getCompPointer(privateServices, 'childA', 'page1');
                    structure.updateCompLayout(privateServices, compPointer, newLayout);

                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout).toContain({
                        x: 20,
                        docked: {
                            left: {
                                px: 20
                            }
                        }
                    });
                });
            });

            describe('updating children', function () {
                it('Should keep children inside of a container in place when resizing from top / left side', function () {
                    prepareTest('page1', [{
                        id: 'container',
                        layout: {
                            x: 0,
                            y: 0,
                            width: 100,
                            height: 100
                        },
                        components: [
                            {
                                id: 'comp',
                                layout: {
                                    x: 60,
                                    y: 20,
                                    width: 30,
                                    height: 30
                                }
                            }
                        ]
                    }]);

                    var containerPointer = getCompPointer(privateServices, 'container', 'page1');
                    structure.updateCompLayout(privateServices, containerPointer, {
                        x: 30,
                        width: 70,
                        y: 5,
                        height: 95
                    });

                    var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout).toEqual({x: 30, y: 15, width: 30, height: 30});
                });

                it('Should not keep children in place when not performing a resize', function () {
                    prepareTest('page1', [{
                        id: 'container',
                        layout: {
                            x: 0,
                            y: 0,
                            width: 100,
                            height: 100
                        },
                        children: [
                            {
                                id: 'comp',
                                layout: {
                                    x: 60,
                                    y: 20,
                                    width: 30,
                                    height: 30
                                }
                            }
                        ]
                    }]);

                    var containerPointer = getCompPointer(privateServices, 'container', 'page1');
                    structure.updateCompLayout(privateServices, containerPointer, {
                        x: 30,
                        y: 5,
                        width: 100,
                        height: 100
                    });

                    var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                    var compLayout = privateServices.dal.get(compPointer).layout;
                    expect(compLayout).toEqual({x: 60, y: 20, width: 30, height: 30});
                });

                describe('Docked children', function () {
                    it('should not move child in x axis if the child is docked horizontally', function () {
                        prepareTest('page1', [{
                            id: 'container',
                            layout: {
                                x: 0,
                                y: 0,
                                width: 100,
                                height: 100
                            },
                            children: [
                                {
                                    id: 'comp',
                                    layout: {
                                        y: 20,
                                        width: 30,
                                        height: 30,
                                        docked: {
                                            right: {px: 0} //use dock right
                                        }
                                    }
                                }
                            ]
                        }]);

                        var containerPointer = getCompPointer(privateServices, 'container', 'page1');
                        structure.updateCompLayout(privateServices, containerPointer, {
                            width: 150,
                            height: 150
                        });

                        var compPointer = getCompPointer(privateServices, 'comp', 'page1');

                        var compLayout = privateServices.dal.get(compPointer).layout;
                        expect(compLayout.x).not.toBeDefined();

                        expect(compLayout.docked.right.px).toBe(0);
                    });

                    it('should not move child in y axis if the child is docked vertically', function () {
                        prepareTest('page1', [{
                            id: 'container',
                            layout: {
                                x: 0,
                                y: 0,
                                width: 100,
                                height: 100
                            },
                            children: [
                                {
                                    id: 'comp',
                                    layout: {
                                        x: 0,
                                        width: 30,
                                        height: 30,
                                        docked: {
                                            bottom: {px: 10} //bottom
                                        }
                                    }
                                }
                            ]
                        }]);

                        var containerPointer = getCompPointer(privateServices, 'container', 'page1');
                        structure.updateCompLayout(privateServices, containerPointer, {
                            width: 150,
                            height: 150
                        });

                        var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                        var compLayout = privateServices.dal.get(compPointer).layout;
                        expect(compLayout.y).not.toBeDefined();

                        expect(compLayout.docked.bottom.px).toBe(10);
                    });
                });
            });

            xdescribe('Layout restriction', function () {

                var pageId = 'page1';
                var compId = 'comp';

                beforeEach(function () {
                    prepareTest(pageId, [{
                        id: compId,
                        layout: {x: 100, y: 100, width: 200, height: 200, rotationInDegrees: 0}
                    }]);
                });

                it('Should throw an error if trying to change x position for a component that cannot move horizontally', function () {
                    spyOn(componentsMetaData.public, 'isHorizontallyMovable').and.returnValue(false);
                    var newLayout = {x: 150};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).toThrow();
                });

                it('Should throw an error if trying to change y position for a component that cannot move up', function () {
                    spyOn(componentsMetaData.public, 'isVerticallyMovable').and.returnValue(false);
                    spyOn(componentsMetaData.public, 'canMoveUp').and.returnValue(false);
                    var newLayout = {y: 80};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).toThrow();
                });

                it('Should throw an error if trying to change width position for a component that cannot resize horizontally', function () {
                    spyOn(componentsMetaData.public, 'isHorizontallyResizable').and.returnValue(false);
                    var newLayout = {width: 150};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).toThrow();
                });

                it('Should throw an error if trying to change height position for a component that cannot resize vertically', function () {
                    spyOn(componentsMetaData.public, 'isVerticallyResizable').and.returnValue(false);
                    var newLayout = {height: 150};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).toThrow();
                });

                it('Should throw an error it trying to rotate a non rotatable component', function () {
                    spyOn(componentsMetaData.public, 'isRotatable').and.returnValue(false);
                    var newLayout = {rotationInDegrees: 15};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).toThrow();
                });

                it('Should throw an error if trying to set fix position to a component that cannot be in fixed position', function () {
                    spyOn(componentsMetaData.public, 'canBeFixedPosition').and.returnValue(false);
                    var newLayout = {fixedPosition: true};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).toThrow();
                });

                it('Should throw an error if trying to update horizontal dock and x value', function () {
                    var newLayout = {x: 120, docked: {left: {px: 10}}};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).toThrow();
                });

                it('Should throw an error if trying to update vertical dock and y value', function () {
                    var newLayout = {y: 120, docked: {top: {px: 10}}};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).toThrow();
                });

                it('Should throw an error it trying to update width of a horizontally stretched component', function () {
                    var newLayout = {width: 120, docked: {left: {px: 10}, right: {px: 10}}};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).toThrow();
                });

                it('Should throw an error it trying to update height of a vertically stretched component', function () {
                    var newLayout = {height: 120, docked: {top: {px: 10}, bottom: {px: 10}}};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).toThrow();
                });

                it('Should NOT throw an error it trying to update x position to the same value for a component that cannot move horizontally', function () {
                    spyOn(componentsMetaData.public, 'isHorizontallyMovable').and.returnValue(false);
                    var newLayout = {x: 100};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).not.toThrow();
                });

                it('Should NOT throw an error it trying to update width position to the same value for a component that cannot resize horizontally', function () {
                    spyOn(componentsMetaData.public, 'isHorizontallyResizable').and.returnValue(false);
                    var newLayout = {width: 200};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).not.toThrow();
                });

                it('Should NOT throw an error it trying to update height position to the same value for a component that cannot resize vertically', function () {
                    spyOn(componentsMetaData.public, 'isVerticallyResizable').and.returnValue(false);
                    var newLayout = {height: 200};
                    var compPointer = getCompPointer(privateServices, compId, pageId);

                    function update() {
                        structure.updateCompLayout(privateServices, compPointer, newLayout);
                    }

                    expect(update).not.toThrow();
                });
            });
        });

        describe("updateCompLayoutAndAdjustLayout", function () {

            it('Should merge the current layout with the new one and update relative components', function () {
                prepareTest('page1', [{
                    id: 'comp',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 50,
                        height: 50,
                        rotationInDegrees: 100
                    }
                }]);
                spyOn(fakeAnchors, "updateAnchors");

                var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                var compLayoutPointer = privateServices.pointers.getInnerPointer(compPointer, 'layout');
                var suggestedLayout = {
                    x: 10,
                    y: 20,
                    width: 100,
                    height: 200
                };
                structure.updateCompLayoutAndAdjustLayout(privateServices, compPointer, suggestedLayout);
                expect(privateServices.dal.get(compLayoutPointer)).toEqual({
                    x: suggestedLayout.x,
                    y: suggestedLayout.y,
                    width: suggestedLayout.width,
                    height: suggestedLayout.height,
                    rotationInDegrees: 100
                });
                expect(fakeAnchors.updateAnchors).not.toHaveBeenCalled();
            });

            it('Should update the anchors to this comp from the component\'s children', function () {
                prepareTest('page1', [{
                    id: 'comp',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 50,
                        height: 50,
                        rotationInDegrees: 100
                    }
                }]);
                var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                spyOn(fakeAnchors, "updateAnchorsForCompChildren");

                structure.updateCompLayoutAndAdjustLayout(privateServices, compPointer, {height: 50});

                expect(fakeAnchors.updateAnchorsForCompChildren).toHaveBeenCalledWith(privateServices, compPointer);
            });

            it('should update aspect ratio if aspect ratio is defined for component', function () {
                prepareTest('page1', [{
                    id: 'comp',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 80,
                        height: 20,
                        aspectRatio: 0.25
                    }
                }]);

                var compPointer = getCompPointer(privateServices, 'comp', 'page1');
                structure.updateCompLayoutAndAdjustLayout(privateServices, compPointer, {width: 40});

                var compLayout = privateServices.dal.get(compPointer).layout;
                expect(compLayout.aspectRatio).toEqual(0.5);
            });
        });

        describe('Minimum dimensions', function () {
            var fakeCompPointer = {id: 'someId'};

            function mockMinDimensions(comp, minWidth, minHeight) {
                var mockMeasureMap = {minWidth: {}, minHeight: {}};
                mockMeasureMap.minWidth[comp.id] = minWidth;
                mockMeasureMap.minHeight[comp.id] = minHeight;

                siteData.addMeasureMap(mockMeasureMap);

                privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            }

            it('Should return have minHeight and minWidth of 0 if no minimum dimensions defined in the measureMap', function () {
                mockMinDimensions(fakeCompPointer, undefined, undefined);

                var minDimensions = structure.getMinDimensions(privateServices, fakeCompPointer);

                expect(minDimensions.width).toEqual(0);
                expect(minDimensions.height).toEqual(0);
            });

            it('Should have minHeight according to the measureMap', function () {
                mockMinDimensions(fakeCompPointer, 10, undefined);

                var minDimensions = structure.getMinDimensions(privateServices, fakeCompPointer);

                expect(minDimensions.width).toEqual(10);
            });

            it('Should have minWidth according to the measureMap', function () {
                mockMinDimensions(fakeCompPointer, undefined, 20);

                var minDimensions = structure.getMinDimensions(privateServices, fakeCompPointer);

                expect(minDimensions.height).toEqual(20);
            });

        });

        describe('getSiteHeight:', function () {
            beforeEach(function () {
                this.siteDataMock = {
                    measureMap: {
                        height: {
                            masterPage: 0
                        }
                    },

                    renderFlags: {
                        extraSiteHeight: 0
                    },

                    getCurrentPopupId: jasmine.createSpy('getCurrentPopupId').and.returnValue(null),

                    setStore: _.noop
                };

                this.ps = privateServicesHelper.mockPrivateServices(this.siteDataMock);
            });

            it('should return 0 if there is no measureMap', function () {
                this.siteDataMock.measureMap = undefined;

                expect(structure.getSiteHeight(this.ps)).toBe(0);
            });

            it('should get the height of the masterPage', function () {
                this.siteDataMock.measureMap.height.masterPage = 100;
                this.siteDataMock.renderFlags.extraSiteHeight = 0;

                expect(structure.getSiteHeight(this.ps)).toBe(100);
            });

            it('should add to the masterPage height "extraSiteHeight"', function () {
                this.siteDataMock.measureMap.height.masterPage = 100;
                this.siteDataMock.renderFlags.extraSiteHeight = 10;

                expect(structure.getSiteHeight(this.ps)).toBe(110);
            });

            it('should return height of a popup page the popup is opened', function () {
                this.siteDataMock.measureMap.height.masterPage = 100;
                this.siteDataMock.renderFlags.extraSiteHeight = 10;
                this.siteDataMock.measureMap.height.popupId = 500;
                this.siteDataMock.getCurrentPopupId.and.returnValue('popupId');

                expect(structure.getSiteHeight(this.ps)).toBe(500);
            });
        });

        describe('changeParent', function () {

            describe('when no modes involved', function () {
                describe('when component moved to masterPage', function () {

                    var buttonStructure = _.assign(_.cloneDeep(createButtonWithFixedStructure()), {
                        "layout": {
                            "width": 130,
                            "height": 60,
                            "x": 134,
                            "y": 261
                        },
                        "dataQuery": "#dataItem-i9il8m2l1",
                        "propertyQuery": "propItem-i9il8m2m",
                        "behaviorQuery": 'button-behavior-query',
                        "connectionQuery": 'button-connection-query'
                    });

                    describe('when component has mode overrides', function () {
                        beforeEach(function () {
                            this.buttonWithModes = _.assign({}, buttonStructure, {
                                modes: {
                                    isHiddenByModes: false,
                                    overrides: [{
                                        modeIds: ['a', 'b'],
                                        isHiddenByModes: true
                                    }]
                                }
                            });
                        });

                        describe('when component has mode definitions on it', function () {
                            beforeEach(function () {
                                this.buttonWithModes = _.assign(this.buttonWithModes, {
                                    modes: {
                                        definitions: [{
                                            modeId: 'a',
                                            type: 'some-mode-type'
                                        }],
                                        overrides: [{
                                            modeIds: ['a', 'b'],
                                            isHiddenByModes: true
                                        }]
                                    }
                                });
                                this.ps = createMockPrivateServicesWithComponents([this.buttonWithModes]);
                                fakeSiteX(10);
                                fakeSiteStructureMeasure();
                                this.pointers = this.ps.pointers;
                            });

                            it('should move the component with the entire modes structure defined on it, and remove overrides that are not relevant under the new parent', function () {
                                var page1Pointer = this.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                                var buttonPointer = this.pointers.components.getComponent('buttonA', page1Pointer);
                                var masterPagePointer = this.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                                structure.setContainer(this.ps, buttonPointer, buttonPointer, masterPagePointer);

                                buttonPointer = this.pointers.components.getComponent('buttonA', masterPagePointer);
                                var layoutOnMaster = {
                                    layout: {
                                        x: jasmine.any(Number),
                                        y: jasmine.any(Number)
                                    }
                                };
                                var fullCompAfterReparent = this.ps.dal.full.get(buttonPointer);
                                expect(fullCompAfterReparent.modes.overrides).toEqual([]);
                                expect(fullCompAfterReparent.modes.definitions).toEqual(this.buttonWithModes.modes.definitions);
                                expect(_.omit(fullCompAfterReparent, 'modes')).toEqual(_.omit(_.merge(this.buttonWithModes, layoutOnMaster), 'modes'));
                            });
                        });

                        describe('when component has no mode definitions on it', function () {
                            beforeEach(function () {
                                this.ps = createMockPrivateServicesWithComponents([this.buttonWithModes]);
                                fakeSiteX(10);
                                fakeSiteStructureMeasure();
                                this.pointers = this.ps.pointers;
                            });

                            it('should move the component without the overrides and without isHiddenByModes', function () {
                                var page1Pointer = this.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                                var buttonPointer = this.pointers.components.getComponent('buttonA', page1Pointer);
                                var masterPagePointer = this.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                                structure.setContainer(this.ps, buttonPointer, buttonPointer, masterPagePointer);

                                buttonPointer = this.pointers.components.getComponent('buttonA', masterPagePointer);
                                var layoutOnMaster = {
                                    layout: {
                                        x: jasmine.any(Number),
                                        y: jasmine.any(Number)
                                    }
                                };
                                var fullCompAfterReparent = this.ps.dal.full.get(buttonPointer);
                                expect(fullCompAfterReparent.modes.isHiddenByModes).not.toBeDefined();
                                expect(fullCompAfterReparent.modes.overrides).toEqual([]);
                                expect(_.omit(fullCompAfterReparent, 'modes')).toEqual(_.omit(_.merge(buttonStructure, layoutOnMaster), 'modes'));
                            });
                        });
                    });

                    it('should move component data and properties to the new page', function () {
                        var page1Comps = [buttonStructure];

                        var mockPrivateServices = createMockPrivateServicesWithComponents(page1Comps);
                        fakeSiteX(10);
                        fakeSiteStructureMeasure();

                        var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var buttonComp = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);
                        var masterPointer = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                        var page1Data = siteData.pagesData.page1.data;
                        var masterPageData = siteData.pagesData.masterPage.data;

                        expect(_.keys(page1Data.component_properties)).toContain('propItem-i9il8m2m');
                        expect(_.keys(page1Data.document_data)).toContain('dataItem-i9il8m2l1');
                        expect(_.keys(masterPageData.component_properties)).not.toContain('propItem-i9il8m2m');
                        expect(_.keys(masterPageData.document_data)).not.toContain('dataItem-i9il8m2l1');

                        structure.setContainer(mockPrivateServices, buttonComp, buttonComp, masterPointer);

                        expect(_.keys(page1Data.component_properties)).not.toContain('propItem-i9il8m2m');
                        expect(_.keys(page1Data.document_data)).not.toContain('dataItem-i9il8m2l1');
                        expect(_.keys(masterPageData.component_properties)).toContain('propItem-i9il8m2m');
                        expect(_.keys(masterPageData.document_data)).toContain('dataItem-i9il8m2l1');
                    });

                    it('should move data and properties for all the children components to the new page', function () {
                        var page1Comps = [
                            {
                                "id": "container", "type": "Component",
                                "layout": {
                                    "width": 751,
                                    "height": 565,
                                    "x": 113,
                                    "y": 42,
                                    "rotationInDegrees": 0,
                                    "anchors": []
                                },
                                "componentType": "mobile.core.components.Container",
                                "components": [buttonStructure]
                            }
                        ];

                        var mockPrivateServices = createMockPrivateServicesWithComponents(page1Comps);
                        fakeSiteX(10);
                        fakeSiteStructureMeasure();

                        var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var containerComp = mockPrivateServices.pointers.components.getComponent('container', page1Pointer);
                        var masterPointer = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                        var page1Data = siteData.pagesData.page1.data;
                        var masterPageData = siteData.pagesData.masterPage.data;

                        expect(_.keys(page1Data.component_properties)).toContain('propItem-i9il8m2m');
                        expect(_.keys(page1Data.document_data)).toContain('dataItem-i9il8m2l1');
                        expect(_.keys(masterPageData.component_properties)).not.toContain('propItem-i9il8m2m');
                        expect(_.keys(masterPageData.document_data)).not.toContain('dataItem-i9il8m2l1');

                        structure.setContainer(mockPrivateServices, containerComp, containerComp, masterPointer);

                        expect(_.keys(page1Data.component_properties)).not.toContain('propItem-i9il8m2m');
                        expect(_.keys(page1Data.document_data)).not.toContain('dataItem-i9il8m2l1');
                        expect(_.keys(masterPageData.component_properties)).toContain('propItem-i9il8m2m');
                        expect(_.keys(masterPageData.document_data)).toContain('dataItem-i9il8m2l1');
                    });

                    it('should move behaviors of the component and children to the new page', function () {
                        var page1Comps = [
                            {
                                "id": "container", "type": "Component",
                                "layout": {
                                    "width": 751,
                                    "height": 565,
                                    "x": 113,
                                    "y": 42,
                                    "rotationInDegrees": 0,
                                    "anchors": []
                                },
                                "behaviorQuery": 'container-behavior-query',
                                "componentType": "mobile.core.components.Container",
                                "components": [buttonStructure]
                            }
                        ];

                        var mockPrivateServices = createMockPrivateServicesWithComponents(page1Comps);
                        fakeSiteX(10);
                        fakeSiteStructureMeasure();

                        var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var containerComp = mockPrivateServices.pointers.components.getComponent('container', page1Pointer);
                        var masterPointer = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                        var page1Data = siteData.pagesData.page1.data;
                        var masterPageData = siteData.pagesData.masterPage.data;


                        expect(page1Data.behaviors_data['container-behavior-query']).not.toBeUndefined();
                        expect(page1Data.behaviors_data['button-behavior-query']).not.toBeUndefined();
                        expect(masterPageData.behaviors_data['container-behavior-query']).toBeUndefined();
                        expect(masterPageData.behaviors_data['button-behavior-query']).toBeUndefined();

                        structure.setContainer(mockPrivateServices, containerComp, containerComp, masterPointer);

                        expect(page1Data.behaviors_data['container-behavior-query']).toBeUndefined();
                        expect(page1Data.behaviors_data['button-behavior-query']).toBeUndefined();
                        expect(masterPageData.behaviors_data['container-behavior-query']).not.toBeUndefined();
                        expect(masterPageData.behaviors_data['button-behavior-query']).not.toBeUndefined();
                    });

                    describe("when connectionsData is open", function () {
                        beforeEach(function () {
                            openExperiments('connectionsData');
                        });

                        it('should move connections of the component and children to the new page', function () {
                            var page1Comps = [
                                {
                                    "id": "container", "type": "Component",
                                    "layout": {
                                        "width": 751,
                                        "height": 565,
                                        "x": 113,
                                        "y": 42,
                                        "rotationInDegrees": 0,
                                        "anchors": []
                                    },
                                    "connectionQuery": 'container-connection-query',
                                    "componentType": "mobile.core.components.Container",
                                    "components": [buttonStructure]
                                }
                            ];

                            var mockPrivateServices = createMockPrivateServicesWithComponents(page1Comps);
                            fakeSiteX(10);

                            var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var containerComp = mockPrivateServices.pointers.components.getComponent('container', page1Pointer);
                            var masterPointer = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                            var page1Data = siteData.pagesData.page1.data;
                            var masterPageData = siteData.pagesData.masterPage.data;


                            expect(page1Data.connections_data['container-connection-query']).not.toBeUndefined();
                            expect(page1Data.connections_data['button-connection-query']).not.toBeUndefined();
                            expect(masterPageData.connections_data['container-connection-query']).toBeUndefined();
                            expect(masterPageData.connections_data['button-connection-query']).toBeUndefined();

                            structure.setContainer(mockPrivateServices, containerComp, containerComp, masterPointer);

                            expect(page1Data.connections_data['container-connection-query']).toBeUndefined();
                            expect(page1Data.connections_data['button-connection-query']).toBeUndefined();
                            expect(masterPageData.connections_data['container-connection-query']).not.toBeUndefined();
                            expect(masterPageData.connections_data['button-connection-query']).not.toBeUndefined();
                        });
                    });

                    describe('when the designData experiment is open', function () {
                        beforeEach(function () {
                            var stripComponentStructure = {
                                "id": "strip_23",
                                "designQuery": "#dataItem-ilt83pk6",
                                "componentType": "wysiwyg.viewer.components.StripContainer",
                                "type": "Container",
                                "dataQuery": "#dataItem-ilt83pk4",
                                "components": []
                            };

                            var pages = {
                                'page1': {
                                    title: 'page1_title',
                                    components: [stripComponentStructure],
                                    data: {'dataItem-ilt83pk4': {id: 'dataItem-ilt83pk4'}},
                                    design: {
                                        "dataItem-ilt83pk62": {
                                            "id": "dataItem-ilt83pk62"
                                        },
                                        "dataItem-ilt83pk61": {
                                            "id": "dataItem-ilt83pk61",
                                            "type": "BackgroundMedia",
                                            "mediaRef": "#dataItem-ilt83pk62"
                                        },
                                        "dataItem-ilt83pk6": {
                                            "id": "dataItem-ilt83pk6",
                                            "background": "#dataItem-ilt83pk61",
                                            "type": "MediaContainerDesignData"
                                        }
                                    }
                                }
                            };

                            this.mockPrivateServices = createMockPrivateServicesWithPages(pages);
                        });

                        it('moves the designData to the masterPage', function () {
                            var page1Pointer = this.mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var stripComp = this.mockPrivateServices.pointers.components.getComponent('strip_23', page1Pointer);
                            var masterPointer = this.mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                            var page1DesignData = siteData.pagesData.page1.data.design_data;
                            var masterPageDesignData = siteData.pagesData.masterPage.data.design_data;

                            expect(page1DesignData['dataItem-ilt83pk6']).toBeDefined();
                            expect(page1DesignData['dataItem-ilt83pk61']).toBeDefined();
                            expect(page1DesignData['dataItem-ilt83pk62']).toBeDefined();
                            expect(masterPageDesignData['dataItem-ilt83pk6']).toBeUndefined();
                            expect(masterPageDesignData['dataItem-ilt83pk61']).toBeUndefined();
                            expect(masterPageDesignData['dataItem-ilt83pk62']).toBeUndefined();

                            structure.addCompToContainer(this.mockPrivateServices, stripComp, masterPointer);

                            expect(page1DesignData['dataItem-ilt83pk6']).toBeUndefined();
                            expect(page1DesignData['dataItem-ilt83pk61']).toBeUndefined();
                            expect(page1DesignData['dataItem-ilt83pk62']).toBeUndefined();
                            expect(masterPageDesignData['dataItem-ilt83pk6']).toBeDefined();
                            expect(masterPageDesignData['dataItem-ilt83pk61']).toBeDefined();
                            expect(masterPageDesignData['dataItem-ilt83pk62']).toBeDefined();
                        });
                    });
                });

                describe('update fixed position on reparent', function () {
                    describe('fixed component reparent', function () {
                        it('should update the fixedPosition property of the fixed component to "false" if the new container in not in fixed position', function () {
                            var pageComponents = [
                                {
                                    "id": "container",
                                    "type": "Component",
                                    "layout": {
                                        "width": 400,
                                        "height": 200,
                                        "x": 50,
                                        "y": 50,
                                        "rotationInDegrees": 0,
                                        "anchors": []
                                    },
                                    "componentType": "mobile.core.components.Container",
                                    "components": []
                                },
                                createButtonWithFixedStructure()
                            ];
                            var mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                            fakeSiteX(10);
                            fakeSiteStructureMeasure();

                            var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);
                            var containerCompPointer = mockPrivateServices.pointers.components.getComponent('container', page1Pointer);

                            structure.setContainer(mockPrivateServices, buttonCompPointer, buttonCompPointer, containerCompPointer);

                            var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                            var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                            expect(buttonLayout.fixedPosition).toEqual(false);
                        });

                        it('should update the fixedPosition property of the fixed component to "false"  if the new container is in fixed position', function () {
                            var pageComponents = [
                                {
                                    "id": "container",
                                    "type": "Component",
                                    "layout": {
                                        "width": 400,
                                        "height": 200,
                                        "x": 50,
                                        "y": 50,
                                        "fixedPosition": true,
                                        "rotationInDegrees": 0,
                                        "anchors": []
                                    },
                                    "componentType": "mobile.core.components.Container",
                                    "components": []
                                },
                                createButtonWithFixedStructure()
                            ];
                            var mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                            fakeSiteX(0);

                            var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);
                            var containerCompPointer = mockPrivateServices.pointers.components.getComponent('container', page1Pointer);

                            structure.setContainer(mockPrivateServices, buttonCompPointer, buttonCompPointer, containerCompPointer);

                            var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                            var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                            expect(buttonLayout.fixedPosition).toEqual(false);
                        });

                        describe('toggle show on all pages', function () {
                            it('should leave fixedPosition property as true if fixed component is moved to master page', function () {
                                var pageComponents = [createButtonWithFixedStructure()];
                                var mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                                fakeSiteX(10);
                                fakeSiteStructureMeasure();

                                var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                                var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);
                                var masterPagePointer = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                                structure.setContainer(mockPrivateServices, buttonCompPointer, buttonCompPointer, masterPagePointer);

                                var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                                var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                                expect(buttonLayout.fixedPosition).toEqual(true);
                            });

                            it('should not update fixedPosition property if component move from master page to page', function () {
                                var showOnAllPagesComponents = [createButtonWithFixedStructure()];
                                var mockPrivateServices = createMockPrivateServicesWithComponents([], null, showOnAllPagesComponents);
                                fakeSiteX(10);
                                fakeSiteStructureMeasure();

                                var masterPagePointer = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                                var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', masterPagePointer);
                                var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);

                                structure.setContainer(mockPrivateServices, buttonCompPointer, buttonCompPointer, page1Pointer);

                                var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                                var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                                expect(buttonLayout.fixedPosition).toEqual(true);
                            });
                        });
                    });
                });

                describe('translate coordinates to new parent', function () {
                    var mockPrivateServices;
                    beforeEach(function () {
                        var buttonWithoutFixedPos = createButtonWithoutFixedPos();

                        var pageComponents = [
                            {
                                "id": "container",
                                "type": "Component",
                                "layout": {
                                    "width": 400,
                                    "height": 200,
                                    "x": 50,
                                    "y": 50,
                                    "rotationInDegrees": 0,
                                    "anchors": []
                                },
                                "componentType": "mobile.core.components.Container",
                                "components": []
                            },
                            buttonWithoutFixedPos
                        ];
                        mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                    });

                    describe('new parent is in absolute position', function () {

                        var buttonWithoutFixedPos = createButtonWithoutFixedPos();

                        it('should subtract the parent coordinates for component in absolute position', function () {
                            var pageComponents = [
                                {
                                    "id": "container",
                                    "type": "Component",
                                    "layout": {
                                        "width": 400,
                                        "height": 200,
                                        "x": 50,
                                        "y": 50,
                                        "rotationInDegrees": 0,
                                        "anchors": []
                                    },
                                    "componentType": "mobile.core.components.Container",
                                    "components": []
                                },
                                buttonWithoutFixedPos
                            ];
                            mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                            fakeSiteX(10);
                            fakeSiteStructureMeasure();

                            var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);
                            var containerCompPointer = mockPrivateServices.pointers.components.getComponent('container', page1Pointer);

                            structure.setContainer(mockPrivateServices, buttonCompPointer, buttonCompPointer, containerCompPointer);

                            var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                            var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                            expect(buttonLayout.x).toEqual(20); // compX = 70, parentX = 50
                            expect(buttonLayout.y).toEqual(30); // compY = 80, parentY = 50
                        });

                        it('should subtract the parent coordinates for component in fixed position', function () {
                            var buttonStructure = createButtonWithFixedStructure(90, 201);

                            var pageComponents = [
                                {
                                    "id": "container",
                                    "type": "Component",
                                    "layout": {
                                        "width": 400,
                                        "height": 200,
                                        "x": 50,
                                        "y": 50,
                                        "rotationInDegrees": 0,
                                        "anchors": []
                                    },
                                    "componentType": "mobile.core.components.Container",
                                    "components": []
                                },
                                buttonStructure
                            ];
                            mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                            fakeSiteX(10);
                            fakeSiteStructureMeasure();

                            var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);
                            var containerCompPointer = mockPrivateServices.pointers.components.getComponent('container', page1Pointer);

                            structure.setContainer(mockPrivateServices, buttonCompPointer, buttonCompPointer, containerCompPointer);

                            var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                            var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                            expect(buttonLayout.x).toEqual(30);
                            expect(buttonLayout.y).toEqual(40);
                        });
                    });

                    describe('new parent is in fixed position', function () {
                        it('should subtract the parent coordinates for component with absolute position', function () {
                            var pageComponents = [
                                createContainerWithFixedPosition(50, 150),
                                createButtonWithoutFixedPos(80)
                            ];
                            mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                            fakeSiteX(10);
                            fakeSiteStructureMeasure();

                            var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);
                            var containerCompPointer = mockPrivateServices.pointers.components.getComponent('container', page1Pointer);

                            structure.setContainer(mockPrivateServices, buttonCompPointer, buttonCompPointer, containerCompPointer);

                            var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                            var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                            expect(buttonLayout.x).toEqual(40);
                            expect(buttonLayout.y).toEqual(41);
                        });

                        it('should subtract the parent coordinates for component with fixed position', function () {
                            var pageComponents = [
                                createContainerWithFixedPosition(50, 150),
                                createButtonWithFixedStructure(70, 190)
                            ];
                            mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                            fakeSiteX(10);
                            fakeSiteStructureMeasure();

                            var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);
                            var containerCompPointer = mockPrivateServices.pointers.components.getComponent('container', page1Pointer);

                            structure.setContainer(mockPrivateServices, buttonCompPointer, buttonCompPointer, containerCompPointer);

                            var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                            var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                            expect(buttonLayout.x).toEqual(20);
                            expect(buttonLayout.y).toEqual(40);
                        });
                    });

                    describe('toggle show on all pages', function () {

                        var buttonComponent = createButtonWithFixedStructure();

                        it('should not adjust coordinate if fixed component is moved to master page', function () {
                            var pageComponents = [buttonComponent];
                            mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                            fakeSiteX(10);
                            fakeSiteStructureMeasure();

                            var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);
                            var masterPagePointer = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                            structure.setContainer(mockPrivateServices, buttonCompPointer, buttonCompPointer, masterPagePointer);

                            var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                            var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                            expect(buttonLayout.x).toEqual(70);
                            expect(buttonLayout.y).toEqual(80);
                        });

                        it('should not adjust coordinate if fixed component move from master page to page', function () {
                            var showOnAllPagesComponents = [
                                {
                                    "id": "buttonA",
                                    "type": "Component",
                                    "layout": {
                                        "width": 60,
                                        "height": 30,
                                        "x": 70,
                                        "y": 80,
                                        "fixedPosition": true,
                                        "rotationInDegrees": 0,
                                        "anchors": []
                                    },
                                    "componentType": "wysiwyg.viewer.components.SiteButton",
                                    "dataQuery": "#dataQuery",
                                    "propertyQuery": "propItem",
                                    "components": []
                                }
                            ];
                            mockPrivateServices = createMockPrivateServicesWithComponents([], null, showOnAllPagesComponents);
                            fakeSiteX(10);
                            fakeSiteStructureMeasure();

                            var masterPagePointer = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                            var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', masterPagePointer);
                            var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);

                            structure.setContainer(mockPrivateServices, buttonCompPointer, buttonCompPointer, page1Pointer);

                            var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                            var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                            expect(buttonLayout.x).toEqual(70);
                            expect(buttonLayout.y).toEqual(80);
                        });
                    });
                });

                describe('Docked component reparent', function () {
                    describe('when it is stretched to screen', function () {
                        it('the layout should remain stretched to screen after reparent', function () {
                            //TODO: create fake screen width comp with correct measure, then reparent and check
                            var pageComponents = [createButtonWithoutFixedPos(10, 10)];
                            var ps = createMockPrivateServicesWithComponents(pageComponents);
                            fakeSiteStructureMeasure(ps);

                            var page1Pointer = ps.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var buttonCompPointer = ps.pointers.components.getComponent('buttonA', page1Pointer);
                            var masterPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                            structure.setDock(ps, buttonCompPointer, {left: {vw: 0}, right: {vw: 0}}); //TODO: setDock should not be in unit test, this should be integration

                            structure.setContainer(ps, buttonCompPointer, buttonCompPointer, masterPagePointer);

                            var buttonLayoutPointer = ps.pointers.getInnerPointer(buttonCompPointer, 'layout');
                            var buttonLayout = ps.dal.get(buttonLayoutPointer);

                            expect(buttonLayout.docked).toEqual({left: {vw: 0}, right: {vw: 0}});
                        });

                        xit('should update x in layout after reparent', function () {
                            //TODO: create fake screen width comp with correct measure, then reparent and check

                            var pageComponents = [createButtonWithoutFixedPos(10, 10)];
                            var ps = createMockPrivateServicesWithComponents(pageComponents);
                            fakeSiteStructureMeasure(ps);

                            var page1Pointer = ps.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var buttonCompPointer = ps.pointers.components.getComponent('buttonA', page1Pointer);
                            var masterPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                            structure.setDock(ps, buttonCompPointer, {left: {vw: 0}, right: {vw: 0}}); //TODO: setDock should not be in unit test, this should be integration

                            structure.setContainer(ps, buttonCompPointer, buttonCompPointer, masterPagePointer);

                            var buttonLayoutPointer = ps.pointers.getInnerPointer(buttonCompPointer, 'layout');
                            var buttonLayout = ps.dal.get(buttonLayoutPointer);

                            expect(buttonLayout.x).toBe(-10); //TODO: this expect is correct. It should be resolved after the 2 todos above
                        });

                        //TODO: add spec that setDock / updateDock will immediately update in structure JSON the new values based on docking and parent
                        // verify with alissa - otherwise we have a 'window of opportunity' for creating bugs if someone writes a function based on existing x,y,width,height
                        // and it runs in same batch as updateDock/setDock
                    });

                    describe('when it is not stretched to screen', function () {
                        it('the layout should be not docked after reparent', function () {
                            var pageComponents = [createButtonWithoutFixedPos(10, 10)];
                            var mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                            fakeSiteStructureMeasure();

                            var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);
                            var masterPagePointer = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                            structure.setDock(mockPrivateServices, buttonCompPointer, {left: {px: 1}});

                            structure.setContainer(mockPrivateServices, buttonCompPointer, buttonCompPointer, masterPagePointer);

                            var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                            var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                            expect(buttonLayout.docked).not.toBeDefined();
                        });
                    });
                });
            });

            describe('Modes', function () {
                var anyXYInLayout = {
                    layout: {
                        x: jasmine.any(Number),
                        y: jasmine.any(Number)
                    }
                };

                function getBehaviorDefinition(definitions) {
                    var behavior = _.find(animations.viewerDefaults, definitions);
                    _.assign(behavior, behavior.params);
                    delete behavior.params;
                    return behavior;
                }

                function createComponentsToAddToPage() {
                    var componentsDataMap = {};
                    this.buttonWithNoModes = createButtonWithoutFixedPos(null, null, 'no-modes-button-id1');
                    var buttonWithNoModesData = {
                        'id': this.buttonWithNoModes.dataQuery.replace('#', ''),
                        'type': 'LinkableButton',
                        'label': 'boo',
                        'link': ''
                    };
                    componentsDataMap[buttonWithNoModesData.id] = buttonWithNoModesData;

                    this.regularButton = createButtonWithoutFixedPos(30, 80, 'no-modes-button-id2');
                    var regularButtonData = {
                        'id': this.regularButton.dataQuery.replace('#', ''),
                        'type': 'LinkableButton',
                        'label': 'Regular button',
                        'link': ''
                    };
                    componentsDataMap[regularButtonData.id] = regularButtonData;

                    this.buttonWithModesStructure = createButtonWithoutFixedPos(null, null, 'button-with-modes-id1');
                    _.set(this.buttonWithModesStructure, 'modes', {
                        overrides: [{
                            modeIds: ['external-page-mode'],
                            prop: 'value-to-remove'
                        }, {
                            modeIds: ['external-mode'],
                            prop: 'value-to-remove'
                        }, {
                            modeIds: ['mode1'],
                            propertyQuery: 'some-ovr-prop-query'
                        }]
                    });

                    this.hoverBoxStructure = createContainerWithModesStructure('hb', 20, 20, [this.buttonWithModesStructure]);

                    this.containerStructure = createContainerStructure(0, 0, [this.hoverBoxStructure]);

                    return {
                        components: [this.buttonWithNoModes, this.regularButton, this.containerStructure],
                        data: {
                            document_data: componentsDataMap,
                            design_data: createHoverBoxDesignData()
                        }
                    };
                }

                function createHoverBoxDesignData() {
                    var componentsDesignMap = {};
                    componentsDesignMap.hbOvrDesignDataId1 = {
                        id: 'hbOvrDesignDataId1',
                        designId: 'hbOvrDesignDataId1',
                        type: 'MediaContainerDesignData',
                        background: '#hbOvrBG1'
                    };
                    componentsDesignMap.hbOvrBG1 = {
                        id: 'hbOvrBG1',
                        type: 'BackgroundMedia',
                        mediaRef: null,
                        "color": '#111111',
                        "colorOpacity": 1,
                        "alignType": "center",
                        "fittingType": "fill",
                        "scrollType": "none",
                        "imageOverlay": null,
                        "colorOverlay": '#AAAAAA',
                        "colorOverlayOpacity": 1
                    };
                    componentsDesignMap.hbOvrDesignDataId2 = {
                        id: 'hbOvrDesignDataId2',
                        designId: 'hbOvrDesignDataId2',
                        type: 'MediaContainerDesignData',
                        background: '#hbOvrBG2'
                    };
                    componentsDesignMap.hbOvrBG2 = {
                        id: 'hbOvrBG2',
                        type: 'BackgroundMedia',
                        mediaRef: null,
                        "color": '#222222',
                        "colorOpacity": 1,
                        "alignType": "center",
                        "fittingType": "fill",
                        "scrollType": "none",
                        "imageOverlay": null,
                        "colorOverlay": '#BBBBBB',
                        "colorOverlayOpacity": 1
                    };
                    return componentsDesignMap;
                }

                beforeEach(function () {
                    openExperiments('sv_hoverBox');
                    var compsOnPage = createComponentsToAddToPage.call(this);

                    this.ps = createMockPrivateServicesWithComponents(compsOnPage.components, compsOnPage.data, []);
                    siteData.measureMap = {};

                    this.page1Pointer = this.ps.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                    this.regularButtonPointer = this.ps.pointers.components.getComponent('no-modes-button-id2', this.page1Pointer);
                    this.noModesButtonPointer = this.ps.pointers.components.getComponent('no-modes-button-id1', this.page1Pointer);
                    this.buttonWithModesPointer = this.ps.pointers.components.getComponent('button-with-modes-id1', this.page1Pointer);
                    this.containerPointer = this.ps.pointers.components.getComponent('container', this.page1Pointer);
                    this.hoverBoxPointer = this.ps.pointers.components.getComponent('hb', this.page1Pointer);
                });

                describe('when the new parent (container) has no active modes', function () {
                    describe('when the "re-parented" component has no modes', function () {
                        describe('behaviours', function () {
                            it('should have its mode change behavior removed from the component structure', function () {
                                var behavior = _.find(animations.viewerDefaults, {action: 'modeChange'});
                                actionsAndBehaviors.setComponentBehavior(this.ps, this.noModesButtonPointer, behavior, behavior.action);

                                structure.setContainer(this.ps, this.noModesButtonPointer, this.noModesButtonPointer, this.containerPointer);

                                var behaviors = actionsAndBehaviors.getComponentBehaviors(this.ps, this.noModesButtonPointer);
                                var modeChangeBehaviors = _.filter(behaviors, {action: 'modeChange'});
                                expect(modeChangeBehaviors.length).toBe(0);
                            });

                            it('should have its mode in and out behaviors removed from the component structure', function () {
                                var modeInBehavior = getBehaviorDefinition({action: 'modeIn', name: 'FadeIn'});
                                var modeOutBehavior = getBehaviorDefinition({name: 'FadeOut'});
                                actionsAndBehaviors.setComponentBehavior(this.ps, this.noModesButtonPointer, modeInBehavior, modeInBehavior.action);
                                actionsAndBehaviors.setComponentBehavior(this.ps, this.noModesButtonPointer, modeOutBehavior, 'modeOut');

                                structure.setContainer(this.ps, this.noModesButtonPointer, this.noModesButtonPointer, this.containerPointer);

                                var behaviors = actionsAndBehaviors.getComponentBehaviors(this.ps, this.noModesButtonPointer);
                                var modeInBehaviors = _.filter(behaviors, {action: 'modeIn'});
                                var modeOutBehaviors = _.filter(behaviors, {action: 'modeOut'});
                                expect(modeInBehaviors.length).toBe(0);
                                expect(modeOutBehaviors.length).toBe(0);
                            });
                        });

                        it('should add the displayed component to the container as usual (displayed dal push, and update fulljson)', function () {
                            var regularButtonParent = this.ps.pointers.components.getParent(this.regularButtonPointer);
                            expect(regularButtonParent).toEqual(this.page1Pointer);

                            var fullCompStructure = this.ps.dal.full.get(this.regularButtonPointer);

                            structure.setContainer(this.ps, this.regularButtonPointer, this.regularButtonPointer, this.containerPointer);

                            expect(this.ps.dal.get(this.regularButtonPointer)).toEqual(fullCompStructure);
                        });
                    });

                    describe('when the "re-parented" component has modes', function () {

                        it('should clear the component overrides if they dont correspond any ancestor modes', function () {
                            expect(_.size(_.get(this.ps.dal.full.get(this.hoverBoxPointer), 'modes.overrides'))).toBe(3);

                            structure.setContainer(this.ps, this.hoverBoxPointer, this.hoverBoxPointer, this.page1Pointer);

                            expect(_.size(_.get(this.ps.dal.full.get(this.hoverBoxPointer), 'modes.overrides'))).toBe(2);
                        });

                        it('should clear the component children overrides if they dont correspond any ancestor modes (also in new container & its ancestors)', function () {
                            componentModes.addComponentModeDefinition(this.ps, 'external-page-mode', this.page1Pointer, utils.siteConstants.COMP_MODES_TYPES.DEFAULT);
                            expect(_.size(_.get(this.ps.dal.full.get(this.buttonWithModesPointer), 'modes.overrides'))).toBe(3);

                            structure.setContainer(this.ps, this.hoverBoxPointer, this.hoverBoxPointer, this.page1Pointer);

                            expect(_.size(_.get(this.ps.dal.full.get(this.buttonWithModesPointer), 'modes.overrides'))).toBe(2);
                        });

                        describe('when the component has no children', function () {
                            it('should add the "displayed" (from the displayed Json) component to the parent', function () {
                                var displayedComponent = this.ps.dal.get(this.buttonWithModesPointer);
                                expect(this.ps.dal.full.get(this.buttonWithModesPointer).modes).not.toBeEmpty();

                                structure.setContainer(this.ps, this.buttonWithModesPointer, this.buttonWithModesPointer, this.containerPointer);

                                var compAfterReparent = this.ps.dal.full.get(this.buttonWithModesPointer);
                                expect(_.get(compAfterReparent, 'modes.overrides')).toBeEmpty();
                                expect(this.ps.dal.get(this.buttonWithModesPointer)).toEqual(_.merge(displayedComponent, anyXYInLayout));
                            });
                        });

                        describe('when the component has children', function () {

                            beforeEach(function () {
                                var buttonWithModes = createButtonWithoutFixedPos(null, null, 'buttonC');
                                _.set(buttonWithModes, 'modes', {
                                    isHiddenByModes: true,
                                    overrides: [{
                                        modeIds: ['modeY'],
                                        propertyQuery: 'some-ovr-prop-query',
                                        isHiddenByModes: false
                                    }]
                                });

                                this.hoverBoxStructure = createContainerWithModesStructure('hb-with-children', 200, 200, [buttonWithModes]);
                                this.hoverBoxStructure.modes = {
                                    "definitions": [{
                                        modeId: 'modeX',
                                        type: 'REGULAR'
                                    }, {
                                        modeId: 'modeY',
                                        type: 'HOVER'
                                    }]
                                };

                                var pointerToPageChildren = this.ps.pointers.getInnerPointer(this.page1Pointer, 'components');
                                this.ps.dal.full.push(pointerToPageChildren, this.hoverBoxStructure);
                                this.hoverBoxWithChildrenPointer = this.ps.pointers.components.getComponent('hb-with-children', this.page1Pointer);

                                structure.setContainer(this.ps, null, this.hoverBoxWithChildrenPointer, this.containerPointer);
                            });

                            it('should add the "full" component(from the full Json) to the parent', function () {
                                var hoverBoxInFullJson = this.ps.dal.full.get(this.hoverBoxWithChildrenPointer);
                                expect(hoverBoxInFullJson).toEqual(_.merge({}, this.hoverBoxStructure, anyXYInLayout));

                                this.ps.siteAPI.activateMode(this.hoverBoxWithChildrenPointer, 'modeX');
                                structure.setContainer(this.ps, this.hoverBoxWithChildrenPointer, this.hoverBoxWithChildrenPointer, this.containerPointer);

                                var hoverBoxWithoutChildrenShowing = _.assign({}, hoverBoxInFullJson, {components: []});
                                hoverBoxWithoutChildrenShowing.modes = _.omit(hoverBoxWithoutChildrenShowing.modes, 'overrides');
                                expect(this.ps.dal.get(this.hoverBoxWithChildrenPointer)).toEqual(_.merge(hoverBoxWithoutChildrenShowing, anyXYInLayout));

                                this.ps.siteAPI.switchModesByIds(this.hoverBoxWithChildrenPointer, this.page1Pointer.id, 'modeX', 'modeY');
                                var hoverBoxInModeY = _.assign({}, hoverBoxInFullJson);
                                hoverBoxInModeY.components = [_.omit(hoverBoxInFullJson.components[0], 'modes')];
                                hoverBoxInModeY.components[0].propertyQuery = "some-ovr-prop-query";
                                expect(this.ps.dal.get(this.hoverBoxWithChildrenPointer)).toEqual(hoverBoxInModeY);
                            });

                            it('should ensure the displayed json was updated (*setting to full dal triggers displayedJsonUpdater*)', function () {
                                var hoverBoxInFullJson = this.ps.dal.full.get(this.hoverBoxWithChildrenPointer);
                                var expectedHoverBoxInModeX = _.merge({}, hoverBoxInFullJson, anyXYInLayout);
                                expectedHoverBoxInModeX.components = [];

                                var expectedHoverBoxInModeY = _.merge({}, hoverBoxInFullJson, anyXYInLayout);
                                expectedHoverBoxInModeY.components = [_.omit(hoverBoxInFullJson.components[0], 'modes')];
                                expectedHoverBoxInModeY.components[0].propertyQuery = "some-ovr-prop-query";

                                // make sure hoverbox displayed responds well to modes before reparenting
                                this.ps.siteAPI.activateMode(this.hoverBoxWithChildrenPointer, 'modeX');
                                expect(this.ps.dal.get(this.hoverBoxWithChildrenPointer)).toEqual(expectedHoverBoxInModeX);
                                this.ps.siteAPI.switchModesByIds(this.hoverBoxWithChildrenPointer, this.page1Pointer.id, 'modeX', 'modeY');
                                expect(this.ps.dal.get(this.hoverBoxWithChildrenPointer)).toEqual(expectedHoverBoxInModeY);

                                structure.setContainer(this.ps, this.hoverBoxWithChildrenPointer, this.hoverBoxWithChildrenPointer, this.containerPointer);

                                // make sure hoverbox displayed responds well to modes after reparenting
                                expect(this.ps.dal.get(this.hoverBoxWithChildrenPointer)).toEqual(expectedHoverBoxInModeY);
                                this.ps.siteAPI.deactivateMode(this.hoverBoxWithChildrenPointer, 'modeY');
                                this.ps.siteAPI.activateMode(this.hoverBoxWithChildrenPointer, 'modeX');
                                expect(this.ps.dal.get(this.hoverBoxWithChildrenPointer)).toEqual(expectedHoverBoxInModeX);
                            });
                        });

                        describe('when the re-parented component is not a direct child of container with modes (button inside box inside hoverbox)', function () {
                            beforeEach(function () {
                                var buttonStructure = createButtonWithoutFixedPos(0, 0, 'myButton');
                                var innerContainerStructure = createContainerStructure(0, 0, [buttonStructure]);
                                innerContainerStructure.id = 'innerContainer';
                                var containerWithModesStructure = createContainerWithModesStructure('hb1', 20, 20, []);
                                this.ps = createMockPrivateServicesWithComponents([containerWithModesStructure, innerContainerStructure], {}, []);
                                this.hoverBoxPointer = this.ps.pointers.components.getComponent('hb1', this.page1Pointer);
                                this.innerContainerPointer = this.ps.pointers.components.getComponent('innerContainer', this.page1Pointer);
                                this.buttonToReparentPointer = this.ps.pointers.components.getComponent('myButton', this.page1Pointer);
                                this.ps.siteAPI.activateMode(this.hoverBoxPointer, 'mode1');

                                structure.setContainer(this.ps, this.hoverBoxPointer, this.innerContainerPointer, this.hoverBoxPointer);
                                this.ps.dal.merge(this.buttonToReparentPointer, {
                                    layout: {
                                        x: 100,
                                        y: 100
                                    }
                                });

                                this.ps.siteAPI.resetAllActiveModes();
                            });

                            it('should keep overrides that are still relevant in the new parent', function () {
                                structure.setContainer(this.ps, this.hoverBoxPointer, this.buttonToReparentPointer, this.hoverBoxPointer);

                                var fullButtonStructure = this.ps.dal.full.get(this.buttonToReparentPointer);

                                expect(fullButtonStructure.modes.overrides.length).toEqual(1);
                                expect(fullButtonStructure.modes.overrides[0].modeIds).toEqual(['mode1']);
                            });

                            describe('when the inner container is moved out of container with modes', function () {
                                it('should have the adjusted layout after reparenting', function () {
                                    var reparentedCompLayoutPointer = this.ps.pointers.getInnerPointer(this.innerContainerPointer, 'layout');
                                    var layoutBeforeReparent = this.ps.dal.get(reparentedCompLayoutPointer);

                                    structure.setContainer(this.ps, null, this.innerContainerPointer, this.page1Pointer);

                                    var layoutAfterReparent = this.ps.dal.get(reparentedCompLayoutPointer);
                                    expect(layoutAfterReparent).not.toEqual(layoutBeforeReparent);
                                });
                            });
                        });
                    });
                });

                describe('when new parent container has active modes', function () {
                    describe('when the "re-parented" component has no modes', function () {

                        beforeEach(function () {
                            structure.setContainer(this.ps, this.noModesButtonPointer, this.noModesButtonPointer, this.containerPointer);
                        });

                        it('should add the component with its full/displayed(they are equal) structure to the parent', function () {
                            expect(this.ps.pointers.components.getChildren(this.hoverBoxPointer)).not.toContain(this.noModesButtonPointer);
                            expect(_.map(componentModes.getComponentModes(this.ps, this.hoverBoxPointer), 'modeId')).toContain('mode2');

                            this.ps.siteAPI.activateMode(this.hoverBoxPointer, 'mode2');
                            structure.setContainer(this.ps, this.noModesButtonPointer, this.noModesButtonPointer, this.hoverBoxPointer);

                            expect(this.ps.pointers.components.getChildren(this.hoverBoxPointer)).toContain(this.noModesButtonPointer);
                            expect(this.ps.dal.get(this.noModesButtonPointer)).toEqual(_.merge({modes: {definitions: []}}, this.buttonWithNoModes, anyXYInLayout));
                            var addedModesToButton = {
                                isHiddenByModes: true,
                                definitions: [],
                                overrides: [{
                                    modeIds: ['mode2'],
                                    isHiddenByModes: false,
                                    layout: jasmine.any(Object)
                                }]
                            };
                            expect(this.ps.dal.full.get(this.noModesButtonPointer)).toEqual(_.merge({}, this.buttonWithNoModes, anyXYInLayout, {modes: addedModesToButton}));
                        });
                    });

                    describe('when the "re-parented" component has mode overrides', function () {
                        beforeEach(function () {
                            this.emptyHoverBoxStructure = createContainerWithModesStructure('hb2', 200, 200);
                            this.emptyHoverBoxStructure.modes = {
                                "definitions": [{
                                    modeId: 'mode-regular-id',
                                    type: 'REGULAR'
                                }, {
                                    modeId: 'mode-hover-id',
                                    type: 'HOVER'
                                }]
                            };
                            var pointerToPageChildren = this.ps.pointers.getInnerPointer(this.page1Pointer, 'components');
                            this.ps.dal.full.push(pointerToPageChildren, this.emptyHoverBoxStructure);
                            this.hoverBoxToReparent = this.ps.pointers.components.getComponent(this.emptyHoverBoxStructure.id, this.page1Pointer);

                            this.ps.siteAPI.activateMode(this.hoverBoxToReparent, 'mode-regular-id');
                            structure.setContainer(this.ps, this.noModesButtonPointer, this.noModesButtonPointer, this.hoverBoxToReparent);
                            this.componentWithModesToReparent = this.noModesButtonPointer;
                        });

                        describe('when the re-parented component has no children', function () {
                            it('should keep the displayed component "as-is" on the new parent with the corresponding active mode id on the full structure', function () {
                                var displayedComponent = this.ps.dal.get(this.componentWithModesToReparent);
                                var fullComponent = this.ps.dal.full.get(this.componentWithModesToReparent);

                                this.ps.siteAPI.activateMode(this.hoverBoxPointer, 'mode2');
                                structure.setContainer(this.ps, this.componentWithModesToReparent, this.componentWithModesToReparent, this.hoverBoxPointer);

                                expect(this.ps.dal.get(this.componentWithModesToReparent)).toEqual(_.merge({}, displayedComponent, anyXYInLayout));

                                var expectedFull = _.merge({}, fullComponent, anyXYInLayout);
                                expectedFull.modes = {
                                    isHiddenByModes: true,
                                    definitions: [],
                                    overrides: [{
                                        modeIds: ['mode2'],
                                        isHiddenByModes: false,
                                        layout: _.merge({}, fullComponent.layout, anyXYInLayout.layout)
                                    }]
                                };
                                var fullCompAfterReparent = this.ps.dal.full.get(this.componentWithModesToReparent);
                                expect(fullCompAfterReparent).toEqual(expectedFull);
                            });
                        });

                        xdescribe('when the re-parented component has children', function () {

                            beforeEach(function () {
                                this.componentWithModesToReparent = this.hoverBoxToReparent;
                            });

                            it('should make sure the reparented component has children', function () {
                                expect(this.ps.dal.full.get(this.componentWithModesToReparent).components).not.toBeEmpty();
                            });

                            it('should set the component to be hidden by default on the modes object', function () {
                                var hoverBoxInDisplayed = this.ps.dal.get(this.componentWithModesToReparent);
                                var hoverBoxInFull = this.ps.dal.full.get(this.componentWithModesToReparent);

                                this.ps.siteAPI.activateMode(this.hoverBoxPointer, 'mode1');
                                structure.setContainer(this.ps, this.componentWithModesToReparent, this.componentWithModesToReparent, this.containerPointer);

                                expect(_.last(this.ps.dal.full.get(this.containerPointer).components).id).toEqual(this.componentWithModesToReparent.id);
                                expect(this.ps.dal.get(this.componentWithModesToReparent)).toEqual(_.merge({}, hoverBoxInDisplayed, anyXYInLayout));
                                var expectedHoverBoxInFull = _.merge({}, hoverBoxInFull, anyXYInLayout);
                                expectedHoverBoxInFull.modes = {
                                    isHiddenByModes: true,
                                    overrides: [{
                                        modeIds: ['mode1'],
                                        isHiddenByModes: false,
                                        layout: jasmine.any(Object)
                                    }]
                                };
                                expectedHoverBoxInFull.components[0].modes.overrides.push({
                                    modeIds: ['mode1'],
                                    //isHiddenByModes: false, // should exist but not supported currently in HB feature!
                                    layout: jasmine.any(Object)
                                });
                                expect(this.ps.dal.full.get(this.componentWithModesToReparent)).toEqual(expectedHoverBoxInFull);
                            });

                            it('should set the component to be not hidden on the corresponding active mode overrides', function () {
                                this.ps.siteAPI.activateMode(this.hoverBoxPointer, 'mode2');
                                structure.setContainer(this.ps, this.componentWithModesToReparent, this.componentWithModesToReparent, this.hoverBoxPointer);
                                expect(this.ps.dal.get(this.componentWithModesToReparent)).toBeDefined();

                                this.ps.siteAPI.switchModesByIds(this.hoverBoxPointer.id, this.page1Pointer.id, 'mode2', 'mode1');
                                expect(this.ps.dal.get(this.componentWithModesToReparent)).not.toBeDefined();
                            });
                        });
                    });
                });

                describe('when moving the component to master page', function () {

                    function putButtonInHBActiveModeInContainer() {
                        this.ps.siteAPI.activateMode(this.hoverBoxPointer, 'mode2');
                        structure.setContainer(this.ps, this.noModesButtonPointer, this.noModesButtonPointer, this.hoverBoxPointer);
                        this.ps.siteAPI.deactivateMode(this.hoverBoxPointer, 'mode2');
                        this.ps.siteAPI.activateMode(this.hoverBoxPointer, 'mode1');
                        structure.setContainer(this.ps, this.hoverBoxPointer, this.hoverBoxPointer, this.containerPointer);
                    }

                    beforeEach(function () {
                        var viewMode = this.ps.siteDataAPI.siteData.getViewMode();
                        this.masterPagePointer = this.ps.pointers.components.getMasterPage(viewMode);
                        this.buttonDataId = this.ps.dal.get(this.ps.pointers.getInnerPointer(this.noModesButtonPointer, 'dataQuery')).replace('#', '');
                        this.currentPageId = this.page1Pointer.id;
                        this.masterPageId = this.masterPagePointer.id;

                        putButtonInHBActiveModeInContainer.call(this);
                    });

                    describe('when moving document data', function () {
                        it('should transfer the data of the component and its children to the master page', function () {
                            // cant use a pointer, since lookup always happens on focused root & masterpage, so path is always found in this case.
                            expect(this.ps.dal.isPathExist(['pagesData', this.currentPageId, 'data', 'document_data', this.buttonDataId])).toBeTruthy();
                            expect(this.ps.dal.isPathExist(['pagesData', this.masterPageId, 'data', 'document_data', this.buttonDataId])).toBeFalsy();

                            structure.setContainer(this.ps, this.containerPointer, this.containerPointer, this.masterPagePointer);

                            expect(this.ps.dal.isPathExist(['pagesData', this.currentPageId, 'data', 'document_data', this.buttonDataId])).toBeFalsy();
                            expect(this.ps.dal.isPathExist(['pagesData', this.masterPageId, 'data', 'document_data', this.buttonDataId])).toBeTruthy();

                            this.noModesButtonPointer = this.ps.pointers.components.getComponent('no-modes-button-id1', this.masterPagePointer);
                            this.hoverBoxPointer = this.ps.pointers.components.getComponent('hb', this.masterPagePointer);

                            expect(this.ps.dal.isExist(this.noModesButtonPointer)).toBeFalsy();
                            this.ps.siteAPI.activateMode(this.hoverBoxPointer, 'mode2');
                            expect(this.ps.dal.isExist(this.noModesButtonPointer)).toBeTruthy();
                        });
                    });

                    describe('when moving design data', function () {

                        beforeEach(function () {
                            this.hbOvrDesignDataId1 = 'hbOvrDesignDataId1';
                            this.hbOvrDesignDataId2 = 'hbOvrDesignDataId2';
                        });

                        it('should transfer the designData of a HoverBox together with its overrides to the master page', function () {
                            expect(this.ps.dal.isPathExist(['pagesData', this.currentPageId, 'data', 'design_data', this.hbOvrDesignDataId1])).toBeTruthy();
                            expect(this.ps.dal.isPathExist(['pagesData', this.masterPageId, 'data', 'design_data', this.hbOvrDesignDataId1])).toBeFalsy();
                            expect(this.ps.dal.isPathExist(['pagesData', this.currentPageId, 'data', 'design_data', this.hbOvrDesignDataId2])).toBeTruthy();
                            expect(this.ps.dal.isPathExist(['pagesData', this.masterPageId, 'data', 'design_data', this.hbOvrDesignDataId2])).toBeFalsy();

                            structure.setContainer(this.ps, this.hoverBoxPointer, this.hoverBoxPointer, this.masterPagePointer);

                            expect(this.ps.dal.isPathExist(['pagesData', this.masterPageId, 'data', 'design_data', this.hbOvrDesignDataId1])).toBeTruthy();
                            expect(this.ps.dal.isPathExist(['pagesData', this.currentPageId, 'data', 'design_data', this.hbOvrDesignDataId1])).toBeFalsy();
                            expect(this.ps.dal.isPathExist(['pagesData', this.masterPageId, 'data', 'design_data', this.hbOvrDesignDataId2])).toBeTruthy();
                            expect(this.ps.dal.isPathExist(['pagesData', this.currentPageId, 'data', 'design_data', this.hbOvrDesignDataId2])).toBeFalsy();
                        });
                    });
                });
            });
        });

        describe('updateFixedPosition', function () {

            function mockRequireMeasureData() {
                siteData.addMeasureMap({
                    clientWidth: 1000,
                    minWidth: {'buttonA': 2},
                    minHeight: {'buttonA': 2}
                });
            }

            function mockCurrentPage(pageId) {
                siteData.setCurrentPage(pageId);
            }

            /** @type ps */
            var mockPrivateServices;

            describe('toggle on', function () {
                beforeEach(function () {
                    var buttonWithoutFixedPos = createButtonWithoutFixedPos(10, 10);
                    var pageComponents = [
                        createContainerStructure(50, 50, [buttonWithoutFixedPos])
                    ];

                    spyOn(componentsMetaData.public, 'canBeFixedPosition').and.returnValue(true);

                    mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                    mockRequireMeasureData();
                    mockCurrentPage('page1');
                });

                it('should update fixedPosition property in component layout to true', function () {
                    var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                    var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);

                    structure.updateFixedPosition(mockPrivateServices, buttonCompPointer, true);

                    var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                    var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                    expect(buttonLayout.fixedPosition).toEqual(true);
                });

                it('should translate coordinates', function () {
                    var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                    var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);

                    structure.updateFixedPosition(mockPrivateServices, buttonCompPointer, true);

                    var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                    var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                    expect(buttonLayout.x).toEqual(70); //siteX = 10, containerX = 50, buttonX = 10
                    expect(buttonLayout.y).toEqual(171); //pagesContainerY = 111, containerY = 50, buttonY = 10
                });

                it('should set current page as parent for not show on all pages component', function () {
                    var pagePointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                    var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', pagePointer);
                    var page = mockPrivateServices.dal.get(pagePointer);

                    expect(page.components.length).toBe(1);

                    structure.updateFixedPosition(mockPrivateServices, buttonCompPointer, true);

                    var pageAfterAction = mockPrivateServices.dal.get(pagePointer);
                    expect(pageAfterAction.components.length).toBe(2);
                    expect(_.pluck(pageAfterAction.components, 'id')).toContain('buttonA');
                });

                it('should set master page as parent for show on all pages component', function () {
                    fakeSiteX(10);
                    fakeSiteStructureMeasure();

                    var pagePointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                    var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', pagePointer);
                    var containerPointer = mockPrivateServices.pointers.components.getComponent('container', pagePointer);
                    var masterPagePointer = mockPrivateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                    var masterPageChildrenPointer = mockPrivateServices.pointers.getInnerPointer(masterPagePointer, 'children');
                    var originalMasterPageChildren = mockPrivateServices.dal.full.get(masterPageChildrenPointer);

                    structure.setContainer(mockPrivateServices, containerPointer, containerPointer, masterPagePointer);
                    var masterPageChildren = mockPrivateServices.dal.full.get(masterPageChildrenPointer);

                    expect(masterPageChildren.length).toBe(originalMasterPageChildren.length + 1);

                    structure.updateFixedPosition(mockPrivateServices, buttonCompPointer, true);


                    masterPageChildren = mockPrivateServices.dal.full.get(masterPageChildrenPointer);
                    expect(masterPageChildren.length).toBe(originalMasterPageChildren.length + 2);
                    expect(_.pluck(masterPageChildren, 'id')).toContain('buttonA');
                });
            });

            describe('toggle off', function () {
                beforeEach(function () {
                    var pageComponents = [createButtonWithFixedStructure(70, 171)];

                    spyOn(componentsMetaData.public, 'canBeFixedPosition').and.returnValue(true);

                    mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                    mockRequireMeasureData();
                    mockCurrentPage('page1');
                });
                it('should update fixedPosition property in component layout to false', function () {

                    var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                    var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);

                    structure.updateFixedPosition(mockPrivateServices, buttonCompPointer, false);

                    var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                    var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                    expect(buttonLayout.fixedPosition).toEqual(false);
                });

                it('should translate coordinates', function () {
                    var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                    var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);

                    structure.updateFixedPosition(mockPrivateServices, buttonCompPointer, false);

                    var buttonLayoutPointer = mockPrivateServices.pointers.getInnerPointer(buttonCompPointer, 'layout');
                    var buttonLayout = mockPrivateServices.dal.get(buttonLayoutPointer);

                    expect(buttonLayout.x).toEqual(60); //siteX = 10, buttonX = 70
                    expect(buttonLayout.y).toEqual(60); //pagesContainerY = 111, buttonY = 171
                });
            });
        });

        describe('isRenderedInFixedPosition', function () {
            var mockPrivateServices;

            it('should return false if fixed position value in layout is false', function () {
                var buttonWithoutFixedPos = createButtonWithoutFixedPos();

                var pageComponents = [buttonWithoutFixedPos];
                mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);

                var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);

                var result = structure.isRenderedInFixedPosition(mockPrivateServices, buttonCompPointer);

                expect(result).toEqual(false);
            });

            describe('fixed position value in layout is true', function () {
                function updatesRenderFixedPositionContainersFlag(value) {
                    siteData.renderFlags = {
                        renderFixedPositionContainers: value
                    };

                }

                describe('the component is header or footer or tiny menu', function () {
                    beforeEach(function () {
                        var pageComponents = [
                            {
                                "id": "header",
                                "type": "Component",
                                "layout": {
                                    "width": 400,
                                    "height": 100,
                                    "x": 0,
                                    "y": 0,
                                    "fixedPosition": true,
                                    "rotationInDegrees": 0,
                                    "anchors": []
                                },
                                "componentType": "wysiwyg.viewer.components.HeaderContainer",
                                "dataQuery": "#dataItem-i9il8m2l1",
                                "propertyQuery": "propItem-i9il8m2m",
                                "components": []
                            }
                        ];
                        mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                    });
                    it('should return false if renderFixedPositionContainers flag is false ', function () {
                        updatesRenderFixedPositionContainersFlag(false);

                        var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var headerCompPointer = mockPrivateServices.pointers.components.getComponent('header', page1Pointer);

                        var result = structure.isRenderedInFixedPosition(mockPrivateServices, headerCompPointer);

                        expect(result).toEqual(false);
                    });

                    it('should return true if renderFixedPositionContainers flag is true ', function () {
                        updatesRenderFixedPositionContainersFlag(true);

                        var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                        var header = mockPrivateServices.pointers.components.getComponent('header', page1Pointer);

                        var result = structure.isRenderedInFixedPosition(mockPrivateServices, header);

                        expect(result).toEqual(true);
                    });
                });

                it('should return true if component is not header or footer or tiny menu', function () {
                    updatesRenderFixedPositionContainersFlag(false); //other comps dont depend on this flag

                    var pageComponents = [createButtonWithFixedStructure()];
                    mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);

                    var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                    var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', page1Pointer);

                    var result = structure.isRenderedInFixedPosition(mockPrivateServices, buttonCompPointer);

                    expect(result).toEqual(true);
                });
            });
        });

        describe('getCompLayoutRelativeToStructure', function () {

            describe('handle fixed position components', function () {
                var mockPrivateServices;

                it('should subtract the siteX from layout x', function () {
                    var pageComponents = [createButtonWithFixedStructure(40, 10)];

                    mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                    fakeSiteX(10);

                    var pagePointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                    var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', pagePointer);

                    var compLayoutRelativeToStructure = structure.getCompLayoutRelativeToStructure(mockPrivateServices, buttonCompPointer);
                    expect(compLayoutRelativeToStructure.x).toEqual(30); // compX = 40, siteX= 10
                });

                it('should return correct position for child of fixed position container', function () {
                    var buttonWithoutFixedPos = createButtonWithoutFixedPos(10, 10);
                    var pageComponents = [
                        createContainerWithFixedPosition(100, 300, [buttonWithoutFixedPos])
                    ];

                    mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                    fakeSiteX(20);

                    var pagePointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                    var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', pagePointer);

                    var compLayoutRelativeToStructure = structure.getCompLayoutRelativeToStructure(mockPrivateServices, buttonCompPointer);

                    expect(compLayoutRelativeToStructure.x).toEqual(90); //compX = 10, containerX = 100, siteX = 20  -> 10 + 100 -20
                    expect(compLayoutRelativeToStructure.y).toEqual(310); //compY = 10, containerY = 300 -> 10 + 300
                });
            });

            describe('handle components stretched to screen width', function () {
                var mockPrivateServices;

                it('should subtract the siteX from layout x', function () {
                    var pageComponents = [
                        {
                            "id": "buttonA",
                            "type": "Component",
                            "layout": {
                                "height": 10,
                                "docked": {
                                    "left": {"vw": 0},
                                    "right": {"vw": 0}
                                },
                                "y": 10,
                                "rotationInDegrees": 0,
                                "anchors": []
                            },
                            "componentType": "wysiwyg.viewer.components.SiteButton",
                            "dataQuery": "#dataQuery",
                            "propertyQuery": "propItem",
                            "components": []
                        }
                    ];

                    mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                    fakeSiteX(10);

                    var pagePointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                    var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', pagePointer);

                    var compLayoutRelativeToStructure = structure.getCompLayoutRelativeToStructure(mockPrivateServices, buttonCompPointer);
                    expect(compLayoutRelativeToStructure.x).toEqual(-10);
                    expect(compLayoutRelativeToStructure.width).toEqual(1000);
                });
            });

        });

        describe('getCompLayoutRelativeToScreenConsideringScroll', function () {
            function fakeScrollY(scrollY) {
                spyOn(windowScroll, 'getScroll').and.returnValue({
                    x: 0,
                    y: scrollY ? scrollY : 0
                });
            }

            var mockPrivateServices;
            it('should get layout relative to screen and add scroll y if component is not fixed', function () {
                var buttonWithoutFixedPos = createButtonWithoutFixedPos();

                var pageComponents = [buttonWithoutFixedPos];

                mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                fakeSiteX(10);
                fakeScrollY(30);

                var pagePointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', pagePointer);

                var compLayoutRelativeToStructure = structure.getCompLayoutRelativeToScreenConsideringScroll(mockPrivateServices, buttonCompPointer);
                expect(compLayoutRelativeToStructure.y).toEqual(161); // pagesContainer = 111, compY = 80, scroll = 30 => 111 + 80 - 30 = 161
            });

            it('should get layout relative to screen and ignore scroll y if component is fixed position', function () {
                var pageComponents = [createButtonWithFixedStructure(100, 200)];

                mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                fakeSiteX(10);
                fakeScrollY(30);

                var pagePointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                var buttonCompPointer = mockPrivateServices.pointers.components.getComponent('buttonA', pagePointer);

                var compLayoutRelativeToStructure = structure.getCompLayoutRelativeToScreenConsideringScroll(mockPrivateServices, buttonCompPointer);
                expect(compLayoutRelativeToStructure.y).toEqual(200); // compY = 200
            });
        });

        describe('Component layout updates and preserving layouts proportions', function () {

            function removeMinLayouts(proportionStructure) {
                delete proportionStructure.minLayout;
                _.forEach(proportionStructure.children, removeMinLayouts);
            }

            describe('Get component proportions structure', function () {
                it('should retrieve components hierarchy structure with descendants layouts as ratios (proportions)', function () {
                    var pageContents = [{
                        id: 'top-container',
                        layout: {x: 0, y: 0, width: 800, height: 800},
                        children: [{
                            id: 'container',
                            layout: {x: 0, y: 0, width: 400, height: 400},
                            children: [
                                {
                                    id: 'child1',
                                    layout: {x: 100, y: 100, width: 100, height: 100},
                                    children: []
                                },
                                {
                                    id: 'child2',
                                    layout: {x: 200, y: 200, width: 100, height: 100},
                                    children: [
                                        {
                                            id: 'grandchild',
                                            layout: {x: 50, y: 50, width: 50, height: 50},
                                            children: []
                                        }
                                    ]
                                }
                            ]
                        }]
                    }];
                    prepareTest('page1', pageContents);

                    var containerPointer = getCompPointer(privateServices, 'container', 'page1');

                    var expected = {
                        component: containerPointer,
                        proportions: {x: 0, y: 0, width: 0.5, height: 0.5},
                        children: [
                            {
                                component: getCompPointer(privateServices, 'child1', 'page1'),
                                proportions: {x: 0.25, y: 0.25, width: 0.25, height: 0.25},
                                children: []
                            },
                            {
                                component: getCompPointer(privateServices, 'child2', 'page1'),
                                proportions: {x: 0.5, y: 0.5, width: 0.25, height: 0.25},
                                children: [
                                    {
                                        component: getCompPointer(privateServices, 'grandchild', 'page1'),
                                        proportions: {x: 0.5, y: 0.5, width: 0.5, height: 0.5},
                                        children: []
                                    }
                                ]
                            }
                        ]
                    };

                    var proportionalStructure = structure.getProportionStructure(privateServices, containerPointer);
                    removeMinLayouts(proportionalStructure);
                    expect(proportionalStructure).toEqual(expected);
                });
            });

            describe('Updating component layout and preserve internal proportions', function () {
                function addMinLayouts(proportionStructure) {
                    proportionStructure.minLayout = {width: 5, height: 5};
                    _.forEach(proportionStructure.children, addMinLayouts);
                }

                it('should resize and keep position and dimension ratios of child components', function () {
                    var pageContents = [{
                        id: 'top-container',
                        layout: {x: 0, y: 0, width: 800, height: 800},
                        children: [{
                            id: 'container',
                            layout: {x: 0, y: 0, width: 400, height: 400},
                            children: [
                                {
                                    id: 'child1',
                                    layout: {x: 100, y: 100, width: 100, height: 100},
                                    children: []
                                },
                                {
                                    id: 'child2',
                                    layout: {x: 200, y: 200, width: 100, height: 100},
                                    children: [
                                        {
                                            id: 'grandchild',
                                            layout: {x: 50, y: 50, width: 50, height: 50},
                                            children: []
                                        }
                                    ]
                                }
                            ]
                        }]
                    }];

                    prepareTest('page1', pageContents);
                    var containerPointer = getCompPointer(privateServices, 'container', 'page1');
                    var child1Pointer = getCompPointer(privateServices, 'child1', 'page1');
                    var child2Pointer = getCompPointer(privateServices, 'child2', 'page1');
                    var grandchlidPointer = getCompPointer(privateServices, 'grandchild', 'page1');

                    var proportionStructure = structure.getProportionStructure(privateServices, containerPointer);
                    addMinLayouts(proportionStructure);

                    structure.updateAndPreserveProportions(privateServices, {
                        width: 200,
                        height: 200
                    }, proportionStructure);

                    var containerLayout = privateServices.dal.get(containerPointer).layout;
                    var child1Layout = privateServices.dal.get(child1Pointer).layout;
                    var child2Layout = privateServices.dal.get(child2Pointer).layout;
                    var grandchildLayout = privateServices.dal.get(grandchlidPointer).layout;

                    expect(containerLayout).toEqual(jasmine.objectContaining({
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 200
                    }));
                    expect(child1Layout).toEqual(jasmine.objectContaining({
                        x: 50,
                        y: 50,
                        width: 50,
                        height: 50
                    }));
                    expect(child2Layout).toEqual(jasmine.objectContaining({
                        x: 100,
                        y: 100,
                        width: 50,
                        height: 50
                    }));
                    expect(grandchildLayout).toEqual(jasmine.objectContaining({
                        x: 25,
                        y: 25,
                        width: 25,
                        height: 25
                    }));
                });

                it('should maintain the same layout schema as before the updateAndPreserveProportions', function () {
                    var pageContents = [{
                        id: 'top-container',
                        layout: {x: 0, y: 0, width: 800, height: 800},
                        children: [{
                            id: 'container',
                            layout: {y: 0, width: 400, height: 400, docked: {left: {px: 20}}},
                            children: [
                                {
                                    id: 'child1',
                                    layout: {x: 100, y: 100, width: 100, height: 100},
                                    children: []
                                },
                                {
                                    id: 'child2',
                                    layout: {x: 0, y: 10, width: 50, height: 50},
                                    children: [
                                        {
                                            id: 'grandchild',
                                            layout: {x: 5, y: 5, width: 20, height: 20},
                                            children: []
                                        }
                                    ]
                                }
                            ]
                        }]
                    }];

                    var mockPrivateServices = createMockPrivateServicesWithComponents(pageContents);

                    var mockMeasureMap = {width: {}, height: {}, x: {}, y: {}};
                    var compId = 'container';
                    mockMeasureMap.width[compId] = 130;
                    mockMeasureMap.height[compId] = 60;
                    mockMeasureMap.x[compId] = 20;
                    mockMeasureMap.y[compId] = 261;

                    siteData.addMeasureMap(mockMeasureMap);
                    prepareTest('page1', pageContents);
                    var containerPointer = getCompPointer(mockPrivateServices, 'container', 'page1');

                    var proportionStructure = structure.getProportionStructure(mockPrivateServices, containerPointer);
                    addMinLayouts(proportionStructure);

                    structure.updateAndPreserveProportions(mockPrivateServices, {
                        y: 20,
                        height: 380
                    }, proportionStructure);

                    var containerLayout = mockPrivateServices.dal.get(containerPointer).layout;

                    expect(containerLayout.docked).toBeDefined();
                    expect(containerLayout.docked.left.px).toBe(20);
                });

            });
        });

        describe('Aspect ratio', function () {
            var mockPrivateServices;

            function getComponentWithSize(id, width, height, aspectRatio) {
                var layout = {
                    "width": width,
                    "height": height,
                    "x": 0,
                    "y": 0,
                    "rotationInDegrees": 0,
                    "anchors": []
                };

                if (aspectRatio) {
                    layout.aspectRatio = aspectRatio;
                }

                return {
                    "id": id,
                    "type": "Component",
                    "layout": layout,
                    "componentType": "mobile.core.components.Container",
                    "components": []
                };
            }

            function createComponentWithSize(width, height, aspectRatio) {
                var pageComponents = [getComponentWithSize('arComponent', width, height, aspectRatio)];
                mockPrivateServices = createMockPrivateServicesWithComponents(pageComponents);
                var page1Pointer = mockPrivateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);

                return mockPrivateServices.pointers.components.getComponent('arComponent', page1Pointer);
            }

            describe('updateAspectRatio', function () {
                it('should save aspectRation with maximum 5 decimal numbers', function () {
                    var arComponent = createComponentWithSize(90, 20);
                    structure.updateAspectRatio(mockPrivateServices, arComponent);

                    var componentLayoutPointer = mockPrivateServices.pointers.getInnerPointer(arComponent, 'layout');
                    var arComponentLayout = mockPrivateServices.dal.get(componentLayoutPointer);

                    expect(arComponentLayout.aspectRatio).toEqual(0.22222);
                });
            });

            describe('removeAspectRatio', function () {
                it('should delete aspectRatio property from layout', function () {
                    var arComponent = createComponentWithSize(80, 20, 0.25);
                    structure.removeAspectRatio(mockPrivateServices, arComponent);

                    var componentLayoutPointer = mockPrivateServices.pointers.getInnerPointer(arComponent, 'layout');
                    var arComponentLayout = mockPrivateServices.dal.get(componentLayoutPointer);

                    expect(arComponentLayout.aspectRatio).not.toBeDefined();
                });
            });

            describe('isAspectRatioOn', function () {
                it('should return true if aspectRatio is defined', function () {
                    var arComponent = createComponentWithSize(80, 20, 0.25);

                    expect(structure.isAspectRatioOn(mockPrivateServices, arComponent)).toEqual(true);
                });

                it('should return false if aspectRatio is undefined', function () {
                    var arComponent = createComponentWithSize(80, 20);

                    expect(structure.isAspectRatioOn(mockPrivateServices, arComponent)).toEqual(false);
                });
            });
        });
    });
});
