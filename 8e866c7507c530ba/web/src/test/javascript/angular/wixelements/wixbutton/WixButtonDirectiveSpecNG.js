describe('Unit: WixButtonDirective', function () {
    'use strict';
    var rootScope, scope, elm;

    beforeEach(module('wixElements'));

    beforeEach(module(function ($provide) {
        $provide.factory('editorResources', TestsUtils.mocks.editorResources);
        $provide.factory('editorCommands', TestsUtils.mocks.editorCommands);
    }));

    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
    }));

    describe('default behavior -', function () {

        describe('When a command is defined', function () {
            beforeEach(inject(function ($compile, editorCommands) {
                spyOn(editorCommands, 'executeCommand');

                var html = '<wix-button command="someCommand"></wix-button>';
                elm = $compile(html)(scope);
                scope.$digest();
            }));

            it('Should execute the command on click', inject(function (editorCommands) {
                var innerElm = elm.find(".wix-button");

                innerElm.trigger('click');

                expect(editorCommands.executeCommand).toHaveBeenCalledWith('someCommand');
            }));
        });

        describe('When a click handler is defined', function () {
            beforeEach(inject(function ($compile) {
                scope.clickHandlerMock = jasmine.createSpy('clickHandlerMock');
                scope.someProp = 'some prop value';

                var html = '<wix-button click-handler="clickHandlerMock(someProp)"></wix-button>';
                elm = $compile(html)(scope);
                scope.$digest();
            }));

            it('Should execute the click handler in the parent scope', function () {
                var innerElm = elm.find(".wix-button");

                innerElm.trigger('click');

                expect(scope.clickHandlerMock).toHaveBeenCalledWith(scope.someProp);
            });
        });


    });
});