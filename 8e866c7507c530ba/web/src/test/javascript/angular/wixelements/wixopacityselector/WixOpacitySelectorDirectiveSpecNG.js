describe('Unit: WixOpacityDirective', function () {
    'use strict';

    var rootScope, scope, elm;
    var alpha;

    beforeEach(module('angularEditor'));
    beforeEach(module('wixElements'));
    beforeEach(module('newSavePublish'));
    beforeEach(module('dialogs'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        alpha = 0.77;

        var styleProperties = {
            getProperty: function(propertyName) {return "#AABBCC";},
            getPropertySource: function(propertyName) {return "notheme";},
            getPropertyExtraParamValue: function(propertyId, extraParamType) {return alpha;}
        };
        scope.wixData = {propertyName: "color1", styleData: styleProperties};
    }));

    describe('wixOpacitySelector -', function() {
        beforeEach(inject(function($compile) {
            var html = '<wix-opacity-selector wix-data="wixData"></wix-opacity-selector>';

            elm = $compile(html)(scope);

            scope.$digest();
        }));

        it("should make sure that a non 'pressed' non 'hover' mode changes the img of the button to normal", function() {
            var directiveScope = elm.isolateScope();

            directiveScope.updateState('normal');

            expect(directiveScope.bgPosition).toBe("0 0");
        });

        it("should initialize the non-theme color and the alpha value on the scope when opening the dialog", inject(function (colorDialog) {
            spyOn(colorDialog, 'openOpacityDialog');
            var directiveScope = elm.isolateScope();

            directiveScope.openDialog();

            expect(colorDialog.openOpacityDialog).toHaveBeenCalled();
            expect(directiveScope.color).toBe("#AABBCC");
            expect(directiveScope.initialAlpha).toBe(77);
            expect(directiveScope.opacityValue.value).toBe(77);
        }));

        it("should initialize the theme color on the scope when opening the dialog", inject(function (colorDialog, editorTheme) {
            spyOn(colorDialog, 'openOpacityDialog');
            var mockThemeColor = {getHex: function() {return "#ABCDEF";}};
            var directiveScope = elm.isolateScope();
            var counter = 0;

            spyOn(directiveScope.wixData.styleData, 'getPropertySource').and.returnValue("theme");
            spyOn(directiveScope.wixData.styleData, 'getProperty').and.returnValue("color_16");
            spyOn(editorTheme, 'getPreviewThemeProperty').and.callFake(function() {
                if(counter === 0) {
                    counter++;
                    return mockThemeColor;
                }
                return null;
            });

            directiveScope.openDialog();

            expect(colorDialog.openOpacityDialog).toHaveBeenCalled();
            expect(directiveScope.color).toBe("#ABCDEF");


            directiveScope.openDialog();

            expect(colorDialog.openOpacityDialog).toHaveBeenCalled();
            expect(directiveScope.color).toBe("");
        }));

        it("should make sure that the state of the 'hover' mode changes the img of the button correctly", function() {
            var directiveScope = elm.isolateScope();

            directiveScope.updateState('hover');

            expect(directiveScope.bgPosition).toBe("0 -25px");
        });

        it("should make sure that the state of the 'pressed' mode changes the img of the button correctly", function() {
            var directiveScope = elm.isolateScope();

            directiveScope.updateState('pressed');

            expect(directiveScope.bgPosition).toBe("0 -50px");
        });

        it("should set the alpha on closing the dialog if closing it by clicking OK", inject(function(dialogConsts) {
            var directiveScope = elm.isolateScope();
            spyOn(directiveScope, '_setAlphaToStyleData');
            var dialogResOK = {result: true, closeReason: ""};

            directiveScope.updateOnClose(dialogResOK);

            expect(directiveScope._setAlphaToStyleData).not.toHaveBeenCalled();
        }));

        it("should set the alpha on closing the dialog if closing it by clicking out of the dialog", inject(function(dialogConsts) {
            var directiveScope = elm.isolateScope();
            spyOn(directiveScope, '_setAlphaToStyleData');
            var dialogResOutOfDialog = {result: "false", closeReason: dialogConsts.CLOSING_REASON.BACKDROP_CLICKED};

            directiveScope.updateOnClose(dialogResOutOfDialog);

            expect(directiveScope._setAlphaToStyleData).not.toHaveBeenCalled();
        }));

        it("should revert the alpha on closing the dialog if closing it by clicking Cancel", inject(function(dialogConsts) {
            var directiveScope = elm.isolateScope();
            spyOn(directiveScope, '_setAlphaToStyleData');
            var dialogResCancel = {result: false, closeReason: ""};

            directiveScope.updateOnClose(dialogResCancel);

            expect(directiveScope._setAlphaToStyleData).toHaveBeenCalled();
        }));

        it("should revert the alpha on closing the dialog if closing it by clicking the 'X' of the dialog", inject(function(dialogConsts) {
            var directiveScope = elm.isolateScope();
            spyOn(directiveScope, '_setAlphaToStyleData');
            var dialogResDismiss = {result: false, closeReason: dialogConsts.CLOSING_REASON.DISMISS};

            directiveScope.updateOnClose(dialogResDismiss);

            expect(directiveScope._setAlphaToStyleData).toHaveBeenCalled();
        }));
    });
});