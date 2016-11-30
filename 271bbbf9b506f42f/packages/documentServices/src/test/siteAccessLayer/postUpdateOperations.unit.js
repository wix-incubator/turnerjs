define(['lodash', 'testUtils', 'utils', 'documentServices/siteAccessLayer/postUpdateOperations',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/constants/constants',
        'documentServices/documentMode/documentMode',
        'documentServices/component/componentModes'],
    function (_, testUtils, utils, postUpdateOperations, privateServicesHelper, constants, documentMode, componentModes) {
        "use strict";

        describe("postUpdateOperations", function () {
            var openExperiments = testUtils.experimentHelper.openExperiments;
            var defaultPagesData, defaultMeasureMap, defaultLayout;

            function getPrivateServicesAndSiteAPI(pagesData, measureMap, reLayoutedCompsMap) {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPage(pagesData)
                    .addMeasureMap(measureMap)
                    .setReLayoutedCompsMap(reLayoutedCompsMap || {});
                siteData.textRuntimeLayout = {compHeight: {MOBILE: {}, DESKTOP: {}}};

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {
                    siteData: [{
                        path: ['pagesData'],
                        optional: false
                    }, {path: ['textRuntimeLayout'], optional: false}]
                });
                spyOn(privateServices.siteAPI, 'getAllRenderedRootIds').and.returnValue(['masterPage', 'mainPage']);
                return privateServices;
            }

            function getCompPointer(ps, compId, pageId, viewMode) {
                viewMode = viewMode || constants.VIEW_MODES.DESKTOP;
                var pagePointer = ps.pointers.components.getPage(pageId, viewMode);
                var compPointer = compId === pageId ? pagePointer : ps.pointers.components.getComponent(compId, pagePointer);
                return compPointer;
            }

            function getCompLayoutProp(ps, compId, pageId, layoutProp, viewMode) {
                var comp = getCompPointer(ps, compId, pageId, viewMode);
                var prop = ps.pointers.getInnerPointer(comp, ['layout', layoutProp]);
                return ps.dal.get(prop);
            }

            function getCompFullStructure(ps, compId, pageId) {
                var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var compPointer = compId === pageId ? page : ps.pointers.components.getComponent(compId, page);
                return ps.dal.full.get(compPointer);
            }

            beforeEach(function () {
                defaultLayout = {
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 100
                };
                defaultPagesData = {
                    masterPage: {
                        data: {
                            theme_data: {},
                            component_properties: {},
                            design_data: {},
                            document_data: {
                                mainPage: {},
                                masterPage: {}
                            }
                        },
                        structure: {
                            children: [
                                {
                                    id: 'SITE_HEADER',
                                    layout: _.defaults({y: 0, height: 100}, defaultLayout),
                                    componentType: 'HeaderContainer'
                                }, {
                                    id: 'PAGES_CONTAINER',
                                    layout: _.defaults({y: 100, height: 500}, defaultLayout),
                                    componentType: 'PagesContainer'
                                }, {
                                    id: 'SITE_FOOTER',
                                    layout: _.defaults({y: 500, height: 50}, defaultLayout),
                                    componentType: 'FooterContainer'
                                }
                            ],
                            mobileComponents: [
                                {
                                    id: 'SITE_HEADER',
                                    layout: _.defaults({y: 0, height: 100}, defaultLayout),
                                    componentType: 'HeaderContainer'
                                }, {
                                    id: 'PAGES_CONTAINER',
                                    layout: _.defaults({y: 100, height: 500}, defaultLayout),
                                    componentType: 'PagesContainer'
                                }, {
                                    id: 'SITE_FOOTER',
                                    layout: _.defaults({y: 500, height: 50}, defaultLayout),
                                    componentType: 'FooterContainer'
                                }
                            ],
                            type: "Document",
                            id: "masterPage",
                            layout: {}
                        }
                    },
                    mainPage: {
                        data: {
                            component_properties: {},
                            design_data: {}
                        },
                        structure: {
                            componentType: 'mobile.core.components.Page',
                            layout: {
                                x: 0,
                                y: 0,
                                width: 0,
                                height: 0,
                                anchors: []
                            },
                            type: "Page",
                            components: [],
                            mobileComponents: [],
                            id: 'mainPage'
                        }
                    }
                };

                defaultMeasureMap = {
                    height: {
                        masterPage: 1000,
                        mainPage: 200,
                        SITE_HEADER: 100,
                        PAGES_CONTAINER: 500,
                        SITE_FOOTER: 50
                    },
                    minHeight: {},
                    width: {
                        masterPage: 1000,
                        mainPage: 200
                    },
                    top: {
                        masterPage: 100,
                        mainPage: 20
                    },
                    left: {}
                };
            });

            it("should pass", function () {
                var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);
                expect(function () {
                    postUpdateOperations.runPostUpdateOperations(ps);
                }).not.toThrow();
            });

            it("should not fail if the component has no layout property", function () {
                var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);
                postUpdateOperations.runPostUpdateOperations(ps);
                expect(getCompLayoutProp(ps, 'mainPage', 'mainPage', 'height')).toBe(defaultMeasureMap.height.mainPage);
                expect(getCompLayoutProp(ps, 'mainPage', 'mainPage', 'y')).toBe(defaultMeasureMap.top.mainPage);
            });

            //doesn't work for master page
            it("should set the components height and top", function () {
                var pagesData = _.cloneDeep(defaultPagesData);
                var measureMap = _.cloneDeep(defaultMeasureMap);
                pagesData.mainPage.structure.components.push({
                    componentType: 'someComp',
                    id: 'comp1',
                    layout: {}
                });
                pagesData.masterPage.structure.children.push({
                    componentType: 'someComp',
                    id: 'comp2',
                    layout: {}
                });
                measureMap.height.comp1 = 1;
                measureMap.height.comp2 = 2;
                measureMap.width.comp1 = 11;
                measureMap.width.comp2 = 22;
                measureMap.top.comp1 = 3;
                measureMap.top.comp2 = 4;

                var reLayoutedCompsMap = {
                    comp1: true,
                    comp2: true
                };

                var ps = getPrivateServicesAndSiteAPI(pagesData, measureMap, reLayoutedCompsMap);
                postUpdateOperations.runPostUpdateOperations(ps);

                expect(getCompLayoutProp(ps, 'comp1', 'mainPage', 'height')).toBe(measureMap.height.comp1);
                expect(getCompLayoutProp(ps, 'comp1', 'mainPage', 'y')).toBe(measureMap.top.comp1);
                expect(getCompLayoutProp(ps, 'comp2', 'masterPage', 'height')).toBe(measureMap.height.comp2);
                expect(getCompLayoutProp(ps, 'comp2', 'masterPage', 'y')).toBe(measureMap.top.comp2);
            });

            it('should not update json if layout is the same - to avoid creating layout overrides in active mode with the same value as the structure layout', function () {
                var pagesData = _.cloneDeep(defaultPagesData);
                var measureMap = _.cloneDeep(defaultMeasureMap);
                var child = {
                    componentType: 'someComp',
                    id: 'child',
                    layout: {x: 10, y: 20, width: 30, height: 40},
                    modes: {
                        overrides: []
                    }
                };
                var containerWithActiveMode = {
                    componentType: 'someComp',
                    id: 'containerWithModes',
                    layout: {},
                    modes: {
                        definitions: [{modeId: 'someMode', type: utils.siteConstants.COMP_MODES_TYPES.DEFAULT}]
                    },
                    children: [child]
                };
                pagesData.mainPage.structure.components.push(containerWithActiveMode);
                measureMap.top.child = child.layout.y;
                measureMap.left.child = child.layout.x;
                measureMap.width.child = child.layout.width;
                measureMap.height.child = child.layout.height;

                var reLayoutedCompsMap = {
                    child: true
                };

                var ps = getPrivateServicesAndSiteAPI(pagesData, measureMap, reLayoutedCompsMap);
                postUpdateOperations.runPostUpdateOperations(ps);

                var childPointer = getCompPointer(ps, 'child', 'mainPage');
                var childModesPointer = ps.pointers.componentStructure.getModes(childPointer);
                expect(ps.dal.full.get(childModesPointer).overrides.length).toEqual(0);
            });

            it('should create layout overrides for components that measured different layout under parent active mode', function () {
                var pagesData = _.cloneDeep(defaultPagesData);
                var measureMap = _.cloneDeep(defaultMeasureMap);
                var child = {
                    componentType: 'someComp',
                    id: 'child',
                    layout: {x: 10, y: 20, width: 30, height: 40},
                    modes: {
                        overrides: []
                    }
                };
                var containerWithActiveMode = {
                    componentType: 'someComp',
                    id: 'containerWithModes',
                    layout: {},
                    modes: {
                        definitions: [
                            {modeId: 'someMode', type: utils.siteConstants.COMP_MODES_TYPES.DEFAULT},
                            {modeId: 'someHoverMode', type: utils.siteConstants.COMP_MODES_TYPES.HOVER}
                        ]
                    },
                    children: [child]
                };
                pagesData.mainPage.structure.components.push(containerWithActiveMode);
                measureMap.top.child = child.layout.y + 20;
                measureMap.width.child = child.layout.width;
                measureMap.height.child = child.layout.height;

                var reLayoutedCompsMap = {
                    child: true
                };

                var ps = getPrivateServicesAndSiteAPI(pagesData, measureMap, reLayoutedCompsMap);
                var containerPointer = getCompPointer(ps, 'containerWithModes', 'mainPage');
                ps.siteAPI.activateMode(containerPointer, 'someHoverMode');
                postUpdateOperations.runPostUpdateOperations(ps);

                var childPointer = getCompPointer(ps, 'child', 'mainPage');
                var childModesPointer = ps.pointers.componentStructure.getModes(childPointer);
                expect(ps.dal.full.get(childModesPointer).overrides.length).toEqual(1);
            });

            describe('should not update structures for comps which do not have all of measured width, height and top', function () {
                var pagesData, measureMap;
                beforeEach(function () {
                    pagesData = _.cloneDeep(defaultPagesData);
                    measureMap = _.cloneDeep(defaultMeasureMap);
                    pagesData.mainPage.structure.components.push({
                        componentType: 'someComp',
                        id: 'comp1',
                        layout: {
                            height: 100,
                            width: 200,
                            y: 300,
                            anchors: []
                        }
                    });

                    measureMap.height.comp1 = 1;
                    measureMap.width.comp1 = 2;
                    measureMap.top.comp1 = 3;
                });
                it('if only top does not exist, it should not update the structure', function () {
                    delete measureMap.top.comp1;

                    var reLayoutedCompsMap = {
                        comp1: true
                    };

                    var ps = getPrivateServicesAndSiteAPI(pagesData, measureMap, reLayoutedCompsMap);
                    postUpdateOperations.runPostUpdateOperations(ps);

                    expect(getCompLayoutProp(ps, 'comp1', 'mainPage', 'height')).toBe(100);
                    expect(getCompLayoutProp(ps, 'comp1', 'mainPage', 'width')).toBe(200);
                    expect(getCompLayoutProp(ps, 'comp1', 'mainPage', 'y')).toBe(300);
                });

                it('if only width does not exist, it should not update the structure', function () {
                    delete measureMap.width.comp1;

                    var ps = getPrivateServicesAndSiteAPI(pagesData, measureMap);
                    postUpdateOperations.runPostUpdateOperations(ps);

                    expect(getCompLayoutProp(ps, 'comp1', 'mainPage', 'height')).toBe(100);
                    expect(getCompLayoutProp(ps, 'comp1', 'mainPage', 'width')).toBe(200);
                    expect(getCompLayoutProp(ps, 'comp1', 'mainPage', 'y')).toBe(300);

                });

                it('if only height does not exist, it should not update the structure', function () {
                    delete measureMap.height.comp1;

                    var ps = getPrivateServicesAndSiteAPI(pagesData, measureMap);
                    postUpdateOperations.runPostUpdateOperations(ps);

                    expect(getCompLayoutProp(ps, 'comp1', 'mainPage', 'height')).toBe(100);
                    expect(getCompLayoutProp(ps, 'comp1', 'mainPage', 'width')).toBe(200);
                    expect(getCompLayoutProp(ps, 'comp1', 'mainPage', 'y')).toBe(300);
                });
            });

            describe('updating structure for components affected by component modes', function () {
                beforeEach(function () {
                    openExperiments(['sv_hoverBox']);

                    this.pagesData = _.cloneDeep(defaultPagesData);
                    this.measureMap = _.cloneDeep(defaultMeasureMap);
                    this.pagesData.mainPage.structure.components.push({
                        componentType: 'someComp',
                        id: 'container-with-modes',
                        layout: {
                            height: 100,
                            width: 200,
                            y: 300,
                            anchors: []
                        },
                        modes: {
                            definitions: [{
                                modeId: 'crazy-mode'
                            }]
                        },
                        components: [{
                            componentType: 'someComp',
                            id: 'child',
                            layout: {
                                height: 100,
                                width: 200,
                                y: 300,
                                x: 400,
                                anchors: []
                            },
                            modes: {
                                overrides: [{
                                    modeIds: ['inactive-mode'],
                                    layout: {
                                        height: 0
                                    }
                                }]
                            }
                        }, {
                            componentType: 'someComp',
                            id: 'child-with-active-overrides',
                            layout: {
                                height: 100,
                                width: 200,
                                y: 300,
                                x: 400,
                                anchors: []
                            },
                            modes: {
                                overrides: [{
                                    modeIds: ['crazy-mode'],
                                    layout: {
                                        height: 0
                                    }
                                }]
                            }
                        }]
                    });

                    this.measureMap.height.child = 1;
                    this.measureMap.width.child = 2;
                    this.measureMap.top.child = 3;
                    this.measureMap.left.child = 4;
                    this.measureMap.height['child-with-active-overrides'] = 1;
                    this.measureMap.width['child-with-active-overrides'] = 2;
                    this.measureMap.top['child-with-active-overrides'] = 3;
                    this.measureMap.left['child-with-active-overrides'] = 4;


                    this.reLayoutedCompsMap = {
                        child: true,
                        'child-with-active-overrides': true
                    };
                });

                it('should not create overrides in structure when there are NO active overrides', function () {
                    var ps = getPrivateServicesAndSiteAPI(this.pagesData, this.measureMap, this.reLayoutedCompsMap);
                    postUpdateOperations.runPostUpdateOperations(ps);

                    var compStructure = getCompFullStructure(ps, 'child', 'mainPage');
                    expect(compStructure.modes.overrides.length).toEqual(1);
                    expect(compStructure.modes.overrides[0].modeIds).toEqual(['inactive-mode']);
                    expect(getCompLayoutProp(ps, 'child', 'mainPage', 'height')).toBe(1);
                    expect(getCompLayoutProp(ps, 'child', 'mainPage', 'width')).toBe(2);
                    expect(getCompLayoutProp(ps, 'child', 'mainPage', 'y')).toBe(3);
                    expect(getCompLayoutProp(ps, 'child', 'mainPage', 'x')).toBe(4);
                });

                it('should update overrides in structure when there are active overrides', function () {
                    var ps = getPrivateServicesAndSiteAPI(this.pagesData, this.measureMap, this.reLayoutedCompsMap);
                    var pagePointer = ps.pointers.components.getPage('mainPage', constants.VIEW_MODES.DESKTOP);
                    var compPointer = ps.pointers.components.getComponent('container-with-modes', pagePointer);

                    componentModes.activateComponentMode(ps, compPointer, 'crazy-mode');
                    postUpdateOperations.runPostUpdateOperations(ps);

                    var compStructure = getCompFullStructure(ps, 'child-with-active-overrides', 'mainPage');
                    expect(compStructure.modes.overrides.length).toEqual(1);
                    expect(compStructure.modes.overrides[0].layout.height).toEqual(1);
                    expect(compStructure.modes.overrides[0].layout.width).toEqual(2);
                    expect(compStructure.modes.overrides[0].layout.y).toEqual(3);
                    expect(compStructure.modes.overrides[0].layout.x).toEqual(4);
                    expect(getCompLayoutProp(ps, 'child', 'mainPage', 'height')).toBe(1);
                    expect(getCompLayoutProp(ps, 'child', 'mainPage', 'width')).toBe(2);
                    expect(getCompLayoutProp(ps, 'child', 'mainPage', 'y')).toBe(3);
                    expect(getCompLayoutProp(ps, 'child', 'mainPage', 'x')).toBe(4);
                });
            });

           describe('anchors with wrong parent (columns)', function () {

               beforeEach(function () {
                   openExperiments(['removeJsonAnchors']);
                   _.assign(defaultMeasureMap.height, {column1: 50, anchor1: 10});
               });

               function createCorruptedAnchor(anchorPosition) {
                   return {
                       componentType: 'wysiwyg.viewer.components.Column',
                       id: 'column1',
                       layout: _.assign(defaultLayout, {x: 100, y: 100, height: 50, width: 100}),
                       components: [{
                           componentType: 'wysiwyg.common.components.anchor.viewer.Anchor',
                           id: 'anchor1',
                           layout: _.assign(defaultLayout, {height: 10, width: 10}, anchorPosition)
                       }]
                   };
               }

               function getAnchorPosition(ps, pageId, viewMode) {
                   var comp = getCompPointer(ps, 'anchor1', pageId, viewMode);
                   var layoutPointer = ps.pointers.getInnerPointer(comp, ['layout']);
                   return _.pick(ps.dal.get(layoutPointer), ['x', 'y']);
               }

               function getChildrenList(ps, containerId, pageId, childrenProperty, viewMode) {
                   var containerPointer = getCompPointer(ps, containerId, pageId, viewMode);
                   var childrenPointer = ps.pointers.getInnerPointer(containerPointer, [childrenProperty]);
                   return _.map(ps.dal.get(childrenPointer), 'id');
               }

               it('should do nothing if the page contains old anchors', function () {
                   defaultPagesData.mainPage.structure.components.push(createCorruptedAnchor({x: 10, y: 20}));
                   var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                   postUpdateOperations.runPostUpdateOperations(ps);

                   expect(_.includes(getChildrenList(ps, 'column1', 'mainPage', 'components'), 'anchor1')).toBe(true);
                   expect(getAnchorPosition(ps, 'mainPage')).toEqual({x: 10, y: 20});
                   expect(_.includes(getChildrenList(ps, 'mainPage', 'mainPage', 'components'), 'anchor1')).toBe(false);
               });

               it('should reparent anchors from columns to page components', function () {
                   delete defaultPagesData.mainPage.structure.layout.anchors;
                   defaultPagesData.mainPage.structure.components.push(createCorruptedAnchor({x: 10, y: 20}));
                   var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                   postUpdateOperations.runPostUpdateOperations(ps);

                   expect(_.includes(getChildrenList(ps, 'column1', 'mainPage', 'components'), 'anchor1')).toBe(false);
                   expect(getAnchorPosition(ps, 'mainPage')).toEqual({x: 10, y: 40});
                   expect(_.includes(getChildrenList(ps, 'mainPage', 'mainPage', 'components'), 'anchor1')).toBe(true);
               });

               it('should reparent anchors from columns to master page children', function () {
                   delete defaultPagesData.mainPage.structure.layout.anchors;
                   defaultPagesData.masterPage.structure.children[1].components = [createCorruptedAnchor({
                       x: 10,
                       y: 20
                   })];
                   var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                   postUpdateOperations.runPostUpdateOperations(ps);

                   expect(_.includes(getChildrenList(ps, 'column1', 'masterPage', 'components'), 'anchor1')).toBe(false);
                   expect(getAnchorPosition(ps, 'masterPage')).toEqual({x: 10, y: 140});
                   expect(_.includes(getChildrenList(ps, 'masterPage', 'masterPage', 'children'), 'anchor1')).toBe(true);
               });

               it('should reparent anchors from columns to page mobile component', function () {
                   delete defaultPagesData.mainPage.structure.layout.anchors;
                   defaultPagesData.mainPage.structure.mobileComponents.push(createCorruptedAnchor({x: 10, y: 20}));
                   var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);
                   spyOn(ps.siteAPI, 'isMobileView').and.returnValue(true);

                   postUpdateOperations.runPostUpdateOperations(ps);

                   expect(_.includes(getChildrenList(ps, 'column1', 'mainPage', 'components', constants.VIEW_MODES.MOBILE), 'anchor1')).toBe(false);
                   expect(getAnchorPosition(ps, 'mainPage', constants.VIEW_MODES.MOBILE)).toEqual({x: 10, y: 40});
                   expect(_.includes(getChildrenList(ps, 'mainPage', 'mainPage', 'mobileComponents', constants.VIEW_MODES.MOBILE), 'anchor1')).toBe(true);
               });
           });

            describe('removing json anchors', function () {
                beforeEach(function () {
                    openExperiments(['viewerGeneratedAnchors', 'removeJsonAnchors']);
                });

                it('should remove anchors from components in a page that is processed for the first time', function () {
                    defaultPagesData.mainPage.structure.components.push({
                        componentType: 'someComp',
                        id: 'comp1',
                        layout: _.assign(defaultLayout, {
                            anchors: [{
                                type: 'BOTTOM_PARENT'
                            }]
                        })
                    });
                    defaultPagesData.mainPage.structure.components.push({
                        componentType: 'someComp',
                        id: 'comp2',
                        layout: defaultLayout
                    });
                    defaultPagesData.masterPage.structure.children.push({
                        componentType: 'someComp',
                        id: 'comp3',
                        layout: _.assign(defaultLayout, {
                            anchors: [{
                                type: 'BOTTOM_TOP'
                            }]
                        })
                    });
                    _.assign(defaultMeasureMap.height, {
                        comp1: 1,
                        comp2: 1,
                        comp3: 1
                    });

                    var reLayoutedCompsMap = {
                        comp1: true,
                        comp2: true,
                        comp3: true
                    };

                    var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap, reLayoutedCompsMap);

                    postUpdateOperations.runPostUpdateOperations(ps);

                    var comp1Anchors = getCompLayoutProp(ps, 'comp1', 'mainPage', 'anchors');
                    var comp2Anchors = getCompLayoutProp(ps, 'comp2', 'mainPage', 'anchors');
                    var comp3Anchors = getCompLayoutProp(ps, 'comp3', 'masterPage', 'anchors');

                    expect(comp1Anchors).not.toBeDefined();
                    expect(comp2Anchors).not.toBeDefined();
                    expect(comp3Anchors).not.toBeDefined();
                });

                it('should not remove anchors from components that were not rendered (like slides in boxSlideShow)', function () {
                    defaultPagesData.mainPage.structure.components.push({
                        componentType: 'someComp',
                        id: 'comp1',
                        layout: _.assign(defaultLayout, {
                            anchors: [{
                                type: 'BOTTOM_PARENT'
                            }]
                        })
                    });
                    defaultPagesData.mainPage.structure.components.push({
                        componentType: 'someComp',
                        id: 'comp2',
                        layout: defaultLayout
                    });
                    defaultPagesData.masterPage.structure.children.push({
                        componentType: 'someComp',
                        id: 'comp3',
                        layout: _.assign(defaultLayout, {
                            anchors: [{
                                type: 'BOTTOM_TOP'
                            }]
                        })
                    });
                    _.assign(defaultMeasureMap.height, {
                        comp2: 1,
                        comp3: 1
                    });

                    var reLayoutedCompsMap = {
                        comp2: true,
                        comp3: true
                    };

                    var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap, reLayoutedCompsMap);

                    postUpdateOperations.runPostUpdateOperations(ps);

                    var comp1Anchors = getCompLayoutProp(ps, 'comp1', 'mainPage', 'anchors');
                    var comp2Anchors = getCompLayoutProp(ps, 'comp2', 'mainPage', 'anchors');
                    var comp3Anchors = getCompLayoutProp(ps, 'comp3', 'masterPage', 'anchors');

                    expect(comp1Anchors).toBeDefined();
                    expect(comp2Anchors).not.toBeDefined();
                    expect(comp3Anchors).not.toBeDefined();
                });

                it('should create new anchors if some anchors were removed from json', function () {
                    defaultPagesData.mainPage.structure.components.push({
                        componentType: 'someComp',
                        id: 'comp1',
                        layout: defaultLayout
                    });
                    // defaultPagesData.mainPage.structure.components.push();
                    defaultPagesData.masterPage.structure.children.push({
                        componentType: 'someComp',
                        id: 'comp3',
                        layout: defaultLayout
                    });
                    _.assign(defaultMeasureMap.height, {
                        comp1: 1,
                        comp2: 1,
                        comp3: 1
                    });

                    var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                    var mainPagePointer = getCompPointer(ps, 'mainPage', 'mainPage');
                    var mainPageAnchorsPointer = ps.pointers.getInnerPointer(mainPagePointer, ['layout', 'anchors']);
                    ps.dal.full.remove(mainPageAnchorsPointer);
                    var mainPageChildrenPointer = ps.pointers.getInnerPointer(mainPagePointer, 'components');
                    ps.dal.push(mainPageChildrenPointer, {
                        componentType: 'someComp',
                        id: 'comp2',
                        layout: _.defaults({anchors: []}, defaultLayout)
                    });

                    postUpdateOperations.runPostUpdateOperations(ps);

                    var mainPageAnchorsMap = ps.siteAPI.getAnchorsMap('mainPage');

                    expect(mainPageAnchorsMap.comp2).toBeDefined();
                });

                it('should not create new anchors if all components in the page are already without anchors from previous renders', function () {
                    defaultPagesData.mainPage.structure.components.push({
                        componentType: 'someComp',
                        id: 'comp1',
                        layout: defaultLayout
                    });
                    // defaultPagesData.mainPage.structure.components.push();
                    defaultPagesData.masterPage.structure.children.push({
                        componentType: 'someComp',
                        id: 'comp3',
                        layout: defaultLayout
                    });
                    _.assign(defaultMeasureMap.height, {
                        comp1: 1,
                        comp2: 1,
                        comp3: 1
                    });

                    var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                    var mainPagePointer = getCompPointer(ps, 'mainPage', 'mainPage');
                    var mainPageAnchorsPointer = ps.pointers.getInnerPointer(mainPagePointer, ['layout', 'anchors']);
                    ps.dal.full.remove(mainPageAnchorsPointer);
                    var mainPageChildrenPointer = ps.pointers.getInnerPointer(mainPagePointer, 'components');
                    ps.dal.push(mainPageChildrenPointer, {
                        componentType: 'someComp',
                        id: 'comp2',
                        layout: defaultLayout
                    });

                    postUpdateOperations.runPostUpdateOperations(ps);

                    var mainPageAnchorsMap = ps.siteAPI.getAnchorsMap('mainPage');

                    expect(mainPageAnchorsMap.comp2).not.toBeDefined();
                });

                it('should remove json anchors for pages that already have viewer anchors', function () {
                    defaultPagesData.mainPage.structure.components.push({
                        componentType: 'someComp',
                        id: 'comp1',
                        layout: _.assign(defaultLayout, {
                            anchors: [{
                                type: 'BOTTOM_PARENT'
                            }]
                        })
                    });

                    _.assign(defaultMeasureMap.height, {
                        comp1: 1
                    });

                    var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                    postUpdateOperations.runPostUpdateOperations(ps);
                    var compPointer = getCompPointer(ps, 'comp1', 'mainPage');
                    var compAnchorsPointer = ps.pointers.getInnerPointer(compPointer, ['layout', 'anchors']);
                    ps.dal.full.set(compAnchorsPointer, {type: 'BOTTOM_TOP'});
                    postUpdateOperations.runPostUpdateOperations(ps);

                    var comp1Anchors = ps.dal.full.get(compAnchorsPointer);

                    expect(comp1Anchors).not.toBeDefined();
                });

                it('should remove anchors from the page itself', function () {
                    var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);
                    var pagePointer = ps.pointers.components.getPage('mainPage', constants.VIEW_MODES.DESKTOP);
                    var pageAnchorsPointer = ps.pointers.getInnerPointer(pagePointer, 'layout.anchors');
                    ps.dal.set(pageAnchorsPointer, []);

                    postUpdateOperations.runPostUpdateOperations(ps);

                    var pageAnchors = getCompLayoutProp(ps, 'mainPage', 'mainPage', 'anchors');
                    expect(pageAnchors).not.toBeDefined();
                });

                describe('when current page is a landing page', function () {
                    beforeEach(function () {
                        defaultPagesData.masterPage.structure.layout = {
                            y: 0,
                            anchors: []
                        };
                        this.header = _.find(defaultPagesData.masterPage.structure.children, {id: 'SITE_HEADER'});
                        this.pagesContainer = _.find(defaultPagesData.masterPage.structure.children, {id: 'PAGES_CONTAINER'});
                        this.header.layout.anchors = [{
                            targetComponent: 'PAGES_CONTAINER',
                            distance: 10,
                            type: 'BOTTOM_TOP'
                        }, {
                            targetComponent: 'someComp',
                            distance: 10,
                            type: 'BOTTOM_TOP'
                        }];
                        this.pagesContainer.layout.y = this.header.layout.y;
                        this.pagesContainer.layout.anchors = [];
                        defaultMeasureMap.top.PAGES_CONTAINER = this.pagesContainer.layout.y;
                    });

                    it('should update the anchor between header and pagesContainer according to bottom most comp above the pages container that has anchor to it', function () {
                        var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                        postUpdateOperations.runPostUpdateOperations(ps);

                        var headerAnchors = getCompLayoutProp(ps, 'SITE_HEADER', 'masterPage', 'anchors');
                        var masterPageAnchors = getCompLayoutProp(ps, 'masterPage', 'masterPage', 'anchors');
                        expect(headerAnchors).not.toBeDefined();
                        expect(masterPageAnchors.length).toEqual(1);
                        expect(masterPageAnchors[0].distance).toEqual(10);
                    });

                    it('should not fail if header and footer were not rendered', function () {
                        defaultMeasureMap.top.SITE_HEADER = undefined;
                        defaultMeasureMap.top.SITE_FOOTER = undefined;
                        defaultMeasureMap.height.SITE_HEADER = undefined;
                        defaultMeasureMap.height.SITE_FOOTER = undefined;

                        var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                        postUpdateOperations.runPostUpdateOperations(ps);

                        var headerAnchors = getCompLayoutProp(ps, 'SITE_HEADER', 'masterPage', 'anchors');
                        var masterPageAnchors = getCompLayoutProp(ps, 'masterPage', 'masterPage', 'anchors');
                        expect(headerAnchors).not.toBeDefined();
                        expect(masterPageAnchors.length).toEqual(1);
                        expect(masterPageAnchors[0].distance).toEqual(10);
                    });

                    it('should not update the anchor on masterPage if anchors were already removed from the masterPage components', function () {
                        defaultPagesData.masterPage.structure.layout = {
                            y: 0,
                            anchors: [{
                                targetComponent: 'PAGES_CONTAINER',
                                distance: 30,
                                locked: false,
                                type: 'BOTTOM_TOP'
                            }]
                        };
                        this.header.layout.anchors = undefined;
                        this.pagesContainer.layout.anchors = undefined;

                        var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                        postUpdateOperations.runPostUpdateOperations(ps);

                        var masterPageAnchors = getCompLayoutProp(ps, 'masterPage', 'masterPage', 'anchors');
                        expect(masterPageAnchors.length).toEqual(1);
                        expect(masterPageAnchors[0].distance).toEqual(30);
                    });
                });
                
                describe('when current page is not a landing page', function () {
                    var expectedDistance;
                    beforeEach(function () {
                        var header = _.find(defaultPagesData.masterPage.structure.children, {id: 'SITE_HEADER'});
                        var pagesContainer = _.find(defaultPagesData.masterPage.structure.children, {id: 'PAGES_CONTAINER'});
                        expectedDistance = 100;
                        header.layout.anchors = [{
                            targetComponent: 'PAGES_CONTAINER',
                            distance: expectedDistance * 2,
                            type: 'BOTTOM_TOP'
                        }, {
                            targetComponent: 'PAGES_CONTAINER',
                            distance: 20,
                            type: 'TOP_TOP'
                        }, {
                            targetComponent: 'someComp',
                            distance: 10,
                            type: 'BOTTOM_TOP'
                        }];
                        pagesContainer.layout.y = header.layout.y + header.layout.height + expectedDistance;
                        defaultMeasureMap.top.PAGES_CONTAINER = pagesContainer.layout.y;
                    });

                    it('should update/create a bottom_top anchor from header to pagesContainer, and add it to the masterPage layout', function () {
                        var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                        postUpdateOperations.runPostUpdateOperations(ps);

                        var headerAnchors = getCompLayoutProp(ps, 'SITE_HEADER', 'masterPage', 'anchors');
                        var masterPageAnchors = getCompLayoutProp(ps, 'masterPage', 'masterPage', 'anchors');
                        expect(headerAnchors).not.toBeDefined();
                        expect(masterPageAnchors.length).toEqual(1);
                        expect(masterPageAnchors[0]).toEqual({
                            targetComponent: 'PAGES_CONTAINER',
                            distance: expectedDistance,
                            type: 'BOTTOM_TOP'
                        });
                    });
                });

                describe('when in mobile', function () {
                    var ps;
                    beforeEach(function () {
                        defaultPagesData.mainPage.structure.mobileComponents.push({
                            componentType: 'someComp',
                            id: 'comp1',
                            layout: _.assign(defaultLayout, {
                                anchors: [{
                                    type: 'BOTTOM_PARENT'
                                }]
                            })
                        });
                        defaultPagesData.masterPage.structure.mobileComponents.push({
                            componentType: 'someComp',
                            id: 'comp2',
                            layout: _.assign(defaultLayout, {
                                anchors: [{
                                    type: 'BOTTOM_TOP'
                                }]
                            })
                        });
                        _.assign(defaultMeasureMap.height, {
                            comp1: 1,
                            comp2: 1
                        });

                        var reLayoutedCompsMap = {
                            comp1: true,
                            comp2: true
                        };
                        ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap, reLayoutedCompsMap);
                        spyOn(ps.siteAPI, 'isMobileView').and.returnValue(true);
                    });

                    it('should not remove anchors after the first mobile render of pages', function () {
                        postUpdateOperations.runPostUpdateOperations(ps);

                        var comp1Anchors = getCompLayoutProp(ps, 'comp1', 'mainPage', 'anchors', constants.VIEW_MODES.MOBILE);
                        var comp2Anchors = getCompLayoutProp(ps, 'comp2', 'masterPage', 'anchors', constants.VIEW_MODES.MOBILE);

                        expect(comp1Anchors).toBeDefined();
                        expect(comp2Anchors).toBeDefined();
                    });

                    it('should remove anchors only from pages that were rendered twice in mobile editor', function () {
                        postUpdateOperations.runPostUpdateOperations(ps);

                        ps.siteAPI.getAllRenderedRootIds.and.returnValue(['masterPage']);

                        postUpdateOperations.runPostUpdateOperations(ps);

                        var comp1Anchors = getCompLayoutProp(ps, 'comp1', 'mainPage', 'anchors', constants.VIEW_MODES.MOBILE);
                        var comp2Anchors = getCompLayoutProp(ps, 'comp2', 'masterPage', 'anchors', constants.VIEW_MODES.MOBILE);

                        expect(comp1Anchors).toBeDefined();
                        expect(comp2Anchors).not.toBeDefined();
                    });
                });
            });

            describe('when packing text', function () {
                var siblingId, textId;

                beforeEach(function () {
                    textId = 'textToPack';
                    siblingId = 'textSibling';
                    defaultPagesData.mainPage.structure.components.push({
                        componentType: 'wysiwyg.viewer.components.WRichText',
                        layout: {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 100,
                            anchors: []
                        },
                        type: "component",
                        components: [],
                        id: textId
                    }, {
                        componentType: 'wysiwyg.viewer.components.FiveGridLine',
                        layout: {
                            x: 0,
                            y: 0,
                            width: 10,
                            height: 10,
                            anchors: [{
                                type: 'BOTTOM_BOTTOM',
                                targetComponent: 'textToPack',
                                distance: 10,
                                locked: true
                            }, {
                                type: 'BOTTOM_BOTTOM',
                                targetComponent: 'otherComp',
                                distance: 20,
                                locked: false
                            }]
                        },
                        type: "component",
                        components: [],
                        id: siblingId
                    });
                    defaultMeasureMap.height[textId] = 100;
                    defaultMeasureMap.minHeight[textId] = 50;

                    this.ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                });

                it('should remove bottomBottom anchors to that text component', function () {
                    postUpdateOperations.runPostUpdateOperations(this.ps);

                    var textSiblingStructure = getCompFullStructure(this.ps, siblingId, 'mainPage');

                    expect(textSiblingStructure.layout.anchors.length).toEqual(1);
                    expect(textSiblingStructure.layout.anchors[0].targetComponent).not.toEqual(textId);
                });
            });

            describe('ignore bottom bottom anchors', function () {

                it('should mark rendered pages with ignoreBottomBottom flag in page data', function () {
                    var ps = getPrivateServicesAndSiteAPI(defaultPagesData, defaultMeasureMap);

                    postUpdateOperations.runPostUpdateOperations(ps);

                    var mainPageDataPointer = ps.pointers.data.getDataItemFromMaster('mainPage');
                    var masterPageDataPointer = ps.pointers.data.getDataItemFromMaster('masterPage');
                    var mainPageData = ps.dal.get(mainPageDataPointer);
                    var masterPageData = ps.dal.get(masterPageDataPointer);

                    expect(mainPageData.ignoreBottomBottomAnchors).toEqual(true);
                    expect(masterPageData.ignoreBottomBottomAnchors).toEqual(true);
                });
            });
        });
    });
