define(['lodash', 'testUtils', 'experiment'], function (_, testUtils, experiment) {
    "use strict";

    describe('Data Validators Helper - ', function () {

        var mockModules = {
            'documentServices/dataModel/PropertiesSchemas.json': {
                DefaultProperties: {
                    type: 'object',
                    properties: {isHidden: {type: 'boolean'}}
                },
                WPhotoProperties: {
                    type: 'object',
                    allOf: [
                        {
                            properties: {
                                displayMode: {
                                    type: 'string',
                                    enum: ['fill', 'full', 'stretch', 'fitWidth', 'fitWidthStrict', 'fitHeightStrict'],
                                    default: 'fill'
                                },
                                effectName: {type: ['string', 'null']}
                            }
                        },
                        {'$ref': 'DefaultProperties'}
                    ]
                }
            },
            'documentServices/dataModel/DataSchemas.json': {
                numeric: {type: 'string', format: 'numeric'},
                uri: {type: 'string', format: 'uri'},
                ref: {type: ['string', 'null'], pseudoType: ['ref']},
                refList: {type: 'array', pseudoType: ['refList']},
                stringifyObject: {type: 'string', pseudoType: ['stringifyObject']},
                hexColor: {type: ['string', 'null'], format: 'hexColor'},
                color: {type: ['string', 'null'], format: 'color'},
                border: {type: ['string', 'null'], format: 'border'},
                padding: {type: ['string', 'null'], format: 'padding'},
                radius: {type: ['string', 'null'], format: 'radius'},
                imageId: {type: ['string', 'null'], format: 'imageId'},
                bgMode: {type: ['string', 'null'], format: 'bgMode'},
                webThemeUrl: {type: ['string', 'null'], format: 'webThemeUrl'},
                themeUrl: {type: ['string', 'null'], format: 'themeUrl'},
                background: {type: ['string', 'null'], format: 'background'},
                resourceKey: {type: ['string', 'null'], format: 'resourceKey'},
                'font-family': {type: ['string', 'null'], format: 'font-family'},
                Image: {
                    type: 'object',
                    properties: {
                        link: {type: ['string', 'null'], pseudoType: ['ref']},
                        title: {type: 'string', default: '', maxLength: 100}
                    }
                }
            },
            'experiment': experiment
        };
        testUtils.requireWithMocks('documentServices/dataModel/dataValidatorsHelper', mockModules, function (dataValidatorsHelper) {

            it("should not perform validation on partial data or on schema that is not registered for validation", function () {
                var schemaName = null;
                var dataItem = null;
                var originType = null;

                expect(function () {
                    dataValidatorsHelper.validate(schemaName, dataItem, originType);
                }).toThrow();

                schemaName = "nonValidatedMockSchema";
                expect(function () {
                    dataValidatorsHelper.validate(schemaName, dataItem, originType);
                }).toThrow();

                originType = "data";
                expect(function () {
                    dataValidatorsHelper.validate(schemaName, dataItem, originType);
                }).toThrow();

                dataItem = {};
                expect(function () {
                    dataValidatorsHelper.validate(schemaName, dataItem, originType);
                }).toThrow();
            });

            it("should perform validation on data item according to schema name and 'schema family' (origin type)", function () {
                var schemaName = "Image";
                var dataItem = {title: "Hello Wix"};
                var originType = "data";

                expect(function () {
                    dataValidatorsHelper.validate(schemaName, dataItem, originType);
                }).not.toThrow();
            });

            it("should perform validation on props item according to schema name and 'schema family' (origin type)", function () {
                var schemaName = "WPhotoProperties";
                var propsItem = {displayMode: "Invalid value"};
                var originType = "props";

                expect(function () {
                    dataValidatorsHelper.validate(schemaName, propsItem, originType);
                }).toThrow();

                propsItem.displayMode = "full";
                expect(function () {
                    dataValidatorsHelper.validate(schemaName, propsItem, originType);
                }).not.toThrow();
            });

            describe('Schema Validations - ', function () {

                function validate(schema, data) {
                    return dataValidatorsHelper.validate.bind(null, schema, data, 'data');
                }

                describe('formats', function () {

                    describe('numeric', function () {

                        it('should pass validation if value is a string made only of digits', function () {
                            expect(validate('numeric', '23445346456')).not.toThrow();
                        });

                        it('should trow if value is not a string made only of digits', function () {
                            var expectedError = new Error(JSON.stringify([{message: 'should match format "numeric"', dataPath: '', keyword: 'format', schemaPath: '#/format'}]));
                            expect(validate('numeric', '23445346456a')).toThrow(expectedError);
                        });
                    });

                    describe('uri', function () {

                        it('should pass validation if value is a valid uri', function () {
                            expect(validate('uri', 'http://www.wix.com')).not.toThrow();
                        });

                        it('should trow if value is not a valid uri', function () {
                            var expectedError = new Error(JSON.stringify([{message: 'should match format "uri"', dataPath: '', keyword: 'format', schemaPath: '#/format'}]));
                            expect(validate('uri', 'not a uri string')).toThrow(expectedError);
                        });
                    });

                    describe('hexColor', function() {
                        it("should not pass validation for an invalid 'hexcolor' value", function() {
                            expect(validate('hexColor', 'some-color')).toThrow();
                            expect(validate('hexColor', 'color_1')).toThrow();
                            expect(validate('hexColor', '#colorA')).toThrow();
                            expect(validate('hexColor', '')).toThrow();
                            expect(validate('hexColor', '#0A9FZZ')).toThrow();
                            expect(validate('hexColor', '#2AZ')).toThrow();
                            expect(validate('hexColor', '2AF')).toThrow();
                            expect(validate('hexColor', '2AF2AF')).toThrow();
                        });

                        it("should pass validation for a valid 'hexcolor' value", function() {
                            expect(validate('hexColor', null)).not.toThrow();
                            expect(validate('hexColor', '#09AAFF')).not.toThrow();
                            expect(validate('hexColor', '#0AF')).not.toThrow();
                        });
                    });

                    describe("color", function() {
                        it("should not pass validation for an invalid 'color' value", function() {
                            expect(validate('color', 'someInvalidColor')).toThrow();

                            expect(validate('color', '{color_101}')).toThrow();
                            expect(validate('color', '{color_1A}')).toThrow();
                            expect(validate('color', '{color_Z}')).toThrow();

                            expect(validate('color', "#83Z")).toThrow();

                            expect(validate('color', "256,0,2")).toThrow();
                            expect(validate('color', "6,256,2")).toThrow();
                            expect(validate('color', "0,0,256")).toThrow();

                            expect(validate('color', "0,0,255,1.01")).toThrow();
                        });

                        it("should pass validation for a valid 'color' value", function() {
                            expect(validate('color', null)).not.toThrow();

                            expect(validate('color', "{color_0}")).not.toThrow();
                            expect(validate('color', "{color_100}")).not.toThrow();
                            expect(validate('color', "{color_27}")).not.toThrow();

                            expect(validate('color', "#83FF9A")).not.toThrow();

                            expect(validate('color', '0,0,0')).not.toThrow();
                            expect(validate('color', '255,255,255')).not.toThrow();
                            expect(validate('color', '0,0,0,0')).not.toThrow();
                            expect(validate('color', '0,0,0,1')).not.toThrow();
                            expect(validate('color', '255,255,255,0')).not.toThrow();
                            expect(validate('color', '255,255,255,1')).not.toThrow();
                            expect(validate('color', '222,155,23,0.8')).not.toThrow();
                        });
                    });

                    describe("Border", function() {
                        it("should fail invalid 'border' values", function() {
                            expect(validate('border', "1")).toThrow();
                            expect(validate('border', "1%")).toThrow();
                            expect(validate('border', "1cm")).toThrow();
                            expect(validate('border', "1em 20%")).toThrow();
                            expect(validate('border', "1em 20px custom")).toThrow();
                            expect(validate('border', "1em 20px solid {color_101}")).toThrow();
                            expect(validate('border', "1em 20px solid #A")).toThrow();
                            expect(validate('border', "1em 20px solid #AB")).toThrow();
                            expect(validate('border', "1em 20px solid #ABCD")).toThrow();
                            expect(validate('border', "1em 20px solid #ABCDE")).toThrow();
                            expect(validate('border', "1em 20px solid #ABCDE12")).toThrow();
                        });

                        it("should pass validation for valid 'border' values", function() {
                            expect(validate('border', null)).not.toThrow();
                            expect(validate('border', "")).not.toThrow();
                            expect(validate('border', '')).not.toThrow();

                            expect(validate('border', "0")).not.toThrow();
                            expect(validate('border', "1px")).not.toThrow();
                            expect(validate('border', "1em")).not.toThrow();

                            expect(validate('border', "1px 2em")).not.toThrow();
                            expect(validate('border', "1em 2px 3em")).not.toThrow();
                            expect(validate('border', "1px 2em 3px 4em")).not.toThrow();

                            expect(validate('border', "1px solid")).not.toThrow();
                            expect(validate('border', "1px 2px dashed")).not.toThrow();
                            expect(validate('border', "1.1px 2.2em groove")).not.toThrow();
                            expect(validate('border', "1.1px 2em double")).not.toThrow();
                            expect(validate('border', "1px 2.2em 3px 4px dotted")).not.toThrow();

                            expect(validate('border', "1px {color_1}")).not.toThrow();
                            expect(validate('border', "1px 2px {color_2}")).not.toThrow();
                            expect(validate('border', "1.1px 2.2em groove")).not.toThrow();
                            expect(validate('border', "1px 2.2em 3px 4px {color_4}")).not.toThrow();
                        });
                    });

                    describe("Padding and Radius", function() {
                        it("should fail validation for invalid padding/radius values", function() {
                            expect(validate('padding', "abcd")).toThrow();
                            expect(validate('padding', "apx bpx cpx dpx")).toThrow();
                            expect(validate('radius', "Aem Bpx")).toThrow();
                            expect(validate('radius', "null")).toThrow();
                        });

                        it("should pass validation for valid padding/radius values", function() {
                            expect(validate('padding', null)).not.toThrow();
                            expect(validate('radius', null)).not.toThrow();

                            expect(validate('padding', "")).not.toThrow();
                            expect(validate('radius', "")).not.toThrow();

                            expect(validate('padding', '0')).not.toThrow();
                            expect(validate('padding', '0em')).not.toThrow();
                            expect(validate('radius', '0')).not.toThrow();
                            expect(validate('radius', '0px')).not.toThrow();

                            expect(validate('padding', '0em 1px')).not.toThrow();
                            expect(validate('radius', '10px 16px')).not.toThrow();

                            expect(validate('padding', '0em 1px 2em')).not.toThrow();
                            expect(validate('radius', '10px 16px 2px')).not.toThrow();

                            expect(validate('padding', '0em 1px 2em 3px')).not.toThrow();
                            expect(validate('radius', '10px 16em 2px 3em')).not.toThrow();
                        });
                    });

                    describe("imageId", function() {
                        it("should pass all values", function() {
                            var imageIdDefaultValueInTheme = 'BG_USES_THEME_IMAGE';
                            expect(validate('imageId', imageIdDefaultValueInTheme)).not.toThrow();
                        });
                    });

                    describe("bgMode", function() {
                        it("should pass all values", function() {
                            var bgModeTypeDefaultValue = 'BG_USES_THEME_IMAGE';
                            expect(validate('bgMode', bgModeTypeDefaultValue)).not.toThrow();
                        });
                    });

                    describe("webTheme & webThemeUrl", function() {
                        it("should pass validation for valid 'webTheme' values", function() {
                            expect(validate('webThemeUrl', null)).not.toThrow();
                            expect(validate('webThemeUrl', '')).not.toThrow();

                            expect(validate('webThemeUrl', 'base')).not.toThrow();
                            expect(validate('webThemeUrl', 'base/')).not.toThrow();
                            expect(validate('webThemeUrl', 'photos')).not.toThrow();
                            expect(validate('webThemeUrl', 'base/photos')).not.toThrow();
                            expect(validate('webThemeUrl', 'base/photos/123abc')).not.toThrow();
                            expect(validate('webThemeUrl', 'base/photos/123-abc')).not.toThrow();
                        });

                        it("should fail validation for invalid 'themeUrl' values", function() {
                            expect(validate('webThemeUrl', '#base')).toThrow();
                            expect(validate('webThemeUrl', '?base')).toThrow();
                            expect(validate('webThemeUrl', '?base/')).toThrow();
                            expect(validate('webThemeUrl', 'base/a#v')).toThrow();
                            expect(validate('webThemeUrl', 'base/photos/123+abc')).toThrow();
                        });
                    });

                    describe("font-family", function() {
                        it("should pass validation for any font-family that is supported by the fonts module", function() {
                            expect(validate('font-family', null)).not.toThrow();
                            expect(validate('font-family', '')).not.toThrow();
                            expect(validate('font-family', 'arial')).not.toThrow();
                            expect(validate('font-family', 'verdana')).not.toThrow();
                            expect(validate('font-family', 'times new roman')).not.toThrow();
                        });

                        it("should fail validation for a font-family that is not supported by the fonts module", function() {
                            expect(validate('font-family', 'unexisting-font')).toThrow();
                        });
                    });

                    describe('ref', function () {

                        it('should pass validation if value is a string starting with #', function () {
                            expect(validate('ref', '#someValue')).not.toThrow();
                        });

                        it('should throw if value is not a string starting with #', function () {
                            var expectedError = {message: 'should pass \"pseudoType\" keyword validation', dataPath: '', keyword: 'pseudoType', schemaPath: '#/pseudoType'};
                            expect(validate('ref', 'someValue')).toThrow(new Error(JSON.stringify([expectedError])));
                        });

                    });

                });

                describe('checks', function () {

                    describe('refList', function () {

                        it('should pass validation if value is an array of refs', function () {
                            expect(validate('refList', ['#one', '#two', '#three'])).not.toThrow();
                        });

                        it('should throw if value is not an array of refs', function () {
                            var expectedError = new Error(JSON.stringify([{message: 'should pass \"pseudoType\" keyword validation', dataPath: '', keyword: 'pseudoType', schemaPath: '#/pseudoType'}]));
                            expect(validate('refList', ['#one', '#two', 'three'])).toThrow(expectedError);
                        });

                    });

                    describe('stringifyObject', function () {
                        it('should pass validation if value is a parsable string', function () {
                            expect(validate('stringifyObject', '{"hello":"world"}')).not.toThrow();
                        });

                        it('should throw if value is not a parsable string', function () {
                            var expectedError = new Error(JSON.stringify([{message: 'should pass \"pseudoType\" keyword validation', dataPath: '', keyword: 'pseudoType', schemaPath: '#/pseudoType'}]));
                            expect(validate('stringifyObject', '')).toThrow(expectedError);
                        });
                    });

                });

            });

            describe('isDataSchema', function(){
                _.forEach(['data', 'style', 'behaviors'], function(schemaOrigin){

                    it('should return true for ' + schemaOrigin, function(){
                        var result = dataValidatorsHelper.isDataSchema(schemaOrigin);

                        expect(result).toBeTruthy();
                    });
                });

                it('should return false for properties', function(){
                    var result = dataValidatorsHelper.isDataSchema('properties');

                    expect(result).toBeFalsy();
                });

                it('should return true for design', function(){

                    var result = dataValidatorsHelper.isDataSchema('design');

                    expect(result).toBeTruthy();
                });

                it('should return false for connections, if connectionsData experiment is not open', function(){
                    var result = dataValidatorsHelper.isDataSchema('connections');

                    expect(result).toBeFalsy();
                });

                it('should return true for connections, if connectionsData experiment is open', function(){
                    testUtils.experimentHelper.openExperiments('connectionsData');

                    var result = dataValidatorsHelper.isDataSchema('connections');

                    expect(result).toBeTruthy();
                });
            });
        });
    });
});
