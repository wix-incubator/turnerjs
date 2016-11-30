describe('Unit: WixSelectDirective', function () {
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

        beforeEach(inject(function ($compile, editorResources) {
            spyOn(editorResources, 'translate').and.callFake(function (value) {
                return value + '-translated';
            });
            var mockOption1 = {
                label: 'option1',
                value: 'option1Value'
            };
            var mockOption2 = {
                label: 'option2',
                value: 'option2Value'
            };
            scope.mockOptions = [mockOption1, mockOption2];
            scope.selectedOption = mockOption2.value;

            var html = '<wix-select wix-data="selectedOption" options="mockOptions"></wix-select>';
            elm = $compile(html)(scope);
            scope.$digest();
        }));

        it('Should translate the options array', function () {
            var optionsArr = elm.find("option");
            var translatedOptions = ['option1-translated', 'option2-translated'];

            expect(optionsArr[0].innerHTML).toEqual(translatedOptions[0]);
            expect(optionsArr[1].innerHTML).toEqual(translatedOptions[1]);
            expect(optionsArr[1].selected).toBeTruthy();
        });
    });
});