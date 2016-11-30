describe('Unit: WixColorSelectorDirective', function () {
    'use strict';

    var rootScope, scope, elm, colorData;

    beforeEach(module('wixElements'));
    beforeEach(module('dialogs'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
        $provide.factory('editorTheme', TestsUtils.mocks.editorTheme);
        $provide.factory('editorCommands', TestsUtils.mocks.editorCommands);
        $provide.factory('editorUtils', TestsUtils.mocks.editorUtils);
        $provide.factory('colorDialog', TestsUtils.mocks.colorDialog);
        $provide.constant('EXP_ngpanels', true);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();

        colorData = {
            color1: {
                value: "#AABBCC",
                source: "notheme",
                alpha: 0.44
            }
        };

        var styleProperties = {
            _skinParser: {_properties: colorData},
            getProperty: function (propertyName) {
                return colorData[propertyName].value;
            },
            getPropertySource: function (propertyName) {
                return colorData[propertyName].source;
            },
            getPropertyExtraParamValue: function (propertyName, extraParamType) {
                return colorData[propertyName][extraParamType];
            },
            changePropertySource: jasmine.createSpy()
        };
        scope.wixData = {propertyName: "color1", styleData: styleProperties};
    }));

    describe('default behavior -', function () {
        beforeEach(inject(function ($compile) {
            var html = '<wix-color-selector wix-data="wixData"></wix-color-selector>';

            elm = $compile(html)(scope);

            scope.$digest();
        }));

        it("should ensure that the directive scope is initialized properly", function () {
            var directiveScope = elm.isolateScope();

            expect(directiveScope.color).toBe("#AABBCC");
            expect(directiveScope.alpha).toBe(0.44);
        });

        it('Should open ColorSelector dialog on click with the selected color', inject(function (editorCommands, colorDialog) {
            spyOn(colorDialog, 'openColorSelectorDialog');
            var innerElm = elm.find('.wix-color-selector');

            innerElm.trigger('click');

            expect(colorDialog.openColorSelectorDialog).toHaveBeenCalled();
            expect(colorDialog.openColorSelectorDialog.calls.argsFor(0)[1]).toEqual(colorData.color1.value);
        }));

        it('Should watch on changes in color or alpha, and update directive scope accordingly', function () {
            colorData.color1.alpha = 0.8;
            var directiveScope = elm.isolateScope();

            scope.$digest();

            expect(directiveScope.alpha).toEqual(colorData.color1.alpha);
        });

        it('Should get the color from the editor theme manager if color source is theme', inject(function (editorTheme) {
            var directiveScope = elm.isolateScope();
            spyOn(editorTheme, 'getPreviewThemeProperty').and.returnValue({
                getHex: function () {
                    return 'colorFromTheme';
                }
            });
            colorData.color1.source = 'theme';

            scope.$digest();

            expect(directiveScope.color).toEqual('colorFromTheme');
        }));

        it("Should set the color value and 'color source' (theme/value) to the wixData on color adjust", inject(function (colorDialog) {
            var closeDialogObj = {
                result: true,
                context: {
                    selectedColor: 'someColor',
                    colorSource: 'someSource'
                }
            };
            var directiveScope = elm.isolateScope();
            spyOn(colorDialog, 'openColorSelectorDialog');
            var innerElm = elm.find('.wix-color-selector');

            innerElm.trigger('click');
            var closeCallback = colorDialog.openColorSelectorDialog.calls.argsFor(0)[3];

            closeCallback(closeDialogObj);

            expect(directiveScope.styleData.changePropertySource).toHaveBeenCalledWith("color1", 'someColor', 'someSource');
        }));

        it('Should not change the color property if close result of color dialog is false', inject(function (colorDialog) {
            var closeDialogObj = {
                result: false,
                context: {
                    selectedColor: 'someColor',
                    colorSource: 'someSource'
                }
            };
            var directiveScope = elm.isolateScope();
            spyOn(colorDialog, 'openColorSelectorDialog');
            var innerElm = elm.find('.wix-color-selector');

            innerElm.trigger('click');
            var closeCallback = colorDialog.openColorSelectorDialog.calls.argsFor(0)[3];

            closeCallback(closeDialogObj);

            expect(directiveScope.styleData.changePropertySource).not.toHaveBeenCalled();
        }));

    });
});