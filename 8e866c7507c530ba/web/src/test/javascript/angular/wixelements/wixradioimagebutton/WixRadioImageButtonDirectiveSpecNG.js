describe('Unit: WixRadioImageButtonDirective', function () {
    'use strict';

    var rootScope, scope, elm;

    beforeEach(module('wixElements'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();

        scope.selectionModel = {};
        scope.buttonValue = "MyValueToPick";
        scope.imgStates = {
            checked: "red",
            unchecked: "blue",
            onHover: "yellow"
        };
    }));

    describe('WixRadioImageButtonDirective -', function() {
        beforeEach(inject(function($compile) {
            var html = '<wix-radio-image-button model="selectionModel" value="{{buttonValue}}" img-css-data="imgStates"></wix-radio-image-button>';

            elm = $compile(html)(scope);

            scope.$digest();
        }));

        it("should make sure that the directive compiled successfully.", function() {
            expect(elm).toBeDefined();

            var directiveScope = elm.isolateScope();
            expect(directiveScope).toBeDefined();
        });

        it("should set the style of the button to 'hover' when hovering on the button", function() {
            var directiveScope = elm.isolateScope();

            directiveScope.updateState("hover");

            expect(directiveScope.background).toBe("yellow");
        });

        it("should set the style of the button to 'normal' when button isnt selected or hovered", function() {
            var directiveScope = elm.isolateScope();

            directiveScope.updateState("normal");

            expect(directiveScope.background).toBe("blue");
        });

        it("should set the style of the button to 'checked' when button is selected", function() {
            var directiveScope = elm.isolateScope();
            rootScope.safeApply(function() {
                directiveScope.model = "MyValueToPick";
            });
            expect(directiveScope.model).toBe("MyValueToPick");
            expect(directiveScope.value).toBe("MyValueToPick");

            directiveScope.updateState("normal");

            expect(directiveScope.isChecked).toBeTruthy();
            expect(directiveScope.background).toBe("red");
        });
    });
});
