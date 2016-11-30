define(['lodash',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/constants/constants',
    'utils',
    'testUtils',
    'documentServices/component/component',
    'documentServices/component/componentModes',
    'documentServices/hooks/hooks',
    'documentServices/dataModel/PropertiesSchemas.json',
    'documentServices/dataModel/DesignSchemas.json'], function(_, privateServicesHelper,
                                                               constants, utils,
                                                               testUtils,
                                                               componentService, componentModes,
                                                               hooks,
                                                               PropertiesSchemas,
                                                               DesignSchemas){
    'use strict';

    var openExperiments = testUtils.experimentHelper.openExperiments;

    function getCompPointer(ps, compId, pageId){
        var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
        return ps.pointers.full.components.getComponent(compId, page);
    }

    describe('serializeComponent', function () {

        describe('when serializing component`s data', function() {
            describe('when serializing component connections', function(){
                beforeEach(function(){
                    testUtils.experimentHelper.openExperiments('connectionsData');
                    this.mockSiteData = testUtils.mockFactory.mockSiteData().addConnectionsDataMap();
                    this.compType = 'wysiwyg.viewer.components.SiteButton';
                    this.pageId = this.mockSiteData.getCurrentUrlPageId();
                });
                it('should fetch the connections data item, remove its id and set it to the `connections` props (maintainIdentifiers is false)', function(){
                    var originalCompConnections = [];
                    var compStructure = testUtils.mockFactory.mockComponent(this.compType, this.mockSiteData, this.pageId, {connections: originalCompConnections});
                    var compConnections = this.mockSiteData.getDataByQuery(compStructure.connectionQuery, this.pageId, this.mockSiteData.dataTypes.CONNECTIONS);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);

                    var serializationResult = componentService.serialize(ps, compPointer, null, null, false);

                    expect(serializationResult.connections).toEqual(_.omit(compConnections, 'id'));
                    expect(serializationResult.connectionQuery).toBeUndefined();
                });

                it('should fetch the connections data item and set it to the `connections` prop (maintainIdentifiers is true)', function(){
                    var originalCompConnections = [];
                    var compStructure = testUtils.mockFactory.mockComponent(this.compType, this.mockSiteData, this.pageId, {connections: originalCompConnections});
                    var compConnections = this.mockSiteData.getDataByQuery(compStructure.connectionQuery, this.pageId, this.mockSiteData.dataTypes.CONNECTIONS);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);

                    var serializationResult = componentService.serialize(ps, compPointer, null, null, true);

                    expect(serializationResult.connections).toEqual(compConnections);
                    expect(serializationResult.connectionQuery).toBeUndefined();
                });

                it('should fetch the connections data item and set it to the `connections` props when items is not an empty array', function(){
                    var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.mockSiteData, this.pageId);
                    var connectionConfig = {a: 'b'};
                    var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole', connectionConfig);
                    var compConnections = [connectionA];
                    var compStructure = testUtils.mockFactory.mockComponent(this.compType, this.mockSiteData, this.pageId, {connections: compConnections});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    var compPointer = getCompPointer(ps, compStructure.id, this.pageId);
                    var expectedConnectionItem = _.assign({}, connectionA, {config: JSON.stringify(connectionConfig)});

                    var serializationResult = componentService.serialize(ps, compPointer, null, null, false);

                    expect(_.get(serializationResult, 'connections.items')).toEqual([expectedConnectionItem]);
                    expect(serializationResult.connectionQuery).toBeUndefined();
                });
            });

            describe('when serializing behavior data', function() {
                it('should fetch the behaviors data item, remove its id and set it to the `behaviors` prop (maintainIdentifiers is false)', function(){
                    var mockSiteData = testUtils.mockFactory.mockSiteData();
                    var compType = 'wysiwyg.viewer.components.SiteButton';
                    var originalCompBehaviors = [];
                    var pageId = mockSiteData.getCurrentUrlPageId();
                    var compStructure = testUtils.mockFactory.mockComponent(compType, mockSiteData, pageId, {behaviors: originalCompBehaviors});
                    var compBehaviors = mockSiteData.getDataByQuery(compStructure.behaviorQuery, pageId, mockSiteData.dataTypes.BEHAVIORS);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                    var compPointer = getCompPointer(ps, compStructure.id, pageId);

                    var serializationResult = componentService.serialize(ps, compPointer, null, null, false);

                    expect(serializationResult.behaviors).toEqual(_.omit(compBehaviors, 'id'));
                    expect(serializationResult.behaviorQuery).toBeUndefined();
                });
                it('should fetch the behaviors data item and set it to the `behaviors` prop (maintainIdentifiers is true)', function(){
                    var mockSiteData = testUtils.mockFactory.mockSiteData();
                    var compType = 'wysiwyg.viewer.components.SiteButton';
                    var originalCompBehaviors = [];
                    var pageId = mockSiteData.getCurrentUrlPageId();
                    var compStructure = testUtils.mockFactory.mockComponent(compType, mockSiteData, pageId, {behaviors: originalCompBehaviors});
                    var compBehaviors = mockSiteData.getDataByQuery(compStructure.behaviorQuery, pageId, mockSiteData.dataTypes.BEHAVIORS);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                    var compPointer = getCompPointer(ps, compStructure.id, pageId);

                    var serializationResult = componentService.serialize(ps, compPointer, null, null, true);

                    expect(serializationResult.behaviors).toEqual(compBehaviors);
                    expect(serializationResult.behaviorQuery).toBeUndefined();
                });
            });

            describe('when serializing properties', function() {
                it('should embed the properties item in the JSON without the property query', function () {
                    var propsItem = {id: 'propItem', type: 'type'};
                    var siteData = testUtils.mockFactory.mockSiteData()
                        .addPageWithDefaults('page1', [{id: 'comp', propertyQuery: '#propItem'}])
                        .addProperties(propsItem, 'page1');

                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var comp = getCompPointer(ps, 'comp', 'page1');

                    var serializedComponent = componentService.serialize(ps, comp);
                    expect(serializedComponent.props).toEqual({type: 'type'});
                    expect(serializedComponent.propertyQuery).toBeUndefined();
                });
            });

            describe('when serializing (document) data item', function() {
                it('should embed the data item in the JSON and remove the dataQuery', function () {
                    var siteData = testUtils.mockFactory.mockSiteData()
                        .addPageWithDefaults('page1', [{id: 'comp', dataQuery: '#propItem'}])
                        .addData({id: 'propItem', type: 'type'}, 'page1');

                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var comp = getCompPointer(ps, 'comp', 'page1');

                    var serializedComponent = componentService.serialize(ps, comp);
                    expect(serializedComponent.data).toEqual({type: 'type'});
                    expect(serializedComponent.dataQuery).toBeUndefined();
                });
            });

            describe('when serializing styles', function() {
                describe('when the style is a global("system") style', function() {
                    it('should specify the global style ID on the style property, and remove the styleID from the JSON', function () {
                        var siteData = testUtils.mockFactory.mockSiteData()
                            .addPageWithDefaults('page1', [{id: 'comp', styleId: 'mockGlobalStyleId'}])
                            .addCompTheme({id: 'mockGlobalStyleId', styleType: 'system'});

                        var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                        var comp = getCompPointer(ps, 'comp', 'page1');

                        var serializedComponent = componentService.serialize(ps, comp);
                        expect(serializedComponent.style).toEqual('mockGlobalStyleId');
                        expect(serializedComponent.styleId).toBeUndefined();
                    });
                });

                describe('when the style is a custom style (NOT a "system"/global style)', function() {
                    it('should embed the custom Style data item on the JSON and remove the styleID property', function () {
                        var siteData = testUtils.mockFactory.mockSiteData()
                            .addPageWithDefaults('page1', [{id: 'comp', styleId: 'mockCustomStyleId'}])
                            .addCompTheme({id: 'mockCustomStyleId', styleType: 'custom', a: 'a'});

                        var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                        var comp = getCompPointer(ps, 'comp', 'page1');

                        var serializedComponent = componentService.serialize(ps, comp);
                        expect(serializedComponent.style).toEqual({styleType: 'custom', a: 'a'});
                        expect(serializedComponent.styleId).toBeUndefined();
                    });

                    it('should call the enricher', function() {
                        var siteData = testUtils.mockFactory.mockSiteData()
                            .addPageWithDefaults('page1', [{id: 'comp', styleId: 'mockCustomStyleId'}])
                            .addCompTheme({id: 'mockCustomStyleId', styleType: 'custom', a: 'a'});

                        var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                        var comp = getCompPointer(ps, 'comp', 'page1');

                        var enricher = jasmine.createSpy();
                        componentService.serialize(ps, comp, undefined, undefined, undefined, undefined, enricher);
                        expect(enricher.calls.count()).toEqual(1);
                    });
                });
            });

            describe('when serializing design data', function() {

                beforeEach(function() {
                    var designItem = {id: 'designItemId', type: 'MediaContainerDesignData', background: '#designItemChildId'};
                    var designItemChild = {id: 'designItemChildId',
                                            type: 'BackgroundMedia', color: '#abc123',
                                            colorOpacity: 1, mediaRef: '#designItemGrandChildId'};
                    var designItemGrandChild = {id: 'designItemGrandChildId', type: 'Image', uri: 'image-uri.png'};
                    this.pageId = 'page1';
                    var siteData = testUtils.mockFactory.mockSiteData()
                        .addPageWithDefaults(this.pageId, [{id: 'comp', designQuery: '#designItemId'}])
                        .addDesign(designItem, this.pageId)
                        .addDesign(designItemChild, this.pageId)
                        .addDesign(designItemGrandChild, this.pageId);

                    this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    this.compPointer = getCompPointer(this.ps, 'comp', 'page1');
                });

                describe('when maintain identifiers is true', function() {
                    it('should keep only the id of the parent design item. all referenced items, should NOT have ids.', function() {
                        var maintainIdentifiers = true;
                        var serializedComponent = componentService.serialize(this.ps, this.compPointer, null, false, maintainIdentifiers);

                        expect(serializedComponent.designQuery).toBeUndefined();
                        expect(serializedComponent.design).toEqual({
                            id: 'designItemId',
                            type: 'MediaContainerDesignData',
                            background: {
                                type: 'BackgroundMedia',
                                color: '#abc123',
                                colorOpacity: 1,
                                mediaRef: {
                                    type: 'Image',
                                    uri: 'image-uri.png'
                                }
                            }
                        });
                    });
                });

                describe('when maintain identifiers is false', function() {
                    it('should not keep the ids of the design items and its children', function() {
                        // ps, componentPointer, dataItemPointer, ignoreChildren, maintainIdentifiers, flatMobileStructuresMap
                        var maintainIdentifiers = false;
                        var serializedComponent = componentService.serialize(this.ps, this.compPointer, null, false, maintainIdentifiers);

                        expect(serializedComponent.designQuery).toBeUndefined();
                        expect(serializedComponent.design).toEqual({
                            type: 'MediaContainerDesignData', background: {
                                type: 'BackgroundMedia',
                                color: '#abc123',
                                colorOpacity: 1,
                                mediaRef: {
                                    type: 'Image',
                                    uri: 'image-uri.png'
                                }
                            }
                        });
                    });
                });
            });

            describe('when using the "maintainIdentifiers" flag', function() {

                beforeEach(function() {
                    this.pageId = 'page1';
                    this.compId = 'comp';
                    this.styleId = 'mockCustomStyleId';
                    this.dataQuery = 'dataItem';
                    this.propsQuery = 'propItem';

                    this.dataItemPointer = null;
                    this.ignoreChildren = false;
                    this.maintainIdentifiers = true;
                });

                describe('when component has NO children', function() {

                    beforeEach(function() {
                        var siteData = testUtils.mockFactory.mockSiteData()
                            .addPageWithDefaults(this.pageId, [{
                                id: this.compId,
                                styleId: this.styleId,
                                dataQuery: '#' + this.dataQuery,
                                propertyQuery: this.propsQuery,
                                components: [],
                                mobileComponents: [],
                                type: 'Container'}])
                            .addCompTheme({id: this.styleId, styleType: 'custom', a: 'a'})
                            .addData({id: this.dataQuery, type: 'type'}, this.pageId)
                            .addProperties({id: this.propsQuery, type: 'type'}, this.pageId);
                        this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    });

                    it('should serialize the component and maintain ids and mobile components if maintainIdentifiers is true', function() {
                        var comp = getCompPointer(this.ps, this.compId, this.pageId);

                        var serializedComponent = componentService.serialize(this.ps, comp, this.dataItemPointer, this.ignoreChildren, this.maintainIdentifiers);

                        expect(serializedComponent.id).toEqual(this.compId);
                        expect(serializedComponent.style.id).toEqual(this.styleId);
                        expect(serializedComponent.data.id).toEqual(this.dataQuery);
                        expect(serializedComponent.props.id).toEqual(this.propsQuery);
                        expect(serializedComponent.mobileComponents).toBeDefined();
                    });
                });

                describe('when component has children', function() {

                    var MOBILE_ID_PREFIX = 'mobile_';

                    beforeEach(function() {
                        var siteData = testUtils.mockFactory.mockSiteData()
                            .addPageWithDefaults(this.pageId, [{
                                    id: this.compId,
                                    styleId: this.styleId,
                                    dataQuery: '#' + this.dataQuery,
                                    propertyQuery: this.propsQuery,
                                    type: 'Container'}
                                ], [{
                                    id: this.compId,
                                    styleId: this.styleId,
                                    dataQuery: '#' + this.dataQuery,
                                    propertyQuery: MOBILE_ID_PREFIX + this.propsQuery,
                                    type: 'Component'
                            }])
                            .addCompTheme({id: this.styleId, styleType: 'custom', a: 'a'})
                            .addData({id: this.dataQuery, type: 'type'}, this.pageId)
                            .addProperties({id: this.propsQuery, type: 'type'}, this.pageId);

                        immitateMobilePropertiesSplit(siteData, this.propsQuery, this.pageId);
                        this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    });

                    function immitateMobilePropertiesSplit(siteData, propsQuery, pageId) {
                        siteData.pagesData[pageId].data.component_properties[MOBILE_ID_PREFIX + propsQuery] = {
                            id: MOBILE_ID_PREFIX + propsQuery,
                            type: 'type'
                        };
                    }

                    it('should serialize the component children properties recursively and maintain ids and mobile components if maintainIdentifiers is true', function() {
                        var page = this.ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);

                        var serializedComponent = componentService.serialize(this.ps, page, this.dataItemPointer, this.ignoreChildren, this.maintainIdentifiers);

                        expect(serializedComponent.components[0].props.id).toEqual(this.propsQuery);
                        expect(serializedComponent.mobileComponents[0].props.id).toEqual(MOBILE_ID_PREFIX + this.propsQuery);
                    });
                });
            });
        });

        describe('Serialization Hooks / Custom structure Data', function () {
            var ps;
            beforeEach(function(){
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1', [{id: 'comp'}]);

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });
            it('should add custom data from after-serialize hooks', function () {
                var customTemplate = {fake: 'fake template'};
                var afterSerializeHook = function (lk, compReference, customStructureData) {
                    customStructureData.template = customTemplate;
                };
                spyOn(hooks, 'executeHook').and.callFake(function (functionName, compType, args) {
                    if (functionName === hooks.HOOKS.SERIALIZE.SET_CUSTOM) {
                        return afterSerializeHook.apply(undefined, args);
                    }
                });
                var comp = getCompPointer(ps, 'comp', 'page1');
                var serializedComponent = componentService.serialize(ps, comp);
                expect(serializedComponent.custom.template).toEqual(customTemplate);
            });

            it('should not add the custom attribute if hooks leaves an empty object', function () {
                spyOn(hooks, 'executeHook').and.callFake(function (functionName) {
                    if (functionName === hooks.HOOKS.SERIALIZE.SET_CUSTOM) {
                        return {success: true};
                    }
                });
                var comp = getCompPointer(ps, 'comp', 'page1');
                var serializedComponent = componentService.serialize(ps, comp);
                expect(serializedComponent.custom).toBeUndefined();
            });
        });

        describe('Component with NO Modes (regular Component)', function() {
            describe('when component has children', function() {
                it('should serialize component with child components', function () {
                    var siteData = testUtils.mockFactory.mockSiteData()
                        .addPageWithDefaults('page1', [{id: 'comp', components: [{id: 'c1', type: 'mockCompTyp1'}, {id: 'c2', type: 'mockCompTyp2'}]}]);

                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                    var pageComponent = getCompPointer(ps, 'comp', 'page1');

                    var serializedPageComponent = componentService.serialize(ps, pageComponent);
                    expect(serializedPageComponent.components.length).toBe(2);
                    expect(serializedPageComponent.components[0]).toEqual({type: 'mockCompTyp1'});
                    expect(serializedPageComponent.components[1]).toEqual({type: 'mockCompTyp2'});
                });
            });
        });

        describe('Component with Modes', function() {

            function setupSiteWithModes(callbackToManipulatePageStructure) {
                openExperiments(['sv_hoverBox']);
                this.dataItemPointer = null;
                this.ignoreChildren = false;
                this.maintainIdentifiers = true;
                this.flatMobileStructuresMap = false;

                this.siteData = testUtils.mockFactory.mockSiteData();
                this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);

                addFakePageStructureWithDataToDAL.call(this, callbackToManipulatePageStructure);
            }

            function addFakePageStructureWithDataToDAL(callbackToManipulatePageStructure) {
                var pageStructure = createFakePageStructure();
                pageStructure = (callbackToManipulatePageStructure || _.identity).call(this, pageStructure);
                this.page1ID = 'page1';
                this.ps.dal.addPageWithDefaults(this.page1ID, pageStructure.structure.components, pageStructure.structure.mobileComponents);
                addPageDataToDAL.call(this, pageStructure);
            }

            function addPageDataToDAL(pageStructure) {
                _.forEach(pageStructure.data.dataItems, _.partialRight(this.ps.dal.addData, this.page1ID));
                _.forEach(pageStructure.data.styles, _.partialRight(this.ps.dal.addStyle));
                _.forEach(pageStructure.data.propertiesItems, _.partialRight(this.ps.dal.addProperties, this.page1ID));
                _.forEach(pageStructure.data.designDataItems, function (designDataItem) {
                    this.ps.dal.addDesignItem(designDataItem, this.page1ID);
                }, this);
            }

            function createFakePageStructure() {
                return {
                    structure: {
                        id: 'fakePageID',
                        components: createFakePageChildrenStructure(),
                        mobileComponents: []
                    },
                    data: {
                        dataItems: [createFakeChildCompDataItem()],
                        styles: [createStyleItem('system-style-id1', 'system'), createStyleItem('custom-style-id1', 'custom', 'wysiwyg.viewer.skins.MockSkin')],
                        designDataItems: createFakeDesignItems(),
                        propertiesItems: createFakePropertiesItem()
                    }
                };
            }

            function createFakePageChildrenStructure() {
                return [createContainerWithModesStructure(),
                    {
                        id: 'other-container-with-modes',
                        componentType: 'wysiwyg.viewer.components.Container',
                        type: 'Container',
                        modes: {
                            definitions: [{modeId: 'container2-container-mode-id'}]
                        },
                        components: []
                    }];
            }

            function createContainerWithModesStructure() {
                return {
                    id: 'container-with-modes',
                    componentType: 'mobile.core.components.Container',
                    type: 'Container',
                    components: [createChildComp()],
                    modes: {
                        definitions: [{modeId: 'container-mode-id'}]
                    }
                };
            }

            function createChildComp() {
                return {
                    id: 'child-comp',
                    componentType: 'wysiwyg.viewer.components.SiteButton',
                    type: 'Component',
                    dataQuery: '#myQuery',
                    modes: {
                        isHiddenByModes: true,
                        overrides: [{
                            modeIds: ['container-mode-id'],
                            isHiddenByModes: false
                        }, {
                            modeIds: ['page-scrollcontainer-mode-id'],
                            isHiddenByModes: false
                        }]
                    }
                };
            }

            function createFakeChildCompDataItem() {
                return {
                    id: 'myQuery',
                    prop1: 'data1 value',
                    prop2: 'data2 value'
                };
            }

            function createStyleItem(id, styleType, skin) {
                return {
                    'id': id,
                    'type': 'TopLevelStyle',
                    'style': {
                        'properties': {
                            'alpha-bg': '1',
                            'bg': 'color_11'
                        },
                        'propertiesSource': {
                            'brd': 'theme',
                            'shd': 'value'
                        },
                        'groups': {}
                    },
                    'componentClassName': '',
                    'styleType': styleType,
                    'skin': skin || 'some.fake.skin.Identifier'
                };
            }

            function createFakeDesignItems() {
                return [createFakeParentDesignItem(), createFakeReferencedDesignItem()];
            }

            function createFakeParentDesignItem() {
                return {
                    id: 'designItemID-1',
                    type: 'MockDesignType1',
                    foo: 'bar',
                    refProp: '#designItemID-2'
                };
            }

            function createFakeReferencedDesignItem() {
                return {
                    id: 'designItemID-2',
                    type: 'MockDesignType2',
                    key: 'val',
                    buzz: 'stevie'
                };
            }

            function createFakePropertiesItem() {
                return [{
                    id: 'propertyItem-Fake-ID',
                    type: 'MockPropertiesType',
                    foo: 'bar',
                    fakeEnum: ['hello', 'world'],
                    fakeObject: {
                        fakeNumber: -55,
                        fakeName: 'buzz'
                    }
                }];
            }

            function addScrollAndRegularModesToPage(ps, pagePointer) {
                var modeType = utils.siteConstants.COMP_MODES_TYPES.SCROLL;
                componentModes.addComponentModeDefinition(ps, 'page-scrollcontainer-mode-id', pagePointer, modeType);
            }

            describe('when performing structure serialization', function() {
                beforeEach(function() {
                    setupSiteWithModes.call(this);

                    this.apiParams = {
                        dataItemPointer: null,
                        ignoreChildren: false,
                        maintainIdentifiers: true,
                        flatMobileStructuresMap: false
                    };
                });

                describe('when serializing a page with modes, and children with overrides', function() {

                    beforeEach(function() {
                        var page = this.ps.pointers.components.getPage(this.page1ID, constants.VIEW_MODES.DESKTOP);
                        addScrollAndRegularModesToPage(this.ps, page);
                    });

                    it('should return the Full Page - a JSON that contains all the children and all existing overrides', function() {
                        var page = this.ps.pointers.components.getPage(this.page1ID, constants.VIEW_MODES.DESKTOP);

                        var serializedComponent = componentService.serialize(this.ps,
                                                                            page,
                                                                            this.apiParams.dataItemPointer,
                                                                            this.apiParams.ignoreChildren,
                                                                            this.apiParams.maintainIdentifiers,
                                                                            this.apiParams.flatMobileStructuresMap);

                        var expectedPageModes = {
                            definitions: [{
                                    modeId: 'page-scrollcontainer-mode-id',
                                    type: utils.siteConstants.COMP_MODES_TYPES.SCROLL,
                                    label: null,
                                    params: null
                                },
                                {
                                    modeId: jasmine.any(String),
                                    type: utils.siteConstants.COMP_MODES_TYPES.DEFAULT,
                                    label: null,
                                    params: null
                                }
                            ],
                            overrides: []
                        };

                        var pageStructureWithoutChildren = {
                            id: this.page1ID,
                            type: 'Page',
                            skin: 'wysiwyg.viewer.skins.page.BasicPageSkin',
                            componentType: 'mobile.core.components.Page',
                            modes: expectedPageModes,
                            activeModes: jasmine.any(Object),
                            layout: jasmine.any(Object)
                        };

                        expect(_.omit(serializedComponent, ['components', 'mobileComponents'])).toEqual(pageStructureWithoutChildren);

                        expect(serializedComponent.mobileComponents).toEqual([]);
                        var expectedPageComponentsWithEmbeddedDataItems = createFakePageChildrenStructure();
                        expectedPageComponentsWithEmbeddedDataItems[0].components[0].data = createFakeChildCompDataItem();
                        delete expectedPageComponentsWithEmbeddedDataItems[0].components[0].dataQuery;
                        expect(serializedComponent.components).toEqual(expectedPageComponentsWithEmbeddedDataItems);
                    });

                    it('should return the Page structure without the "scroll mode" in "activeModes" which affect the structure from outside itself', function() {
                        var page = this.ps.pointers.components.getPage(this.page1ID, constants.VIEW_MODES.DESKTOP);
                        this.ps.siteAPI.activateMode(page, 'page-scrollcontainer-mode-id');

                        var serializedComponent = componentService.serialize(this.ps,
                            page, this.apiParams.dataItemPointer,
                            this.apiParams.ignoreChildren,
                            this.apiParams.maintainIdentifiers,
                            this.apiParams.flatMobileStructuresMap);

                        expect(serializedComponent.activeModes['page-scrollcontainer-mode-id']).toBeFalsy();
                    });
                });

                describe('when serializing a container with children and with overrides', function() {

                    beforeEach(function() {
                        this.container = getCompPointer(this.ps, 'container-with-modes', this.page1ID);
                        this.pagePointer = this.ps.pointers.components.getPage(this.page1ID, constants.VIEW_MODES.DESKTOP);
                        addScrollAndRegularModesToPage(this.ps, this.pagePointer);

                        this.ps.siteAPI.activateMode(this.container, 'container-mode-id');
                        this.ps.siteAPI.activateMode(this.pagePointer, 'page-scrollcontainer-mode-id');
                    });

                    it('should serialize the Container structure from the FULL JSON, and embed its data items', function() {
                        var expectedSerializedContainer = createContainerWithModesStructure();
                        expectedSerializedContainer.components[0].data = createFakeChildCompDataItem();
                        delete expectedSerializedContainer.components[0].dataQuery;

                        var serializedContainer = componentService.serialize(this.ps, this.container,
                            this.apiParams.dataItemPointer,
                            this.apiParams.ignoreChildren,
                            this.apiParams.maintainIdentifiers,
                            this.apiParams.flatMobileStructuresMap);

                        expect(_.omit(serializedContainer, 'activeModes')).toEqual(expectedSerializedContainer);
                    });

                    it('should return the Full JSON of the container with its ancestors active modes', function() {
                        var serializedContainer = componentService.serialize(this.ps, this.container,
                                                                            this.apiParams.dataItemPointer,
                                                                            this.apiParams.ignoreChildren,
                                                                            this.apiParams.maintainIdentifiers,
                                                                            this.apiParams.flatMobileStructuresMap);

                        expect(serializedContainer.activeModes).toEqual({
                            'page-scrollcontainer-mode-id': true
                        });
                    });
                });

                describe('when serializing a component with overrides', function() {

                    beforeEach(function() {
                        this.component = getCompPointer(this.ps, 'child-comp', this.page1ID);
                        var page = this.ps.pointers.components.getPage(this.page1ID, constants.VIEW_MODES.DESKTOP);
                        addScrollAndRegularModesToPage(this.ps, page);
                    });

                    it('should return the FULL JSON of the component with its data items embedded', function() {
                        var serializedComp = componentService.serialize(this.ps, this.component, this.apiParams.dataItemPointer,
                                                    this.apiParams.ignoreChildren, this.apiParams.maintainIdentifiers,
                                                    this.apiParams.flatMobileStructuresMap);

                        var expectedSerializedCompJSON = createChildComp();
                        expectedSerializedCompJSON.activeModes = jasmine.any(Object);
                        expectedSerializedCompJSON.data = {
                            id: 'myQuery',
                            prop1: 'data1 value',
                            prop2: 'data2 value'
                        };
                        delete expectedSerializedCompJSON.dataQuery;

                        expect(serializedComp).toEqual(expectedSerializedCompJSON);
                    });

                    it('should return the Full JSON of the component with its ancestors active modes', function() {
                        var pagePointer = this.ps.pointers.components.getPage(this.page1ID, constants.VIEW_MODES.DESKTOP);
                        this.ps.siteAPI.activateMode(pagePointer, 'page-scrollcontainer-mode-id');
                        var nonAncestorContainer = getCompPointer(this.ps, 'other-container-with-modes', this.page1ID);
                        this.ps.siteAPI.activateMode(nonAncestorContainer, 'container2-container-mode-id');

                        var expectedPageActiveModes = {'page-scrollcontainer-mode-id': true, 'container2-container-mode-id': true};
                        expect(this.ps.siteAPI.getActiveModes()[this.page1ID]).toEqual(expectedPageActiveModes);

                        var serializedComp = componentService.serialize(this.ps,
                            this.component,
                            this.apiParams.dataItemPointer,
                            this.apiParams.ignoreChildren,
                            this.apiParams.maintainIdentifiers,
                            this.apiParams.flatMobileStructuresMap);

                        expect(serializedComp.activeModes).toEqual({'page-scrollcontainer-mode-id': true});
                    });
                });
            });


            describe('when serializing component with styleId on an Overrides object', function() {

                beforeEach(function() {
                    setupSiteWithModes.call(this, addStyleOverridesToPageStructure);
                    this.pointers = this.ps.pointers;
                    this.container = getCompPointer(this.ps, 'container-with-modes', this.page1ID);
                });

                function addStyleOverridesToPageStructure(fakePageStructure) {
                    fakePageStructure.structure.components[0].modes.definitions = [{'modeId': 'container-mode-id-for-system-style'},
                        {'modeId': 'container-mode-id-for-custom-style'}];

                    fakePageStructure.structure.components[0].components[0].modes.overrides = [{
                        modeIds: ['container-mode-id-for-system-style'],
                        styleId: 'system-style-id1'
                    }, {
                        modeIds: ['container-mode-id-for-custom-style'],
                        styleId: 'custom-style-id1'
                    }];
                    return fakePageStructure;
                }

                describe('when the styleId corresponds a global/system style', function() {
                    it('should NOT serialize the Global style under the overrides object, only set the ID to the style property', function() {
                        var serializedComponent = componentService.serialize(this.ps,
                                                                             this.container, this.dataItemPointer,
                                                                             this.ignoreChildren, this.maintainIdentifiers,
                                                                             this.flatMobileStructuresMap);

                        var systemStyle = this.ps.dal.get(this.pointers.general.getAllTheme())['system-style-id1'];
                        expect(systemStyle.styleType).toBe('system');
                        expect(serializedComponent.components[0].modes.overrides[0].style).toBe('system-style-id1');
                    });
                });

                describe('when the styleId corresponds a custom style', function() {
                    it('should serialize and set the Custom style under the overrides object, "style" property', function() {
                        var serializedComponent = componentService.serialize(this.ps,
                            this.container, this.dataItemPointer,
                            this.ignoreChildren, this.maintainIdentifiers,
                            this.flatMobileStructuresMap);

                        var customStyle = this.ps.dal.get(this.pointers.general.getAllTheme())['custom-style-id1'];

                        expect(customStyle.styleType).toBe('custom');
                        expect(serializedComponent.components[0].modes.overrides[1].style).toEqual(customStyle);
                    });
                });
            });

            describe('when serializing component with "designQuery" on an Overrides object', function() {

                function addDesignOverridesToFakeStructure(fakePageStructure) {
                    fakePageStructure.structure.components[0].modes.definitions = [{'modeId': 'container-mode-id-for-design'}];

                    fakePageStructure.structure.components[0].components[0].modes.overrides = [{
                        modeIds: ['container-mode-id-for-design'],
                        designQuery: '#designItemID-1'
                    }];
                    return fakePageStructure;
                }

                beforeEach(function() {
                    DesignSchemas.MockDesignType1 = {properties: {
                        refProp: {"type": ["string", "null"], pseudoType: ['ref']}
                    }};
                    setupSiteWithModes.call(this, addDesignOverridesToFakeStructure);
                    this.container = getCompPointer(this.ps, 'container-with-modes', this.page1ID);
                });

                it('should serialize and embed the design item (with its hierarchy) under the overrides object, "design" property', function() {
                    var serializedComponent = componentService.serialize(this.ps, this.container, null,
                                                                         this.ignoreChildren, this.maintainIdentifiers,
                                                                         this.flatMobileStructuresMap);


                    var expectedDesignItem = createFakeParentDesignItem();
                    expectedDesignItem.refProp = _.omit(createFakeReferencedDesignItem(), 'id');

                    expect(serializedComponent.components[0].modes.overrides[0].designQuery).not.toBeDefined();
                    expect(serializedComponent.components[0].modes.overrides[0].design).toEqual(expectedDesignItem);
                });
            });

            describe('when serializing component with "propertyQuery" on an Overrides object', function() {

                function addPropertiesOverridesToFakeStructure(fakePageStructure) {
                    fakePageStructure.structure.components[0].modes.definitions = [{'modeId': 'container-mode-id-for-properties'}];

                    fakePageStructure.structure.components[0].components[0].modes.overrides = [{
                        modeIds: ['container-mode-id-for-properties'],
                        propertyQuery: 'propertyItem-Fake-ID'
                    }];
                    return fakePageStructure;
                }

                beforeEach(function() {
                    PropertiesSchemas.MockPropertiesType = {allOf: [{properties: {
                        refProp: {"type": ["string", "null"], pseudoType: ['ref']}
                    }}]};
                    setupSiteWithModes.call(this, addPropertiesOverridesToFakeStructure);
                    this.container = getCompPointer(this.ps, 'container-with-modes', this.page1ID);
                });

                it('should serialize and set the Property item under the overrides object, "props" property', function() {
                    var serializedComponent = componentService.serialize(this.ps, this.container, null,
                        this.ignoreChildren, this.maintainIdentifiers, this.flatMobileStructuresMap);

                    var expectedDesignItem = _.first(createFakePropertiesItem());

                    expect(serializedComponent.components[0].modes.overrides[0].propertyQuery).not.toBeDefined();
                    expect(serializedComponent.components[0].modes.overrides[0].props).toEqual(expectedDesignItem);
                });
            });
        });
    });
});
