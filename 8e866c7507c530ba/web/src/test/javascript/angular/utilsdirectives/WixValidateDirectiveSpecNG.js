describe('Unit: wixValidate directive', function () {
    'use strict';

    var rootScope, scope, elm, form;

    beforeEach(module('utilsDirectives'));

    beforeEach(module(function($provide) {
        // overriding the custom exception handler so that it just
        // throws the error instead of intercepting it.
        $provide.factory('$exceptionHandler', function () {
            return function (exception) {
                throw exception;
            };
        });
    }));

    var DIRECTIVE_HTML = '<form name="form">' +
        '<input name="input" ng-model="model.value" wix-validate="validationType"/>' +
        '</form>';

    describe('Validation - ', function () {

        beforeEach(inject(function ($rootScope) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            scope.validationType = 'htmlCharactersValidator';
            scope.model = {
                value: 'original value'
            };
        }));

        it('Should set the new value if it passes validation, and sset the $valid state to true', inject(function ($compile) {
            elm = $compile(DIRECTIVE_HTML)(scope);
            form = scope.form;
            form.input.$setViewValue('original value');
            scope.$digest();

            form.input.$setViewValue('new valid value');
            scope.$digest();

            expect(scope.model.value).toEqual('new valid value');
            expect(form.input.$valid).toBe(true);
        }));

        it('Should return the old value if it fails validation and set the $valid state to false', inject(function ($compile) {
            elm = $compile(DIRECTIVE_HTML)(scope);
            form = scope.form;
            form.input.$setViewValue('original value');
            scope.$digest();

            form.input.$setViewValue('new <invalid> value');
            scope.$digest();

            expect(scope.model.value).toEqual('original value');
            expect(form.input.$valid).toBe(false);
        }));

        it('should throw an exception if the validationType is invalid', inject(function($compile) {
            scope.validationType = 'invalidValidationType';
            scope.$digest();

            function errorFunctionWrapper() {
                elm = $compile(DIRECTIVE_HTML)(scope);
            }

            expect(errorFunctionWrapper).toThrow();
        }));
    });

});