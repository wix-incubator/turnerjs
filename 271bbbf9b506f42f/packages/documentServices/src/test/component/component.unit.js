define(['lodash', 'utils',
    'documentServices/dataModel/dataModel',
    'fake!documentServices/anchors/anchors',
    'fake!documentServices/theme/theme',
    'documentServices/constants/constants',
    'documentServices/component/componentValidations',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/structure/structure',
    'documentServices/tpa/services/tpaEventHandlersService',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/dataModel/PropertiesSchemas.json',
    'documentServices/measure/textMeasuring',
    'testUtils',
    'experiment',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/componentModes',
    'documentServices/component/component',
    'documentServices/component/componentStructureInfo',
    'documentServices/component/componentDeprecation'], function
    (_, /** utils*/ utils, dataModel, anchors, theme, constants, componentValidations,
     componentsMetaData,
     structure,
     tpaEventHandlersService,
     componentsDefinitionsMap,
     propertiesSchemas,
     textMeasuring,
     testUtils,
     experiment,
     privateServicesHelper,
     componentModes,
     component,
     componentStructureInfo,
     deprecation) {
    'use strict';

    var openExperiments = testUtils.experimentHelper.openExperiments;

    describe('Document Services - Components API', function () {
        function getMainPageCompRef(privateServices) {
            return privateServices.pointers.components.getPage('mainPage', constants.VIEW_MODES.DESKTOP);
        }

        var mockComponentsDefinitionsMap = _.defaults({
            MockComponentType: {
                dataTypes: ['mockData'],
                propertyType: 'mockProps',
                styles: {
                    'mock-system-style-1': 'wysiwyg.viewer.skins.MockCompSkin'
                }
            }
        }, componentsDefinitionsMap);

        var dataSchemas = {
            mockData: {
                type: 'object',
                properties: {}
            }
        };

        var mockPropertiesSchemas = _.defaults({
            mockProps: {
                type: 'object',
                properties: {}
            }
        }, propertiesSchemas);

        var mocks = {
            'documentServices/dataModel/dataModel': dataModel,
            'documentServices/anchors/anchors': anchors,
            'documentServices/theme/theme': theme,
            'documentServices/component/componentsDefinitionsMap': mockComponentsDefinitionsMap,
            'documentServices/dataModel/DataSchemas.json': dataSchemas,
            'documentServices/dataModel/PropertiesSchemas.json': mockPropertiesSchemas,
            'documentServices/componentsMetaData/componentsMetaData': componentsMetaData,
            'documentServices/tpa/services/tpaEventHandlersService': tpaEventHandlersService,
            'experiment': experiment,
            'documentServices/component/componentStructureInfo': componentStructureInfo,
            'documentServices/component/componentDeprecation': deprecation,
            'utils': utils
        };

        var privateServices;
        var siteData;

        function setupSiteWithModes() {
            siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('mainPage');
            privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            spyOn(privateServices.siteAPI, 'forceUpdate');
            privateServices.dal.addPageWithDefaults('page1', [
                {
                    id: 'container-with-modes',
                    componentType: 'type',
                    components: [{
                        id: 'child-comp',
                        componentType: 'type',
                        dataQuery: '#myQuery',
                        components:[
                            {
                                id: 'inner-child-comp',
                                componentType: 'type'
                            }
                        ]
                    }],
                    modes: {
                        definitions: [{modeId: 'mode-id'}]
                    }
                },
                {
                    id: 'other-container-with-modes',
                    componentType: 'type',
                    modes: {
                        definitions: [{modeId: 'no-meaning-mode-id'}]
                    }
                }]);
            var childDataItem = {
                id: 'myQuery',
                prop1: 'prop1 value',
                prop2: 'prop2 value'
            };

            privateServices.dal.addData(childDataItem, 'page1');
        }

        function getCompPointer(ps, compId, pageId, viewMode) {
            var page = ps.pointers.components.getPage(pageId, viewMode || constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, page);
        }

        function createMockComp(compType, data, properties) {
            var result = testUtils.mockFactory.createCompStructure(compType, data, properties);
            result.compStructure.style = _(componentsDefinitionsMap[compType].styles)
                .keys()
                .first();
            if (data) {
                result.compData.type = _.first(componentsDefinitionsMap[compType].dataTypes);
            }
            if (properties) {
                result.compProps.type = componentsDefinitionsMap[compType].propertyType;
            }
            return result;
        }

        function createValidCompDefinition(compType, data, properties){
            var mockedComp = createMockComp(compType, data, properties);
            return _.assign(mockedComp.compStructure, {
                data: mockedComp.compData,
                props: mockedComp.compProps
            });
        }

        function addModeAndOverride(ps, parentPointer, childPointer) {
            var parentHoverModeId = privateServicesHelper.getOrCreateCompMode(ps, parentPointer, utils.siteConstants.COMP_MODES_TYPES.HOVER);
            var parentDefaultModeId = privateServicesHelper.getOrCreateCompMode(ps, parentPointer, utils.siteConstants.COMP_MODES_TYPES.DEFAULT);

            componentModes.activateComponentMode(ps, parentPointer, parentHoverModeId);
            structure.updateCompLayout(ps, childPointer, {x: 200, y: 300});
            componentModes.activateComponentMode(ps, parentPointer, parentDefaultModeId);
        }

        testUtils.requireWithMocks('documentServices/component/component', mocks, function (componentService) {

            beforeEach(function () {
                siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('mainPage');
                siteData.addMeasureMap();
                privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            describe("Adding component", function () {
                beforeEach(function () {
                    spyOn(anchors, 'updateAnchors');
                    spyOn(dataModel, 'addSerializedDataItemToPage').and.returnValue("dataQuery");
                    spyOn(dataModel, 'addSerializedPropertyItemToPage').and.returnValue("propsQuery");
                    spyOn(dataModel, 'addSerializedStyleItemToPage').and.returnValue("styleID");
                    spyOn(componentsMetaData.public, 'isContainableByStructure').and.returnValue(true);
                });

                describe('addComponentToContainer', function () {
                    describe('isContainableByStructure === true', function () {
                        it("should ensure the component API module exists", function () {
                            expect(componentService).toBeDefined();
                        });

                        it("should be able to add a component to a container", function () {
                            var componentToAdd = {
                                id: "specialComponent",
                                componentType: "MockComponentType", layout: {anchors: []},
                                data: {type: 'mockData'},
                                props: {type: 'mockProps'},
                                style: {color: 'mockColor'}
                            };

                            var pagePointer = getMainPageCompRef(privateServices);
                            var compPointer = componentService.getComponentToAddRef(privateServices, pagePointer, componentToAdd, 'customId');
                            componentService.add(privateServices, compPointer, pagePointer, componentToAdd, 'customId');

                            var comp = privateServices.dal.get(compPointer);
                            expect(comp).toEqual({
                                id: 'customId', componentType: "MockComponentType",
                                layout: {
                                    x: 0,
                                    y: 0,
                                    fixedPosition: false,
                                    width: 160,
                                    height: 90,
                                    anchors: [],
                                    scale: 1.0,
                                    rotationInDegrees: 0.0
                                },
                                dataQuery: '#dataQuery', propertyQuery: 'propsQuery', styleId: 'styleID', type: 'Component'
                            });

                            expect(anchors.updateAnchors).toHaveBeenCalledWith(privateServices, compPointer);
                        });

                        it('should be able to add a component to container without waiting for changes to apply', function () {
                            var pagePointer = getMainPageCompRef(privateServices);
                            var containerToAdd = {
                                id: "specialComponent",
                                components: [],
                                componentType: "MockComponentType", layout: {anchors: []},
                                data: {type: 'mockData'},
                                props: {type: 'mockProps'},
                                style: {color: 'mockColor'}
                            };
                            var containerPointer = componentService.getComponentToAddRef(privateServices, pagePointer, containerToAdd, 'containerId');

                            componentService.add(privateServices, containerPointer, pagePointer, containerToAdd, 'containerId');

                            var componentToAdd = {
                                id: "specialComponent",
                                componentType: "MockComponentType", layout: {anchors: []},
                                data: {type: 'mockData'},
                                props: {type: 'mockProps'},
                                style: {color: 'mockColor'}
                            };
                            var componentPointer = componentService.getComponentToAddRef(privateServices, containerPointer, componentToAdd, 'customId');

                            componentService.add(privateServices, componentPointer, containerPointer, componentToAdd, 'customId');

                            var childrenRefs = privateServices.pointers.components.getChildren(containerPointer);
                            expect(childrenRefs.length).toEqual(1);
                        });

                        it('should be able to add a second component as the first child', function () {
                            var pagePointer = getMainPageCompRef(privateServices);
                            var containerToAdd = {
                                id: "containerComponent",
                                components: [],
                                componentType: "MockComponentType", layout: {anchors: []},
                                data: {type: 'mockData'},
                                props: {type: 'mockProps'},
                                style: {color: 'mockColor'}
                            };
                            var containerPointer = componentService.getComponentToAddRef(privateServices, pagePointer, containerToAdd, 'containerId');
                            componentService.add(privateServices, containerPointer, pagePointer, containerToAdd, 'containerId');
                            var componentToAdd = {
                                id: "first",
                                components: [],
                                componentType: "MockComponentType", layout: {anchors: []},
                                data: {type: 'mockData'},
                                props: {type: 'mockProps'},
                                style: {color: 'mockColor'}
                            };
                            var firstComponentPointer = componentService.getComponentToAddRef(privateServices, containerPointer, componentToAdd, 'first');

                            componentService.add(privateServices, firstComponentPointer, containerPointer, componentToAdd, 'first');
                            var secondComponentPointer = componentService.getComponentToAddRef(privateServices, containerPointer, componentToAdd, 'second');

                            componentService.add(privateServices, secondComponentPointer, containerPointer, componentToAdd, 'second', 0);

                            var childrenRefs = privateServices.pointers.components.getChildren(containerPointer);
                            expect(_.map(childrenRefs, 'id')).toEqual(['second', 'first']);
                        });
                        it('should throw when adding to an invalid index', function () {
                            var pagePointer = getMainPageCompRef(privateServices);
                            var containerToAdd = {
                                id: "containerComponent",
                                components: [],
                                componentType: "MockComponentType", layout: {anchors: []},
                                data: {type: 'mockData'},
                                props: {type: 'mockProps'},
                                style: {color: 'mockColor'}
                            };
                            var containerPointer = componentService.getComponentToAddRef(privateServices, pagePointer, containerToAdd, 'containerId');
                            componentService.add(privateServices, containerPointer, pagePointer, containerToAdd, 'containerId');
                            var componentToAdd = {
                                id: "first",
                                components: [],
                                componentType: "MockComponentType", layout: {anchors: []},
                                data: {type: 'mockData'},
                                props: {type: 'mockProps'},
                                style: {color: 'mockColor'}
                            };
                            var firstComponentPointer = componentService.getComponentToAddRef(privateServices, containerPointer, componentToAdd, 'first');

                            function addToInvalidIndex() {
                                componentService.add(privateServices, firstComponentPointer, containerPointer, componentToAdd, 'first', 1);
                            }
                            expect(addToInvalidIndex).toThrowError(componentValidations.ERRORS.INVALID_CONTAINER_POINTER);
                        });
                        it('should add a first child', function () {
                            var pagePointer = getMainPageCompRef(privateServices);
                            var containerToAdd = {
                                id: "containerComponent",
                                components: [],
                                componentType: "MockComponentType", layout: {anchors: []},
                                data: {type: 'mockData'},
                                props: {type: 'mockProps'},
                                style: {color: 'mockColor'}
                            };
                            var containerPointer = componentService.getComponentToAddRef(privateServices, pagePointer, containerToAdd, 'containerId');
                            componentService.add(privateServices, containerPointer, pagePointer, containerToAdd, 'containerId');
                            var componentToAdd = {
                                id: "first",
                                components: [],
                                componentType: "MockComponentType", layout: {anchors: []},
                                data: {type: 'mockData'},
                                props: {type: 'mockProps'},
                                style: {color: 'mockColor'}
                            };
                            var firstComponentPointer = componentService.getComponentToAddRef(privateServices, containerPointer, componentToAdd, 'first');
                            componentService.add(privateServices, firstComponentPointer, containerPointer, componentToAdd, 'first', 0);
                            var childrenRefs = privateServices.pointers.components.getChildren(containerPointer);
                            expect(_.map(childrenRefs, 'id')).toEqual(['first']);
                        });
                    });

                    describe('isContainableByStructure === false', function () {
                        beforeEach(function () {
                            componentsMetaData.public.isContainableByStructure.and.returnValue(false);
                        });

                        it('should throw exception', function () {
                            var pagePointer = getMainPageCompRef(privateServices);
                            var exceptionMessage = 'invalid container pointer';
                            var componentToAdd = {
                                id: "specialComponent",
                                componentType: "MockComponentType", layout: {anchors: []},
                                data: {type: 'mockData'},
                                props: {type: 'mockProps'},
                                style: {color: 'mockColor'}
                            };

                            var compPointer = componentService.getComponentToAddRef(privateServices, pagePointer, componentToAdd, 'customId');

                            function addUnallowedComponentToCntainer() {
                                componentService.add(privateServices, compPointer, pagePointer, componentToAdd, 'customId');
                            }

                            expect(addUnallowedComponentToCntainer).toThrowError(exceptionMessage);
                        });
                    });
                });

                describe('add component - constrains', function () {
                    beforeEach(function () {
                        this.pagePointer = getMainPageCompRef(privateServices);
                        this.componentToAdd = {
                            id: "specialComponent",
                            componentType: "MockComponentType", layout: {anchors: []},
                            data: {type: 'mockData'},
                            props: {type: 'mockProps'},
                            style: {color: 'mockColor'}
                        };
                        this.componentPointer = componentService.getComponentToAddRef(privateServices, this.pagePointer, this.componentToAdd, 'customId');
                    });

                    describe('constraints validation', function () {

                        function testConstantsThrownError(invalidConstant, errorToBeThrown) {
                            function testValidationFail() {
                                componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, invalidConstant, 'containerId');
                            }

                            expect(testValidationFail.bind(this)).toThrowError(errorToBeThrown);
                        }


                        it('should throw error when constraints has property other then "under"', function () {
                            function testValidationFail() {
                                componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, {invalidProperty: 333}, 'containerId');
                            }
                            expect(testValidationFail.bind(this)).toThrowError('Constrains should be empty {} or have only property "under"');
                        });

                        it('should throw error when constraints is not object or null', function () {
                            var invalidValues = [
                                1111,
                                undefined
                            ];

                            _.forEach(invalidValues, function (value) {
                                testConstantsThrownError.call(this, value, 'Non valid constraints value. Expected null or object');
                            }, this);
                        });

                        it('should throw error when constraints property "under" is not a plain object ', function () {
                            function Foo() {
                                this.a = 1;
                            }

                            var invalidValues = [
                                {under: false},
                                {under: 333},
                                {under: new Foo()}
                            ];

                            _.forEach(invalidValues, function (value) {
                                testConstantsThrownError.call(this, value, 'Constrains "under" property should have plain object value');
                            }, this);
                        });

                        it('should throw error when constraints has invalid format', function () {
                            var invalidValues = [
                                {under: {margin: 3}},
                                {
                                    under: {
                                        margin: 3,
                                        comp: {id: 'sampleId'},
                                        redundantKey: 'redundantValue'
                                    }
                                },
                                {
                                    under: {
                                        comp: {id: 'sampleId'},
                                        redundantKey: 'redundantValue'
                                    }
                                }
                            ];

                            _.forEach(invalidValues, function (value) {
                                testConstantsThrownError.call(this, value, 'Constraints "under" property should has the schema {comp: compRef, margin: number}');
                            }, this);
                        });

                        it('should throw error when given a margin that is not a number', function () {
                            function testValidationFail() {
                                var invalidCostrains = {under: {margin: 'bad number', comp: {id: 'sampleId'}}};
                                componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, invalidCostrains);
                            }

                            expect(testValidationFail.bind(this)).toThrowError('Constrains "margin" should be a number');
                        });

                        it('should not throw when constraints is null', function(){
                            function testValidation() {
                                var constraints = null;
                                componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, constraints);
                            }

                            expect(testValidation.bind(this)).not.toThrow();
                        });

                        it('should not throw when constraints is empty object', function(){
                            function testValidation() {
                                var constraints = {};
                                componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, constraints);
                            }

                            expect(testValidation.bind(this)).not.toThrow();
                        });

                        it('should not throw when constraints is a plain object with the right format', function(){
                            var otherCompPointer = componentService.getComponentToAddRef(privateServices, this.pagePointer, this.componentToAdd);
                            componentService.add(privateServices, otherCompPointer, this.pagePointer, this.componentToAdd);

                            function testValidation() {
                                var constraints = {under: {comp: otherCompPointer, margin: 20}};
                                componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, constraints);
                            }

                            expect(testValidation.bind(this)).not.toThrow();
                        });

                        describe('validation of the comp passed as under constraint', function(){
                            function addComp(definitionOverride){
                                var otherCompDef = _.merge({}, this.componentToAdd, definitionOverride);
                                var otherCompPointer = componentService.getComponentToAddRef(privateServices, this.pagePointer, otherCompDef);

                                componentService.add(privateServices, otherCompPointer, this.pagePointer, otherCompDef);
                                return otherCompPointer;
                            }

                            it('should throw if passed pointer to fixed comp', function(){
                                var otherCompPointer = addComp.call(this, {layout: {fixedPosition: true}});

                                function testValidation() {
                                    var constraints = {under: {comp: otherCompPointer, margin: 20}};
                                    componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, constraints);
                                }

                                expect(testValidation.bind(this)).toThrowError('you cannot place a component below a fixed, rotated, docked and such comps.');
                            });

                            it('should throw if passed pointer to docked comp', function(){
                                var otherCompPointer = addComp.call(this, {layout: {docked: {left: {vw: 1}, right: {vw: 1}}}});

                                function testValidation() {
                                    var constraints = {under: {comp: otherCompPointer, margin: 20}};
                                    componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, constraints);
                                }

                                expect(testValidation.bind(this)).toThrowError('you cannot place a component below a fixed, rotated, docked and such comps.');
                            });

                            it('should throw if passed pointer to rotated comp', function(){
                                var otherCompPointer = addComp.call(this, {layout: {rotationInDegrees: 20}});

                                function testValidation() {
                                    var constraints = {under: {comp: otherCompPointer, margin: 20}};
                                    componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, constraints);
                                }

                                expect(testValidation.bind(this)).toThrowError('you cannot place a component below a fixed, rotated, docked and such comps.');
                            });
                        });
                    });

                    describe('definition and container validations', function(){
                        it('should throw if passed definition of fixed comp', function(){
                            function testValidation() {
                                this.componentToAdd.layout.fixedPosition = true;
                                componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, {});
                            }

                            expect(testValidation.bind(this)).toThrowError('the layout of the added comp should be simple, no fixed, docked, rotated and such');
                        });

                        it('should throw if passed definition of docked comp', function(){
                            function testValidation() {
                                this.componentToAdd.layout.docked = {};
                                componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, {});
                            }

                            expect(testValidation.bind(this)).toThrowError('the layout of the added comp should be simple, no fixed, docked, rotated and such');
                        });

                        it('should throw if passed definition of rotated comp', function(){
                            function testValidation() {
                                this.componentToAdd.layout.rotationInDegrees = 20;
                                componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, {});
                            }

                            expect(testValidation.bind(this)).toThrowError('the layout of the added comp should be simple, no fixed, docked, rotated and such');
                        });

                        it('should fail if container is not a page', function(){
                            var otherCompPointer = componentService.getComponentToAddRef(privateServices, this.pagePointer, this.componentToAdd);
                            componentService.add(privateServices, otherCompPointer, this.pagePointer, this.componentToAdd);

                            function testValidation() {
                                componentService.addWithConstraints(privateServices, this.componentPointer, otherCompPointer, this.componentToAdd, {});
                            }

                            expect(testValidation.bind(this)).toThrowError('this API works only for page parent for now');
                        });
                    });

                    describe('functionality', function(){
                        it('should add comp under another comp', function(){
                            _.merge(this.componentToAdd, {layout: {y: 30, height: 100}});

                            var otherCompPointer = componentService.getComponentToAddRef(privateServices, this.pagePointer, this.componentToAdd);
                            componentService.add(privateServices, otherCompPointer, this.pagePointer, this.componentToAdd);

                            var passedDefinition = _.cloneDeep(this.componentToAdd);

                            var constraints = {under: {comp: otherCompPointer, margin: 20}};
                            componentService.addWithConstraints(privateServices, this.componentPointer, this.pagePointer, this.componentToAdd, constraints);

                            var addedComp = privateServices.dal.get(this.componentPointer);
                            expect(addedComp.layout.y).toBe(150);
                            expect(addedComp.layout.height).toBe(100);

                            expect(this.componentToAdd).toEqual(passedDefinition);
                        });
                    });

                    describe('deprecated', function(){
                        it('should throw when adding to a deprecated component', function () {
                            spyOn(deprecation, 'isComponentDeprecated').and.returnValue(true);
                            spyOn(deprecation, 'getDeprecationMessage').and.returnValue('MockComponentType|use other component');

                            var otherCompPointer = componentService.getComponentToAddRef(privateServices, this.pagePointer, this.componentToAdd);

                            var addDeprecatedComponent = function() {
                                componentService.add(privateServices, otherCompPointer, this.pagePointer, this.componentToAdd);
                            }.bind(this);

                            expect(addDeprecatedComponent).toThrowError('MockComponentType|use other component');
                        });
                    });

                    describe('going to be deprecated', function(){
                        it('should warn in the console when adding a component that is going to be deprecated', function () {
                            spyOn(deprecation, 'shouldWarnForDeprecation').and.returnValue(true);
                            spyOn(utils.log, 'warnDeprecation');
                            privateServices.runtimeConfig = {
                                shouldThrowOnDeprecation: false
                            };

                            var otherCompPointer = componentService.getComponentToAddRef(privateServices, this.pagePointer, this.componentToAdd);
                            componentService.add(privateServices, otherCompPointer, this.pagePointer, this.componentToAdd);

                            expect(utils.log.warnDeprecation).toHaveBeenCalled();
                        });

                        it('should throw error if shouldThrowOnDeprecation is true', function() {
                            spyOn(deprecation, 'shouldWarnForDeprecation').and.returnValue(true);
                            privateServices.runtimeConfig = {
                                shouldThrowOnDeprecation: true
                            };

                            var otherCompPointer = componentService.getComponentToAddRef(privateServices, this.pagePointer, this.componentToAdd);
                            expect(componentService.add.bind(componentService, privateServices, otherCompPointer, this.pagePointer, this.componentToAdd)).toThrow();
                        });

                        it('should NOT throw error if shouldThrowOnDeprecation is false', function() {
                            spyOn(deprecation, 'shouldWarnForDeprecation').and.returnValue(true);
                            privateServices.runtimeConfig = {
                                shouldThrowOnDeprecation: false
                            };

                            var otherCompPointer = componentService.getComponentToAddRef(privateServices, this.pagePointer, this.componentToAdd);
                            expect(componentService.add.bind(componentService, privateServices, otherCompPointer, this.pagePointer, this.componentToAdd)).not.toThrow();
                        });
                    });

                });

                describe('addComponentToContainerAndAdjustLayout', function () {
                    it("should be able to add a component to a container", function () {
                        var componentToAdd = {
                            id: "specialComponent",
                            componentType: "MockComponentType", layout: {anchors: []},
                            data: {type: 'mockData'},
                            props: {type: 'mockProps'},
                            style: {color: 'mockColor'}
                        };

                        var pagePointer = getMainPageCompRef(privateServices);
                        var compPointer = componentService.getComponentToAddRef(privateServices, pagePointer, componentToAdd, 'customId');
                        componentService.addAndAdjustLayout(privateServices, compPointer, pagePointer, componentToAdd, 'customId');
                        var comp = privateServices.dal.get(compPointer);

                        expect(comp).toEqual({
                            id: 'customId', componentType: "MockComponentType",
                            layout: {
                                x: 0,
                                y: 0,
                                fixedPosition: false,
                                width: 160,
                                height: 90,
                                anchors: [],
                                scale: 1.0,
                                rotationInDegrees: 0.0
                            },
                            dataQuery: '#dataQuery', propertyQuery: 'propsQuery', styleId: 'styleID', type: 'Component'
                        });

                        expect(anchors.updateAnchors).not.toHaveBeenCalled();
                    });
                });

                describe('setComponent', function () {

                    var containerDef;

                    beforeEach(function() {
                        containerDef = {
                            "layout": {
                                "width": 800, "height": 700,
                                "x": 100, "y": 100,
                                "fixedPosition": false,
                                "scale": 1.0, "rotationInDegrees": 0.0,
                                "anchors": []
                            },
                            "type": "Container",
                            "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                            "componentType": "mobile.core.components.Container",
                            "components": [],
                            "data": null,
                            "props": null
                        };
                    });

                    it("should be able to set a component to a valid component's path", function () {
                        var containerDefClone = _.cloneDeep(containerDef);
                        containerDefClone.id = "optional-custom-id";

                        var pagePointer = getMainPageCompRef(privateServices);
                        var compRef = componentService.getComponentToAddRef(privateServices, pagePointer, containerDef, "optional-custom-id");
                        componentService.setComponent(privateServices, compRef, pagePointer, containerDef, "optional-custom-id");

                        var comp = privateServices.dal.get(compRef);
                        expect(comp.id).toBe("optional-custom-id");
                        var expectedDefinition = _.omit(containerDefClone, ['data', 'props', 'modes']);
                        expect(comp).toEqual(expectedDefinition);
                    });
                    it("should NOT be able to add a component to an invalid path", function () {
                        var pagePointer = privateServices.pointers.components.getPage('mainPage', constants.VIEW_MODES.MOBILE);
                        var compRef = componentService.getComponentToAddRef(privateServices, pagePointer, containerDef, "optional-custom-id");
                        expect(function () {
                            componentService.addComponent(privateServices, compRef, pagePointer, containerDef, "optional-custom-id");
                        }).toThrow();
                    });
                    it('should omit the custom attribute from the comp definition before saving to the site data', function () {
                        var containerDefClone = _.cloneDeep(containerDef);
                        containerDefClone.id = "optional-custom-id";
                        containerDefClone.custom = {fake: 'fake custom object'};

                        var pagePointer = getMainPageCompRef(privateServices);
                        var compRef = componentService.getComponentToAddRef(privateServices, pagePointer, containerDefClone, "optional-custom-id");
                        componentService.setComponent(privateServices, compRef, pagePointer, containerDefClone, "optional-custom-id");
                        var comp = privateServices.dal.get(compRef);
                        var expectedDefinition = _.omit(containerDefClone, ['data', 'props', 'custom']);
                        expect(comp).toEqual(expectedDefinition);
                    });
                    it('should remove the data from the serialized structure before setting to the dal', function () {
                        var compDefinition = _.cloneDeep(containerDef);
                        compDefinition.id = "someId";
                        compDefinition.data = {type: 'mockData'};
                        compDefinition.props = {type: 'mockProps'};
                        compDefinition.componentType = 'MockComponentType';

                        var pagePointer = getMainPageCompRef(privateServices);
                        var compRef = componentService.getComponentToAddRef(privateServices, pagePointer, compDefinition, "someId");
                        componentService.setComponent(privateServices, compRef, pagePointer, compDefinition, "someId");
                        var comp = privateServices.dal.get(compRef);
                        var expectedDefinition = _.omit(compDefinition, ['data', 'props']);
                        expectedDefinition.dataQuery = '#dataQuery';
                        expectedDefinition.propertyQuery = 'propsQuery';
                        expect(comp).toEqual(expectedDefinition);
                    });
                    it('should create the propertyQuery on the component WITHOUT the #', function () {
                        var componentToAdd = {
                            id: "mockId",
                            componentType: "MockComponentType",
                            layout: {anchors: []},
                            data: {type: 'mockData'},
                            props: {type: 'mockProps'},
                            style: {color: 'mockColor'}
                        };

                        var pagePointer = getMainPageCompRef(privateServices);
                        var compRef = componentService.getComponentToAddRef(privateServices, pagePointer, componentToAdd, 'mockId');
                        componentService.setComponent(privateServices, compRef, pagePointer, componentToAdd);

                        var comp = privateServices.dal.get(compRef);
                        expect(comp.propertyQuery).toBe('propsQuery');

                    });

                    describe('should add the type to the component definition according to the component type', function () {
                        function createComponentDefinition(componentType, skin) {
                            return {
                                "skin": skin || '',
                                "componentType": componentType,
                                id: 'comp'
                            };
                        }

                        it("Component", function () {
                            var componentDefinition = createComponentDefinition("wysiwyg.viewer.components.BgImageStrip", "skins.viewer.bgimagestrip.BgImageStripSkin");
                            componentDefinition.props = {type: 'BgImageStripUnifiedProperties'};

                            var pagePointer = getMainPageCompRef(privateServices);
                            var compRef = componentService.getComponentToAddRef(privateServices, pagePointer, componentDefinition, "optional-custom-id");
                            componentService.setComponent(privateServices, compRef, pagePointer, componentDefinition, "optional-custom-id");

                            var comp = privateServices.dal.get(compRef);
                            expect(comp.type).toEqual("Component");
                        });
                        it("Container", function () {
                            var componentDefinition = createComponentDefinition("mobile.core.components.Container", "wysiwyg.viewer.skins.area.RectangleArea");

                            var pagePointer = getMainPageCompRef(privateServices);
                            var compRef = componentService.getComponentToAddRef(privateServices, pagePointer, componentDefinition, "optional-custom-id");
                            componentService.setComponent(privateServices, compRef, pagePointer, containerDef, "optional-custom-id");

                            var comp = privateServices.dal.get(compRef);
                            expect(comp.type).toEqual("Container");
                        });
                        it("Page", function () {
                            var componentDefinition = createComponentDefinition("mobile.core.components.Page", "wysiwyg.viewer.skins.page.InnerShadowPageSkin");
                            componentDefinition.data = {type: 'Page'};

                            privateServices.dal.addPageWithDefaults('mockPageId');
                            var pagePointer = privateServices.pointers.components.getPage('mockPageId', constants.VIEW_MODES.DESKTOP);

                            componentService.setComponent(privateServices, pagePointer, null, componentDefinition, "optional-custom-id", true);

                            var comp = privateServices.dal.get(pagePointer);
                            expect(comp.type).toEqual("Page");
                        });
                    });

                    describe('when component has modes', function() {

                        beforeEach(function() {
                            this.pagePointer = getMainPageCompRef(privateServices);
                            this.componentToAdd = {
                                id: 'mockId',
                                componentType: 'MockComponentType',
                                layout: {anchors: []},
                                data: {type: 'mockData'},
                                props: {type: 'mockProps'},
                                style: {color: 'mockColor'},
                                modes: {
                                    overrides: []
                                }
                            };
                        });

                        describe('when modes has overrides for design', function() {

                            var MINIMAL_ID_LENGTH = 6;

                            beforeEach(function() {
                                this.componentToAdd.modes.definitions = [{
                                    modeId: 'some-mode-id-for-overriding-design',
                                    type: 'FOO-MODE'
                                }];
                                this.componentToAdd.modes.overrides.push({
                                    modeIds: ['some-mode-id-for-overriding-design'],
                                    design: {
                                        background: null,
                                        key1: 'value1',
                                        key2: 'value2',
                                        type: 'MediaContainerDesignData'
                                    }
                                });
                            });

                            it('should remove the design property from the overrides', function() {
                                var compRef = componentService.getComponentToAddRef(privateServices, this.pagePointer, null);
                                componentService.setComponent(privateServices, compRef, this.pagePointer, this.componentToAdd);

                                var comp = privateServices.dal.full.get(compRef);
                                expect(comp.modes.overrides[0].design).not.toBeDefined();
                            });

                            it('should set a designQuery property on the overrides, referencing the design item on the serialized overrides', function() {
                                var compRef = componentService.getComponentToAddRef(privateServices, this.pagePointer, null);
                                componentService.setComponent(privateServices, compRef, this.pagePointer, this.componentToAdd);

                                var compFromDAL = privateServices.dal.full.get(compRef);
                                var designQueryOnOverrides = compFromDAL.modes.overrides[0].designQuery;
                                expect(designQueryOnOverrides).toBeDefined();
                                expect(designQueryOnOverrides[0]).toEqual('#');

                                var designQueryPointer = privateServices.pointers.data.getDesignItem(designQueryOnOverrides.replace('#', ''), this.pagePointer.id);
                                var overridesDesignItemFromDAL = privateServices.dal.full.get(designQueryPointer);
                                expect(overridesDesignItemFromDAL.id[0]).not.toEqual('#');
                                expect(overridesDesignItemFromDAL.id.length).toBeGreaterThan(MINIMAL_ID_LENGTH);
                                expect(_.omit(overridesDesignItemFromDAL, 'id', 'metaData')).toEqual(this.componentToAdd.modes.overrides[0].design);
                            });
                        });

                        describe('when modes has overrides for style', function() {

                            describe('when style is a system style', function() {

                                beforeEach(function() {
                                    var pageModeID = 'some-mode-id-for-overriding-style';
                                    var modeType = utils.siteConstants.COMP_MODES_TYPES.HOVER;
                                    componentModes.addComponentModeDefinition(privateServices, pageModeID, this.pagePointer, modeType);
                                    this.componentToAdd.modes.overrides.push({
                                        modeIds: ['some-mode-id-for-overriding-style'],
                                        style: 'mock-system-style-1'
                                    }, {
                                        modeIds: ['some-mode-id-for-overriding-style-that-does-not-exist-in-any-ancestor'],
                                        style: 'mock-system-style-2'
                                    });
                                });

                                it('should replace the `style` property with `styleId` on the overrides structure, and keep the system style id', function() {
                                    var compRef = componentService.getComponentToAddRef(privateServices, this.pagePointer, null, 'mockId');
                                    componentService.setComponent(privateServices, compRef, this.pagePointer, this.componentToAdd);

                                    var comp = privateServices.dal.full.get(compRef);
                                    expect(comp.modes.overrides[0].styleId).toEqual('mock-system-style-1');
                                    expect(_.size(comp.modes.overrides)).toEqual(1);
                                });
                            });

                            describe('when the style is a custom style', function() {

                                beforeEach(function() {
                                    var modeType = utils.siteConstants.COMP_MODES_TYPES.SCROLL;
                                    var modeIdOnPage = 'some-mode-id-for-overriding-style';
                                    componentModes.addComponentModeDefinition(privateServices, modeIdOnPage, this.pagePointer, modeType);
                                    this.overridesWithCustomStyle = {
                                        modeIds: ['some-mode-id-for-overriding-style'],
                                        style: {
                                            'id': 'custom-style-id1',
                                            'type': 'TopLevelStyle',
                                            'style': {
                                                'groups': {},
                                                'properties': {
                                                    'alpha-brd': '1',
                                                    'brd': '#FFFFFF',
                                                    'lnw': '1px'
                                                },
                                                'propertiesSource': {
                                                    'brd': 'value',
                                                    'lnw': 'value'
                                                }
                                            },
                                            'componentClassName': 'wysiwyg.viewer.components.mockComponentType',
                                            'pageId': '',
                                            'compId': '',
                                            'styleType': 'custom',
                                            'skin': 'wysiwyg.viewer.skins.mockComponentType.mockSkin'
                                        }
                                    };
                                    this.componentToAdd.modes.overrides.push(this.overridesWithCustomStyle);
                                    dataModel.addSerializedStyleItemToPage.and.returnValue('custom-style-id2');
                                });

                                it('should replace the `style` property with `styleId` on the overrides structure and set ' +
                                    'its value to the new deserialized custom style id set on the theme data', function() {
                                    var compRef = componentService.getComponentToAddRef(privateServices, this.pagePointer, null, 'mockId');
                                    componentService.setComponent(privateServices, compRef, this.pagePointer, this.componentToAdd);

                                    var comp = privateServices.dal.full.get(compRef);
                                    var customStyleId = comp.modes.overrides[0].styleId;
                                    expect(customStyleId).toEqual('custom-style-id2');
                                    expect(dataModel.addSerializedStyleItemToPage).toHaveBeenCalledWith(privateServices, this.componentToAdd.modes.overrides[0].style);
                                    expect(comp.modes.overrides[0].style).not.toBeDefined();
                                });
                            });
                        });
                    });

                    it('should omit the layout.anchors attribute from the comp definition before saving to the site data if exp removeJsonAnchors is OPEN', function () {
                        openExperiments(['removeJsonAnchors']);
                        var containerDefClone = _.cloneDeep(containerDef);
                        containerDefClone.id = "optional-custom-id";
                        var pagePointer = getMainPageCompRef(privateServices);
                        var compRef = componentService.getComponentToAddRef(privateServices, pagePointer, containerDefClone, "optional-custom-id");

                        componentService.setComponent(privateServices, compRef, pagePointer, containerDefClone, "optional-custom-id");

                        var comp = privateServices.dal.get(compRef);
                        expect(comp.layout.anchors).not.toBeDefined();
                    });

                    it('should NOT omit the layout.anchors attribute from the comp definition if exp removeJsonAnchors is closed', function () {
                        var containerDefClone = _.cloneDeep(containerDef);
                        containerDefClone.id = "optional-custom-id";
                        var pagePointer = getMainPageCompRef(privateServices);
                        var compRef = componentService.getComponentToAddRef(privateServices, pagePointer, containerDefClone, "optional-custom-id");

                        componentService.setComponent(privateServices, compRef, pagePointer, containerDefClone, "optional-custom-id");

                        var comp = privateServices.dal.get(compRef);
                        expect(comp.layout.anchors).toBeDefined();
                    });
                });
            });

            describe('deleteComponent', function () {

                beforeEach(function () {
                    this.deleteDataSpy = spyOn(dataModel, 'deleteDataItem').and.callThrough();
                    this.deletePropsSpy = spyOn(dataModel, 'deletePropertiesItem');
                    this.deleteDesignSpy = spyOn(dataModel, 'deleteDesignItem');

                });

                it("should throw if no pointer passed", function () {
                    expect(function () {
                        componentService.deleteComponent(privateServices, null);
                    }).toThrow();
                });

                it("should remove a component from the document", function () {
                    privateServices.dal.addPageWithDefaults('page1', [{id: 'comp', componentType: 'type'}]);
                    var pointer = getCompPointer(privateServices, 'comp', 'page1');
                    expect(privateServices.dal.get(pointer)).toBeDefined();

                    componentService.deleteComponent(privateServices, pointer);
                    expect(privateServices.dal.get(pointer)).toBeUndefined();
                });
                it("should fail to delete the master page", function () {
                    var compReference = privateServices.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                    expect(componentService.deleteComponent.bind(componentService, privateServices, compReference)).toThrow();
                });

                describe('data, behaviours, properties, design', function () {

                    function createPage(overrides) {
                        return _.defaults(overrides || {}, {
                            id: 'comp',
                            dataQuery: 'data',
                            propertyQuery: 'prop',
                            componentType: 'type'
                        });
                    }

                    function addPage(ps, desktopPageDefaults, mobilePageDefaults) {
                        return ps.dal.addPageWithDefaults('page1', desktopPageDefaults, mobilePageDefaults).addData({id: 'data'}, 'page1');
                    }

                    function deleteComponent(ps, viewMode) {
                        var compPointer = getCompPointer(ps, 'comp', 'page1', viewMode);
                        componentService.deleteComponent(ps, compPointer);
                        return compPointer;
                    }

                    function createBehaviours(behavioursId) {
                        return {type: 'ObsoleteBehaviorsList', id: behavioursId, items: JSON.parse('[{"action":"screenIn","name":"SpinIn","delay":0,"duration":1.2,"params":{"cycles":2,"direction":"cw"},"targetId":""}]')};
                    }

                    describe('desktop view', function () {
                        it('should delete data and behaviours (which can not be forked)', function () {
                            var behavioursId = 'behaviorsId';
                            addPage(privateServices, [createPage({behaviorQuery: 'behaviorsId'})])
                                .addBehaviors(createBehaviours(behavioursId), 'page1');
                            var deletedCompPointer = deleteComponent(privateServices);
                            expect(this.deleteDataSpy).toHaveBeenCalledWith(privateServices, deletedCompPointer);
                            var behaviorsPointer = privateServices.pointers.data.getBehaviorsItem('behaviorsId', 'page1');
                            expect(privateServices.dal.isExist(behaviorsPointer)).toBe(false);
                        });

                        it('should not delete page data and properties (temporary fix... sorry... data is deleted in page.js)', function () {
                            privateServices.dal.addPageWithDefaults('page1')
                                .addData({id: 'page1'});
                            var pointer = privateServices.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                            componentService.deleteComponent(privateServices, pointer);
                            expect(this.deleteDataSpy).not.toHaveBeenCalled();
                            expect(this.deletePropsSpy).not.toHaveBeenCalled();
                        });

                        it('should delete design when it is not forked', function () {
                            addPage(privateServices, [createPage({designQuery: 'design'})], [createPage({designQuery: 'design'})])
                                .addDesignItem({id: 'design'}, 'page1');
                            var desktopCompPointer = deleteComponent(privateServices);
                            expect(this.deleteDesignSpy).toHaveBeenCalledWith(privateServices, desktopCompPointer);
                        });

                        it('should delete both desktop and mobile design when it is forked', function () {
                            addPage(privateServices, [createPage({designQuery: 'design1'})], [createPage({designQuery: 'design2'})])
                                .addDesignItem({id: 'design1'}, 'page1')
                                .addDesignItem({id: 'design2'}, 'page1');
                            var mobileCompPointer = getCompPointer(privateServices, 'comp', 'page1', constants.VIEW_MODES.MOBILE);
                            var desktopCompPointer = deleteComponent(privateServices);
                            expect(this.deleteDesignSpy).toHaveBeenCalledWith(privateServices, desktopCompPointer);
                            expect(this.deleteDesignSpy).toHaveBeenCalledWith(privateServices, mobileCompPointer);
                        });

                        it('should delete properties when they are not forked', function () {
                            addPage(privateServices, [createPage()], [createPage()])
                                .addProperties({id: 'prop'}, 'page1');
                            var desktopCompPointer = deleteComponent(privateServices);
                            expect(this.deletePropsSpy).toHaveBeenCalledWith(privateServices, desktopCompPointer);
                        });

                        it('should delete both desktop and mobile properties when they are forked', function () {
                            addPage(privateServices, [createPage({propertyQuery: 'prop1'})], [createPage({propertyQuery: 'prop2'})])
                                .addProperties({id: 'prop1'}, 'page1')
                                .addProperties({id: 'prop2'}, 'page1');
                            var desktopCompPointer = getCompPointer(privateServices, 'comp', 'page1', constants.VIEW_MODES.MOBILE);
                            var mobileCompPointer = deleteComponent(privateServices);
                            expect(this.deletePropsSpy).toHaveBeenCalledWith(privateServices, desktopCompPointer);
                            expect(this.deletePropsSpy).toHaveBeenCalledWith(privateServices, mobileCompPointer);
                        });
                    });

                    describe('mobile view', function () {
                        it('should keep data and behaviours (which can not be forked)', function () {
                            var behavioursId = 'behaviorsId';
                            addPage(privateServices, [createPage({behaviorQuery: behavioursId})], [createPage({behaviorQuery: behavioursId})])
                                .addProperties({id: 'prop'}, 'page1')
                                .addBehaviors(createBehaviours(behavioursId), 'page1');
                            deleteComponent(privateServices, constants.VIEW_MODES.MOBILE);
                            expect(this.deleteDataSpy).not.toHaveBeenCalled();
                            var behaviorsPointer = privateServices.pointers.data.getBehaviorsItem(behavioursId, 'page1');
                            expect(privateServices.dal.isExist(behaviorsPointer)).toBe(true);
                        });

                        it('should keep design when it is not forked', function () {
                            addPage(privateServices, [createPage({designQuery: 'design'})], [createPage({designQuery: 'design'})])
                                .addDesignItem({id: 'design'}, 'page1');
                            deleteComponent(privateServices, constants.VIEW_MODES.MOBILE);
                            expect(this.deleteDesignSpy).not.toHaveBeenCalled();
                        });

                        it('should delete only mobile design if it is forked', function () {
                            addPage(privateServices, [createPage({designQuery: 'design'})], [createPage({designQuery: 'design2'})])
                                .addDesignItem({id: 'design'}, 'page1')
                                .addDesignItem({id: 'design2'}, 'page1');
                            var desktopCompPointer = getCompPointer(privateServices, 'comp', 'page1');
                            var mobileCompPointer = deleteComponent(privateServices, constants.VIEW_MODES.MOBILE);
                            expect(this.deleteDesignSpy).toHaveBeenCalledWith(privateServices, mobileCompPointer);
                            expect(this.deleteDesignSpy).not.toHaveBeenCalledWith(privateServices, desktopCompPointer);
                        });

                        it('should keep properties when they are not forked', function () {
                            addPage(privateServices, [createPage()], [createPage()])
                                .addProperties({id: 'prop'}, 'page1');
                            deleteComponent(privateServices, constants.VIEW_MODES.MOBILE);
                            expect(this.deletePropsSpy).not.toHaveBeenCalled();
                        });

                        it('should delete only mobile properties when they are forked', function () {
                            addPage(privateServices, [createPage({propertyQuery: 'prop1'})], [createPage({propertyQuery: 'prop2'})])
                                .addProperties({id: 'prop1'}, 'page1')
                                .addProperties({id: 'prop2'}, 'page1');
                            var desktopCompPointer = getCompPointer(privateServices, 'comp', 'page1');
                            var mobileCompPointer = deleteComponent(privateServices, constants.VIEW_MODES.MOBILE);
                            expect(this.deletePropsSpy).toHaveBeenCalledWith(privateServices, mobileCompPointer);
                            expect(this.deletePropsSpy).not.toHaveBeenCalledWith(privateServices, desktopCompPointer);
                        });

                    });
                });

                it('should not delete component from full JSON if component is affected by an active mode', function () {
                    setupSiteWithModes();

                    var containerCompPointer = getCompPointer(privateServices, 'container-with-modes', 'page1');
                    var childCompPointer = getCompPointer(privateServices, 'child-comp', 'page1');
                    componentModes.activateComponentMode(privateServices, containerCompPointer, 'mode-id');

                    componentService.deleteComponent(privateServices, childCompPointer);

                    expect(privateServices.dal.isExist(childCompPointer)).toBe(false);
                    expect(privateServices.dal.full.isExist(childCompPointer)).toBe(true);
                });

                it('should delete component from full JSON if there is an active mode but it does not affect the component', function () {
                    setupSiteWithModes();

                    var containerCompPointer = getCompPointer(privateServices, 'container-with-modes', 'page1');
                    var childCompPointer = getCompPointer(privateServices, 'child-comp', 'page1');
                    componentModes.activateComponentMode(privateServices, containerCompPointer, 'no-meaning-mode-id');

                    componentService.deleteComponent(privateServices, childCompPointer);

                    expect(privateServices.dal.isExist(childCompPointer)).toBe(false);
                    expect(privateServices.dal.full.isExist(childCompPointer)).toBe(false);
                });

                it('should delete component from full JSON if its parent was deleted from full JSON', function () {
                    setupSiteWithModes();

                    var containerCompPointer = getCompPointer(privateServices, 'container-with-modes', 'page1');
                    var childCompPointer = getCompPointer(privateServices, 'child-comp', 'page1');
                    componentModes.activateComponentMode(privateServices, containerCompPointer, 'mode-id');

                    componentService.deleteComponent(privateServices, containerCompPointer);

                    expect(privateServices.dal.isExist(childCompPointer)).toBe(false);
                    expect(privateServices.dal.full.isExist(childCompPointer)).toBe(false);
                });

                it('should not delete component from full JSON if its parent was not deleted from full JSON', function () {
                    setupSiteWithModes();

                    var containerCompPointer = getCompPointer(privateServices, 'container-with-modes', 'page1');
                    var childCompPointer = getCompPointer(privateServices, 'child-comp', 'page1');
                    var innerChildCompPointer = getCompPointer(privateServices, 'inner-child-comp', 'page1');

                    componentModes.activateComponentMode(privateServices, containerCompPointer, 'mode-id');

                    componentService.deleteComponent(privateServices, childCompPointer);

                    expect(privateServices.dal.isExist(innerChildCompPointer)).toBe(false);
                    expect(privateServices.dal.full.isExist(innerChildCompPointer)).toBe(true);
                });
            });

            describe("deleteDesktopComponent", function () {
                function createCallbackAggregator(numberOfCallbacks, done) {
                    var callbacksCalledCount = 0;
                    return function () {
                        callbacksCalledCount++;
                        if (callbacksCalledCount === numberOfCallbacks) {
                            done();
                        }
                    };
                }

                it("should call delete handler", function (done) {
                    privateServices.dal.addPageWithDefaults('page1', [{
                        id: 'tpa',
                        componentType: 'tpa.viewer.components.tpapps.TPAWidget'
                    }]);
                    var pointer = getCompPointer(privateServices, 'tpa', 'page1');
                    var callbacksAggregator = createCallbackAggregator(2, done);
                    var deleteCallback = callbacksAggregator;
                    var completeCallback = callbacksAggregator;
                    tpaEventHandlersService.registerDeleteCompHandler(pointer.id, deleteCallback);

                    componentService.remove(privateServices, pointer, completeCallback);
                });

                it('should not delete component from full JSON and keep data and properties items if component is affected by an active mode', function () {
                    setupSiteWithModes();

                    var containerCompPointer = getCompPointer(privateServices, 'container-with-modes', 'page1');
                    var childCompPointer = getCompPointer(privateServices, 'child-comp', 'page1');
                    var childComp = privateServices.dal.get(childCompPointer);
                    var pageId = privateServices.pointers.components.getPageOfComponent(childCompPointer).id;
                    var dataPointer = privateServices.pointers.data.getDataItem(childComp.dataQuery.replace('#', ''), pageId);
                    componentModes.activateComponentMode(privateServices, containerCompPointer, 'mode-id');

                    componentService.remove(privateServices, childCompPointer, jasmine.createSpy('removeCompleteCallback'));

                    var dataItem = privateServices.dal.get(dataPointer);
                    expect(privateServices.dal.isExist(childCompPointer)).toBe(false);
                    expect(privateServices.dal.full.isExist(childCompPointer)).toBe(true);
                    expect(dataItem).toBeDefined();
                });

                it('should delete component from full JSON if there is an active mode but it does not affect the component', function () {
                    setupSiteWithModes();

                    var containerCompPointer = getCompPointer(privateServices, 'container-with-modes', 'page1');
                    var childCompPointer = getCompPointer(privateServices, 'child-comp', 'page1');
                    componentModes.activateComponentMode(privateServices, containerCompPointer, 'no-meaning-mode-id');

                    componentService.deleteComponent(privateServices, childCompPointer);

                    expect(privateServices.dal.isExist(childCompPointer)).toBe(false);
                    expect(privateServices.dal.full.isExist(childCompPointer)).toBe(false);
                });

                it('should call completeCallback when removing component from mode', function () {
                    setupSiteWithModes();
                    var completeCallback = jasmine.createSpy('removeCompleteCallback');

                    var containerCompPointer = getCompPointer(privateServices, 'container-with-modes', 'page1');
                    var childCompPointer = getCompPointer(privateServices, 'child-comp', 'page1');
                    componentModes.activateComponentMode(privateServices, containerCompPointer, 'mode-id');

                    componentService.remove(privateServices, childCompPointer, completeCallback);

                    expect(completeCallback).toHaveBeenCalled();

                });
            });
        });

        describe('duplicate component', function () {
            beforeEach(function () {
                var pages = {
                    myPage: {}
                };
                var pageId = 'myPage';
                this.siteData = privateServicesHelper.getSiteDataWithPages(pages);

                var childComponent = createMockComp('wysiwyg.viewer.components.SliderGallery', {dataKey: 'dataVal-child'}, {propKey: 'propVal-child'});
                var grandChildComponent = createMockComp('wysiwyg.viewer.components.SliderGallery', {dataKey: 'dataVal-grandchild'}, {propKey: 'propVal-grandchild'});
                var childContainer = createMockComp('mobile.core.components.Container');
                var topContainer = createMockComp('mobile.core.components.Container');

                childContainer.compStructure.components = [grandChildComponent.compStructure];
                topContainer.compStructure.components = [childContainer.compStructure, childComponent.compStructure];

                testUtils.mockFactory.addCompToPage(this.siteData, pageId, topContainer.compStructure);
                this.siteData.addData(childComponent.compData, pageId);
                this.siteData.addData(grandChildComponent.compData, pageId);
                this.siteData.addProperties(childComponent.compProps, pageId);
                this.siteData.addProperties(grandChildComponent.compProps, pageId);

                this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                spyOn(this.ps.siteAPI, 'forceUpdate');
                //constants.COMP_MODES.TYPES
                this.childComponent = getCompPointer(this.ps, childComponent.compStructure.id, pageId);
                this.grandChildComponent = getCompPointer(this.ps, grandChildComponent.compStructure.id, pageId);
                this.childContainer = getCompPointer(this.ps, childContainer.compStructure.id, pageId);
                this.topContainer = getCompPointer(this.ps, topContainer.compStructure.id, pageId);
                this.pagePointer = this.ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);

                addModeAndOverride(this.ps, this.topContainer, this.grandChildComponent);
                addModeAndOverride(this.ps, this.topContainer, this.childComponent);
                addModeAndOverride(this.ps, this.childContainer, this.grandChildComponent);
            });

            describe('simple component', function () {
                it('should assign new id to component', function () {
                    var compToDuplicatePointer = component.getComponentToDuplicateRef(this.ps, this.grandChildComponent, this.pagePointer);

                    component.duplicate(this.ps, compToDuplicatePointer, this.grandChildComponent, this.pagePointer);

                    var duplicatedComp = this.ps.dal.get(compToDuplicatePointer);
                    expect(duplicatedComp.id).not.toEqual(this.grandChildComponent.id);
                });

                it('should assign new data item and properties item ids', function () {
                    var compToDuplicatePointer = component.getComponentToDuplicateRef(this.ps, this.grandChildComponent, this.pagePointer);
                    var originalComp = this.ps.dal.get(this.grandChildComponent);

                    component.duplicate(this.ps, compToDuplicatePointer, this.grandChildComponent, this.pagePointer);

                    var duplicatedComp = this.ps.dal.get(compToDuplicatePointer);

                    expect(duplicatedComp.dataQuery).toBeDefined();
                    expect(originalComp.dataQuery).not.toEqual(duplicatedComp.dataQuery);
                    expect(duplicatedComp.propertyQuery).toBeDefined();
                    expect(originalComp.propertyQuery).not.toEqual(duplicatedComp.propertyQuery);
                });

                it('should duplicate it from the displayed json - without overrides', function () {
                    var compToDuplicatePointer = component.getComponentToDuplicateRef(this.ps, this.grandChildComponent, this.pagePointer);
                    var originalCompStructure = this.ps.dal.full.get(this.grandChildComponent);

                    component.duplicate(this.ps, compToDuplicatePointer, this.grandChildComponent, this.pagePointer);

                    var duplicatedComp = this.ps.dal.full.get(compToDuplicatePointer);
                    expect(originalCompStructure.modes.overrides.length).toEqual(2);
                    expect(_.get(duplicatedComp.modes, 'overrides')).toBeEmpty();
                });
            });

            describe('container with children', function () {
                it('should assign new ids to all children', function () {
                    var compToDuplicatePointer = component.getComponentToDuplicateRef(this.ps, this.childContainer, this.pagePointer);

                    component.duplicate(this.ps, compToDuplicatePointer, this.childContainer, this.pagePointer);

                    var duplicatedComp = this.ps.dal.get(compToDuplicatePointer);
                    expect(duplicatedComp.id).not.toEqual(this.grandChildComponent.id);
                    expect(duplicatedComp.components[0].id).not.toEqual(this.grandChildComponent.id);
                });

                describe('when container has modes', function () {
                    it('should remove any overrides from children that refer to a container outside the duplicated one', function () {
                        var compToDuplicatePointer = component.getComponentToDuplicateRef(this.ps, this.childContainer, this.pagePointer);

                        component.duplicate(this.ps, compToDuplicatePointer, this.childContainer, this.pagePointer);

                        var duplicatedComp = this.ps.dal.full.get(compToDuplicatePointer);
                        var duplicatedChild = duplicatedComp.components[0];
                        expect(duplicatedChild.modes.overrides.length).toEqual(1);
                    });

                    it('should replace modes ids for duplicated component and children ', function () {
                        var compToDuplicatePointer = component.getComponentToDuplicateRef(this.ps, this.topContainer, this.pagePointer);

                        component.duplicate(this.ps, compToDuplicatePointer, this.topContainer, this.pagePointer);

                        var originalContainer = this.ps.dal.full.get(this.topContainer);
                        var originalChildContainer = _.find(originalContainer.components, 'components');
                        var duplicatedContainer = this.ps.dal.full.get(compToDuplicatePointer);
                        var duplicatedChildContainer = _.find(duplicatedContainer.components, 'components');
                        var duplicatedContainerModeId = duplicatedContainer.modes.definitions[0].modeId;
                        var duplicatedChildContainerModeId = duplicatedChildContainer.modes.definitions[0].modeId;

                        expect(duplicatedContainerModeId).not.toEqual(originalContainer.modes.definitions[0].modeId);
                        expect(duplicatedChildContainerModeId).not.toEqual(originalChildContainer.modes.definitions[0].modeId);
                    });

                    it('should update relevant overrides with the new mode ids', function () {
                        var compToDuplicatePointer = component.getComponentToDuplicateRef(this.ps, this.topContainer, this.pagePointer);

                        component.duplicate(this.ps, compToDuplicatePointer, this.topContainer, this.pagePointer);

                        var duplicatedContainer = this.ps.dal.full.get(compToDuplicatePointer);
                        var duplicatedChild = _.find(duplicatedContainer.components, 'propertyQuery');
                        var duplicatedChildContainer = _.find(duplicatedContainer.components, 'components');
                        var duplicatedGrandchild = _.find(duplicatedChildContainer.components, 'propertyQuery');
                        var duplicatedContainerModeId = duplicatedContainer.modes.definitions[0].modeId;

                        expect(duplicatedChild.modes.overrides[0].modeIds).toEqual([duplicatedContainerModeId]);
                        expect(duplicatedGrandchild.modes.overrides[0].modeIds).toEqual([duplicatedContainerModeId]);
                        expect(duplicatedGrandchild.modes.overrides[1].modeIds).toEqual([duplicatedChildContainer.modes.definitions[0].modeId]);
                    });
                });
            });
        });

        describe('add component - removeJsonAnchors exp', function(){
            beforeEach(function(){
                openExperiments('removeJsonAnchors');
                var pages = {
                    myPage: {}
                };
                var pageId = 'myPage';
                this.siteData = privateServicesHelper.getSiteDataWithPages(pages);
                this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                this.compToAdd = createValidCompDefinition('wysiwyg.viewer.components.SliderGallery', {dataKey: 'dataVal-child'}, {propKey: 'propVal-child'});
                this.containerToAdd = createValidCompDefinition('mobile.core.components.Container');
                this.pagePointer = getCompPointer(this.ps, pageId, pageId);
            });

            describe('component with anchors', function(){
                it('should delete anchors from component definition', function(){
                    var compToAddPointer = component.getComponentToAddRef(this.ps, this.pagePointer, this.compToAdd);
                    var compLayoutPointer = this.ps.pointers.getInnerPointer(compToAddPointer, 'layout');
                    this.compToAdd.layout.anchors = [{type: 'BOTTOM_TOP'}];

                    component.add(this.ps, compToAddPointer, this.pagePointer, this.compToAdd);

                    var addedCompLayout = this.ps.dal.get(compLayoutPointer);
                    expect(addedCompLayout).toBeDefined();
                    expect(addedCompLayout.anchors).not.toBeDefined();
                });
            });

            describe('component without anchors', function(){
                it('should not add anchors to the definition', function(){
                    var compToAddPointer = component.getComponentToAddRef(this.ps, this.pagePointer, this.compToAdd);
                    var compLayoutPointer = this.ps.pointers.getInnerPointer(compToAddPointer, 'layout');
                    delete this.compToAdd.layout.anchors;

                    component.add(this.ps, compToAddPointer, this.pagePointer, this.compToAdd);

                    var addedCompLayout = this.ps.dal.get(compLayoutPointer);
                    expect(addedCompLayout).toBeDefined();
                    expect(addedCompLayout.anchors).not.toBeDefined();
                });
            });

            describe('container with children', function(){
                it('should remove anchors recursivly from all children', function(){
                    this.compToAdd.layout.anchors = [{type: 'BOTTOM_PARENT'}];
                    this.containerToAdd.components = [
                        this.compToAdd
                    ];
                    this.containerToAdd.layout.anchors = [{type: 'BOTTOM_TOP'}];
                    var containerToAddPointer = component.getComponentToAddRef(this.ps, this.pagePointer, this.containerToAdd);
                    var containerLayoutPointer = this.ps.pointers.getInnerPointer(containerToAddPointer, 'layout');

                    component.add(this.ps, containerToAddPointer, this.pagePointer, this.containerToAdd);

                    var addedContainerLayout = this.ps.dal.get(containerLayoutPointer);
                    var childCompPointer = this.ps.pointers.components.getChildren(containerToAddPointer)[0];
                    var childLayoutPointer = this.ps.pointers.getInnerPointer(childCompPointer, 'layout');
                    var childLayout = this.ps.dal.get(childLayoutPointer);

                    expect(addedContainerLayout).toBeDefined();
                    expect(addedContainerLayout.anchors).not.toBeDefined();
                    expect(childLayout).toBeDefined();
                    expect(childLayout.anchors).not.toBeDefined();
                });
            });
        });

        describe('add component - behaviors', function(){
            function addComponent(mockSiteData, pageId, behaviors) {
                var compType = 'mobile.core.components.Container';
                var compStructure = testUtils.mockFactory.mockComponent(compType, mockSiteData, pageId, {behaviors: behaviors});
                compStructure.styleId = 'c1';
                return compStructure;
            }

            function buildSiteDataWithComponentWithBehaviors() {
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                this.originalCompBehaviors = '[]';
                var pageId = mockSiteData.getCurrentUrlPageId();
                var compStructure = addComponent(mockSiteData, pageId, this.originalCompBehaviors);
                this.originalBehaviorQuery = compStructure.behaviorQuery;
                this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                this.pagePointer = this.ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                this.compPointer = this.ps.pointers.components.getComponent(compStructure.id, this.pagePointer);
            }

            it('should create a new behaviors item with the same items value and set its query to component behaviorQuery', function(){
                    buildSiteDataWithComponentWithBehaviors.call(this, true);
                    var serializedComponent = component.serialize(this.ps, this.compPointer);
                    var compToAddRef = component.getComponentToAddRef(this.ps, this.pagePointer, serializedComponent);

                    component.add(this.ps, compToAddRef, this.pagePointer, serializedComponent);

                    var addedComponent = this.ps.dal.get(compToAddRef);
                    expect(dataModel.getBehaviorsItem(this.ps, compToAddRef)).toEqual(this.originalCompBehaviors);
                    expect(addedComponent.behaviorQuery).not.toEqual(this.originalBehaviorQuery);
                    expect(addedComponent.behaviorQuery).toBeDefined();
                    expect(addedComponent.behaviors).toBeUndefined();
                });

            it('should set behaviorQuery to be a new item id if maintainIdentifiers=true', function() {
                    var dataItemPointer = null;
                    var ignoreChildren = false;
                    var maintainIdentifiers = true;
                    buildSiteDataWithComponentWithBehaviors.call(this, true);
                    var serializedComponent = component.serialize(this.ps, this.compPointer, dataItemPointer, ignoreChildren, maintainIdentifiers);
                    var compToAddRef = component.getComponentToAddRef(this.ps, this.pagePointer, serializedComponent);

                    component.add(this.ps, compToAddRef, this.pagePointer, serializedComponent);

                    var addedComponent = this.ps.dal.get(compToAddRef);
                    expect(dataModel.getBehaviorsItem(this.ps, compToAddRef)).toEqual(this.originalCompBehaviors);
                    expect(addedComponent.behaviorQuery).not.toEqual(this.originalBehaviorQuery);
                    expect(addedComponent.behaviors).toBeUndefined();
                });

            it('should be tolerant to serialized behaviors of the old format', function(){
                    var mockSiteData = testUtils.mockFactory.mockSiteData();
                    var compBehaviors = '[]';
                    var pageId = mockSiteData.getCurrentUrlPageId();
                    var compStructure = addComponent(mockSiteData, pageId, compBehaviors);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                    var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                    var compPointer = ps.pointers.components.getComponent(compStructure.id, pagePointer);
                    var serializedCompBeforeBehaviorsMigration = component.serialize(ps, compPointer);
                    var compToAddRef = component.getComponentToAddRef(ps, pagePointer, serializedCompBeforeBehaviorsMigration);

                    component.add(ps, compToAddRef, pagePointer, serializedCompBeforeBehaviorsMigration);

                    var addedComponent = ps.dal.get(compToAddRef);
                    expect(dataModel.getBehaviorsItem(ps, compToAddRef)).toEqual(compBehaviors);
                    expect(addedComponent.behaviorQuery).not.toEqual(compBehaviors);
                    expect(addedComponent.behaviorQuery).toBeDefined();
                    expect(addedComponent.behaviors).toBeUndefined();
                });
        });

        describe('add component - connections', function(){
            function addComponentToPage(mockSiteData, pageId, connections) {
                var compType = 'mobile.core.components.Container';
                var compDataObj = connections ? {connections: connections} : {};
                var compStructure = testUtils.mockFactory.mockComponent(compType, mockSiteData, pageId, compDataObj);
                compStructure.styleId = 'c1';
                return compStructure;
            }

            beforeEach(function(){
                testUtils.experimentHelper.openExperiments('connectionsData');
                this.mockSiteData = testUtils.mockFactory.mockSiteData().addConnectionsDataMap();
                this.pageId = this.mockSiteData.getCurrentUrlPageId();

                addAppControllerComponentToSiteData.call(this);
            });

            function addAppControllerComponentToSiteData() {
                var data = testUtils.mockFactory.dataMocks.controllerData();
                var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.mockSiteData, this.pageId, {data: data});
                var controllerRef = {id: controller.id, type: constants.VIEW_MODES.DESKTOP};
                var connections = [testUtils.mockFactory.connectionMocks.dsConnectionItem(controllerRef, 'someRole')];
                this.originalCompConnections = testUtils.mockFactory.connectionMocks.connectionList(connections);
                this.compStructure = addComponentToPage(this.mockSiteData, this.pageId, this.originalCompConnections.items);

                this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
            }

            it('should create a new connections item with the same items value and set its query to component connectionQuery', function(){
                var pagePointer = this.ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var originalConnectionQuery = this.compStructure.connectionQuery;
                var compWithConnectionsPointer = this.ps.pointers.components.getComponent(this.compStructure.id, pagePointer);
                var serializedComponent = component.serialize(this.ps, compWithConnectionsPointer);
                var compToAddRef = component.getComponentToAddRef(this.ps, pagePointer, serializedComponent);

                component.add(this.ps, compToAddRef, pagePointer, serializedComponent);

                var addedComponent = this.ps.dal.get(compToAddRef);
                expect(dataModel.getConnectionsItem(this.ps, compToAddRef)).toEqual(this.originalCompConnections.items);
                expect(addedComponent.connectionQuery).not.toEqual(originalConnectionQuery);
                expect(addedComponent.connectionQuery).toBeDefined();
            });

            it('should set connectionQuery to be a new item id if when serializing with maintainIdentifiers=true', function(){
                var pagePointer = this.ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var originalConnectionQuery = this.compStructure.connectionQuery;
                var compWithConnectionsPointer = this.ps.pointers.components.getComponent(this.compStructure.id, pagePointer);
                var serializedComponent = component.serialize(this.ps, compWithConnectionsPointer, null, null, true);
                var compToAddRef = component.getComponentToAddRef(this.ps, pagePointer, serializedComponent);

                component.add(this.ps, compToAddRef, pagePointer, serializedComponent);

                var addedComponent = this.ps.dal.get(compToAddRef);
                expect(dataModel.getConnectionsItem(this.ps, compToAddRef)).toEqual(this.originalCompConnections.items, this.ps, pagePointer);
                expect(addedComponent.connectionQuery).not.toEqual(originalConnectionQuery);
            });

            it('should set connectionQuery to be a new item id if when serializing with maintainIdentifiers=false', function(){
                var pagePointer = this.ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var originalConnectionQuery = this.compStructure.connectionQuery;
                var compWithConnectionsPointer = this.ps.pointers.components.getComponent(this.compStructure.id, pagePointer);
                var serializedComponent = component.serialize(this.ps, compWithConnectionsPointer);
                var compToAddRef = component.getComponentToAddRef(this.ps, pagePointer, serializedComponent);

                component.add(this.ps, compToAddRef, pagePointer, serializedComponent);

                var addedComponent = this.ps.dal.get(compToAddRef);
                expect(dataModel.getConnectionsItem(this.ps, compToAddRef)).toEqual(this.originalCompConnections.items);
                expect(addedComponent.connectionQuery).not.toEqual(originalConnectionQuery);
            });

            it('should not add connectionQuery to the added component in case the serialized data did not contain any connections', function(){
                var compStructure = addComponentToPage(this.mockSiteData, this.pageId);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                var pagePointer = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var compWithoutConnectionsPointer = ps.pointers.components.getComponent(compStructure.id, pagePointer);
                var serializedComponent = component.serialize(ps, compWithoutConnectionsPointer);
                var compToAddRef = component.getComponentToAddRef(ps, pagePointer, serializedComponent);

                component.add(ps, compToAddRef, pagePointer, serializedComponent);

                var addedComponent = ps.dal.get(compToAddRef);
                expect(dataModel.getConnectionsItem(ps, compToAddRef)).toBeNull();
                expect(addedComponent.connectionQuery).toBeUndefined();
            });
        });
    });
});
