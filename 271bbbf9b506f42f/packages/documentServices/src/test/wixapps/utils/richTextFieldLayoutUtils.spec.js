define([
    'lodash',
    'documentServices/wixapps/utils/richTextFieldLayoutUtils',
    'fonts', 'documentServices/theme/theme',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (_, richTextFieldLayoutUtils, fonts, theme, privateServicesHelper) {
    'use strict';

    describe('richTextFieldLayoutUtils', function () {

        var testParsedFontStyle, testFontClassName, fakePS, fontStyleToClassMap;
        beforeEach(function() {
            fontStyleToClassMap = {
                'Title': "font_0",
                'Menu': "font_1",
                'Page title': "font_2",
                'Heading XL': "font_3",
                'Heading L': "font_4",
                'Heading M': "font_5",
                'Heading S': "font_6",
                'Body L': "font_7",
                'Body M': "font_8",
                'Body S': "font_9",
                'Body XS': "font_10"
            };
            testFontClassName = 'font_10';
            testParsedFontStyle = {};
            fakePS = privateServicesHelper.mockPrivateServicesWithRealDAL();
            fakePS.dal.full.setByPath(['wixapps', 'appbuilder'], {});

            spyOn(theme.fonts, 'getAll').and.returnValue([]);
            spyOn(theme.colors, 'getAll').and.returnValue([]);
            spyOn(fonts.fontUtils, 'parseStyleFont').and.callFake(function(fontStyleName) {
                return fontStyleName === testFontClassName ? testParsedFontStyle : {};
            });
        });

        function getStyleForFontClass(fontClass) {
            return _.invert(fontStyleToClassMap)[fontClass];
        }

        describe('convertFieldPropsToViewDefProps', function() {

            it('should convert "fontClass" to "style" for backward compatibility', function() {
                var viewDefProps;
                _.forOwn(fontStyleToClassMap, function(fontClass, fontStyle) {
                    viewDefProps = richTextFieldLayoutUtils.convertFieldPropsToViewDefProps({fontClass: fontClass});
                    expect(viewDefProps.fontClass).toBeUndefined();
                    expect(viewDefProps.style).toEqual(fontStyle);
                });
            });

            it('should reset all style-related parameters when "fontClass" is set', function() {
                var fieldProps = {
                    fontClass: 'font_1'
                };

                var viewDefProps = richTextFieldLayoutUtils.convertFieldPropsToViewDefProps(fieldProps);

                expect(viewDefProps).toEqual({
                    style: 'Menu',
                    fontSize: null,
                    bold: false,
                    italic: false,
                    underline: false,
                    color: null,
                    backgroundColor: null,
                    lineHeight: null,
                    lineThrough: false,
                    fontFamily: null
                });
            });

            it('should throw an error if trying to set both fontClass and other attributes', function() {
                var fieldProps = {
                    fontClass: testFontClassName,
                    bold: true
                };
                var convertFunc = function() {
                    richTextFieldLayoutUtils.convertFieldPropsToViewDefProps(fieldProps);
                };
                expect(convertFunc).toThrowError('Cannot set "fontClass" together with additional attributes');
            });

            it('should not modify attributes which do not relate to the style', function() {
                var fieldProps = {
                    fake1: 'fake 1',
                    fake2: 'fake 2'
                };
                var viewDefProps = richTextFieldLayoutUtils.convertFieldPropsToViewDefProps(_.clone(fieldProps));
                expect(viewDefProps).toEqual(fieldProps);
            });

            it('should throw an error when trying to set fontClass to null explicitly', function() {
                var newFieldProps = {fontClass: null};
                var convertPropsFunc = function() {
                    richTextFieldLayoutUtils.convertFieldPropsToViewDefProps(newFieldProps, {});
                };
                expect(convertPropsFunc).toThrowError('Cannot set fontClass to null');
            });

            it('should copy all missing view def props when overriding style with some value, and set fontClass to null', function() {
                var existingFieldProps = {
                    fontClass: testFontClassName,
                    bold: true,
                    color: 'some color',
                    italic: true,
                    fontSize: '999px',
                    lineHeight: '33px'
                };
                var newFieldProps = {bold: false, color: 'new color'};

                var viewDefProps = richTextFieldLayoutUtils.convertFieldPropsToViewDefProps(newFieldProps, existingFieldProps);

                expect(viewDefProps).toEqual({
                    style: null,
                    bold: false,
                    color: 'new color',
                    italic: true,
                    fontSize: 999,
                    lineHeight: 33
                });
            });

        });

        describe('convertViewDefPropsToFieldProps', function() {

            it('should convert "style" to "fontClass"', function() {
                var fieldProps;
                _.forEach(fontStyleToClassMap, function(fontClass, fontStyle) {
                    fieldProps = richTextFieldLayoutUtils.convertViewDefPropsToFieldProps(fakePS, {style: fontStyle});
                    expect(fieldProps.style).toBeUndefined();
                    expect(fieldProps.fontClass).toEqual(fontClass);
                });

                var fieldPropsWithNullStyle = richTextFieldLayoutUtils.convertViewDefPropsToFieldProps(fakePS, {style: null});
                expect(fieldPropsWithNullStyle.style).toBeUndefined();
                expect(fieldPropsWithNullStyle.fontClass).toEqual(null);

                var fieldPropsWithUndefinedStyle = richTextFieldLayoutUtils.convertViewDefPropsToFieldProps(fakePS, {style: undefined});
                expect(fieldPropsWithUndefinedStyle.style).toBeUndefined();
                expect(fieldPropsWithUndefinedStyle.fontClass).toEqual(null);
            });


            it('should return parsed style attributes even if they are not set as view def props', function() {
                testParsedFontStyle = {
                    bold: true,
                    italic: true,
                    color: 'some color',
                    size: '999px',
                    lineHeight: '33px',
                    family: 'test font family'
                };

                var fieldProps = richTextFieldLayoutUtils.convertViewDefPropsToFieldProps(fakePS, {style: getStyleForFontClass(testFontClassName)});

                expect(fieldProps.bold).toEqual(true);
                expect(fieldProps.italic).toEqual(true);
                expect(fieldProps.color).toEqual('some color');
                expect(fieldProps.fontSize).toEqual(999);
                expect(fieldProps.lineHeight).toEqual(33);
                expect(fieldProps.fontFamily).toEqual('test font family');

            });

            it('should return parsed font class without the curly braces returned from fontUtils', function() {
                testParsedFontStyle = {
                    color: '{color_33}'
                };

                var fieldProps = richTextFieldLayoutUtils.convertViewDefPropsToFieldProps(fakePS, {style: getStyleForFontClass(testFontClassName)});

                expect(fieldProps.color).toEqual('color_33');
            });

            it('should return fontClass=null and viewDef values when they override the style', function() {
                testParsedFontStyle = {
                    bold: true,
                    italic: true,
                    color: 'some color',
                    size: '999px',
                    lineHeight: '33px'
                };
                var viewDefProps = {
                    style: getStyleForFontClass(testFontClassName),
                    bold: false,
                    fontSize: '123px',
                    italic: true
                };

                var fieldProps = richTextFieldLayoutUtils.convertViewDefPropsToFieldProps(fakePS, viewDefProps);

                expect(fieldProps.fontClass).toEqual(null);
                expect(fieldProps.bold).toEqual(true);
                expect(fieldProps.fontSize).toEqual(123);
                expect(fieldProps.italic).toEqual(true);
                expect(fieldProps.color).toEqual('some color');
                expect(fieldProps.lineHeight).toEqual(33);
            });

            it('should return the right fontClass when viewDef props exist with the same value as in the style', function() {
                testParsedFontStyle = {
                    weight: 'bold',
                    style: 'normal',
                    color: 'some color',
                    size: '999px'
                };
                var viewDefProps = {
                    style: getStyleForFontClass(testFontClassName),
                    bold: true,
                    fontSize: '999px',
                    italic: false
                };

                var fieldProps = richTextFieldLayoutUtils.convertViewDefPropsToFieldProps(fakePS, viewDefProps);

                expect(fieldProps.fontClass).toEqual(testFontClassName);
                expect(fieldProps.bold).toEqual(true);
                expect(fieldProps.fontSize).toEqual(999);
                expect(fieldProps.italic).toEqual(false);
            });

            it('should not modify attributes which do not relate to the style', function() {
                var viewDefProps = {
                    fake1: 'fake 1',
                    fake2: 'fake 2'
                };
                var fieldProps = richTextFieldLayoutUtils.convertViewDefPropsToFieldProps(fakePS, _.clone(viewDefProps));
                expect(fieldProps).toEqual(jasmine.objectContaining(viewDefProps));
            });
        });

    });

});
