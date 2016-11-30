define(['lodash',
    'documentServices/component/componentStructureInfo',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/dataModel/dataModel',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (_, /** componentStructureInfo */componentStructureInfo, componentsDefinitionsMap, dataModel, privateServicesHelper) {
    'use strict';

    describe('Component: structure info', function () {
        describe('createComponentDefaultStructureBuilder', function() {
            describe('test method general functionality', function() {
                beforeAll(function() {
                    this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                });

                describe('supported component types', function() {
                    describe('data item', function() {
                        it('should be null if component supports it', function() {
                            var testComponentDefinitions = {
                                "test-component-type": {
                                    "dataTypes": ["test-data-type", ""]
                                }
                            };

                            var defaultCompStructure = componentStructureInfo.createComponentDefaultStructureBuilder(testComponentDefinitions)(this.ps, "test-component-type");
                            expect(defaultCompStructure.componentType).toEqual('test-component-type');
                            expect(defaultCompStructure.data).toBe(null);
                        });

                        it('should be of the first declared data type if null is not supported', function() {
                            spyOn(dataModel, 'createDataItemByType').and.callFake(function(ps, defaultDataItemType) {
                                return {
                                    type: defaultDataItemType
                                };
                            });
                            var testComponentDefinitions = {
                                "test-component-type": {
                                    "dataTypes": ["first-data-type", "second-data-type"]
                                }
                            };

                            var defaultCompStructure = componentStructureInfo.createComponentDefaultStructureBuilder(testComponentDefinitions)(this.ps, "test-component-type");
                            expect(defaultCompStructure.componentType).toEqual('test-component-type');
                            expect(defaultCompStructure.data.type).toBe('first-data-type');
                        });

                        it('should be null if component does not declare any supported data type', function() {
                            var testComponentDefinitions = {
                                "test-component-type": {
                                    "dataTypes": []
                                }
                            };

                            var defaultCompStructure = componentStructureInfo.createComponentDefaultStructureBuilder(testComponentDefinitions)(this.ps, "test-component-type");
                            expect(defaultCompStructure.componentType).toEqual('test-component-type');
                            expect(defaultCompStructure.data).toBe(null);
                        });
                    });

                    describe('property item', function() {
                        it('should be of the defined supported property type', function() {
                            spyOn(dataModel, 'createPropertiesItemByType').and.callFake(function(ps, defaultPropertyItemType) {
                                return {
                                    type: defaultPropertyItemType
                                };
                            });
                            var testComponentDefinitions = {
                                "test-component-type": {
                                    "propertyType": "test-property-type"
                                }
                            };

                            var defaultCompStructure = componentStructureInfo.createComponentDefaultStructureBuilder(testComponentDefinitions)(this.ps, "test-component-type");
                            expect(defaultCompStructure.componentType).toEqual('test-component-type');
                            expect(defaultCompStructure.props.type).toBe('test-property-type');
                        });

                        it('should be undefined if the component does not declare any property type', function() {
                            var testComponentDefinitions = {
                                "test-component-type": {
                                    "propertyType": undefined
                                }
                            };

                            var defaultCompStructure = componentStructureInfo.createComponentDefaultStructureBuilder(testComponentDefinitions)(this.ps, "test-component-type");
                            expect(defaultCompStructure.componentType).toEqual('test-component-type');
                            expect(defaultCompStructure.props).toBe(undefined);
                        });
                    });

                    describe('style', function() {
                        it('should be the first of the defined theme styles', function() {
                            var testComponentDefinitions = {
                                "test-component-type": {
                                    "styles": {
                                        "first-style-id": {},
                                        "second-style-id": {}
                                    }
                                }
                            };

                            var defaultCompStructure = componentStructureInfo.createComponentDefaultStructureBuilder(testComponentDefinitions)(this.ps, "test-component-type");
                            expect(defaultCompStructure.componentType).toEqual('test-component-type');
                            expect(defaultCompStructure.style).toEqual('first-style-id');
                        });

                        it('should be undefined if no theme style is declared', function() {
                            var testComponentDefinitions = {
                                "test-component-type": {
                                    "styles": {}
                                }
                            };

                            var defaultCompStructure = componentStructureInfo.createComponentDefaultStructureBuilder(testComponentDefinitions)(this.ps, "test-component-type");
                            expect(defaultCompStructure.componentType).toEqual('test-component-type');
                            expect(defaultCompStructure.style).toEqual(undefined);
                        });
                    });
                });

                describe('unsupported component types', function() {
                    var compStructureBuilder;
                    beforeAll(function() {
                        compStructureBuilder = componentStructureInfo.createComponentDefaultStructureBuilder({});
                    });
                    it('should throw an error when passing an unrecognized component type', function() {
                        expect(compStructureBuilder.bind(componentStructureInfo, this.ps, 'made-up-type'))
                            .toThrowError('Component type "made-up-type" is not supported');
                    });

                    it('should throw an error when passing a non-string argument as componentType', function() {
                        expect(compStructureBuilder.bind(componentStructureInfo, this.ps))
                            .toThrowError('Must pass componentType as string');

                        expect(compStructureBuilder.bind(componentStructureInfo, this.ps, {}))
                            .toThrowError('Must pass componentType as string');

                        expect(compStructureBuilder.bind(componentStructureInfo, this.ps, null))
                            .toThrowError('Must pass componentType as string');

                        expect(compStructureBuilder.bind(componentStructureInfo, this.ps, 10))
                            .toThrowError('Must pass componentType as string');

                        expect(compStructureBuilder.bind(componentStructureInfo, this.ps, true))
                            .toThrowError('Must pass componentType as string');
                    });
                });
            });

            describe('verify all real componentsDefinitionMap entries are supported', function() {
                beforeAll(function() {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                    this.defaultComponentStructures = _.mapValues(componentsDefinitionsMap, function(compDef, compType) {
                        return componentStructureInfo.createComponentDefaultStructureBuilder(componentsDefinitionsMap)(ps, compType);
                    });
                });

                it('should create default structure with the right type', function() {
                    var areAllTypesInDefaultStructuresCompatible = _.every(componentsDefinitionsMap, function(compDef, compType) {
                        var defaultCompStructure = this.defaultComponentStructures[compType];
                        return defaultCompStructure.componentType === compType;
                    }, this);

                    expect(areAllTypesInDefaultStructuresCompatible).toEqual(true);
                });

                it('should create default structure with the right data item', function() {
                    var areAllDefaultDataItemsCompatible = _.every(componentsDefinitionsMap, function(compDef, compType) {
                        var defaultDataType = _.includes(compDef.dataTypes, '') ? '' : _.first(compDef.dataTypes);
                        var defaultCompStructure = this.defaultComponentStructures[compType];

                        return defaultDataType === '' || defaultDataType === undefined ? defaultCompStructure.data === null : defaultCompStructure.data.type === defaultDataType;
                    }, this);

                    expect(areAllDefaultDataItemsCompatible).toEqual(true);
                });

                it('should create default structure with the right properties item', function() {
                    var areAllDefaultPropertyItemsCompatible = _.every(componentsDefinitionsMap, function(compDef, compType) {
                        var defaultPropertyType = compDef.propertyType;
                        var defaultCompStructure = this.defaultComponentStructures[compType];

                        return defaultPropertyType ? defaultCompStructure.props.type === defaultPropertyType : defaultCompStructure.props === undefined;
                    }, this);

                    expect(areAllDefaultPropertyItemsCompatible).toEqual(true);
                });

                it('should create default structure with the right styleId', function() {
                    var areAllDefaultStyleIdsCompatible = _.every(componentsDefinitionsMap, function(compDef, compType) {
                        var defaultStyleId = _.first(_.keys(compDef.styles));
                        var defaultCompStructure = this.defaultComponentStructures[compType];

                        return defaultCompStructure.style === defaultStyleId;
                    }, this);

                    expect(areAllDefaultStyleIdsCompatible).toEqual(true);
                });
            });
        });
    });
});