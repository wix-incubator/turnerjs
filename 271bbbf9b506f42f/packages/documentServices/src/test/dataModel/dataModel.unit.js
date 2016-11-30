define(['lodash', 'utils', 'testUtils',
        'documentServices/dataModel/dataModel',
        'documentServices/dataModel/DataSchemas.json',
        'documentServices/dataModel/PropertiesSchemas.json',
        'documentServices/dataModel/dataValidatorsHelper',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/dataModel/dataValidators',
        'documentServices/hooks/hooks',
        'documentServices/constants/constants'],
    function (_, utils,
              testUtils,
              dataModel,
              dataSchemas,
              propSchemas,
              dataValidatorsHelper,
              privateServicesHelper,
              dataValidators,
              hooks,
              constants) {

        'use strict';

        var originalDataSchemas, originalPropSchemas;

        function getCompPointer(ps, compId, pageId, viewMode) {
            viewMode = viewMode || constants.VIEW_MODES.DESKTOP;
            var pagePointer = ps.pointers.components.getPage(pageId, viewMode);
            return ps.pointers.components.getComponent(compId, pagePointer);
        }

        describe('Document Services - Data Model API', function () {

            var mockSchemas;

            beforeAll(function () {
                mockSchemas = {
                    data: {
                        EmptySchema: {},
                        ImageSchema: {
                            link: "ref",
                            uri: "string",
                            description: "string",
                            width: "number",
                            height: "number"
                        },
                        RefsSchema: {
                            type: 'object',
                            properties: {
                                someRef: {
                                    type: ['string'],
                                    pseudoType: ['ref']
                                },
                                someRefList: {
                                    type: ['null', 'array'],
                                    pseudoType: ['refList']
                                }
                            }
                        }
                    },
                    props: {
                        EmptySchema: {},
                        ImageSchema: {
                            type: 'object',
                            properties: {
                                description: {type: "string"},
                                width: {type: "number"},
                                height: {type: "number"}
                            }
                        },
                        RefsSchema: {
                            properties: {
                                someRef: {
                                    type: ['string', 'null'],
                                    pseudoType: ['ref']
                                },
                                someRefList: {
                                    type: ['null', 'array'],
                                    pseudoType: ['refList']
                                }
                            }
                        }
                    }
                };
                originalDataSchemas = _.clone(dataSchemas);
                originalPropSchemas = _.clone(propSchemas);
                if (!dataValidatorsHelper.validators.data._schemas.EmptySchema) {
                    _.forEach(mockSchemas.data, dataValidatorsHelper.validators.data.addSchema);
                    _.forEach(mockSchemas.props, dataValidatorsHelper.validators.props.addSchema);
                }
            });

            beforeEach(function () {
                dataSchemas = _.assign(dataSchemas, _.clone(mockSchemas.data));
                propSchemas = _.assign(propSchemas, _.clone(mockSchemas.props));
            });

            afterAll(function () {
                dataValidatorsHelper.reset();
                dataSchemas = _.clone(originalDataSchemas);
                propSchemas = _.clone(originalPropSchemas);
            });


            describe("data items creation", function () {
                var privateServices;
                beforeEach(function () {
                    var siteData = privateServicesHelper.getSiteDataWithPages(['mainPage']);
                    privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                });

                it("should ensure the component Data API module exists", function () {
                    expect(dataModel).toBeDefined();
                });

                it("should create a data item according to a given type", function () {
                    var mockComponentDataItem = dataModel.createDataItemByType(privateServices, null);
                    expect(mockComponentDataItem).toBeDefined();
                    expect(mockComponentDataItem).toBeNull();
                    mockComponentDataItem = dataModel.createDataItemByType(privateServices, "EmptySchema");
                    expect(mockComponentDataItem).toBeDefined();
                    expect(mockComponentDataItem).not.toBeNull();
                });

                it("should create a property (data) item according to a given type", function () {
                    var componentPropertyItem = dataModel.createPropertiesItemByType(privateServices, null);
                    expect(componentPropertyItem).toBeNull();
                    componentPropertyItem = dataModel.createPropertiesItemByType(privateServices, "EmptySchema");
                    expect(componentPropertyItem).not.toBeNull();
                    expect(_.isEqual(componentPropertyItem, {"type": "EmptySchema"})).toBeTruthy();
                });
            });

            describe("getDataItem", function () {
                it("should return null if no pointer passed", function () {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                    var compPointer = null;
                    var dataItem = dataModel.getDataItem(ps, compPointer);
                    expect(dataItem).toBeNull();
                });

                it("should return null if comp dosn't have a dataQuery", function () {
                    var siteData = privateServicesHelper.getSiteDataWithPages({'page1': {components: [{id: 'comp1'}]}});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(ps, 'comp1', 'page1');
                    var dataItem = dataModel.getDataItem(ps, compPointer);
                    expect(dataItem).toBeNull();
                });

                it("should get the component data item given a component pointer", function () {
                    var siteData = privateServicesHelper.getSiteDataWithPages({
                        'page1': {
                            components: [{id: 'comp1', dataQuery: '#mockDataItemID'}],
                            data: {mockDataItemID: {"id": "mockDataItemID", "type": "EmptySchema"}}
                        }
                    });

                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(ps, 'comp1', 'page1');
                    var dataItem = dataModel.getDataItem(ps, compPointer);
                    expect(dataItem).toBeDefined();
                    expect(dataItem).toEqual({"id": "mockDataItemID", "type": "EmptySchema"});
                });
            });

            describe('getDesignItem', function () {
                it('returns null if no pointer is passed', function () {
                    testUtils.experimentHelper.openExperiments('designData');
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                    var compPointer = null;
                    var designItem = dataModel.getDesignItem(ps, compPointer);
                    expect(designItem).toBeNull();
                });

                it('returns null if comp dosn\'t have a designQuery', function () {
                    testUtils.experimentHelper.openExperiments('designData');
                    var siteData = privateServicesHelper.getSiteDataWithPages({'page1': {components: [{id: 'comp1'}]}});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(ps, 'comp1', 'page1');
                    var designItem = dataModel.getDesignItem(ps, compPointer);
                    expect(designItem).toBeNull();
                });

                it('gets the component design item given a component pointer', function () {
                    testUtils.experimentHelper.openExperiments('designData');
                    var siteData = privateServicesHelper.getSiteDataWithPages({
                        'page1': {
                            components: [{id: 'comp1', designQuery: '#mockDesignItemID'}],
                            design: {mockDesignItemID: {'id': 'mockDesignItemID', 'type': 'MediaContainerDesignData'}}
                        }
                    });

                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(ps, 'comp1', 'page1');
                    var dataItem = dataModel.getDesignItem(ps, compPointer);
                    expect(dataItem).toBeDefined();
                    expect(dataItem).toEqual({'id': 'mockDesignItemID', 'type': 'MediaContainerDesignData'});
                });
            });

            describe('getDesignItemByModes', function () {
                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments('designData', 'sv_hoverBox');
                });

                it('returns null if no pointer is passed', function () {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                    var compPointer = null;
                    var designItem = dataModel.getDesignItemByModes(ps, compPointer, []);
                    expect(designItem).toBeNull();
                });

                it('returns null if comp dosn\'t have a designQuery', function () {
                    var siteData = privateServicesHelper.getSiteDataWithPages({'page1': {components: [{id: 'comp1'}]}});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(ps, 'comp1', 'page1');
                    var designItem = dataModel.getDesignItemByModes(ps, compPointer, []);
                    expect(designItem).toBeNull();
                });

                it('gets the component override design item given a component pointer and a mode with designQuery override', function () {
                    var overrideDesign = {
                        'id': 'mockDesignItemID2',
                        'type': 'MediaContainerDesignData',
                        'someProp': 'Bla'
                    };
                    var siteData = privateServicesHelper.getSiteDataWithPages({
                        'page1': {
                            components: [
                                {
                                    id: 'comp1', designQuery: '#mockDesignItemID',
                                    modes: {overrides: [{modeIds: ['mode1'], designQuery: '#mockDesignItemID2'}]}
                                }],
                            design: {
                                mockDesignItemID: {'id': 'mockDesignItemID', 'type': 'MediaContainerDesignData'},
                                mockDesignItemID2: overrideDesign
                            }
                        }
                    });

                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(ps, 'comp1', 'page1');
                    var dataItem = dataModel.getDesignItemByModes(ps, compPointer, ['mode1']);
                    expect(dataItem).toBeDefined();
                    expect(dataItem).toEqual(overrideDesign);
                });

                describe('gets the component regular design item', function () {
                    it('when given a mode with no override', function () {
                        var regularDesign = {'id': 'mockDesignItemID', 'type': 'MediaContainerDesignData'};
                        var siteData = privateServicesHelper.getSiteDataWithPages({
                            'page1': {
                                components: [{
                                    id: 'comp1', designQuery: '#mockDesignItemID',
                                    modes: {overrides: [{modeIds: ['NOTmode1'], designQuery: '#mockDesignItemID2'}]}
                                }],
                                design: {mockDesignItemID: regularDesign}
                            }
                        });

                        var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                        var compPointer = getCompPointer(ps, 'comp1', 'page1');
                        var dataItem = dataModel.getDesignItemByModes(ps, compPointer, ['mode1']);
                        expect(dataItem).toBeDefined();
                        expect(dataItem).toEqual(regularDesign);
                    });

                    it('when given a mode with override but no designQuery', function () {
                        var regularDesign = {'id': 'mockDesignItemID', 'type': 'MediaContainerDesignData'};
                        var siteData = privateServicesHelper.getSiteDataWithPages({
                            'page1': {
                                components: [{
                                    id: 'comp1', designQuery: '#mockDesignItemID',
                                    modes: {overrides: [{modeIds: ['mode1'], layout: {mockProp: true}}]}
                                }],
                                design: {mockDesignItemID: regularDesign}
                            }
                        });

                        var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                        var compPointer = getCompPointer(ps, 'comp1', 'page1');
                        var dataItem = dataModel.getDesignItemByModes(ps, compPointer, ['mode1']);
                        expect(dataItem).toBeDefined();
                        expect(dataItem).toEqual(regularDesign);
                    });

                    it('when given empty modes', function () {
                        var regularDesign = {'id': 'mockDesignItemID', 'type': 'MediaContainerDesignData'};
                        var siteData = privateServicesHelper.getSiteDataWithPages({
                            'page1': {
                                components: [{
                                    id: 'comp1', designQuery: '#mockDesignItemID',
                                    modes: {overrides: [{modeIds: ['NOTmode1'], designQuery: '#mockDesignItemID2'}]}
                                }],
                                design: {mockDesignItemID: regularDesign}
                            }
                        });

                        var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                        var compPointer = getCompPointer(ps, 'comp1', 'page1');
                        var dataItem = dataModel.getDesignItemByModes(ps, compPointer, []);
                        expect(dataItem).toBeDefined();
                        expect(dataItem).toEqual(regularDesign);
                    });
                });

            });

            describe("getDataItemById", function () {
                var privateServices;
                beforeEach(function () {
                    var dataItems = {
                        dataItemId: {
                            id: "dataItemId",
                            data: "wix data item",
                            type: "EmptySchema"
                        }
                    };
                    var siteData = privateServicesHelper.getSiteDataWithPages({'mainPage': {data: dataItems}});
                    privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                });

                it("should get a data item from the given page corresponding an ID", function () {
                    var dataItem;
                    dataItem = dataModel.getDataItemById(privateServices, null);
                    expect(dataItem).toBeNull();
                    dataItem = dataModel.getDataItemById(privateServices, "dataItemId", 'mainPage');
                    expect(dataItem).not.toBeNull();
                    expect(dataItem).toBeDefined();
                    expect(dataItem.data).toBe("wix data item");
                });
            });

            describe("properties", function () {
                it('should return null for a component with no properties', function () {
                    var siteData = privateServicesHelper.getSiteDataWithPages({
                        'mainPage': {
                            components: [{
                                id: 'containerId',
                                propertyQuery: 'invalid'
                            }]
                        }
                    });
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(ps, 'containerId', 'mainPage');
                    var result = dataModel.getPropertiesItem(ps, compPointer);
                    expect(result).toBeNull();
                });

                it("should get the available field names from a property item", function () {
                    var propertiesItem = null;
                    var fields = dataModel.getPropertiesItemFields(propertiesItem);
                    expect(fields).toEqual([]);

                    propertiesItem = {"description": "Hello description.", "width": 200};
                    fields = dataModel.getPropertiesItemFields(propertiesItem);
                    expect(_.includes(fields, "description")).toBe(true);
                    expect(_.includes(fields, "width")).toBe(true);
                    expect(fields.length).toBe(2);
                });

                it('should set the propertyQuery for the item without a #', function () {
                    //setup
                    var siteData = privateServicesHelper.getSiteDataWithPages({
                        'mainPage': {
                            components: [{
                                id: 'containerId',
                                propertyQuery: ''
                            }]
                        }
                    });
                    spyOn(dataValidators, 'validateDataBySchema').and.stub();
                    var mockPropertiesSchema = {"type": "EmptySchema"};
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var compPointer = getCompPointer(ps, 'containerId', 'mainPage');

                    dataModel.setPropertiesItem(ps, compPointer, mockPropertiesSchema, 'propertyId');
                    var compPropertyQueryPointer = ps.pointers.getInnerPointer(compPointer, 'propertyQuery');
                    var componentPropertyQuery = ps.dal.get(compPropertyQueryPointer);
                    expect(componentPropertyQuery).toBe('propertyId');
                });

                describe('updatePropertiesItem', function () {
                    beforeEach(function () {
                        this.siteData = testUtils.mockFactory.mockSiteData();
                        this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    });
                    describe("When component already has properties", function () {
                        it("should be able to set isHidden property value although it's not part of the component props schema", function () {
                            var buttonCompProps = testUtils.mockFactory.dataMocks.buttonProperties();
                            var buttonComp = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton', {props: buttonCompProps});
                            this.ps.dal.addPageWithDefaults('page1', [buttonComp]);
                            var pagePointer = this.ps.pointers.components.getPage('page1', 'DESKTOP');
                            var compPointer = this.ps.pointers.components.getComponent(buttonComp.id, pagePointer);

                            dataModel.updatePropertiesItem(this.ps, compPointer, {isHidden: true});

                            var result = dataModel.getPropertiesItem(this.ps, compPointer).isHidden;
                            expect(result).toEqual(true);
                        });
                    });

                    describe("When component doesn't have properties", function () {
                        it("should create new property item with the component propertyType schema (according to componentDefinitionMap)", function () {
                            var textComp = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.WRichText');
                            this.ps.dal.addPageWithDefaults('page1', [textComp]);
                            var pagePointer = this.ps.pointers.components.getPage('page1', 'DESKTOP');
                            var compPointer = this.ps.pointers.components.getComponent(textComp.id, pagePointer);

                            dataModel.updatePropertiesItem(this.ps, compPointer, {isHidden: true});

                            var result = dataModel.getPropertiesItem(this.ps, compPointer);
                            expect(result.isHidden).toEqual(true);
                            expect(result.type).toEqual('WRichTextProperties');
                        });

                        it("should create new item with 'DefaultProperties' schema if component doesn't have propertyType schema", function () {
                            var containerComp = testUtils.mockFactory.createStructure('mobile.core.components.Container');
                            this.ps.dal.addPageWithDefaults('page1', [containerComp]);
                            var pagePointer = this.ps.pointers.components.getPage('page1', 'DESKTOP');
                            var compPointer = this.ps.pointers.components.getComponent(containerComp.id, pagePointer);

                            dataModel.updatePropertiesItem(this.ps, compPointer, {isHidden: true});

                            var result = dataModel.getPropertiesItem(this.ps, compPointer);
                            expect(result.isHidden).toEqual(true);
                            expect(result.type).toEqual('DefaultProperties');
                        });
                    });
                });
            });

            describe('getPropertiesSchemaByType', function () {
                it("should return button properties schema", function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var expectedSchema = {
                        "properties": {
                            "align": {
                                "type": "string",
                                "enum": [
                                    "left",
                                    "center",
                                    "right"
                                ],
                                "default": "center",
                                "description": "alignment of the menu"
                            },
                            "margin": {
                                "type": "number",
                                "default": 0,
                                "description": "text left and right margins"
                            }
                        }
                    };

                    var actualSchema = dataModel.getPropertiesSchemaByType(ps, 'ButtonProperties');
                    expect(actualSchema).toEqual(expectedSchema);
                });
                it('should return default properties schema', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var expectedSchema = {
                        "type": "object",
                        "properties": {
                            "isHidden": {
                                "type": "boolean",
                                "description": "sets visibility:hidden to the component style node"
                            },
                            "isCollapsed": {
                                "type": "boolean",
                                "description": "sets isCollapsed for component"
                            }
                        }
                    };

                    var actualSchema = dataModel.getPropertiesSchemaByType(ps, 'DefaultProperties');
                    expect(actualSchema).toEqual(expectedSchema);
                });
            });

            describe("addDataItem", function () {
                var privateServices;
                beforeEach(function () {
                    var siteData = privateServicesHelper.getSiteDataWithPages(['mainPage']);
                    privateServices = privateServicesHelper.mockPrivateServices(siteData);
                });

                it("should add a new data item", function () {
                    var pageId = null;
                    var dataItem = null;
                    var result = dataModel.addDataItem(privateServices, dataItem, pageId);
                    expect(result).toBeNull();

                    pageId = "masterPage";
                    dataItem = {"key": "value", "type": "EmptySchema"};
                    spyOn(utils.guidUtils, 'getUniqueId').and.returnValue("dataItemId");
                    result = dataModel.addDataItem(privateServices, dataItem, pageId);
                    expect(result).toEqual("dataItemId");
                });
            });

            describe("updateDataItem", function () {

                beforeEach(function () {
                    var siteData = privateServicesHelper.getSiteDataWithPages({
                        'page1': {
                            components: [{id: 'comp1', dataQuery: '#comp1DataItem', componentType: 'Video'}],
                            data: {
                                comp1DataItem: {
                                    "id": "comp1DataItem",
                                    "type": "Video",
                                    "videoId": 'videoId',
                                    "videoType": 'vimeo',
                                    metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                                }
                            }
                        }
                    });
                    this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    this.compPointer = getCompPointer(this.ps, 'comp1', 'page1');
                });

                it("should update the component's data", function () {
                    var origDataItem = dataModel.getDataItem(this.ps, this.compPointer);
                    var updatedData = {
                        videoId: 'newVideoId'
                    };

                    dataModel.updateDataItem(this.ps, this.compPointer, updatedData);

                    var updatedDataItem = dataModel.getDataItem(this.ps, this.compPointer);

                    expect(updatedDataItem).toEqual(_.assign({}, origDataItem, updatedData));
                });

                it('should execute DATA.UPDATE_BEFORE hook with the updated data', function () {
                    var hookFn = jasmine.createSpy('Data.UPDATE_BEFORE hook');
                    hooks.registerHook(hooks.HOOKS.DATA.UPDATE_BEFORE, hookFn);

                    var updatedData = {
                        videoId: 'newVideoId'
                    };

                    dataModel.updateDataItem(this.ps, this.compPointer, updatedData);

                    expect(hookFn).toHaveBeenCalledWith(this.ps, this.compPointer, updatedData);
                });
            });

            describe('updateDesignItem', function () {
                beforeEach(function () {
                    var siteData = privateServicesHelper.getSiteDataWithPages({
                        'page1': {
                            components: [{
                                id: 'comp1',
                                designQuery: '#comp1DesignItem',
                                componentType: 'wysiwyg.viewer.components.Column',
                                modes: {
                                    definitions: [],
                                    overrides: [{
                                        modeIds: ['someMode'],
                                        designQuery: '#designItemInMode'
                                    }]
                                }
                            }],
                            mobileComponents: [{
                                id: 'comp1',
                                designQuery: '#mobile_design_comp1DesignItem',
                                componentType: 'wysiwyg.viewer.components.Column'
                            }],
                            design: {
                                comp1DesignItem: {
                                    "id": "comp1DesignItem",
                                    "someProp": 'someVal',
                                    type: 'MediaContainerDesignData',
                                    metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                                },
                                mobile_design_comp1DesignItem: {
                                    "id": "mobile_design_comp1DesignItem",
                                    "someProp": "someVal",
                                    type: 'MediaContainerDesignData',
                                    metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                                },
                                designItemInMode: {
                                    "id": "designItemInMode",
                                    "someProp": "someValInMode",
                                    type: 'MediaContainerDesignData',
                                    metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                                }
                            }
                        }
                    });
                    this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    this.compPointer = getCompPointer(this.ps, 'comp1', 'page1');
                });

                it('should link mobile component to the same design item as the desktop component', function () {
                    dataModel.updateDesignItem(this.ps, this.compPointer, {
                        "id": "comp1DesignItem",
                        "someProp": "newValue",
                        type: 'MediaContainerDesignData',
                        metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                    });

                    var mobileCompPointer = getCompPointer(this.ps, 'comp1', 'page1', constants.VIEW_MODES.MOBILE);
                    var mobileComp = this.ps.dal.get(mobileCompPointer);

                    expect(mobileComp.designQuery).toEqual('#comp1DesignItem');
                });

                it('should not change mobile component designQuery if it is used in one of the component possible mode overrides', function () {
                    var mobileCompPointer = getCompPointer(this.ps, 'comp1', 'page1', constants.VIEW_MODES.MOBILE);
                    var mobileDesignQueryPointer = this.ps.pointers.getInnerPointer(mobileCompPointer, 'designQuery');
                    this.ps.dal.set(mobileDesignQueryPointer, '#designItemInMode');

                    dataModel.updateDesignItem(this.ps, this.compPointer, {
                        "id": "comp1DesignItem",
                        "someProp": "newValue",
                        type: 'MediaContainerDesignData',
                        metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                    });

                    var mobileComp = this.ps.dal.get(mobileCompPointer);

                    expect(mobileComp.designQuery).toEqual('#designItemInMode');
                });
            });

            describe("updateDesignItemBehaviors", function () {

                beforeEach(function () {
                    var compDef = {id: 'comp1', designQuery: '#comp1DesignItem', componentType: 'HoverBox'};
                    var comp1DesignItem = {
                        "id": "comp1DesignItem",
                        "type": "BackgroundMedia",
                        "dataChangeBehaviors": [{
                            trigger: 'in',
                            "type": "animation",
                            "part": "media",
                            'name': 'Scale',
                            'params': {duration: 0.5, delay: 2}
                        }],
                        metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                    };

                    var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1', [compDef]).addDesign(comp1DesignItem, 'page1');
                    this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    this.compPointer = getCompPointer(this.ps, 'comp1', 'page1');

                    this.designPointer = dataModel.getDesignItemPointer(this.ps, this.compPointer);
                });

                it("should update the behaviors params to the new ones inside the design data of the component", function () {
                    var updatedBehaviors = [{
                        trigger: 'in',
                        "type": "animation",
                        "part": "media",
                        'name': 'Scale',
                        'params': {duration: 1, delay: 0}
                    }];

                    dataModel.updateDesignItemBehaviors(this.ps, this.compPointer, updatedBehaviors);

                    var updatedDataItem = dataModel.getDesignItem(this.ps, this.compPointer);

                    expect(updatedDataItem.dataChangeBehaviors).toEqual(updatedBehaviors);
                });

                it("should add the additional behaviors to the components design item", function () {
                    var updatedBehaviors = [{
                        trigger: 'in',
                        "type": "animation",
                        "part": "media",
                        'name': 'Scale',
                        'params': {duration: 0.5, delay: 2}
                    },
                        {
                            trigger: 'out',
                            "type": "animation",
                            "part": "media",
                            'name': 'Zoom',
                            'params': {duration: 0.5, delay: 2}
                        }];

                    dataModel.updateDesignItemBehaviors(this.ps, this.compPointer, updatedBehaviors);

                    var updatedDataItem = dataModel.getDesignItem(this.ps, this.compPointer);

                    expect(updatedDataItem.dataChangeBehaviors).toEqual(updatedBehaviors);
                });
            });

            describe("removeDesignItemBehaviors", function () {

                beforeEach(function () {
                    var compDef = {id: 'comp1', designQuery: '#comp1DesignItem', componentType: 'HoverBox'};
                    var comp1DesignItem = {
                        "id": "comp1DesignItem",
                        "type": "BackgroundMedia",
                        "dataChangeBehaviors": [{
                            trigger: 'in',
                            "type": "animation",
                            "part": "media",
                            'name': 'Scale',
                            'params': {duration: 0.5, delay: 2}
                        },
                            {
                                trigger: 'out',
                                "type": "animation",
                                "part": "media",
                                'name': 'Zoom',
                                'params': {duration: 0.5, delay: 2}
                            },
                            {
                                trigger: 'out',
                                "type": "animation",
                                "part": "media",
                                'name': 'Scale',
                                'params': {duration: 0.5, delay: 2}
                            }],
                        metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                    };

                    var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1', [compDef]).addDesign(comp1DesignItem, 'page1');

                    this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    this.compPointer = getCompPointer(this.ps, 'comp1', 'page1');

                    this.designPointer = dataModel.getDesignItemPointer(this.ps, this.compPointer);
                });

                it("should remove the specified behaviors", function () {
                    var behaviorsToRemove = [{
                        trigger: 'in',
                        "type": "animation",
                        "part": "media",
                        'name': 'Scale',
                        'params': {duration: 0.5, delay: 2}
                    },
                        {
                            trigger: 'out',
                            "type": "animation",
                            "part": "media",
                            'name': 'Scale',
                            'params': {duration: 0.5, delay: 2}
                        }];
                    var updatedBehaviors = [{
                        trigger: 'out',
                        "type": "animation",
                        "part": "media",
                        'name': 'Zoom',
                        'params': {duration: 0.5, delay: 2}
                    }];

                    dataModel.removeDesignItemBehaviors(this.ps, this.compPointer, behaviorsToRemove);

                    var updatedDataItem = dataModel.getDesignItem(this.ps, this.compPointer);
                    expect(updatedDataItem.dataChangeBehaviors).toEqual(updatedBehaviors);
                });
            });

            describe('updateBehaviorsItem', function () {
                beforeEach(function () {
                    this.pageId = 'newPageId';
                    this.siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(this.pageId);
                });

                it('should update (override) the existing behaviors data item in case component already has one', function () {
                    var originalBehaviorArray = [{
                        behavior: testUtils.mockFactory.behaviorMocks.animation('slideIn'),
                        action: testUtils.mockFactory.actionMocks.comp('click')
                    }];
                    var compStructure = testUtils.mockFactory.mockComponent('someCompType', this.siteData, this.pageId, {behaviors: JSON.stringify(originalBehaviorArray)});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);
                    var newBehaviorArray = [{}];
                    var newBehaviorsValue = JSON.stringify(newBehaviorArray);

                    dataModel.updateBehaviorsItem(ps, compPointer, newBehaviorsValue);

                    expect(dataModel.getBehaviorsItem(ps, compPointer)).toEqual(newBehaviorsValue);
                });

                it('should create a new behaviors item in case component does not have behaviors', function () {
                    var compStructure = testUtils.mockFactory.mockComponent('someCompType', this.siteData, this.pageId, {});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);
                    var newBehaviorArray = [{
                        behavior: testUtils.mockFactory.behaviorMocks.animation('slideIn'),
                        action: testUtils.mockFactory.actionMocks.comp('click')
                    }];
                    var newBehaviorsValue = JSON.stringify(newBehaviorArray);

                    dataModel.updateBehaviorsItem(ps, compPointer, newBehaviorsValue);

                    expect(dataModel.getBehaviorsItem(ps, compPointer)).toEqual(newBehaviorsValue);
                });
            });

            describe('getBehaviorsItem', function () {
                beforeEach(function () {
                    this.pageId = 'newPageId';
                    this.siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(this.pageId);
                });

                it('should return a strinified array of all component behaviors', function () {
                    var behaviorArray = [{
                        behavior: testUtils.mockFactory.behaviorMocks.animation('slideIn'),
                        action: testUtils.mockFactory.actionMocks.comp('click')
                    }];
                    var compStructure = testUtils.mockFactory.mockComponent('someCompType', this.siteData, this.pageId, {behaviors: JSON.stringify(behaviorArray)});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);
                    var expectedResult = JSON.stringify(behaviorArray);

                    var result = dataModel.getBehaviorsItem(ps, compPointer);

                    expect(result).toEqual(expectedResult);
                });

                it('should return undefined in case component does not have any behaviors', function () {//?
                    var compStructure = testUtils.mockFactory.mockComponent('someCompType', this.siteData, this.pageId, {});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);

                    var result = dataModel.getBehaviorsItem(ps, compPointer);

                    expect(result).toBeUndefined();
                });
            });

            describe("Link test", function () {
                var privateServices;
                beforeEach(function () {
                    var siteData = privateServicesHelper.getSiteDataWithPages(['mainPage']);
                    privateServices = privateServicesHelper.mockPrivateServices(siteData);
                });

                it("should be able to add an 'ExternalLink'", function () {
                    var linkId = dataModel.addLink(privateServices, 'ExternalLink');
                    expect(linkId).toBeDefined();

                    var linkId2 = dataModel.addLink(privateServices, 'ExternalLink', {url: "http://www.wix.com"});
                    expect(linkId2).toBeDefined();
                    expect(linkId).not.toEqual(linkId2);
                });

                it("should be able to add an 'PageLink'", function () {
                    var linkId = dataModel.addLink(privateServices, 'PageLink');
                    expect(linkId).toBeDefined();

                    var linkId2 = dataModel.addLink(privateServices, 'PageLink', {pageId: "#mainPage"});
                    expect(linkId2).toBeDefined();
                    expect(linkId).not.toEqual(linkId2);
                });

                it("should NOT be able to add a link of a NON existing type", function () {
                    var linkId = dataModel.addLink(privateServices, 'CrazyPageLink');
                    expect(linkId).toBeNull();

                    var linkId2 = dataModel.addLink(privateServices, 'CrazyPageLink', {pageId: "#mainPage"});
                    expect(linkId2).toBeNull();
                });
            });

            describe("data serialization", function () {
                var dataItems, ps;

                beforeEach(function () {
                    dataItems = {
                        main: {
                            type: 'RefsSchema',
                            id: 'main',
                            keyString: 'bla',
                            keyInt: 4,
                            someRef: '#hello',
                            someRefList: [
                                '#foo',
                                '#bar'
                            ],
                            nonRefWithHash: '#justTextWithHash'
                        },
                        hello: {
                            id: 'hello',
                            text: 'world'
                        },
                        foo: {
                            id: 'foo',
                            isAwesome: true
                        },
                        bar: {
                            id: 'bar',
                            isCool: false
                        }
                    };
                    var siteData = privateServicesHelper.getSiteDataWithPages({'page1': {data: dataItems}});
                    ps = privateServicesHelper.mockPrivateServices(siteData);
                });

                it('should serialize data item', function () {
                    var dataPointer = ps.pointers.data.getDataItem('main', 'page1');
                    var serializedDataItem = dataModel.serializeDataItem(ps, dataSchemas, dataPointer, false);
                    var expectedSerializedDataItem = {
                        type: 'RefsSchema',
                        id: 'main',
                        keyString: 'bla',
                        keyInt: 4,
                        someRef: {
                            text: 'world',
                            id: 'hello'
                        },
                        someRefList: [
                            {
                                isAwesome: true,
                                id: 'foo'
                            },
                            {
                                isCool: false,
                                id: 'bar'
                            }
                        ],
                        nonRefWithHash: '#justTextWithHash'
                    };
                    expect(serializedDataItem).toEqual(expectedSerializedDataItem);
                });

                it('should deserialize the data item', function () {
                    var updatedItem = {
                        type: 'RefsSchema',
                        keyString: 'bla',
                        keyInt: 4,
                        someRefList: [
                            {
                                id: 'foo',
                                newProp: 1,
                                type: 'EmptySchema'
                            },
                            {
                                id: 'bar',
                                newProp: 2,
                                type: 'EmptySchema'
                            }
                        ],
                        nonRefWithHash: 'somethingElse'
                    };

                    var changedDataItems = {};

                    spyOn(ps.dal, 'set').and.callFake(function (pointer, data) {
                        changedDataItems[pointer.id] = data;
                    });
                    var id = dataModel.addSerializedDataItemToPage(ps, 'page1', updatedItem, 'main');
                    expect(id).toEqual('main');
                    var expectedChangedDataItems = {
                        main: {
                            type: 'RefsSchema',
                            id: 'main',
                            keyString: 'bla',
                            keyInt: 4,
                            someRef: '#hello',
                            someRefList: [
                                '#foo',
                                '#bar'
                            ],
                            nonRefWithHash: 'somethingElse',
                            metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                        },
                        foo: {
                            id: 'foo',
                            isAwesome: true,
                            newProp: 1,
                            type: 'EmptySchema',
                            metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                        },
                        bar: {
                            id: 'bar',
                            isCool: false,
                            newProp: 2,
                            type: 'EmptySchema',
                            metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                        }
                    };
                    expect(changedDataItems).toEqual(expectedChangedDataItems);
                });

                it('Should replace data item when updated data is of different type', function () {
                    var changedDataItems = {};
                    spyOn(ps.dal, 'set').and.callFake(function (pointer, data) {
                        changedDataItems[pointer.id] = data;
                    });

                    var initialDataItem = {
                        type: 'RefsSchema',
                        keyString: 'bla',
                        keyInt: 4
                    };

                    var updatedDataItem = {
                        type: 'EmptySchema',
                        differentProp: 'arg'
                    };

                    var expectedChangedDataItems = {
                        main: {
                            type: 'EmptySchema',
                            id: 'main',
                            differentProp: 'arg',
                            metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                        }
                    };

                    dataModel.addSerializedDataItemToPage(ps, 'page1', initialDataItem, 'main');
                    dataModel.addSerializedDataItemToPage(ps, 'page1', updatedDataItem, 'main');

                    expect(changedDataItems).toEqual(expectedChangedDataItems);
                });

                it('isDataItemValid should perform shallow deserialization if the data item before validating it', function () {
                    var dataItem = {
                        type: 'RefsSchema',
                        keyString: 'bla',
                        keyInt: 4,
                        someRef: {
                            id: 'refush',
                            newProp: 0,
                            type: 'Other'
                        },
                        someRefList: [
                            {
                                id: 'foo',
                                newProp: 1,
                                type: 'EmptySchema'
                            },
                            {
                                id: 'bar',
                                newProp: 2,
                                type: 'EmptySchema'
                            }
                        ],
                        nonRefWithHash: 'somethingElse'
                    };

                    expect(dataModel.isDataItemValid(ps, dataItem, 'someRef', '#overriden-prop')).toEqual(true);
                });
            });

            describe("validation tests for setting data", function () {
                beforeEach(function () {
                    var siteData = privateServicesHelper.getSiteDataWithPages({
                        'page1': {
                            components: [{id: 'comp1'}, {id: 'withProps', propertyQuery: 'MyMockId-1'}],
                            props: {'MyMockId-1': {id: 'MyMockId-1'}}
                        }
                    });

                    this.ps = privateServicesHelper.mockPrivateServices(siteData);
                });

                it("should fail the validation of a NULL Data Item when setting it", function () {
                    var compPointer = getCompPointer(this.ps, 'comp1', 'page1');
                    var self = this;
                    expect(function () {
                        dataModel.updateDataItem(self.ps, compPointer, null);
                    }).toThrow();
                });

                describe("Properties Item ", function () {

                    it("should fail the validation of an invalid Properties Item when setting it", function () {
                        var propertiesItem = dataModel.createPropertiesItemByType(this.ps, "ImageSchema");
                        propertiesItem.width = "100%";
                        var self = this;
                        var compPointer = getCompPointer(this.ps, 'comp1', 'page1');
                        expect(function () {
                            dataModel.updatePropertiesItem(self.ps, compPointer, propertiesItem);
                        }).toThrow();
                    });

                    it("should update a properties item with corresponding valid types", function () {
                        var propertiesItem = dataModel.createPropertiesItemByType(this.ps, "ImageSchema");
                        propertiesItem.id = "MyMockId-1";
                        var compPointer = getCompPointer(this.ps, 'withProps', 'page1');
                        spyOn(this.ps.dal, 'set');

                        var updatedProperties = {
                            description: "some description",
                            width: 100,
                            height: 200,
                            type: 'ImageSchema',
                            metaData: {isPreset: false, schemaVersion: '1.0', isHidden: false}
                        };
                        dataModel.updatePropertiesItem(this.ps, compPointer, updatedProperties);

                        _.merge(propertiesItem, updatedProperties);

                        expect(this.ps.dal.set).toHaveBeenCalled();
                        var setArgs = this.ps.dal.set.calls.argsFor(0);
                        expect(setArgs[0].id).toBe('MyMockId-1');
                        expect(setArgs[1]).toEqual(propertiesItem);
                    });
                });
            });

            describe('removeDataItemRecursively', function () {

                var privateServices;

                beforeEach(function () {
                    var siteData = privateServicesHelper.getSiteDataWithPages({
                        mainPage: {
                            data: {
                                mockDataId: {
                                    type: 'RefsSchema',
                                    someRefList: ['#innerMockData1', '#innerMockData2'],
                                    someRef: '#innerMockData3'
                                },
                                innerMockData1: 'innerMockData1',
                                innerMockData2: 'innerMockData2',
                                innerMockData3: 'innerMockData3'
                            },
                            props: {
                                mockPropertyId: {
                                    type: 'RefsSchema',
                                    someRefList: ['#innerMockProperty1', '#innerMockProperty2'],
                                    someRef: '#innerMockProperty3'
                                },
                                innerMockProperty1: 'innerMockProperty1',
                                innerMockProperty2: 'innerMockProperty2',
                                innerMockProperty3: 'innerMockProperty3'
                            }
                        }
                    });
                    privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                });

                it('should remove the data item from the DAL', function () {
                    var dataPointer = privateServices.pointers.data.getDataItem('mockDataId', 'mainPage');
                    dataModel.removeDataItemRecursively(privateServices, dataPointer);
                    var data = privateServices.dal.get(dataPointer);
                    expect(data).toBeUndefined();
                });

                it('should remove data items recursively, meaning a data item that was pointed to by another data item which is removed, should also be removed from the DAL', function () {
                    var dataPointer = privateServices.pointers.data.getDataItem('mockDataId', 'mainPage');
                    var innerDataPointer1 = privateServices.pointers.data.getDataItem('innerMockData1', 'mainPage');
                    var innerDataPointer2 = privateServices.pointers.data.getDataItem('innerMockData2', 'mainPage');
                    var innerDataPointer3 = privateServices.pointers.data.getDataItem('innerMockData3', 'mainPage');
                    dataModel.removeDataItemRecursively(privateServices, dataPointer);

                    _.forEach([innerDataPointer1, innerDataPointer2, innerDataPointer3], function (innerPointer) {
                        var innerData = privateServices.dal.get(innerPointer);
                        expect(innerData).toBeUndefined();
                    });
                });

                it('should do nothing in case data does not exist', function () {
                    var nonExistingDataPointer = privateServices.pointers.data.getDataItem('nonExistingDataId', 'mainPage');
                    spyOn(privateServices.dal, 'remove');

                    dataModel.removeDataItemRecursively(privateServices, nonExistingDataPointer);

                    expect(privateServices.dal.remove).not.toHaveBeenCalled();
                });
            });

            describe('deletePropertiesItem', function () {
                it('should do nothing in case properties do not exist', function () {
                    var mockSiteData = testUtils.mockFactory.mockSiteData();
                    var pageId = mockSiteData.getPrimaryPageId();
                    var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.WRichText', mockSiteData, pageId);
                    compStructure.propertyQuery = 'nonExistingPropertiesId';
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                    var pagePointer = ps.pointers.components.getPage(pageId, 'DESKTOP');
                    var compWithNoPropertiesPointer = ps.pointers.components.getComponent(compStructure.id, pagePointer);
                    spyOn(ps.dal, 'remove');

                    dataModel.deletePropertiesItem(ps, compWithNoPropertiesPointer);

                    expect(ps.dal.remove).not.toHaveBeenCalled();
                });
            });

            describe('removeBehaviorsItem', function () {
                beforeEach(function () {
                    this.siteData = testUtils.mockFactory.mockSiteData();
                    this.pageId = this.siteData.getCurrentUrlPageId();
                });

                function addComponentWithBehaviors(siteData, pageId) {
                    var behavior = testUtils.mockFactory.behaviorMocks.widget.runCode('myCompNickName', 'someCallbackName', 'myWidgetInstanceId');
                    var action = testUtils.mockFactory.actionMocks.comp('click');
                    var compDataObj = {behaviors: JSON.stringify([{behavior: behavior, action: action}])};
                    var compStructure = testUtils.mockFactory.mockComponent('someType', siteData, pageId, compDataObj);
                    return compStructure;
                }

                it('should return null after removing behaviors item', function () {
                    var compStructure = addComponentWithBehaviors(this.siteData, this.pageId);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var currentPageRef = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                    var compRef = ps.pointers.components.getComponent(compStructure.id, currentPageRef);

                    dataModel.removeBehaviorsItem(ps, compRef);

                    expect(dataModel.getBehaviorsItem(ps, compRef)).toBeUndefined();
                });

                it('should remove behaviorQuery from the component structure', function () {
                    var compStructure = addComponentWithBehaviors(this.siteData, this.pageId);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var currentPageRef = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                    var compRef = ps.pointers.components.getComponent(compStructure.id, currentPageRef);

                    dataModel.removeBehaviorsItem(ps, compRef);

                    expect(ps.dal.get(compRef).behaviorQuery).toBeUndefined();
                });

                it('should do nothing if component has no behaviors item', function () {
                    var compStructure = testUtils.mockFactory.mockComponent('someType', this.siteData, this.pageId);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var currentPageRef = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                    var compRef = ps.pointers.components.getComponent(compStructure.id, currentPageRef);
                    var compBehaviorsBefore = dataModel.getBehaviorsItem(ps, compRef);

                    dataModel.removeBehaviorsItem(ps, compRef);

                    expect(dataModel.getBehaviorsItem(ps, compRef)).toEqual(compBehaviorsBefore);
                });
            });

            describe('getConnectionItem', function () {
                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments('connectionsData');
                    this.pageId = 'page1ID';
                    this.siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(this.pageId).addConnectionsDataMap();
                    this.siteData.setCurrentPage(this.pageId);
                });

                it('should return an array of all component connections', function () {
                    var controllerComp = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData, this.pageId);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var controllerRef = getCompPointer(ps, controllerComp.id, this.pageId);
                    var validConfig = {src: 'myPic'};
                    var connectionArray = [testUtils.mockFactory.connectionMocks.dsConnectionItem(controllerRef, 'someRole', validConfig)];
                    var compStructure = testUtils.mockFactory.mockComponent('someCompType', this.siteData, this.pageId, {connections: connectionArray});
                    ps.syncDisplayedJsonToFull();
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);
                    var result = dataModel.getConnectionsItem(ps, compPointer);

                    expect(result).toEqual(connectionArray);
                });

                it('should return the component connection to a controller on master page', function () {
                    var controllerComp = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData, constants.MASTER_PAGE_ID);
                    var validConfig = {src: 'myPic'};
                    var connectionArray = [testUtils.mockFactory.connectionMocks.connectionItem(controllerComp.dataQuery, 'someRole', validConfig)];
                    var compStructure = testUtils.mockFactory.mockComponent('someCompType', this.siteData, this.pageId, {connections: connectionArray});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);

                    var result = dataModel.getConnectionsItem(ps, compPointer);

                    var controllerRef = getCompPointer(ps, controllerComp.id, constants.MASTER_PAGE_ID);
                    var expectedConnectionArray = [testUtils.mockFactory.connectionMocks.dsConnectionItem(controllerRef, 'someRole', validConfig)];
                    expect(result).toEqual(expectedConnectionArray);
                });

                it('should return null in case component does not have any connections', function () {
                    var compStructure = testUtils.mockFactory.mockComponent('someCompType', this.siteData, this.pageId, {});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);

                    var result = dataModel.getConnectionsItem(ps, compPointer);

                    expect(result).toBeNull();
                });

            });

            describe('updateConnectionsItem', function () {

                beforeEach(function () {
                    this.pageId = 'page1ID';
                    this.siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(this.pageId).addConnectionsDataMap();
                    testUtils.experimentHelper.openExperiments('connectionsData');
                });

                it('should update (override) the existing connections data item in case component already has one', function () {
                    var controllerComp = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData, this.pageId);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var controllerRef = getCompPointer(ps, controllerComp.id, this.pageId);
                    var validConfig = {src: 'myPic'};
                    var connectionA = testUtils.mockFactory.connectionMocks.dsConnectionItem(controllerRef, 'someRole', validConfig);
                    var connectionB = testUtils.mockFactory.connectionMocks.dsConnectionItem(controllerRef, 'differentRole', validConfig);
                    var originalConnectionArray = [connectionA];
                    var compStructure = testUtils.mockFactory.mockComponent('someCompType', this.siteData, this.pageId, {connections: originalConnectionArray});
                    ps.syncDisplayedJsonToFull();
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);
                    var newConnectionArray = [connectionB];

                    dataModel.updateConnectionsItem(ps, compPointer, newConnectionArray);

                    expect(dataModel.getConnectionsItem(ps, compPointer)).toEqual(newConnectionArray);
                });

                it('should create a new connections item in case component does not have connections', function () {
                    var controllerComp = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData, this.pageId);
                    var validConfig = {src: 'myPic'};
                    var compStructure = testUtils.mockFactory.mockComponent('someCompType', this.siteData, this.pageId, {});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var controllerRef = getCompPointer(ps, controllerComp.id, this.pageId);
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);
                    var connectionA = testUtils.mockFactory.connectionMocks.dsConnectionItem(controllerRef, 'someRole', validConfig);
                    var newConnectionArray = [connectionA];

                    dataModel.updateConnectionsItem(ps, compPointer, newConnectionArray);

                    expect(dataModel.getConnectionsItem(ps, compPointer)).toEqual(newConnectionArray);
                });

                it('should throw an error in case the connection config is not stringifiable', function () {
                    var controllerComp = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData, this.pageId);
                    var invalidConfig = {};
                    invalidConfig.a = {b: invalidConfig};
                    var compStructure = testUtils.mockFactory.mockComponent('someCompType', this.siteData, this.pageId, {});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);
                    var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(controllerComp.dataQuery, 'someRole', invalidConfig);
                    var newConnectionArray = [connectionA];

                    var updateConnectionsItemMethod = dataModel.updateConnectionsItem.bind(dataModel, ps, compPointer, newConnectionArray);

                    expect(updateConnectionsItemMethod).toThrow(new Error('Invalid connection configuration - should be JSON stringifiable'));
                });
            });

            describe('removeConnectionsItem', function () {
                function addComponentWithConnections(siteData, pageId) {
                    var controllerComp = testUtils.mockFactory.mockComponent('platform.components.AppController', siteData, pageId);
                    var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(controllerComp.dataQuery, 'someRole');
                    var compDataObj = {connections: connectionA};
                    var compStructure = testUtils.mockFactory.mockComponent('someType', siteData, pageId, compDataObj);
                    return compStructure;
                }

                beforeEach(function () {
                    this.siteData = testUtils.mockFactory.mockSiteData().addConnectionsDataMap();
                    this.pageId = this.siteData.getCurrentUrlPageId();
                });

                it('should return null after removing connections item', function () {
                    var compStructure = addComponentWithConnections(this.siteData, this.pageId);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var currentPageRef = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                    var compRef = ps.pointers.components.getComponent(compStructure.id, currentPageRef);

                    dataModel.removeConnectionsItem(ps, compRef);

                    expect(dataModel.getConnectionsItem(ps, compRef)).toBeNull();
                });

                it('should remove connectionQuery from the component structure', function () {
                    var compStructure = addComponentWithConnections(this.siteData, this.pageId);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var currentPageRef = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                    var compRef = ps.pointers.components.getComponent(compStructure.id, currentPageRef);

                    dataModel.removeConnectionsItem(ps, compRef);

                    expect(ps.dal.get(compRef).connectionQuery).toBeUndefined();
                });

                it('should do nothing if component has no connections item', function () {
                    var compStructure = testUtils.mockFactory.mockComponent('someType', this.siteData, this.pageId);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    var currentPageRef = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                    var compRef = ps.pointers.components.getComponent(compStructure.id, currentPageRef);

                    expect(dataModel.removeConnectionsItem.bind(dataModel, ps, compRef)).not.toThrow();

                    dataModel.removeConnectionsItem(ps, compRef);
                    expect(dataModel.getConnectionsItem(ps, compRef)).toBeNull();
                });
            });
        });
    });
