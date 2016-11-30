define(['lodash',
        'documentServices/dataModel/dataValidatorsHelper',
        'definition!documentServices/dataModel/dataValidators'], function (_, dataValidatorsHelper, dataValidatorsDef) {

    'use strict';
    xdescribe('Document Services - Data Validators API', function () { // SEE TODO BELOW

        var mockDataSchema = {
            type: "object",
            properties: {
                key1: {
                    type: 'string',
                    default: 'bla'
                },
                stringProp: {
                    type: 'string'
                },
                numberProp: {
                    type: 'number'
                },
                booleanProp: {
                    type: 'boolean'
                },
                refProp: {
                    type: ['null', 'string'],
                    pseudoType: ['ref']
                },
                arrayProp: {
                    type: 'array'
                },
                listProp: {
                    type: ['null', 'array']
                },
                objectProp: {
                    type: 'object'
                },
                refListProp: {
                    type: ['null', 'array'],
                    pseudoType: ['refList']
                },
                enumProp: {
                    type: 'string',
                    enum: ['foo', 'bar']
                }
            }
        };

        // TODO: Do not execute code outside of it/before*/after*:
        dataValidatorsHelper.validators.data.addSchema(mockDataSchema, 'mockDataSchema');

        var dataValidators = dataValidatorsDef(_, dataValidatorsHelper);

        describe('validateDataBySchema', function(){

            function validate(data){
                return dataValidators.validateDataBySchema.bind(null, data, 'data');
            }

            it('should throw if data has no type at all or has an unknown schema type', function(){
                expect(validate({id: 'mockId'})).toThrow(new Error("dataItem has no 'type' nor options has 'schemaName'"));
                expect(validate({id: 'mockId', type: 'unknownType'})).toThrow(new Error('no schema with key or ref "unknownType"'));
            });

            it('should add default value if data is missing a schema key', function(){
                var data = {id: 'mockId', type: 'mockDataSchema'};

                dataValidators.validateDataBySchema(data, 'data');

                expect(data).toEqual({id: 'mockId', type: 'mockDataSchema', key1: 'bla'});
            });

            it('should throw if data has invalid value (by type)', function(){
                expect(validate({id: 'mockId', type: 'mockDataSchema', numberProp: 'foo'})).toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', booleanProp: 'foo'})).toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', refProp: 'foo'})).toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', arrayProp: 'foo'})).toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', listProp: 'foo'})).toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', refListProp: ['foo', 'bar']})).toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', objectProp: 'foo'})).toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', enumProp: 'hello'})).toThrow();
            });

            it('should not throw if data has valid values (by type)', function(){
                expect(validate({id: 'mockId', type: 'mockDataSchema', stringProp: 'hello'})).not.toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', numberProp: 0})).not.toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', numberProp: 5.5})).not.toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', booleanProp: true})).not.toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', refProp: '#bar'})).not.toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', arrayProp: []})).not.toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', listProp: []})).not.toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', refListProp: ['#foo', '#bar']})).not.toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', objectProp: {}})).not.toThrow();
                expect(validate({id: 'mockId', type: 'mockDataSchema', enumProp: 'bar'})).not.toThrow();
            });

        });

        describe("schema validators", function() {
            it("should fail to register a Validator for invalid input", function() {
                var validatorHandle = dataValidators.registerDataSchemaValidator(null, null);
                expect(validatorHandle).toBeNull();

                validatorHandle = dataValidators.registerDataSchemaValidator(null, _.noop());
                expect(validatorHandle).toBeNull();

                validatorHandle = dataValidators.registerDataSchemaValidator("DataSchemaName", null);
                expect(validatorHandle).toBeNull();
            });

            it("should be able to register a Validator for a specific Schema", function() {
                var dataSchemaName = "SchemaToValidate";

                var validatorHandle1 = dataValidators.registerDataSchemaValidator(dataSchemaName, _.constant(true));
                var validatorHandle2 = dataValidators.registerDataSchemaValidator(dataSchemaName, _.constant(true));

                expect(validatorHandle1).toBeDefined();
                expect(validatorHandle2).toBeDefined();
                expect(validatorHandle1).not.toBe(validatorHandle2);
            });

            it("should be able to un-register a Validator for a specific Schema", function () {
                var dataSchemaName = "SchemaToValidate";

                var validatorHandle1 = dataValidators.registerDataSchemaValidator(dataSchemaName, _.constant(true));
                dataValidators.registerDataSchemaValidator(dataSchemaName, _.constant(true));
                var validatorHandle3 = dataValidators.registerDataSchemaValidator(dataSchemaName, _.constant(true));

                expect(validatorHandle1()).toBeTruthy();
                expect(validatorHandle1()).toBeFalsy();
                expect(validatorHandle1()).toBeFalsy();

                expect(validatorHandle3()).toBeTruthy();
                expect(validatorHandle3()).toBeFalsy();
                expect(validatorHandle3()).toBeFalsy();
            });
        });
    });
});
