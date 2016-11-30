describe('Unit: InputValidators service', function () {
    'use strict';

    var inputValidators;

    beforeEach(module('utils'));

    beforeEach(inject(function (_inputValidators_, editorResources) {
        inputValidators = _inputValidators_;
        spyOn(editorResources, 'translate').and.returnValue('err');
    }));

    describe('_generalCharactersValidator', function () {
        it('should return undefined when the text does not contain invalid chars', function() {
            var invalidChars = 'abc';
            var text = "hello world";

            var res = inputValidators._generalCharactersValidator(text, invalidChars);

            expect(res).not.toBeDefined();
        });

        it('should return an error message with the first illegal char if the text contains invalid chars', function() {
            var invalidChars = 'abc';
            var text = "hello a world";

            var res = inputValidators._generalCharactersValidator(text, invalidChars);

            expect(res).toEqual(getErrMessageString('a'));
        });
    });

    describe('htmlCharactersValidator', function () {
        it('should return undefined when the text does not contain < or >', function() {
            var text = "hello world";

            var res = inputValidators.htmlCharactersValidator(text);

            expect(res).not.toBeDefined();
        });

        it('should return an error message with the first illegal char if the text contains invalid chars', function() {
            var text = "hello > world";

            var res = inputValidators.htmlCharactersValidator(text);

            expect(res).toEqual(getErrMessageString('>'));
        });

        it('should return undefined if the text param is falsy', function() {
            var res = inputValidators.htmlCharactersValidator();

            expect(res).not.toBeDefined();
        });
    });

    describe('alphanumericAndPeriodValidator', function () {
        it('should return undefined when the text does not contain non alphanumeric or period chars', function() {
            var text = "hello.world";

            var res = inputValidators.alphanumericAndPeriodValidator(text);

            expect(res).not.toBeDefined();
        });

        it('should return an error message with the first illegal char if the text contains non alphanumeric or period chars', function() {
            var text = "hello world";

            var res = inputValidators.alphanumericAndPeriodValidator(text);

            expect(res).toEqual(getErrMessageString(' '));
        });
    });

    function getErrMessageString(firstIllegalChar) {
        return 'err (' + firstIllegalChar + ')';
    }
});