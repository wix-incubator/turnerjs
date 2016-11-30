define([
    'lodash',
    'utils',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (_, utils, testUtils, privateServicesHelper) {
    'use strict';
    describe('compPropValidator', function () {
        var definitionMap = testUtils.mockFactory.dataMocks.schemas.componentDefinitionBuilder()
            .setDefaultPropertiesType('DefaultProperties')
            .addComponent('noPropertiesType')
            .addComponent('singlePropertyType', null, 'testType')
            .addComponent('singlePropertyTypes', null, ['testType'])
            .addComponent('multiplePropertyTypes', null, ['testType', 'otherTestType'])
            .addComponent('allTypes', null, [''])
            .build();

        var propertiesSchema = testUtils.mockFactory.dataMocks.schemas.jsonSchemaBuilder()
            .addSchema('testType', {title: 'string'}, null, {title: true})
            .addSchema('otherTestType', {barvaz: 'string', oger: 'string'})
            .addSchema('DefaultProperties', {})
            .build();

        var mocks = {
            'documentServices/component/componentsDefinitionsMap': definitionMap,
            'documentServices/dataModel/PropertiesSchemas.json': propertiesSchema
        };

        testUtils.requireWithMocks('documentServices/validation/validators/compPropValidator', mocks, function (compPropValidator) {
            describe('validateProperties(componentType, properties)', function(){
                it('should fail if componentType has no definition', function () {
                    expect(function () {
                        compPropValidator.validateProperties('notExistType');
                    }).toThrow(new Error('notExistType has no component definition.'));
                });

                it('should fail if componentType has propertyType definition and compProp is not defined', function () {
                    expect(function () {
                        compPropValidator.validateProperties('singlePropertyType');
                    }).toThrow(new Error('singlePropertyType must get a compProps of one of the types [testType]'));
                });

                it('should fail if componentType has propertyType definition and compProp is not of that type', function () {
                    expect(function () {
                        compPropValidator.validateProperties('singlePropertyType', {type: 'otherType'});
                    }).toThrow(new Error('singlePropertyType must get a compProps of one of the types [testType] but got otherType'));
                });

                it('should pass if componentType has propertyType definition and compProp is of that type', function () {
                    expect(function () {
                        compPropValidator.validateProperties('singlePropertyType', {type: 'testType'});
                    }).not.toThrow();
                });

                it('should fail if the componentType has propertyType and compProps is of the default type', function () {
                    expect(function () {
                        compPropValidator.validateProperties('singlePropertyType', {type: utils.constants.BASE_PROPS_SCHEMA_TYPE});
                    }).toThrow(new Error('singlePropertyType must get a compProps of one of the types [testType] but got ' + utils.constants.BASE_PROPS_SCHEMA_TYPE));
                });

                it('should pass if the componentType has no propertyType definition and compProps is undefined', function () {
                    expect(function () {
                        compPropValidator.validateProperties('noPropertiesType');
                    }).not.toThrow();
                });

                it('should pass if the componentType has no propertyType definition and compProps is the default type', function () {
                    expect(function () {
                        compPropValidator.validateProperties('noPropertiesType', {type: utils.constants.BASE_PROPS_SCHEMA_TYPE});
                    }).not.toThrow();
                });

                it('should fail if the componentType has no propertyType definition and compProps is not the default type', function () {
                    expect(function () {
                        compPropValidator.validateProperties('noPropertiesType', {type: 'invalidType'});
                    }).toThrow(new Error('noPropertiesType must get a compProps of one of the types [' + utils.constants.BASE_PROPS_SCHEMA_TYPE + '] but got invalidType'));
                });

                it('should fail if the componentType has propertyTypes and compProps is undefined', function () {
                    expect(function () {
                        compPropValidator.validateProperties('multiplePropertyTypes');
                    }).toThrow(new Error('multiplePropertyTypes must get a compProps of one of the types [testType,otherTestType]'));
                });

                it('should fail if the componentType has propertyTypes and compProps is of the default type', function () {
                    expect(function () {
                        compPropValidator.validateProperties('multiplePropertyTypes', {type: utils.constants.BASE_PROPS_SCHEMA_TYPE});
                    }).toThrow(new Error('multiplePropertyTypes must get a compProps of one of the types [testType,otherTestType] but got ' + utils.constants.BASE_PROPS_SCHEMA_TYPE));
                });

                it('should fail if the componentType has propertyTypes and compProps is not one of them', function () {
                    expect(function () {
                        compPropValidator.validateProperties('multiplePropertyTypes', {type: 'invalidType'});
                    }).toThrow(new Error('multiplePropertyTypes must get a compProps of one of the types [testType,otherTestType] but got invalidType'));
                });

                it('should pass if the componentType has propertyTypes and compProps is one of them', function () {
                    expect(function () {
                        _.forEach(definitionMap.multiplePropertyTypes.propertyTypes, function (type) {
                            compPropValidator.validateProperties('multiplePropertyTypes', {type: type});
                        });
                    }).not.toThrow();
                });

                it('should pass if the componentType has empty string in the propertyTypes and the compProp is not empty', function () {
                    expect(function () {
                        compPropValidator.validateProperties('allTypes', {type: 'invalidType'});
                    }).not.toThrow();
                });

                it('should fail if the compProps is with the right type but not according to the schema', function () {
                    var expectedError = new Error(JSON.stringify([{message: 'should be string', dataPath: '.title', keyword: 'type', schemaPath: '#/properties/title/type'}]));
                    expect(function () {
                        compPropValidator.validateProperties('singlePropertyType', {type: 'testType', title: 5});
                    }).toThrow(expectedError);
                });

                it('should fail if the compProps is with the right type but not according to the schema (multiple types)', function () {
                    expect(function () {
                        compPropValidator.validateProperties('multiplePropertyTypes', {type: 'otherTestType', barvaz: 5});
                    }).toThrow(new Error(JSON.stringify([{message: 'should be string', dataPath: '.barvaz', keyword: 'type', schemaPath: '#/properties/barvaz/type'}])));

                    expect(function () {
                        compPropValidator.validateProperties('multiplePropertyTypes', {type: 'testType', title: true});
                    }).toThrow(new Error(JSON.stringify([{message: 'should be string', dataPath: '.title', keyword: 'type', schemaPath: '#/properties/title/type'}])));
                });

                it('should pass if the compProps is a string that equals a valid type name', function () {
                    expect(function () {
                        compPropValidator.validateProperties('singlePropertyType', 'testType');
                    }).not.toThrow();
                });

                it("should pass if the compProps is a string that equals the default type name and the component has no types in it's definition", function () {
                    expect(function () {
                        compPropValidator.validateProperties('noPropertiesType', utils.constants.BASE_PROPS_SCHEMA_TYPE);
                    }).not.toThrow();
                });
            });
            describe('validateCompProps(ps, compPointer)', function(){
                it('should resolve to validateProperties internally and throw if invalid', function(){
                    var mockSiteData = testUtils.mockFactory.mockSiteData()
                        .addDesktopComps([{
                            id: 'mock-comp-id',
                            propertyQuery: 'mock-props-id',
                            componentType: 'singlePropertyType',
                            layout: {}
                        }], 'masterPage')
                        .addProperties({
                            id: 'mock-props-id',
                            type: 'otherTestType' //INVALID test type for singlePropertyType
                        }, 'masterPage');

                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);

                    var masterPagePointer = ps.pointers.components.getPage('masterPage', 'DESKTOP');
                    var compPointer = ps.pointers.components.getComponent('mock-comp-id', masterPagePointer);

                    expect(function(){
                        compPropValidator.validateCompProps(ps, compPointer);
                    }).toThrow(new Error('singlePropertyType must get a compProps of one of the types [testType] but got otherTestType'));
                });
                it('should resolve to validateProperties internally and not throw if valid', function(){
                    var mockSiteData = testUtils.mockFactory.mockSiteData()
                        .addDesktopComps([{
                            id: 'mock-comp-id',
                            propertyQuery: 'mock-props-id',
                            componentType: 'singlePropertyType',
                            layout: {}
                        }], 'masterPage')
                        .addProperties({
                            id: 'mock-props-id',
                            type: 'testType' //VALID test type for singlePropertyType
                        }, 'masterPage');

                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);

                    var masterPagePointer = ps.pointers.components.getPage('masterPage', 'DESKTOP');
                    var compPointer = ps.pointers.components.getComponent('mock-comp-id', masterPagePointer);

                    expect(function(){
                        compPropValidator.validateCompProps(ps, compPointer);
                    }).not.toThrow();
                });

            });
        });
    });
});
