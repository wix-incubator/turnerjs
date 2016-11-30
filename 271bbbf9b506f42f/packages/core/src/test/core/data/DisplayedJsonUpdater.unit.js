define(['lodash', 'testUtils',
    'utils',
    'core/core/data/pointers/DataAccessPointers',
    'core/core/data/DisplayedJsonDal',
    'core/core/data/pointers/pointersCache',
    'core/core/data/DisplayedJsonUpdater'], function
    (_,
     testUtils,
     utils,
     DataAccessPointers,
     DisplayedJsonDal,
     PointersCache,
     DisplayedJsonUpdater) {
    'use strict';


    describe('DisplayedJsonUpdater', function () {
        var constants = utils.constants;
        var openExperiments = testUtils.experimentHelper.openExperiments;

        function getComponent(pointers, id, pageId, viewMode) {
            var mode = viewMode || constants.VIEW_MODES.DESKTOP;
            var pagePointer = pointers.components.getPage(pageId || 'page1', mode);
            return pointers.components.getComponent(id, pagePointer);
        }

        function createMockPageChildrenStructure(areModesAdded) {
            var containerStructure = {
                id: 'container-1',
                type: 'Container',
                componentType: 'Container',
                layout: {
                    x: 0,
                    y: 0,
                    width: 500,
                    height: 500
                },
                components: [{
                    id: 'child1',
                    type: 'component',
                    componentType: 'Component',
                    data: 'child1data',
                    layout: {}
                }, {
                    id: 'child2',
                    type: 'component',
                    componentType: 'Component',
                    data: 'child2data',
                    layout: {},
                    components: [{
                        id: 'child2child',
                        type: 'component',
                        data: 'foo-bar',
                        layout: {}
                    }]
                }]
            };
            if (areModesAdded) {
                containerStructure.components.push({
                    id: 'child3',
                    type: 'component',
                    componentType: 'Component',
                    data: 'child3data',
                    modes: {
                        isHiddenByModes: true,
                        overrides: [{
                            modeIds: ['modeX'],
                            isHiddenByModes: true
                        }]
                    }
                });
                containerStructure.components[0].modes = {
                    overrides: [{
                        modeIds: ['mode1'],
                        data: 'child1-override-data'
                    },
                        {
                            modeIds: ['modeRemove'],
                            isHiddenByModes: true
                        }]
                };
            }

            return containerStructure;
        }

        function initTest() {
            this.mockSiteData = testUtils.mockFactory.mockSiteData();
            var noModesPageStructure = createMockPageChildrenStructure(false);
            this.mockSiteData.addPageWithData('mainPage', {}, [noModesPageStructure]);
            this.mockSiteData.addData({
                'dataitem-1': 'value1'
            }, 'mainPage');

            this.fullJson = {pagesData: utils.objectUtils.cloneDeep(this.mockSiteData.pagesData)};
            this.fullJson.pagesData.mainPage.structure.components = [createMockPageChildrenStructure(true)];
            this.container1OnFullJson = this.fullJson.pagesData.mainPage.structure.components[0];

            var cache = new PointersCache(this.mockSiteData, this.mockSiteData, this.fullJson);

            this.fullPointersCache = cache.getBoundCacheInstance(true);
            var displayedPointersCache = cache.getBoundCacheInstance(false);
            this.pointers = new DataAccessPointers(cache);
            this.displayedJsonDAL = new DisplayedJsonDal(this.mockSiteData, displayedPointersCache);
            this.displayedJsonUpdater = new DisplayedJsonUpdater(this.fullJson, this.displayedJsonDAL, this.fullPointersCache, displayedPointersCache, this.pointers);
        }

        beforeEach(function () {
            initTest.call(this);
        });

        describe('onModesChange', function () {

            beforeEach(function () {
                this.pageId = 'mainPage';
                this.container1OnFullJson.someProp = 'blabla';
                this.containerPointer = getComponent(this.pointers.full, 'container-1', this.pageId);
            });

            describe('when there are NO active modes', function () {

                it('should sync it with the displayed json dal', function () {
                    var displayedContainer = this.displayedJsonDAL.get(this.containerPointer);
                    expect(displayedContainer).not.toEqual(this.container1OnFullJson);

                    this.displayedJsonUpdater.onModesChange(this.containerPointer, {});

                    displayedContainer = this.displayedJsonDAL.get(this.containerPointer);
                    var expectedContainer = createMockPageChildrenStructure(false);
                    expectedContainer.someProp = 'blabla';
                    expect(displayedContainer).toEqual(expectedContainer);
                });
            });

            describe('when there ARE active modes', function () {

                beforeEach(function () {
                    this.activeModes = {};
                    this.activeModes[this.pageId] = {'mode1': true};
                });

                it('should sync the component with the overrides that exist', function () {
                    var comp = this.displayedJsonDAL.get(this.containerPointer);
                    expect(comp).not.toEqual(this.container1OnFullJson);

                    this.displayedJsonUpdater.onModesChange(this.containerPointer, this.activeModes);

                    comp = this.displayedJsonDAL.get(this.containerPointer);
                    var expectedContainer = createMockPageChildrenStructure(false);
                    expectedContainer.someProp = 'blabla';
                    expectedContainer.components[0].data = 'child1-override-data';
                    expect(comp).toEqual(expectedContainer);
                });
            });
        });

        describe('onSet', function () {
            beforeEach(function(){
                openExperiments('viewerGeneratedAnchors', 'removeJsonAnchors');
            });

            function createPage(pageId, areModesAdded) {
                var containerWithChildren = createMockPageChildrenStructure(!!areModesAdded);
                var res = {
                    id: pageId,
                    data: {
                        design_data: {},
                        component_properties: {},
                        document_data: {}
                    },
                    structure: {
                        id: pageId,
                        componentType: 'Page',
                        layout: {}
                    }
                };

                if (pageId === 'masterPage'){
                    res.structure.children = [containerWithChildren];
                    res.structure.type = 'Document';
                } else {
                    res.structure.components = [containerWithChildren];
                    res.structure.mobileComponents = [containerWithChildren];
                }

                return res;
            }

            describe('when setting an entirely new page to the fullJSON', function () {
                describe('when there are NO active modes', function () {
                    it('should update the displayedJsonDal with the structure of the new page', function () {
                        var page2ToAdd = createPage('page2');
                        this.fullJson.pagesData.page2 = page2ToAdd;

                        var page2Pointer = this.pointers.page.getNewPagePointer('page2');
                        expect(page2Pointer).not.toBeNull();

                        this.displayedJsonUpdater.onSet(page2Pointer, {});

                        var expectedResult = utils.objectUtils.cloneDeep(page2ToAdd);
                        expect(this.displayedJsonDAL.get(page2Pointer)).toEqual(expectedResult);
                    });

                    it('should create dynamic anchors for the page if it has no components with json anchors', function(){
                        var page2ToAdd = createPage('page2');
                        this.fullJson.pagesData.page2 = page2ToAdd;

                        var page2Pointer = this.pointers.page.getNewPagePointer('page2');
                        expect(page2Pointer).not.toBeNull();

                        this.displayedJsonUpdater.onSet(page2Pointer);

                        expect(_.get(this.displayedJsonDAL, ['jsonData', 'anchorsMap', 'page2', constants.VIEW_MODES.DESKTOP])).toBeDefined();
                    });

                    it('should create dynamic anchors for masterPage if it has no components with json anchors ', function(){
                        var masterPageId = 'masterPage';
                        var pagePointer = this.pointers.page.getPagePointer(masterPageId);

                        this.displayedJsonUpdater.onSet(pagePointer);

                        expect(_.get(this.displayedJsonDAL, ['jsonData', 'anchorsMap', masterPageId, constants.VIEW_MODES.DESKTOP])).toBeDefined();
                    });

                    it('should not update mobile components if they already exist', function () {
                        var page2ToAdd = createPage('page2');
                        this.fullJson.pagesData.page2 = page2ToAdd;

                        var page2Pointer = this.pointers.page.getNewPagePointer('page2');
                        this.displayedJsonUpdater.onSet(page2Pointer, {});

                        this.fullJson.pagesData.page2.structure.mobileComponents = [{
                            id: 'newComp'
                        }];
                        this.displayedJsonUpdater.onSet(page2Pointer, {});

                        var displayedPage = this.displayedJsonDAL.get(page2Pointer);
                        expect(displayedPage.structure.mobileComponents).not.toEqual(this.fullJson.pagesData.page2.structure.mobileComponents);
                    });

                    describe('partialProperties', function () {
                        beforeEach(function () {
                            openExperiments('sv_hoverBox');
                        });

                        it('should update the displayedJsonDal with the structure of the new page', function () {
                            var page2ToAdd = createPage('page2');
                            this.fullJson.pagesData.page2 = page2ToAdd;
                            var page2Pointer = this.pointers.page.getNewPagePointer('page2');
                            expect(page2Pointer).not.toBeNull();

                            this.displayedJsonUpdater.onSet(page2Pointer);

                            var expectedResult = utils.objectUtils.cloneDeep(page2ToAdd);
                            expect(this.displayedJsonDAL.get(page2Pointer)).toEqual(expectedResult);
                        });
                    });
                });

                describe('when there are active modes', function () {
                    beforeEach(function () {
                        this.pageId = 'page2';
                        this.page2ToAdd = createPage('page2', true);
                        this.fullJson.pagesData.page2 = this.page2ToAdd;
                        this.page2Pointer = this.pointers.page.getNewPagePointer(this.pageId);
                        this.activeModes = {};
                        this.activeModes[this.pageId] = {'mode1': true};
                    });

                    it('should update the displayedJsonDal with the structure of the new page according to the modes', function () {
                        expect(this.page2Pointer).not.toBeNull();

                        this.displayedJsonUpdater.onSet(this.page2Pointer, this.activeModes);

                        var expectedPage2Structure = utils.objectUtils.cloneDeep(this.page2ToAdd).structure;
                        expectedPage2Structure.components[0].components[0] = {
                            id: 'child1',
                            type: 'component',
                            componentType: 'Component',
                            data: 'child1-override-data',
                            layout: {}
                        };
                        expectedPage2Structure.components[0].components.pop();
                        expect(this.displayedJsonDAL.get(this.page2Pointer).structure.components).toEqual(expectedPage2Structure.components);
                    });
                });
            });

            describe('when setting pagesData in its entirety to the full Json', function () {
                describe('when there are no active modes', function () {
                    it('should replace the entire pagesData for the displayed JSON', function () {
                        var pagesDataPointer = this.pointers.page.getAllPagesPointer();
                        var mockSiteData = testUtils.mockFactory.mockSiteData();
                        mockSiteData.addPageWithData('newMainPage', {}, [createMockPageChildrenStructure(true)]);

                        this.fullJson.pagesData = utils.objectUtils.cloneDeep(mockSiteData.pagesData);

                        this.displayedJsonUpdater.onSet(pagesDataPointer);

                        var expectedPagesData = utils.objectUtils.cloneDeep(this.fullJson.pagesData);
                        expectedPagesData.newMainPage.structure.components = [createMockPageChildrenStructure(false)];
                        var actual = this.displayedJsonDAL.get(pagesDataPointer);
                        expect(actual.newMainPage).toEqual(expectedPagesData.newMainPage);
                        expect(actual.masterPage).toEqual(expectedPagesData.masterPage);
                        expect(actual.currentPage).toEqual(expectedPagesData.currentPage);
                        expect(actual.mainPage).not.toBeDefined();
                    });

                    it('should create dynamic anchors for pages that are without json anchors', function () {
                        openExperiments('viewerGeneratedAnchors');
                        var pagesDataPointer = this.pointers.page.getAllPagesPointer();
                        var mockSiteData = testUtils.mockFactory.mockSiteData();
                        var compWithAnchors = createMockPageChildrenStructure();
                        compWithAnchors.id = 'childWithAnchors';
                        compWithAnchors.layout.anchors = [];
                        mockSiteData.setPageComponents([compWithAnchors], 'currentPage');
                        mockSiteData.addPageWithData('newMainPage', {}, [createMockPageChildrenStructure()]);

                        this.fullJson.pagesData = utils.objectUtils.cloneDeep(mockSiteData.pagesData);
                        this.displayedJsonUpdater.onSet(pagesDataPointer);

                        var updatedSiteData = this.displayedJsonDAL.jsonData;

                        expect(_.get(updatedSiteData, ['anchorsMap', 'currentPage', constants.VIEW_MODES.DESKTOP])).not.toBeDefined();
                        expect(_.get(updatedSiteData, ['anchorsMap', 'newMainPage', constants.VIEW_MODES.DESKTOP])).toBeDefined();
                        expect(_.get(updatedSiteData, ['anchorsMap', 'newMainPage', constants.VIEW_MODES.DESKTOP, 'container-1']).length).toEqual(1);
                    });

                    it('should update dynamic anchors for pages that still have json anchors, if dynamic anchors are already in use', function () {
                        openExperiments('viewerGeneratedAnchors');
                        var pagesDataPointer = this.pointers.page.getAllPagesPointer();
                        var mockSiteData = testUtils.mockFactory.mockSiteData();
                        var compWithAnchors = createMockPageChildrenStructure();
                        compWithAnchors.id = 'childWithAnchors';
                        compWithAnchors.layout.anchors = [];
                        mockSiteData.setPageComponents([compWithAnchors], 'currentPage');

                        _.set(this.displayedJsonDAL, ['jsonData', 'anchorsMap', 'currentPage', constants.VIEW_MODES.DESKTOP], {});
                        this.fullJson.pagesData = utils.objectUtils.cloneDeep(mockSiteData.pagesData);

                        this.displayedJsonUpdater.onSet(pagesDataPointer);

                        var updatedSiteData = this.displayedJsonDAL.jsonData;

                        expect(_.get(updatedSiteData, ['anchorsMap', 'currentPage', constants.VIEW_MODES.DESKTOP, 'childWithAnchors'])).toBeDefined();
                    });
                });
            });

            describe('when setting value out of pagesData', function () {
                beforeEach(function () {
                    this.userIdValue = {
                        'userId': 'someId'
                    };
                    this.userIdPointer = this.pointers.general.getUserId();
                    this.displayedJsonDAL.setByPath(['rendererModel', 'userId'], this.userIdValue.userId);
                });

                describe('when new value is in the full json', function () {
                    it('should throw a descriptive error for the illegal set operation to the updater', function () {
                        this.fullJson.rendererModel = this.userIdValue;

                        var illegalSetOperation = this.displayedJsonUpdater.onSet.bind(this.displayedJsonUpdater, this.userIdPointer);

                        expect(illegalSetOperation).toThrow(new Error('updates outside of pagesData should be done only through full json DAL'));
                    });
                });

                describe('when new value is not in the full json - only exists in siteData', function () {
                    it('should throw a descriptive error message of the illegal set operation', function () {
                        var illegalOperation = this.displayedJsonUpdater.onSet.bind(this.displayedJsonUpdater, this.userIdPointer);

                        expect(illegalOperation).toThrow(new Error('updates outside of pagesData should be done only through full json DAL'));
                    });
                });
            });

            describe('when setting a component', function () {
                describe('when there are NO active modes', function () {
                    describe('when component has children', function () {

                        beforeEach(function () {
                            this.containerPointer = getComponent(this.pointers.full, 'container-1', 'mainPage');
                            this.newContainer = {
                                id: 'container-1',
                                type: 'Container',
                                componentType: 'Container',
                                layout: {
                                    x: 20, y: 20,
                                    width: 200, height: 200
                                },
                                modes: {
                                    definitions: [{
                                        modeIds: ['modeA'],
                                        type: 'A'
                                    }],
                                    overrides: [{
                                        modeIds: ['modeX'],
                                        isHiddenByModes: true
                                    }]
                                },
                                components: [{
                                    id: 'c1',
                                    type: 'Component',
                                    componentType: 'Button',
                                    layout: {
                                        x: 30, y: 20,
                                        width: 30, height: 20
                                    },
                                    modes: {
                                        overrides: [{
                                            modeIds: ['modeB'],
                                            layout: {
                                                x: 33, y: 33, width: 30, height: 30
                                            }
                                        }]
                                    }
                                }]
                            };
                        });

                        it('should set only the displayed children on the regular mode, without overrides to the json', function () {
                            expect(this.displayedJsonDAL.get(this.containerPointer)).not.toEqual(this.newContainer);
                            this.fullJson.pagesData.mainPage.structure.components[0] = this.newContainer;

                            this.displayedJsonUpdater.onSet(this.containerPointer);

                            var expectedJson = {
                                "id": "container-1",
                                "type": "Container",
                                "componentType": "Container",
                                "layout": {
                                    "x": 20,
                                    "y": 20,
                                    "width": 200,
                                    "height": 200
                                },
                                "modes": {
                                    "definitions": [{
                                        "modeIds": ["modeA"],
                                        "type": "A"
                                    }]
                                },
                                "components": [{
                                    "id": "c1",
                                    "type": "Component",
                                    "componentType": "Button",
                                    "layout": {
                                        "x": 30,
                                        "y": 20,
                                        "width": 30,
                                        "height": 20
                                    }
                                }]
                            };
                            expect(this.displayedJsonDAL.get(this.containerPointer)).toEqual(expectedJson);
                        });

                        describe('partialProperties', function () {

                            beforeEach(function () {
                                openExperiments('sv_hoverBox');
                            });

                            describe('when data already exists on page', function () {
                                beforeEach(function () {
                                    this.page2 = createPage('page2');
                                    this.page2.structure.components[0].id = 'container-2';
                                    this.page2.data = {
                                        design_data: {
                                            designItem1: {'designKey1': 'designValue1'}
                                        },
                                        document_data: {
                                            dataItem1: {'dataKey1': 'dataValue1'}
                                        },
                                        component_properties: {
                                            propItem: {'prop1': 'propValue'}
                                        }
                                    };
                                    this.fullJson.pagesData.page2 = this.page2;

                                    this.displayedJsonUpdater.onSetByPath(['pagesData', 'page2'], {});
                                });
                            });
                        });
                    });

                    describe('when component has NO children', function () {

                        beforeEach(function () {
                            this.containerPointer = getComponent(this.pointers.full, 'container-1', 'mainPage');
                            this.newContainerWithoutChildren = {
                                id: 'container-1',
                                type: 'Container',
                                componentType: 'Container',
                                layout: {
                                    x: 20, y: 20,
                                    width: 200, height: 200
                                },
                                modes: {
                                    definitions: [{
                                        modeIds: ['modeA'],
                                        type: 'A'
                                    }],
                                    overrides: [{
                                        modeIds: ['modeX'],
                                        isHiddenByModes: true
                                    }]
                                }
                            };
                        });

                        it('should set the component on its regular mode, without overrides to the json', function () {
                            expect(this.displayedJsonDAL.get(this.containerPointer)).not.toEqual(this.newContainerWithoutChildren);
                            this.fullJson.pagesData.mainPage.structure.components[0] = this.newContainerWithoutChildren;

                            this.displayedJsonUpdater.onSet(this.containerPointer);

                            var expectedJson = {
                                "id": "container-1",
                                "type": "Container",
                                "componentType": "Container",
                                "layout": {
                                    "x": 20,
                                    "y": 20,
                                    "width": 200,
                                    "height": 200
                                },
                                "modes": {
                                    "definitions": [{
                                        "modeIds": ["modeA"],
                                        "type": "A"
                                    }]
                                }
                            };
                            expect(this.displayedJsonDAL.get(this.containerPointer)).toEqual(expectedJson);
                        });
                    });
                });

                describe('when there are active modes', function () {
                    describe('when component has children', function () {

                        beforeEach(function () {
                            this.pageId = 'mainPage';
                            this.activeModes = {};
                            this.containerPointer = getComponent(this.pointers.full, 'container-1', this.pageId);
                            this.newContainer = {
                                id: 'container-1',
                                type: 'Container',
                                componentType: 'Container',
                                layout: {
                                    x: 20, y: 20,
                                    width: 200, height: 200
                                },
                                modes: {
                                    definitions: [{
                                        modeIds: ['modeA'],
                                        type: 'A'
                                    }],
                                    overrides: [{
                                        modeIds: ['modeX'],
                                        isHiddenByModes: true
                                    }]
                                },
                                components: [{
                                    id: 'c1',
                                    type: 'Component',
                                    componentType: 'Button',
                                    layout: {
                                        x: 30, y: 20,
                                        width: 30, height: 20
                                    },
                                    modes: {
                                        overrides: [{
                                            modeIds: ['modeB'],
                                            isHiddenByModes: true,
                                            layout: {
                                                x: 33, y: 33, width: 30, height: 30
                                            }
                                        }]
                                    }
                                },
                                    {
                                        id: 'c2',
                                        type: 'Component',
                                        componentType: 'Button',
                                        layout: {
                                            x: 30, y: 20,
                                            width: 30, height: 20
                                        },
                                        modes: {
                                            overrides: [{
                                                modeIds: ['modeC'],
                                                layout: {
                                                    x: 33, y: 33, width: 30, height: 30
                                                }
                                            }]
                                        }
                                    }]
                            };
                        });

                        it('should set only the displayed children on the active mode, without overrides to the json', function () {
                            expect(this.displayedJsonDAL.get(this.containerPointer)).not.toEqual(this.newContainer);
                            this.fullJson.pagesData.mainPage.structure.components[0] = this.newContainer;

                            this.activeModes[this.pageId] = {modeB: true, modeC: false};
                            this.displayedJsonUpdater.onSet(this.containerPointer, this.activeModes);

                            var expectedJson = {
                                "id": "container-1",
                                "type": "Container",
                                "componentType": "Container",
                                "layout": {
                                    "x": 20,
                                    "y": 20,
                                    "width": 200,
                                    "height": 200
                                },
                                "modes": {
                                    "definitions": [{
                                        "modeIds": ["modeA"],
                                        "type": "A"
                                    }]
                                },
                                components: [{
                                    id: 'c2',
                                    type: 'Component',
                                    componentType: 'Button',
                                    layout: {
                                        x: 30, y: 20,
                                        width: 30, height: 20
                                    }
                                }]
                            };
                            expect(this.displayedJsonDAL.get(this.containerPointer)).toEqual(expectedJson);
                        });
                    });

                    describe('when component has NO children', function () {

                        beforeEach(function () {
                            this.pageId = 'mainPage';
                            this.activeModes = {};
                            this.containerPointer = getComponent(this.pointers.full, 'container-1', this.pageId);
                            this.newContainer = {
                                "id": "container-1",
                                "type": "Container",
                                "componentType": "Container",
                                "layout": {
                                    "x": 20,
                                    "y": 20,
                                    "width": 200,
                                    "height": 200
                                },
                                "propertyQuery": 'some-prop-query',
                                "modes": {
                                    "definitions": [{
                                        "modeIds": ["modeA"],
                                        "type": "A"
                                    }],
                                    overrides: [{
                                        modeIds: ['modeX'],
                                        layout: {x: 30, y: 30, width: 300, height: 300},
                                        propertyQuery: 'modeX-prop-query'
                                    }]
                                }
                            };
                        });

                        it('should set the displayed component on the active mode, without overrides to the json', function () {
                            expect(this.displayedJsonDAL.get(this.containerPointer)).not.toEqual(this.newContainer);
                            this.fullJson.pagesData.mainPage.structure.components[0] = this.newContainer;

                            this.activeModes[this.pageId] = {modeX: true, modeBlaBla: false};
                            this.displayedJsonUpdater.onSet(this.containerPointer, this.activeModes);

                            var expectedJson = {
                                "id": "container-1",
                                "type": "Container",
                                "componentType": "Container",
                                "layout": {
                                    "x": 30,
                                    "y": 30,
                                    "width": 300,
                                    "height": 300
                                },
                                "propertyQuery": 'modeX-prop-query',
                                "modes": {
                                    "definitions": [{
                                        "modeIds": ["modeA"],
                                        "type": "A"
                                    }]
                                }
                            };
                            expect(this.displayedJsonDAL.get(this.containerPointer)).toEqual(expectedJson);
                        });
                    });
                });
            });
        });

        describe('onPush', function () {
            describe('when component pointer is to the MasterPage structure', function () {

                beforeEach(function () {
                    this.pageId = 'masterPage';
                    this.masterPagePointer = this.pointers.components.getUnattached(this.pageId, 'DESKTOP');
                    this.masterPageStructurePointer = this.pointers.getInnerPointer(this.masterPagePointer, 'structure');
                    this.compToPush = {
                        id: 'comp-on-master',
                        type: 'boo',
                        layout: {x: 5},
                        modes: {
                            overrides: [{
                                modeIds: ['mode-master'],
                                layout: {x: 20}
                            }]
                        }
                    };
                });

                describe('when there are no active modes', function () {
                    beforeEach(function () {
                        this.activeModes = {};
                        this.activeModes.masterPageId = {'mode-master': false};
                    });

                    it('should set the master page structure, on regular mode, without overrides if exist', function () {
                        this.fullJson.pagesData.masterPage.structure.children.push(this.compToPush);

                        this.displayedJsonUpdater.onPush(this.masterPageStructurePointer, 3, this.compToPush, null, this.activeModes);

                        var masterPageStructure2WithoutOverrides = this.displayedJsonDAL.get(this.masterPagePointer);
                        expect(_.last(masterPageStructure2WithoutOverrides.children)).toEqual(_.omit(this.compToPush, 'modes'));
                    });
                });

                describe('when there are active modes', function () {

                    beforeEach(function () {
                        this.activeModes = {};
                        this.activeModes.masterPage = {'mode-master': true};
                    });

                    it('should set the master page structure, on regular mode, without overrides if exist', function () {
                        this.fullJson.pagesData.masterPage.structure.children.push(this.compToPush);

                        this.displayedJsonUpdater.onPush(this.masterPageStructurePointer, 3, this.compToPush, null, this.activeModes);

                        var masterPageStructure2WithoutOverrides = this.displayedJsonDAL.get(this.masterPagePointer);
                        var compOnDisplayed = _.omit(this.compToPush, 'modes');
                        compOnDisplayed.layout.x = 20;
                        expect(_.last(masterPageStructure2WithoutOverrides.children)).toEqual(compOnDisplayed);
                    });
                });
            });

            describe('when the value is a component structure inside a container', function () {

                beforeEach(function () {
                    this.pageId = 'mainPage';
                });

                describe('when there are no activeModes', function () {
                    beforeEach(function () {
                        this.middleChildStructure = {
                            id: 'middleChildId',
                            type: 'component',
                            componentType: 'SomeComponent',
                            data: 'Middle Child Data'
                        };

                        this.childShownOnlyInMode = {
                            id: 'child-for-mode-Id',
                            type: 'component',
                            componentType: 'SomeComponentType',
                            data: 'BIG-Data',
                            modes: {
                                isHiddenByModes: true,
                                overrides: [{
                                    modeIds: ['modeA'],
                                    isHiddenByModes: false
                                }]
                            }
                        };
                    });

                    it('should add the component at the specified index also at the displayed json', function () {
                        var index = 1;
                        this.container1OnFullJson.components.splice(index, 0, this.middleChildStructure);

                        var pointerToContainer = getComponent(this.pointers.full, 'container-1', this.pageId);
                        var pointerToContainerChildren = this.pointers.getInnerPointer(pointerToContainer, 'components');

                        this.displayedJsonUpdater.onPush(pointerToContainerChildren, index, this.middleChildStructure);

                        expect(this.displayedJsonDAL.get(pointerToContainerChildren)[index]).toEqual(this.middleChildStructure);
                    });

                    it('should NOT add the component to the container if child is shown only in active mode (not in regular)', function () {
                        var pointerToContainer = getComponent(this.pointers.full, 'container-1', this.pageId);
                        var pointerToContainerChildren = this.pointers.getInnerPointer(pointerToContainer, 'components');
                        var index = 1;
                        var originalChildAtIndex = this.displayedJsonDAL.get(pointerToContainerChildren)[index];

                        this.container1OnFullJson.components.splice(index, 0, this.childShownOnlyInMode);
                        this.displayedJsonUpdater.onPush(pointerToContainerChildren, index, this.childShownOnlyInMode);

                        expect(this.displayedJsonDAL.get(pointerToContainerChildren)[index]).not.toEqual(this.childShownOnlyInMode);
                        expect(this.displayedJsonDAL.get(pointerToContainerChildren)[index]).toEqual(originalChildAtIndex);
                    });
                });

                describe('when there are activeModes', function () {

                    beforeEach(function () {
                        this.activeModes = {};
                        this.activeModes[this.pageId] = {'mode555': true};
                        this.middleChild = {
                            id: 'middleChildId',
                            type: 'component',
                            componentType: 'SomeComponent',
                            data: 'Middle Child Data',
                            modes: {
                                overrides: [{
                                    modeIds: ['mode555'],
                                    data: 'DATA_ON_MODE555'
                                }]
                            }
                        };
                    });

                    it('should add the component at the specified index also at the displayed json', function () {
                        var index = 1;
                        this.container1OnFullJson.components.splice(index, 0, this.middleChild);

                        var pointerToContainer = getComponent(this.pointers.full, 'container-1', this.pageId);
                        var pointerToContainerChildren = this.pointers.getInnerPointer(pointerToContainer, 'components');

                        this.displayedJsonUpdater.onPush(pointerToContainerChildren, index, this.middleChild, null, this.activeModes);

                        var updatedMiddleChild = _.omit(this.middleChild, 'modes');
                        updatedMiddleChild.data = 'DATA_ON_MODE555';
                        expect(this.displayedJsonDAL.get(pointerToContainerChildren)[index]).toEqual(updatedMiddleChild);
                    });
                });
            });

            describe('when the value added is a data item', function () {

                describe('when the value is a comp data item (document_data)', function () {

                    beforeEach(function () {
                        this.fullJson.pagesData.mainPage.data.document_data.newDataQuery = [{foo: 'bar'}];
                        this.dataPointer = this.pointers.data.getDataItem('newDataQuery', 'mainPage');
                        this.displayedJsonUpdater.onModesChange(this.dataPointer, {});
                    });

                    it('should add the data item to the page "data.document_data" path no matter what the active modes are', function () {
                        this.displayedJsonUpdater.onPush(this.dataPointer, 0, {first: 'first'}, null, {'mode1': true});

                        expect(this.displayedJsonDAL.get(this.dataPointer)).toEqual([{first: 'first'}, {foo: 'bar'}]);
                    });
                });

                describe('when the value is a comp property item (component_properties)', function () {
                    beforeEach(function () {
                        this.fullJson.pagesData.mainPage.data.component_properties.newPropsQuery = [{foo: 'bar-prop'}];
                        this.propsPointer = this.pointers.data.getPropertyItem('newPropsQuery', 'mainPage');
                        this.displayedJsonUpdater.onModesChange(this.propsPointer, {});
                    });

                    it('should add the Properties item to the page "data.component_properties" path no matter what the active modes are', function () {
                        this.displayedJsonUpdater.onPush(this.propsPointer, 0, {first: '1st'}, null, {'mode1': true});

                        expect(this.displayedJsonDAL.get(this.propsPointer)).toEqual([{first: '1st'}, {foo: 'bar-prop'}]);
                    });

                    it('should add the Properties item to the page "data.component_properties" path no matter what the active modes are', function () {
                        this.displayedJsonUpdater.onPush(this.propsPointer, 1, {second: '2nd'}, null, {'mode1': true});

                        expect(this.displayedJsonDAL.get(this.propsPointer)).toEqual([{foo: 'bar-prop'}, {second: '2nd'}]);
                    });
                });

                describe('when the value is a theme data item (theme_data)', function () {
                    beforeEach(function () {
                        this.fullJson.pagesData.mainPage.data.theme_data.newThemeQuery = [{foo: 'bar-theme'}];
                        this.themeDataItemPointer = this.pointers.data.getThemeItem('newThemeQuery', 'mainPage');
                        this.displayedJsonUpdater.onModesChange(this.themeDataItemPointer, {});
                    });

                    it('should add the Properties item to the page "data.component_properties" path no matter what the active modes are', function () {
                        this.displayedJsonUpdater.onPush(this.themeDataItemPointer, 0, {'bar': 'bur'}, null, {'mode1': true});

                        expect(this.displayedJsonDAL.get(this.themeDataItemPointer)).toEqual([{'bar': 'bur'}, {foo: 'bar-theme'}]);
                    });

                    it('should add the Properties item to the page "data.component_properties" path no matter what the active modes are', function () {
                        this.displayedJsonUpdater.onPush(this.themeDataItemPointer, 1, {'Kami': 'Kaza'}, null, {'mode2': true});

                        expect(this.displayedJsonDAL.get(this.themeDataItemPointer)).toEqual([{foo: 'bar-theme'}, {'Kami': 'Kaza'}]);
                    });
                });
            });
        });

        describe('onRemove', function () {

            beforeEach(function () {
                this.pageId = 'mainPage';
            });

            describe('when removing a component in a container', function () {
                describe('when the pointer is to a component', function () {
                    it('should remove the component from the DAL', function () {
                        var containerPointer = getComponent(this.pointers.full, 'container-1', this.pageId);
                        var child2Pointer = getComponent(this.pointers.full, 'child2', this.pageId);
                        expect(this.displayedJsonDAL.get(child2Pointer)).toBeDefined();
                        var numberOfChildrenInContainer = _.size(this.displayedJsonDAL.get(containerPointer).components);

                        this.displayedJsonUpdater.onRemove(child2Pointer);

                        expect(this.displayedJsonDAL.get(child2Pointer)).not.toBeDefined();
                        expect(_.size(this.displayedJsonDAL.get(containerPointer).components)).toBe(numberOfChildrenInContainer - 1);
                    });
                });

                describe('when the pointer is to a component internal', function () {

                    beforeEach(function () {
                        this.activeModes = {};
                        this.activeModes[this.pageId] = {'mode1': true};
                    });

                    it('should sync the component according to the activeModes', function () {
                        var child1Pointer = getComponent(this.pointers.full, 'child1', this.pageId);
                        var child1ModesPointer = this.pointers.getInnerPointer(child1Pointer, 'modes');

                        this.displayedJsonUpdater.onModesChange(child1Pointer, this.activeModes);
                        expect(this.displayedJsonDAL.get(child1Pointer).data).toEqual('child1-override-data');

                        this.container1OnFullJson.components[0] = _.omit(this.container1OnFullJson.components[0], 'modes');

                        this.displayedJsonUpdater.onRemove(child1ModesPointer);

                        expect(this.displayedJsonDAL.get(child1Pointer)).toBeDefined();
                        expect(this.displayedJsonDAL.get(child1Pointer)).toEqual({
                            id: 'child1',
                            type: 'component',
                            componentType: 'Component',
                            data: 'child1data',
                            layout: {}
                        });
                    });
                });
            });

            describe('when removing a page', function () {

                it('should remove it from the displayedJsonDAL', function () {
                    var mainPagePointer = this.pointers.full.components.getPage('mainPage', 'DESKTOP');
                    expect(this.displayedJsonDAL.get(mainPagePointer)).toBeDefined();

                    this.displayedJsonUpdater.onRemove(mainPagePointer);

                    expect(this.displayedJsonDAL.get(mainPagePointer)).not.toBeDefined();
                });

                it('should remove the page from the displayed pagesData', function () {
                    var pageName = 'mainPage';
                    var pagePointer = this.pointers.page.getPagePointer(pageName);
                    expect(this.displayedJsonDAL.get(pagePointer)).toBeDefined();

                    this.displayedJsonUpdater.onRemove(pagePointer);

                    var generalAllPagesPointer = this.pointers.page.getAllPagesPointer();
                    expect(this.displayedJsonDAL.get(generalAllPagesPointer)[pageName]).not.toBeDefined();
                });
            });

            describe('when removing a non component value', function () {
                beforeEach(function () {
                    var dataValue = {foo: 'bar-to-be-removed!'};
                    this.fullJson.pagesData.mainPage.data.document_data.newDataQuery = dataValue;
                    this.dataPointer = this.pointers.data.getDataItem('newDataQuery', 'mainPage');
                    this.displayedJsonUpdater.onSet(this.dataPointer);
                });

                it('should remove it from the displayedJsonDAL', function () {
                    expect(this.displayedJsonDAL.get(this.dataPointer)).toEqual({foo: 'bar-to-be-removed!'});

                    this.displayedJsonUpdater.onRemove(this.dataPointer);

                    expect(this.displayedJsonDAL.get(this.dataPointer)).not.toBeDefined();
                });
            });

            describe('when removed value is out of pagesData', function () {
                beforeEach(function () {
                    this.userIdValue = {
                        'userId': 'someId'
                    };
                    this.userIdPointer = this.pointers.general.getUserId();
                    this.displayedJsonDAL.set(this.userIdPointer, this.userIdValue);
                });

                describe('when the path to remove is in the full json', function () {
                    it('should throw a descriptive error message', function () {
                        this.fullJson.rendererModel = this.userIdValue;

                        var illegalOperation = this.displayedJsonUpdater.onRemove.bind(this.displayedJsonUpdater, this.userIdPointer);

                        expect(illegalOperation).toThrow(new Error('updates outside of pagesData should be done only through full json DAL'));
                    });
                });

                describe('when the path to remove is not in json pagesData', function () {
                    it('should throw a descriptive error message', function () {
                        var illegalOperation = this.displayedJsonUpdater.onRemove.bind(this.displayedJsonUpdater, this.userIdPointer);

                        expect(illegalOperation).toThrow(new Error('updates outside of pagesData should be done only through full json DAL'));
                    });
                });
            });
        });

        describe('onMerge', function () {
            describe('when merging value to a component or component part', function () {
                beforeEach(function () {
                    this.pageId = 'mainPage';
                });

                describe('when there are no active modes', function () {

                    beforeEach(function () {
                        this.valueToMerge = {kuku: 'merged', layout: {x: 10, z: 50}};
                        _.merge(this.container1OnFullJson, this.valueToMerge);
                    });

                    it('should set the result to the displayed dal as the original value + merged value, which is in the full json', function () {
                        var containerPointer = getComponent(this.pointers.full, 'container-1', this.pageId);
                        var expectedResult = createMockPageChildrenStructure(false);
                        expectedResult.kuku = 'merged';
                        expectedResult.layout.x = 10;
                        expectedResult.layout.z = 50;

                        this.displayedJsonUpdater.onMerge(containerPointer);

                        expect(this.displayedJsonDAL.get(containerPointer)).toEqual(expectedResult);
                    });

                    it('should merge inner values if given inner pointer', function () {
                        var containerPointer = getComponent(this.pointers.full, 'container-1', this.pageId);
                        var layoutPointer = this.pointers.getInnerPointer(containerPointer, 'layout');
                        var layoutBeforeMerge = this.displayedJsonDAL.get(layoutPointer);

                        this.displayedJsonUpdater.onMerge(layoutPointer);

                        var layoutAfterMerge = this.displayedJsonDAL.get(layoutPointer);

                        expect(layoutBeforeMerge.z).not.toBeDefined();
                        expect(layoutAfterMerge.z).toEqual(this.valueToMerge.layout.z);
                    });
                });

                describe('when there are active modes', function () {

                    beforeEach(function () {
                        this.activeModes = {};
                        this.activeModes[this.pageId] = {'moody': true};
                        this.valueToMerge = {
                            kuku: 'merged',
                            layout: {x: 10},
                            modes: {
                                overrides: [{
                                    modeIds: ['moody'],
                                    layout: {
                                        x: 20,
                                        y: 30
                                    }
                                }]
                            }
                        };
                        _.merge(this.container1OnFullJson, this.valueToMerge);
                    });

                    it('should set the result to the displayed dal as the original value + merged value + modes overrides as specified in the full json', function () {
                        var containerPointer = getComponent(this.pointers.full, 'container-1', this.pageId);

                        var expectedResult = createMockPageChildrenStructure(false);
                        expectedResult.kuku = 'merged';
                        expectedResult.layout = this.container1OnFullJson.modes.overrides[0].layout;

                        this.displayedJsonUpdater.onMerge(containerPointer, this.activeModes);

                        expect(this.displayedJsonDAL.get(containerPointer)).toEqual(expectedResult);
                    });
                });
            });

            describe('when merging value to a dataItem on a page', function () {

                beforeEach(function () {
                    this.fullJson.pagesData.mainPage.data.document_data.newDataQuery = {foo: 'bar'};
                    this.dataPointer = this.pointers.data.getDataItem('newDataQuery', 'mainPage');
                    this.displayedJsonUpdater.onModesChange(this.dataPointer, {});
                    this.valueToMerge = {koo: 'moo'};
                    _.merge(this.fullJson.pagesData.mainPage.data.document_data.newDataQuery, this.valueToMerge);
                });

                it('should get the full json node to the displayed Json', function () {
                    expect(this.displayedJsonDAL.get(this.dataPointer)).toEqual({foo: 'bar'});

                    this.displayedJsonUpdater.onMerge(this.dataPointer, {mode1: true});

                    expect(this.displayedJsonDAL.get(this.dataPointer)).toEqual({foo: 'bar', koo: 'moo'});
                });
            });
        });

        describe('onSetByPath', function () {
            describe('when path is invalid', function () {
                beforeEach(function () {
                    this.invalidPathError = new Error('updates outside of pagesData should be done only through full json DAL');

                    this.wrappedSetByPath = function () {
                        return function () {
                            return this.displayedJsonUpdater.onSetByPath.apply(this.displayedJsonUpdater, arguments);
                        }.bind(this);
                    };
                });

                it('should throw an exception when path is null', function () {
                    expect(this.wrappedSetByPath(null, 'value', {})).toThrow(this.invalidPathError);
                });

                it('should throw an exception when path is a string', function () {
                    expect(this.wrappedSetByPath('path', 'value')).toThrow(this.invalidPathError);
                });

                it('should throw an exception when path is a number', function () {
                    expect(this.wrappedSetByPath(10, 'value')).toThrow(this.invalidPathError);
                });

                it('should throw an exception when path is an object', function () {
                    expect(this.wrappedSetByPath({key: 'value'}, 'valueToSet')).toThrow(this.invalidPathError);
                });
            });

            describe('when path points to pagesData', function () {

                beforeEach(function () {
                    this.pagesDataPath = ['pagesData'];
                });

                describe('when there are no active modes', function () {
                    describe('when active modes are passed as undefined', function () {
                        it('should create the displayed JSON without overrides', function () {
                            var currentDisplayedPagesData = _.cloneDeep(this.mockSiteData.pagesData);

                            this.displayedJsonUpdater.onSetByPath(this.pagesDataPath);

                            var displayedPagesDataWithChild1 = this.displayedJsonDAL.getByPath(this.pagesDataPath);
                            expect(displayedPagesDataWithChild1).toEqual(currentDisplayedPagesData);
                        });
                    });

                    describe('when active modes are inactive in mode map', function () {
                        it('should create the displayed JSON without overrides', function () {
                            var currentDisplayedPagesData = _.cloneDeep(this.mockSiteData.pagesData);

                            this.displayedJsonUpdater.onSetByPath(this.pagesDataPath, {'modeRemove': false});

                            var displayedPagesDataWithChild1 = this.displayedJsonDAL.getByPath(this.pagesDataPath);
                            expect(displayedPagesDataWithChild1).toEqual(currentDisplayedPagesData);
                        });
                    });
                });

                describe('when there are active modes', function () {

                    beforeEach(function () {
                        this.pageId = 'mainPage';
                        this.activeModes = {};
                        this.activeModes[this.pageId] = {'modeRemove': true};
                    });

                    it('should create the displayedJSON with overrides hiding the first child in mainpage', function () {
                        this.containerPointer = getComponent(this.pointers.full, 'container-1', this.pageId);
                        var child1Structure = this.displayedJsonDAL.get(this.containerPointer).components[0];
                        var currentDisplayedPagesData = _.cloneDeep(this.mockSiteData.pagesData);

                        this.displayedJsonUpdater.onSetByPath(this.pagesDataPath, this.activeModes);

                        var displayedPagesDataWithoutChild1 = this.displayedJsonDAL.getByPath(this.pagesDataPath);
                        expect(displayedPagesDataWithoutChild1).not.toEqual(currentDisplayedPagesData);
                        var container1Children = this.displayedJsonDAL.get(this.containerPointer).components;
                        expect(_.first(container1Children)).not.toEqual(child1Structure);
                    });
                });
            });

            describe('when path points to path in pagesData', function () {

                describe('when path points to a page', function () {

                    beforeEach(function () {
                        this.pageToSetByPath = this.mockSiteData.getPageWithDefaults('mainPage', [{
                            id: 'comp33',
                            type: 'component',
                            componentType: 'Component',
                            layout: {
                                x: 33, y: 33
                            },
                            data: 'data33'
                        }]);
                    });

                    it('should sync the page from the fullJson pagesData', function () {
                        var pathToSet = 'pagesData.mainPage'.split('.');
                        var pagePointer = this.pointers.page.getPagePointer('mainPage');
                        var currentMainPage = _.cloneDeep(this.displayedJsonDAL.get(pagePointer));
                        expect(currentMainPage).toBeDefined();

                        this.fullJson.pagesData.mainPage = this.pageToSetByPath;
                        this.displayedJsonUpdater.onSetByPath(pathToSet, {'mode33': true});

                        expect(this.displayedJsonDAL.get(pagePointer)).not.toEqual(currentMainPage);
                        expect(this.displayedJsonDAL.get(pagePointer)).toEqual(this.pageToSetByPath);
                    });
                });

                describe('when the path points to an inner structure of a page', function () {

                    beforeEach(function () {
                        this.pageId = 'mainPage';
                        this.activeModes = {};
                        this.activeModes[this.pageId] = {'mode1': true};
                        this.container1OnFullJson.components[0].modes.overrides[0].data = 'child1-override-data-by-set-by-path';
                        this.child1Pointer = getComponent(this.pointers.full, 'child1', this.pageId);
                    });

                    it('should update the entire page according to the given ActiveModes', function () {
                        expect(this.child1Pointer).toBeDefined();
                        expect(this.displayedJsonDAL.get(this.child1Pointer)).toBeDefined();
                        expect(this.displayedJsonDAL.get(this.child1Pointer).data).toEqual('child1data');
                        var pathToChild1 = 'pagesData.mainPage.structure.components.0.components.0.modes.overrides.0.data';
                        pathToChild1 = pathToChild1.split('.');

                        this.displayedJsonUpdater.onSetByPath(pathToChild1, this.activeModes);

                        expect(this.displayedJsonDAL.get(this.child1Pointer).data).toEqual('child1-override-data-by-set-by-path');
                    });
                });

                describe('when the path points to the data', function () {

                    beforeEach(function () {
                        this.fullJson.pagesData.mainPage.data.document_data.newDataQuery = {foo: 'beer'};
                    });

                    it('should set the value to the displayed JSON as appears in the full JSON', function () {
                        var dataItemPath = 'pagesData.mainPage.data.document_data.newDataQuery'.split('.');
                        expect(this.displayedJsonDAL.getByPath(dataItemPath)).not.toBeDefined();

                        this.displayedJsonUpdater.onSetByPath(dataItemPath, {'kukuMode': true});

                        expect(this.displayedJsonDAL.getByPath(dataItemPath)).toEqual({foo: 'beer'});
                    });
                });
            });

            describe('when path does not point to path in pagesData', function () {
                it('should throw a descriptive error for the illegal setByPath operation to the updater', function () {
                    var someRandomData = {abcd: 1234, kiki: {vivi: ['hello', 'goodbye']}};
                    var nonPagesDataPath = 'runtime.mainPage.layout'.split('.');
                    _.set(this.fullJson, nonPagesDataPath, someRandomData);

                    var illegalSetOperation = this.displayedJsonUpdater.onSetByPath.bind(this.displayedJsonUpdater,
                        nonPagesDataPath, {'modeX': true});

                    expect(illegalSetOperation).toThrow(new Error('updates outside of pagesData should be done only through full json DAL'));
                });
            });
        });

        describe('onPushByPath', function () {
            describe('when pushing <value> at <index>', function () {
                describe('and <path> is inside pagesData/structure', function () {
                    it('should update the entire displayed page structure containing the path', function () {
                        var mockComp = {
                            id: 'mockComp-onPushByPath',
                            foo: 'bar'
                        };
                        var pathToComps = 'pagesData.mainPage.structure.components.0.components'.split('.');
                        var compsToPushTo = _.get(this.fullJson, pathToComps);
                        var indexToPushTo = 0;
                        compsToPushTo.splice(indexToPushTo, 0, mockComp);
                        _.set(this.fullJson, pathToComps, compsToPushTo);
                        expect(this.displayedJsonDAL.getByPath(pathToComps.concat(indexToPushTo))).not.toEqual(mockComp);

                        this.displayedJsonUpdater.onPushByPath(pathToComps, indexToPushTo);

                        expect(this.displayedJsonDAL.getByPath(pathToComps.concat(indexToPushTo))).toEqual(mockComp);
                    });
                });
            });
        });

        describe('onRemoveByPath', function () {
            describe('when path points to path in pagesData', function () {
                describe('when path points to a page', function () {
                    it('should sync the pagesData on the displayedJson', function () {
                        var pagesDataPointer = this.pointers.page.getAllPagesPointer();
                        var pagePointer = this.pointers.full.components.getPage('mainPage', 'DESKTOP');
                        delete this.fullJson.pagesData.mainPage;
                        expect(this.fullJson.pagesData.mainPage).not.toBeDefined();
                        expect(this.displayedJsonDAL.get(pagePointer)).toBeDefined();
                        var numberOfPagesInDisplayed = _.size(this.displayedJsonDAL.get(pagesDataPointer));

                        var pathToMainPage = 'pagesData.mainPage'.split('.');
                        this.displayedJsonUpdater.onRemoveByPath(pathToMainPage);

                        expect(this.displayedJsonDAL.get(pagesDataPointer)).toBeDefined();
                        expect(_.size(this.displayedJsonDAL.get(pagesDataPointer))).toEqual(numberOfPagesInDisplayed - 1);
                        expect(this.displayedJsonDAL.get(pagesDataPointer).mainPage).not.toBeDefined();
                    });
                });

                describe('when path points to pagesData', function () {
                    it('should throw an exception', function () {
                        var pathToRemove = 'pagesData'.split('.');

                        var funcToThrow = this.displayedJsonUpdater.onRemoveByPath.bind(this.displayedJsonUpdater, pathToRemove);

                        expect(funcToThrow).toThrow();
                    });
                });

                describe('when the path is pointing to an inner structure of a page (which may not exist on displayedJson)', function () {
                    it('should synchronize the whole page structure from the start', function () {
                        var containerPointer = getComponent(this.pointers.full, 'container-1', 'mainPage');
                        var pathToContainer = this.fullPointersCache.getPath(containerPointer);
                        var pathToContainerParent = pathToContainer.slice(0, pathToContainer.length - 1);
                        var containerParentInFullJson = _.get(this.fullJson, pathToContainerParent);
                        containerParentInFullJson.splice(_.last(pathToContainer), 1);

                        expect(this.displayedJsonDAL.get(containerPointer)).toBeDefined();

                        this.displayedJsonUpdater.onRemoveByPath(pathToContainer, {mode1: true});

                        expect(this.displayedJsonDAL.get(containerPointer)).not.toBeDefined();
                    });
                });

                describe('when the path is pointing to the data of a page', function () {

                    beforeEach(function () {
                        this.fullJson.pagesData.mainPage.data.component_properties.propItemId = {propKey: 'propValue-to-remove'};
                        var pagesDataPointer = this.pointers.page.getAllPagesPointer();
                        this.displayedJsonUpdater.onModesChange(pagesDataPointer, {});
                    });

                    it('should remove it straight from the displayedJsonDAL as well', function () {
                        var propertiesItemPath = 'pagesData.mainPage.data.component_properties.propItemId'.split('.');
                        expect(this.displayedJsonDAL.getByPath(propertiesItemPath)).toEqual({propKey: 'propValue-to-remove'});

                        this.displayedJsonUpdater.onRemoveByPath(propertiesItemPath, {modeA: true});

                        expect(this.displayedJsonDAL.getByPath(propertiesItemPath)).not.toBeDefined();
                    });
                });
            });
        });
    });
});
