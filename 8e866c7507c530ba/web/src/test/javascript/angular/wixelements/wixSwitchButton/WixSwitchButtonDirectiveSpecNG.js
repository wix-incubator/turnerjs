describe('Unit: WixSwitchButtonDirective', function () {
    'use strict';
    var rootScope, scope, elm;

    beforeEach(module('wixElements'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
    }));

    describe('default behavior -', function () {

        beforeEach(inject(function ($compile) {
            scope.isChecked = false;
            scope.toggleFunc = jasmine.createSpy('someSpy');

            var html = '<wix-switch-button wix-data="isChecked" on-toggle="toggleFunc(state)"></wix-switch-button>';
            elm = $compile(html)(scope);
            scope.$digest();
        }));

        it('Should get the css class according to checked state from parent scope', function () {
            var innerElm = elm.find(".wix-switch-button");

            expect(innerElm.hasClass('disabled')).toBeTruthy();
            expect(innerElm.hasClass('enabled')).not.toBeTruthy();
        });

        it('Should update element class when scope checked state changes', function () {
            var innerElm = elm.find(".wix-switch-button");
            scope.isChecked = true;
            scope.$digest();

            expect(innerElm.hasClass('disabled')).not.toBeTruthy();
            expect(innerElm.hasClass('enabled')).toBeTruthy();
        });

        it('Should call the toggle handler when clicked with the correct state', function () {
            var innerElm = elm.find(".wix-switch-button");

            // switch from uncehcekd to checked
            innerElm.trigger('click');

            expect(scope.toggleFunc).toHaveBeenCalledWith(true);

            // switch from checked to unchecked
            innerElm.trigger('click');

            expect(scope.toggleFunc).toHaveBeenCalledWith(false);
        });

        it('Should change element css class when clicked', function () {
            var innerElm = elm.find(".wix-switch-button");

            // switch from uncehcekd to checked
            innerElm.trigger('click');

            expect(innerElm.hasClass('enabled')).toBeTruthy();
            expect(innerElm.hasClass('disabled')).toBeFalsy();

            // switch from checked to unchecked
            innerElm.trigger('click');

            expect(innerElm.hasClass('disabled')).toBeTruthy();
            expect(innerElm.hasClass('enabled')).toBeFalsy();
        });

        it('Should invert the parent scope wixData ref', function () {
            var innerElm = elm.find(".wix-switch-button");

            // switch from uncehcekd to checked
            innerElm.trigger('click');

            expect(scope.isChecked).toBeTruthy();

            // switch from checked to unchecked
            innerElm.trigger('click');

            expect(scope.isChecked).toBeFalsy();
        });


    });
});