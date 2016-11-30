define(['testUtils', 'wixSites/components/backOfficeText/backOfficeText'], function (testUtils, backOfficeTextComp) {
    'use strict';

    function createBackOfficeTextComponent(key, align, margin, componentGlobals) {
        var props = testUtils.mockFactory.mockProps()
            .setCompData({
                key: key || 'mockKey'
            })
            .setCompProp({
                align: align || 'center',
                margin: margin || 50
            });

        if (componentGlobals) {
            props.siteData.componentGlobals = componentGlobals;
        }

        props.siteData.requestModel.cookie = "wixLanguage=en";
        props.siteData.currentUrl.host = 'wix.com';
        props.structure.componentType = 'wysiwyg.common.components.backofficetext.viewer.BackOfficeText';

        return testUtils.getComponentFromDefinition(backOfficeTextComp, props);
    }

    var mockComponentGlobals = {
            backOfficeText: {
                en: {
                    mockKey: 'Key'
                },
                de: {
                    mockKey: 'Schlüssel'
                }
            }
        },
        mockComponentGlobalsEmpty = {
            backOfficeText: {}
        };

    describe('Back Office Text Component', function () {

        describe('Test the text delivered to the user', function () {

            beforeEach(function () {
                this.getChildren = function (backOfficeText) {
                    return backOfficeText.getSkinProperties().label.children;
                };
            });

            it('should return DE value if lang is DE and DE value exist', function () {
                var bot = createBackOfficeTextComponent(null, null, null, mockComponentGlobals);
                spyOn(bot, 'getLanguage').and.returnValue('de');

                var expectedValue = 'Schlüssel',
                    calculatedValue = this.getChildren(bot);

                expect(calculatedValue).toBe(expectedValue);
            });

            it('should return EN value if lang is RU but RU value does not exist', function () {
                var bot = createBackOfficeTextComponent(null, null, null, mockComponentGlobals),
                    expectedValue = 'Key',
                    calculatedValue;

                spyOn(bot, 'getLanguage').and.returnValue('ru');
                calculatedValue = this.getChildren(bot);

                expect(calculatedValue).toBe(expectedValue);
            });

            it('should return key if backOfficeText globals are available but value is not available at all (at any lang) and user is of wix', function () {
                var bot = createBackOfficeTextComponent(null, null, null, mockComponentGlobalsEmpty);
                spyOn(bot, 'isWixUser').and.returnValue(true);
                spyOn(bot, 'getLanguage').and.returnValue('en');

                var expectedValue = 'mockKey',
                    calculatedValue = this.getChildren(bot);

                expect(calculatedValue).toBe(expectedValue);
            });

            it('should return key if globals are not available but and user is of wix', function () {
                var bot = createBackOfficeTextComponent(null, null, null, mockComponentGlobalsEmpty);
                spyOn(bot, 'isWixUser').and.returnValue(true);
                spyOn(bot, 'getLanguage').and.returnValue('en');

                var expectedValue = 'mockKey',
                    calculatedValue = this.getChildren(bot);

                expect(calculatedValue).toBe(expectedValue);
            });

            it('should return an empty string if backOfficeText globals are not available and user is not of wix', function () {
                var bot = createBackOfficeTextComponent(null, null, null, mockComponentGlobalsEmpty);
                spyOn(bot, 'isWixUser').and.returnValue(false);
                spyOn(bot, 'getLanguage').and.returnValue('en');

                var expectedValue = '',
                    calculatedValue = this.getChildren(bot);

                expect(calculatedValue).toBe(expectedValue);
            });

            it('should return an empty string if value is not available at all (at any lang) and user is not of wix', function () {
                var bot = createBackOfficeTextComponent();
                spyOn(bot, 'isWixUser').and.returnValue(false);
                spyOn(bot, 'getLanguage').and.returnValue('en');

                var expectedValue = '',
                    calculatedValue = this.getChildren(bot);

                expect(calculatedValue).toBe(expectedValue);
            });

        });

        describe('Padding', function () {

            beforeEach(function () {
                this.getStyle = function (backOfficeText) {
                    return backOfficeText.getSkinProperties().label.style;
                };
            });

            it('should have no padding when align is center', function () {
                var bot = createBackOfficeTextComponent(null, 'center', 50);

                spyOn(bot, 'isWixUser').and.returnValue(false);
                spyOn(bot, 'getLanguage').and.returnValue('en');

                var expectedPadding = {
                        'textAlign': 'center',
                        'paddingLeft': 0,
                        'paddingRight': 0
                    },
                    calculatedPadding = this.getStyle(bot);

                expect(calculatedPadding).toEqual(expectedPadding);
            });

            it('should have right padding when align is right', function () {
                var bot = createBackOfficeTextComponent(null, 'right', 50);

                spyOn(bot, 'isWixUser').and.returnValue(false);
                spyOn(bot, 'getLanguage').and.returnValue('en');

                var expectedPadding = {
                        'textAlign': 'right',
                        'paddingLeft': 0,
                        'paddingRight': '50px'
                    },
                    calculatedPadding = this.getStyle(bot);

                expect(calculatedPadding).toEqual(expectedPadding);
            });

            it('should have left padding when align is left', function () {
                var bot = createBackOfficeTextComponent(null, 'left', 50);

                spyOn(bot, 'isWixUser').and.returnValue(false);
                spyOn(bot, 'getLanguage').and.returnValue('en');

                var expectedPadding = {
                        'textAlign': 'left',
                        'paddingLeft': '50px',
                        'paddingRight': 0
                    },
                    calculatedPadding = this.getStyle(bot);

                expect(calculatedPadding).toEqual(expectedPadding);
            });
        });
    });
});
