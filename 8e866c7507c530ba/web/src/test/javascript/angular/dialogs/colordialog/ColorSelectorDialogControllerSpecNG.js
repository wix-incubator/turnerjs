describe('Unit: ColorSelectorDialogController', function () {
    'use strict';
    var ctrl, scope, rootScope, element;

    beforeEach(function () {
        element = angular.element(document.createElement('div'));
    });

    beforeEach(module('dialogs'));

    // create the required services from mocks
    beforeEach(module(function ($provide) {
        $provide.factory('editorTheme', TestsUtils.mocks.editorTheme);
        $provide.factory('editorCommands', TestsUtils.mocks.editorCommands);
    }));

    var color1Mock;
    var color2Mock;
    var colorGeneralMock;

    beforeEach(inject(function (editorTheme) {
        color1Mock = {
            getHex: function () {
                return 'color1hexResult';
            }
        };
        color2Mock = {
            getHex: function () {
                return 'color2hexResult';
            }
        };
        colorGeneralMock = {
            getHex: function () {
                return 'colorGeneralhexResult';
            }
        };
        var mockThemeColors = _.map(new Array(36), function () {
            return 'colorGeneralMock';
        });
        mockThemeColors[1] = 'color1';
        mockThemeColors[2] = 'color2';
        mockThemeColors[11] = 'color1';
        mockThemeColors[16] = 'color2';
        mockThemeColors[12] = 'color1';
        mockThemeColors[17] = 'color2';

        spyOn(editorTheme, 'getPropertiesAccordingToType').and.returnValue(mockThemeColors);
        spyOn(editorTheme, 'getProperty').and.callFake(function (color) {
            switch (color) {
                case 'color1' :
                    return color1Mock;
                case 'color2' :
                    return color2Mock;
                default:
                    return colorGeneralMock;
            }

        });
    }));

    // inject the $controller and $rootScope services
    beforeEach(inject(function ($controller, $rootScope, editorTheme) {
        // Create a new scope that's a child of the $rootScope
        scope = $rootScope.$new();
        scope.context = {
            selectedColor: 'someColor'
        };
        scope.dialog = {
            close: jasmine.createSpy()
        };
        rootScope = $rootScope;

        // Create the controller and supply mocks
        ctrl = $controller('ColorSelectorDialogController', {
            $scope: scope,
            $element: element,
            editorTheme: editorTheme
        });
    }));

    describe('Getting color options', function () {
        it('Should create colors array for display from theme manager and arrange colors in correct order', function () {
            var color1Obj = {
                name: 'color1',
                hex: 'color1hexResult'
            };
            var color2Obj = {
                name: 'color2',
                hex: 'color2hexResult'
            };
            var colorGeneralObj = {
                name: 'colorGeneralMock',
                hex: 'colorGeneralhexResult'
            };

            expect(ctrl.paletteColors).toBeTruthy();
            expect(ctrl.paletteColors[0]).toEqual(color1Obj);
            expect(ctrl.paletteColors[1]).toEqual(color2Obj);
            expect(ctrl.paletteColors[2]).toEqual(colorGeneralObj);
            expect(ctrl.paletteColors[5]).toEqual(color1Obj);
            expect(ctrl.paletteColors[6]).toEqual(color2Obj);
        });

        it('Should create colors array of static colors for display', function () {
            var color1Obj = {
                name: 'color1',
                hex: 'color1hexResult'
            };
            var color2Obj = {
                name: 'color2',
                hex: 'color2hexResult'
            };
            var colorGeneralObj = {
                name: 'colorGeneralMock',
                hex: 'colorGeneralhexResult'
            };

            expect(ctrl.staticColors).toBeTruthy();
            expect(ctrl.staticColors[0]).toEqual(color1Obj);
            expect(ctrl.staticColors[1]).toEqual(color2Obj);
            expect(ctrl.staticColors[2]).toEqual(colorGeneralObj);
        });
    });

    describe('Selecting a color', function () {
        it('Should update color value in context object', function () {
            ctrl.colorSelected("newColor");

            expect(scope.context.selectedColor).toEqual('newColor');
            expect(scope.context.colorSource).toEqual('theme');
        });

        it('Should close the dialog', function () {
            ctrl.colorSelected();

            expect(scope.dialog.close).toHaveBeenCalled();
        });
    });

    describe('Clicking on more colors', function () {
        it('Should open the legacy color picker dialog', inject(function (editorCommands) {
            spyOn(editorCommands, 'executeCommand');

            ctrl.openLegacyColorPicker();

            expect(editorCommands.executeCommand).toHaveBeenCalled();
            expect(editorCommands.executeCommand.calls.argsFor(0)[0]).toEqual('WEditorCommands.ShowColorPickerDialog');
            expect(editorCommands.executeCommand.calls.argsFor(0)[1].color).toEqual('someColor');
            expect(editorCommands.executeCommand.calls.argsFor(0)[1].enableAlpha).not.toBeTruthy();

        }));
    });

    describe('Closing the legacy ColorPicker dialog', function () {
        it('Should not close colorSelector if close reason is not ok', inject(function (editorCommands) {
            spyOn(editorCommands, 'executeCommand');
            spyOn(ctrl, 'colorSelected');
            ctrl.openLegacyColorPicker();
            var closeCallback = editorCommands.executeCommand.calls.argsFor(0)[1].onChange;

            closeCallback({});

            expect(ctrl.colorSelected).not.toHaveBeenCalled();
        }));

        it('Should set color source when calling colorSelected', inject(function (editorCommands) {
            spyOn(editorCommands, 'executeCommand');
            spyOn(ctrl, 'colorSelected');
            ctrl.openLegacyColorPicker();
            var closeCallback = editorCommands.executeCommand.calls.argsFor(0)[1].onChange;

            closeCallback({color: 'customColor', cause: 'ok'});

            expect(ctrl.colorSelected).toHaveBeenCalledWith('customColor', 'value');

        }));
    });


});