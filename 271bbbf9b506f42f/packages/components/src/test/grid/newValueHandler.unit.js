define([
    'components/components/grid/wrappers/newValueHandler',
    'components/components/grid/core/enums',
    'components/components/grid/helpers/either'
], function (
    NewValueHandler,
    enums,
    Either
) {
    'use strict';
    var FieldType = enums.FieldType;
    /* eslint-disable new-cap */
    describe('Grid component newValueHandler module', function () {
        describe('FieldType.DATE validator', function (){
            beforeEach(function(){
                this.validator = NewValueHandler.validatorByFieldType[FieldType.DATE];
            });
            it('for invalid dates — returns an Either value with a null on the left', function () {
                var retunValue = this.validator("not a date");
                expect(retunValue).toEqual(Either.Left(null));

                retunValue = this.validator({not: 'a date'});
                expect(retunValue).toEqual(Either.Left(null));

                retunValue = this.validator(null);
                expect(retunValue).toEqual(Either.Left(null));
            });
            it('for valid dates — returns an Either value with the a Date object corresponding to the supplied data, on the right', function () {
                var now = new Date();
                var retunValue = this.validator(now);
                expect(retunValue).toEqual(Either.Right(now));

                retunValue = this.validator('11/11/11');
                expect(retunValue).toEqual(Either.Right(new Date('11/11/11')));
            });
        });
        describe('FieldType.NUMBER validator', function (){
            beforeEach(function(){
                this.validator = NewValueHandler.validatorByFieldType[FieldType.NUMBER];
            });
            it('for non-numbers — returns an Either value with a null on the left', function () {
                var retunValue = this.validator("not a number");
                expect(retunValue).toEqual(Either.Left(null));

                retunValue = this.validator({not: 'a number'});
                expect(retunValue).toEqual(Either.Left(null));
            });
            it('for valid numbers — returns an Either value with the number on the right', function () {
                var retunValue = this.validator(108);
                expect(retunValue).toEqual(Either.Right(108));

                retunValue = this.validator('-37');
                expect(retunValue).toEqual(Either.Right(-37));
            });
        });
        describe('NewValueHandler.getNextValue', function (){
            it('returns oldValue if newValue fails validation', function () {
                NewValueHandler.validatorByFieldType.MockType = function () { return Either.Left(null); };
                var retunValue = NewValueHandler.getNextValue('MockType', 'newValue', 'oldValue');
                expect(retunValue).toEqual('oldValue');
            });
            it('returns newValue if newValue passes validation', function () {
                NewValueHandler.validatorByFieldType.MockType = Either.Right;
                var retunValue = NewValueHandler.getNextValue('MockType', 'newValue', 'oldValue');
                expect(retunValue).toEqual('newValue');
            });
        });
    });
    /* eslint-enable new-cap */
});
